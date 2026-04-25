import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Ban, Calendar, Download, Ticket, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getApiList, getApiPagination } from '../services/apiResponse';
import PaginationControls from '../components/ui/PaginationControls';

const STATUS_BADGES = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  completed: 'badge-neutral',
  cancelled: 'badge-error',
};

const BOOKING_TABS = {
  active: {
    label: 'Active',
    scope: 'active',
    emptyTitle: 'No active bookings',
    emptyDescription: 'Upcoming and in-progress bookings will appear here once you reserve tickets.',
  },
  history: {
    label: 'History',
    scope: 'history',
    emptyTitle: 'No booking history yet',
    emptyDescription: 'Completed and cancelled bookings will move here automatically.',
  },
};

const PAGE_SIZE = 6;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [pagination, setPagination] = useState(null);
  const [pagesByTab, setPagesByTab] = useState({ active: 1, history: 1 });

  useEffect(() => {
    fetchBookings(activeTab, pagesByTab[activeTab]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchBookings = async (tab = activeTab, page = pagesByTab[tab] || 1) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/bookings/my?scope=${BOOKING_TABS[tab].scope}&page=${page}&limit=${PAGE_SIZE}`
      );
      const nextBookings = getApiList(response);
      setBookings(nextBookings);
      setPagination(getApiPagination(response));
      setPagesByTab((current) => ({ ...current, [tab]: page }));
      setSelectedBooking((current) =>
        current ? nextBookings.find((booking) => booking._id === current._id) || nextBookings[0] || null : nextBookings[0] || null
      );
    } catch {
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    const confirmed = window.confirm(
      'Cancel this booking? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings(activeTab, pagesByTab[activeTab]);
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status) =>
    `badge ${STATUS_BADGES[status] || 'badge-ghost'} border-0 px-3 py-3 text-xs font-bold uppercase`;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center pt-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-14 pt-24">
      <div className="section-shell">
        <section className="surface-panel overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">
                <Ticket className="h-4 w-4" />
                Booking Hub
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Your bookings, QR tickets, and visit details in one place.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Active visits stay separate from finished or cancelled ones, so it is easier to
                manage what still needs attention.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-slate-950 px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Current View</p>
                <p className="mt-2 text-2xl font-black">{pagination?.total || 0}</p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-black/5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">On This Page</p>
                <p className="mt-2 text-2xl font-black text-emerald-700">{bookings.length}</p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-black/5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Guests</p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {bookings.reduce((sum, booking) => sum + (booking.totalVisitors || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          {Object.entries(BOOKING_TABS).map(([key, tab]) => (
            <button
              key={key}
              type="button"
              className={`btn rounded-full px-6 ${
                activeTab === key ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => changeTab(key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {bookings.length === 0 ? (
          <div className="surface-panel mt-8 rounded-[2rem] px-6 py-16 text-center sm:px-8">
            <Calendar className="mx-auto h-16 w-16 text-slate-300" />
            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              {BOOKING_TABS[activeTab].emptyTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-500">
              {BOOKING_TABS[activeTab].emptyDescription}
            </p>
            <Link to="/tickets" className="btn btn-primary mt-8 rounded-full px-8">
              Book Tickets Now
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="space-y-4">
                {bookings.map((booking) => {
                  const isSelected = selectedBooking?._id === booking._id;

                  return (
                    <button
                      key={booking._id}
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
                      className={`surface-panel w-full rounded-[1.75rem] p-5 text-left transition ${
                        isSelected
                          ? 'border-emerald-300 bg-emerald-50/60 shadow-[0_12px_30px_rgba(15,122,67,0.12)]'
                          : 'hover:-translate-y-0.5 hover:border-emerald-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                            Reference
                          </p>
                          <p className="mt-2 font-mono text-sm font-bold text-slate-700">
                            {booking.bookingRef}
                          </p>
                        </div>
                        <span className={getStatusBadge(booking.status)}>{booking.status}</span>
                      </div>

                      <div className="mt-6">
                        <p className="text-2xl font-black text-slate-900">
                          {new Date(booking.visitDate).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                            {booking.totalVisitors} visitors
                          </span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                            Rs {booking.totalAmount}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </aside>

              <section className="surface-panel overflow-hidden rounded-[2rem]">
                {selectedBooking ? (
                  <div>
                    <div className="flex flex-col gap-6 border-b border-slate-200 px-6 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                          Lahore Zoo e-ticket
                        </p>
                        <h2 className="mt-3 text-3xl font-black text-slate-900">
                          {selectedBooking.bookingRef}
                        </h2>
                        <p className="mt-3 text-sm text-slate-500">
                          Present this e-ticket or QR code at the gate for faster entry.
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-3 lg:items-end">
                        <span className={getStatusBadge(selectedBooking.status)}>
                          {selectedBooking.status}
                        </span>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Payment
                          <span className="ml-2 text-slate-700">
                            {selectedBooking.paymentStatus}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="space-y-8">
                        <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
                          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">
                            Visit Date
                          </p>
                          <p className="mt-3 flex items-center gap-3 text-3xl font-black">
                            <Calendar className="h-6 w-6 text-amber-300" />
                            {new Date(selectedBooking.visitDate).toLocaleDateString('en-PK', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                            Tickets Included
                          </p>
                          <div className="mt-4 space-y-3">
                            {selectedBooking.tickets.map((ticket, index) => (
                              <div
                                key={`${ticket.ticketType?._id || ticket.ticketName}-${index}`}
                                className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-4"
                              >
                                <span className="font-semibold text-slate-800">
                                  {ticket.quantity} x {ticket.ticketType?.name || ticket.ticketName}
                                </span>
                                <span className="font-bold text-emerald-700">Rs {ticket.subtotal}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
                            <span className="text-lg font-bold text-slate-900">Total Amount</span>
                            <span className="text-3xl font-black text-emerald-700">
                              Rs {selectedBooking.totalAmount}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                            <Users className="h-4 w-4" />
                            Guest Roster ({selectedBooking.totalVisitors})
                          </p>
                          <div className="mt-4 overflow-x-auto rounded-[1.5rem] border border-black/5">
                            <table className="table">
                              <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                  <th>Name</th>
                                  <th>Age</th>
                                  <th>Type</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedBooking.visitors.map((visitor, index) => (
                                  <tr key={`${visitor.name}-${index}`} className="hover">
                                    <td className="font-semibold text-slate-900">{visitor.name}</td>
                                    <td>{visitor.age}</td>
                                    <td className="uppercase text-xs font-bold tracking-[0.2em] text-slate-500">
                                      {visitor.type}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-6">
                        <div className="rounded-[1.75rem] border border-black/5 bg-gradient-to-b from-white to-slate-50 p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                          <div className="mx-auto w-fit rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
                            <QRCodeSVG value={selectedBooking.bookingRef} size={184} />
                          </div>
                          <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-slate-500">
                            Present this QR code at the entrance gates for quick scanning and
                            ticket validation.
                          </p>
                        </div>

                        <div className="rounded-[1.75rem] bg-slate-50 p-5">
                          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                            Actions
                          </p>
                          <div className="mt-4 space-y-3">
                            <button
                              type="button"
                              className="btn btn-outline btn-primary w-full rounded-full"
                              onClick={() => window.print()}
                            >
                              <Download className="h-4 w-4" />
                              Download Ticket
                            </button>

                            {['pending', 'confirmed'].includes(selectedBooking.status) ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-error w-full rounded-full"
                                onClick={() => cancelBooking(selectedBooking._id)}
                              >
                                <Ban className="h-4 w-4" />
                                Cancel Booking
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[520px] items-center justify-center px-6 py-12 text-center text-slate-400">
                    <div>
                      <Calendar className="mx-auto h-12 w-12 opacity-40" />
                      <p className="mt-4 text-base">Select a booking to view its full e-ticket.</p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="mt-8">
              <PaginationControls
                pagination={pagination}
                onPageChange={(page) => fetchBookings(activeTab, page)}
                label="bookings"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
