import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon, title, description, actionText, actionLink, onAction }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 px-4">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">{description}</p>
      {actionLink && <Link to={actionLink} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium">{actionText || 'Get Started'}</Link>}
      {onAction && <button onClick={onAction} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium">{actionText || 'Try Again'}</button>}
    </motion.div>
  );
}
