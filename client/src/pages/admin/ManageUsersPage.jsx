import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import { SkeletonTable } from '../../components/SkeletonLoader';
import DataTable from '../../components/DataTable';
import toast from 'react-hot-toast';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const columns = [
    {
      key: 'avatar', label: '', render: row => (
        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {row.name?.charAt(0).toUpperCase()}
        </div>
      )
    },
    { key: 'name', label: 'Name', render: row => <div className="font-medium text-slate-900 dark:text-white">{row.name}</div> },
    { key: 'email', label: 'Email', render: row => <div className="text-sm text-gray-500 dark:text-gray-400">{row.email}</div> },
    { key: 'role', label: 'Role', render: row => (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${row.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'}`}>
        {row.role === 'admin' ? '👑 Admin' : 'User'}
      </span>
    )},
    { key: 'createdAt', label: 'Joined', render: row => <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(row.createdAt).toLocaleDateString()}</span> },
    { key: 'actions', label: 'Actions', render: row => (
      <button
        disabled={row.role === 'admin'}
        onClick={() => handleDelete(row._id)}
        className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Delete
      </button>
    )}
  ];

  const admins = users.filter(u => u.role === 'admin').length;
  const regular = users.filter(u => u.role !== 'admin').length;

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{users.length} total — {admins} admin, {regular} users</p>
        </div>
      </div>

      {loading ? <SkeletonTable /> : (
        users.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-16 text-center text-gray-400">
            No users found.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <DataTable columns={columns} data={users} exportable exportFilename="users" />
          </div>
        )
      )}
    </motion.div>
    </PageTransition>
  );
}
