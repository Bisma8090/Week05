'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';

const MAKES = ['Audi', 'BMW', 'Toyota', 'Honda', 'Ford', 'Mercedes', 'Porsche', 'Jeep'];
const MODELS = ['A4', 'M3', 'Camry', 'Civic', 'Mustang', 'C-Class', '911', 'Wrangler'];
const YEARS = ['2024', '2023', '2022', '2021', '2020', '2019', '2018'];
const PRICES = ['Under $10k', '$10k-$30k', '$30k-$60k', '$60k-$100k', 'Over $100k'];

function CountdownTimer({ endDate }: { endDate: string }) {
  const [time, setTime] = useState({ h: '10', m: '20', s: '47' });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTime({ h: '00', m: '00', s: '00' }); return; }
      setTime({
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [endDate]);
  return <span className="countdown-text">{time.h} : {time.m} : {time.s}</span>;
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [make, setMake] = useState('Audi');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    api.get('/cars')
      .then((r) => setCars(r.data.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (year) params.set('year', year);
    router.push(`/auctions?${params.toString()}`);
  };

  const handleBid = (carId: string) => {
    if (!isAuthenticated) { toast.error('Please login to bid'); router.push('/auth/login'); return; }
    router.push(`/auctions/${carId}`);
  };

  const imgBase = process.env.NEXT_PUBLIC_SOCKET_URL || '';

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#fff' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">WELCOME TO AUCTION</div>
          <h1 className="hero-title">Find Your<br />Dream Car</h1>
          <p className="hero-desc">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tellus elementum cursus tincidunt sagittis elementum suspendisse velit arcu.
          </p>

          {/* Search bar */}
          <div className="search-bar">
            <div className="search-make-label">Make</div>
            <select value={make} onChange={(e) => setMake(e.target.value)} className="search-select search-select-bold">
              {MAKES.map((m) => <option key={m}>{m}</option>)}
            </select>
            <div className="search-divider" />
            <select value={model} onChange={(e) => setModel(e.target.value)} className="search-select">
              <option value="">Model</option>
              {MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <div className="search-divider" />
            <select value={year} onChange={(e) => setYear(e.target.value)} className="search-select">
              <option value="">Year</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            <div className="search-divider" />
            <select value={price} onChange={(e) => setPrice(e.target.value)} className="search-select">
              <option value="">Price</option>
              {PRICES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button onClick={handleSearch} className="search-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── LIVE AUCTION ── */}
      <section className="auction-section">
        <div className="auction-inner">
          {/* Heading */}
          <div className="section-heading">
            <h2 className="section-title">Live Auction</h2>
            <div className="section-divider">
              <div className="divider-line" />
              <div className="divider-diamond" />
              <div className="divider-line" />
            </div>
          </div>

          {/* Tab */}
          <div className="auction-tab-bar">
            <span className="auction-tab-active">Live Auction</span>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="cards-grid">
              {[1,2,3,4].map((i) => <div key={i} className="card-skeleton" />)}
            </div>
          ) : cars.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: 40, marginBottom: 12 }}>🚗</p>
              <p>No live auctions right now. Check back soon!</p>
            </div>
          ) : (
            <div className="cards-grid">
              {cars.map((car) => {
                const rawImg = car.images?.[0] || null;
                const img = rawImg
                  ? rawImg.startsWith('http') ? rawImg : `${imgBase}${rawImg}`
                  : null;
                const isTrending = (car.totalBids ?? 0) > 2;
                return (
                  <Link key={car._id} href={`/auctions/${car._id}`} style={{ textDecoration: 'none' }}>
                    <div className="car-card">
                      {/* Trending + Wishlist row */}
                      <div className="card-top-row">
                        {isTrending ? (
                          <span className="trending-badge">
                            <span className="trending-dot" />
                            Trending
                          </span>
                        ) : <span />}
                        <button onClick={e => e.preventDefault()} className="wishlist-btn">☆</button>
                      </div>

                      {/* Title */}
                      <h3 className="card-title">{car.title}</h3>

                      {/* Image */}
                      <div className="card-img-wrap">
                        <img
                          src={img || '/hero-car.jpg'}
                          alt={car.title}
                          className="card-img"
                        />
                      </div>

                      {/* Body */}
                      <div className="card-body">
                        <div className="card-meta-row">
                          <div>
                            <p className="card-price">${(car.currentBid ?? car.startingPrice ?? 1079.99).toLocaleString()}</p>
                            <p className="card-label">Current Bid</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <CountdownTimer endDate={car.auctionEndDate} />
                            <p className="card-label">Waiting for Bid</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); handleBid(car._id); }}
                          className="bid-btn"
                        >
                          Submit A Bid
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <section style={{ background: '#fff', height: 100 }} />

      <Footer />

      <style>{`
        /* Hero */
        .hero-section { position: relative; min-height: 520px; display: flex; align-items: center; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; background-image: url(/hero-car.jpg); background-size: cover; background-position: center; z-index: 0; }
        .hero-overlay { position: absolute; inset: 0; background: rgba(10,18,50,0.65); z-index: 1; }
        .hero-content { position: relative; z-index: 2; width: 100%; max-width: 1200px; margin: 0 auto; padding: 90px 32px 110px; }
        .hero-badge { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-size: 11px; font-weight: 700; padding: 6px 16px; border-radius: 4px; margin-bottom: 20px; letter-spacing: 1.5px; }
        .hero-title { color: #fff; font-family: var(--font-josefin), sans-serif; font-weight: 400; font-style: normal; font-size: 74px; line-height: 1; letter-spacing: 0; margin-bottom: 18px; max-width: 560px; }
        .hero-desc { color: rgba(255,255,255,0.78); font-size: 14px; line-height: 1.85; max-width: 400px; margin-bottom: 36px; }

        /* Search bar */
        .search-bar { background: #fff; border-radius: 6px; padding: 8px 8px 8px 16px; display: flex; align-items: center; gap: 0; max-width: 680px; box-shadow: 0 4px 20px rgba(0,0,0,0.18); flex-wrap: wrap; }
        .search-make-label { font-size: 11px; color: #9ca3af; padding-right: 10px; border-right: 1px solid #e5e7eb; white-space: nowrap; }
        .search-select { border: none; outline: none; font-size: 13px; color: #6b7280; background: transparent; cursor: pointer; padding: 6px 8px; }
        .search-select-bold { color: #1e2d6b; font-weight: 600; }
        .search-divider { width: 1px; height: 20px; background: #e5e7eb; flex-shrink: 0; }
        .search-btn { margin-left: auto; background: #1e2d6b; color: #fff; border: none; border-radius: 5px; padding: 10px 26px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; flex-shrink: 0; transition: background 0.2s; }
        .search-btn:hover { background: #162057; }

        /* Auction section */
        .auction-section { background: #1e2d6b; padding: 60px 24px 72px; }
        .auction-inner { max-width: 1200px; margin: 0 auto; }
        .section-heading { text-align: center; margin-bottom: 24px; }
        .section-title { color: #fff; font-size: 1.9rem; font-weight: 700; margin-bottom: 14px; }
        .section-divider { display: flex; align-items: center; justify-content: center; gap: 14px; }
        .divider-line { height: 1px; width: 100px; background: rgba(255,255,255,0.3); }
        .divider-diamond { width: 13px; height: 13px; background: #f5c518; transform: rotate(45deg); flex-shrink: 0; }
        .auction-tab-bar { border-bottom: 1px solid rgba(255,255,255,0.18); margin-bottom: 28px; }
        .auction-tab-active { display: inline-block; color: #fff; font-weight: 600; font-size: 14px; padding-bottom: 10px; border-bottom: 3px solid #f5c518; margin-bottom: -1px; }

        /* Cards grid */
        .cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .card-skeleton { background: rgba(255,255,255,0.08); border-radius: 8px; height: 300px; }
        .empty-state { text-align: center; color: rgba(255,255,255,0.6); padding: 40px 0; }

        /* Car card */
        .car-card { background: #fff; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .car-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.22); }
        .card-top-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px 4px; min-height: 32px; }
        .trending-badge { background: #e53e3e; color: #fff; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 3px; text-transform: uppercase; display: flex; align-items: center; gap: 4px; }
        .trending-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; display: inline-block; }
        .wishlist-btn { background: #fff; border: 1px solid #e5e7eb; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px; color: #6b7280; flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .card-title { font-size: 15px; font-weight: 700; color: #1e2d6b; margin: 0 14px 8px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .card-img-wrap { width: 100%; height: 160px; background: #f8f8f8; overflow: hidden; flex-shrink: 0; }
        .card-img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
        .card-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 10px; }
        .card-meta-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .card-price { font-size: 15px; font-weight: 800; color: #1e2d6b; margin: 0; }
        .card-label { font-size: 10px; color: #9ca3af; margin: 3px 0 0; }
        .countdown-text { font-weight: 700; color: #1e2d6b; font-size: 14px; }
        .bid-btn { width: 100%; background: #1e2d6b; color: #fff; border: none; border-radius: 6px; padding: 11px 0; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .bid-btn:hover { background: #162057; }

        /* Responsive */
        @media (max-width: 1024px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) {
          .cards-grid { grid-template-columns: 1fr; }
          .hero-content { padding: 60px 20px 80px; }
          .search-bar { flex-direction: column; align-items: stretch; gap: 8px; padding: 12px; }
          .search-make-label { border-right: none; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          .search-divider { display: none; }
          .search-btn { width: 100%; justify-content: center; }
          .auction-section { padding: 40px 16px 50px; }
        }
      `}</style>
    </div>
  );
}
