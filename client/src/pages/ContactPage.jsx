import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import {
  GOOGLE_MAPS_DIRECTIONS_URL,
  LAHORE_ZOO_ADDRESS,
  LAHORE_ZOO_EMAIL,
  LAHORE_ZOO_PHONE,
} from '../utils/siteConstants';

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const ContactPage = () => {
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success('Thanks for reaching out. Use call, email, or directions above while we add full submission support.');
    setFormData(initialForm);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-shell">
        <div className="surface-panel overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">Contact Us</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Reach Lahore Zoo without hunting for details across the site.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Use the direct call, email, and directions actions below, or leave a message in the
                contact form so visitors have one clear help desk destination.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <a
                  href={`tel:${LAHORE_ZOO_PHONE}`}
                  className="rounded-[1.5rem] bg-slate-950 px-5 py-5 text-white shadow-lg"
                >
                  <Phone className="h-5 w-5 text-emerald-300" />
                  <p className="mt-4 text-xs uppercase tracking-[0.25em] text-white/55">Phone</p>
                  <p className="mt-2 text-base font-semibold">{LAHORE_ZOO_PHONE}</p>
                </a>
                <a
                  href={`mailto:${LAHORE_ZOO_EMAIL}`}
                  className="rounded-[1.5rem] border border-black/5 bg-white px-5 py-5 shadow-sm"
                >
                  <Mail className="h-5 w-5 text-amber-600" />
                  <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-400">Email</p>
                  <p className="mt-2 text-base font-semibold text-slate-900 break-all">{LAHORE_ZOO_EMAIL}</p>
                </a>
                <a
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[1.5rem] border border-black/5 bg-white px-5 py-5 shadow-sm"
                >
                  <MapPin className="h-5 w-5 text-primary" />
                  <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-400">Directions</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">Open Google Maps</p>
                </a>
              </div>

              <div className="mt-8 rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-900 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/55">Visit the zoo</p>
                <h2 className="mt-3 text-2xl font-bold">Director Office & Visitor Help Desk</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">{LAHORE_ZOO_ADDRESS}</p>
                <p className="mt-4 text-sm leading-7 text-white/75">
                  You are requested to report issues on the spot as well, so the staff can take
                  abrupt action to resolve them quickly.
                </p>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Quick Message</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">Send your details</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                This form is UI-first for now, so it confirms locally and guides visitors to the
                fastest real contact options above.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="form-control">
                    <div className="label px-1">
                      <span className="label-text font-semibold text-slate-700">Full Name</span>
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      className="input input-bordered h-14 rounded-2xl bg-white"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </label>
                  <label className="form-control">
                    <div className="label px-1">
                      <span className="label-text font-semibold text-slate-700">Email</span>
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      className="input input-bordered h-14 rounded-2xl bg-white"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <label className="form-control">
                  <div className="label px-1">
                    <span className="label-text font-semibold text-slate-700">Subject</span>
                  </div>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="input input-bordered h-14 rounded-2xl bg-white"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </label>

                <label className="form-control">
                  <div className="label px-1">
                    <span className="label-text font-semibold text-slate-700">Message</span>
                  </div>
                  <textarea
                    name="message"
                    rows="6"
                    required
                    className="textarea textarea-bordered rounded-[1.5rem] bg-white"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-6 text-slate-500">
                    Prefer faster help? Use the call, email, or directions actions instead of waiting.
                  </p>
                  <button type="submit" className="btn btn-primary rounded-full px-6">
                    <Send className="h-4 w-4" />
                    Send Message
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <Button
                  title="Get Directions"
                  containerClass="bg-green-300 border border-transparent hover:border-green-500 transition-all duration-300"
                  accentColor="#fff"
                  onClick={() => window.open(GOOGLE_MAPS_DIRECTIONS_URL, '_blank', 'noopener,noreferrer')}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
