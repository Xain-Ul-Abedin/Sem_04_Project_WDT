import { useEffect, useMemo, useState } from 'react';
import { Plus, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getApiData, getApiList } from '../../services/apiResponse';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from '../../components/admin/AdminPageState';

const defaultForm = {
  name: '',
  price: '',
  description: '',
  includes: '',
  maxPerBooking: 10,
  isActive: true,
};

const ManageTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(defaultForm);

  const activeCount = useMemo(
    () => tickets.filter((ticket) => ticket.isActive).length,
    [tickets]
  );

  const fetchTickets = async () => {
    try {
      setErrorState(false);
      const response = await api.get('/tickets');
      setTickets(getApiList(response));
    } catch {
      setErrorState(true);
      toast.error('Failed to fetch ticket types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openCreateModal = () => {
    setEditingTicket(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name || '',
      price: ticket.price ?? '',
      description: ticket.description || '',
      includes: ticket.includes?.join(', ') || '',
      maxPerBooking: ticket.maxPerBooking ?? 10,
      isActive: ticket.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      description: formData.description.trim(),
      includes: formData.includes
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      maxPerBooking: Number(formData.maxPerBooking),
      isActive: formData.isActive,
    };

    try {
      const response = editingTicket
        ? await api.put(`/tickets/${editingTicket._id}`, payload)
        : await api.post('/tickets', payload);

      toast.success(
        getApiData(response)
          ? editingTicket
            ? 'Ticket updated successfully'
            : 'Ticket created successfully'
          : 'Saved successfully'
      );
      setShowModal(false);
      setEditingTicket(null);
      setFormData(defaultForm);
      await fetchTickets();
    } catch (error) {
      toast.error(error.message || 'Failed to save ticket type');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLoadingState label="Loading ticket types..." />;
  }

  if (errorState) {
    return (
      <AdminErrorState
        title="Ticket management is unavailable"
        description="We could not load ticket types right now. Try refreshing this section."
        action={
          <button type="button" className="btn btn-primary rounded-full" onClick={fetchTickets}>
            Retry
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manage Ticket Types</h1>
          <p className="mt-2 text-sm text-slate-500">
            Adjust pricing, booking caps, and public availability without touching the booking flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-black/5">
            {tickets.length} total tickets
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            {activeCount} active for booking
          </div>
          <button type="button" className="btn btn-primary rounded-full" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Add Ticket
          </button>
        </div>
      </div>

      {tickets.length === 0 ? (
        <AdminEmptyState
          title="No ticket types yet"
          description="Create your first ticket so visitors can start booking with real pricing."
          icon={Ticket}
          action={
            <button type="button" className="btn btn-primary rounded-full" onClick={openCreateModal}>
              Create Ticket
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {tickets.map((ticket) => (
            <article key={ticket._id} className="surface-panel rounded-[1.75rem] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-900">{ticket.name}</h2>
                    <span className={`badge border-0 px-3 py-3 text-xs font-bold uppercase ${ticket.isActive ? 'badge-success' : 'badge-warning text-slate-700'}`}>
                      {ticket.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {ticket.description || 'No description added yet.'}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-slate-950 px-5 py-4 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/55">Price</p>
                  <p className="mt-2 text-2xl font-black">Rs {ticket.price}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Max Per Booking</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{ticket.maxPerBooking}</p>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Includes</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                    {ticket.includes?.length ? ticket.includes.join(', ') : 'Zoo Entry'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="btn btn-outline btn-primary rounded-full"
                  onClick={() => openEditModal(ticket)}
                >
                  Edit Ticket
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl rounded-[2rem] border border-black/5 bg-base-100 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <h3 className="text-2xl font-bold text-slate-900">
                {editingTicket ? 'Edit Ticket Type' : 'Create Ticket Type'}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Keep pricing, booking limits, and included access easy to scan for admins.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="form-control">
                  <div className="label px-1">
                    <span className="label-text font-semibold text-slate-700">Ticket Name</span>
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input input-bordered h-14 rounded-2xl bg-white"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="form-control">
                  <div className="label px-1">
                    <span className="label-text font-semibold text-slate-700">Price (Rs)</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    name="price"
                    required
                    className="input input-bordered h-14 rounded-2xl bg-white"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <label className="form-control">
                <div className="label px-1">
                  <span className="label-text font-semibold text-slate-700">Description</span>
                </div>
                <textarea
                  name="description"
                  rows="4"
                  className="textarea textarea-bordered rounded-[1.5rem] bg-white"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="form-control">
                  <div className="label px-1">
                    <span className="label-text font-semibold text-slate-700">Includes</span>
                  </div>
                  <input
                    type="text"
                    name="includes"
                    className="input input-bordered h-14 rounded-2xl bg-white"
                    placeholder="Zoo Entry, Aviary Access"
                    value={formData.includes}
                    onChange={handleInputChange}
                  />
                </label>

                <label className="form-control">
                  <div className="label px-1">
                    <span className="label-text font-semibold text-slate-700">Max Per Booking</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    name="maxPerBooking"
                    required
                    className="input input-bordered h-14 rounded-2xl bg-white"
                    value={formData.maxPerBooking}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <label className="flex items-start gap-4 rounded-[1.25rem] bg-slate-50 p-4">
                <input
                  type="checkbox"
                  name="isActive"
                  className="checkbox checkbox-primary mt-1"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <div>
                  <p className="font-semibold text-slate-900">Visible to visitors</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Turn this off to hide the ticket from public booking without deleting its record.
                  </p>
                </div>
              </label>

              <div className="modal-action mt-2">
                <button type="button" className="btn btn-ghost rounded-full" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary rounded-full" disabled={saving}>
                  {saving ? <span className="loading loading-spinner loading-sm" /> : 'Save Ticket'}
                </button>
              </div>
            </form>
          </div>
          <button type="button" className="modal-backdrop" onClick={() => setShowModal(false)}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ManageTickets;
