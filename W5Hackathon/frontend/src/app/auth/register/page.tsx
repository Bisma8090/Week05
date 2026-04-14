'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '@/lib/axios';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';

function NotARobot({ verified, onVerify }: { verified: boolean; onVerify: (v: boolean) => void }) {
  const [checking, setChecking] = useState(false);
  const [dots, setDots] = useState(0);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleClick = () => {
    if (verified || checking) return;
    setChecking(true);
    setDots(0);
    iv.current = setInterval(() => setDots((d) => d + 1), 300);
    setTimeout(() => {
      if (iv.current) clearInterval(iv.current);
      setChecking(false);
      onVerify(true);
    }, 1800);
  };

  useEffect(() => () => { if (iv.current) clearInterval(iv.current); }, []);

  return (
    <div onClick={handleClick} className="captcha-box">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {verified ? (
          <span className="captcha-check">✓</span>
        ) : checking ? (
          <span className="captcha-spinner" />
        ) : (
          <span className="captcha-checkbox" />
        )}
        <span style={{ fontSize: 13, color: '#374151' }}>
          {verified ? 'Verified' : checking ? `Checking${'.'.repeat(dots % 4)}` : "I'm not a robot"}
        </span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 20 }}>🤖</div>
        <div style={{ fontSize: 9, color: '#9ca3af' }}>reCAPTCHA</div>
        <div style={{ fontSize: 8, color: '#9ca3af' }}>Privacy · Terms</div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [robotVerified, setRobotVerified] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', email: '', phone: '', username: '', password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Min 2 chars').required('Full name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phone: Yup.string().matches(/^[0-9]{10,11}$/, 'Enter valid number'),
      username: Yup.string().min(3, 'Min 3 chars').required('Username is required'),
      password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm your password'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!robotVerified) { toast.error('Please verify you are not a robot'); setSubmitting(false); return; }
      if (!agreed) { toast.error('Please agree to Terms & Conditions'); setSubmitting(false); return; }
      try {
        const { confirmPassword, username, ...data } = values;
        const res = await api.post('/auth/register', data);
        dispatch(setCredentials(res.data));
        toast.success('Account created!');
        router.push('/');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      {/* Page Hero */}
      <div className="auth-hero">
        <h1 className="auth-hero-title">Register</h1>
        <div className="auth-hero-underline" />
        <p className="auth-hero-sub">Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mus.</p>
        <div className="breadcrumb">
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#1e2d6b', fontWeight: 500 }}>Register</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="auth-tabs-wrap">
        <div className="auth-tabs">
          <span className="auth-tab active">Register</span>
          <Link href="/auth/login" className="auth-tab">Login</Link>
        </div>
      </div>

      {/* Form Card */}
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2 className="auth-card-title">Register</h2>
          <p className="auth-card-sub">
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#1e2d6b', fontWeight: 600, textDecoration: 'none' }}>Login Here</Link>
          </p>

          <form onSubmit={formik.handleSubmit}>
            {/* Personal Info */}
            <p className="section-heading">Personal Information</p>

            <div className="field-wrap">
              <label className="field-label">Enter Your Full Name*</label>
              <input
                type="text"
                {...formik.getFieldProps('name')}
                className={`field-input${formik.touched.name && formik.errors.name ? ' field-error' : ''}`}
              />
              {formik.touched.name && formik.errors.name && <p className="err-msg">{formik.errors.name}</p>}
            </div>

            <div className="two-col">
              <div className="field-wrap">
                <label className="field-label">Enter Your Email*</label>
                <input
                  type="email"
                  {...formik.getFieldProps('email')}
                  className={`field-input${formik.touched.email && formik.errors.email ? ' field-error' : ''}`}
                />
                {formik.touched.email && formik.errors.email && <p className="err-msg">{formik.errors.email}</p>}
              </div>
              <div className="field-wrap">
                <label className="field-label">Enter Mobile Number*</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select className="field-input" style={{ width: 90, flexShrink: 0, padding: '10px 4px' }}>
                    <option value="+92">🇵🇰 +92</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+91">🇮🇳 +91</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="3XX XXXXXXX"
                    {...formik.getFieldProps('phone')}
                    className={`field-input${formik.touched.phone && formik.errors.phone ? ' field-error' : ''}`}
                    style={{ flex: 1 }}
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && <p className="err-msg">{formik.errors.phone}</p>}
              </div>
            </div>

            {/* Account Info */}
            <p className="section-heading">Account Information</p>

            <div className="field-wrap">
              <label className="field-label">Username*</label>
              <input
                type="text"
                {...formik.getFieldProps('username')}
                className={`field-input${formik.touched.username && formik.errors.username ? ' field-error' : ''}`}
              />
              {formik.touched.username && formik.errors.username && <p className="err-msg">{formik.errors.username}</p>}
            </div>

            <div className="two-col">
              <div className="field-wrap">
                <label className="field-label">Password*</label>
                <input
                  type="password"
                  {...formik.getFieldProps('password')}
                  className={`field-input${formik.touched.password && formik.errors.password ? ' field-error' : ''}`}
                />
                {formik.touched.password && formik.errors.password && <p className="err-msg">{formik.errors.password}</p>}
              </div>
              <div className="field-wrap">
                <label className="field-label">Confirm Password*</label>
                <input
                  type="password"
                  {...formik.getFieldProps('confirmPassword')}
                  className={`field-input${formik.touched.confirmPassword && formik.errors.confirmPassword ? ' field-error' : ''}`}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="err-msg">{formik.errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Captcha */}
            <p className="captcha-heading">Prove You Are Human</p>
            <div style={{ marginBottom: 16 }}>
              <NotARobot verified={robotVerified} onVerify={setRobotVerified} />
            </div>

            {/* Terms */}
            <label className="terms-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ accentColor: '#1e2d6b', width: 14, height: 14 }}
              />
              I agree to the Terms &amp; Conditions
            </label>

            <button type="submit" disabled={formik.isSubmitting} className="submit-btn">
              {formik.isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="social-label">Or Register With</p>
          <div className="social-btns">
            {[{ label: 'G', color: '#ea4335' }, { label: 'f', color: '#1877f2' }, { label: '𝕏', color: '#000' }].map((s) => (
              <button key={s.label} className="social-btn" style={{ color: s.color }}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      <Footer variant="full" />

      <style>{`
        .auth-hero {
          background: #dce6ff;
          padding: 44px 16px 28px;
          text-align: center;
        }
        .auth-hero-title { font-size: 2.4rem; font-weight: 700; color: #1e2d6b; margin-bottom: 8px; }
        .auth-hero-underline { width: 60px; height: 3px; background: #1e2d6b; margin: 0 auto 12px; border-radius: 2px; }
        .auth-hero-sub { color: #6b7280; font-size: 0.9rem; margin-bottom: 14px; }
        .breadcrumb { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.8rem; color: #6b7280; }

        .auth-tabs-wrap { display: flex; justify-content: center; margin-top: 36px; }
        .auth-tabs { display: flex; border: 2px solid #1e2d6b; border-radius: 30px; overflow: hidden; }
        .auth-tab {
          padding: 10px 44px; font-size: 14px; font-weight: 600;
          text-decoration: none; cursor: pointer;
          background: #fff; color: #1e2d6b; border: none; transition: all 0.2s;
        }
        .auth-tab.active { background: #1e2d6b; color: #fff; }

        .auth-form-wrap { flex: 1; display: flex; justify-content: center; padding: 36px 16px 60px; }
        .auth-card {
          background: #fff; border-radius: 10px;
          box-shadow: 0 4px 24px rgba(30,45,107,0.1);
          padding: 40px 44px; width: 100%; max-width: 560px;
        }
        @media (max-width: 600px) {
          .auth-card { padding: 28px 20px; }
          .auth-tab { padding: 10px 28px; }
          .two-col { grid-template-columns: 1fr !important; }
        }

        .auth-card-title { text-align: center; color: #1e2d6b; font-weight: 700; font-size: 1.3rem; margin-bottom: 6px; }
        .auth-card-sub { text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 24px; }

        .section-heading {
          color: #1e2d6b; font-weight: 700; font-size: 13px;
          border-bottom: 2px solid #f5c518; padding-bottom: 5px;
          margin-bottom: 14px; margin-top: 4px;
        }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field-wrap { margin-bottom: 14px; }
        .field-label { display: block; font-size: 13px; color: #1e2d6b; margin-bottom: 6px; font-weight: 500; }
        .field-input {
          width: 100%; border: 1px solid #d1d9f0; border-radius: 5px;
          padding: 10px 12px; font-size: 14px; color: #1e2d6b;
          outline: none; background: #fff; transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .field-input:focus { border-color: #1e2d6b; }
        .field-input.field-error { border-color: #e53e3e; }
        .err-msg { color: #e53e3e; font-size: 11px; margin-top: 4px; }

        .captcha-heading { color: #1e2d6b; font-weight: 600; font-size: 13px; margin-bottom: 8px; }
        .captcha-box {
          border: 1px solid #d1d9f0; border-radius: 5px; padding: 12px 16px;
          display: flex; justify-content: space-between; align-items: center;
          cursor: pointer; background: #fafafa; user-select: none;
        }
        .captcha-check {
          width: 22px; height: 22px; border-radius: 50%; background: #38a169;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 13px;
        }
        .captcha-spinner {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid #1e2d6b; border-top-color: transparent;
          display: inline-block; animation: spin 0.7s linear infinite;
        }
        .captcha-checkbox { width: 22px; height: 22px; border-radius: 4px; border: 2px solid #9ca3af; display: inline-block; }

        .terms-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #6b7280; margin-bottom: 20px; cursor: pointer;
        }

        .submit-btn {
          width: 100%; background: #1e2d6b; color: #fff; border: none;
          border-radius: 5px; padding: 13px; font-size: 15px; font-weight: 600;
          cursor: pointer; margin-bottom: 20px; transition: background 0.2s;
        }
        .submit-btn:hover { background: #162057; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .social-label { text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 16px; }
        .social-btns { display: flex; justify-content: center; gap: 14px; }
        .social-btn {
          width: 46px; height: 46px; border-radius: 50%;
          border: 1.5px solid #d1d9f0; background: #fff;
          cursor: pointer; font-size: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s;
        }
        .social-btn:hover { border-color: #1e2d6b; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
