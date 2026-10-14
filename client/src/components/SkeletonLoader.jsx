import React from 'react';

export const SkeletonText = ({ className = '', width = 'w-full' }) => (
  <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${width} ${className}`}></div>
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-4 space-y-4">
      <SkeletonText width="w-3/4" className="h-6" />
      <div className="space-y-2">
        <SkeletonText />
        <SkeletonText width="w-5/6" />
      </div>
      <div className="pt-4 flex justify-between items-center">
        <SkeletonText width="w-1/3" className="h-5" />
        <SkeletonText width="w-1/4" className="h-8 rounded-md" />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse overflow-hidden border border-gray-200 dark:border-slate-700">
    <div className="h-12 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700"></div>
    <div className="divide-y divide-gray-200 dark:divide-slate-700">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-6 p-4">
          <SkeletonText width="w-1/6" />
          <SkeletonText width="w-1/3" />
          <SkeletonText width="w-1/4" />
          <SkeletonText width="w-1/4" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-pulse border border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-full">
              <SkeletonText width="w-1/2" />
              <SkeletonText width="w-3/4" className="h-8" />
            </div>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-80 animate-pulse flex flex-col justify-between border border-gray-100 dark:border-slate-700">
        <SkeletonText width="w-1/4" className="h-6" />
        <div className="h-4/5 w-full bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-80 animate-pulse flex flex-col justify-between border border-gray-100 dark:border-slate-700">
        <SkeletonText width="w-1/4" className="h-6" />
        <div className="h-4/5 w-full bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
      </div>
    </div>
  </div>
);
