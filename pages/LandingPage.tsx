import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Check, ArrowRight, Shield, Zap, Globe, LayoutDashboard, BarChart3, Layers, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, currentTenant } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              {isAuthenticated && currentTenant?.logoUrl ? (
                 <img src={currentTenant.logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-contain bg-slate-100" />
              ) : (
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Hexagon size={18} strokeWidth={2.5} />
                </div>
              )}
              <span className="font-bold text-xl tracking-tight text-slate-900">
                {isAuthenticated && currentTenant ? currentTenant.name : 'SaaS Nexus'}
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">About</a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <Link 
                  to="/app" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:shadow-indigo-500/25"
                >
                  Go to Dashboard <ArrowRight size={16} className="ml-2" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">Sign in</Link>
                  <Link 
                    to="/signup" 
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 shadow-xl absolute top-16 left-0 w-full z-40 animate-in slide-in-from-top-2">
            <div className="px-4 py-6 space-y-4 flex flex-col">
              <a href="#features" className="text-base font-medium text-slate-700 hover:text-indigo-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="text-base font-medium text-slate-700 hover:text-indigo-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
              <a href="#about" className="text-base font-medium text-slate-700 hover:text-indigo-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <Link 
                    to="/app"
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="w-full inline-flex items-center justify-center px-4 py-3 border border-slate-200 rounded-lg text-base font-medium text-slate-700 bg-white hover:bg-slate-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link 
                      to="/signup"
                      className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-slate-900 hover:bg-slate-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 mb-8 border border-indigo-100">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
            v2.0 is now live
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
            Manage your entire business <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">in one unified platform.</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            SaaS Nexus provides the infrastructure you need to scale. From multi-tenant management to advanced analytics, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link 
              to={isAuthenticated ? "/app" : "/signup"}
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-1"
            >
              {isAuthenticated ? "Enter Dashboard" : "Start Free Trial"}
            </Link>
             {!isAuthenticated && (
               <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-8 py-3.5 border border-slate-200 rounded-xl shadow-sm text-base font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all hover:-translate-y-1"
              >
                Live Demo
              </Link>
             )}
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative rounded-2xl border border-slate-200 bg-slate-100/50 p-2 shadow-2xl mx-auto max-w-5xl">
            <div className="rounded-xl overflow-hidden bg-white border border-slate-200">
               {/* Mock UI header */}
               <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center px-3 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               {/* Use an image or a simplified version of the actual dashboard */}
               <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90 pointer-events-none select-none">
                  {/* Fake stats */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                    <div className="h-2 w-20 bg-slate-200 rounded mb-4"></div>
                    <div className="h-8 w-16 bg-indigo-100 rounded"></div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                    <div className="h-2 w-20 bg-slate-200 rounded mb-4"></div>
                    <div className="h-8 w-16 bg-emerald-100 rounded"></div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 hidden md:block">
                    <div className="h-2 w-20 bg-slate-200 rounded mb-4"></div>
                    <div className="h-8 w-16 bg-blue-100 rounded"></div>
                  </div>
                  {/* Fake Chart */}
                  <div className="col-span-1 md:col-span-3 bg-white h-48 rounded-lg border border-slate-100 flex items-end justify-between p-4 gap-2">
                     {[40, 60, 45, 70, 50, 80, 65, 90, 75, 55].map((h, i) => (
                       <div key={i} className="bg-indigo-500/20 w-full rounded-t" style={{height: `${h}%`}}></div>
                     ))}
                  </div>
               </div>
            </div>
            {/* Decoration */}
            <div className="absolute -top-10 -right-10 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Everything you need to run your SaaS</p>
            <p className="mt-4 text-xl text-slate-500">
              Stop stitching together disparate tools. SaaS Nexus provides a cohesive ecosystem for your business operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={LayoutDashboard} 
              title="Unified Dashboard" 
              description="Real-time overview of your business performance with customizable widgets and data visualization."
            />
            <FeatureCard 
              icon={Shield} 
              title="Multi-Tenant Security" 
              description="Enterprise-grade data isolation ensures your customers' data remains secure and private."
            />
            <FeatureCard 
              icon={Zap} 
              title="Instant Deployment" 
              description="Get up and running in minutes, not months. Automated provisioning handles the heavy lifting."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Advanced Analytics" 
              description="Deep dive into user behavior, revenue trends, and churn metrics to make data-driven decisions."
            />
            <FeatureCard 
              icon={Globe} 
              title="Global Infrastructure" 
              description="Deploy close to your users with our edge-optimized network spanning 25+ regions."
            />
             <FeatureCard 
              icon={Layers} 
              title="API First Design" 
              description="Built for developers. Extensible REST and GraphQL APIs to integrate with your existing workflow."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section (Id added for nav anchor) */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Pricing</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Simple, Transparent Plans</p>
            <p className="mt-4 text-xl text-slate-500">
              Choose a plan that scales with your business. No hidden fees.
            </p>
          </div>
          {/* Simple pricing grid demo */}
          <div className="grid md:grid-cols-3 gap-8">
             {[
               { name: 'Monthly', price: '2,199', features: ['2 Users', '150 Products', 'Standard Support'] },
               { name: 'Quarterly', price: '5,499', features: ['5 Users', '300 Products', 'Priority Support'], popular: true },
               { name: 'Yearly', price: '17,599', features: ['10 Users', '1000 Products', 'Dedicated Manager'] },
             ].map((plan, i) => (
                <div key={i} className={`p-8 rounded-2xl border ${plan.popular ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-200'} flex flex-col`}>
                   <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                   <div className="my-4 flex items-baseline">
                      <span className="text-3xl font-extrabold">Rs {plan.price}</span>
                   </div>
                   <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center text-sm text-slate-600">
                           <Check size={16} className="text-green-500 mr-2"/> {f}
                        </li>
                      ))}
                   </ul>
                   <Link 
                     to={isAuthenticated ? "/app/subscription" : "/signup"}
                     className={`w-full py-3 rounded-xl font-bold text-center transition-colors ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                   >
                     {isAuthenticated ? 'Subscribe' : 'Start Trial'}
                   </Link>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center justify-center md:justify-start gap-2 text-white mb-4">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Hexagon size={18} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl tracking-tight">SaaS Nexus</span>
            </div>
            <p className="text-sm text-slate-400">
              The operating system for modern SaaS businesses. Scale faster with less overhead.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

           <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 text-center">
          &copy; {new Date().getFullYear()} SaaS Nexus Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);