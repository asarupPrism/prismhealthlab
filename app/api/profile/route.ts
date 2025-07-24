import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist, create a basic one
        const newProfile = {
          user_id: user.id,
          email: user.email!,
          first_name: null,
          last_name: null,
        }
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single()
        
        if (createError) {
          return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
          )
        }
        
        return NextResponse.json(createdProfile)
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const updates = await request.json() as Partial<Profile>
    
    // Remove fields that shouldn't be updated directly
    const cleanUpdates = { ...updates }
    delete (cleanUpdates as Record<string, unknown>).id
    delete (cleanUpdates as Record<string, unknown>).user_id
    delete (cleanUpdates as Record<string, unknown>).created_at
    
    // Add updated timestamp
    cleanUpdates.updated_at = new Date().toISOString()
    
    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(cleanUpdates)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}