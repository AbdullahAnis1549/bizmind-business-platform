import {
  queryAIAssistant,
  generateBusinessInsights,
  generateExecutiveReport,
  generateMarketingContent,
} from '../services/aiService.js';

// @desc Ask question to AI Business Assistant
// @route POST /api/ai/chat
export const chatWithAssistant = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A question is required for the AI Assistant.',
      });
    }

    if (question.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Question is too long (maximum 1000 characters).',
      });
    }

    const result = await queryAIAssistant(req.businessId, question.trim());

    res.json({
      success: true,
      answer: result.answer,
      mode: result.mode,
      provider: result.provider,
      model: result.model,
      hasApiKey: result.hasApiKey,
      note: result.note,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc Get business insights
// @route GET /api/ai/insights
export const getInsights = async (req, res, next) => {
  try {
    const insights = await generateBusinessInsights(req.businessId);
    const hasApiKey = Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim().length > 5);
    res.json({
      success: true,
      insights,
      mode: hasApiKey ? 'ai_connected' : 'rule_based',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Generate executive report
// @route POST /api/ai/report
export const generateReport = async (req, res, next) => {
  try {
    const { reportType = 'Monthly' } = req.body;
    const report = await generateExecutiveReport(req.businessId, reportType);
    const hasApiKey = Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim().length > 5);
    const mode = hasApiKey ? 'ai_connected' : 'rule_based';
    if (report && typeof report === 'object') {
      report.mode = mode;
    }

    res.json({
      success: true,
      report,
      mode,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc Generate marketing content
// @route POST /api/ai/content
export const generateContent = async (req, res, next) => {
  try {
    const { type = 'Product Description', productName, tone, platform, notes } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required for content generation.',
      });
    }

    if (
      String(productName).length > 200 ||
      (notes && String(notes).length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Product name (max 200) or notes (max 1000 characters) are too long.',
      });
    }

    const result = await generateMarketingContent(type, productName, tone, platform, notes);

    res.json({
      success: true,
      content: result.content,
      mode: result.mode,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Default Gemini model — must match DEFAULT_AI_MODEL in aiService.js
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

// @desc Get AI Engine Status
// @route GET /api/ai/status
export const getAIStatus = async (req, res, next) => {
  try {
    const hasApiKey = Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim().length > 5);
    const mode = hasApiKey ? 'ai_connected' : 'rule_based';
    const modeLabel = hasApiKey ? 'AI connected' : 'Rule-based mode';
    const defaultModel = process.env.AI_API_KEY && process.env.AI_API_KEY.startsWith('sk-') ? 'gpt-4o-mini' : DEFAULT_GEMINI_MODEL;
    const model = hasApiKey ? (process.env.AI_MODEL || defaultModel) : 'Rule-based engine (no model)';
    const provider = hasApiKey
      ? process.env.AI_API_KEY.startsWith('sk-')
        ? 'OpenAI'
        : 'Google Gemini'
      : 'Rule-based engine';

    res.json({
      success: true,
      status: 'operational',
      mode,
      modeLabel,
      hasApiKey,
      provider,
      model,
      description: hasApiKey
        ? `Connected to ${provider} (${model}) with MongoDB contextual grounding.`
        : 'Running in rule-based mode. Financial metrics are computed directly from MongoDB calculations. Add an AI API key to enable AI assistant inference.',
    });
  } catch (error) {
    next(error);
  }
};
