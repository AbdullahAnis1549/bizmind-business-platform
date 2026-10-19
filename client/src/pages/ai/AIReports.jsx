import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  Sparkles,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { aiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Skeleton } from '../../components/common/Skeleton';

export const AIReports = () => {
  const { business } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [reportType, setReportType] = useState('Monthly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [cachedReports, setCachedReports] = useState({});

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

  const fetchReport = async (typeToFetch, forceRefresh = false) => {
    const targetType = typeToFetch || reportType;

    // Instant switch if already cached and not forcing refresh
    if (!forceRefresh && cachedReports[targetType]) {
      setReport(cachedReports[targetType]);
      return;
    }

    try {
      if (forceRefresh) setRegenerating(true);
      else setLoading(true);

      const res = await aiService.generateReport(targetType);
      if (res.success) {
        setReport(res.report);
        setCachedReports((prev) => ({ ...prev, [targetType]: res.report }));
      }
    } catch (err) {
      toastError(err.message || 'Failed to generate executive report.');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchReport(reportType, false);
  }, []);

  const handleTypeChange = (newType) => {
    setReportType(newType);
    fetchReport(newType, false);
  };

  const handleRegenerate = () => {
    fetchReport(reportType, true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!report) return;
    const text = `# ${report.title}
Generated: ${report.generatedAt}
Business: ${report.businessName} (${report.currency})

Summary Metrics:
- Total Revenue: $${report.summary.totalRevenue}
- Total Orders: ${report.summary.totalOrders}
- Avg Order Value: $${report.summary.avgOrderValue}
- Active Customers: ${report.summary.totalCustomers}
- Catalog Items: ${report.summary.totalProducts} (${report.summary.lowStockCount} low stock)

${report.sections.map((s) => `\n## ${s.heading}\n${s.content}`).join('\n')}
    `;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toastSuccess('Report text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive AI Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated executive intelligence audits and strategic recommendations.
          </p>
        </div>

        {/* Report Type Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs">
            {['Weekly', 'Monthly', 'Quarterly'].map((t) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  reportType === t
                    ? 'bg-brand-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading || regenerating}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition disabled:opacity-50"
            title="Force regenerate fresh AI analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin text-brand-600' : 'text-slate-500'}`} />
            <span>{regenerating ? 'Regenerating...' : 'Regenerate AI'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Text</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Rule-based Mode Banner (Only show once aiStatus is loaded AND confirmed in rule_based mode) */}
      {aiStatus && (!aiStatus.hasApiKey || aiStatus.mode === 'rule_based') && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold no-print">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Rule-based mode: add an AI key to enable the AI assistant</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-10 space-y-8 max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
            <div className="space-y-1.5 text-right">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-3.5 w-36 rounded-md" />
            </div>
          </div>

          {/* Quick Metrics Bar Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Report Sections Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="h-5 w-60 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ) : report ? (
        <div className="printable-area bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sm:p-10 space-y-8 max-w-4xl mx-auto content-fade-in">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" /> AI Executive Intelligence
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {report.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Generated {report.generatedAt} • Workspace: {report.businessName}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Audit Classification</p>
              <p>{reportType} Comprehensive Review</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">{reportType} Revenue</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base font-extrabold text-slate-900">
                  {report.currency || '$'} {report.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                {report.summary.revenueGrowth !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    report.summary.revenueGrowth >= 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {report.summary.revenueGrowth >= 0 ? '+' : ''}{report.summary.revenueGrowth}%
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">{reportType} Orders</span>
              <span className="text-base font-extrabold text-slate-900">
                {report.summary.totalOrders}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Average Basket (AOV)</span>
              <span className="text-base font-extrabold text-slate-900">
                {report.currency || '$'} {report.summary.avgOrderValue.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Customer Accounts</span>
              <span className="text-base font-extrabold text-slate-900">
                {report.summary.totalCustomers}
              </span>
            </div>
          </div>

          {/* Report Sections */}
          <div className="space-y-6">
            {report.sections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-brand-600 shrink-0" />
                  {section.heading}
                </h3>
                <div className="text-sm text-slate-700 leading-relaxed pl-3.5 whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Signoff Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>Prepared by BizMind AI Intelligence Engine</span>
            <span>Confidential Executive Audit</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AIReports;
