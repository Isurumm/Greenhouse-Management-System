import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SlLocationPin } from "react-icons/sl";

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter your shipping address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '', address: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        password: data.password
      });
      message.success('Registration successful!');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full font-poppins">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
        <p className="text-gray-500 mt-2">Join us to start shopping</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <Input {...field} size="large" prefix={<UserOutlined className="text-gray-400" />} placeholder="Full Name" status={errors.fullName ? 'error' : ''} />
            )}
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} size="large" prefix={<MailOutlined className="text-gray-400" />} placeholder="Email Address" status={errors.email ? 'error' : ''} />
            )}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input {...field} size="large" prefix={<PhoneOutlined className="text-gray-400" />} placeholder="Phone Number" status={errors.phone ? 'error' : ''} />
            )}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input {...field} size="large" autoSize={{ minRows: 2, maxRows: 4 }} prefix={<SlLocationPin className="text-gray-400" />} placeholder="Shipping Address" status={errors.address ? 'error' : ''} />
            )}
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
        </div>
        <div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="Password" status={errors.password ? 'error' : ''} />
            )}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
         <div className='pb-4'>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="Confirm Password" status={errors.confirmPassword ? 'error' : ''} />
            )}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>
        
        <Button type="primary" htmlType="submit" className="w-full h-10 text-lg font-semibold bg-SGBUS-green hover:bg-cal-poly-green rounded-3xl  border-none mt-2" loading={loading}>
          Create Account
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account? <Link to="/auth/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
      </div>
    </div>
  );
};

export default Signup;
