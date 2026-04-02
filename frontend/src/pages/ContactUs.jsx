import React, { useState } from 'react';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  SendOutlined,
  CheckCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons';

/* ─── Tiny badge ─────────────────────────────────────────────────────────── */
const Tag = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-SGBUS-green/10 text-SGBUS-green text-xs font-semibold uppercase tracking-widest">
   
    {children}
  </span>
);

/* ─── Contact info card ──────────────────────────────────────────────────── */
const InfoCard = ({ icon, label, value, href }) => (
  <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-SGBUS-green hover:border-cal-poly-green hover:shadow-sm transition-all">
    <div className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-green-600 text-xl">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      {href ? (
        <a href={href} className="text-gray-800 font-medium hover:text-green-700 transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-gray-800 font-medium leading-snug">{value}</p>
      )}
    </div>
  </div>
);

/* ─── Input wrapper ──────────────────────────────────────────────────────── */
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-green-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 focus:bg-white transition-all';

/* ═══════════════════════════════════════════════════════════════════════════ */
const ContactUs = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    // Simulated submit — replace with your actual API call
    setTimeout(() => setStatus('success'), 1800);
  };

  return (
    <div className="font-poppins">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-20 px-6">
        <div className="relative max-w-7xl mx-auto text-center">
          <Tag>Contact Us</Tag>
          <h1 className="mt-5 text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            We'd love to{' '}
            <span className="bg-clip-text text-transparent bg-SGBUS-green">
              hear from you
            </span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Whether you have a question about our products, orders, services, or platform — feel free to get in touch with us.
          </p>
        </div>
      </section>

      {/* ── CONTACT INFO CARDS ───────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoCard
              icon={<EnvironmentOutlined />}
              label="Our Address"
              value="123 Green Valley Road, Colombo, Sri Lanka"
            />
            <InfoCard
              icon={<PhoneOutlined />}
              label="Phone"
              value="+94 71 234 5678"
              href="tel:+94712345678"
            />
            <InfoCard
              icon={<MailOutlined />}
              label="Email"
              value="support@polycrop.com"
              href="mailto:support@polycrop.com"
            />
          </div>
        </div>
      </section>

      {/* ── FORM + MAP ───────────────────────────────────────────────────── */}
      <section className="py-12 pb-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* ── Form ── */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Send us a message</h2>
              <p className="text-sm text-gray-500 mb-7">
                Our team will get back to you as soon as possible.
              </p>

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <CheckCircleFilled className="text-5xl text-green-500" />
                  <h3 className="text-xl font-black text-gray-900">Message sent!</h3>
                  <p className="text-gray-500 max-w-xs">
                    Thank you for reaching out. We'll get back to you shortly.
                  </p>
                  <button
                    onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                    className="mt-2 px-6 py-2.5 text-sm font-semibold text-green-700 border border-green-200 rounded-xl hover:bg-green-50 transition-colors"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Full Name" required>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="John Perera"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Email Address" required>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Phone Number">
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+94 71 234 5678"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Subject" required>
                      <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        placeholder="Order enquiry, product question…"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Message" required>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Write your message here…"
                      className={`${inputCls} resize-none`}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2 bg-SGBUS-green hover:bg-cal-poly-green disabled:opacity-70 text-white font-bold rounded-full shadow-lg shadow-green-200 transition-all"
                  >
                    {status === 'loading' ? (
                      <><LoadingOutlined spin /> Sending…</>
                    ) : (
                      <><SendOutlined /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* ── Sidebar info ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map placeholder */}
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gradient-to-br from-green-50 to-emerald-100 h-52 flex flex-col items-center justify-center gap-3">
                <span className="text-5xl">📍</span>
                <div className="text-center">
                  <p className="font-bold text-gray-800">Green Valley Road</p>
                  <p className="text-sm text-gray-500">Colombo, Sri Lanka</p>
                </div>
              </div>

              {/* Business hours */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🕐 Business Hours
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' },
                    { day: 'Saturday', hours: '8:00 AM – 3:00 PM' },
                    { day: 'Sunday', hours: 'Closed' },
                  ].map(({ day, hours }) => (
                    <li key={day} className="flex justify-between">
                      <span className="text-gray-500">{day}</span>
                      <span className={`font-semibold ${hours === 'Closed' ? 'text-red-500' : 'text-gray-800'}`}>
                        {hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ teaser */}
              <div className="bg-cal-poly-green rounded-3xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">💬 Quick support</h3>
                <p className="text-green-100 text-sm leading-relaxed mb-4">
                  For fast answers on orders, delivery times, or product availability — check your order history in your account dashboard.
                </p>
                <p className="text-xs text-green-200">
                  Average response time: <span className="font-bold text-white">under 24 hours</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
