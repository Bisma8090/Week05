'use client';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Bell, Star, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const notifications = useAppSelector((s) => s.notifications.items);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowMenu(false);
    setMobileOpen(false);
    router.push('/');
  };

  const navLinks: [string, string][] = [
    ['/', 'Home'],
    ['/auctions', 'Car Auction'],
    ['/sell', 'Sell Your Car'],
    ['/about', 'About us'],
    ['/contact', 'Contact'],
  ];

  return (
    <header style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-inner">
          <span className="topbar-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            Call Us &nbsp; 570-694-4002
          </span>
          <span className="topbar-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Email Id :&nbsp;<span style={{ color: '#f5c518' }}>info@cardeposit.com</span>
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="main-nav">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <img src="/mainlogo.png" alt="CarDeposit" className="nav-logo-img" />
          </Link>

          {/* Desktop nav links */}
          <div className="desktop-nav">
            {navLinks.map(([href, label]) => {
              const active = pathname === href;
              return (
                <Link key={label} href={href} className={`nav-link${active ? ' nav-link-active' : ''}`}>{label}</Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="nav-right">
            {/* Wishlist */}
            <Link href="/profile?tab=wishlist" className="icon-btn" title="Wishlist">
              <Star size={19} color="#1e2d6b" />
            </Link>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowNotif(!showNotif)} className="icon-btn" style={{ position: 'relative' }}>
                <Bell size={19} color="#1e2d6b" />
                {mounted && notifications.length > 0 && (
                  <span className="notif-badge">{notifications.length > 9 ? '9+' : notifications.length}</span>
                )}
              </button>
              {showNotif && (
                <div className="dropdown-panel" style={{ width: 300 }}>
                  <div className="dropdown-header">Notifications</div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.length === 0
                      ? <p style={{ padding: 14, color: '#9ca3af', fontSize: 13 }}>No notifications</p>
                      : notifications.map((n) => (
                        <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid #f9fafb', fontSize: 13, color: '#374151' }}>🔔 {n.message}</div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auth */}
            {mounted && isAuthenticated ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setShowMenu(!showMenu)} className="user-btn">
                  <span className="user-avatar">{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>
                  <ChevronDown size={14} color="#1e2d6b" />
                </button>
                {showMenu && (
                  <div className="dropdown-panel" style={{ width: 190 }}>
                    {([
                      ['/profile', 'My Profile'],
                      ['/profile?tab=my-cars', 'My Cars'],
                      ['/profile?tab=my-bids', 'My Bids'],
                      ['/profile?tab=wishlist', 'Wishlist'],
                    ] as [string, string][]).map(([href, label]) => (
                      <Link key={label} href={href} onClick={() => setShowMenu(false)} className="dropdown-item">{label}</Link>
                    ))}
                    <button onClick={handleLogout} className="dropdown-item" style={{ color: '#e53e3e', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              mounted && (
                <div className="auth-btns">
                  <Link href="/auth/login" className="signin-btn">Sign in</Link>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>or</span>
                  <Link href="/auth/register" className="register-btn">Register now</Link>
                </div>
              )
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="hamburger">
              {mobileOpen ? <X size={22} color="#1e2d6b" /> : <Menu size={22} color="#1e2d6b" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            {navLinks.map(([href, label]) => (
              <Link key={label} href={href} onClick={() => setMobileOpen(false)} className="mobile-link">{label}</Link>
            ))}
            {mounted && !isAuthenticated && (
              <div style={{ display: 'flex', gap: 8, padding: '8px 16px' }}>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="mobile-signin">Sign in</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="mobile-register">Register now</Link>
              </div>
            )}
            {mounted && isAuthenticated && (
              <button onClick={handleLogout} className="mobile-link" style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                Logout
              </button>
            )}
          </div>
        )}
      </nav>

      <style>{`
        .topbar { background: #1e2d6b; color: #fff; font-size: 12px; padding: 7px 0; }
        .topbar-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
        .topbar-item { display: flex; align-items: center; gap: 6px; }
        .main-nav { background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
        .nav-logo-img { height: 42px; width: auto; object-fit: contain; border-radius: 6px; }
        .logo-text { font-size: 20px; font-weight: 800; color: #1e2d6b; letter-spacing: -0.5px; }
        .desktop-nav { display: flex; align-items: center; gap: 28px; }
        .nav-link { color: #374151; text-decoration: none; font-size: 14px; font-weight: 500; padding-bottom: 4px; border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s; white-space: nowrap; }
        .nav-link:hover { color: #1e2d6b; }
        .nav-link-active { color: #1e2d6b; font-weight: 700; border-bottom: 2px solid #f5c518; }
        .nav-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .icon-btn { background: none; border: none; cursor: pointer; padding: 7px; border-radius: 6px; display: flex; align-items: center; text-decoration: none; transition: background 0.15s; }
        .icon-btn:hover { background: #f3f4f6; }
        .notif-badge { position: absolute; top: 2px; right: 2px; background: #e53e3e; color: #fff; font-size: 9px; font-weight: 700; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; }
        .dropdown-panel { position: absolute; right: 0; top: calc(100% + 6px); background: #fff; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 200; border: 1px solid #e5e7eb; overflow: hidden; }
        .dropdown-header { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; font-weight: 700; color: #1e2d6b; font-size: 14px; }
        .dropdown-item { display: block; padding: 10px 14px; color: #1e2d6b; text-decoration: none; font-size: 13px; border-bottom: 1px solid #f3f4f6; transition: background 0.15s; }
        .dropdown-item:hover { background: #eef2ff; }
        .user-btn { background: none; border: 1px solid #d1d9f0; cursor: pointer; padding: 4px 10px; border-radius: 8px; display: flex; align-items: center; gap: 6px; }
        .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: #1e2d6b; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .auth-btns { display: flex; align-items: center; gap: 6px; }
        .signin-btn { padding: 7px 14px; color: #374151; text-decoration: none; font-size: 13px; font-weight: 500; }
        .register-btn { padding: 7px 18px; background: #1e2d6b; color: #fff; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; white-space: nowrap; }
        .hamburger { background: none; border: none; cursor: pointer; padding: 6px; display: none; }
        .mobile-menu { background: #fff; border-top: 1px solid #e5e7eb; padding: 8px 0; display: flex; flex-direction: column; }
        .mobile-link { padding: 11px 20px; color: #1e2d6b; text-decoration: none; font-size: 14px; font-weight: 500; display: block; }
        .mobile-link:hover { background: #f3f4f6; }
        .mobile-signin { padding: 8px 16px; border: 1.5px solid #1e2d6b; color: #1e2d6b; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; }
        .mobile-register { padding: 8px 16px; background: #1e2d6b; color: #fff; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .auth-btns { display: none !important; }
          .hamburger { display: flex !important; }
        }
        @media (max-width: 480px) {
          .topbar-inner { flex-direction: column; gap: 4px; text-align: center; }
        }
      `}</style>
    </header>
  );
}
