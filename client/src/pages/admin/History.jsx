import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Cat,
  Image as ImageIcon,
  RefreshCw,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getApiList, getApiPagination } from '../../services/apiResponse';
import PaginationControls from '../../components/ui/PaginationControls';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from '../../components/admin/AdminPageState';

const PAGE_SIZE = 8;

const HISTORY_FILTERS = {
  bookings: {
    label: 'Reservations',
    singularLabel: 'reservation',
    icon: Ticket,
    fetchMode: 'remote',
    request: (page) => `/bookings/all?scope=history&page=${page}&limit=${PAGE_SIZE}`,
    emptyTitle: 'No reservation history',
    emptyDescription: 'Completed and cancelled bookings will appear here.',
  },
  users: {
    label: 'Users',
    singularLabel: 'user',
    icon: Users,
    fetchMode: 'remote',
    request: (page) => `/admin/users?scope=history&page=${page}&limit=${PAGE_SIZE}`,
    emptyTitle: 'No user history',
    emptyDescription: 'Deactivated user accounts will appear here.',
  },
  animals: {
    label: 'Animals',
    singularLabel: 'animal',
    icon: Cat,
    fetchMode: 'remote',
    request: (page) => `/animals?includeInactive=true&scope=history&page=${page}&limit=${PAGE_SIZE}`,
    emptyTitle: 'No animal history',
    emptyDescription: 'Inactive animal records will appear here after deactivation.',
  },
  gallery: {
    label: 'Gallery',
    singularLabel: 'gallery item',
    icon: ImageIcon,
    fetchMode: 'remote',
    request: (page) => `/gallery?includeInactive=true&scope=history&page=${page}&limit=${PAGE_SIZE}`,
    emptyTitle: 'No gallery history',
    emptyDescription: 'Archived gallery items will appear here after removal from the public wall.',
  },
  tickets: {
    label: 'Tickets',
    singularLabel: 'ticket',
    icon: Archive,
    fetchMode: 'local',
    request: () => '/tickets',
    emptyTitle: 'No ticket history',
    emptyDescription: 'Hidden or inactive ticket types will appear here.',
  },
};

const getLocalPagination = (items, page, limit) => ({
  page,
  limit,
  total: items.length,
  pages: Math.max(1, Math.ceil(items.length / limit)),
});

