import { useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getApiList, getApiPagination } from '../../services/apiResponse';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from '../../components/admin/AdminPageState';
import PaginationControls from '../../components/ui/PaginationControls';

const PAGE_SIZE = 8;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [pagination, setPagination] = useState(null);
  const [pagesByTab, setPagesByTab] = useState({ active: 1, history: 1 });

  useEffect(() => {
    fetchUsers(activeTab, pagesByTab[activeTab]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchUsers = async (tab = activeTab, page = pagesByTab[tab] || 1) => {
    try {
      setHasError(false);
      const response = await api.get(`/admin/users?scope=${tab}&page=${page}&limit=${PAGE_SIZE}`);
      setUsers(getApiList(response));
      setPagination(getApiPagination(response));
      setPagesByTab((current) => ({ ...current, [tab]: page }));
    } catch {
      setHasError(true);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-status`);
      toast.success('User status updated');
      fetchUsers(activeTab, pagesByTab[activeTab]);
    } catch (error) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      toast.success('User role updated');
      fetchUsers(activeTab, pagesByTab[activeTab]);
    } catch (error) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manage Users</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review account status, promote staff, and move inactive accounts into a cleaner history view.
          </p>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-black/5">
          {pagination?.total || 0} users in this view
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={`btn rounded-full px-6 ${activeTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('active')}
        >
          Active Accounts
        </button>
        <button
          type="button"
          className={`btn rounded-full px-6 ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {loading ? <AdminLoadingState label="Loading users..." /> : null}

      {!loading && hasError ? (
        <AdminErrorState
          title="Users could not be loaded"
          description="The admin user directory did not respond correctly. Retry this section."
          action={
            <button
              type="button"
              className="btn btn-primary rounded-full"
              onClick={() => fetchUsers(activeTab, pagesByTab[activeTab])}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          }
        />
      ) : null}

      {!loading && !hasError && users.length === 0 ? (
        <AdminEmptyState
          title={activeTab === 'history' ? 'No inactive accounts' : 'No active users found'}
          description={
            activeTab === 'history'
              ? 'Deactivated or suspended accounts will move here automatically.'
              : 'Registered users will appear here once signups are available.'
          }
        />
      ) : null}

      {!loading && !hasError && users.length > 0 ? (
        <div className="grid gap-4">
          {users.map((user) => (
            <article key={user._id} className="surface-panel rounded-[1.75rem] p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:gap-4">
                  <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">User</p>
                    <p className="mt-2 font-semibold text-slate-900">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Role
                    </p>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">{user.role}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Status</p>
                    <span className={`badge mt-2 border-0 px-3 py-3 text-xs font-bold uppercase ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Joined</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString('en-PK')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:w-72">
                  <label className="form-control">
                    <div className="label px-1">
                      <span className="label-text flex items-center gap-2 font-semibold text-slate-700">
                        <UserCog className="h-4 w-4" />
                        Role Access
                      </span>
                    </div>
                    <select
                      className="select select-bordered rounded-2xl bg-white"
                      value={user.role}
                      onChange={(event) => changeRole(user._id, event.target.value)}
                    >
                      <option value="visitor">Visitor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <button
                    className={`btn rounded-full ${user.isActive ? 'btn-outline btn-error' : 'btn-outline btn-success'}`}
                    onClick={() => toggleStatus(user._id)}
                  >
                    {user.isActive ? 'Suspend Account' : 'Restore Account'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !hasError && users.length > 0 ? (
        <PaginationControls
          pagination={pagination}
          onPageChange={(page) => fetchUsers(activeTab, page)}
          label="users"
        />
      ) : null}
    </div>
  );
};

export default ManageUsers;
