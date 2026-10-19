import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-soft text-center space-y-4">
        <span className="font-mono text-5xl font-black text-brand-600 block">404</span>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          The business resource or endpoint you requested does not exist or has been relocated.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
