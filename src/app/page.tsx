'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Bell,
  FolderOpen,
  DollarSign,
  Car,
  Hammer,
  UtensilsCrossed,
  Settings,
  Users,
} from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { DashboardCard } from '@/components/DashboardCard'
import { useAuth } from '@/contexts/AuthContext'
import { useFamily } from '@/contexts/FamilyContext'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  groceriesNeeded: number
  remindersToday: number
  unpaidBills: number
  activeProjects: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { family, currentMember, loading: familyLoading } = useFamily()
  const [stats, setStats] = useState<Stats>({
    groceriesNeeded: 0,
    remindersToday: 0,
    unpaidBills: 0,
    activeProjects: 0,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!familyLoading && !currentMember && user) {
      router.push('/onboarding')
    }
  }, [familyLoading, currentMember, user, router])

  useEffect(() => {
    if (!family) return

    async function fetchStats() {
      if (!family) return
      const today = new Date()
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)

      const [groceries, reminders, bills, projects] = await Promise.all([
        supabase
          .from('grocery_items')
          .select('id', { count: 'exact', head: true })
          .eq('family_id', family.id)
          .eq('completed', false),
        supabase
          .from('reminders')
          .select('id', { count: 'exact', head: true })
          .eq('family_id', family.id)
          .eq('completed', false)
          .lte('due_date', todayEnd.toISOString()),
        supabase
          .from('bills')
          .select('id', { count: 'exact', head: true })
          .eq('family_id', family.id)
          .eq('paid', false),
        supabase
          .from('home_projects')
          .select('id', { count: 'exact', head: true })
          .eq('family_id', family.id)
          .neq('status', 'completed'),
      ])

      setStats({
        groceriesNeeded: groceries.count ?? 0,
        remindersToday: reminders.count ?? 0,
        unpaidBills: bills.count ?? 0,
        activeProjects: projects.count ?? 0,
      })
    }

    fetchStats()
  }, [family]) // eslint-disable-line react-hooks/exhaustive-deps

  if (familyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!currentMember || !family) {
    return null
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500">{greeting()},</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentMember.display_name}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{family.name}</p>
        </div>

        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Overview
          </h2>
          <div className="space-y-2.5">
            <DashboardCard
              title="Grocery Items Needed"
              value={stats.groceriesNeeded}
              href="/groceries"
              icon={ShoppingCart}
              accent="green"
              subtitle="Items still needed"
            />
            <DashboardCard
              title="Reminders Due Today"
              value={stats.remindersToday}
              href="/reminders"
              icon={Bell}
              accent={stats.remindersToday > 0 ? 'yellow' : 'blue'}
              subtitle="Pending reminders"
            />
            {currentMember.role !== 'child' && (
              <DashboardCard
                title="Unpaid Bills"
                value={stats.unpaidBills}
                href="/bills"
                icon={DollarSign}
                accent={stats.unpaidBills > 0 ? 'red' : 'blue'}
                subtitle="Bills to pay"
              />
            )}
            <DashboardCard
              title="Active Projects"
              value={stats.activeProjects}
              href="/home-projects"
              icon={Hammer}
              accent="orange"
              subtitle="In progress or planned"
            />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Access
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { href: '/uploads', label: 'Uploads', icon: FolderOpen, color: 'bg-blue-50 text-blue-600' },
              { href: '/meals', label: 'Meals', icon: UtensilsCrossed, color: 'bg-green-50 text-green-600' },
              { href: '/vehicles', label: 'Vehicles', icon: Car, color: 'bg-orange-50 text-orange-600' },
              { href: '/home-projects', label: 'Projects', icon: Hammer, color: 'bg-yellow-50 text-yellow-600' },
              { href: '/settings', label: 'Family', icon: Users, color: 'bg-purple-50 text-purple-600' },
              { href: '/settings', label: 'Settings', icon: Settings, color: 'bg-gray-100 text-gray-600' },
            ].map(({ href, label, icon: Icon, color }) => (
              <a
                key={label}
                href={href}
                className="bg-white rounded-xl border border-gray-100 p-3.5 flex flex-col items-center gap-2 active:scale-95"
              >
                <div className={`${color} rounded-xl p-2.5`}>
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
