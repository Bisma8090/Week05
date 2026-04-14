import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div className="page-hero">
        <h1>Contact</h1>
        <p>Get in touch with our team</p>
        <div className="breadcrumb">
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#1e2d6b' }}>Contact</span>
        </div>
      </div>
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 16px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '32px', boxShadow: '0 2px 12px rgba(30,45,107,0.08)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: '📞', label: 'Hot Line Number', value: '+054 211 4444' },
            { icon: '✉️', label: 'Email Id', value: 'info@cardeposit.com' },
            { icon: '📍', label: 'Address', value: 'Office No 6, SKB Plaza next to Bentley showroom, Umm Al Sheif Street, Sheikh Zayed Road, Dubai, UAE' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{item.label}</p>
                <p style={{ fontSize: 14, color: '#1e2d6b', fontWeight: 600 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
