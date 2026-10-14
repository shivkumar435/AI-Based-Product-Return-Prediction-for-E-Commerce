import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link to="/" className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
        Go Home
      </Link>
    </div>
  );
}