import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  Send,
  Package,
  Layers,
  Share2,
  FileText,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { aiService, productService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AIContentGenerator = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customName, setCustomName] = useState('');
  const [contentType, setContentType] = useState('Product Description');
  const [tone, setTone] = useState('Professional');
  const [platform, setPlatform] = useState('Website / Storefront');
  const [notes, setNotes] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await aiService.getStatus();
        if (res.success) setAiStatus(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productService.getProducts({ limit: 50 });
        if (res.success && res.products.length > 0) {
          setProducts(res.products);
          setSelectedProduct(res.products[0].name);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProducts();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();

    const productName = customName.trim() || selectedProduct;
    if (!productName) {
      toastError('Please specify a product name.');
      return;
    }

    try {
      setLoading(true);
      const res = await aiService.generateContent({
        type: contentType,
        productName,
        tone,
        platform,
        notes,
      });

      if (res.success) {
        setGeneratedContent(res.content);
        toastSuccess('Marketing content generated successfully!');
      }
    } catch (err) {
      toastError(err.message || 'Failed to generate content.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toastSuccess('Content copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Marketing & Copy Generator
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate persuasive product copy, promotional emails, and social campaigns in seconds.
        </p>
      </div>

      {/* Rule-based Mode Banner (Only show once aiStatus is loaded AND confirmed in rule_based mode) */}
      {aiStatus && (!aiStatus.hasApiKey || aiStatus.mode === 'rule_based') && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Rule-based mode: add an AI key to enable the AI assistant</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Controls Form - 5 Cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">Campaign Generator</h3>
              <p className="text-xs text-slate-400">Configure your target audience and copy tone</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Catalog Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Choose Product from Catalog
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setCustomName('');
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
              >
                <option value="">— Or enter custom item below —</option>
                {products.map((p) => (
                  <option key={p._id} value={p.name}>
                    {p.name} (${p.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Name Override */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Product / Offer Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  if (e.target.value) setSelectedProduct('');
                }}
                placeholder="e.g. Ergonomic White Oak Lounge Chair"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Copy Format / Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
              >
                <option value="Product Description">Product Description (E-commerce)</option>
                <option value="Promotional Message">Promotional Discount Announcement</option>
                <option value="Social Media Caption">Social Media Caption (Instagram/TikTok)</option>
                <option value="Email Marketing Pitch">Email Marketing Newsletter Pitch</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tone of Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Professional & Elegant">Professional & Elegant</option>
                  <option value="Warm & Friendly">Warm & Friendly</option>
                  <option value="Bold & Disruptive">Bold & Disruptive</option>
                  <option value="Luxury & Exclusive">Luxury & Exclusive</option>
                  <option value="Urgent / Limited-Time">Urgent / Limited-Time</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Channel</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Website / Storefront">Website / Storefront</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Email Newsletter">Email Newsletter</option>
                  <option value="SMS / Direct Push">SMS / Direct Push</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unique Features or Discount Details
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 20% off spring sale, Italian boucle fabric, ships free..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm shadow-brand-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Copy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Campaign Copy</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Panel - 7 Cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <h3 className="font-heading font-bold text-sm text-slate-900">Generated Creative Content</h3>
              </div>
              {generatedContent && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-medium text-slate-400">Crafting targeted copy tailored for {platform}...</p>
              </div>
            ) : generatedContent ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                {generatedContent}
              </div>
            ) : (
              <div className="py-28 text-center text-slate-400 text-sm">
                Fill in the details on the left and click <strong>Generate Campaign Copy</strong> to create high-converting marketing content.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Powered by BizMind Content Engine</span>
            <span>Ready for instant deployment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentGenerator;