const History = () => {
  const [activeFilter, setActiveFilter] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [pagesByFilter, setPagesByFilter] = useState({
    bookings: 1,
    users: 1,
    animals: 1,
    gallery: 1,
    tickets: 1,
  });

  const activeConfig = HISTORY_FILTERS[activeFilter];

  const fetchHistory = async (filter = activeFilter, page = pagesByFilter[filter] || 1) => {
    try {
      setLoading(true);
      setHasError(false);

      const config = HISTORY_FILTERS[filter];
      const response = await api.get(config.request(page));
      let nextItems = getApiList(response);
      let nextPagination = getApiPagination(response);

      if (config.fetchMode === 'local') {
        nextItems = nextItems.filter((item) => !item.isActive);
        nextPagination = getLocalPagination(nextItems, page, PAGE_SIZE);
        const start = (page - 1) * PAGE_SIZE;
        nextItems = nextItems.slice(start, start + PAGE_SIZE);
      }

      setItems(nextItems);
      setPagination(nextPagination);
      setPagesByFilter((current) => ({ ...current, [filter]: page }));
    } catch (error) {
      setHasError(true);
      toast.error(error.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(activeFilter, pagesByFilter[activeFilter]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const headerCount = useMemo(() => pagination?.total || 0, [pagination]);

  const handleDeleteRecord = async (id) => {
    const confirmed = window.confirm(
      `Permanently delete this ${activeConfig.singularLabel} record from the database? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/admin/history/${activeFilter}/${id}`);
      toast.success('History record permanently deleted');
      const targetPage = items.length === 1 && (pagination?.page || 1) > 1
        ? (pagination?.page || 1) - 1
        : pagination?.page || 1;
      await fetchHistory(activeFilter, targetPage);
    } catch (error) {
      toast.error(error.message || 'Failed to permanently delete record');
    } finally {
      setDeletingId('');
    }
  };

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      `Permanently delete all ${activeConfig.label.toLowerCase()} history records from the database? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsClearing(true);
      const response = await api.delete(`/admin/history/${activeFilter}`);
      toast.success(response.message || 'History cleared');
      await fetchHistory(activeFilter, 1);
    } catch (error) {
      toast.error(error.message || 'Failed to clear history');
    } finally {
      setIsClearing(false);
    }
  };

  const DeleteAction = ({ id }) => (
    <button
      type="button"
      className="btn btn-outline btn-error rounded-full btn-sm"
      disabled={deletingId === id}
      onClick={() => handleDeleteRecord(id)}
    >
      {deletingId === id ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Delete Permanently
    </button>
  );

  const renderCard = (item) => {
    if (activeFilter === 'bookings') {
      return (
        <article key={item._id} className="surface-panel rounded-[1.75rem] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-lg font-bold text-primary">{item.bookingRef}</p>
              <p className="mt-1 text-sm text-slate-500">{item.user?.name || 'Unknown visitor'}</p>
            </div>
            <span className={`badge border-0 px-3 py-3 text-xs font-bold uppercase ${item.status === 'completed' ? 'badge-neutral' : 'badge-error'}`}>
              {item.status}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Visit Date</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {new Date(item.visitDate).toLocaleDateString('en-PK')}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Visitors</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.totalVisitors}</p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Amount</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Rs {item.totalAmount}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <DeleteAction id={item._id} />
          </div>
        </article>
      );
    }

    if (activeFilter === 'users') {
      return (
        <article key={item._id} className="surface-panel rounded-[1.75rem] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{item.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.email}</p>
            </div>
            <span className="badge badge-error border-0 px-3 py-3 text-xs font-bold uppercase">
              inactive
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Role</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.15em] text-slate-900">{item.role}</p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Joined</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{new Date(item.createdAt).toLocaleDateString('en-PK')}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <DeleteAction id={item._id} />
          </div>
        </article>
      );
    }

    if (activeFilter === 'animals') {
      return (
        <article key={item._id} className="surface-panel rounded-[1.75rem] overflow-hidden">
          <div className="grid gap-0 md:grid-cols-[220px_1fr]">
            <img
              src={item.imageUrl || 'https://placehold.co/400x300?text=No+Image'}
              alt={item.name}
              className="h-full min-h-[200px] w-full object-cover"
            />
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{item.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.species}</p>
                </div>
                <span className="badge badge-warning border-0 px-3 py-3 text-xs font-bold uppercase text-slate-700">
                  inactive
                </span>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {item.category}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {item.location?.zone || 'Zone not set'}
                </span>
              </div>
              <div className="mt-4 flex justify-end">
                <DeleteAction id={item._id} />
              </div>
            </div>
          </div>
        </article>
      );
    }

    if (activeFilter === 'gallery') {
      return (
        <article key={item._id} className="surface-panel rounded-[1.75rem] overflow-hidden">
          <div className="grid gap-0 md:grid-cols-[220px_1fr]">
            <img src={item.imageUrl} alt={item.title} className="h-full min-h-[200px] w-full object-cover" />
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.photographer || 'Lahore Zoo'}</p>
                </div>
                <span className="badge badge-warning border-0 px-3 py-3 text-xs font-bold uppercase text-slate-700">
                  archived
                </span>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {item.category}
                </span>
                {item.isFeatured ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                    previously featured
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex justify-end">
                <DeleteAction id={item._id} />
              </div>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article key={item._id} className="surface-panel rounded-[1.75rem] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{item.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{item.description || 'No description added.'}</p>
          </div>
          <span className="badge badge-warning border-0 px-3 py-3 text-xs font-bold uppercase text-slate-700">
            inactive
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Price</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Rs {item.price}</p>
          </div>
          <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Max Per Booking</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{item.maxPerBooking}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <DeleteAction id={item._id} />
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">History</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review archived and inactive records across reservations, users, animals, gallery items, and tickets.
          </p>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-black/5">
          {headerCount} records in this filter
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-outline btn-error rounded-full"
          disabled={isClearing || headerCount === 0}
          onClick={handleClearHistory}
        >
          {isClearing ? <span className="loading loading-spinner loading-sm" /> : <Trash2 className="h-4 w-4" />}
          Clear {activeConfig.label} History
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(HISTORY_FILTERS).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              type="button"
              className={`btn rounded-full px-6 ${activeFilter === key ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter(key)}
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {loading ? <AdminLoadingState label={`Loading ${activeConfig.label.toLowerCase()} history...`} /> : null}

      {!loading && hasError ? (
        <AdminErrorState
          title="History could not be loaded"
          description="This history filter hit an API issue. Retry to continue reviewing archived records."
          action={
            <button
              type="button"
              className="btn btn-primary rounded-full"
              onClick={() => fetchHistory(activeFilter, pagesByFilter[activeFilter])}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          }
        />
      ) : null}

      {!loading && !hasError && items.length === 0 ? (
        <AdminEmptyState
          title={activeConfig.emptyTitle}
          description={activeConfig.emptyDescription}
          icon={activeConfig.icon}
        />
      ) : null}

      {!loading && !hasError && items.length > 0 ? (
        <>
          <div className="grid gap-4">
            {items.map(renderCard)}
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={(page) => fetchHistory(activeFilter, page)}
            label={activeConfig.label.toLowerCase()}
          />
        </>
      ) : null}
    </div>
  );
};

export default History;
