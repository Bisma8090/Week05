'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import { Heart, Clock } from 'lucide-react';

const MAKES = ['Any Car Make', 'Audi', 'BMW', 'Toyota', 'Honda', 'Ford', 'Mercedes', 'Porsche', 'Jeep', 'Kia', 'Hyundai'];
const MODELS = ['Any Car Model', 'A4', 'M3', 'M4', 'Camry', 'Civic', 'Mustang', 'C-Class', '911', 'Wrangler'];
const TYPES = ['Any Car Type', 'sedan', 'suv', 'coupe', 'truck', 'convertible', 'hatchback'];
const YEARS = ['Any Year', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

function Countdown({ endDate }: { endDate: string }) {
  const [t, setT] = useState({ d: '00', h: '00', m: '00', s: '00' });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setT({ d: '00', h: '00', m: '00', s: '00' }); return; }
      setT({
        d: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [endDate]);
  const items = [{ v: t.d, l: 'Day' }, { v: t.h, l: 'Hrs' }, { v: t.m, l: 'Min' }, { v: t.s, l: 'Sec' }];
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      {items.map(({ v, l }, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <span style={{ background: '#1e2d6b', color: '#fff', fontWeight: 700, fontSize: 13, padding: '4px 7px', borderRadius: 4, minWidth: 28, textAlign: 'center', display: 'block' }}>{v}</span>
            <span style={{ fontSize: 9, color: '#9ca3af' }}>{l}</span>
          </span>
          {i < 3 && <span style={{ fontSize: 14, fontWeight: 700, color: '#1e2d6b', marginTop: 2 }}>:</span>}
        </span>
      ))}
    </div>
  );
}

