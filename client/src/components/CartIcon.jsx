import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartIcon() {
  const { cartCount } = useCart();
  return (
    <Link to="/cart" className="relative p-2 text-slate-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
      {cartCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  );
}
