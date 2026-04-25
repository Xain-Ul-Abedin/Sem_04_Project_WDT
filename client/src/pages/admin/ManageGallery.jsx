import { useEffect, useState } from 'react';
import { ImageIcon, Plus, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getApiList, getApiPagination } from '../../services/apiResponse';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from '../../components/admin/AdminPageState';
import PaginationControls from '../../components/ui/PaginationControls';

const INITIAL_FORM = {
  title: '',
  description: '',
  category: 'animals',
  tags: '',
  photographer: '',
  isFeatured: false,
  image: null,
};

const PAGE_SIZE = 9;

const ManageGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchGallery(1);
  }, []);

  const fetchGallery = async (page = 1) => {
    try {
      setHasError(false);
      const response = await api.get(`/gallery?page=${page}&limit=${PAGE_SIZE}`);
      setItems(getApiList(response));
      setPagination(getApiPagination(response));
    } catch {
      setHasError(true);
      toast.error('Failed to fetch gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === 'file') {
      setFormData((current) => ({ ...current, image: files?.[0] || null }));
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setShowModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('category', formData.category);
    data.append('tags', formData.tags);
    data.append('photographer', formData.photographer.trim());
    data.append('isFeatured', String(formData.isFeatured));
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      await api.post('/gallery', data);
      toast.success('Item added successfully');
      resetForm();
      fetchGallery(1);
    } catch (error) {
      toast.error(error.message || 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Item deleted successfully');
      fetchGallery(pagination?.page || 1);
    } catch (error) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const toggleFeatured = async (item) => {
    try {
      await api.put(`/gallery/${item._id}`, { isFeatured: !item.isFeatured });
      toast.success(`Item ${!item.isFeatured ? 'featured' : 'unfeatured'}`);
      fetchGallery(pagination?.page || 1);
    } catch (error) {
      toast.error(error.message || 'Failed to update item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gallery & Events Media</h1>
          <p className="mt-2 text-sm text-slate-500">
            Curate the public media wall with cleaner modal forms and clearer featured actions.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-black/5">
            {pagination?.total || 0} media items
          </div>
          <button className="btn btn-primary rounded-full" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Add Media
          </button>
        </div>
      </div>

      {loading ? <AdminLoadingState label="Loading gallery items..." /> : null}

      {!loading && hasError ? (
        <AdminErrorState
          title="Gallery items could not be loaded"
          description="This admin media section hit an API issue. Retry to load the current items."
          action={
            <button
              type="button"
              className="btn btn-primary rounded-full"
              onClick={() => fetchGallery(pagination?.page || 1)}
            >
              Retry
            </button>
          }
        />
      ) : null}

      {!loading && !hasError && items.length === 0 ? (
        <AdminEmptyState
          title="No media items yet"
          description="Add the first gallery item to populate the public media wall."
          icon={ImageIcon}
          action={
            <button type="button" className="btn btn-primary rounded-full" onClick={() => setShowModal(true)}>
              Add Media
            </button>
          }
        />
      ) : null}

      {!loading && !hasError && items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="card overflow-hidden border border-gray-100 bg-white shadow-sm">
              <figure className="relative h-56">
                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                {item.isFeatured ? (
                  <div className="absolute right-3 top-3 badge badge-warning gap-1 border-0 px-3 py-3">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </div>
                ) : null}
              </figure>
              <div className="card-body p-5">
                <h2 className="card-title text-lg">{item.title}</h2>
                <div className="flex gap-2 mb-2">
                  <span className="badge badge-sm badge-outline uppercase text-[10px] tracking-widest">{item.category}</span>
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-gray-500">{item.description}</p>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Photographer: <span className="text-slate-600">{item.photographer || 'Lahore Zoo'}</span>
                </p>

                <div className="card-actions justify-between mt-4 border-t border-slate-200 pt-4 gap-2">
                  <button
                    className={`btn btn-outline btn-sm rounded-full ${item.isFeatured ? 'btn-warning' : 'btn-ghost'}`}
                    onClick={() => toggleFeatured(item)}
                  >
                    <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                    {item.isFeatured ? 'Featured' : 'Feature'}
                  </button>
                  <button className="btn btn-outline btn-error btn-sm rounded-full" onClick={() => handleDelete(item._id)}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !hasError && items.length > 0 ? (
        <PaginationControls
          pagination={pagination}
          onPageChange={fetchGallery}
          label="media items"
        />
      ) : null}

      {showModal ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl rounded-[2rem] border border-emerald-100 bg-[#fcfbf7] p-0 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
              <h3 className="text-2xl font-bold text-slate-900">Add New Gallery Item</h3>
              <p className="mt-2 text-sm text-slate-500">
                Add media with clearer field grouping, visible file state, and better modal contrast.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="form-control">
                  <label className="label text-xs font-bold uppercase">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input input-bordered w-full"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold uppercase">Category</label>
                  <select
                    name="category"
                    className="select select-bordered w-full"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="animals">Animals</option>
                    <option value="aerial">Aerial</option>
                    <option value="habitat">Habitat</option>
                    <option value="events">Events</option>
                    <option value="visitors">Visitors</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold uppercase">Description</label>
                <textarea
                  name="description"
                  required
                  className="textarea textarea-bordered h-24"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="form-control">
                  <label className="label text-xs font-bold uppercase">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    className="input input-bordered w-full"
                    placeholder="lion, sunset, wildlife"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-bold uppercase">Photographer</label>
                  <input
                    type="text"
                    name="photographer"
                    className="input input-bordered w-full"
                    value={formData.photographer}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold uppercase">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  className="file-input file-input-bordered w-full"
                  onChange={handleInputChange}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {formData.image ? `Selected: ${formData.image.name}` : 'Choose a JPG, PNG, or WEBP file'}
                </p>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4 rounded-[1.25rem] bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    className="checkbox checkbox-primary"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  <span className="label-text">Feature this item on the homepage</span>
                </label>
              </div>

              <div className="modal-action">
                <button type="button" className="btn btn-ghost rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary rounded-full" disabled={saving}>
                  {saving ? <span className="loading loading-spinner loading-sm" /> : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
          <button type="button" className="modal-backdrop" onClick={resetForm}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ManageGallery;
