import React from 'react';
import { useForm } from 'react-hook-form';

export default function AddressForm({ address, onSubmit, onCancel, loading = false }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: address || {
      fullName: '',
      phone: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Full Name</label>
          <input
            {...register("fullName", { required: "Full name is required" })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Phone Number</label>
          <input
            {...register("phone", { required: "Phone number is required", pattern: { value: /^[0-9+\-\s()]+$/, message: "Invalid phone number format" } })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Street Address</label>
        <textarea
          {...register("streetAddress", { required: "Street address is required" })}
          rows="2"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        ></textarea>
        {errors.streetAddress && <p className="mt-1 text-xs text-red-500">{errors.streetAddress.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">City</label>
          <input
            {...register("city", { required: "City is required" })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">State / Province</label>
          <input
            {...register("state", { required: "State is required" })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">ZIP / Postal Code</label>
          <input
            {...register("zipCode", { required: "ZIP code is required" })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Country</label>
          <input
            {...register("country", { required: "Country is required" })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}
