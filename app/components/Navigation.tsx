'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CartIcon from './CartIcon';

// Declare speech recognition types for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Self-ordering diagnostic test panels organized for consumer wellness
interface DiagnosticPanel {
  name: string;
  href: string;
  category: string;
  priority: 'popular' | 'standard' | 'specialized';
  description: string;
  price: string;
  icon: string;
}

interface NavigationCategory {
  name: string;
  description: string;
  icon: string;
  panels: DiagnosticPanel[];
}

export default function Navigation() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [notifications, setNotifications] = useState({
    results: 0,
    appointments: 0,
    system: 0
  });
  const [prefetchedRoutes, setPrefetchedRoutes] = useState<Set<string>>(new Set());
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Consumer-friendly test categorization for self-order diagnostic panels
  const diagnosticCategories: NavigationCategory[] = useMemo(() => [
    {
      name: 'Popular Tests',
      description: 'Most ordered wellness panels',
      icon: 'popular',
      panels: [
        { 
          name: 'Routine Self-care Panel', 
          href: '/products?category=routine', 
          category: 'wellness',
          priority: 'popular',
          description: 'Essential health monitoring',
          price: '$59',
          icon: 'routine'
        },
        { 
          name: 'General Hormone Panel', 
          href: '/products?category=hormones', 
          category: 'hormone',
          priority: 'popular',
          description: 'Comprehensive hormone tracking',
          price: '$89',
          icon: 'hormone'
        },
        { 
          name: 'Comprehensive Health', 
          href: '/products?category=comprehensive', 
          category: 'complete',
          priority: 'popular',
          description: 'Complete wellness assessment',
          price: '$119',
          icon: 'comprehensive'
        }
      ]
    },
    {
      name: 'Specialized Wellness',
      description: 'Targeted health insights',
      icon: 'specialized',
      panels: [
        { 
          name: 'Male/Female Hormone Panel', 
          href: '/products?category=gender-specific', 
          category: 'hormone',
          priority: 'standard',
          description: 'Gender-specific hormone insights',
          price: '$99',
          icon: 'gender'
        },
        { 
          name: 'Muscle & Performance', 
          href: '/products?category=performance', 
          category: 'fitness',
          priority: 'standard',
          description: 'Athletic performance tracking',
          price: '$149',
          icon: 'performance'
        },
        { 
          name: 'Longevity & Wellness', 
          href: '/products?category=longevity', 
          category: 'prevention',
          priority: 'standard',
          description: 'Proactive aging insights',
          price: '$99',
          icon: 'longevity'
        }
      ]
    }
  ], []);

  // Enhanced resources with better categorization
  const resourceCategories = [
    {
      name: 'Learn',
      items: [
        { name: 'Health Blog', href: '/blog', description: 'Latest health insights' },
        { name: 'Research & Studies', href: '/research', description: 'Scientific evidence' },
        { name: 'FAQs', href: '/faqs', description: 'Common questions' }
      ]
    },
    {
      name: 'Support',
      items: [
        { name: 'Community', href: '/community', description: 'Connect with others' },
        { name: 'Help Center', href: '/help', description: '24/7 assistance' },
        { name: 'Contact Us', href: '/contact', description: 'Get in touch' }
      ]
    }
  ];



  // Performance optimization: Predictive prefetching
  const prefetchRoute = useCallback((route: string) => {
    if (!prefetchedRoutes.has(route)) {
      router.prefetch(route);
      setPrefetchedRoutes(prev => new Set([...prev, route]));
    }
  }, [prefetchedRoutes, router]);

  // Predictive prefetching based on user behavior
  useEffect(() => {
    // Prefetch commonly accessed routes immediately
    const criticalRoutes = ['/products', '/how-it-works', '/pricing', '/login', '/get-started'];
    criticalRoutes.forEach(route => {
      setTimeout(() => prefetchRoute(route), Math.random() * 2000); // Stagger prefetching
    });

    // Prefetch category routes based on current page
    if (pathname === '/') {
      setTimeout(() => {
        diagnosticCategories.forEach(category => {
          category.panels.forEach(panel => {
            prefetchRoute(panel.href);
          });
        });
      }, 3000); // Prefetch after initial load
    }
  }, [pathname, prefetchRoute, diagnosticCategories]);

  // Intelligent hover prefetching
  const handleLinkHover = (href: string) => {
    prefetchRoute(href);
  };

  // Performance monitoring
  useEffect(() => {
    // Monitor navigation performance
    if ('performance' in window && 'getEntriesByType' in performance) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('Navigation performance:', entry);
          }
        });
      });
      observer.observe({ type: 'navigation', buffered: true });
      
      return () => observer.disconnect();
    }
  }, []);

  // Enhanced dropdown hover management with proper timing
  const handleDropdownEnter = (dropdownName: string) => {
    // Clear any existing timeout
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(dropdownName);
  };

  const handleDropdownLeave = () => {
    // Set a 300ms delay before closing dropdown
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
    setDropdownTimeout(timeout);
  };

  // Enhanced mobile swipe gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    // Close mobile menu on left swipe
    if (isLeftSwipe && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    
    // Open mobile menu on right swipe from left edge
    if (isRightSwipe && !isMobileMenuOpen && touchStart < 50) {
      setIsMobileMenuOpen(true);
    }
  };

  // Haptic feedback simulation for supported devices
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short haptic feedback
    }
  };

  // Real-time notification system
  useEffect(() => {
    // Simulate real-time notifications (in production, this would connect to WebSocket or polling)
    const checkNotifications = () => {
      // Mock notification data - replace with actual API calls
      const mockNotifications = {
        results: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0,
        appointments: Math.random() > 0.9 ? 1 : 0,
        system: 0
      };
      setNotifications(mockNotifications);
    };

    // Check notifications every 30 seconds
    const interval = setInterval(checkNotifications, 30000);
    checkNotifications(); // Initial check

    return () => clearInterval(interval);
  }, []);


  // Enhanced keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
      // Skip to main navigation with Alt+N
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        navRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notification badge component
  const NotificationBadge = ({ count, color = 'bg-rose-500' }: { count: number; color?: string }) => {
    if (count === 0) return null;
    
    return (
      <div className={`absolute -top-1 -right-1 ${color} text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium animate-pulse border-2 border-slate-950`}>
        {count > 9 ? '9+' : count}
      </div>
    );
  };


  // Consumer-friendly test icon rendering function
  const renderTestIcon = (iconType: string) => {
    const iconClasses = "w-3 h-3 flex items-center justify-center";
    
    switch (iconType) {
      case 'popular':
        return <div className={`${iconClasses} bg-emerald-400 rounded-full animate-pulse`}></div>;
      case 'specialized':
        return <div className={`${iconClasses} bg-cyan-400 rounded-lg`}></div>;
      case 'routine':
        return <div className={`${iconClasses} bg-emerald-300 rounded-full`}></div>;
      case 'hormone':
        return <div className={`${iconClasses} bg-amber-400 rounded-lg`}></div>;
      case 'comprehensive':
        return <div className={`${iconClasses} bg-blue-400 rounded`}><div className="w-1 h-1 bg-slate-800 rounded-full"></div></div>;
      case 'performance':
        return <div className={`${iconClasses} bg-cyan-400 rounded`}><div className="w-1 h-1 bg-slate-800 rounded-full"></div></div>;
      default:
        return <div className={`${iconClasses} bg-slate-400 rounded-full`}></div>;
    }
  };

  return (
    <>
      {/* Skip Navigation Link for Accessibility */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium"
        onFocus={(e) => e.currentTarget.classList.remove('sr-only')}
        onBlur={(e) => e.currentTarget.classList.add('sr-only')}
      >
        Skip to main content
      </a>

      <nav 
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-slate-950/90 border-b border-slate-700/30"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Enhanced Logo with better accessibility */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-lg p-2 -m-2"
              aria-label="Prism Health Lab - Return to homepage"
            >
              <div className="flex items-center gap-1.5" role="img" aria-label="Prism Health Lab logo">
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" aria-hidden="true"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} aria-hidden="true"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}} aria-hidden="true"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent group-hover:from-cyan-200 group-hover:via-cyan-50 group-hover:to-cyan-200 transition-all duration-300">
                Prism Health Lab
              </span>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8" role="menubar">
              {/* Lab Tests Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => {
                    handleDropdownEnter('tests');
                    handleLinkHover('/products');
                  }}
                  onMouseLeave={handleDropdownLeave}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white focus:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[48px] whitespace-nowrap"
                  role="menuitem"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'tests'}
                >
                  <span className="font-medium">Lab Tests</span>
                  <div className="w-1 h-1 bg-cyan-400 rounded-full" aria-hidden="true"></div>
                </button>

                {activeDropdown === 'tests' && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-screen max-w-4xl z-50"
                    onMouseEnter={() => handleDropdownEnter('tests')}
                    onMouseLeave={handleDropdownLeave}
                    role="menu"
                    aria-label="Lab test categories"
                  >
                    <div className="backdrop-blur-xl bg-slate-800/95 border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-900/50 p-4">
                      {diagnosticCategories.map((category) => (
                        <div key={category.name} className="mb-4 last:mb-0">
                          <div className="flex items-center gap-3 mb-3 px-2">
                            {renderTestIcon(category.icon)}
                            <div>
                              <h3 className="text-sm font-semibold text-white">{category.name}</h3>
                              <p className="text-xs text-slate-400">{category.description}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {category.panels.map((panel) => (
                              <Link
                                key={panel.name}
                                href={panel.href}
                                className="block p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 group/panel"
                                role="menuitem"
                                onMouseEnter={() => handleLinkHover(panel.href)}
                              >
                                <div className="flex items-center gap-3">
                                  {renderTestIcon(panel.icon)}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white group-hover/panel:text-cyan-100">{panel.name}</div>
                                    <div className="text-xs text-slate-400 truncate">{panel.description}</div>
                                    <div className="text-xs font-medium text-emerald-400 mt-1">{panel.price}</div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-slate-600/30 pt-3 mt-4">
                        <Link
                          href="/products"
                          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                          role="menuitem"
                        >
                          <span>View All Tests</span>
                          <div className="w-1 h-1 bg-white rounded-full" aria-hidden="true"></div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                href="/how-it-works" 
                className="px-4 py-2 text-slate-300 hover:text-white focus:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 font-medium min-h-[48px] flex items-center whitespace-nowrap"
                onMouseEnter={() => handleLinkHover('/how-it-works')}
              >
                How It Works
              </Link>

              <Link 
                href="/pricing" 
                className="px-4 py-2 text-slate-300 hover:text-white focus:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 font-medium min-h-[48px] flex items-center whitespace-nowrap"
                onMouseEnter={() => handleLinkHover('/pricing')}
              >
                Pricing
              </Link>

              {/* Resources Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => handleDropdownEnter('resources')}
                  onMouseLeave={handleDropdownLeave}
                  className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white focus:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[48px] whitespace-nowrap"
                  role="menuitem"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'resources'}
                >
                  <span className="font-medium">Resources</span>
                  <div className="w-1 h-1 bg-emerald-400 rounded-full" aria-hidden="true"></div>
                </button>

                {activeDropdown === 'resources' && (
                  <div 
                    className="absolute top-full right-0 mt-2 w-80 z-50"
                    onMouseEnter={() => handleDropdownEnter('resources')}
                    onMouseLeave={handleDropdownLeave}
                    role="menu"
                    aria-label="Resource categories"
                  >
                    <div className="backdrop-blur-xl bg-slate-800/95 border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-900/50 p-4">
                      {resourceCategories.map((category) => (
                        <div key={category.name} className="mb-4 last:mb-0">
                          <h3 className="text-sm font-semibold text-emerald-400 mb-2 px-2">{category.name}</h3>
                          <div className="space-y-1">
                            {category.items.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="block p-2 rounded-lg hover:bg-slate-700/30 text-slate-300 hover:text-white transition-colors group/item"
                                role="menuitem"
                              >
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className="text-xs text-slate-400">{item.description}</div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Real-time Notifications */}
              <div className="relative hidden lg:block">
                <button 
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[48px] min-w-[48px] flex items-center justify-center"
                  aria-label={`Notifications ${notifications.results + notifications.appointments > 0 ? `(${notifications.results + notifications.appointments} unread)` : ''}`}
                >
                  <div className="w-5 h-5 relative">
                    <div className="w-full h-0.5 bg-current rounded-full mb-1"></div>
                    <div className="w-3 h-0.5 bg-current rounded-full mb-1 ml-1"></div>
                    <div className="w-4 h-0.5 bg-current rounded-full"></div>
                  </div>
                  {(notifications.results > 0 || notifications.appointments > 0) && (
                    <NotificationBadge 
                      count={notifications.results + notifications.appointments} 
                      color="bg-cyan-500"
                    />
                  )}
                </button>
              </div>
              
              
              <CartIcon />
              
              <Link 
                href="/login" 
                className="hidden sm:flex items-center px-4 py-2 text-slate-300 hover:text-white focus:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 font-medium min-h-[48px]"
              >
                Login
              </Link>
              
              <Link 
                href="/get-started"
                className="group px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[48px] flex items-center"
              >
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded"></div>
                  </div>
                  Get Started
                </span>
              </Link>
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  triggerHapticFeedback();
                }}
                className="p-3 text-slate-300 hover:text-white focus:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 min-h-[48px] min-w-[48px] flex items-center justify-center active:scale-95 active:bg-slate-700/50 lg:hidden"
                aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="w-6 h-6 flex flex-col justify-center gap-1" aria-hidden="true">
                  <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                  <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu with swipe gestures and better touch targets */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden backdrop-blur-xl bg-slate-900/95 border-t border-slate-700/50"
              id="mobile-menu"
              role="menu"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="px-6 py-4 space-y-4">
                {/* Lab Tests Section */}
                <div>
                  <div className="text-slate-400 text-sm font-semibold mb-3 flex items-center gap-3">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full" aria-hidden="true"></div>
                    <span>Lab Tests</span>
                  </div>
                  <div className="space-y-1">
                    {diagnosticCategories.map((category) => (
                      <div key={category.name} className="mb-4">
                        <div className="flex items-center gap-3 mb-2 px-2">
                          {renderTestIcon(category.icon)}
                          <span className="text-xs font-medium text-slate-300">{category.name}</span>
                        </div>
                        <div className="space-y-1 pl-8">
                          {category.panels.slice(0, 3).map((panel) => (
                            <Link
                              key={panel.name}
                              href={panel.href}
                              className="block p-3 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 min-h-[48px] flex items-center"
                              role="menuitem"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <div className="text-sm font-medium text-white">{panel.name}</div>
                                  <div className="text-xs text-slate-400">{panel.description}</div>
                                </div>
                                <div className="text-xs font-medium text-emerald-400">{panel.price}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href="/products"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium rounded-lg transition-all duration-200 min-h-[48px] mt-4"
                    role="menuitem"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>View All Tests</span>
                    <div className="w-1 h-1 bg-white rounded-full" aria-hidden="true"></div>
                  </Link>
                </div>

                {/* Main Navigation Links */}
                <div className="space-y-2 border-t border-slate-700/30 pt-4">
                  <Link
                    href="/how-it-works"
                    className="block w-full py-3 px-4 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors font-medium min-h-[48px] flex items-center"
                    role="menuitem"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/pricing"
                    className="block w-full py-3 px-4 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors font-medium min-h-[48px] flex items-center"
                    role="menuitem"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                </div>

                {/* Resources Section */}
                <div className="border-t border-slate-700/30 pt-4">
                  <div className="text-slate-400 text-sm font-semibold mb-3 flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" aria-hidden="true"></div>
                    <span>Resources</span>
                  </div>
                  <div className="space-y-1">
                    {resourceCategories.map((category) => (
                      <div key={category.name} className="mb-3">
                        <div className="text-xs font-medium text-emerald-400 mb-1 px-2">{category.name}</div>
                        <div className="space-y-1">
                          {category.items.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block w-full py-2 px-4 text-slate-300 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors text-sm min-h-[48px] flex items-center"
                              role="menuitem"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 border-t border-slate-700/30 pt-4">
                  <Link
                    href="/login"
                    className="block w-full py-3 px-4 text-center text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors font-medium border border-slate-600/30 hover:border-slate-500/50 min-h-[48px] flex items-center justify-center"
                    role="menuitem"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/get-started"
                    className="block w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 text-center min-h-[48px] flex items-center justify-center"
                    role="menuitem"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded"></div>
                      </div>
                      Get Started
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
