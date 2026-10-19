import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and clean numbers
 */
const renderInlineFormatting = (text) => {
  if (!text) return null;

  // Split by bold (**...**), inline code (`...`), and italic (*...*)
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  const tokens = text.split(regex);

  return tokens.map((token, i) => {
    if (!token) return null;

    // Bold: **text**
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      const content = token.slice(2, -2).trim();
      if (!content) return null;
      return (
        <strong key={i} className="font-bold text-slate-900">
          {content}
        </strong>
      );
    }

    // Code: `text` (ignore empty backticks)
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      const content = token.slice(1, -1).trim();
      if (!content) return null;
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-brand-50 text-brand-700 font-mono text-xs font-semibold border border-brand-200/60"
        >
          {content}
        </code>
      );
    }

    // Italic: *text*
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2 && !token.startsWith('**')) {
      const content = token.slice(1, -1).trim();
      if (!content) return null;
      return (
        <em key={i} className="italic text-slate-700">
          {content}
        </em>
      );
    }

    return token;
  });
};

export const FormattedAIMessage = ({ content, isUser = false }) => {
  if (!content) return null;

  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // Pre-process: remove stray backtick pairs like `` or ```
  const cleanedContent = content.replace(/``+/g, '');

  const lines = cleanedContent.split('\n');
  const elements = [];
  let currentList = [];
  let listType = null; // 'ol' or 'ul'

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2.5 space-y-2">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.number}
                </span>
                <div className="flex-1 text-slate-800 leading-relaxed text-sm">
                  {renderInlineFormatting(item.text)}
                </div>
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 pl-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-2" />
                <div className="flex-1 text-slate-800 leading-relaxed text-sm">
                  {renderInlineFormatting(item.text)}
                </div>
              </li>
            ))}
          </ul>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines
    if (!trimmed) {
      flushList();
      continue;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-3 border-t border-slate-200/70" />);
      continue;
    }

    // Headers (#, ##, ###, ####, #####)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length;
      const headerText = headerMatch[2].trim();

      if (level <= 2) {
        elements.push(
          <div key={`h-${i}`} className="mt-4 mb-2 pb-1 border-b border-slate-200 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
            <h3 className="font-heading font-extrabold text-base text-slate-900 tracking-tight">
              {renderInlineFormatting(headerText)}
            </h3>
          </div>
        );
      } else if (level === 3) {
        elements.push(
          <div key={`h-${i}`} className="mt-3 mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <h4 className="font-heading font-bold text-sm text-slate-900 tracking-tight">
              {renderInlineFormatting(headerText)}
            </h4>
          </div>
        );
      } else {
        // level 4 or higher (####)
        elements.push(
          <div key={`h-${i}`} className="mt-2.5 mb-1">
            <h5 className="font-heading font-semibold text-xs uppercase tracking-wider text-brand-700">
              {renderInlineFormatting(headerText)}
            </h5>
          </div>
        );
      }
      continue;
    }

    // Numbered List (e.g., "1. text" or "1) text")
    const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numberedMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      currentList.push({ number: numberedMatch[1], text: numberedMatch[2] });
      continue;
    }

    // Bullet List (e.g., "* text", "- text", "• text", "+ text")
    const bulletMatch = trimmed.match(/^[\*\-•\+]\s+(.*)$/);
    if (bulletMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push({ text: bulletMatch[1] });
      continue;
    }

    // Callout Box: Strategic Insight / Recommendations / Alerts
    if (
      trimmed.toLowerCase().startsWith('**strategic insight') ||
      trimmed.toLowerCase().startsWith('**recommendation') ||
      trimmed.toLowerCase().startsWith('**risk') ||
      trimmed.toLowerCase().startsWith('### strategic') ||
      trimmed.toLowerCase().startsWith('💡') ||
      trimmed.toLowerCase().startsWith('⚠️')
    ) {
      flushList();
      elements.push(
        <div
          key={`callout-${i}`}
          className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-brand-50/80 to-indigo-50/80 border border-brand-200/80 text-brand-950 flex items-start gap-3 shadow-2xs"
        >
          <Lightbulb className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium leading-relaxed">
            {renderInlineFormatting(trimmed)}
          </div>
        </div>
      );
      continue;
    }

    // Regular paragraph text
    flushList();
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-sm text-slate-700 leading-relaxed">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1.5 text-slate-800">{elements}</div>;
};

export default FormattedAIMessage;
