import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getApiData } from '../../services/apiResponse';

const CATEGORY_OPTIONS = ['mammal', 'bird', 'reptile', 'aquatic', 'insect'];
const STATUS_OPTIONS = [
  '',
  'Least Concern',
  'Near Threatened',
  'Vulnerable',
  'Endangered',
  'Critically Endangered',
  'Extinct in Wild',
];

const emptyForm = {
  name: '',
  species: '',
  category: 'mammal',
  description: '',
  habitat: '',
  diet: '',
  funFact: '',
  conservationStatus: '',
  isActive: true,
  zone: '',
  coordinateX: '',
  coordinateY: '',
};

const AnimalEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isMounted = true;

    const fetchAnimal = async () => {
      try {
        const response = await api.get(`/animals/${id}`);
        const animal = getApiData(response, null);

        if (!animal || !isMounted) {
          return;
        }

        setExistingImage(animal.imageUrl || '');
        setFormData({
          name: animal.name || '',
          species: animal.species || '',
          category: animal.category || 'mammal',
          description: animal.description || '',
          habitat: animal.habitat || '',
          diet: animal.diet || '',
          funFact: animal.funFact || '',
          conservationStatus: animal.conservationStatus || '',
          isActive: animal.isActive ?? true,
          zone: animal.location?.zone || '',
          coordinateX: animal.location?.coordinates?.x ?? '',
          coordinateY: animal.location?.coordinates?.y ?? '',
        });
      } catch (error) {
        toast.error(error.message || 'Failed to load animal details');
        navigate('/admin/animals');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnimal();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, navigate]);

  const previewUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    return existingImage;
  }, [existingImage, imageFile]);

  useEffect(() => {
    return () => {
      if (imageFile && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [imageFile, previewUrl]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('species', formData.species.trim());
    payload.append('category', formData.category);
    payload.append('description', formData.description.trim());
    payload.append('habitat', formData.habitat.trim());
    payload.append('diet', formData.diet.trim());
    payload.append('funFact', formData.funFact.trim());
    payload.append('conservationStatus', formData.conservationStatus);
    payload.append('isActive', String(formData.isActive));
    payload.append('location[zone]', formData.zone.trim());
    payload.append('location[coordinates][x]', formData.coordinateX === '' ? '0' : String(Number(formData.coordinateX)));
    payload.append('location[coordinates][y]', formData.coordinateY === '' ? '0' : String(Number(formData.coordinateY)));

    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      if (isEditMode) {
        await api.put(`/animals/${id}`, payload);
        toast.success('Animal updated successfully');
      } else {
        await api.post('/animals', payload);
        toast.success('Animal added successfully');
      }

      navigate('/admin/animals');
    } catch (error) {
      toast.error(error.message || 'Failed to save animal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/animals"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to animal management
          </Link>
          <h1 className="mt-3 text-3xl font-black text-slate-900">
            {isEditMode ? 'Edit Animal Profile' : 'Add New Animal'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Capture the animal details, habitat info, and image in one clean admin form.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="form-control">
                <div className="label px-1">
                  <span className="label-text font-semibold text-slate-700">Animal Name</span>
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
                  <span className="label-text font-semibold text-slate-700">Species</span>
                </div>
                <input
                  type="text"
                  name="species"
                  required
                  className="input input-bordered h-14 rounded-2xl bg-white"
                  value={formData.species}
                  onChange={handleChange}
                />
              </label>

              <label className="form-control">
                <div className="label px-1">
                  <span className="label-text font-semibold text-slate-700">Category</span>
                </div>
                <select
                  name="category"
                  className="select select-bordered h-14 rounded-2xl bg-white"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control">
                <div className="label px-1">
                  <span className="label-text font-semibold text-slate-700">Conservation Status</span>
                </div>
                <select
                  name="conservationStatus"
                  className="select select-bordered h-14 rounded-2xl bg-white"
                  value={formData.conservationStatus}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status || 'empty'} value={status}>
                      {status || 'Not specified'}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="form-control mt-5">
              <div className="label px-1">
                <span className="label-text font-semibold text-slate-700">Description</span>
              </div>
              <textarea
                name="description"
                required
                rows="5"
                className="textarea textarea-bordered rounded-[1.5rem] bg-white"
                value={formData.description}
                onChange={handleChange}
              />
            </label>
          </section>

          <section className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Habitat & care details</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="form-control">
                <div className="label px-1">
                  <span className="label-text font-semibold text-slate-700">Habitat</span>
                </div>
                <input
                  type="text"
                  name="habitat"
                  className="input input-bordered h-14 rounded-2xl bg-white"
                  value={formData.habitat}
                  onChange={handleChange}
                />
              </label>

              <label className="form-control">
                <div className="label px-1">
                  <span className="label-text font-semibold text-slate-700">Diet</span>
                </div>
                <input
                  type="text"
                  name="diet"
                  className="input input-bordered h-14 rounded-2xl bg-white"
                  value={formData.diet}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label className="form-control mt-5">
              <div className="label px-1">
                <span className="label-text font-semibold text-slate-700">Fun Fact</span>
              </div>
              <textarea
                name="funFact"
                rows="3"
                className="textarea textarea-bordered rounded-[1.5rem] bg-white"
                value={formData.funFact}
                onChange={handleChange}
              />
            </label>
          </section>

          <section className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Map location</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <label className="form-control md:col-span-1">
                <div className="label px-1">
                  <span className="label-text font-semibold text-slate-700">Zone</span>
                </div>
                <input
                  type="text"
                  name="zone"
                  className="input input-bordered h-14 rounded-2xl bg-white"
                  value={formData.zone}
                  onChange={handleChange}
                />
              </label>

              <label className="form-control">
                <div className="label px-1">
                  <span className="label-text font-semibold text-slate-700">Coordinate X</span>
                </div>
                <input
                  type="number"
                  name="coordinateX"
                  className="input input-bordered h-14 rounded-2xl bg-white"
                  value={formData.coordinateX}
                  onChange={handleChange}
                />
              </label>

              <label className="form-control">
                <div className="label px-1">
                  <span className="label-text font-semibold text-slate-700">Coordinate Y</span>
                </div>
                <input
                  type="number"
                  name="coordinateY"
                  className="input input-bordered h-14 rounded-2xl bg-white"
                  value={formData.coordinateY}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="surface-panel rounded-[1.75rem] p-6">
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-4">
              <div className="aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-slate-200">
                {previewUrl ? (
                  <img src={previewUrl} alt="Animal preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <ImagePlus className="h-10 w-10" />
                  </div>
                )}
              </div>
            </div>

            <label className="form-control mt-5">
              <div className="label px-1">
                <span className="label-text font-semibold text-slate-700">Animal Image</span>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="file-input file-input-bordered w-full rounded-2xl bg-white"
                onChange={handleImageChange}
              />
            </label>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Upload JPG, PNG, or WEBP up to 5MB. Leaving this empty during edit keeps the
              current image.
            </p>
          </section>

          <section className="surface-panel rounded-[1.75rem] p-6">
            <label className="flex items-start gap-4 rounded-[1.25rem] bg-slate-50 p-4">
              <input
                type="checkbox"
                name="isActive"
                className="checkbox checkbox-primary mt-1"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <div>
                <p className="font-semibold text-slate-900">Show as active</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Inactive animals remain in admin records but stay hidden from public listings.
                </p>
              </div>
            </label>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                className="btn btn-primary rounded-full"
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? 'Save Changes' : 'Create Animal'}
                  </>
                )}
              </button>
              <Link to="/admin/animals" className="btn btn-ghost rounded-full">
                Cancel
              </Link>
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
};

export default AnimalEditor;
