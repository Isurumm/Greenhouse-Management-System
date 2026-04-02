import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';

/* ─── Tiny badge ─────────────────────────────────────────────────────────── */
const Tag = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-SGBUS-green/10 text-SGBUS-green text-xs font-semibold uppercase tracking-widest">
   
    {children}
  </span>
);

/* ─── Offer card ─────────────────────────────────────────────────────────── */
const OfferCard = ({ icon, text }) => (
  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
    <div className="text-2xl flex-shrink-0">{icon}</div>
    <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
  </div>
);

/* ─── Reason chip ────────────────────────────────────────────────────────── */
const Reason = ({ text }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
    <CheckCircleOutlined className="text-green-500 text-lg flex-shrink-0" />
    <span className="text-gray-700">{text}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="font-poppins">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-green-100/60 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-100/60 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="mt-5 text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Fresh Produce, Grown Right,{' '}
            <span className="bg-clip-text text-transparent bg-SGBUS-green">
              Delivered to You
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Welcome to PolyCrop — your trusted destination for fresh, polytunnel-grown crops. We are focused on giving you easy, convenient access to high-quality produce grown with care and precision.
          </p>
        </div>
      </section>

      {/* ── WHO WE ARE ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Illustration */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-green-100 rounded-3xl rotate-3" />
                <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-10 flex flex-col items-center gap-6">
                  <span className="text-7xl">🌿</span>
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900">Polytunnel Grown</p>
                    <p className="text-green-700 font-medium mt-1">Fresh. Clean. Quality.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <p className="text-2xl">🥦</p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">Fresh Vegetables</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <p className="text-2xl">🌱</p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">Herbs & Greens</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <p className="text-2xl">🍅</p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">Seasonal Fruits</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <p className="text-2xl">🛒</p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">Easy Ordering</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <Tag>Who We Are</Tag>
              <h2 className="mt-4 text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                Where the polytunnel meets your kitchen
              </h2>
              <p className="mt-5 text-gray-500 leading-relaxed text-lg">
                PolyCrop is a fresh produce platform built for customers who value quality. Our crops are grown inside controlled polytunnel environments — meaning better consistency, fewer pesticides, and produce that reaches you at peak freshness.
              </p>
              <p className="mt-4 text-gray-500 leading-relaxed">
                We make it simple to browse what's available, discover what's in season, and place your order from the comfort of your home — all in just a few clicks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-cal-poly-green">
        <div className="max-w-7xl mx-auto text-center">
          <Tag>Our Mission</Tag>
          <h2 className="mt-4 text-3xl md:text-4xl font-black text-white leading-tight">
            Better produce. Better access. Better experience.
          </h2>
          <p className="mt-6 text-green-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Our mission is to give every customer simple, reliable access to the freshest polytunnel-grown crops. We aim to make discovering, choosing, and receiving quality produce as effortless as possible — with full visibility into what's fresh and available at all times.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: '',
                title: 'Polytunnel Freshness',
                desc: "Every product comes from controlled polytunnel farms — ensuring cleaner, fresher, and better-quality produce for you.",
              },
              {
                icon: '',
                title: 'Real Availability',
                desc: "See exactly what's in season and in stock. No guesswork — just fresh produce listed as it becomes available.",
              },
              {
                icon: '',
                title: 'Simple Shopping',
                desc: "A clean, easy-to-use platform built around your experience — from browsing to checkout to your doorstep.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-left">
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-3 font-bold text-white text-lg">{title}</h3>
                <p className="mt-2 text-green-100 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Tag>What We Offer</Tag>
            <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900">
              Everything fresh, right at your fingertips
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              From browsing to buying, we've built every part of the experience with you in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <OfferCard
              icon="🛒"
              text="Fresh crop browsing and online purchasing — discover seasonal polytunnel produce and place orders effortlessly from home."
            />
            <OfferCard
              icon="✨"
              text="An easy-to-use shopping experience — clean interface, straightforward navigation, and a smooth checkout process."
            />
            <OfferCard
              icon="📋"
              text="Clear visibility into available produce — always know what's fresh, what's in season, and what's ready to order."
            />
            <OfferCard
              icon="🚚"
              text="Reliable order handling and delivery — from the moment you place your order to when it arrives at your door."
            />
            <OfferCard
              icon="🌿"
              text="A curated selection of polytunnel-grown crops — vegetables, leafy greens, herbs, and seasonal fruits at their best."
            />
            <OfferCard
              icon="💬"
              text="Dedicated customer support — we're here to help with any questions about your orders, products, or deliveries."
            />
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            <div>
              <Tag>Why Choose Us</Tag>
              <h2 className="mt-4 text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                The PolyCrop difference
              </h2>
              <p className="mt-5 text-gray-500 leading-relaxed">
                We don't just sell produce — we care about the quality you receive, the experience you have, and the value you get every time you shop with us.
              </p>

              <div className="mt-8">
                <Reason text="Fresh and quality-focused produce — every item polytunnel-grown and quality-checked before listing." />
                <Reason text="Simple and user-friendly shopping experience — from discovery to doorstep delivery." />
                <Reason text="Clear and honest availability — only what's truly fresh and ready gets listed." />
                <Reason text="Reliable order fulfilment — consistent, dependable delivery every time." />
                <Reason text="A platform built for your convenience, comfort, and satisfaction." />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Happy Customers', bg: 'bg-green-50 border-green-100' },
                { value: '50+', label: 'Crop Varieties', bg: 'bg-emerald-50 border-emerald-100' },
                { value: '100%', label: 'Polytunnel Grown', bg: 'bg-teal-50 border-teal-100' },
                { value: '4.9/5', label: 'Customer Rating', bg: 'bg-lime-50 border-lime-100' },
              ].map(({ value, label, bg }) => (
                <div key={label} className={`${bg} border rounded-2xl p-6 text-center`}>
                  <div className="text-4xl font-black text-gray-900">{value}</div>
                  <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="mt-5 text-3xl md:text-4xl font-black text-gray-900">
            Fresh produce, made easy
          </h2>
          <p className="mt-5 text-gray-500 text-lg leading-relaxed">
            We believe everyone deserves access to genuinely fresh, quality produce — without the hassle. Our goal is to make your experience of buying polytunnel-grown crops as enjoyable and convenient as possible, every single time.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 px-8 py-2 bg-SGBUS-green hover:bg-cal-poly-green text-white font-bold rounded-full shadow-lg shadow-green-200 transition-all"
            >
              Start Shopping <ArrowRightOutlined />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 px-8 py-2 bg-white text-gray-800 font-bold rounded-full border border-gray-200 hover:border-SGBUS-green transition-all"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
