'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '@/lib/axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronRight, Upload, X } from 'lucide-react';
import Link from 'next/link';

const MAKES = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'Porsche', 'Ferrari', 'Lamborghini', 'Lexus', 'Mazda', 'Subaru', 'Jeep', 'Land Rover', 'Volvo'];
const MODELS: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Supra', 'Land Cruiser'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Odyssey'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'M3', 'M5'],
  Mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'AMG GT'],
  Audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'R8'],
  Ford: ['Mustang', 'F-150', 'Explorer', 'Escape', 'Bronco'],
  Chevrolet: ['Silverado', 'Camaro', 'Corvette', 'Tahoe', 'Equinox'],
  Nissan: ['Altima', 'Maxima', 'Sentra', 'Rogue', 'Pathfinder', 'GT-R'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade'],
  Kia: ['Sportage', 'Sorento', 'Telluride', 'Stinger', 'EV6'],
};
const CATEGORIES = ['sedan', 'sports', 'hatchback', 'convertible', 'suv', 'truck', 'coupe', 'van'];
const YEARS = Array.from({ length: 30 }, (_, i) => String(2025 - i));
const ENGINE_SIZES = ['1.0L', '1.2L', '1.4L', '1.6L', '1.8L', '2.0L', '2.4L', '2.5L', '3.0L', '3.5L', '4.0L', '5.0L', '6.0L+'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#1e2d6b', marginBottom: 6, fontWeight: 500 };
const errStyle: React.CSSProperties = { color: '#e53e3e', fontSize: 11, marginTop: 4 };
const inputStyle = (err = false): React.CSSProperties => ({
  width: '100%', border: `1px solid ${err ? '#e53e3e' : '#d1d9f0'}`, borderRadius: 6,
  padding: '10px 12px', fontSize: 14, color: '#1e2d6b', outline: 'none', background: '#fff',
});
const selectStyle = (err = false): React.CSSProperties => ({
  ...inputStyle(err), appearance: 'auto',
});

export default function SellPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [partyType, setPartyType] = useState<'dealer' | 'private'>('dealer');
  const [modified, setModified] = useState<'stock' | 'modified'>('stock');

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    const token = localStorage.getItem('token');
    if (!token) router.push('/auth/login');
  }, [hydrated, router]);

  const formik = useFormik({
    initialValues: {
      firstName: '', lastName: '', email: '', phone: '',
      vin: '', year: '', make: '', model: '', mileage: '',
      engineSize: '', paint: '', hasGccSpecs: '', features: '',
      accidentHistory: '', serviceHistory: '',
      category: '', description: '', startingPrice: '', auctionHours: '0', auctionMinutes: '30',
      color: '', transmission: '', fuelType: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      make: Yup.string().required('Make is required'),
      model: Yup.string().required('Model is required'),
      year: Yup.string().required('Year is required'),
      category: Yup.string().required('Category is required'),
      description: Yup.string().min(20, 'Min 20 characters').required('Description is required'),
      startingPrice: Yup.number().min(1, 'Must be at least $1').required('Starting price is required'),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) { toast.error('Please log in'); router.push('/auth/login'); setSubmitting(false); return; }
      if (files.length === 0) { toast.error('Please upload at least one photo'); setSubmitting(false); return; }
      try {
        const formData = new FormData();
        const title = `${values.year} ${values.make} ${values.model}`;
        formData.append('title', title);
        formData.append('make', values.make);
        formData.append('model', values.model);
        formData.append('year', values.year);
        formData.append('category', values.category);
        formData.append('startingPrice', values.startingPrice);
        formData.append('description', values.description);
        formData.append('color', values.color);
        formData.append('transmission', values.transmission);
        formData.append('fuelType', values.fuelType);
        if (values.mileage) formData.append('mileage', values.mileage);
        if (values.vin) formData.append('vin', values.vin);
        if (values.engineSize) formData.append('engineSize', values.engineSize);
        if (values.hasGccSpecs) formData.append('hasGccSpecs', values.hasGccSpecs);
        if (values.features) formData.append('features', values.features);
        if (values.accidentHistory) formData.append('accidentHistory', values.accidentHistory);
        if (values.serviceHistory) formData.append('serviceHistory', values.serviceHistory);
        formData.append('isModified', modified);
        formData.append('partyType', partyType);
        const totalMs = (Number(values.auctionHours) * 3600 + Number(values.auctionMinutes) * 60) * 1000;
        const endDate = new Date(Date.now() + totalMs).toISOString();
        formData.append('auctionEndDate', endDate);
        files.forEach((f) => formData.append('images', f));
        await api.post('/cars', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Car listed successfully!');
        resetForm(); setPreviews([]); setFiles([]);
        router.push('/profile?tab=my-cars');
      } catch (err: any) {
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/auth/login');
        } else {
          toast.error(err.response?.data?.message || 'Failed to list car');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    const combined = [...files, ...incoming].slice(0, 6);
    const newPreviews = combined.map((f, i) => previews[i] && files[i] === f ? previews[i] : URL.createObjectURL(f));
    setFiles(combined);
    setPreviews(newPreviews);
    e.target.value = '';
  };

  const removeImage = (i: number) => {
    setFiles(files.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
  };

  const availableModels = formik.values.make ? (MODELS[formik.values.make] || []) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <div className="page-hero">
        <h1>Sell Your Car</h1>
        <p>Lorem ipsum dolor sit amet consectetur. At in pretium semper vitae eu eu mus.</p>
        <div className="breadcrumb">
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#1e2d6b' }}>Sell Your Car</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 16px 60px', width: '100%' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '28px 32px', boxShadow: '0 2px 12px rgba(30,45,107,0.08)', marginBottom: 24 }}>
          <h2 style={{ color: '#1e2d6b', fontWeight: 700, fontSize: '1.3rem', marginBottom: 8 }}>Tell us about your car</h2>
          <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.7, marginBottom: 0 }}>
            Please give us some basics about yourself and car you&apos;d like to sell. We&apos;ll also need details about the car&apos;s title status as well as 30 photos that highlight the car&apos;s exterior and interior condition.
          </p>
          <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
            We&apos;ll respond to your application within a business day, and we work with you to build a custom and professional listing and get the auction live.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          {/* Your Info */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
            <h3 style={{ color: '#1e2d6b', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Your Info</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>Dealer or Private party?</p>
            <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
              <button type="button" onClick={() => setPartyType('dealer')} style={{ padding: '8px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #1e2d6b', borderRadius: '6px 0 0 6px', background: partyType === 'dealer' ? '#1e2d6b' : '#fff', color: partyType === 'dealer' ? '#fff' : '#1e2d6b' }}>
                Dealer
              </button>
              <button type="button" onClick={() => setPartyType('private')} style={{ padding: '8px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #1e2d6b', borderLeft: 'none', borderRadius: '0 6px 6px 0', background: partyType === 'private' ? '#1e2d6b' : '#fff', color: partyType === 'private' ? '#fff' : '#1e2d6b' }}>
                Private party
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="sell-grid">
              <div>
                <label style={labelStyle}>First name*</label>
                <input type="text" {...formik.getFieldProps('firstName')} style={inputStyle(!!formik.touched.firstName && !!formik.errors.firstName)} />
                {formik.touched.firstName && formik.errors.firstName && <p style={errStyle}>{formik.errors.firstName}</p>}
              </div>
              <div>
                <label style={labelStyle}>Last name*</label>
                <input type="text" {...formik.getFieldProps('lastName')} style={inputStyle(!!formik.touched.lastName && !!formik.errors.lastName)} />
                {formik.touched.lastName && formik.errors.lastName && <p style={errStyle}>{formik.errors.lastName}</p>}
              </div>
              <div>
                <label style={labelStyle}>Email*</label>
                <input type="email" {...formik.getFieldProps('email')} style={inputStyle(!!formik.touched.email && !!formik.errors.email)} />
                {formik.touched.email && formik.errors.email && <p style={errStyle}>{formik.errors.email}</p>}
              </div>
              <div>
                <label style={labelStyle}>phone number*</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select style={{ ...inputStyle(false), width: 90, flexShrink: 0, padding: '10px 4px', appearance: 'auto' }}>
                    <option>PK (+92)</option>
                    <option>UAE (+971)</option>
                    <option>US (+1)</option>
                  </select>
                  <input type="tel" {...formik.getFieldProps('phone')} style={{ ...inputStyle(false), flex: 1 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Car Details */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
            <h3 style={{ color: '#1e2d6b', fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Car Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="sell-grid">
              <div>
                <label style={labelStyle}>VIN*</label>
                <input type="text" {...formik.getFieldProps('vin')} placeholder="Vehicle Identification Number" style={inputStyle(false)} />
              </div>
              <div>
                <label style={labelStyle}>Year*</label>
                <select {...formik.getFieldProps('year')} style={selectStyle(!!formik.touched.year && !!formik.errors.year)}>
                  <option value="">Select Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {formik.touched.year && formik.errors.year && <p style={errStyle}>{formik.errors.year}</p>}
              </div>
              <div>
                <label style={labelStyle}>Make*</label>
                <select {...formik.getFieldProps('make')} onChange={(e) => { formik.setFieldValue('make', e.target.value); formik.setFieldValue('model', ''); }} style={selectStyle(!!formik.touched.make && !!formik.errors.make)}>
                  <option value="">Select Make</option>
                  {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {formik.touched.make && formik.errors.make && <p style={errStyle}>{formik.errors.make}</p>}
              </div>
              <div>
                <label style={labelStyle}>Model*</label>
                <select {...formik.getFieldProps('model')} style={selectStyle(!!formik.touched.model && !!formik.errors.model)}>
                  <option value="">All Models</option>
                  {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="Other">Other</option>
                </select>
                {formik.touched.model && formik.errors.model && <p style={errStyle}>{formik.errors.model}</p>}
              </div>
              <div>
                <label style={labelStyle}>Mileage (in miles)</label>
                <input type="number" {...formik.getFieldProps('mileage')} placeholder="" style={inputStyle(false)} />
              </div>
              <div>
                <label style={labelStyle}>Engine size</label>
                <select {...formik.getFieldProps('engineSize')} style={selectStyle(false)}>
                  <option value="">Select</option>
                  {ENGINE_SIZES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Paint*</label>
                <select {...formik.getFieldProps('color')} style={selectStyle(false)}>
                  <option value="">select</option>
                  {['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Brown', 'Gold'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Transmission</label>
                <select {...formik.getFieldProps('transmission')} style={selectStyle(false)}>
                  <option value="">Select</option>
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fuel Type</label>
                <select {...formik.getFieldProps('fuelType')} style={selectStyle(false)}>
                  <option value="">Select</option>
                  {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Has GCC Specs</label>
                <select {...formik.getFieldProps('hasGccSpecs')} style={selectStyle(false)}>
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Noteworthy options/features</label>
                <textarea {...formik.getFieldProps('features')} rows={3} style={{ ...inputStyle(false), resize: 'vertical' }} />
              </div>
              <div>
                <label style={labelStyle}>Accident History</label>
                <select {...formik.getFieldProps('accidentHistory')} style={selectStyle(false)}>
                  <option value="">Select</option>
                  <option>None</option><option>Minor</option><option>Major</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Full Service History</label>
                <select {...formik.getFieldProps('serviceHistory')} style={selectStyle(false)}>
                  <option value="">Select</option>
                  <option>Full</option><option>Partial</option><option>None</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Has the car been modified?</label>
                <div style={{ display: 'flex', gap: 0, marginTop: 2 }}>
                  <button type="button" onClick={() => setModified('stock')} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #1e2d6b', borderRadius: '6px 0 0 6px', background: modified === 'stock' ? '#1e2d6b' : '#fff', color: modified === 'stock' ? '#fff' : '#1e2d6b' }}>
                    Completely stock
                  </button>
                  <button type="button" onClick={() => setModified('modified')} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #1e2d6b', borderLeft: 'none', borderRadius: '0 6px 6px 0', background: modified === 'modified' ? '#1e2d6b' : '#fff', color: modified === 'modified' ? '#fff' : '#1e2d6b' }}>
                    Modified
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Max Bid*</label>
                <input type="number" {...formik.getFieldProps('startingPrice')} placeholder="1" style={inputStyle(!!formik.touched.startingPrice && !!formik.errors.startingPrice)} />
                {formik.touched.startingPrice && formik.errors.startingPrice && <p style={errStyle}>{formik.errors.startingPrice as string}</p>}
              </div>
              <div>
                <label style={labelStyle}>Category*</label>
                <select {...formik.getFieldProps('category')} style={selectStyle(!!formik.touched.category && !!formik.errors.category)}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                {formik.touched.category && formik.errors.category && <p style={errStyle}>{formik.errors.category}</p>}
              </div>
              <div>
                <label style={labelStyle}>Auction Duration</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      {...formik.getFieldProps('auctionHours')}
                      min={0}
                      placeholder="Hours"
                      style={{ ...inputStyle(false), textAlign: 'center' }}
                    />
                    <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 3 }}>Hours</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      {...formik.getFieldProps('auctionMinutes')}
                      min={0}
                      max={59}
                      placeholder="Minutes"
                      style={{ ...inputStyle(false), textAlign: 'center' }}
                    />
                    <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 3 }}>Minutes</p>
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description*</label>
                <textarea {...formik.getFieldProps('description')} rows={4} placeholder="Describe your car's condition, features, and any notable details..." style={{ ...inputStyle(!!formik.touched.description && !!formik.errors.description), resize: 'vertical' }} />
                {formik.touched.description && formik.errors.description && <p style={errStyle}>{formik.errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Upload Photos */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(30,45,107,0.08)' }}>
            <h3 style={{ color: '#1e2d6b', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Upload Photos</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Upload up to 6 photos. The first photo will be the main image.</p>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: '1.5px solid #d1d9f0', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#1e2d6b', background: '#f9fafb' }}>
              <Upload size={16} />
              Add Photos (max 6)
              <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
            </label>

            {/* 6-image grid preview matching auction detail layout */}
            {previews.length > 0 && (
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, maxWidth: 600 }}>
                {/* Main large image */}
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', height: 220, border: '2px solid #1e2d6b' }}>
                  {previews[0] ? (
                    <>
                      <img src={previews[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#1e2d6b', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 3 }}>Main</span>
                      <button type="button" onClick={() => removeImage(0)} style={{ position: 'absolute', top: 4, right: 4, background: '#e53e3e', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={11} color="#fff" />
                      </button>
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 32 }}>🚗</div>
                  )}
                </div>
                {/* Right: 2×3 grid for images 1–5 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 6, height: 220 }}>
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: previews[idx] ? '1px solid #d1d9f0' : '1.5px dashed #d1d9f0', background: '#f9fafb' }}>
                      {previews[idx] ? (
                        <>
                          <img src={previews[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 2, right: 2, background: '#e53e3e', border: 'none', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={9} color="#fff" />
                          </button>
                        </>
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: 16 }}>+</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={formik.isSubmitting} style={{ background: formik.isSubmitting ? '#9ca3af' : '#1e2d6b', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 48px', fontSize: 15, fontWeight: 700, cursor: formik.isSubmitting ? 'not-allowed' : 'pointer' }}>
            {formik.isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
