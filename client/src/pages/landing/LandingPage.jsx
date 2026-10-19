import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Check,
  Database,
  FileBarChart2,
  FileText,
  Menu,
  MessageSquareText,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const featureCards = [
  {
    icon: MessageSquareText,
    title: 'AI Copilot Chat',
    description: 'Ask business questions and get answers grounded in your workspace data.',
    iconClass: 'bg-brand-50 text-brand-600',
  },
  {
    icon: FileBarChart2,
    title: 'Executive AI Reports',
    description: 'Generate weekly, monthly, or quarterly summaries with practical insights.',
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Users,
    title: 'Customer CRM',
    description: 'Keep customer details, activity, and order history together.',
    iconClass: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Package,
    title: 'Products & Inventory',
    description: 'Manage your catalog, stock levels, and low-stock alerts.',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: FileText,
    title: 'Orders & Invoicing',
    description: 'Track orders from creation to fulfilment and manage customer invoices.',
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Review business KPIs, sales trends, and operational activity.',
    iconClass: 'bg-indigo-50 text-indigo-600',
  },
];

const utilityFeatures = [
  { icon: ShieldCheck, label: 'Owner, Manager & Staff roles' },
  { icon: Search, label: 'Global search with Ctrl + K' },
  { icon: Bell, label: 'Workspace notifications' },
];

const workflowSteps = [
  {
    number: '01',
    title: 'Register',
    description: 'Create your account to get started.',
  },
  {
    number: '02',
    title: 'Complete onboarding',
    description: 'Set up your business workspace and preferences.',
  },
  {
    number: '03',
    title: 'Manage with AI',
    description: 'Organize daily operations and ask questions about your data.',
  },
];

const roles = [
  {
    title: 'Owner',
    description: 'Full workspace access, business settings, team management, and business insights.',
    icon: ShieldCheck,
    iconClass: 'bg-brand-50 text-brand-600',
  },
  {
    title: 'Manager',
    description: 'Manage customers, products, orders, invoices, analytics, and AI reports.',
    icon: Boxes,
    iconClass: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Staff',
    description: 'Create orders, view the catalog, look up customers, and generate marketing copy.',
    icon: Users,
    iconClass: 'bg-slate-100 text-slate-600',
  },
];

const Brand = ({ light = false }) => (
  <Link to="/" className="inline-flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-400 text-white shadow-lg shadow-brand-500/30">
      <Sparkles className="h-5 w-5" aria-hidden="true" />
    </span>
    <span className={`font-heading text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
      BizMind <span className="text-brand-400">AI</span>
    </span>
  </Link>
);

const PrimaryLink = ({ to, children, className = '' }) => (
  <Link
    to={to}
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${className}`}
  >
    {children}
  </Link>
);

