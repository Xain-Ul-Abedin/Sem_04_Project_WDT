import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackNavigation = ({
  fallbackTo = '/',
  label = 'Back',
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
};

export default BackNavigation;
