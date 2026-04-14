import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div className="page-hero">
        <h1>About Us</h1>
        <p>Learn more about Car Deposit and our mission</p>
        <div className="breadcrumb">
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#1e2d6b' }}>About Us</span>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 16px 80px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: 1.9 }}>
          Lorem ipsum dolor sit amet consectetur. Mauris eu convallis proin turpis pretium donec orci semper.
          Sit suscipit lacus cras commodo in lectus sed egestas. Mattis egestas sit viverra pretium tincidunt libero.
          Suspendisse aliquam donec leo nisl purus et quam pulvinar. Odio egestas egestas tristique et lectus viverra in sed mauris.
        </p>
      </div>
      <Footer />
    </div>
  );
}
