import React, { useEffect, useState } from 'react';
import { Alert, Form, Input, Spin, message } from 'antd';
import { DateTime } from 'luxon';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, updateMyProfile } from '../api/usersApi';

// ── small inline SVG icons ────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.61-.61a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="2" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
  </svg>
);
const KeyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

// ── reusable info row ─────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, accent }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5 font-poppins">
        {label}
      </p>
      <p className={`text-sm leading-relaxed font-poppins ${accent ? 'text-blue-600 font-semibold uppercase tracking-wide text-xs' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  </div>
);

// ── main component ────────────────────────────────────────────────────────────
const Profile = () => {
  const { user, syncUserProfile } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [profile, setProfile]     = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  const fetchProfile = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await getMyProfile(config);
      setProfile(data);
      form.setFieldsValue({
        fullName: data.name    || '',
        email:    data.email   || '',
        phone:    data.phone   || '',
        address:  data.address || '',
        password: '',
      });
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [user?.token]);

  const onFinish = async (values) => {
    if (!user?.token) return;
    setSaving(true);
    try {
      const config  = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        fullName: values.fullName,
        email:    values.email,
        phone:    values.phone,
        address:  values.address,
      };
      if (values.password?.trim()) payload.password = values.password.trim();
      const { data } = await updateMyProfile(payload, config);
      setProfile(data);
      syncUserProfile(data);
      form.setFieldValue('password', '');
      message.success('Profile updated successfully');
      setActiveTab('info');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'info') fetchProfile();
  };

  const displayName = profile?.name || user?.name || 'User';
  const initial     = displayName.charAt(0).toUpperCase();
  const memberSince = profile?.createdAt
    ? DateTime.fromISO(profile.createdAt).toFormat('MMM yyyy')
    : '—';

  // shared input className
  const inputCls = '!rounded-lg !text-sm !font-poppins !border-gray-200 !bg-gray-50 hover:!border-blue-400 focus:!border-blue-500 focus:!shadow-[0_0_0_3px_rgba(37,99,235,0.1)]';
  const labelEl  = (text, optional) => (
    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 font-poppins">
      {text}{optional && <span className="normal-case tracking-normal text-gray-400 font-normal ml-1">(Optional)</span>}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-poppins py-10 px-4">

      {/* not logged in */}
      {!user && (
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <Alert message="Please log in to view your profile." type="warning" showIcon />
          </div>
        </div>
      )}

      {/* loading */}
      {!!user && loading && (
        <div className="flex items-center justify-center min-h-[420px]">
          <Spin size="large" />
        </div>
      )}

      {/* main layout */}
      {!!user && !loading && (
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-5 items-start">

          {/* ══ LEFT SIDEBAR ══ */}
          <div className="w-full lg:w-[268px] flex-shrink-0 flex flex-col gap-4">

            {/* avatar card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-20 bg-SGBUS-green" />
              <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center">
                {/* avatar */}
                <div className="w-20 h-20 rounded-full bg-SGBUS-green border-4 border-white flex items-center justify-center text-white text-3xl font-semibold shadow-md">
                  {initial}
                </div>
                {/* name */}
                <h2 className="mt-3 text-base font-semibold text-gray-900 leading-snug font-poppins">
                  {displayName}
                </h2>
                {/* role badge */}
                <span className="mt-1.5 inline-block bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest font-poppins">
                  {profile?.role || user?.role || 'User'}
                </span>
                {/* status pill */}
                <span className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border font-poppins
                  ${profile?.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${profile?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {profile?.isActive ? 'Active Account' : 'Inactive Account'}
                </span>
                {/* member since */}
                <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 font-poppins">
                  <CalIcon /> Member since {memberSince}
                </p>
              </div>
            </div>

            {/* contact quick-view */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 font-poppins">Contact</p>
              <div className="flex flex-col gap-2.5 text-sm text-gray-500 font-poppins">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-400 flex-shrink-0"><MailIcon /></span>
                  <span className="truncate">{profile?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 flex-shrink-0"><PhoneIcon /></span>
                  <span>{profile?.phone || '—'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 flex-shrink-0 mt-0.5"><MapPinIcon /></span>
                  <span className="leading-relaxed whitespace-pre-wrap">{profile?.address || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* tab bar */}
            <div className="flex gap-6 px-6 border-b border-gray-100">
              {[
                { key: 'info', label: 'Profile Info' },
                // { key: 'edit', label: 'Edit Profile' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key)}
                  className={`relative py-4 text-sm font-medium transition-colors duration-200 outline-none font-poppins
                    ${activeTab === t.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t.label}
                  {activeTab === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* ── INFO TAB ── */}
              {activeTab === 'info' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 font-poppins">Your Details</h3>
                    <button
                      onClick={() => switchTab('edit')}
                      className="flex items-center gap-1.5 bg-SGBUS-green hover:bg-cal-poly-green text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors duration-150 font-poppins"
                    >
                      <EditIcon /> Edit Profile
                    </button>
                  </div>

                  <InfoRow icon={<MailIcon />}   label="Email Address" value={profile?.email   || '—'} />
                  <InfoRow icon={<PhoneIcon />}  label="Phone Number"  value={profile?.phone   || '—'} />
                  <InfoRow icon={<MapPinIcon />} label="Address"       value={profile?.address || '—'} />
                  <InfoRow icon={<ShieldIcon />} label="Account Role"  value={profile?.role || user?.role || '—'} accent />

                  <div className="mt-5 flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <span className="text-blue-500 flex-shrink-0 mt-0.5"><KeyIcon /></span>
                    <p className="text-xs text-blue-700 leading-relaxed font-poppins">
                      To change your password, switch to the <strong>Edit Profile</strong> tab and fill in the New Password field. Leave it blank to keep your current password.
                    </p>
                  </div>
                </div>
              )}

              {/* ── EDIT TAB ── */}
              {activeTab === 'edit' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-5 font-poppins">Edit Your Profile</h3>

                  <Form form={form} layout="vertical" onFinish={onFinish}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                      <Form.Item
                        name="fullName"
                        label={labelEl('Full Name')}
                        rules={[{ required: true, message: 'Full name is required' }]}
                      >
                        <Input placeholder="Your full name" className={inputCls} />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label={labelEl('Email Address')}
                        rules={[
                          { required: true, message: 'Email is required' },
                          { type: 'email', message: 'Enter a valid email address' },
                        ]}
                      >
                        <Input placeholder="your@email.com" className={inputCls} />
                      </Form.Item>

                      <Form.Item
                        name="phone"
                        label={labelEl('Phone Number')}
                        rules={[{
                          pattern: /^$|^\+?[0-9]{7,15}$/,
                          message: 'Enter a valid phone number (7–15 digits)',
                        }]}
                      >
                        <Input placeholder="+1 234 567 8900" className={inputCls} />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label={labelEl('New Password', true)}
                        rules={[{ min: 6, message: 'Password must be at least 6 characters' }]}
                      >
                        <Input.Password
                          placeholder="Leave blank to keep current"
                          className={`${inputCls} focus-within:!border-blue-500 focus-within:!shadow-[0_0_0_3px_rgba(37,99,235,0.1)]`}
                        />
                      </Form.Item>
                    </div>

                    <Form.Item name="address" label={labelEl('Address')}>
                      <Input.TextArea
                        rows={3}
                        placeholder="Your delivery or billing address"
                        className={inputCls}
                      />
                    </Form.Item>

                    <div className="border-t border-gray-100 pt-4 mt-1 flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors duration-150 min-w-[140px] font-poppins"
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                            </svg>
                            Saving…
                          </>
                        ) : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => { switchTab('info'); fetchProfile(); }}
                        className="text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-5 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50 font-poppins"
                      >
                        Cancel
                      </button>
                    </div>
                  </Form>
                </div>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Profile;
