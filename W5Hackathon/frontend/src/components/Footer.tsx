import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#1e2d6b', color: '#a0aec0', fontFamily: 'Inter, sans-serif' }}>
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <img src="/mainlogo.png" alt="CarDeposit" className="footer-logo-img" />
          </Link>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: '#a0aec0', marginTop: 14 }}>
            Lorem ipsum dolor sit amet consectetur. Mauris eu convallis proin turpis pretium donec orci semper.
            Sit suscipit lacus cras commodo in lectus sed egestas. Mattis egestas sit viverra pretium tincidunt libero.
            Suspendisse aliquam donec leo nisl purus et quam pulvinar.
          </p>
          <div style={{ marginTop: 18 }}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Follow Us</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { src: '/twitter.png', alt: 'Facebook' },
                { src: '/insta.png', alt: 'Instagram' },
                { src: '/link.png', alt: 'LinkedIn' },
                { src: '/face.png', alt: 'Twitter' },
              ].map((s) => (
                <a key={s.alt} href="#" className="ft-social-btn">
                  <img src={s.src} alt={s.alt} className="ft-social-img" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Home */}
        <div>
          <h4 className="footer-heading">Home</h4>
          <ul className="footer-list">
            {['Help Center', 'FAQ', 'My Account', 'My Account'].map((item, i) => (
              <li key={i}><Link href="#" className="footer-link">{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* Car Auction */}
        <div>
          <h4 className="footer-heading">Car Auction</h4>
          <ul className="footer-list">
            {['Help Center', 'FAQ', 'My Account', 'My Account'].map((item, i) => (
              <li key={i}><Link href="#" className="footer-link">{item}</Link></li>
            ))}
          </ul>
        </div>

        {/* About us */}
        <div>
          <h4 className="footer-heading">About us</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div className="ft-icon-wrap">
                <img src="/contact.png" alt="Phone" className="ft-icon-img" />
              </div>
              <div>
                <p style={{ color: '#a0aec0', fontSize: 12, margin: 0 }}>Hot Line Number</p>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '2px 0 0' }}>+054 211 4444</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div className="ft-icon-wrap">
                <img src="/mail.png" alt="Email" className="ft-icon-img" />
              </div>
              <div>
                <p style={{ color: '#a0aec0', fontSize: 12, margin: 0 }}>Email Id :</p>
                <p style={{ color: '#f5c518', fontSize: 13, margin: '2px 0 0' }}>info@cardeposit.com</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div className="ft-icon-wrap">
                <img src="/loc.png" alt="Location" className="ft-icon-img" />
              </div>
              <div>
                <p style={{ color: '#a0aec0', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                  Office No 6, SKB Plaza next to Bentley showroom,<br />
                  Umm Al Sheif Street, Sheikh Zayed Road, Dubai, UAE
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 0', textAlign: 'center', fontSize: 13, color: '#a0aec0' }}>
        Copyright 2022 All Rights Reserved
      </div>

      <style>{`
        .footer-grid { max-width: 1200px; margin: 0 auto; padding: 52px 24px 40px; display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 40px; }
        .footer-brand { }
        .footer-logo { display: flex; align-items: center; text-decoration: none; }
        .footer-logo-img { height: 40px; width: auto; object-fit: contain; }
        .ft-social-btn { width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; text-decoration: none; transition: border-color 0.2s; flex-shrink: 0; }
        .ft-social-btn:hover { border-color: rgba(255,255,255,0.6); }
        .ft-social-img { width: 16px; height: 16px; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.7; }
        .ft-icon-wrap { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .ft-icon-img { width: 16px; height: 16px; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.75; }
        .footer-heading { color: #fff; font-weight: 700; margin-bottom: 16px; font-size: 15px; }
        .footer-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .footer-link { color: #a0aec0; text-decoration: none; font-size: 13px; transition: color 0.2s; }
        .footer-link:hover { color: #fff; }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; padding: 36px 16px 28px; }
        }
      `}</style>
    </footer>
  );
}
