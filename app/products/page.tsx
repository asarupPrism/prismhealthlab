'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
          { name: 'Comprehensive Metabolic Panel (CMP)', purpose: 'General health' },
          { name: 'Lipid Panel', purpose: 'Heart health' }
        ]
      }
    ]
  },
  {
    id: 'longevity-wellness',
    name: 'Longevity & Wellness',
    price: '$119',
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
          { name: 'Comprehensive Metabolic Panel (CMP)', purpose: 'Kidney function' },
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
    price: '$89',
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
          { name: 'Comprehensive Metabolic Panel (CMP)', purpose: 'Organ function' },
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
    price: '$89',
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
    price: '$99',
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
          { name: 'Comprehensive Metabolic Panel (CMP)', purpose: 'General health' },
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
    price: '$129',
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
          { name: 'Comprehensive Metabolic Panel (CMP)', purpose: 'General health' },
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
    name: 'Sexual Health Panel (Standalone)',
    price: '$119',
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

export default function ProductsPage() {
  const [currentStage, setCurrentStage] = useState<Stage>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [showPanelDetail, setShowPanelDetail] = useState(false);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showPanelDetail) {
          setShowPanelDetail(false);
        } else if (currentStage === 'panels') {
          setCurrentStage('categories');
          setSelectedCategory(null);
          setSelectedPanel(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPanelDetail, currentStage]);

  const getCategoryPanels = (category: Category) => {
    return panels.filter(panel => panel.category === category);
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
      {/* Simplified Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-6 leading-tight"
          >
            Diagnostic Testing Panels
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-300 font-light max-w-2xl mx-auto mb-8"
          >
            Get comprehensive health insights with our curated testing panels designed for modern healthcare needs.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-slate-400 mb-12"
          >
            CLIA-certified labs • 2-3 day results • Save 50-70% vs traditional labs
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Persistent Breadcrumb Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-6">
            <button 
              onClick={() => {
                setCurrentStage('categories');
                setSelectedCategory(null);
                setSelectedPanel(null);
              }}
              className={`hover:text-slate-200 transition-colors ${
                currentStage === 'categories' ? 'text-cyan-300 font-medium' : ''
              }`}
            >
              Diagnostic Panels
            </button>
            {selectedCategory && (
              <>
                <span className="text-slate-600">→</span>
                <button 
                  onClick={() => {
                    setCurrentStage('panels');
                    setSelectedPanel(null);
                  }}
                  className={`hover:text-slate-200 transition-colors ${
                    currentStage === 'panels' ? 'text-cyan-300 font-medium' : ''
                  }`}
                >
                  {getCategoryInfo(selectedCategory).title}
                </button>
              </>
            )}
            {selectedPanel && (
              <>
                <span className="text-slate-600">→</span>
                <span className="text-cyan-300 font-medium">{selectedPanel.name}</span>
              </>
            )}
          </nav>
          
          {/* Category Tabs - Persistent when category is selected */}
          {selectedCategory && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-wrap gap-3 mb-8"
            >
              {(['performance', 'wellness', 'hormones', 'comprehensive'] as Category[]).map((category) => {
                const info = getCategoryInfo(category);
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentStage('panels');
                      setSelectedPanel(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
                        className={`cursor-pointer backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50 text-center group`}
                      >
                        <div className="text-5xl mb-6">{info.icon}</div>
                        <h3 className="text-2xl font-semibold text-white mb-3">{info.title}</h3>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                          {info.description}
                        </p>
                        <div className="space-y-2 mb-6">
                          <div className="text-slate-400 text-sm">
                            {info.count} panels available
                          </div>
                          <div className="text-slate-400 text-sm">
                            Starting from ${info.minPrice}
                          </div>
                        </div>
                        <div className="text-cyan-300 text-sm font-medium group-hover:text-cyan-200 transition-colors">
                          Explore Panels →
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {getCategoryPanels(selectedCategory).map((panel, index) => (
                    <motion.div
                      key={panel.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-2xl">{panel.icon}</div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white font-mono">{panel.price}</div>
                          <div className="text-xs text-slate-400">{panel.testCount} tests</div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">{panel.name}</h3>
                      <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                        {panel.description}
                      </p>
                      
                      <div className="mb-4">
                        <div className="text-xs text-slate-400 mb-2">Best for:</div>
                        <div className="text-sm text-slate-200 font-medium">{panel.bestFor}</div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-xs text-slate-400 mb-2">Key areas tested:</div>
                        <div className="space-y-1">
                          {panel.keyTests.map((test, i) => (
                            <div key={i} className="text-xs text-slate-300">{test}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <button 
                          className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg"
                        >
                          Order Panel
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedPanel(panel);
                            setShowPanelDetail(true);
                          }}
                          className="w-full px-4 py-2 text-slate-300 text-sm hover:text-slate-200 transition-colors"
                        >
                          View Full Details →
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel Detail Modal - Separate overlay */}
        <AnimatePresence>
          {showPanelDetail && selectedPanel && (
            <motion.div
              key="detail-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowPanelDetail(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="backdrop-blur-lg bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{selectedPanel.icon}</div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{selectedPanel.name}</h3>
                      <div className="text-slate-400">Complete Test Breakdown</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPanelDetail(false)}
                    className="text-slate-400 hover:text-white transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-6">
                  {selectedPanel.detailedTests.map((testGroup, index) => (
                    <div key={index}>
                      <h4 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        {testGroup.category}
                      </h4>
                      <div className="space-y-2 ml-4">
                        {testGroup.tests.map((test, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-300">{test.name}</span>
                            <span className="text-slate-400">{test.purpose}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-white font-mono">{selectedPanel.price}</div>
                    <div className="text-slate-400 text-sm">{selectedPanel.testCount} comprehensive tests</div>
                  </div>
                  <button 
                    className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg text-lg"
                  >
                    Order {selectedPanel.name}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}