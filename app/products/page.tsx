'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { swellHelpers } from '@/lib/swell';
import { useCart } from '@/context/CartContext';

type Stage = 'categories' | 'panels' | 'detail';
type Category = 'performance' | 'wellness' | 'hormones' | 'comprehensive';

interface Panel {
  id: string;
  name: string;
  price: string;
  testCount: number;
  category: Category;
  description: string;
  bestFor: string;
  keyTests: string[];
  icon: string;
  color: string;
  detailedTests: {
    category: string;
    tests: { name: string; purpose: string }[];
  }[];
  // Swell fields
  swellId?: string;
  swellPrice?: number;
}

const panels: Panel[] = [
  {
    id: 'muscle-performance',
    name: 'Muscle & Performance',
    price: '$149',
    testCount: 7,
    category: 'performance',
    description: 'Optimize muscle growth, hormone balance, recovery tracking, and nutritional status for fitness enthusiasts and athletes.',
    bestFor: 'Athletes & Fitness Enthusiasts',
    keyTests: ['Testosterone + Hormones', 'Recovery Markers', 'Nutritional Status'],
    icon: '▲',
    color: 'emerald',
    detailedTests: [
      {
        category: 'Hormone Assessment',
        tests: [
          { name: 'Testosterone (Total + Free)', purpose: 'Muscle building' },
          { name: 'DHEA Sulfate Level', purpose: 'Recovery support' },
          { name: 'Estradiol', purpose: 'Hormonal balance' }
        ]
      },
      {
        category: 'Recovery & Nutrition',
        tests: [
          { name: 'Creatine Kinase (CPK Total)', purpose: 'Muscle recovery' },
          { name: 'Vitamin D 25-OH', purpose: 'Bone health' },
          { name: 'Comprehensive Metabolic Panel', purpose: 'General health' },
          { name: 'Lipid Panel', purpose: 'Heart health' }
        ]
      }
    ]
  },
  {
    id: 'longevity-wellness',
    name: 'Longevity & Wellness',
    price: '$99',
    testCount: 8,
    category: 'wellness',
    description: 'Early detection of chronic disease markers, metabolic optimization, inflammation monitoring, and immune status assessment for proactive health management.',
    bestFor: 'Health-Conscious Individuals, Preventive Care',
    keyTests: ['Inflammation Markers', 'Metabolic Health', 'Essential Vitamins'],
    icon: '◆',
    color: 'cyan',
    detailedTests: [
      {
        category: 'Metabolic Health',
        tests: [
          { name: 'Hemoglobin A1C', purpose: 'Blood sugar control' },
          { name: 'Comprehensive Metabolic Panel', purpose: 'Kidney function' },
          { name: 'Lipid Panel', purpose: 'Heart health' }
        ]
      },
      {
        category: 'Inflammation & Deficiencies',
        tests: [
          { name: 'C-Reactive Protein (hs-CRP)', purpose: 'Inflammation marker' },
          { name: 'Ferritin / Iron / TIBC', purpose: 'Iron storage' },
          { name: 'Vitamin B12 / Folate Panel', purpose: 'Energy metabolism' },
          { name: 'Vitamin D 25-OH', purpose: 'Immune support' },
          { name: 'TSH', purpose: 'Thyroid function' }
        ]
      }
    ]
  },
  {
    id: 'routine-selfcare',
    name: 'Routine Self-Care & Deficiency',
    price: '$59',
    testCount: 8,
    category: 'wellness',
    description: 'General baseline health check-up focused on identifying nutritional and metabolic deficiencies early for routine wellness monitoring.',
    bestFor: 'General Population, Budget-Conscious',
    keyTests: ['Blood Chemistry', 'Vitamin Status', 'Thyroid Function'],
    icon: '■',
    color: 'amber',
    detailedTests: [
      {
        category: 'Blood Chemistry',
        tests: [
          { name: 'Comprehensive Metabolic Panel', purpose: 'Organ function' },
          { name: 'CBC w/Diff', purpose: 'General health' },
          { name: 'Uric Acid', purpose: 'Metabolic function' },
          { name: 'Lipid Panel', purpose: 'Heart health' }
        ]
      },
      {
        category: 'Essential Vitamins',
        tests: [
          { name: 'Vitamin D 25-OH', purpose: 'Immune health' },
          { name: 'Vitamin B12', purpose: 'Energy support' },
          { name: 'Magnesium Level', purpose: 'Muscle function' },
          { name: 'TSH', purpose: 'Thyroid health' }
        ]
      }
    ]
  },
  {
    id: 'male-hormone',
    name: 'Male Hormone Optimization & Safety',
    price: '$99',
    testCount: 6,
    category: 'hormones',
    description: 'Comprehensive male hormone assessment with safety monitoring for testosterone optimization and prostate health.',
    bestFor: 'Men interested in hormone optimization, TRT monitoring',
    keyTests: ['Testosterone Levels', 'Prostate Safety', 'General Health'],
    icon: '▼',
    color: 'blue',
    detailedTests: [
      {
        category: 'Core Hormones',
        tests: [
          { name: 'Testosterone (Total + Free)', purpose: 'Vitality markers' },
          { name: 'Estradiol', purpose: 'Hormonal balance' }
        ]
      },
      {
        category: 'Safety & Support',
        tests: [
          { name: 'PSA Total', purpose: 'Prostate health' },
          { name: 'Comprehensive Metabolic Panel', purpose: 'General health' },
          { name: 'Lipid Panel', purpose: 'Heart health' },
          { name: 'CBC w/Diff', purpose: 'Blood health' }
        ]
      }
    ]
  },
  {
    id: 'female-hormone',
    name: 'Female Hormone Optimization & Safety',
    price: '$99',
    testCount: 7,
    category: 'hormones',
    description: 'Comprehensive female hormone assessment for reproductive health, cycle tracking, and hormonal balance monitoring.',
    bestFor: 'Women tracking reproductive health, hormone optimization',
    keyTests: ['Reproductive Hormones', 'Cycle Tracking', 'Thyroid Function'],
    icon: '●',
    color: 'rose',
    detailedTests: [
      {
        category: 'Reproductive Hormones',
        tests: [
          { name: 'Estradiol', purpose: 'Hormonal balance' },
          { name: 'Progesterone', purpose: 'Reproductive health' },
          { name: 'FSH', purpose: 'Cycle tracking' },
          { name: 'LH', purpose: 'Cycle tracking' }
        ]
      },
      {
        category: 'General Health',
        tests: [
          { name: 'Comprehensive Metabolic Panel', purpose: 'General health' },
          { name: 'CBC w/Diff', purpose: 'Blood health' },
          { name: 'TSH', purpose: 'Thyroid function' }
        ]
      }
    ]
  },
  {
    id: 'general-hormone',
    name: 'General Human Hormone',
    price: '$89',
    testCount: 6,
    category: 'hormones',
    description: 'Gender-neutral hormone tracking for individuals interested in comprehensive hormonal health monitoring.',
    bestFor: 'Gender-neutral hormone tracking, general wellness',
    keyTests: ['Core Hormones', 'Stress Markers', 'Vitamin D'],
    icon: '◇',
    color: 'purple',
    detailedTests: [
      {
        category: 'Core Hormones',
        tests: [
          { name: 'Testosterone Total', purpose: 'Vitality markers' },
          { name: 'Estradiol', purpose: 'Hormonal balance' },
          { name: 'Progesterone', purpose: 'Reproductive health' },
          { name: 'TSH', purpose: 'Thyroid function' }
        ]
      },
      {
        category: 'Stress & Support',
        tests: [
          { name: 'DHEA Sulfate Level', purpose: 'Stress response' },
          { name: 'Vitamin D 25-OH', purpose: 'Immune support' }
        ]
      }
    ]
  },
  {
    id: 'female-comprehensive',
    name: 'Female Comprehensive Health',
    price: '$119',
    testCount: 10,
    category: 'comprehensive',
    description: 'Comprehensive health assessment combining hormone evaluation, nutritional status, and general health markers specifically designed for female physiology.',
    bestFor: 'Women seeking complete health evaluation',
    keyTests: ['Hormone Assessment', 'Nutritional Status', 'General Health'],
    icon: '◆',
    color: 'rose',
    detailedTests: [
      {
        category: 'Reproductive Hormones',
        tests: [
          { name: 'Estradiol', purpose: 'Hormonal balance' },
          { name: 'Progesterone', purpose: 'Reproductive health' },
          { name: 'FSH', purpose: 'Cycle tracking' },
          { name: 'LH', purpose: 'Cycle tracking' },
          { name: 'TSH', purpose: 'Thyroid function' }
        ]
      },
      {
        category: 'Health & Nutrition',
        tests: [
          { name: 'CBC w/Diff', purpose: 'Blood health' },
          { name: 'Comprehensive Metabolic Panel', purpose: 'General health' },
          { name: 'Ferritin / Iron / TIBC', purpose: 'Iron storage' },
          { name: 'Vitamin D 25-OH', purpose: 'Immune support' },
          { name: 'Vitamin B12/Folate Panel', purpose: 'Energy metabolism' }
        ]
      }
    ]
  },
  {
    id: 'male-comprehensive',
    name: 'Male Comprehensive Health',
    price: '$119',
    testCount: 8,
    category: 'comprehensive',
    description: 'Comprehensive health assessment combining hormone evaluation, cardiovascular health, and general health markers specifically designed for male physiology.',
    bestFor: 'Men seeking complete health evaluation',
    keyTests: ['Hormone Assessment', 'Cardiovascular Health', 'General Health'],
    icon: '▲',
    color: 'blue',
    detailedTests: [
      {
        category: 'Hormones & Safety',
        tests: [
          { name: 'Testosterone (Total + Free)', purpose: 'Vitality markers' },
          { name: 'Estradiol', purpose: 'Hormonal balance' },
          { name: 'PSA Total', purpose: 'Prostate health' }
        ]
      },
      {
        category: 'Health & Cardiovascular',
        tests: [
          { name: 'Comprehensive Metabolic Panel', purpose: 'General health' },
          { name: 'Lipid Panel', purpose: 'Heart health' },
          { name: 'CBC w/Diff', purpose: 'Blood health' },
          { name: 'C-Reactive Protein (hs-CRP)', purpose: 'Inflammation marker' },
          { name: 'Vitamin D 25-OH', purpose: 'Immune support' }
        ]
      }
    ]
  },
  {
    id: 'sexual-health',
    name: 'Sexual Health Panel',
    price: '$99',
    testCount: 6,
    category: 'comprehensive',
    description: 'Comprehensive sexual health screening for safety and preventive care with confidential results delivery.',
    bestFor: 'Sexually active individuals, routine health screening',
    keyTests: ['STI Panel + HIV', 'Hepatitis A/B/C Screening', 'Confidential Results'],
    icon: '■',
    color: 'teal',
    detailedTests: [
      {
        category: 'STI Screening',
        tests: [
          { name: 'HIV 1/2 Antigen/Antibody Screen', purpose: 'HIV detection' },
          { name: 'Syphilis (RPR)', purpose: 'Syphilis screening' },
          { name: 'Chlamydia/Gonorrhea PCR Urine', purpose: 'STI screening' }
        ]
      },
      {
        category: 'Hepatitis Screening',
        tests: [
          { name: 'Hepatitis A Antibody, Total', purpose: 'Hepatitis A immunity' },
          { name: 'Hepatitis B Surface Ag', purpose: 'Hepatitis B infection' },
          { name: 'Hepatitis C Antibody', purpose: 'Hepatitis C screening' }
        ]
      }
    ]
  }
];

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [currentStage, setCurrentStage] = useState<Stage>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [swellPanels, setSwellPanels] = useState<Array<Record<string, unknown>>>([]);
  const [isLoadingSwell, setIsLoadingSwell] = useState(false);

  // Handle URL parameters for direct category navigation
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && ['performance', 'wellness', 'hormones', 'comprehensive', 'sexual'].includes(category)) {
      // Map 'sexual' to 'comprehensive' since sexual health is in comprehensive category
      const mappedCategory = category === 'sexual' ? 'comprehensive' : category as Category;
      setSelectedCategory(mappedCategory);
      setCurrentStage('panels');
      // Scroll to main content after a short delay to allow hero transition
      setTimeout(() => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams]);

  // Scroll tracking for hero transition
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const transitionRange = viewportHeight * 0.8; // 80% of viewport for smoother transition
      const progress = Math.min(scrollTop / transitionRange, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (flippedCards.size > 0) {
          setFlippedCards(new Set());
        } else if (currentStage === 'panels') {
          setCurrentStage('categories');
          setSelectedCategory(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [flippedCards, currentStage]);

  // Load Swell data and merge with static panels
  useEffect(() => {
    const loadSwellData = async () => {
      try {
        setIsLoadingSwell(true);
        const response = await swellHelpers.getProducts({ limit: 50 });
        setSwellPanels((response.results || []).map((product: unknown) => product as Record<string, unknown>));
      } catch (error) {
        console.error('Error loading Swell products:', error);
        // Fallback to static data if Swell fails
      } finally {
        setIsLoadingSwell(false);
      }
    };

    loadSwellData();
  }, []);

  // Merge static panels with Swell data for pricing and cart functionality
  const getMergedPanels = () => {
    return panels.map(panel => {
      const swellPanel = swellPanels.find(sp => 
        (sp as Record<string, unknown>).slug === panel.id || 
        String((sp as Record<string, unknown>).name).toLowerCase().includes(panel.name.toLowerCase().substring(0, 10))
      );
      
      return {
        ...panel,
        swellId: swellPanel ? String((swellPanel as Record<string, unknown>).id) : undefined,
        swellPrice: swellPanel ? Number((swellPanel as Record<string, unknown>).price) : undefined,
        price: swellPanel ? swellHelpers.formatPrice(Number((swellPanel as Record<string, unknown>).price) || 0) : panel.price
      };
    });
  };

  const getCategoryPanels = (category: Category) => {
    return getMergedPanels().filter(panel => panel.category === category);
  };

  const toggleCardFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleAddToCart = async (panel: Panel) => {
    try {
      if (panel.swellId) {
        await addToCart(panel.swellId, { quantity: 1 });
        console.log('Added to cart:', panel.name);
        // You could add a toast notification here
      } else {
        console.warn('Panel not found in Swell store:', panel.name);
        // Fallback: could redirect to contact form or show message
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Handle error - show user feedback
    }
  };

  const getCategoryInfo = (category: Category) => {
    const categoryPanels = getCategoryPanels(category);
    const minPrice = Math.min(...categoryPanels.map(p => parseInt(p.price.replace(/[$-]/g, '').split(/[\s-]/)[0])));
    
    const categoryMap = {
      performance: {
        title: 'Performance & Recovery',
        description: 'Optimize athletic performance and muscle development',
        icon: '▲',
        color: 'emerald',
        count: categoryPanels.length
      },
      wellness: {
        title: 'Wellness & Longevity',
        description: 'Preventive care and metabolic optimization',
        icon: '◆',
        color: 'cyan',
        count: categoryPanels.length
      },
      hormones: {
        title: 'Hormone Health & Optimization',
        description: 'Hormone balance and reproductive health',
        icon: '●',
        color: 'purple',
        count: categoryPanels.length
      },
      comprehensive: {
        title: 'Comprehensive Health',
        description: 'Complete health assessment panels',
        icon: '◇',
        color: 'blue',
        count: categoryPanels.length
      }
    };
    
    return { ...categoryMap[category], minPrice };
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Fixed Hero Section */}
      <div 
        className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-950 px-6 transition-all duration-300 ease-out"
        style={{ 
          opacity: 1 - scrollProgress,
          transform: `translateY(${scrollProgress * -10}vh)` // Subtle parallax movement
        }}
      >
        <div className="max-w-4xl mx-auto pt-20 sm:pt-24 pb-12 sm:pb-16 px-4">
          <div className="text-center mb-8 sm:mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight"
            >
              Diagnostic Testing Panels
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto mb-6 sm:mb-8"
            >
              Get comprehensive health insights with our curated testing panels designed for modern healthcare needs.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xs sm:text-sm text-slate-400 mb-6 sm:mb-8"
            >
              CLIA-certified labs • 2-3 day results • Save 50-70% vs traditional labs
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-300 mb-1 sm:mb-2">9</div>
              <div className="text-xs sm:text-sm text-slate-400">Comprehensive Panels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-300 mb-1 sm:mb-2">4</div>
              <div className="text-xs sm:text-sm text-slate-400">Health Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-amber-300 mb-1 sm:mb-2">50-70%</div>
              <div className="text-xs sm:text-sm text-slate-400">Cost Savings</div>
            </div>
          </motion.div>

          {/* Primary CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mb-6 sm:mb-8"
          >
            <button 
              onClick={() => {
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
              }}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:scale-105 text-sm sm:text-base min-h-[48px]"
            >
              Explore Testing Panels
            </button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Scroll to explore</div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 h-3 bg-cyan-400 rounded-full mt-2"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Spacer to allow scrolling */}
      <div className="h-screen"></div>

      {/* Main Content - Slides up as user scrolls */}
      <div 
        className="relative bg-slate-950 min-h-screen transition-all duration-500 ease-out"
        style={{ 
          transform: `translateY(${(1 - scrollProgress) * 20}vh) scale(${0.98 + (scrollProgress * 0.02)})`,
          opacity: scrollProgress > 0.2 ? 1 : scrollProgress / 0.2,
          backdropFilter: scrollProgress > 0.4 ? 'blur(0px)' : `blur(${(0.4 - scrollProgress) * 8}px)`
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
        {/* Persistent Breadcrumb Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Only show breadcrumb navigation when not on categories stage */}
          {currentStage !== 'categories' && (
            <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-6">
              <button 
                onClick={() => {
                  setCurrentStage('categories');
                  setSelectedCategory(null);
                  setFlippedCards(new Set());
                }}
                className="hover:text-slate-200 transition-colors"
              >
                Diagnostic Panels
              </button>
              {selectedCategory && (
                <>
                  <span className="text-slate-600">→</span>
                  <button 
                    onClick={() => {
                      setCurrentStage('panels');
                      setFlippedCards(new Set());
                    }}
                    className={`hover:text-slate-200 transition-colors ${
                      currentStage === 'panels' ? 'text-cyan-300 font-medium' : ''
                    }`}
                  >
                    {getCategoryInfo(selectedCategory).title}
                  </button>
                </>
              )}
            </nav>
          )}
          
          {/* Category Tabs - Persistent when category is selected */}
          {selectedCategory && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8"
            >
              {(['performance', 'wellness', 'hormones', 'comprehensive'] as Category[]).map((category) => {
                const info = getCategoryInfo(category);
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentStage('panels');
                      setFlippedCards(new Set());
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800/60 hover:text-slate-300'
                    }`}
                  >
                    <span className="text-lg">{info.icon}</span>
                    {info.title}
                    <span className="text-xs opacity-70">({info.count})</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Main Content Area */}
        <div className="relative">
          <AnimatePresence>
            {/* Stage 1: Category Selection */}
            {currentStage === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-semibold text-white mb-4">
                    Choose Your Health Focus
                  </h2>
                  <p className="text-slate-400 text-lg">
                    Select the category that best matches your health goals
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
                  {(['performance', 'wellness', 'hormones', 'comprehensive'] as Category[]).map((category, index) => {
                    const info = getCategoryInfo(category);
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedCategory(category);
                          setCurrentStage('panels');
                        }}
                        className={`cursor-pointer backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50 text-center group relative overflow-hidden min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]`}
                      >
                        {/* Color accent border */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                          info.color === 'emerald' ? 'from-emerald-400 to-green-500' :
                          info.color === 'cyan' ? 'from-cyan-400 to-blue-500' :
                          info.color === 'purple' ? 'from-purple-400 to-pink-500' :
                          'from-blue-400 to-indigo-500'
                        }`}></div>
                        
                        {/* Colored icon background */}
                        <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl mb-4 sm:mb-6 ${
                          info.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30' :
                          info.color === 'cyan' ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30' :
                          info.color === 'purple' ? 'bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-purple-400/30' :
                          'bg-gradient-to-br from-blue-400/20 to-indigo-500/20 border border-blue-400/30'
                        }`}>
                          <div className={`text-2xl sm:text-3xl ${
                            info.color === 'emerald' ? 'text-emerald-300' :
                            info.color === 'cyan' ? 'text-cyan-300' :
                            info.color === 'purple' ? 'text-purple-300' :
                            'text-blue-300'
                          }`}>{info.icon}</div>
                        </div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2 sm:mb-3 leading-tight">{info.title}</h3>
                        <p className="text-slate-300 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                          {info.description}
                        </p>
                        <div className="space-y-2 mb-4 sm:mb-6">
                          <div className="text-slate-400 text-xs sm:text-sm">
                            {info.count} panels available
                          </div>
                          <div className={`text-xs sm:text-sm font-medium ${
                            info.color === 'emerald' ? 'text-emerald-300' :
                            info.color === 'cyan' ? 'text-cyan-300' :
                            info.color === 'purple' ? 'text-purple-300' :
                            'text-blue-300'
                          }`}>
                            Starting from ${info.minPrice}
                          </div>
                        </div>
                        
                        {/* Status indicator */}
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${
                            info.color === 'emerald' ? 'bg-emerald-400' :
                            info.color === 'cyan' ? 'bg-cyan-400' :
                            info.color === 'purple' ? 'bg-purple-400' :
                            'bg-blue-400'
                          }`}></div>
                          <div className={`text-sm font-medium transition-colors ${
                            info.color === 'emerald' ? 'text-emerald-300 group-hover:text-emerald-200' :
                            info.color === 'cyan' ? 'text-cyan-300 group-hover:text-cyan-200' :
                            info.color === 'purple' ? 'text-purple-300 group-hover:text-purple-200' :
                            'text-blue-300 group-hover:text-blue-200'
                          }`}>
                            Explore Panels
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Stage 2: Panel Comparison */}
            {currentStage === 'panels' && selectedCategory && (
              <motion.div
                key="panels"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-semibold text-white mb-2">
                    {getCategoryInfo(selectedCategory).title} Panels
                  </h2>
                  <p className="text-slate-400">
                    Compare panels to find the right fit for your health goals
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {getCategoryPanels(selectedCategory).map((panel, index) => {
                    const isFlipped = flippedCards.has(panel.id);
                    return (
                      <motion.div
                        key={panel.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="card-flip-container"
                      >
                        <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`}>
                          {/* Front of Card */}
                          <div className="card-face card-face-front backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50 relative overflow-hidden group p-4 sm:p-6 flex flex-col">
                      {/* Color accent border */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                        panel.color === 'emerald' ? 'from-emerald-400 to-green-500' :
                        panel.color === 'cyan' ? 'from-cyan-400 to-blue-500' :
                        panel.color === 'amber' ? 'from-amber-400 to-orange-500' :
                        panel.color === 'blue' ? 'from-blue-400 to-indigo-500' :
                        panel.color === 'rose' ? 'from-rose-400 to-pink-500' :
                        panel.color === 'purple' ? 'from-purple-400 to-pink-500' :
                        'from-teal-400 to-cyan-500'
                      }`}></div>
                      
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        {/* Colored icon background */}
                        <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${
                          panel.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30' :
                          panel.color === 'cyan' ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30' :
                          panel.color === 'amber' ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30' :
                          panel.color === 'blue' ? 'bg-gradient-to-br from-blue-400/20 to-indigo-500/20 border border-blue-400/30' :
                          panel.color === 'rose' ? 'bg-gradient-to-br from-rose-400/20 to-pink-500/20 border border-rose-400/30' :
                          panel.color === 'purple' ? 'bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-purple-400/30' :
                          'bg-gradient-to-br from-teal-400/20 to-cyan-500/20 border border-teal-400/30'
                        }`}>
                          <div className={`text-lg sm:text-xl ${
                            panel.color === 'emerald' ? 'text-emerald-300' :
                            panel.color === 'cyan' ? 'text-cyan-300' :
                            panel.color === 'amber' ? 'text-amber-300' :
                            panel.color === 'blue' ? 'text-blue-300' :
                            panel.color === 'rose' ? 'text-rose-300' :
                            panel.color === 'purple' ? 'text-purple-300' :
                            'text-teal-300'
                          }`}>{panel.icon}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-xl sm:text-2xl font-bold font-mono mb-1 ${
                            panel.color === 'emerald' ? 'text-emerald-300' :
                            panel.color === 'cyan' ? 'text-cyan-300' :
                            panel.color === 'amber' ? 'text-amber-300' :
                            panel.color === 'blue' ? 'text-blue-300' :
                            panel.color === 'rose' ? 'text-rose-300' :
                            panel.color === 'purple' ? 'text-purple-300' :
                            'text-teal-300'
                          }`}>{panel.price}</div>
                          <div className="text-xs text-slate-400">{panel.testCount} tests</div>
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 leading-tight">{panel.name}</h3>
                        <p className="text-slate-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-3">
                          {panel.description}
                        </p>
                        
                        <div className="mb-2 sm:mb-3">
                          <div className="text-xs text-slate-400 mb-1">Best for:</div>
                          <div className="text-xs sm:text-sm text-slate-200 font-medium">{panel.bestFor}</div>
                        </div>
                        
                        <div className="mb-3 sm:mb-4">
                          <div className="text-xs text-slate-400 mb-1">Key areas tested:</div>
                          <div className="space-y-1">
                            {panel.keyTests.slice(0, 2).map((test, i) => (
                              <div key={i} className="text-xs text-slate-300">{test}</div>
                            ))}
                            {panel.keyTests.length > 2 && (
                              <div className="text-xs text-slate-400">+{panel.keyTests.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3 mt-auto">
                              <button 
                                onClick={() => handleAddToCart(panel)}
                                disabled={isLoadingSwell || !panel.swellId}
                                className={`w-full px-4 py-2 sm:py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg text-white text-sm sm:text-base min-h-[40px] sm:min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed ${
                                  panel.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 hover:shadow-emerald-500/25' :
                                  panel.color === 'cyan' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25' :
                                  panel.color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:shadow-amber-500/25' :
                                  panel.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 hover:shadow-blue-500/25' :
                                  panel.color === 'rose' ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 hover:shadow-rose-500/25' :
                                  panel.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 hover:shadow-purple-500/25' :
                                  'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 hover:shadow-teal-500/25'
                                }`}
                              >
                                {isLoadingSwell ? 'Loading...' : panel.swellId ? 'Add to Cart' : 'Order Panel'}
                              </button>
                              <button 
                                onClick={() => toggleCardFlip(panel.id)}
                                className={`w-full px-4 py-2 text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[36px] ${
                                  panel.color === 'emerald' ? 'text-emerald-300 hover:text-emerald-200' :
                                  panel.color === 'cyan' ? 'text-cyan-300 hover:text-cyan-200' :
                                  panel.color === 'amber' ? 'text-amber-300 hover:text-amber-200' :
                                  panel.color === 'blue' ? 'text-blue-300 hover:text-blue-200' :
                                  panel.color === 'rose' ? 'text-rose-300 hover:text-rose-200' :
                                  panel.color === 'purple' ? 'text-purple-300 hover:text-purple-200' :
                                  'text-teal-300 hover:text-teal-200'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  panel.color === 'emerald' ? 'bg-emerald-400' :
                                  panel.color === 'cyan' ? 'bg-cyan-400' :
                                  panel.color === 'amber' ? 'bg-amber-400' :
                                  panel.color === 'blue' ? 'bg-blue-400' :
                                  panel.color === 'rose' ? 'bg-rose-400' :
                                  panel.color === 'purple' ? 'bg-purple-400' :
                                  'bg-teal-400'
                                }`}></div>
                                View Full Details
                              </button>
                            </div>
                          </div>

                          {/* Back of Card */}
                          <div className="card-face card-face-back backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50 relative overflow-hidden group p-4 sm:p-6 flex flex-col">
                            {/* Color accent border */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                              panel.color === 'emerald' ? 'from-emerald-400 to-green-500' :
                              panel.color === 'cyan' ? 'from-cyan-400 to-blue-500' :
                              panel.color === 'amber' ? 'from-amber-400 to-orange-500' :
                              panel.color === 'blue' ? 'from-blue-400 to-indigo-500' :
                              panel.color === 'rose' ? 'from-rose-400 to-pink-500' :
                              panel.color === 'purple' ? 'from-purple-400 to-pink-500' :
                              'from-teal-400 to-cyan-500'
                            }`}></div>
                            
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${
                                  panel.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30' :
                                  panel.color === 'cyan' ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30' :
                                  panel.color === 'amber' ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30' :
                                  panel.color === 'blue' ? 'bg-gradient-to-br from-blue-400/20 to-indigo-500/20 border border-blue-400/30' :
                                  panel.color === 'rose' ? 'bg-gradient-to-br from-rose-400/20 to-pink-500/20 border border-rose-400/30' :
                                  panel.color === 'purple' ? 'bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-purple-400/30' :
                                  'bg-gradient-to-br from-teal-400/20 to-cyan-500/20 border border-teal-400/30'
                                }`}>
                                  <div className={`text-base sm:text-lg ${
                                    panel.color === 'emerald' ? 'text-emerald-300' :
                                    panel.color === 'cyan' ? 'text-cyan-300' :
                                    panel.color === 'amber' ? 'text-amber-300' :
                                    panel.color === 'blue' ? 'text-blue-300' :
                                    panel.color === 'rose' ? 'text-rose-300' :
                                    panel.color === 'purple' ? 'text-purple-300' :
                                    'text-teal-300'
                                  }`}>{panel.icon}</div>
                                </div>
                                <div>
                                  <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">{panel.name}</h3>
                                  <div className="text-slate-400 text-xs">Complete Test Breakdown</div>
                                </div>
                              </div>
                              <div className={`text-lg sm:text-xl font-bold font-mono ${
                                panel.color === 'emerald' ? 'text-emerald-300' :
                                panel.color === 'cyan' ? 'text-cyan-300' :
                                panel.color === 'amber' ? 'text-amber-300' :
                                panel.color === 'blue' ? 'text-blue-300' :
                                panel.color === 'rose' ? 'text-rose-300' :
                                panel.color === 'purple' ? 'text-purple-300' :
                                'text-teal-300'
                              }`}>{panel.price}</div>
                            </div>
                            
                            {/* Detailed Tests */}
                            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-40 sm:max-h-52 overflow-y-auto">
                              {panel.detailedTests.map((testGroup, index) => (
                                <div key={index}>
                                  <h4 className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 flex items-center gap-2 ${
                                    panel.color === 'emerald' ? 'text-emerald-300' :
                                    panel.color === 'cyan' ? 'text-cyan-300' :
                                    panel.color === 'amber' ? 'text-amber-300' :
                                    panel.color === 'blue' ? 'text-blue-300' :
                                    panel.color === 'rose' ? 'text-rose-300' :
                                    panel.color === 'purple' ? 'text-purple-300' :
                                    'text-teal-300'
                                  }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                      panel.color === 'emerald' ? 'bg-emerald-400' :
                                      panel.color === 'cyan' ? 'bg-cyan-400' :
                                      panel.color === 'amber' ? 'bg-amber-400' :
                                      panel.color === 'blue' ? 'bg-blue-400' :
                                      panel.color === 'rose' ? 'bg-rose-400' :
                                      panel.color === 'purple' ? 'bg-purple-400' :
                                      'bg-teal-400'
                                    }`}></div>
                                    {testGroup.category}
                                  </h4>
                                  <div className="space-y-1 ml-3 sm:ml-4">
                                    {testGroup.tests.slice(0, 3).map((test, i) => (
                                      <div key={i} className="flex justify-between text-xs">
                                        <span className="text-slate-300 truncate pr-2">{test.name}</span>
                                        <span className="text-slate-400 text-xs flex-shrink-0">{test.purpose}</span>
                                      </div>
                                    ))}
                                    {testGroup.tests.length > 3 && (
                                      <div className="text-xs text-slate-400 italic">+{testGroup.tests.length - 3} more tests</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Bottom Actions */}
                            <div className="mt-auto space-y-2 sm:space-y-3">
                              <button 
                                className={`w-full px-4 py-2 sm:py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg text-white text-sm sm:text-base min-h-[40px] sm:min-h-[48px] ${
                                  panel.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 hover:shadow-emerald-500/25' :
                                  panel.color === 'cyan' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25' :
                                  panel.color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:shadow-amber-500/25' :
                                  panel.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 hover:shadow-blue-500/25' :
                                  panel.color === 'rose' ? 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 hover:shadow-rose-500/25' :
                                  panel.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 hover:shadow-purple-500/25' :
                                  'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 hover:shadow-teal-500/25'
                                }`}
                              >
                                Order {panel.name}
                              </button>
                              <button 
                                onClick={() => toggleCardFlip(panel.id)}
                                className={`w-full px-4 py-2 text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 min-h-[36px] ${
                                  panel.color === 'emerald' ? 'text-emerald-300 hover:text-emerald-200' :
                                  panel.color === 'cyan' ? 'text-cyan-300 hover:text-cyan-200' :
                                  panel.color === 'amber' ? 'text-amber-300 hover:text-amber-200' :
                                  panel.color === 'blue' ? 'text-blue-300 hover:text-blue-200' :
                                  panel.color === 'rose' ? 'text-rose-300 hover:text-rose-200' :
                                  panel.color === 'purple' ? 'text-purple-300 hover:text-purple-200' :
                                  'text-teal-300 hover:text-teal-200'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  panel.color === 'emerald' ? 'bg-emerald-400' :
                                  panel.color === 'cyan' ? 'bg-cyan-400' :
                                  panel.color === 'amber' ? 'bg-amber-400' :
                                  panel.color === 'blue' ? 'bg-blue-400' :
                                  panel.color === 'rose' ? 'bg-rose-400' :
                                  panel.color === 'purple' ? 'bg-purple-400' :
                                  'bg-teal-400'
                                }`}></div>
                                Back to Summary
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-300">Loading diagnostic panels...</div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}