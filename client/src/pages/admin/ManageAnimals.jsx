import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cat, PencilLine, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getApiList, getApiPagination } from '../../services/apiResponse';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from '../../components/admin/AdminPageState';
import PaginationControls from '../../components/ui/PaginationControls';

const PAGE_SIZE = 9;

const ManageAnimals = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchAnimals(1);
  }, []);

  const fetchAnimals = async (page = 1) => {
    try {
      setHasError(false);
      const response = await api.get(`/animals?includeInactive=true&page=${page}&limit=${PAGE_SIZE}`);
      setAnimals(getApiList(response));
      setPagination(getApiPagination(response));
    } catch {
      setHasError(true);
      toast.error('Failed to fetch animals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this animal?')) return;

    try {
      await api.delete(`/animals/${id}`);
      toast.success('Animal deactivated successfully');
      fetchAnimals(pagination?.page || 1);
    } catch (error) {
      toast.error(error.message || 'Failed to deactivate animal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manage Animals</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create, edit, and retire animal profiles without losing historical records.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-black/5">
            {pagination?.total || 0} total records
          </div>
          <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm ring-1 ring-amber-100">
            {animals.filter((animal) => !animal.isActive).length} inactive
          </div>
          <Link to="/admin/animals/new" className="btn btn-primary rounded-full">
            <Plus className="w-4 h-4" />
            Add Animal
          </Link>
        </div>
      </div>

      {loading ? <AdminLoadingState label="Loading animals..." /> : null}

      {!loading && hasError ? (
        <AdminErrorState
          title="Animal records could not be loaded"
          description="The admin animal list is unavailable right now. Try reloading the records."
          action={
            <button
              type="button"
              className="btn btn-primary rounded-full"
              onClick={() => fetchAnimals(pagination?.page || 1)}
            >
              Retry
            </button>
          }
        />
      ) : null}

      {!loading && !hasError && animals.length === 0 ? (
        <AdminEmptyState
          title="No animals have been added yet"
          description="Create the first animal profile to make the animals section usable for both admins and visitors."
          icon={Cat}
          action={
            <Link to="/admin/animals/new" className="btn btn-primary rounded-full">
              Add First Animal
            </Link>
          }
        />
      ) : null}

      {!loading && !hasError && animals.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {animals.map((animal) => (
            <div key={animal._id} className="card overflow-hidden border border-gray-100 bg-white shadow-sm">
              <figure className="relative h-56 bg-slate-100">
                <img
                  src={animal.imageUrl || 'https://placehold.co/400x300?text=No+Image'}
                  alt={animal.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className={`badge border-0 px-3 py-3 text-[11px] font-bold uppercase ${animal.isActive ? 'badge-success' : 'badge-warning text-slate-700'}`}>
                    {animal.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="badge badge-outline border-white/70 bg-white/90 px-3 py-3 text-[11px] uppercase text-slate-600">
                    {animal.category}
                  </span>
                </div>
              </figure>

              <div className="card-body p-5">
                <div>
                  <h2 className="card-title text-xl">{animal.name}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">{animal.species}</p>
                </div>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                  {animal.description}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Zone</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{animal.location?.zone || 'Not set'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Conservation</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{animal.conservationStatus || 'Not set'}</p>
                  </div>
                </div>

                <div className="card-actions mt-5 justify-between border-t border-slate-200 pt-5">
                  <Link to={`/animals/${animal._id}`} className="btn btn-ghost rounded-full btn-sm">
                    View Public Page
                  </Link>
                  <div className="flex gap-2">
                    <Link to={`/admin/animals/${animal._id}/edit`} className="btn btn-outline btn-primary rounded-full btn-sm">
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </Link>
                    {animal.isActive ? (
                      <button className="btn btn-outline btn-error rounded-full btn-sm" onClick={() => handleDelete(animal._id)}>
                        Deactivate
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !hasError && animals.length > 0 ? (
        <PaginationControls
          pagination={pagination}
          onPageChange={fetchAnimals}
          label="animals"
        />
      ) : null}
    </div>
  );
};

export default ManageAnimals;
