import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon, color = 'indigo', delay = 0, trend, subtitle }) {
  const colors = {
    indigo: 'from-indigo-500 to-purple-600 border-l-indigo-500',
    green: 'from-emerald-400 to-emerald-600 border-l-emerald-500',
    red: 'from-rose-400 to-rose-600 border-l-rose-500',
    blue: 'from-blue-400 to-blue-600 border-l-blue-500',
    amber: 'from-amber-400 to-amber-600 border-l-amber-500',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 ${colors[color]} relative overflow-hidden group`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]} opacity-5 rounded-bl-[100px] transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500`}></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h4>
            {trend && (
              <span className={`text-xs font-semibold flex items-center ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}