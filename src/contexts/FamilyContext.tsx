'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'
import type { Family, FamilyMember } from '@/types/database'

interface FamilyContextValue {
  family: Family | null
  members: FamilyMember[]
  currentMember: FamilyMember | null
  loading: boolean
  refetch: () => Promise<void>
}

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [family, setFamily] = useState<Family | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchFamily = useCallback(async () => {
    if (!user) {
      setFamily(null)
      setMembers([])
      setCurrentMember(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data: memberData } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!memberData) {
        setLoading(false)
        return
      }

      setCurrentMember(memberData)

      const { data: familyData } = await supabase
        .from('families')
        .select('*')
        .eq('id', memberData.family_id)
        .single()

      setFamily(familyData ?? null)

      const { data: allMembers } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', memberData.family_id)
        .order('display_name')

      setMembers(allMembers ?? [])
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchFamily()
  }, [fetchFamily])

  return (
    <FamilyContext.Provider
      value={{
        family,
        members,
        currentMember,
        loading,
        refetch: fetchFamily,
      }}
    >
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider')
  return ctx
}
