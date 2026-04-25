import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const AuthPageNav = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute left-6 right-6 top-6 z-20 flex items-center justify-between">
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
            return;
          }

          navigate('/');
        }}
        className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <Link
        to="/"
        aria-label="Go to Lahore Zoo home page"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
      >
        <Home className="h-5 w-5" />
      </Link>
    </div>
  );
};

export default AuthPageNav;
