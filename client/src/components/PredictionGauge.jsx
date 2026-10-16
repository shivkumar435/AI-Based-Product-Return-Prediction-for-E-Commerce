export default function PredictionGauge({ probability = 0, isFallback = false }) {
  if (isFallback || probability === null || isNaN(probability)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={60} fill="none" stroke="#e2e8f0" strokeWidth="12" className="dark:opacity-20" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-slate-400 dark:text-slate-500 leading-none">N/A</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Prediction Offline</span>
          </div>
        </div>
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Unavailable
        </span>
      </div>
    );
  }

  // probability is already 0–100 (percentage from Flask/model)
  const percentage = Math.min(Math.round(probability), 100);

  let strokeColor = '#10b981'; // green
  let label = 'Low Risk';
  let labelColor = 'text-emerald-600 dark:text-emerald-400';
  let bgStroke = '#d1fae5';

  if (percentage >= 70) {
    strokeColor = '#ef4444';
    label = 'High Risk';
    labelColor = 'text-red-600 dark:text-red-400';
    bgStroke = '#fee2e2';
  } else if (percentage >= 40) {
    strokeColor = '#f59e0b';
    label = 'Medium Risk';
    labelColor = 'text-amber-600 dark:text-amber-400';
    bgStroke = '#fef3c7';
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          {/* Track */}
          <circle cx="70" cy="70" r={radius} fill="none" stroke={bgStroke} strokeWidth="12" className="dark:opacity-20" />
          {/* Progress */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">{percentage}%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Return Risk</span>
        </div>
      </div>
      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
        percentage >= 70 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
        percentage >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      }`}>
        {label}
      </span>
    </div>
  );
}
