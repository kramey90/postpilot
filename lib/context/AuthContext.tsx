'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { CreatorProfile } from '@/lib/types'

interface AuthCtx {
  user: User | null
  profile: CreatorProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  patchProfile: (updated: CreatorProfile) => void
}

const AuthContext = createContext<AuthCtx>({ user: null, profile: null, loading: true, signOut: async () => {}, refreshProfile: async () => {}, patchProfile: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (u: User) => {
    try {
      const supabase = createClient()
      // Try to get existing profile
      const { data: existing } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', u.id)
        .maybeSingle()

      if (existing) {
        setProfile(existing)
        return
      }

      // Create profile if none exists
      const displayName = u.user_metadata?.display_name || u.email?.split('@')[0] || 'Creator'
      const { data: created } = await supabase
        .from('creator_profiles')
        .insert({ user_id: u.id, display_name: displayName, current_follower_count: 0 })
        .select()
        .single()

      setProfile(created)
    } catch (e) {
      console.error('Profile load error:', e)
    }
  }

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await loadProfile(user)
  }

  const patchProfile = (updated: CreatorProfile) => {
    setProfile(updated)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, patchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)