export default function AuctionsPage() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const imgBase = process.env.NEXT_PUBLIC_SOCKET_URL || '';

  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('Default');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const [type, setType] = useState('Any Car Type');
  const [make, setMake] = useState(searchParams.get('make') || 'Any Car Make');
  const [model, setModel] = useState('Any Car Model');
  const [year, setYear] = useState('Any Year');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);

  useEffect(() => {
    setLoading(true);
    api.get('/cars')
      .then((r) => setCars(r.data))
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }, []);

  const handleBid = (carId: string) => {
    if (!isAuthenticated) { toast.error('Please login to bid'); router.push('/auth/login'); return; }
    router.push(`/auctions/${carId}`);
  };

  const filtered = cars
    .filter((c) => {
      if (type !== 'Any Car Type' && c.category?.toLowerCase() !== type) return false;
      if (make !== 'Any Car Make' && c.make?.toLowerCase() !== make.toLowerCase()) return false;
      if (model !== 'Any Car Model' && c.model?.toLowerCase() !== model.toLowerCase()) return false;
      if (year !== 'Any Year' && String(c.year) !== year) return false;
      const price = c.currentBid ?? c.startingPrice ?? 0;
      if (price < minPrice || price > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      const pa = a.currentBid ?? a.startingPrice ?? 0;
      const pb = b.currentBid ?? b.startingPrice ?? 0;
      if (sort === 'Price: Low to High') return pa - pb;
      if (sort === 'Price: High to Low') return pb - pa;
      if (sort === 'Ending Soon') return new Date(a.auctionEndDate).getTime() - new Date(b.auctionEndDate).getTime();
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f0f4ff', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Page Hero */}
      <div style={{ background: 'linear-gradient(135deg, #e8edf8 0%, #d4ddf5 100%)', padding: '48px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e2d6b', marginBottom: 10 }}>Auction</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
          Lorem ipsum dolor sit amet consectetur. At in pretium congue vitae eu eu eus.
        </p>
        <div style={{ fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ cursor: 'pointer', color: '#6b7280' }} onClick={() => router.push('/')}>Home</span>
          <span>›</span>
          <span style={{ color: '#1e2d6b', fontWeight: 600 }}>Auction</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="auction-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px 60px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT */}
        <div>
          {/* Top bar */}
          <div style={{ background: '#1e2d6b', borderRadius: 6, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: '#fff', fontSize: 13 }}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} Results
            </span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '5px 10px', fontSize: 13, background: '#fff', color: '#374151', cursor: 'pointer', outline: 'none' }}>
              {['Default', 'Price: Low to High', 'Price: High to Low', 'Ending Soon'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Car rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 10, height: 160, opacity: 0.5 }} />
            )) : paginated.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 10, padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
                <p style={{ fontSize: 40 }}>🚗</p>
                <p>No auctions match your filters.</p>
              </div>
            ) : paginated.map((car) => {
              const rawImg = car.images?.[0];
              const img = rawImg ? (rawImg.startsWith('http') ? rawImg : `${imgBase}${rawImg}`) : '/hero-car.jpg';
              const price = car.currentBid ?? car.startingPrice ?? 0;
              const isLive = car.status === 'active';
              const isEnded = car.status === 'ended';
              return (
                <div key={car._id} style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(30,45,107,0.13)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', width: 180, flexShrink: 0, minHeight: 160 }}>
                    {(isLive || isEnded) && (
                      <span style={{
                        position: 'absolute', top: 8, left: 8,
                        background: isLive ? '#e53e3e' : '#6b7280',
                        color: '#fff', fontSize: 9, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 3, zIndex: 1,
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        {isLive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />}
                        {isLive ? 'LIVE' : 'ENDED'}
                      </span>
                    )}
                    <img src={img} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>

                  {/* Middle info */}
                  <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e2d6b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.title}</h3>
                      <button style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>
                        <Heart size={13} color="#9ca3af" />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#f5c518"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {car.description || 'Lorem ipsum dolor sit amet consectetur. Adipiscing elit tellus elementum cursus tincidunt sagittis elementum suspendisse velit arcu.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {car.make} · {car.model} · {car.year}
                      </span>
                      <span style={{ color: '#e5e7eb' }}>|</span>
                      <button onClick={() => router.push(`/auctions/${car._id}`)}
                        style={{ background: 'none', border: 'none', color: '#1e2d6b', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Right panel */}
                  <div style={{ width: 175, flexShrink: 0, borderLeft: '1px solid #f3f4f6', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>Current Bid</p>
                      <p style={{ fontSize: 17, fontWeight: 800, color: '#1e2d6b', margin: 0 }}>${price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> Time Left
                      </p>
                      <Countdown endDate={car.auctionEndDate} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>End Date</p>
                      <p style={{ fontSize: 11, color: '#374151', fontWeight: 500, margin: 0 }}>
                        {new Date(car.auctionEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 2px' }}>Total Bids</p>
                      <p style={{ fontSize: 11, color: '#374151', fontWeight: 600, margin: 0 }}>{car.totalBids ?? '—'}</p>
                    </div>
                    <button onClick={() => handleBid(car._id)}
                      style={{ background: '#1e2d6b', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 2 }}>
                      Submit A Bid
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 28 }}>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#374151' }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 32, height: 32, borderRadius: 6, border: p === page ? 'none' : '1px solid #e5e7eb', background: p === page ? '#1e2d6b' : '#fff', color: p === page ? '#fff' : '#374151', fontWeight: p === page ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{p}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#374151' }}>›</button>
            </div>
          )}
        </div>

        {/* RIGHT: Sidebar Filter */}
        <div style={{ background: '#1e2d6b', borderRadius: 10, padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 20 }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>Filter By</h3>
          {[
            { label: 'Car Type', value: type, setter: setType, options: TYPES },
            { label: 'Car Make', value: make, setter: setMake, options: MAKES },
            { label: 'Any Car Model', value: model, setter: setModel, options: MODELS },
            { label: 'Any Year', value: year, setter: setYear, options: YEARS },
          ].map(({ label, value, setter, options }) => (
            <select key={label} value={value} onChange={(e) => { setter(e.target.value); setPage(1); }}
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '9px 12px', fontSize: 13, color: '#fff', outline: 'none', cursor: 'pointer' }}>
              {options.map((o) => <option key={o} value={o} style={{ background: '#1e2d6b', color: '#fff' }}>{o}</option>)}
            </select>
          ))}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 8px' }}>Price Range</p>
            <input type="range" min={0} max={100000} step={1000} value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
              style={{ width: '100%', accentColor: '#f5c518' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              <span>$0</span><span>${maxPrice.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => setPage(1)}
            style={{ background: '#f5c518', color: '#1e2d6b', border: 'none', borderRadius: 6, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            Filter
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Price: $0 – ${maxPrice.toLocaleString()}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
        @media (max-width: 900px) {
          .auction-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .auction-layout > div:first-child > div > div { flex-direction: column !important; }
          .auction-layout > div:first-child > div > div > div:first-child { width: 100% !important; height: 180px !important; }
          .auction-layout > div:first-child > div > div > div:last-child { width: 100% !important; border-left: none !important; border-top: 1px solid #f3f4f6 !important; }
        }
      `}</style>
    </div>
  );
}
