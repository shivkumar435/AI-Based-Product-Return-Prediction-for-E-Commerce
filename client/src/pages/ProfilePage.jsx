import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, email: user?.email }
  });
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      await authService.updateProfile(data);
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <PageTransition>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Avatar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-br from-indigo-600 to-purple-600" />
        <div className="px-8 pb-6 -mt-12">
          <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <span className={`self-start sm:self-auto px-3 py-1.5 text-xs font-semibold rounded-full ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
              {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Account Information</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your name and email address.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
            <input
              type="text"
              disabled
              value={user?.role === 'admin' ? 'Admin' : 'User'}
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-gray-500 text-sm cursor-not-allowed"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-500/20 disabled:opacity-60 flex items-center gap-2"
            >
              {updating ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving...</>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Change Password</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your password to keep your account secure.</p>
        </div>
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
            <input
              type="password"
              {...registerPassword('currentPassword', { required: 'Current password is required' })}
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
            />
            {passwordErrors.currentPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
            <input
              type="password"
              {...registerPassword('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
            />
            {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              {...registerPassword('confirmPassword', { required: 'Confirm your new password' })}
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
            />
            {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword.message}</p>}
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-500/20 disabled:opacity-60 flex items-center gap-2"
            >
              {changingPassword ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Updating...</>
              ) : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Order History', to: '/orders', icon: '📋' },
            { label: 'New Prediction', to: '/order', icon: '🧠' },
            { label: 'Browse Products', to: '/products', icon: '🛒' },
          ].map(link => (
            <Link key={link.to} to={link.to} className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors group">
              <span className="text-lg">{link.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
      </motion.div>
    </PageTransition>
  );
}
