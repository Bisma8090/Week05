'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import { CheckCircle, Truck, Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { key: 'ready_for_shipping', label: 'Ready for Shipping', icon: Package, desc: 'Your car is being prepared for shipment' },
  { key: 'in_transit', label: 'In Transit', icon: Truck, desc: 'Your car is on its way to you' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Your car has been delivered successfully' },
];

const imgBase = process.env.NEXT_PUBLIC_SOCKET_URL || '';

export default function PaymentPage() {
  const { carId } = useParams<{ carId: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [car, setCar] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    const fetchData = async () => {
      try {
        const carRes = await api.get(`/cars/${carId}`);
        setCar(carRes.data);
        try {
          const payRes = await api.get(`/payments/${carId}`);
          if (payRes.data) setPayment(payRes.data);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [carId, isAuthenticated, router]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('joinAuction', carId);
    socket.on('shippingUpdate', (data: any) => {
      if (data.carId === carId) {
        setPayment((prev: any) => prev ? { ...prev, shippingStatus: data.status } : prev);
        const step = STEPS.find((s) => s.key === data.status);
        toast.success(`📦 ${step?.label || 'Shipping update'}!`);
      }
    });
    return () => { socket.off('shippingUpdate'); socket.emit('leaveAuction', carId); };
  }, [carId]);

  // Poll every 15s if payment exists but not yet delivered
  useEffect(() => {
    if (!payment || payment.shippingStatus === 'delivered') return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/payments/${carId}`);
        if (res.data && res.data.shippingStatus !== payment.shippingStatus) {
          const step = STEPS.find((s) => s.key === res.data.shippingStatus);
          toast.success(`📦 ${step?.label || 'Shipping update'}!`);
          setPayment(res.data);
        }
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, [payment, carId]);

  const makePayment = async () => {
    setPaying(true);
    try {
      const res = await api.post(`/payments/${carId}`);
      setPayment(res.data);
      toast.success('✅ Payment successful! Tracking your delivery...');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const currentStep = STEPS.findIndex((s) => s.key === payment?.shippingStatus);
  const progressPct = payment ? ((currentStep + 1) / STEPS.length) * 100 : 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px' }}>
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    </div>
  );

  if (!car) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Car not found</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="page-hero">
        <h1>Payment & Delivery</h1>
        <p>Complete your payment and track your car delivery</p>
        <div className="breadcrumb">
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href={`/auctions/${carId}`} style={{ color: '#6b7280', textDecoration: 'none' }}>Auction</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#1e2d6b' }}>Payment</span>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '32px auto', padding: '0 16px 60px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="auction-detail-grid">

          {/* Car Summary */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(30,45,107,0.08)', overflow: 'hidden' }}>
            <img
              src={car.images?.[0]
                ? car.images[0].startsWith('http') ? car.images[0] : `${imgBase}${car.images[0]}`
                : 'https://placehold.co/500x280/e5e7eb/9ca3af?text=No+Image'}
              alt={car.title}
              style={{ width: '100%', height: 220, objectFit: 'cover' }}
            />
            <div style={{ padding: '20px 24px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e2d6b', marginBottom: 4 }}>{car.title}</h2>
              <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>{car.make} {car.model} · {car.year}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Lot Number', value: `#${car.lotNumber}` },
                  { label: 'Winning Bid', value: `$${car.currentBid?.toLocaleString()}`, highlight: true },
                  { label: 'Auction End Date', value: new Date(car.auctionEndDate).toLocaleDateString() },
                  { label: 'Winner', value: car.winner?.name || user?.name || '—', green: true },
                  { label: 'Category', value: car.category, capitalize: true },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: row.highlight ? '#f5c518' : row.green ? '#38a169' : '#1e2d6b', textTransform: row.capitalize ? 'capitalize' : 'none' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: '14px 16px', background: '#eef2ff', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#1e2d6b', fontSize: 15 }}>Total Amount</span>
                <span style={{ fontWeight: 800, color: '#f5c518', fontSize: 20 }}>${car.currentBid?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment & Shipping */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {!payment ? (
              <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
                <h3 style={{ fontWeight: 800, color: '#1e2d6b', fontSize: '1.1rem', marginBottom: 8 }}>Complete Your Payment</h3>
                <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
                  Congratulations on winning this auction! Complete your payment to start the delivery process. Your car will be shipped within 24 hours of payment confirmation.
                </p>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                  <p style={{ color: '#92400e', fontSize: 13, fontWeight: 500 }}>
                    💳 Demo Payment — Click to simulate payment processing
                  </p>
                  <p style={{ color: '#b45309', fontSize: 12, marginTop: 4 }}>
                    Shipping status will auto-update every ~60 seconds via Socket.IO
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    { icon: '🔒', text: 'Secure SSL encrypted payment' },
                    { icon: '📦', text: 'Free shipping included' },
                    { icon: '✅', text: 'Money-back guarantee' },
                  ].map((f) => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#6b7280' }}>
                      <span>{f.icon}</span> {f.text}
                    </div>
                  ))}
                </div>

                <button onClick={makePayment} disabled={paying} style={{
                  width: '100%', background: paying ? '#9ca3af' : '#1e2d6b', color: '#fff',
                  border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700,
                  cursor: paying ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                }}>
                  {paying ? '⏳ Processing...' : `💳 Pay $${car.currentBid?.toLocaleString()}`}
                </button>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 12, padding: '28px 24px', boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
                <h3 style={{ fontWeight: 800, color: '#1e2d6b', fontSize: '1.1rem', marginBottom: 20 }}>Delivery Tracking</h3>

                {/* Progress Bar */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
                    <span>Progress</span>
                    <span>{Math.round(progressPct)}%</span>
                  </div>
                  <div style={{ height: 8, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #1e2d6b, #38a169)', borderRadius: 999, transition: 'width 0.8s ease' }} />
                  </div>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isCompleted = i <= currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <div key={step.key} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                        {/* Connector line */}
                        {i < STEPS.length - 1 && (
                          <div style={{ position: 'absolute', left: 19, top: 44, width: 2, height: 'calc(100% - 20px)', background: isCompleted && i < currentStep ? '#38a169' : '#e5e7eb' }} />
                        )}
                        <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: isCompleted ? '#38a169' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isCurrent ? '3px solid #38a169' : '3px solid transparent', transition: 'all 0.4s', boxShadow: isCurrent ? '0 0 0 4px rgba(56,161,105,0.2)' : 'none' }}>
                          <Icon size={18} color={isCompleted ? '#fff' : '#9ca3af'} />
                        </div>
                        <div style={{ paddingBottom: 24, flex: 1 }}>
                          <p style={{ fontWeight: 600, color: isCompleted ? '#1e2d6b' : '#9ca3af', fontSize: 14 }}>{step.label}</p>
                          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{step.desc}</p>
                          {isCurrent && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: '#38a169', fontWeight: 600 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38a169', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
                              Currently here
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {payment.shippingStatus === 'delivered' ? (
                  <div style={{ marginTop: 16, background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>🎉</p>
                    <p style={{ color: '#276749', fontWeight: 800, fontSize: '1.1rem' }}>Delivered Successfully!</p>
                    <p style={{ color: '#38a169', fontSize: 13, marginTop: 4 }}>Your car has been delivered. Enjoy your new ride!</p>
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16, textAlign: 'center' }}>
                    🔄 Status updates automatically every ~60 seconds
                  </p>
                )}
              </div>
            )}

            {/* Payment Info Card */}
            {payment && (
              <div style={{ background: '#1e2d6b', borderRadius: 12, padding: '20px 24px', color: '#fff' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Payment Confirmed</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#a0aec0' }}>Amount Paid</span>
                    <span style={{ fontWeight: 700, color: '#f5c518' }}>${payment.amount?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#a0aec0' }}>Status</span>
                    <span style={{ fontWeight: 600, color: '#68d391' }}>✅ Paid</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
