import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Business from '../models/Business.js';
import Invoice from '../models/Invoice.js';

// Single source of truth for the default Gemini model name.
// Used when AI_MODEL env var is not set.
const DEFAULT_AI_MODEL = 'gemini-2.5-flash';

/**
 * Gathers sanitized, aggregated business data strictly for the requested businessId.
 */
export const gatherBusinessContext = async (businessId) => {
  const bId = new mongoose.Types.ObjectId(businessId);
  const business = await Business.findById(bId);

  // Revenue & Orders
  const revenueAgg = await Order.aggregate([
    { $match: { businessId: bId, status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        paidRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$total', 0] } },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$total' },
      },
    },
  ]);

  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
  const paidRevenue = revenueAgg[0]?.paidRevenue || 0;
  const totalOrders = revenueAgg[0]?.totalOrders || 0;
  const avgOrderValue = revenueAgg[0]?.avgOrderValue || 0;

  // Monthly Revenue (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyRev = await Order.aggregate([
    {
      $match: {
        businessId: bId,
        status: { $ne: 'Cancelled' },
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthly = monthlyRev.map(m => ({
    period: `${monthNames[m._id.month - 1]} ${m._id.year}`,
    revenue: Number(m.revenue.toFixed(2)),
    orders: m.orders,
  }));

  // Best-selling products
  const topProducts = await Order.aggregate([
    { $match: { businessId: bId, status: { $ne: 'Cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        name: { $first: '$items.name' },
        sku: { $first: '$items.sku' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.total' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  // Inventory Health
  const totalProducts = await Product.countDocuments({ businessId: bId });
  const lowStockProducts = await Product.find({
    businessId: bId,
    $or: [{ status: 'low_stock' }, { status: 'out_of_stock' }],
  }).select('name sku stock lowStockThreshold status price');

  const inventoryValuation = await Product.aggregate([
    { $match: { businessId: bId } },
    {
      $group: {
        _id: null,
        retailValue: { $sum: { $multiply: ['$price', '$stock'] } },
        totalStock: { $sum: '$stock' },
      },
    },
  ]);

  // Top Customers
  const totalCustomers = await Customer.countDocuments({ businessId: bId });
  const topCustomers = await Customer.find({ businessId: bId })
    .sort('-totalSpent')
    .limit(5)
    .select('name company totalSpent ordersCount');

  // Pending Invoices
  const pendingInvoices = await Invoice.countDocuments({
    businessId: bId,
    paymentStatus: { $in: ['Unpaid', 'Partial'] },
  });

  return {
    businessName: business?.name || 'My Business',
    currency: business?.currency || 'USD',
    industry: business?.industry || 'Commerce',
    totalRevenue: Number(totalRevenue.toFixed(2)),
    paidRevenue: Number(paidRevenue.toFixed(2)),
    totalOrders,
    avgOrderValue: Number(avgOrderValue.toFixed(2)),
    monthlyRevenue: formattedMonthly,
    topProducts,
    totalProducts,
    lowStockCount: lowStockProducts.length,
    lowStockItems: lowStockProducts.map(p => ({
      name: p.name,
      stock: p.stock,
      threshold: p.lowStockThreshold,
    })),
    totalCustomers,
    topCustomers: topCustomers.map(c => ({
      name: c.name,
      company: c.company,
      totalSpent: c.totalSpent,
      ordersCount: c.ordersCount,
    })),
    pendingInvoices,
    inventoryRetailValue: Number((inventoryValuation[0]?.retailValue || 0).toFixed(2)),
  };
};

// Abort slow provider calls so requests never hang (surfaces as the existing 502 error)
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 20000;

/**
 * Calls Gemini API if AI_API_KEY is configured
 */
const callGeminiAPI = async (prompt, systemInstruction, apiKey) => {
  const model = process.env.AI_MODEL || DEFAULT_AI_MODEL;
  console.log(`[AI Service] Using Gemini model: ${model}`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nTask:\n${prompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }

  return text;
};

/**
 * Calls OpenAI API if configured
 */
const callOpenAIAPI = async (prompt, systemInstruction, apiKey) => {
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const url = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || 'No response generated.';
};

/**
 * Intelligent deterministic business intelligence engine when no API key is provided
 * Formulates structured, insightful, data-driven answers grounded purely in real numbers.
 */
const runBuiltinIntelligenceEngine = (question, context) => {
  const q = question.toLowerCase();
  const cur = context.currency;

  if (q.includes('sale') || q.includes('revenue') || q.includes('how much') || q.includes('earn')) {
    const currentMonth = context.monthlyRevenue[context.monthlyRevenue.length - 1];
    const prevMonth = context.monthlyRevenue[context.monthlyRevenue.length - 2];
    let comparison = '';
    if (currentMonth && prevMonth) {
      const diff = (((currentMonth.revenue - prevMonth.revenue) / (prevMonth.revenue || 1)) * 100).toFixed(1);
      comparison = `This represents a ${diff >= 0 ? '+' : ''}${diff}% difference compared to ${prevMonth.period} (${cur} ${prevMonth.revenue.toLocaleString()}).`;
    }

    return `### Revenue & Sales Summary
* **Total All-Time Revenue:** ${cur} ${context.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
* **Paid Collected Revenue:** ${cur} ${context.paidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
* **Total Completed Orders:** ${context.totalOrders}
* **Average Order Value (AOV):** ${cur} ${context.avgOrderValue.toFixed(2)}
${currentMonth ? `* **Latest Period (${currentMonth.period}):** ${cur} ${currentMonth.revenue.toLocaleString()} (${currentMonth.orders} orders).` : ''}

${comparison}
**Operational Advice:** Maintaining your Average Order Value above ${cur} ${(context.avgOrderValue * 1.1).toFixed(0)} through complementary product bundles will significantly accelerate overall gross margins.`;
  }

  if (q.includes('best') || q.includes('top product') || q.includes('performing') || q.includes('selling')) {
    if (!context.topProducts || context.topProducts.length === 0) {
      return `### Product Performance\nNo product sales data has been recorded yet. Once orders are placed, BizMind AI will rank your top revenue generators here.`;
    }

    const items = context.topProducts
      .map((p, idx) => `${idx + 1}. **${p.name}** (SKU: \`${p.sku || 'N/A'}\`): ${p.unitsSold} units sold — **${cur} ${p.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}** in sales`)
      .join('\n');

    return `### Top Performing Products
Based on historical sales in your workspace:

${items}

**Strategic Insight:** Your leading item alone drives a substantial share of volume. Consider featuring it in promotional campaigns, while cross-selling complementary products to boost multi-item basket sizes.`;
  }

  if (q.includes('low') || q.includes('stock') || q.includes('inventory') || q.includes('reorder')) {
    if (context.lowStockCount === 0) {
      return `### Inventory Health
All **${context.totalProducts} products** in your catalog are currently adequately stocked above their reorder thresholds. Total inventory retail value is currently **${cur} ${context.inventoryRetailValue.toLocaleString()}**. No urgent replenishment is required at this time.`;
    }

    const items = context.lowStockItems
      .map(p => `* **${p.name}**: ${p.stock} units remaining (Threshold: ${p.threshold})`)
      .join('\n');

    return `### Low Stock Alert
There are currently **${context.lowStockCount} product(s)** below or at their reorder threshold:

${items}

**Recommendation:** Initiate supplier purchase orders immediately for these items to avoid stockouts and lost sales revenue.`;
  }

  if (q.includes('customer') || q.includes('who') || q.includes('client')) {
    if (!context.topCustomers || context.topCustomers.length === 0) {
      return `### Customer Intelligence\nYou have **${context.totalCustomers} registered customer(s)** in your CRM. Create orders to unlock lifetime value and customer ranking intelligence.`;
    }

    const items = context.topCustomers
      .map((c, i) => `${i + 1}. **${c.name}** ${c.company ? `(${c.company})` : ''}: ${cur} ${c.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })} across ${c.ordersCount} orders`)
      .join('\n');

    return `### Top Customers by Lifetime Spend
Your workspace tracks **${context.totalCustomers} total customers**. Your top contributors are:

${items}

**Client Retention Strategy:** Offer a VIP incentive or personalized follow-up to your top 5 clients, as repeat enterprise accounts typically yield 3x higher retention than standard cohorts.`;
  }

  if (q.includes('improve') || q.includes('focus') || q.includes('why') || q.includes('summary') || q.includes('recommend')) {
    return `### Business Performance & Strategic Focus
Here is an executive diagnostic for **${context.businessName}**:

1. **Revenue Engine:** You have processed **${context.totalOrders} orders** totaling **${cur} ${context.totalRevenue.toLocaleString()}** (AOV of ${cur} ${context.avgOrderValue.toFixed(2)}).
2. **Cash Flow & Receivables:** There are **${context.pendingInvoices} pending invoices**. Accelerating collection cycles will immediately improve operating liquidity.
3. **Inventory Exposure:** **${context.lowStockCount} items** require immediate restocking.
4. **Primary Growth Lever:** Increase order frequency among your **${context.totalCustomers} customers** by setting up automated reorder reminders for consumable and high-turnover goods.`;
  }

  // General fallback
  return `### Business Overview for ${context.businessName}
* **Gross Revenue:** ${cur} ${context.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
* **Orders Processed:** ${context.totalOrders}
* **Active Customer Base:** ${context.totalCustomers}
* **Product Catalog:** ${context.totalProducts} items (${context.lowStockCount} low in stock)
* **Pending Invoices:** ${context.pendingInvoices}

Feel free to ask specific questions about sales trends, inventory reorders, top customers, or product optimization!`;
};

/**
 * Main AI Query Router
 */
export const queryAIAssistant = async (businessId, userPrompt) => {
  const context = await gatherBusinessContext(businessId);
  const apiKey = process.env.AI_API_KEY;

  const systemInstruction = `You are BizMind AI, an elite Business Intelligence Copilot and SaaS Management Advisor.
Analyze the following authentic business context for ${context.businessName}:
- Currency: ${context.currency}
- Total Revenue: ${context.currency} ${context.totalRevenue}
- Paid Revenue: ${context.currency} ${context.paidRevenue}
- Total Orders: ${context.totalOrders}
- Average Order Value: ${context.currency} ${context.avgOrderValue}
- Monthly Revenue: ${JSON.stringify(context.monthlyRevenue)}
- Top Products: ${JSON.stringify(context.topProducts)}
- Low Stock Items (${context.lowStockCount} items): ${JSON.stringify(context.lowStockItems)}
- Top Customers: ${JSON.stringify(context.topCustomers)}
- Pending Invoices: ${context.pendingInvoices}
- Total Inventory Value: ${context.currency} ${context.inventoryRetailValue}

CRITICAL RULES:
1. Always use the authentic figures provided above. NEVER invent or hallucinate financial numbers.
2. Provide concise, professional, actionable business guidance with clean markdown formatting.
3. Highlight risks (e.g. low stock, pending invoices) and opportunities (e.g. promoting high-margin products).
4. Formatting rules: Use bold for key numbers, clean bullet points (*), and neat section headers (###). Avoid raw horizontal dashes or stray backticks.`;

  if (apiKey && apiKey.trim().length > 5) {
    try {
      if (apiKey.startsWith('sk-')) {
        const text = await callOpenAIAPI(userPrompt, systemInstruction, apiKey);
        return {
          answer: text,
          mode: 'ai_connected',
          provider: 'OpenAI',
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          hasApiKey: true,
        };
      } else {
        const text = await callGeminiAPI(userPrompt, systemInstruction, apiKey);
        return {
          answer: text,
          mode: 'ai_connected',
          provider: 'Google Gemini',
          model: process.env.AI_MODEL || DEFAULT_AI_MODEL,
          hasApiKey: true,
        };
      }
    } catch (err) {
      console.error('[AI Service Error] External AI API call failed:', err.message);
      const error = new Error('AI service is temporarily unavailable. Please verify your AI API key and connection or try again later.');
      error.statusCode = 502;
      throw error;
    }
  }

  // When no API key is configured (Rule-based mode)
  const answer = runBuiltinIntelligenceEngine(userPrompt, context);
  return {
    answer,
    mode: 'rule_based',
    provider: 'Rule-based engine',
    model: 'Deterministic rule-based calculations',
    hasApiKey: false,
    note: 'Running in rule-based mode. Financial metrics are computed directly from MongoDB. Add AI_API_KEY in server/.env to enable the AI assistant.',
  };
};

/**
 * Generate structured business insights
 */
export const generateBusinessInsights = async (businessId) => {
  const context = await gatherBusinessContext(businessId);
  const cur = context.currency;

  if (context.totalOrders === 0 && context.totalProducts === 0) {
    return {
      hasData: false,
      message: 'Not enough business data is available to generate this insight.',
      salesInsight: 'Not enough business data is available to generate this insight.',
      inventoryInsight: 'Not enough business data is available to generate this insight.',
      customerInsight: 'Not enough business data is available to generate this insight.',
      recommendation: 'Start by adding your products and recording initial customer sales.',
    };
  }

  // 1. Sales Insight
  let salesInsight = 'Not enough business data is available to generate this insight.';
  if (context.monthlyRevenue.length >= 2) {
    const curMonth = context.monthlyRevenue[context.monthlyRevenue.length - 1];
    const prevMonth = context.monthlyRevenue[context.monthlyRevenue.length - 2];
    const diff = prevMonth.revenue > 0 ? (((curMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1) : 0;
    salesInsight = Number(diff) >= 0
      ? `Revenue increased ${diff}% compared with the previous period (${curMonth.period} vs ${prevMonth.period}).`
      : `Revenue experienced a ${Math.abs(diff)}% dip compared with the previous period.`;
  } else if (context.totalRevenue > 0) {
    salesInsight = `Total revenue reached ${cur} ${context.totalRevenue.toLocaleString()} across ${context.totalOrders} order(s) with an Average Order Value of ${cur} ${context.avgOrderValue.toFixed(2)}.`;
  }

  // 2. Inventory Insight
  let inventoryInsight = 'Not enough business data is available to generate this insight.';
  if (context.totalProducts > 0) {
    if (context.lowStockCount > 0) {
      inventoryInsight = `${context.lowStockCount} product(s) are approaching their low-stock threshold or are out of stock. Total inventory retail value is ${cur} ${context.inventoryRetailValue.toLocaleString()}.`;
    } else {
      inventoryInsight = `All ${context.totalProducts} products are sufficiently stocked. Healthy inventory valuation sits at ${cur} ${context.inventoryRetailValue.toLocaleString()}.`;
    }
  }

  // 3. Customer Insight
  let customerInsight = 'Not enough business data is available to generate this insight.';
  if (context.totalCustomers > 0 && context.topCustomers.length > 0 && context.totalRevenue > 0) {
    const topSpendSum = context.topCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
    const concentration = ((topSpendSum / context.totalRevenue) * 100).toFixed(1);
    customerInsight = `Your top ${context.topCustomers.length} customers represent ${concentration}% of your total revenue (${cur} ${topSpendSum.toLocaleString()}).`;
  } else if (context.totalCustomers > 0) {
    customerInsight = `You have ${context.totalCustomers} registered customer profile(s) ready for targeted sales engagement.`;
  }

  // 4. Recommendation
  let recommendation = 'Not enough business data is available to generate this insight.';
  if (context.topProducts.length > 0) {
    const best = context.topProducts[0];
    recommendation = `Promote "${best.name}" through email or bundles. It represents your top revenue driver with ${best.unitsSold} units sold (${cur} ${best.revenue.toLocaleString()}).`;
  } else if (context.lowStockCount > 0) {
    recommendation = 'Prioritize reordering low-stock catalog items to protect current sales velocity.';
  } else if (context.pendingInvoices > 0) {
    recommendation = `Follow up on ${context.pendingInvoices} unpaid invoice(s) to optimize workspace cash conversion.`;
  } else {
    recommendation = 'Focus on acquiring new customers through targeted promotions and bundle offerings.';
  }

  return {
    hasData: true,
    salesInsight,
    inventoryInsight,
    customerInsight,
    recommendation,
  };
};

/**
 * Generate Comprehensive Executive Report
 */
export const generateExecutiveReport = async (businessId, reportType = 'Monthly') => {
  const context = await gatherBusinessContext(businessId);
  const cur = context.currency;

  const title = `${reportType} Business Performance Audit — ${context.businessName}`;
  const generatedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const bestProduct = context.topProducts[0] ? `${context.topProducts[0].name} (${cur} ${context.topProducts[0].revenue.toLocaleString()})` : 'None recorded';

  const report = {
    title,
    generatedAt,
    reportType,
    businessName: context.businessName,
    currency: cur,
    summary: {
      totalRevenue: context.totalRevenue,
      paidRevenue: context.paidRevenue,
      totalOrders: context.totalOrders,
      avgOrderValue: context.avgOrderValue,
      totalCustomers: context.totalCustomers,
      totalProducts: context.totalProducts,
      lowStockCount: context.lowStockCount,
      pendingInvoices: context.pendingInvoices,
    },
    sections: [
      {
        heading: '1. Executive Overview',
        content: `During this evaluation cycle, ${context.businessName} generated ${cur} ${context.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} across ${context.totalOrders} total transactions. Average Order Value stands at ${cur} ${context.avgOrderValue.toFixed(2)}, with a paid collection rate of ${context.totalRevenue > 0 ? ((context.paidRevenue / context.totalRevenue) * 100).toFixed(1) : 0}%.`,
      },
      {
        heading: '2. Sales & Product Velocity',
        content: `Top performing merchandise is led by ${bestProduct}. The product catalog consists of ${context.totalProducts} active items with a combined retail value of ${cur} ${context.inventoryRetailValue.toLocaleString()}.`,
      },
      {
        heading: '3. Customer Base & Retention',
        content: `Workspace CRM actively tracks ${context.totalCustomers} registered accounts. The top 5 customer accounts have generated ${cur} ${context.topCustomers.reduce((a, b) => a + b.totalSpent, 0).toLocaleString()} in total spend, underscoring strong repeat account value.`,
      },
      {
        heading: '4. Inventory Risk Assessment',
        content: context.lowStockCount > 0
          ? `WARNING: ${context.lowStockCount} catalog items are at or below safety stock limits. Immediate supplier purchase orders are advised.`
          : 'Catalog inventory levels are well within safety buffers across all product categories.',
      },
      {
        heading: '5. Key Observations & Action Plan',
        content: `• Accelerate receivables collection on ${context.pendingInvoices} unpaid invoices.\n• Create targeted cross-sell campaigns leveraging top seller "${context.topProducts[0]?.name || 'primary line'}".\n• Maintain stock vigilance on high-demand inventory items.`,
      },
    ],
  };

  return report;
};

/**
 * AI Content Generator for marketing copy
 */
export const generateMarketingContent = async (type, productName, tone, platform, notes) => {
  const prompt = `Write a ${type} for a product named "${productName}".
Tone: ${tone || 'Professional'}
Platform: ${platform || 'General / Website'}
Additional notes/details: ${notes || 'None'}

Formatting:
Provide catchy headline options, main copy body, and 3-5 relevant hashtags or call-to-actions.`;

  const apiKey = process.env.AI_API_KEY;
  if (apiKey && apiKey.trim().length > 5) {
    try {
      if (apiKey.startsWith('sk-')) {
        const text = await callOpenAIAPI(prompt, 'You are an award-winning SaaS copywriter and brand marketing strategist.', apiKey);
        return {
          content: text,
          mode: 'ai_connected',
        };
      } else {
        const text = await callGeminiAPI(prompt, 'You are an award-winning SaaS copywriter and brand marketing strategist.', apiKey);
        return {
          content: text,
          mode: 'ai_connected',
        };
      }
    } catch (e) {
      console.error('[AI Content Generator Error] LLM generation failed:', e.message);
      const error = new Error('AI content generation is temporarily unavailable. Please verify your AI API key or try again later.');
      error.statusCode = 502;
      throw error;
    }
  }

  // High quality built-in rule-based generation template
  return {
    content: `### ${type} for ${productName}
**Target Platform:** ${platform} | **Tone:** ${tone}

#### Headline:
"Elevate Your Daily Routine with ${productName}"

#### Copy:
Discover uncompromised quality and thoughtful craftsmanship with the all-new **${productName}**. Engineered for those who refuse to compromise on design, utility, or performance.

Whether you're upgrading your workspace or looking for the ideal solution to streamline your day, ${productName} delivers seamless convenience and standout reliability. ${notes ? `Featuring: ${notes}.` : ''}

#### Call to Action:
👉 **Order yours today and experience the difference.**

#${productName.replace(/\s+/g, '')} #Innovation #QualityDesign #${platform.replace(/\s+/g, '')}Choice`,
    mode: 'rule_based',
  };
};
