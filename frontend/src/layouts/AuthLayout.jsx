import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import loginImage from '../assets/login1.jpg';

const { Content } = Layout;

const AuthLayout = () => {
  return (
    <Layout className="h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 font-poppins">
      <Content className="mx-auto w-full ">
        <div className="grid min-h-full overflow-hidden  bg-white shadow-2xl lg:grid-cols-2">
          <section
            className="relative flex min-h-[240px] lg:min-h-full"
            style={{
              backgroundImage: `url(${loginImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/35 to-black/65" />
            <div className="relative z-10 mt-auto p-10 text-white">
              <p className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.18em] backdrop-blur-sm">
                Polycrop
              </p>
              <h1 className="max-w-sm text-4xl font-semibold leading-tight">
                Fresh harvests, seamless ordering.
              </h1>
              <p className="mt-4 max-w-md text-sm text-white/90">
                Manage orders, deliveries, and inventory from one place with a secure account.
              </p>
            </div>
          </section>

          <section className="flex h-full max-h-[680px] items-center justify-center overflow-y-auto p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <Outlet />
            </div>
          </section>
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
