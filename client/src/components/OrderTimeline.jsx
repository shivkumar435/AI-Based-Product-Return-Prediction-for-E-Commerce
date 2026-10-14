import React from 'react';

export default function OrderTimeline({ statusHistory = [], currentStatus }) {
  const steps = [
    { label: 'Pending', key: 'Pending' },
    { label: 'Confirmed', key: 'Confirmed' },
    { label: 'Packed', key: 'Packed' },
    { label: 'Shipped', key: 'Shipped' },
    { label: 'Out for Delivery', key: 'Out for Delivery' },
    { label: 'Delivered', key: 'Delivered' }
  ];

  let currentStepIndex = steps.findIndex(s => s.key === currentStatus);
  if (currentStepIndex === -1 && ['Cancelled', 'Return Requested', 'Return Approved', 'Return Rejected', 'Returned', 'Refunded'].includes(currentStatus)) {
    steps.length = 0;
  }

  const historyDisplay = steps.length > 0 ? steps : statusHistory.map(h => ({ label: h.status, key: h.status }));

  return (
    <div className="py-4">
      <div className="relative border-l border-gray-200 dark:border-slate-700 ml-3 md:ml-4">
        {historyDisplay.map((step, index) => {
          const historyItem = statusHistory.find(h => h.status === step.key);
          const isCompleted = historyItem != null || (steps.length > 0 && index < currentStepIndex);
          const isCurrent = steps.length > 0 ? index === currentStepIndex : index === statusHistory.length - 1;

          return (
            <div key={index} className="mb-8 ml-6 relative">
              <span className={`absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${isCurrent ? 'bg-indigo-600 animate-pulse' : isCompleted ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-700'}`}>
                {isCompleted && !isCurrent ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : isCurrent ? (
                   <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                ) : null}
              </span>
              <h4 className={`text-sm font-semibold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.label}
              </h4>
              {historyItem?.timestamp && (
                <time className="block mb-1 text-xs font-normal text-gray-400 dark:text-gray-500">
                  {new Date(historyItem.timestamp).toLocaleString()}
                </time>
              )}
              {historyItem?.note && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{historyItem.note}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
