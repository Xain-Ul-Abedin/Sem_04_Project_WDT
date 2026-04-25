import { useEffect, useState } from 'react';
import { CalendarRange, CreditCard, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getApiList, getApiPagination } from '../../services/apiResponse';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from '../../components/admin/AdminPageState';
import PaginationControls from '../../components/ui/PaginationControls';

const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const getBadgeClass = (status) => {
  if (status === 'confirmed') return 'badge-success';
  if (status === 'completed') return 'badge-neutral';
  if (status === 'cancelled') return 'badge-error';
  return 'badge-warning text-slate-700';
};

const PAGE_SIZE = 8;

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [pagination, setPagination] = useState(null);
  const [pagesByTab, setPagesByTab] = useState({ active: 1, history: 1 });

  useEffect(() => {
    fetchBookings(activeTab, pagesByTab[activeTab]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchBookings = async (tab = activeTab, page = pagesByTab[tab] || 1) => {
    try {
      setHasError(false);
      const response = await api.get(`/bookings/all?scope=${tab}&page=${page}&limit=${PAGE_SIZE}`);
      setBookings(getApiList(response));
      setPagination(getApiPagination(response));
      setPagesByTab((current) => ({ ...current, [tab]: page }));
    } catch {
      setHasError(true);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking marked as ${status}`);
      fetchBookings(activeTab, pagesByTab[activeTab]);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const getNextStatuses = (status) => [status, ...(STATUS_TRANSITIONS[status] || [])];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manage Bookings</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review live bookings separately from completed or cancelled history.
          </p>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-black/5">
          {pagination?.total || 0} bookings in this view
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={`btn rounded-full px-6 ${activeTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('active')}
        >
          Active Bookings
        </button>
        <button
          type="button"
          className={`btn rounded-full px-6 ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {loading ? <AdminLoadingState label="Loading bookings..." /> : null}

      {!loading && hasError ? (
        <AdminErrorState
          title="Bookings could not be loaded"
          description="The admin booking list failed to respond. Retry once the API is ready."
          action={
            <button
              type="button"
              className="btn btn-primary rounded-full"
              onClick={() => fetchBookings(activeTab, pagesByTab[activeTab])}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          }
        />
      ) : null}

      {!loading && !hasError && bookings.length === 0 ? (
        <AdminEmptyState
          title={activeTab === 'history' ? 'No booking history yet' : 'No active bookings available'}
          description={
            activeTab === 'history'
              ? 'Completed and cancelled bookings will appear here automatically.'
              : 'Once visitors book tickets, reservations will appear here for admin review.'
          }
        />
      ) : null}

      {!loading && !hasError && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <article key={booking._id} className="surface-panel rounded-[1.75rem] p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-mono text-lg font-bold text-primary">{booking.bookingRef}</h2>
                    <span className={`badge border-0 px-3 py-3 text-xs font-bold uppercase ${getBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className={`badge border-0 px-3 py-3 text-xs font-bold uppercase ${booking.paymentStatus === 'paid' ? 'badge-success' : booking.paymentStatus === 'refunded' ? 'badge-info' : 'badge-ghost'}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Visitor</p>
                      <p className="mt-2 font-semibold text-slate-900">{booking.user?.name || 'Unknown user'}</p>
                      <p className="mt-1 text-sm text-slate-500">{booking.user?.email || 'No email'}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                        <CalendarRange className="h-3.5 w-3.5" />
                        Visit Date
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {new Date(booking.visitDate).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                        <Users className="h-3.5 w-3.5" />
                        Visitors
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">{booking.totalVisitors}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                        <CreditCard className="h-3.5 w-3.5" />
                        Total
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">Rs {booking.totalAmount}</p>
                    </div>
                  </div>
                </div>

                <div className="xl:w-64">
                  <label className="form-control">
                    <div className="label px-1">
                      <span className="label-text font-semibold text-slate-700">Update Status</span>
                    </div>
                    <select
                      className="select select-bordered rounded-2xl bg-white"
                      value={booking.status}
                      disabled={getNextStatuses(booking.status).length <= 1}
                      onChange={(event) => updateStatus(booking._id, event.target.value)}
                    >
                      {getNextStatuses(booking.status).map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    {getNextStatuses(booking.status).length <= 1
                      ? 'This booking is in a terminal state.'
                      : `Allowed next states: ${(STATUS_TRANSITIONS[booking.status] || []).join(', ')}`}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !hasError && bookings.length > 0 ? (
        <PaginationControls
          pagination={pagination}
          onPageChange={(page) => fetchBookings(activeTab, page)}
          label="bookings"
        />
      ) : null}
    </div>
  );
};

export default ManageBookings;
