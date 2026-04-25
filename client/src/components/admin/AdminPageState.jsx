import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';

export const AdminLoadingState = ({ label = 'Loading data...' }) => (
  <div className="flex min-h-[240px] items-center justify-center rounded-[1.75rem] border border-black/5 bg-white/85 p-8 text-center shadow-sm">
    <div>
      <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  </div>
);

export const AdminEmptyState = ({
  title,
  description,
  action,
  icon: Icon = Inbox,
}) => (
  <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white/80 p-10 text-center shadow-sm">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

export const AdminErrorState = ({
  title = 'Something went wrong',
  description = 'We could not load this admin section right now.',
  action,
}) => (
  <div className="rounded-[1.75rem] border border-red-100 bg-red-50/70 p-8 text-center shadow-sm">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-red-500 shadow-sm">
      <AlertCircle className="h-8 w-8" />
    </div>
    <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);
