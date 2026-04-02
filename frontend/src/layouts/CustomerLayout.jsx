import React, { useState, useEffect } from 'react';
import { Badge, Button } from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import logo from "../assets/logoEx.png";
import logo_w from "../assets/logoEx_w.png";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  HomeOutlined,
  ShopOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  DashboardOutlined,
  ProfileOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
  };

  const cartCount = cart?.cartItems?.length || 0;

  const navLinks = [
    { to: '/', label: 'Home', icon: <HomeOutlined /> },
    { to: '/shop', label: 'Shop', icon: <ShopOutlined /> },
    { to: '/about', label: 'About Us', icon: <InfoCircleOutlined /> },
    { to: '/contact', label: 'Contact', icon: <PhoneOutlined /> },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-gray-50">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <img src={logo} alt='logo' className='h-10' />
            </button> 

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(to)
                      ? 'text-cal-poly-green '
                      : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  {label}
                  {isActive(to) && (
                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-SGBUS-green rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-6">
              {/* Cart */}
              <Badge count={cartCount} size="small" className="cursor-pointer">
                <button
                  onClick={() => navigate('/cart')}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all"
                  aria-label="Cart"
                >
                  <ShoppingCartOutlined className="text-2xl" />
                </button>
              </Badge>

              {/* Auth */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center "
                  >
                    <div className="w-10 h-10 rounded-full bg-SGBUS-green flex items-center justify-center text-white text-lg font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    {/* <span className="max-w-[100px] truncate">{user.name}</span> */}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fade-in">
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <DashboardOutlined className="text-green-600" /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <ProfileOutlined className="text-green-600" /> Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <UnorderedListOutlined className="text-green-600" /> Orders
                      </Link>
                      <div className="border-t border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogoutOutlined /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-cal-poly-green transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/auth/signup')}
                    className="px-4 py-1.5 text-sm font-semibold text-white bg-SGBUS-green hover:bg-cal-poly-green rounded-full shadow-sm transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'text-green-700 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-green-600">{icon}</span>
                  {label}
                </Link>
              ))}

              <div className="border-t border-gray-100 pt-3 mt-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <DashboardOutlined className="text-green-600" /> Dashboard
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <ProfileOutlined className="text-green-600" /> Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <UnorderedListOutlined className="text-green-600" /> Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1"
                    >
                      <LogoutOutlined /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-4">
                    <button
                      onClick={() => navigate('/auth/login')}
                      className="w-full py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-green-300 transition-all"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate('/auth/register')}
                      className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-sm"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-grow mt-16">
        <Outlet />
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-cal-poly-green text-green-400">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
               <img src={logo_w} alt='logo' className='h-10 mb-5' />
              <p className="text-sm leading-relaxed text-green-300">
                Connecting smart agriculture with convenient online crop selling. Fresh from our polytunnels to your table.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-green-300 hover:text-green-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-sm text-green-300">
                <li>123 Green Valley Road, Colombo, Sri Lanka</li>
                <li>+94 71 234 5678</li>
                <li>
                  <a href="mailto:support@polycrop.com" className="hover:text-green-400 transition-colors">
                    support@polycrop.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-green-800 mt-10 pt-6 text-center text-xs text-green-600">
            © {new Date().getFullYear()} PolyCrop — Polytunnel Crop Management System. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.15s ease-out; }
      `}</style>
    </div>
  );
};

export default CustomerLayout;
