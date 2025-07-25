'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { swellHelpers, DiagnosticPanel } from '@/lib/swell';
import { useCart } from '@/context/CartContext';

type Stage = 'categories' | 'panels' | 'detail';
type Category = 'performance' | 'wellness' | 'hormones' | 'comprehensive';

interface PanelCategory {
  id: string;
  name: string;
  slug: Category;
  description: string;
  icon: string;
  color: string;
  testCount: string;
}

// Category definitions (can also be fetched from Swell)
const categories: PanelCategory[] = [
  {
    id: 'performance',
    name: 'Performance & Recovery',
    slug: 'performance',
    description: 'Athletic performance optimization and recovery tracking',
    icon: '▲',
    color: 'emerald',
    testCount: '5-8 tests'
  },
  {
    id: 'wellness',
    name: 'Wellness & Longevity',
    slug: 'wellness', 
    description: 'Comprehensive wellness and preventive health monitoring',
    icon: '◆',
    color: 'cyan',
    testCount: '8-12 tests'
  },
  {
    id: 'hormones',
    name: 'Hormone Health',
    slug: 'hormones',
    description: 'Hormone balance and optimization for men and women',
    icon: '●',
    color: 'amber',
    testCount: '6-10 tests'
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Health',
    slug: 'comprehensive',
    description: 'Complete health assessment with multiple biomarkers',
    icon: '■',
    color: 'rose',
    testCount: '15+ tests'
  }
];

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  
  const [stage, setStage] = useState<Stage>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<DiagnosticPanel | null>(null);
  const [panels, setPanels] = useState<DiagnosticPanel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle category selection from URL params
  useEffect(() => {
    const category = searchParams.get('category') as Category;
    if (category && categories.find(c => c.slug === category)) {
      setSelectedCategory(category);
      setStage('panels');
      loadPanels(category);
    }
  }, [searchParams]);

  // Load panels from Swell for selected category
  const loadPanels = async (category: Category) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await swellHelpers.getProducts({
        category: category,
        limit: 20
      });
      
      // Map Swell products to DiagnosticPanel format with proper types
      const mappedPanels: DiagnosticPanel[] = (response.results || []).map((product: unknown) => {
        const p = product as Record<string, unknown>;
        return {
          id: String(p.id || ''),
          name: String(p.name || ''),
          description: String(p.description || ''),
          price: Number(p.price || 0),
          currency: String(p.currency || 'USD'),
          categories: Array.isArray(p.categories) ? p.categories.map(String) : [],
          attributes: {
            keyTests: Array.isArray((p.attributes as Record<string, unknown>)?.keyTests) 
              ? ((p.attributes as Record<string, unknown>).keyTests as unknown[]).map(String)
              : [],
            turnaroundTime: String(((p.attributes as Record<string, unknown>)?.turnaroundTime) || '2-3 days'),
            fasting: Boolean((p.attributes as Record<string, unknown>)?.fasting),
            sampleType: String(((p.attributes as Record<string, unknown>)?.sampleType) || 'Blood'),
            biomarkers: Number((p.attributes as Record<string, unknown>)?.biomarkers || 0),
          },
          images: Array.isArray(p.images) ? p.images as DiagnosticPanel['images'] : [],
          variants: Array.isArray(p.variants) ? p.variants as DiagnosticPanel['variants'] : [],
        };
      });
      
      setPanels(mappedPanels);
    } catch (err) {
      setError('Failed to load diagnostic panels. Please try again.');
      console.error('Error loading panels:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStage('panels');
    loadPanels(category);
  };

  const handlePanelSelect = (panel: DiagnosticPanel) => {
    setSelectedPanel(panel);
    setStage('detail');
  };

  const handleBackToCategories = () => {
    setStage('categories');
    setSelectedCategory(null);
    setPanels([]);
  };

  const handleBackToPanels = () => {
    setStage('panels');
    setSelectedPanel(null);
  };

  const handleAddToCart = async (panel: DiagnosticPanel) => {
    try {
      await addToCart(panel.id, { quantity: 1 });
      // Show success message or redirect to cart
      console.log('Added to cart:', panel.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Show error message
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="border-l-2 border-cyan-500/30 pl-6 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Diagnostic Test Panels
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Choose from our comprehensive range of diagnostic panels designed for your health goals.
            </p>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <button
              onClick={handleBackToCategories}
              className={`flex items-center gap-1 transition-colors ${
                stage === 'categories' 
                  ? 'text-cyan-400 cursor-default' 
                  : 'text-slate-400 hover:text-slate-300 cursor-pointer'
              }`}
            >
              <span>Categories</span>
            </button>
            
            {selectedCategory && (
              <>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <button
                  onClick={handleBackToPanels}
                  className={`flex items-center gap-1 transition-colors ${
                    stage === 'panels' 
                      ? 'text-cyan-400 cursor-default' 
                      : 'text-slate-400 hover:text-slate-300 cursor-pointer'
                  }`}
                >
                  <span>{categories.find(c => c.slug === selectedCategory)?.name}</span>
                </button>
              </>
            )}
            
            {selectedPanel && (
              <>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <span className="text-cyan-400">{selectedPanel.name}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Categories Stage */}
            {stage === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`cursor-pointer backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50 text-center group relative overflow-hidden min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Category content */}
                      <div className="relative z-10 h-full flex flex-col">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl flex items-center justify-center ${
                          category.color === 'emerald' 
                            ? 'bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30' :
                          category.color === 'cyan'
                            ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30' :
                          category.color === 'amber'
                            ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30' :
                            'bg-gradient-to-br from-rose-400/20 to-pink-500/20 border border-rose-400/30'
                        }`}>
                          <div className={`text-2xl sm:text-3xl ${
                            category.color === 'emerald' ? 'text-emerald-300' :
                            category.color === 'cyan' ? 'text-cyan-300' :
                            category.color === 'amber' ? 'text-amber-300' :
                            'text-rose-300'
                          }`}>
                            {category.icon}
                          </div>
                        </div>

                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 leading-tight">
                          {category.name}
                        </h3>
                        
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-grow">
                          {category.description}
                        </p>

                        <div className="mt-auto">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                            category.color === 'emerald' 
                              ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20' :
                            category.color === 'cyan'
                              ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20' :
                            category.color === 'amber'
                              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' :
                              'bg-rose-400/10 text-rose-300 border border-rose-400/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              category.color === 'emerald' ? 'bg-emerald-400' :
                              category.color === 'cyan' ? 'bg-cyan-400' :
                              category.color === 'amber' ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`}></div>
                            {category.testCount}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Panels Stage */}
            {stage === 'panels' && (
              <motion.div
                key="panels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <p className="text-slate-400 mt-4">Loading diagnostic panels...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-rose-400 mb-4">{error}</p>
                    <button
                      onClick={() => selectedCategory && loadPanels(selectedCategory)}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : panels.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No panels found for this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {panels.map((panel) => (
                      <motion.div
                        key={panel.id}
                        className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50"
                        whileHover={{ y: -4 }}
                      >
                        <div className="flex flex-col h-full">
                          {/* Panel header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white font-mono">
                                {swellHelpers.formatPrice(panel.price)}
                              </div>
                              <div className="text-xs text-slate-400">Per Panel</div>
                            </div>
                          </div>

                          {/* Panel content */}
                          <h3 className="text-xl font-semibold text-white mb-3 leading-tight">
                            {panel.name}
                          </h3>
                          
                          <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-grow">
                            {panel.description}
                          </p>

                          {/* Key tests preview */}
                          {panel.attributes?.keyTests && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-slate-300 mb-2">Key Tests:</h4>
                              <div className="space-y-1">
                                {panel.attributes.keyTests.slice(0, 3).map((test: string, i: number) => (
                                  <div key={i} className="text-xs text-slate-400 flex items-center gap-2">
                                    <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                                    {test}
                                  </div>
                                ))}
                                {panel.attributes.keyTests.length > 3 && (
                                  <div className="text-xs text-slate-500">
                                    +{panel.attributes.keyTests.length - 3} more tests
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-3 mt-auto pt-4">
                            <button
                              onClick={() => handlePanelSelect(panel)}
                              className="flex-1 px-4 py-2.5 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-medium rounded-lg hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300 text-sm"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleAddToCart(panel)}
                              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 text-sm"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Panel Detail Stage */}
            {stage === 'detail' && selectedPanel && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-4xl mx-auto">
                  <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-slate-900/50">
                    {/* Panel header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-4">{selectedPanel.name}</h2>
                        <p className="text-slate-300 leading-relaxed mb-6">{selectedPanel.description}</p>
                        
                        {/* Panel metadata */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                            <div className="text-xl font-bold text-cyan-400">{selectedPanel.attributes?.biomarkers || 'N/A'}</div>
                            <div className="text-xs text-slate-400">Biomarkers</div>
                          </div>
                          <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                            <div className="text-xl font-bold text-emerald-400">{selectedPanel.attributes?.turnaroundTime || 'N/A'}</div>
                            <div className="text-xs text-slate-400">Results</div>
                          </div>
                          <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                            <div className="text-xl font-bold text-amber-400">{selectedPanel.attributes?.sampleType || 'N/A'}</div>
                            <div className="text-xs text-slate-400">Sample</div>
                          </div>
                          <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                            <div className="text-xl font-bold text-rose-400">{selectedPanel.attributes?.fasting ? 'Yes' : 'No'}</div>
                            <div className="text-xs text-slate-400">Fasting</div>
                          </div>
                        </div>
                      </div>

                      {/* Price and add to cart */}
                      <div className="lg:ml-8 lg:text-right">
                        <div className="text-4xl font-bold text-white font-mono mb-2">
                          {swellHelpers.formatPrice(selectedPanel.price)}
                        </div>
                        <div className="text-slate-400 text-sm mb-6">One-time payment</div>
                        <button
                          onClick={() => handleAddToCart(selectedPanel)}
                          className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    {/* Key tests section */}
                    {selectedPanel.attributes?.keyTests && (
                      <div className="border-t border-slate-700/50 pt-8">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          Included Tests
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedPanel.attributes.keyTests.map((test: string, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                              <span className="text-slate-300 text-sm">{test}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-slate-400">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}