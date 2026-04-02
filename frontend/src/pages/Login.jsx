import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const user = await login(data.email, data.password);
      message.success('Login successful!');
      if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full font-poppins">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 mt-2">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Email Address"
                status={errors.email ? 'error' : ''}
              />
            )}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                size="large"
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Password"
                status={errors.password ? 'error' : ''}
              />
            )}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <Button
          type="primary"
          htmlType="submit"
          className="w-full h-10 text-lg font-semibold bg-SGBUS-green hover:bg-cal-poly-green rounded-3xl border-none mt-4"
          loading={loading}
        >
          Sign In
        </Button>
      </form>
      <div className="mt-8 text-center text-sm text-gray-600">
        Don't have an account? <Link to="/auth/signup" className="text-green-600 font-semibold hover:underline">Sign up</Link>
      </div>
    </div>
  );
};

export default Login;
