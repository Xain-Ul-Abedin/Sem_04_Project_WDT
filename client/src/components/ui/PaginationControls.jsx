const buildPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
};

const PaginationControls = ({ pagination, onPageChange, label = 'items' }) => {
  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  const pages = buildPageNumbers(pagination.page, pagination.pages);
  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] bg-white px-5 py-4 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-900">{startItem}-{endItem}</span> of{' '}
        <span className="font-semibold text-slate-900">{pagination.total}</span> {label}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-sm rounded-full"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const showGap = previousPage && page - previousPage > 1;

          return (
            <div key={page} className="flex items-center gap-2">
              {showGap ? <span className="px-1 text-slate-400">...</span> : null}
              <button
                type="button"
                className={`btn btn-sm rounded-full ${
                  page === pagination.page ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          className="btn btn-sm rounded-full"
          disabled={pagination.page >= pagination.pages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
