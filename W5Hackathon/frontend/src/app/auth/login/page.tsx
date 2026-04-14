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
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await api.post('/auth/login', values);
        dispatch(setCredentials(res.data));
        toast.success('Welcome back!');
        router.push('/');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Login failed');
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
        <h1 className="auth-hero-title">Login</h1>
        <div className="auth-hero-underline" />
        <p className="auth-hero-sub">Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mus.</p>
        <div className="breadcrumb">
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#1e2d6b', fontWeight: 500 }}>Login</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="auth-tabs-wrap">
        <div className="auth-tabs">
          <Link href="/auth/register" className="auth-tab">Register</Link>
          <span className="auth-tab active">Login</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2 className="auth-card-title">Log In</h2>
          <p className="auth-card-sub">
            New member?{' '}
            <Link href="/auth/register" style={{ color: '#1e2d6b', fontWeight: 600, textDecoration: 'none' }}>
              Register Here
            </Link>
          </p>

          <form onSubmit={formik.handleSubmit}>
            <div className="field-wrap">
              <label className="field-label">Enter Your Email*</label>
              <input
                type="email"
                {...formik.getFieldProps('email')}
                className={`field-input${formik.touched.email && formik.errors.email ? ' field-error' : ''}`}
              />
              {formik.touched.email && formik.errors.email && <p className="err-msg">{formik.errors.email}</p>}
            </div>

            <div className="field-wrap" style={{ position: 'relative' }}>
              <label className="field-label">Password*</label>
              <input
                type={showPw ? 'text' : 'password'}
                {...formik.getFieldProps('password')}
                className={`field-input${formik.touched.password && formik.errors.password ? ' field-error' : ''}`}
                style={{ paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="pw-toggle">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {formik.touched.password && formik.errors.password && <p className="err-msg">{formik.errors.password}</p>}
            </div>

            <div className="remember-row">
              <label className="remember-label">
                <input type="checkbox" style={{ accentColor: '#1e2d6b' }} /> Remember me
              </label>
              <Link href="#" className="forget-link">Forget Password</Link>
            </div>

            <button type="submit" disabled={formik.isSubmitting} className="submit-btn">
              {formik.isSubmitting ? 'Logging in...' : 'Log in'}
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
        .auth-hero-title {
          font-size: 2.4rem;
          font-weight: 700;
          color: #1e2d6b;
          margin-bottom: 8px;
        }
        .auth-hero-underline {
          width: 60px; height: 3px; background: #1e2d6b;
          margin: 0 auto 12px; border-radius: 2px;
        }
        .auth-hero-sub { color: #6b7280; font-size: 0.9rem; margin-bottom: 14px; }
        .breadcrumb {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; font-size: 0.8rem; color: #6b7280;
        }

        .auth-tabs-wrap { display: flex; justify-content: center; margin-top: 36px; }
        .auth-tabs {
          display: flex;
          border: 2px solid #1e2d6b;
          border-radius: 30px;
          overflow: hidden;
        }
        .auth-tab {
          padding: 10px 44px;
          font-size: 14px; font-weight: 600;
          text-decoration: none; cursor: pointer;
          background: #fff; color: #1e2d6b;
          border: none; transition: all 0.2s;
        }
        .auth-tab.active { background: #1e2d6b; color: #fff; }

        .auth-form-wrap {
          flex: 1; display: flex; justify-content: center;
          padding: 36px 16px 60px;
        }
        .auth-card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 24px rgba(30,45,107,0.1);
          padding: 40px 44px;
          width: 100%; max-width: 500px;
        }
        @media (max-width: 560px) {
          .auth-card { padding: 28px 20px; }
          .auth-tab { padding: 10px 28px; }
        }

        .auth-card-title {
          text-align: center; color: #1e2d6b;
          font-weight: 700; font-size: 1.3rem; margin-bottom: 6px;
        }
        .auth-card-sub { text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 28px; }

        .field-wrap { margin-bottom: 18px; }
        .field-label { display: block; font-size: 13px; color: #1e2d6b; margin-bottom: 6px; font-weight: 500; }
        .field-input {
          width: 100%; border: 1px solid #d1d9f0; border-radius: 5px;
          padding: 10px 12px; font-size: 14px; color: #1e2d6b;
          outline: none; background: #fff; transition: border-color 0.2s;
        }
        .field-input:focus { border-color: #1e2d6b; }
        .field-input.field-error { border-color: #e53e3e; }
        .err-msg { color: #e53e3e; font-size: 11px; margin-top: 4px; }

        .pw-toggle {
          position: absolute; right: 12px; top: 34px;
          background: none; border: none; cursor: pointer;
          color: #9ca3af; display: flex; align-items: center;
        }

        .remember-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 22px;
        }
        .remember-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #6b7280; cursor: pointer;
        }
        .forget-link { font-size: 13px; color: #1e2d6b; text-decoration: none; font-weight: 500; }

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
      `}</style>
    </div>
  );
}