const SecondaryLink = ({ to, children, className = '' }) => (
  <Link
    to={to}
    className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${className}`}
  >
    {children}
  </Link>
);

const DashboardPreview = () => (
  <div className="landing-enter relative mx-auto w-full max-w-xl lg:ml-auto">
    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
    <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden="true" />
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-sm sm:p-5">
      <div className="flex items-center justify-between gap-4 px-1 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-400 text-white">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Business overview</p>
            <p className="text-[11px] text-slate-400">Workspace dashboard</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
          Sample preview
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {[
          { label: 'Revenue', value: '$48.2k', change: '+12.8%' },
          { label: 'Orders', value: '128', change: '+8.2%' },
          { label: 'Customers', value: '64', change: '+5.4%' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-navy-900/60 p-3 sm:p-4">
            <p className="truncate text-[10px] font-medium text-slate-400 sm:text-xs">{metric.label}</p>
            <p className="mt-2 text-lg font-extrabold tracking-tight text-white sm:text-2xl">{metric.value}</p>
            <p className="mt-1 text-[10px] font-semibold text-emerald-300 sm:text-xs">{metric.change}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-navy-900/60 p-4 sm:mt-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-white sm:text-sm">Revenue overview</p>
            <p className="mt-1 text-[10px] text-slate-400">Illustrative chart preview</p>
          </div>
          <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-300">Last 6 months</span>
        </div>
        <svg
          viewBox="0 0 440 150"
          className="h-32 w-full sm:h-40"
          role="img"
          aria-label="Illustrative revenue chart trending upward"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="landing-chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity=".35" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 60, 95, 130].map((y) => (
            <line key={y} x1="0" y1={y} x2="440" y2={y} stroke="white" strokeOpacity=".08" strokeDasharray="4 6" />
          ))}
          <path
            d="M0 116 C28 108 40 103 67 107 S107 86 134 91 S176 68 201 75 S244 53 267 61 S310 39 335 48 S376 24 401 35 S424 20 440 17 L440 150 L0 150 Z"
            fill="url(#landing-chart-fill)"
          />
          <path
            d="M0 116 C28 108 40 103 67 107 S107 86 134 91 S176 68 201 75 S244 53 267 61 S310 39 335 48 S376 24 401 35 S424 20 440 17"
            fill="none"
            stroke="#818cf8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="335" cy="48" r="4" fill="#c7d2fe" />
          <circle cx="440" cy="17" r="4" fill="#c7d2fe" />
        </svg>
        <div className="flex justify-between px-1 text-[9px] font-medium text-slate-500 sm:text-[10px]">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => <span key={month}>{month}</span>)}
        </div>
      </div>
      <p className="px-1 pt-3 text-center text-[10px] text-slate-500">All figures shown are illustrative, not live business data.</p>
    </div>
  </div>
);

export const LandingPage = () => {
  const { isAuthenticated, needsOnboarding } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dashboardPath = needsOnboarding ? '/onboarding' : '/dashboard';

  const closeMenu = () => setIsMenuOpen(false);
  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'AI', href: '#ai' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="glass-panel sticky top-0 z-50 border-b border-slate-200/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8" aria-label="Main navigation">
          <Brand />
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="rounded-md text-sm font-medium text-slate-600 transition hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                {link.label}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <PrimaryLink to={dashboardPath}>
                Go to Dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </PrimaryLink>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  Login
                </Link>
                <PrimaryLink to="/register">Get Started <ArrowRight className="h-4 w-4" aria-hidden="true" /></PrimaryLink>
              </>
            )}
          </div>
          <button
            type="button"
            className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
        {isMenuOpen && (
          <div id="landing-mobile-menu" className="border-t border-slate-200 bg-white px-4 py-4 shadow-soft md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex gap-3 border-t border-slate-100 pt-4">
                {isAuthenticated ? (
                  <PrimaryLink to={dashboardPath} className="w-full" >Go to Dashboard <ArrowRight className="h-4 w-4" /></PrimaryLink>
                ) : (
                  <>
                    <SecondaryLink to="/login" className="flex-1">Login</SecondaryLink>
                    <PrimaryLink to="/register" className="flex-1">Get Started <ArrowRight className="h-4 w-4" /></PrimaryLink>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy-900 via-navy-950 to-brand-950 text-white">
          <div className="pointer-events-none absolute -left-28 top-8 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
            <div className="landing-enter max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                AI-Powered Business Management
              </div>
              <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Run your business with clarity, backed by your real data.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Manage customers, inventory, orders, and invoices in one workspace. Ask an AI copilot questions about your business, with answers grounded in your actual records.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <PrimaryLink to={dashboardPath} className="px-6 py-3.5">
                    Go to Dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </PrimaryLink>
                ) : (
                  <>
                    <PrimaryLink to="/register" className="px-6 py-3.5">
                      Get Started <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </PrimaryLink>
                    <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950">
                      Login
                    </Link>
                  </>
                )}
              </div>
              <a href="#features" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300">
                Explore the workspace <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white" aria-label="Platform capabilities">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-7 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              { icon: Boxes, label: 'Multi-tenant workspaces' },
              { icon: ShieldCheck, label: 'Role-based access' },
              { icon: Database, label: 'Grounded AI answers' },
              { icon: Bell, label: 'Real-time notifications' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-2.5 py-2 text-center text-xs font-semibold text-slate-600 sm:text-sm">
                <Icon className="h-4 w-4 shrink-0 text-brand-600 sm:h-5 sm:w-5" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">One connected workspace</span>
              <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                The tools to run your day-to-day
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Keep your customer relationships, operations, and business insights connected as your work moves forward.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map(({ icon: Icon, title, description, iconClass }) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-soft-lg">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                </article>
              ))}
            </div>
            <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:grid-cols-3 sm:p-5">
              {utilityFeatures.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-slate-600">
                  <Icon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ai" className="scroll-mt-24 overflow-hidden bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">AI grounded in your business</span>
              <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Real numbers first. A clearer answer next.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                BizMind AI calculates business metrics from your workspace records, then uses AI to explain them. The model helps phrase the answer; it does not make up your financial figures.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: MessageSquareText, title: 'Ask', text: 'Ask a business question.' },
                  { icon: Database, title: 'Calculate', text: 'Get figures from your records.' },
                  { icon: Sparkles, title: 'Explain', text: 'Receive a clear answer.' },
                ].map(({ icon: Icon, title, text }, index) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-900"><span className="mr-1.5 text-brand-600">{index + 1}.</span>{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-brand-950 p-5 shadow-soft-lg sm:p-8">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-400 text-white">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">BizMind AI Copilot</p>
                  <p className="text-xs text-slate-400">Example conversation</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="max-w-[88%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white">
                  What was our revenue last month?
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-300">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm leading-relaxed text-slate-200">
                    I’ll calculate that from your completed business records and summarize the result.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-emerald-300">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Based on your workspace data
                  </div>
                </div>
              </div>
              <p className="mt-5 text-center text-[11px] text-slate-500">
                Example exchange only. No live figures are displayed on this page.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Getting started</span>
              <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">From setup to a clearer view</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">Bring your core business workflows into one place, one step at a time.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {workflowSteps.map((step) => (
                <article key={step.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-soft-lg">
                  <span className="font-heading text-3xl font-extrabold text-brand-200">{step.number}</span>
                  <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-100/80 px-4 py-20 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="roles-heading">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Built for your team</span>
              <h2 id="roles-heading" className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Clear access for every role</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">Workspace permissions help each person focus on the work they need to do.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {roles.map(({ title, description, icon: Icon, iconClass }) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-soft-lg">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-800 px-6 py-12 text-center text-white shadow-soft-lg sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Start managing smarter</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                Keep your operations organized and make sense of your business data in one workspace.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <PrimaryLink to={dashboardPath} className="bg-white text-brand-700 hover:bg-indigo-50">
                    Go to Dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </PrimaryLink>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-glow transition hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700">
                      Get Started <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              Business management and analytics for customer, inventory, order, and invoice workflows, with AI grounded in your business data.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Explore</h3>
              <div className="mt-4 flex flex-col items-start gap-3">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account</h3>
              <div className="mt-4 flex flex-col items-start gap-3">
                <Link to={isAuthenticated ? dashboardPath : '/login'} className="text-sm font-medium text-slate-600 transition hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  {isAuthenticated ? 'Go to Dashboard' : 'Login'}
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="text-sm font-medium text-slate-600 transition hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    Get Started
                  </Link>
                )}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Built by</h3>
              <p className="mt-4 text-sm font-semibold text-slate-700">Abdullah</p>
              <div className="mt-3 flex gap-4">
                <a href="https://www.linkedin.com/in/abdullah-anis-549648368" target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-600 transition hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Abdullah on LinkedIn">
                  LinkedIn
                </a>
                <a href="https://github.com/AbdullahAnis1549/bizmind-business-platform" target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-600 transition hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="BizMind AI on GitHub">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} BizMind AI
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
