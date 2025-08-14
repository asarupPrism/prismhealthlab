'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { useCartItemCount } from '@/context/CartContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, profile, signOut, adminState } = useAuth();
  const itemCount = useCartItemCount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const primaryNavigation = [
    { id: 'products', href: '/products', label: 'Browse Tests', isActive: pathname.startsWith('/products') },
    { id: 'portal', href: user ? '/portal' : '/login?redirect=/portal', label: 'My Results', isActive: pathname.startsWith('/portal') },
  ];


  const accountItems = user ? [
    { name: 'Dashboard', href: '/portal', icon: 'dashboard' },
    { name: 'My Results', href: '/portal/results', icon: 'results' },
    { name: 'Order History', href: '/portal/orders', icon: 'history' },
    { name: 'Appointments', href: '/portal/appointments', icon: 'calendar' },
    ...(adminState?.status === 'yes' ? [{ name: 'Admin Portal', href: '/admin', icon: 'admin' }] : []),
  ] : [
    { name: 'Sign In', href: '/login', icon: 'signin' },
    { name: 'Create Account', href: '/signup', icon: 'signup' },
  ];

  const getIcon = (iconName: string) => {
    const baseClasses = "w-4 h-4 bg-white/20 rounded flex items-center justify-center";
    const dotClasses = "w-1.5 h-1.5 bg-white rounded-full";
    
    switch (iconName) {
      case 'dashboard':
        return (
          <div className={baseClasses}>
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'results':
        return (
          <div className={baseClasses}>
            <div className="space-y-0.5">
              <div className="w-2 h-0.5 bg-white rounded-full"></div>
              <div className="w-3 h-0.5 bg-white rounded-full"></div>
              <div className="w-2 h-0.5 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'history':
        return (
          <div className={baseClasses}>
            <div className="w-3 h-3 border border-white rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'calendar':
        return (
          <div className={baseClasses}>
            <div className="w-3 h-3 border border-white rounded-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        )
      case 'signin':
        return (
          <div className={baseClasses}>
            <span className="text-xs text-white">→</span>
          </div>
        )
      case 'signup':
        return (
          <div className={baseClasses}>
            <div className="w-0.5 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-0.5 bg-white rounded-full absolute"></div>
          </div>
        )
      case 'admin':
        return (
          <div className={baseClasses}>
            <div className="w-2 h-2 border border-white rounded-sm flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            </div>
          </div>
        )
      default:
        return <div className={baseClasses}><div className={dotClasses}></div></div>
    }
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/90 border-b border-slate-700/50 shadow-lg shadow-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                <motion.div 
                  className="flex space-x-1"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </motion.div>
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent truncate">
                  <span className="hidden sm:inline">Prism Health Lab</span>
                  <span className="sm:hidden">PHL</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Primary Navigation Links */}
              {primaryNavigation.map((link) => {
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 relative ${
                      link.isActive
                        ? 'text-cyan-300'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {link.isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )
              })}


              {/* Account Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowAccountMenu(true)}
                onMouseLeave={() => setShowAccountMenu(false)}
              >
                <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  {user && profile && (
                    <span className="hidden xl:inline-block">
                      {profile.first_name || 'Account'}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showAccountMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 pt-2 w-56 z-50"
                    >
                      <div className="backdrop-blur-lg bg-slate-800/95 border border-slate-700/50 rounded-2xl shadow-xl shadow-slate-900/50 p-3">
                        {user && (
                          <div className="mb-3 p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {profile?.first_name && profile?.last_name 
                                    ? `${profile.first_name} ${profile.last_name}`
                                    : 'Patient'
                                  }
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          {accountItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-all duration-200"
                            >
                              {getIcon(item.icon)}
                              <span>{item.name}</span>
                            </Link>
                          ))}
                          
                          {user && (
                            <>
                              <div className="my-2 border-t border-slate-700/50"></div>
                              <button
                                onClick={() => {
                                  setShowAccountMenu(false);
                                  signOut();
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:text-rose-300 hover:bg-rose-900/20 rounded-lg transition-all duration-200"
                              >
                                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                                  <span className="text-xs text-white">←</span>
                                </div>
                                <span>Sign Out</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2 text-slate-300 hover:text-white transition-colors duration-200"
              >
                <div className="w-6 h-6 relative">
                  {/* Cart body */}
                  <div className="w-5 h-4 border-2 border-current rounded-sm mt-1"></div>
                  {/* Cart handle */}
                  <div className="absolute top-0 left-1 w-3 h-2 border-2 border-current border-b-0 rounded-t-sm"></div>
                </div>
                
                {/* Item count badge */}
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.div>
                )}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-3">
              {/* Mobile Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2 text-slate-300 hover:text-white transition-colors duration-200"
              >
                <div className="w-6 h-6 relative">
                  <div className="w-5 h-4 border-2 border-current rounded-sm mt-1"></div>
                  <div className="absolute top-0 left-1 w-3 h-2 border-2 border-current border-b-0 rounded-t-sm"></div>
                </div>
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.div>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <div className={`w-full h-0.5 bg-current rounded-full transition-all duration-200 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}></div>
                  <div className={`w-full h-0.5 bg-current rounded-full transition-all duration-200 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}></div>
                  <div className={`w-full h-0.5 bg-current rounded-full transition-all duration-200 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 backdrop-blur-md bg-slate-900/95 border-l border-slate-700/50 shadow-xl"
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="font-bold text-white">
                        Menu
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <div className="w-5 h-5 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current transform rotate-45"></div>
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current transform -rotate-45"></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Primary Navigation */}
                  <div className="space-y-2">
                    {primaryNavigation.map((link) => {
                      return (
                        <Link
                          key={link.id}
                          href={link.href}
                          className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors duration-200 ${
                            link.isActive
                              ? 'text-cyan-300 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      )
                    })}
                  </div>


                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <Link
                      href="/products"
                      className="block px-4 py-3 text-center bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-cyan-300 font-medium rounded-lg hover:from-cyan-500/30 hover:to-blue-600/30 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Browse All Tests
                    </Link>
                  </div>

                  {/* Account Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white">
                      {user ? 'Your Account' : 'Get Started'}
                    </h3>
                    
                    {user && (
                      <div className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {profile?.first_name && profile?.last_name 
                                ? `${profile.first_name} ${profile.last_name}`
                                : 'Patient'
                              }
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      {accountItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/30 rounded-lg transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {getIcon(item.icon)}
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      
                      {user && (
                        <>
                          <div className="my-2 border-t border-slate-700/50"></div>
                          <button
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              signOut();
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:text-rose-300 hover:bg-rose-900/20 rounded-lg transition-all duration-200"
                          >
                            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                              <span className="text-xs text-white">←</span>
                            </div>
                            <span>Sign Out</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}