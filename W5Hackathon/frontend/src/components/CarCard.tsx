'use client';
import Link from 'next/link';
import { Heart, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';

interface CarCardProps {
  car: any;
  showWishlist?: boolean;
}

function useCountdown(endDate: string) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTime('Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setTime(`${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`);
      else setTime(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [endDate]);
  return time;
}

export default function CarCard({ car, showWishlist = true }: CarCardProps) {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [wishlisted, setWishlisted] = useState(false);
  const timeLeft = useCountdown(car.auctionEndDate);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      const res = await api.post(`/wishlist/toggle/${car._id}`);
      setWishlisted(res.data.added);
      toast.success(res.data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const rawImg = car.images?.[0];
  const img = rawImg
    ? rawImg.startsWith('http') ? rawImg : `${process.env.NEXT_PUBLIC_SOCKET_URL}${rawImg}`
    : 'https://placehold.co/400x250/e5e7eb/9ca3af?text=No+Image';

  const isLive = car.status === 'active';
  const isEnded = car.status === 'ended';

  return (
    <Link href={`/auctions/${car._id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(30,45,107,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(30,45,107,0.15)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(30,45,107,0.08)';
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: 190, overflow: 'hidden', flexShrink: 0 }}>
          <img src={img} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* Status badge */}
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: isLive ? '#e53e3e' : isEnded ? '#6b7280' : '#38a169',
            color: '#fff', fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />}
            {isLive ? 'LIVE' : isEnded ? 'ENDED' : 'COMPLETED'}
          </span>
          {/* Wishlist */}
          {showWishlist && (
            <button onClick={toggleWishlist} style={{
              position: 'absolute', top: 10, right: 10,
              background: wishlisted ? '#e53e3e' : 'rgba(255,255,255,0.9)',
              border: 'none', borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}>
              <Heart size={15} color={wishlisted ? '#fff' : '#6b7280'} fill={wishlisted ? '#fff' : 'none'} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e2d6b', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {car.title}
          </h3>
          <p style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>
            {car.make} · {car.model} · {car.year} · {car.category}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
            <div>
              <p style={{ fontSize: 10, color: '#9ca3af' }}>Current Bid</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1e2d6b' }}>${car.currentBid?.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                <Clock size={10} /> Time Left
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: isLive ? '#e53e3e' : '#6b7280' }}>{timeLeft}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
