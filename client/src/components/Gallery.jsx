import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Expand, X } from 'lucide-react';
import api from '../services/api';
import { getApiList } from '../services/apiResponse';

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const legacyGalleryImageMap = {
  '/img/gallery-1.webp': '/img/animals/jaguar.jpg',
  '/img/gallery-2.webp': '/img/animals/animal-05.jpg',
  '/img/gallery-3.webp': '/img/animals/safari-landscape.jpg',
  '/img/gallery-4.webp': '/img/animals/animal-10.jpg',
  '/img/gallery-5.webp': '/img/animals/hippopotamus.jpg',
  '/img/about.webp': '/img/animals/animal-08.jpg',
  '/img/entrance.webp': '/img/animals/animal-04.jpg',
  '/img/contact-1.webp': '/img/animals/bear.jpg',
  '/img/contact-2.webp': '/img/animals/animal-06.jpg',
  '/img/Parrot.png': '/img/animals/animal-05.jpg',
  '/img/stones.webp': '/img/animals/animal-07.jpg',
};

const resolveGalleryImage = (imageUrl) => legacyGalleryImageMap[imageUrl] || imageUrl;

const Gallery = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [galleryResponse, animalsResponse] = await Promise.all([
          api.get('/gallery'),
          api.get('/animals?limit=100'),
        ]);
        setItems(
          getApiList(galleryResponse).map((item) => ({
            ...item,
            imageUrl: resolveGalleryImage(item.imageUrl),
          }))
        );
        setAnimals(getApiList(animalsResponse));
      } catch (error) {
        console.error('Failed to load gallery', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const animalLookup = useMemo(() => {
    return new Map(
      animals.flatMap((animal) => {
        const keys = [normalize(animal.name), normalize(animal.species)].filter(Boolean);
        return keys.map((key) => [key, animal]);
      })
    );
  }, [animals]);

  const categories = ['all', ...new Set(items.map((item) => item.category))];
  const filteredItems = filter === 'all' ? items : items.filter((item) => item.category === filter);

  const resolveAnimalMatch = (item) => {
    if (item.category !== 'animals') {
      return null;
    }

    return animalLookup.get(normalize(item.title)) || null;
  };

  const handleCardClick = (item) => {
    const matchingAnimal = resolveAnimalMatch(item);
    if (matchingAnimal) {
      navigate(`/animals/${matchingAnimal._id}`);
      return;
    }

    setSelectedItem(item);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(214,163,47,0.14),transparent_25%),linear-gradient(180deg,#07110c_0%,#040706_100%)] pt-24 text-white">
      <div className="pointer-events-none absolute left-0 top-0 h-[50vh] w-full bg-gradient-to-b from-emerald-700/20 via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="mb-12 flex flex-col gap-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="text-center">
            <h1 className="mb-4 text-5xl font-zentry uppercase text-blue-50 md:text-7xl">Zoo Gallery</h1>
            <p className="mx-auto max-w-2xl text-lg font-robert-regular text-gray-300">
              Experience the vibrant life of Lahore Zoo through our curated media collection.
              From golden hour predator sightings to colorful avian displays.
            </p>
          </div>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
                filter === cat
                  ? 'bg-emerald-50 text-black shadow-[0_0_15px_rgba(167,243,208,0.25)]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-bars loading-lg text-blue-50"></span>
          </div>
        ) : (
          <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
            {filteredItems.map((item) => {
              const matchingAnimal = resolveAnimalMatch(item);

              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleCardClick(item)}
                  className="group relative block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5 pb-2 text-left transition-transform duration-500 hover:-translate-y-2 hover:border-emerald-300/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-bold font-circular-web">{item.title}</h3>
                      <span className="rounded-full bg-white/10 p-2 text-white/80 transition group-hover:bg-emerald-400/20 group-hover:text-emerald-200">
                        <Expand className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-gray-400">{item.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags?.map((tag) => (
                        <span key={tag} className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      {item.photographer ? (
                        <p className="flex items-center text-xs italic text-gray-500">
                          <span className="mr-1 opacity-60">Photo by</span> {item.photographer}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
                        {matchingAnimal ? 'Open animal' : 'Open details'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedItem ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-0 text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-black/30">
                <img src={selectedItem.imageUrl} alt={selectedItem.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-200">
                      Gallery Detail
                    </p>
                    <h2 className="mt-3 text-3xl font-black text-white">{selectedItem.title}</h2>
                  </div>
                  <button
                    type="button"
                    className="btn btn-circle btn-ghost border border-white/10 text-white hover:bg-white/10"
                    onClick={() => setSelectedItem(null)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-5 text-base leading-7 text-slate-300">{selectedItem.description}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {selectedItem.tags?.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Category</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedItem.category}</p>
                  <p className="mt-5 text-xs uppercase tracking-[0.25em] text-slate-400">Photographer</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedItem.photographer || 'Lahore Zoo'}</p>
                </div>

                <div className="mt-auto pt-8">
                  <Link to="/contact" className="btn btn-primary rounded-full px-6">
                    Contact the zoo about this media
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <button type="button" className="modal-backdrop" onClick={() => setSelectedItem(null)}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Gallery;
