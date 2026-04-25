import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ShieldCheck,
  Users,
} from 'lucide-react';
import api from '../services/api';
import { getApiList } from '../services/apiResponse';

const STEPS = [
  { label: 'Date', icon: Calendar },
  { label: 'Tickets', icon: Users },
  { label: 'Details', icon: Users },
  { label: 'Payment', icon: CreditCard },
];

const PAYMENT_METHODS = [
  { value: 'visa', label: 'Visa', note: 'Instant mock approval for card checkout.' },
  { value: 'mastercard', label: 'Mastercard', note: 'Secure card payment with reservation hold.' },
  { value: 'jazzcash', label: 'JazzCash', note: 'Fast local wallet checkout for visitors in Pakistan.' },
  { value: 'easypaisa', label: 'EasyPaisa', note: 'Simple mobile payment with instant confirmation.' },
  { value: 'cash_on_arrival', label: 'Cash on Arrival', note: 'Reserve now and settle at the gate.' },
];

const Tickets = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date(Date.now() + 86400000));
  const [selectedTickets, setSelectedTickets] = useState({});
  const [visitorDetails, setVisitorDetails] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingRef, setBookingRef] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets');
        setTicketTypes(getApiList(response));
      } catch {
        toast.error('Failed to load ticket types');
      }
    };

    fetchTickets();
  }, []);

  const totalTickets = useMemo(
    () => Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0),
    [selectedTickets]
  );

  const totalAmount = useMemo(
    () =>
      Object.entries(selectedTickets).reduce((sum, [id, quantity]) => {
        const ticket = ticketTypes.find((item) => item._id === id);
        return sum + (ticket?.price || 0) * quantity;
      }, 0),
    [selectedTickets, ticketTypes]
  );

  const selectedTicketSummary = useMemo(
    () =>
      Object.entries(selectedTickets)
        .map(([id, quantity]) => {
          const ticket = ticketTypes.find((item) => item._id === id);
          return ticket ? { ...ticket, quantity, subtotal: ticket.price * quantity } : null;
        })
        .filter(Boolean),
    [selectedTickets, ticketTypes]
  );

  const canGoBack = currentStep > 0 && currentStep < 4;

  const handleNext = () => {
    if (currentStep === 0 && !visitDate) {
      toast.error('Please select a visit date');
      return;
    }

    if (currentStep === 1 && totalTickets === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    if (currentStep === 1) {
      const nextVisitorDetails = [];

      Object.entries(selectedTickets).forEach(([id, quantity]) => {
        const ticketName = ticketTypes.find((ticket) => ticket._id === id)?.name?.toLowerCase() || '';
        const visitorType = ticketName.includes('child')
          ? 'child'
          : ticketName.includes('senior')
            ? 'senior'
            : 'adult';

        for (let index = 0; index < quantity; index += 1) {
          nextVisitorDetails.push({ name: '', age: '', type: visitorType });
        }
      });

      setVisitorDetails(nextVisitorDetails);
    }

    if (currentStep === 2) {
      const hasInvalidVisitor = visitorDetails.some(
        (visitor) => visitor.name.trim() === '' || visitor.age === ''
      );

      if (hasInvalidVisitor) {
        toast.error('Please fill in all visitor details');
        return;
      }
    }

    setCurrentStep((step) => step + 1);
  };

  const handleQtyChange = (id, delta, maxPerBooking) => {
    setSelectedTickets((current) => {
      const nextQuantity = Math.max(0, Math.min((current[id] || 0) + delta, maxPerBooking));
      const nextState = { ...current };

      if (nextQuantity === 0) {
        delete nextState[id];
      } else {
        nextState[id] = nextQuantity;
      }

      return nextState;
    });
  };

  const handleVisitorChange = (index, field, value) => {
    setVisitorDetails((current) =>
      current.map((visitor, visitorIndex) =>
        visitorIndex === index ? { ...visitor, [field]: value } : visitor
      )
    );
  };

  const handleSubmit = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsLoading(true);

    try {
      const bookingData = {
        visitDate,
        tickets: Object.entries(selectedTickets).map(([ticketType, quantity]) => ({
          ticketType,
          quantity,
        })),
        visitors: visitorDetails.map((visitor) => ({
          ...visitor,
          age: Number(visitor.age),
        })),
        paymentMethod,
        specialRequests,
      };

      const response = await api.post('/bookings', bookingData);

      if (paymentMethod !== 'cash_on_arrival') {
        await api.post(`/bookings/${response.data._id}/pay`, { paymentMethod });
      }

      setBookingRef(response.data.bookingRef);
      setCurrentStep(4);
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error(error.message || 'Failed to complete booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-14">
      <div className="section-shell">
        <section className="surface-panel overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Smart Reservations
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Reserve your zoo visit in a few guided steps.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Choose the date, lock in the right tickets, and finish checkout with a
                clean summary before you confirm.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-slate-950 px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Visit Date</p>
                <p className="mt-2 text-lg font-semibold">{visitDate.toLocaleDateString()}</p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-black/5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tickets</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{totalTickets}</p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-black/5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Estimated Total</p>
                <p className="mt-2 text-lg font-semibold text-emerald-700">Rs {totalAmount}</p>
              </div>
            </div>
          </div>

          {currentStep < 4 ? (
            <div className="mt-8 grid gap-3 md:grid-cols-4">
              {STEPS.map((step, index) => {
                const isCurrent = index === currentStep;
                const isComplete = index < currentStep;

                return (
                  <div
                    key={step.label}
                    className={`rounded-[1.5rem] border px-4 py-4 transition ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50 shadow-[0_12px_30px_rgba(15,122,67,0.12)]'
                        : isComplete
                          ? 'border-emerald-200 bg-white'
                          : 'border-black/5 bg-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                          isCurrent || isComplete
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                          Step {index + 1}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">{step.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>

        <div className="mt-8">
          <div className="surface-panel rounded-[2rem] p-6 sm:p-8 lg:p-10">
            {currentStep === 0 ? (
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                    Step 1
                  </p>
                  <h2 className="mt-3 flex items-center gap-3 text-3xl font-black text-slate-900">
                    <Calendar className="h-7 w-7 text-emerald-700" />
                    Select your visit date
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                    Choose any available day within the next 90 days. Weekend demand is
                    higher, so early booking is usually the safest move.
                  </p>

                  <div className="mt-8 rounded-[1.75rem] bg-slate-950 p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                      Selected Visit
                    </p>
                    <p className="mt-3 text-3xl font-black">
                      {visitDate.toLocaleDateString('en-PK', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/70">
                      Online reservations are open up to 90 days in advance. Same-day dates
                      are blocked by business rules on the backend.
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-black/5 bg-slate-50 p-4">
                  <DatePicker
                    selected={visitDate}
                    onChange={(date) => setVisitDate(date)}
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 90 * 86400000)}
                    inline
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                      Step 2
                    </p>
                    <h2 className="mt-3 flex items-center gap-3 text-3xl font-black text-slate-900">
                      <Users className="h-7 w-7 text-emerald-700" />
                      Choose ticket types
                    </h2>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                    {totalTickets} selected · Rs {totalAmount}
                  </div>
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                  {ticketTypes.map((ticket) => {
                    const quantity = selectedTickets[ticket._id] || 0;

                    return (
                      <article
                        key={ticket._id}
                        className={`rounded-[1.75rem] border p-5 transition ${
                          quantity > 0
                            ? 'border-emerald-300 bg-emerald-50/60 shadow-[0_12px_30px_rgba(15,122,67,0.08)]'
                            : 'border-black/5 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-900">{ticket.name}</h3>
                            <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                              {ticket.description}
                            </p>
                          </div>
                          <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">
                            Rs {ticket.price}
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between rounded-[1.25rem] bg-slate-50 p-3">
                          <button
                            type="button"
                            className="btn btn-circle btn-sm border-none bg-white text-slate-900 shadow-sm hover:bg-slate-100"
                            onClick={() => handleQtyChange(ticket._id, -1, ticket.maxPerBooking)}
                          >
                            -
                          </button>
                          <div className="text-center">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Quantity</p>
                            <p className="mt-1 text-2xl font-black text-slate-900">{quantity}</p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-circle btn-sm btn-primary"
                            onClick={() => handleQtyChange(ticket._id, 1, ticket.maxPerBooking)}
                          >
                            +
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                      Step 3
                    </p>
                    <h2 className="mt-3 text-3xl font-black text-slate-900">Visitor details</h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    Add names and ages for all {totalTickets} visitors included in this booking.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  {visitorDetails.map((visitor, index) => (
                    <div
                      key={`${visitor.type}-${index}`}
                      className="rounded-[1.75rem] border border-black/5 bg-slate-50 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
                          Visitor {index + 1}
                        </p>
                        <span className="badge badge-outline border-emerald-200 bg-white px-4 py-3 text-xs uppercase text-emerald-700">
                          {visitor.type}
                        </span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px_170px]">
                        <label className="form-control">
                          <div className="label px-1">
                            <span className="label-text font-semibold text-slate-700">Full Name</span>
                          </div>
                          <input
                            type="text"
                            className="input input-bordered h-14 w-full rounded-2xl bg-white"
                            value={visitor.name}
                            onChange={(event) =>
                              handleVisitorChange(index, 'name', event.target.value)
                            }
                          />
                        </label>

                        <label className="form-control">
                          <div className="label px-1">
                            <span className="label-text font-semibold text-slate-700">Age</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            className="input input-bordered h-14 w-full rounded-2xl bg-white"
                            value={visitor.age}
                            onChange={(event) =>
                              handleVisitorChange(index, 'age', event.target.value)
                            }
                          />
                        </label>

                        <label className="form-control">
                          <div className="label px-1">
                            <span className="label-text font-semibold text-slate-700">Type</span>
                          </div>
                          <select
                            className="select select-bordered h-14 w-full rounded-2xl bg-white"
                            value={visitor.type}
                            onChange={(event) =>
                              handleVisitorChange(index, 'type', event.target.value)
                            }
                          >
                            <option value="adult">Adult</option>
                            <option value="child">Child</option>
                            <option value="senior">Senior</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
                <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">
                    Step 4
                  </p>
                  <h2 className="mt-3 flex items-center gap-3 text-3xl font-black">
                    <CreditCard className="h-7 w-7 text-amber-300" />
                    Payment & summary
                  </h2>

                  <div className="mt-8 rounded-[1.5rem] bg-white/5 p-5 ring-1 ring-white/10">
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>Visit Date</span>
                      <span className="font-semibold text-white">{visitDate.toDateString()}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-white/70">
                      <span>Total Visitors</span>
                      <span className="font-semibold text-white">{totalTickets}</span>
                    </div>
                    <div className="my-5 h-px bg-white/10" />
                    <div className="space-y-3 text-sm">
                      {selectedTicketSummary.map((ticket) => (
                        <div
                          key={ticket._id}
                          className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                        >
                          <span>
                            {ticket.quantity} x {ticket.name}
                          </span>
                          <span className="font-semibold">Rs {ticket.subtotal}</span>
                        </div>
                      ))}
                    </div>
                    <div className="my-5 h-px bg-white/10" />
                    <div className="flex items-center justify-between text-xl font-black">
                      <span>Total Amount</span>
                      <span className="text-amber-300">Rs {totalAmount}</span>
                    </div>
                  </div>

                  <label className="form-control mt-6">
                    <div className="label px-1">
                      <span className="label-text font-semibold text-white">Special Requests</span>
                    </div>
                    <textarea
                      className="textarea textarea-bordered min-h-32 rounded-[1.5rem] border-white/10 bg-white/5 text-white placeholder:text-white/35"
                      placeholder="Wheelchair support, school group notes, or any arrival detail."
                      value={specialRequests}
                      onChange={(event) => setSpecialRequests(event.target.value)}
                    />
                  </label>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                    Payment Method
                  </p>
                  <div className="mt-5 space-y-4">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.value}
                        className={`flex cursor-pointer items-start gap-4 rounded-[1.5rem] border p-5 transition ${
                          paymentMethod === method.value
                            ? 'border-emerald-400 bg-emerald-50 shadow-[0_12px_30px_rgba(15,122,67,0.1)]'
                            : 'border-black/5 bg-white hover:border-emerald-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="radio radio-primary mt-1"
                          checked={paymentMethod === method.value}
                          onChange={() => setPaymentMethod(method.value)}
                        />
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-slate-900">{method.label}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{method.note}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="mx-auto max-w-3xl rounded-[2rem] bg-gradient-to-b from-white to-emerald-50/70 px-6 py-12 text-center shadow-[0_18px_70px_rgba(15,122,67,0.12)]">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-lg shadow-emerald-900/10">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-emerald-700">
                  Reservation Complete
                </p>
                <h2 className="mt-4 text-4xl font-black text-slate-900 sm:text-5xl">
                  Booking confirmed
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
                  Your e-ticket is ready. Keep the reference below handy or open My Bookings
                  for the QR code and print-friendly version.
                </p>

                <div className="mx-auto mt-8 max-w-md rounded-[1.75rem] bg-slate-950 px-6 py-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">
                    Booking Reference
                  </p>
                  <p className="mt-3 break-all text-3xl font-black tracking-[0.15em]">
                    {bookingRef}
                  </p>
                </div>

                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/my-bookings')}
                    className="btn btn-primary rounded-full px-8"
                  >
                    View My Bookings
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="btn btn-ghost rounded-full px-8"
                  >
                    Return Home
                  </button>
                </div>
              </div>
            ) : null}

            {currentStep < 4 ? (
              <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                  Step {currentStep + 1} of 4
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  {canGoBack ? (
                    <button
                      type="button"
                      className="btn btn-ghost rounded-full px-8"
                      onClick={() => setCurrentStep((step) => step - 1)}
                    >
                      Back
                    </button>
                  ) : null}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      className="btn btn-primary rounded-full px-8"
                      onClick={handleNext}
                    >
                      Next Step
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary rounded-full px-8"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        <>
                          Pay Rs {totalAmount}
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
