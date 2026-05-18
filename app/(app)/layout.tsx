'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AuthProvider, useAuth } from '@/lib/context/AuthContext'

function Sidebar() {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/ideas', label: 'Idea Vault', icon: '💡' },
    { href: '/calendar', label: 'Calendar', icon: '📅' },
    { href: '/posts', label: 'Posts', icon: '🎬' },
    { href: '/insights', label: 'Insights', icon: '📊' },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar-desktop" style={{ width: '220px', minHeight: '100vh', background: 'var(--tt-card)', borderRight: '1px solid var(--tt-border)', flexDirection: 'column', padding: '20px 12px', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '4px 8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--tt-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✈️</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px' }} className="gradient-text">PostPilot</span>
        </Link>

        {profile && (
          <div style={{ marginBottom: '20px', padding: '10px 12px', background: 'var(--tt-card2)', borderRadius: '10px', border: '1px solid var(--tt-border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--tt-muted)', marginBottom: '2px' }}>Creator</div>
            <div style={{ fontWeight: 600, fontSize: '14px', fontFamily: 'Syne, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.display_name}</div>
            {profile.current_follower_count > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--tt-muted)', marginTop: '2px' }}>{profile.current_follower_count.toLocaleString()} followers</div>
            )}
          </div>
        )}

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {nav.map(item => (
            <Link key={item.href} href={item.href} className={`nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--tt-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '16px' }}>⚙️</span> Settings
          </Link>
          <button className="nav-item" onClick={handleSignOut}>
            <span style={{ fontSize: '16px' }}>👋</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {nav.map(item => (
          <Link key={item.href} href={item.href} className={pathname.startsWith(item.href) ? 'active' : ''}>
            <span className="icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <Link href="/settings" className={pathname === '/settings' ? 'active' : ''}>
          <span className="icon">⚙️</span>
          Settings
        </Link>
      </nav>
    </>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--tt-dark)' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700 }} className="gradient-text">PostPilot</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, overflow: 'auto', padding: '32px', background: 'var(--tt-dark)' }}>
        {children}
      </main>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
