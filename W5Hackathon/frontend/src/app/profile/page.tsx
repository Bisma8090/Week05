'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Edit2, Save, X, ChevronRight, Clock, Heart } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const TABS = [
  { key: 'info', label: 'Personal Info' },
  { key: 'my-cars', label: 'My Cars' },
  { key: 'my-bids', label: 'My Bids' },
  { key: 'wishlist', label: 'Wishlist' },
];

const imgBase = process.env.NEXT_PUBLIC_SOCKET_URL || '';

function CountdownTimer({ endDate }: { endDate: string }) {
  const [t, setT] = useState('');
  useEffect(() => {
    const iv = setInterval(() => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setT('Ended'); clearInterval(iv); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setT(`${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`);
      else setT(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, [endDate]);
  return <span style={{ fontSize: 12, color: '#1e2d6b', fontWeight: 600 }}>{t}</span>;
}

function CarBidCard({ car, userBid, onEndBid, onRemoveWishlist, isWinner, hasPaid }: { car: any; userBid?: number; onEndBid?: () => void; onRemoveWishlist?: () => void; isWinner?: boolean; hasPaid?: boolean }) {
  const img = car.images?.[0]
    ? car.images[0].startsWith('http') ? car.images[0] : `${imgBase}${car.images[0]}`
    : 'https://placehold.co/300x180/e5e7eb/9ca3af?text=No+Image';
  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(30,45,107,0.08)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {car.status === 'active' && (
        <span style={{ position: 'absolute', top: 8, left: 8, background: '#e53e3e', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, zIndex: 1 }}>LIVE 🔥</span>
      )}
      {onRemoveWishlist && (
        <button onClick={onRemoveWishlist} style={{ position: 'absolute', top: 8, right: 8, background: '#e53e3e', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1 }}>
          <Heart size={14} color="#fff" fill="#fff" />
        </button>
      )}
      <img src={img} alt={car.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e2d6b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <p style={{ fontSize: 10, color: '#9ca3af' }}>Current Bid</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1e2d6b' }}>${car.currentBid?.toLocaleString()}</p>
          </div>
          {userBid !== undefined && (
            <div>
              <p style={{ fontSize: 10, color: '#9ca3af' }}>Your Bid</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: userBid >= car.currentBid ? '#38a169' : '#e53e3e' }}>${userBid?.toLocaleString()}</p>
            </div>
          )}
        </div>
        {car.auctionEndDate && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} color="#9ca3af" />
              <CountdownTimer endDate={car.auctionEndDate} />
            </div>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(car.auctionEndDate).toLocaleDateString()}</span>
          </div>
        )}
        <div style={{ marginTop: 'auto' }}>
          {onEndBid ? (
            <button onClick={onEndBid} style={{ width: '100%', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>End Auction</button>
          ) : isWinner && !hasPaid ? (
            <Link href={`/payment/${car._id}`} style={{ display: 'block', textAlign: 'center', background: '#38a169', color: '#fff', borderRadius: 6, padding: '9px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              💳 Make Payment
            </Link>
          ) : car.status === 'ended' ? (
            <span style={{ display: 'block', textAlign: 'center', background: '#f3f4f6', color: '#6b7280', borderRadius: 6, padding: '9px', fontSize: 13, fontWeight: 600 }}>Auction Ended</span>
          ) : (
            <Link href={`/auctions/${car._id}`} style={{ display: 'block', textAlign: 'center', background: '#1e2d6b', color: '#fff', borderRadius: 6, padding: '9px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              {userBid !== undefined ? 'View Auction' : 'Submit A Bid'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f0f4ff' }}><Navbar /></div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info');
  const [profile, setProfile] = useState<any>(null);
  const [myCars, setMyCars] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    const fetchAll = async () => {
      try {
        const [profileRes, carsRes, bidsRes, wishRes, paymentsRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/cars/my-cars'),
          api.get('/bids/user/my-bids'),
          api.get('/wishlist'),
          api.get('/payments/user/my-payments'),
        ]);
        setProfile(profileRes.data);
        setMyCars(carsRes.data);
        setMyBids(bidsRes.data);
        setWishlist(wishRes.data.map((w: any) => w.car).filter(Boolean));
        setMyPayments(paymentsRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAuthenticated, router, mounted]);

  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      nationality: profile?.nationality || '',
      idType: profile?.idType || '',
      idNumber: profile?.idNumber || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().min(2).required('Name is required'),
      phone: Yup.string(),
      nationality: Yup.string(),
      idType: Yup.string(),
      idNumber: Yup.string(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await api.put('/users/profile', values);
        setProfile(res.data);
        setEditing(false);
        toast.success('Profile updated!');
      } catch {
        toast.error('Failed to update profile');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleEndBid = async (carId: string) => {
    try {
      await api.patch(`/cars/${carId}/end`);
      toast.success('Auction ended');
      setMyCars((prev) => prev.map((c) => c._id === carId ? { ...c, status: 'ended' } : c));
    } catch {
      toast.error('Failed to end auction');
    }
  };

  const removeFromWishlist = async (carId: string) => {
    try {
      await api.post(`/wishlist/toggle/${carId}`);
      setWishlist((prev) => prev.filter((c) => c._id !== carId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed');
    }
  };

  if (!mounted || loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px', display: 'flex', gap: 24 }}>
        <div className="skeleton" style={{ width: 200, height: 300, flexShrink: 0 }} />
        <div className="skeleton" style={{ flex: 1, height: 300 }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="page-hero">
        <h1>My Profile</h1>
        <p>Manage your account, bids, and listings</p>
        <div className="breadcrumb">
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#1e2d6b' }}>My Profile</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px 60px', width: '100%', display: 'flex', gap: 28 }} className="profile-layout">
        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0 }} className="profile-sidebar">
          {/* Avatar */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 16px', marginBottom: 12, textAlign: 'center', boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1e2d6b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 24, fontWeight: 700, color: '#fff' }}>
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <p style={{ fontWeight: 700, color: '#1e2d6b', fontSize: 14 }}>{profile?.name}</p>
            <p style={{ color: '#9ca3af', fontSize: 12 }}>{profile?.email}</p>
          </div>

          <nav style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', textAlign: 'left', padding: '13px 16px',
                background: activeTab === tab.key ? '#eef2ff' : 'transparent',
                color: '#1e2d6b', border: 'none',
                borderLeft: activeTab === tab.key ? '3px solid #f5c518' : '3px solid transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400,
                borderBottom: '1px solid #f3f4f6',
              }}>
                {tab.label}
                {activeTab === tab.key && <ChevronRight size={14} />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Personal Info */}
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
                <div style={{ background: '#1e2d6b', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Personal Information</span>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Edit2 size={12} /> Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => editFormik.handleSubmit()} disabled={editFormik.isSubmitting} style={{ background: '#38a169', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Save size={12} /> Save
                      </button>
                      <button onClick={() => setEditing(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ padding: '20px 24px' }}>
                  {!editing ? (
                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                      {/* Avatar */}
                      <div style={{ flexShrink: 0 }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1e2d6b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', border: '3px solid #e8edf8' }}>
                          {profile?.name?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      {/* Info grid */}
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }} className="info-grid">
                        {[
                          { label: 'Full Name', value: profile?.name || '—' },
                          { label: 'Email', value: profile?.email || '—' },
                          { label: 'Mobile Number', value: profile?.phone || '—' },
                          { label: 'Nationality', value: profile?.nationality || '—' },
                          { label: 'ID Type', value: profile?.idType || '—' },
                          { label: 'ID Number', value: profile?.idNumber || '—' },
                        ].map((row) => (
                          <div key={row.label}>
                            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 2, fontWeight: 500 }}>{row.label}</p>
                            <p style={{ fontSize: 14, color: '#374151', fontWeight: 400 }}>{row.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={editFormik.handleSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="info-grid">
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Full Name</label>
                          <input {...editFormik.getFieldProps('name')} style={{ width: '100%', border: '1.5px solid #d1d9f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1e2d6b', outline: 'none', boxSizing: 'border-box' }} />
                          {editFormik.touched.name && editFormik.errors.name && <p style={{ color: '#e53e3e', fontSize: 11, marginTop: 2 }}>{editFormik.errors.name}</p>}
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Email (read-only)</label>
                          <input value={profile?.email} disabled style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#9ca3af', background: '#f9fafb', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Mobile Number</label>
                          <input {...editFormik.getFieldProps('phone')} style={{ width: '100%', border: '1.5px solid #d1d9f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1e2d6b', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Nationality</label>
                          <input {...editFormik.getFieldProps('nationality')} style={{ width: '100%', border: '1.5px solid #d1d9f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1e2d6b', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>ID Type</label>
                          <input {...editFormik.getFieldProps('idType')} style={{ width: '100%', border: '1.5px solid #d1d9f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1e2d6b', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>ID Number</label>
                          <input {...editFormik.getFieldProps('idNumber')} style={{ width: '100%', border: '1.5px solid #d1d9f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1e2d6b', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { label: 'Cars Listed', value: myCars.length, icon: '🚗' },
                  { label: 'Bids Placed', value: myBids.length, icon: '🔨' },
                  { label: 'Wishlist', value: wishlist.length, icon: '❤️' },
                ].map((s) => (
                  <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e2d6b' }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Cars */}
          {activeTab === 'my-cars' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ color: '#1e2d6b', fontWeight: 800, fontSize: '1.1rem' }}>My Cars ({myCars.length})</h2>
                <Link href="/sell" style={{ background: '#1e2d6b', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>+ List New Car</Link>
              </div>
              {myCars.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', background: '#fff', borderRadius: 12 }}>
                  <p style={{ fontSize: 48, marginBottom: 12 }}>🚗</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#1e2d6b' }}>No cars listed yet</p>
                  <Link href="/sell" style={{ color: '#1e2d6b', fontWeight: 600, marginTop: 8, display: 'inline-block', textDecoration: 'underline' }}>List your first car →</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                  {myCars.map((car) => (
                    <CarBidCard key={car._id} car={car} onEndBid={car.status === 'active' ? () => handleEndBid(car._id) : undefined} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Bids */}
          {activeTab === 'my-bids' && (
            <div>
              <h2 style={{ color: '#1e2d6b', fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>My Bids ({myBids.length})</h2>
              {myBids.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', background: '#fff', borderRadius: 12 }}>
                  <p style={{ fontSize: 48, marginBottom: 12 }}>🔨</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#1e2d6b' }}>No bids placed yet</p>
                  <Link href="/auctions" style={{ color: '#1e2d6b', fontWeight: 600, marginTop: 8, display: 'inline-block', textDecoration: 'underline' }}>Browse auctions →</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                  {myBids.map((bid: any) => bid.car && (
                    <CarBidCard
                      key={bid._id}
                      car={bid.car}
                      userBid={bid.amount}
                      isWinner={bid.car.winner?.toString() === profile?._id?.toString()}
                      hasPaid={myPayments.some((p: any) => (p.car?._id ?? p.car)?.toString() === bid.car._id?.toString())}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ color: '#1e2d6b', fontWeight: 800, fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={18} color="#e53e3e" fill="#e53e3e" /> Wishlist ({wishlist.length})
              </h2>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', background: '#fff', borderRadius: 12 }}>
                  <p style={{ fontSize: 48, marginBottom: 12 }}>❤️</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#1e2d6b' }}>Your wishlist is empty</p>
                  <Link href="/auctions" style={{ color: '#1e2d6b', fontWeight: 600, marginTop: 8, display: 'inline-block', textDecoration: 'underline' }}>Browse auctions →</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                  {wishlist.map((car: any) => (
                    <CarBidCard key={car._id} car={car} onRemoveWishlist={() => removeFromWishlist(car._id)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
