/**
 * Database Fallback System
 * 
 * Provides mock data and offline capabilities when Supabase is unavailable
 * ensuring the application remains functional with degraded database features.
 */

import { isServiceEnabled, shouldUseFallback } from '../deployment-config';

export interface MockProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface MockTestResult {
  id: string;
  user_id: string;
  test_name: string;
  test_category: string;
  status: 'pending' | 'completed' | 'failed';
  results: Record<string, unknown> | null;
  ordered_at: string;
  completed_at: string | null;
  price: number;
}

export interface MockAppointment {
  id: string;
  user_id: string;
  location_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

class DatabaseFallbackService {
  private mockData: {
    profiles: MockProfile[];
    testResults: MockTestResult[];
    appointments: MockAppointment[];
  };

  constructor() {
    this.mockData = this.initializeMockData();
  }

  private initializeMockData() {
    const currentDate = new Date().toISOString();
    const userId = 'mock-user-123';

    return {
      profiles: [
        {
          id: userId,
          email: 'demo@prismhealthlab.com',
          full_name: 'Demo Patient',
          created_at: currentDate,
          updated_at: currentDate
        }
      ],
      testResults: [
        {
          id: 'result-1',
          user_id: userId,
          test_name: 'Complete Blood Count',
          test_category: 'routine',
          status: 'completed' as const,
          results: {
            white_blood_cells: { value: 7.2, unit: 'K/uL', range: '4.0-11.0', status: 'normal' },
            red_blood_cells: { value: 4.5, unit: 'M/uL', range: '4.2-5.4', status: 'normal' },
            hemoglobin: { value: 14.1, unit: 'g/dL', range: '12.0-16.0', status: 'normal' },
            platelets: { value: 280, unit: 'K/uL', range: '150-450', status: 'normal' }
          },
          ordered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          price: 59
        },
        {
          id: 'result-2',
          user_id: userId,
          test_name: 'Hormone Panel',
          test_category: 'hormones',
          status: 'completed' as const,
          results: {
            testosterone: { value: 650, unit: 'ng/dL', range: '300-1000', status: 'normal' },
            cortisol: { value: 12.5, unit: 'ug/dL', range: '6.2-19.4', status: 'normal' },
            thyroid_tsh: { value: 2.1, unit: 'mIU/L', range: '0.4-4.0', status: 'normal' }
          },
          ordered_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          price: 89
        },
        {
          id: 'result-3',
          user_id: userId,
          test_name: 'Comprehensive Metabolic Panel',
          test_category: 'comprehensive',
          status: 'pending' as const,
          results: null,
          ordered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
          price: 119
        }
      ],
      appointments: [
        {
          id: 'appt-1',
          user_id: userId,
          location_id: 'loc-downtown',
          appointment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          appointment_time: '09:00',
          status: 'scheduled' as const,
          created_at: currentDate
        }
      ]
    };
  }

  // Profile Management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProfile(_userId?: string): Promise<MockProfile | null> {
    if (!shouldUseFallback('database')) {
      throw new Error('Database service is available - use real implementation');
    }

    // Simulate network delay
    await this.simulateDelay();
    
    return this.mockData.profiles[0] || null;
  }

  async updateProfile(userId: string, updates: Partial<MockProfile>): Promise<MockProfile> {
    if (!shouldUseFallback('database')) {
      throw new Error('Database service is available - use real implementation');
    }

    await this.simulateDelay();
    
    const profile = this.mockData.profiles[0];
    if (profile) {
      Object.assign(profile, updates, { updated_at: new Date().toISOString() });
    }
    
    return profile;
  }

  // Test Results Management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTestResults(_userId?: string): Promise<MockTestResult[]> {
    if (!shouldUseFallback('database')) {
      throw new Error('Database service is available - use real implementation');
    }

