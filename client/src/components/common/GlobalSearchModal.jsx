import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Package, ShoppingCart, FileText, ArrowRight, X, Loader2 } from 'lucide-react';
import { searchService } from '../../services/api';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ customers: [], products: [], orders: [], invoices: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ customers: [], products: [], orders: [], invoices: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], products: [], orders: [], invoices: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchService.search(query.trim());
        if (res.success) {
          setResults(res.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (link) => {
    onClose();
    navigate(link);
  };

  const totalResults =
    results.customers.length + results.products.length + results.orders.length + results.invoices.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:pt-24">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100">
          {/* Search Header */}
          <div className="flex items-center px-4 border-b border-slate-100">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers, products, orders, invoices..."
              className="w-full py-4 text-slate-800 placeholder-slate-400 bg-transparent text-base focus:outline-none"
            />
            {loading && <Loader2 className="w-5 h-5 text-brand-500 animate-spin mr-2" />}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results Container */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {!query.trim() && (
              <div className="py-8 text-center text-slate-400 text-sm">
                Type something to search across your workspace...
              </div>
            )}

            {query.trim() && !loading && totalResults === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                No results found for <span className="font-semibold text-slate-700">"{query}"</span>
              </div>
            )}

            {/* Customers */}
            {results.customers.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Customers
                </div>
                <div className="space-y-1">
                  {results.customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(c.link)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition">
                          {c.title}
                        </div>
                        <div className="text-xs text-slate-500">{c.subtitle}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Products
                </div>
                <div className="space-y-1">
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p.link)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition">
                          {p.title}
                        </div>
                        <div className="text-xs text-slate-500">{p.subtitle}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Orders */}
            {results.orders.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5" /> Orders
                </div>
                <div className="space-y-1">
                  {results.orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => handleSelect(o.link)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition">
                          {o.title}
                        </div>
                        <div className="text-xs text-slate-500">{o.subtitle}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Invoices */}
            {results.invoices.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Invoices
                </div>
                <div className="space-y-1">
                  {results.invoices.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => handleSelect(i.link)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition">
                          {i.title}
                        </div>
                        <div className="text-xs text-slate-500">{i.subtitle}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Navigation shortcut</span>
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono text-[10px]">ESC</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
