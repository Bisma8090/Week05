'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import { Star, ChevronRight, Trophy, Clock } from 'lucide-react';
import Link from 'next/link';

const imgBase = process.env.NEXT_PUBLIC_SOCKET_URL || '';

function getImg(img: string) {
  if (!img) return '/hero-car.jpg';
  return img.startsWith('http') ? img : `${imgBase}${img}`;
}

function CountdownBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ background: '#1e2d6b', color: '#fff', borderRadius: 6, padding: '8px 10px', fontSize: 18, fontWeight: 800, minWidth: 44, lineHeight: 1 }}>{value}</div>
      <p style={{ fontSize: 9, color: '#9ca3af', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
    </div>
  );
}

export default function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [car, setCar] = useState<any>(null);
  const [topBidders, setTopBidders] = useState<any[]>([]);
  const [bidAmount, setBidAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [ending, setEnding] = useState(false);
  const [countdown, setCountdown] = useState({ d: '00', h: '00', m: '00', s: '00' });
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [carRes, biddersRes] = await Promise.all([
        api.get(`/cars/${id}`),
        api.get(`/bids/${id}/top-bidders`),
      ]);
      setCar(carRes.data);
      setTopBidders(biddersRes.data);
      setBidAmount((carRes.data.currentBid || 0) + 1);
      if (isAuthenticated) {
        api.get(`/wishlist/check/${id}`).then((r) => setWishlisted(r.data.wishlisted)).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => { fetchData(); setActiveImg(0); }, [fetchData]);

  useEffect(() => {
    if (!car) return;
    const iv = setInterval(() => {
      const diff = new Date(car.auctionEndDate).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ d: '00', h: '00', m: '00', s: '00' });
        clearInterval(iv);
        if (car.status === 'active') {
          api.patch(`/cars/${car._id}/expire`).catch(() => {});
          setCar((prev: any) => prev ? { ...prev, status: 'ended' } : prev);
        }
        return;
      }
      setCountdown({
        d: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [car?.auctionEndDate, car?.status]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('joinAuction', id);
    socket.on('newBid', (data: any) => {
      setCar((prev: any) => prev ? { ...prev, currentBid: data.amount, currentBidder: data.bidder } : prev);
      setTopBidders((prev) => [{ ...data, _id: data._id || Date.now() }, ...prev].slice(0, 10));
      setBidAmount(data.amount + 1);
      toast(`New bid: ${data.amount.toLocaleString()} by ${data.bidder?.name}`, { duration: 3000 });
    });
    socket.on('auctionEnded', (data: any) => {
      setCar((prev: any) => prev ? { ...prev, status: 'ended', winner: data.winner } : prev);
      if (data.winner) toast.success(`Auction ended! Winner: ${data.winner?.name || 'N/A'}`, { duration: 6000 });
      else toast('Auction ended - no bids placed', { icon: '🔔' });
    });
    return () => { socket.emit('leaveAuction', id); socket.off('newBid'); socket.off('auctionEnded'); };
  }, [id]);

  const placeBid = async () => {
    if (!isAuthenticated) { toast.error('Please login to bid'); router.push('/auth/login'); return; }
    if (bidAmount <= (car?.currentBid || 0)) { toast.error(`Bid must be higher than ${car?.currentBid?.toLocaleString()}`); return; }
    setBidding(true);
    try {
      await api.post(`/bids/${id}`, { amount: bidAmount });
      toast.success('Bid placed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
    } finally { setBidding(false); }
  };

  const endAuction = async () => {
    if (!confirm('Are you sure you want to end this auction now?')) return;
    setEnding(true);
    try {
      await api.patch(`/cars/${id}/end`);
      toast.success('Auction ended successfully!');
      setCar((prev: any) => prev ? { ...prev, status: 'ended' } : prev);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to end auction');
    } finally { setEnding(false); }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      const res = await api.post(`/wishlist/toggle/${id}`);
      setWishlisted(res.data.added);
      toast.success(res.data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ height: 400, background: '#e5e7eb', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 60, background: '#e5e7eb', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
      </div>
    </div>
  );

  if (!car) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 48 }}>🚗</p>
      <p style={{ color: '#6b7280' }}>Car not found</p>
      <Link href="/auctions" style={{ color: '#1e2d6b', fontWeight: 600 }}>Back to Auctions</Link>
    </div>
  );

  const isOwner = !!user?._id && !!car.seller?._id && user._id.toString() === car.seller._id.toString();
  const winnerId = car.winner?._id?.toString() || car.winner?.toString() || '';
  const isWinner = !!user?._id && !!winnerId && user._id.toString() === winnerId;
  const images: string[] = car.images?.length > 0 ? car.images : [];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #e8edf8 0%, #d4ddf5 100%)', padding: '48px 24px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e2d6b', marginBottom: 8 }}>{car.title}</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 14 }}>Lorem ipsum dolor sit amet consectetur. At in pretium congue vitae eu eu eus.</p>
        <div style={{ fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/auctions" style={{ color: '#6b7280', textDecoration: 'none' }}>Auction</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#1e2d6b', fontWeight: 600 }}>Auction Detail</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '28px auto', padding: '0 16px 60px', width: '100%', boxSizing: 'border-box' }}>

        {/* Image Gallery Card */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(30,45,107,0.08)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {car.status === 'active' && (
                <span style={{ background: '#e53e3e', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
                  LIVE
                </span>
              )}
              <span style={{ fontWeight: 700, color: '#1e2d6b', fontSize: 15 }}>{car.title}</span>
            </div>
            <button onClick={toggleWishlist} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: wishlisted ? '#e53e3e' : '#9ca3af', fontSize: 13 }}>
              <Star size={18} fill={wishlisted ? '#e53e3e' : 'none'} color={wishlisted ? '#e53e3e' : '#9ca3af'} />
              {wishlisted ? 'Saved' : 'Save'}
            </button>
          </div>

          {images.length > 0 ? (
            <div className="img-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', height: 320 }}>
                <img src={getImg(images[activeImg] || images[0])} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 6, height: 320 }}>
                {[1, 2, 3, 4, 5].map((idx) => (
                  images[idx] ? (
                    <div key={idx} onClick={() => setActiveImg(idx)} style={{ borderRadius: 6, overflow: 'hidden', cursor: 'pointer', border: activeImg === idx ? '2px solid #1e2d6b' : '2px solid transparent', transition: 'border 0.2s' }}>
                      <img src={getImg(images[idx])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div key={idx} style={{ borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 20 }}>🚗</div>
                  )
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 320, background: '#f3f4f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 48 }}>🚗</div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="stats-bar" style={{ background: '#fff', borderRadius: 12, padding: '14px 20px', boxShadow: '0 2px 12px rgba(30,45,107,0.08)', marginBottom: 20, display: 'flex', gap: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Current Bid', value: `${(car.currentBid || 0).toLocaleString()}`, highlight: true },
            { label: 'End Date', value: new Date(car.auctionEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
            { label: 'Lot #', value: String(car.lotNumber || '-') },
            { label: 'Total Bids', value: String(car.totalBids ?? topBidders.length) },
            { label: 'Odometer', value: car.mileage ? `${car.mileage.toLocaleString()} mi` : '-' },
            { label: 'Category', value: car.category || '-', capitalize: true },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: '1 1 120px', padding: '8px 16px', borderRight: i < 5 ? '1px solid #f3f4f6' : 'none' }}>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px' }}>{s.label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: s.highlight ? '#1e2d6b' : '#374151', textTransform: (s as any).capitalize ? 'capitalize' : 'none', margin: 0 }}>{s.value}</p>
            </div>
          ))}
          <div style={{ flex: '1 1 120px', padding: '8px 16px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> Time Left</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: car.status === 'active' ? '#e53e3e' : '#6b7280', margin: 0 }}>
              {car.status === 'ended' ? 'Ended' : `${countdown.d}d ${countdown.h}h ${countdown.m}m`}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Description */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
              <h3 style={{ color: '#1e2d6b', fontWeight: 700, fontSize: 15, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f5c518', display: 'inline-block' }}>Description</h3>
              <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.8, marginBottom: 0 }}>{car.description}</p>
            </div>

            {/* Top Bidder */}
            {topBidders[0] && (
              <div style={{ background: '#1e2d6b', borderRadius: 12, padding: '20px 24px', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Trophy size={18} color="#f5c518" />
                  <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Top Bidder</h3>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                    {topBidders[0]?.bidder?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', flex: 1 }}>
                    {[
                      { label: 'Full Name', value: topBidders[0]?.bidder?.name || '-' },
                      { label: 'Email', value: topBidders[0]?.bidder?.email || '-' },
                      { label: 'Mobile Number', value: topBidders[0]?.bidder?.phone || '-' },
                      { label: 'Nationality', value: topBidders[0]?.bidder?.nationality || '-' },
                      { label: 'ID Type', value: topBidders[0]?.bidder?.idType || '-' },
                    ].map((d) => (
                      <div key={d.label}>
                        <p style={{ fontSize: 11, color: '#a0aec0', margin: '0 0 2px' }}>{d.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{d.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Bid Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Bid Box */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px' }}>Current Bid</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#1e2d6b', margin: 0 }}>${(car.currentBid || 0).toLocaleString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px' }}>Starting Price</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#9ca3af', margin: 0 }}>${(car.startingPrice || 0).toLocaleString()}</p>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> Time Remaining
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <CountdownBox label="Days" value={countdown.d} />
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1e2d6b', alignSelf: 'flex-start', marginTop: 6 }}>:</span>
                  <CountdownBox label="Hours" value={countdown.h} />
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1e2d6b', alignSelf: 'flex-start', marginTop: 6 }}>:</span>
                  <CountdownBox label="Mins" value={countdown.m} />
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1e2d6b', alignSelf: 'flex-start', marginTop: 6 }}>:</span>
                  <CountdownBox label="Secs" value={countdown.s} />
                </div>
              </div>

              {car.status === 'active' && !isOwner && (
                <>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    placeholder="Enter bid amount"
                    style={{ width: '100%', border: '1.5px solid #d1d9f0', borderRadius: 8, padding: '9px 12px', fontSize: 15, color: '#1e2d6b', outline: 'none', fontWeight: 700, marginBottom: 10, boxSizing: 'border-box' }}
                  />
                  <button onClick={placeBid} disabled={bidding} style={{ width: '100%', background: '#1e2d6b', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    {bidding ? 'Placing Bid...' : 'Submit A Bid'}
                  </button>
                </>
              )}

              {isOwner && car.status === 'active' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ background: '#eef2ff', color: '#1e2d6b', padding: 10, borderRadius: 8, fontSize: 13, textAlign: 'center', fontWeight: 500 }}>
                    This is your listing
                  </div>
                  <button onClick={endAuction} disabled={ending} style={{ width: '100%', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    {ending ? 'Ending...' : 'End Auction Now'}
                  </button>
                </div>
              )}
              {isOwner && car.status === 'ended' && (
                <div style={{ background: '#f0fdf4', color: '#38a169', padding: 12, borderRadius: 8, fontSize: 13, textAlign: 'center', fontWeight: 600 }}>
                  Your auction has ended
                </div>
              )}
              {car.status === 'ended' && isWinner && (
                <Link href={`/payment/${car._id}`} style={{ display: 'block', textAlign: 'center', background: '#38a169', color: '#fff', padding: '12px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                  You Won! Make Payment
                </Link>
              )}
              {car.status === 'ended' && !isWinner && !isOwner && (
                <div style={{ background: '#fef2f2', color: '#e53e3e', padding: 12, borderRadius: 8, fontSize: 13, textAlign: 'center' }}>
                  Auction has ended
                </div>
              )}
            </div>

            {/* Bid History */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
              <h3 style={{ color: '#1e2d6b', fontWeight: 700, fontSize: 14, margin: '0 0 12px' }}>
                Bid History ({topBidders.length})
              </h3>
              {topBidders.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No bids yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                  {topBidders.map((bid: any, i: number) => (
                    <div key={bid._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: i === 0 ? '#eef2ff' : '#f9fafb', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? '#f5c518' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i === 0 ? '#1e2d6b' : '#6b7280', flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 12, color: '#1e2d6b', fontWeight: i === 0 ? 700 : 400 }}>
                          {bid.bidder?.name || `Bidder ${i + 1}`}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? '#1e2d6b' : '#6b7280' }}>
                        ${bid.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          .detail-grid { grid-template-columns: 1fr !important; }
          .img-grid { grid-template-columns: 1fr !important; }
          .img-grid > div:first-child { grid-row: auto !important; height: 220px !important; }
          .stats-bar > div { flex: 1 1 100px !important; border-right: none !important; border-bottom: 1px solid #f3f4f6; }
        }
        @media (max-width: 600px) {
          .stats-bar { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