    await this.simulateDelay();
    return [...this.mockData.testResults];
  }

  async getTestResult(resultId: string): Promise<MockTestResult | null> {
    if (!shouldUseFallback('database')) {
      throw new Error('Database service is available - use real implementation');
    }

    await this.simulateDelay();
    return this.mockData.testResults.find(r => r.id === resultId) || null;
  }

  async addTestOrder(testData: Partial<MockTestResult>): Promise<MockTestResult> {
    if (!shouldUseFallback('database')) {
      throw new Error('Database service is available - use real implementation');
    }

    await this.simulateDelay();
    
    const newResult: MockTestResult = {
      id: `result-${Date.now()}`,
      user_id: testData.user_id || 'mock-user-123',
      test_name: testData.test_name || 'Unknown Test',
      test_category: testData.test_category || 'other',
      status: 'pending' as const,
      results: null,
      ordered_at: new Date().toISOString(),
      completed_at: null,
      price: testData.price || 99
    };

    this.mockData.testResults.unshift(newResult);
    return newResult;
  }

  // Appointments Management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAppointments(_userId?: string): Promise<MockAppointment[]> {
    if (!shouldUseFallback('database')) {
      throw new Error('Database service is available - use real implementation');
    }

    await this.simulateDelay();
    return [...this.mockData.appointments];
  }

  async createAppointment(appointmentData: Partial<MockAppointment>): Promise<MockAppointment> {
    if (!shouldUseFallback('database')) {
      throw new Error('Database service is available - use real implementation');
    }

    await this.simulateDelay();
    
    const newAppointment: MockAppointment = {
      id: `appt-${Date.now()}`,
      user_id: appointmentData.user_id || 'mock-user-123',
      location_id: appointmentData.location_id || 'loc-downtown',
      appointment_date: appointmentData.appointment_date || new Date().toISOString().split('T')[0],
      appointment_time: appointmentData.appointment_time || '09:00',
      status: 'scheduled' as const,
      created_at: new Date().toISOString()
    };

    this.mockData.appointments.push(newAppointment);
    return newAppointment;
  }

  async updateAppointment(appointmentId: string, updates: Partial<MockAppointment>): Promise<MockAppointment | null> {
    if (!shouldUseFallback('database')) {
      throw new Error('Database service is available - use real implementation');
    }

    await this.simulateDelay();
    
    const appointment = this.mockData.appointments.find(a => a.id === appointmentId);
    if (appointment) {
      Object.assign(appointment, updates);
    }
    
    return appointment || null;
  }

  // Analytics and Insights
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getHealthInsights(_userId?: string): Promise<unknown> {
    if (!shouldUseFallback('database')) {
      throw new Error('Database service is available - use real implementation');
    }

    await this.simulateDelay();
    
    const results = this.mockData.testResults.filter(r => r.status === 'completed');
    
    return {
      totalTests: results.length,
      recentTests: results.slice(0, 3),
      healthScore: 85,
      trends: {
        improving: ['white_blood_cells', 'hemoglobin'],
        stable: ['platelets', 'thyroid_tsh'],
        monitoring: ['cortisol']
      },
      recommendations: [
        'Continue current exercise routine',
        'Consider vitamin D supplementation',
        'Schedule follow-up hormone panel in 3 months'
      ]
    };
  }

  // Utility Methods
  private async simulateDelay(ms: number = 100): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  public isUsingFallback(): boolean {
    return shouldUseFallback('database');
  }

  public getFallbackStatus() {
    return {
      active: this.isUsingFallback(),
      reason: isServiceEnabled('database') ? 'Service temporarily unavailable' : 'Service not configured',
      capabilities: [
        'View mock test results',
        'Browse sample health data',
        'Test appointment scheduling',
        'Explore UI functionality'
      ],
      limitations: [
        'Data is not persistent',
        'Real user accounts unavailable',
        'Payment processing disabled',
        'Email notifications disabled'
      ]
    };
  }
}

// Global instance
const databaseFallback = new DatabaseFallbackService();

export default databaseFallback;