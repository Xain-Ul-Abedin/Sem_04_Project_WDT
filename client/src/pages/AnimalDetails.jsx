import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { getApiData } from '../services/apiResponse';
import toast from 'react-hot-toast';
import {
  MapPin,
  Info,
  Leaf,
  Utensils,
  ShieldCheck,
  Zap
} from 'lucide-react';

const AnimalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const response = await api.get(`/animals/${id}`);
        setAnimal(getApiData(response));
      } catch {
        toast.error('Animal not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchAnimal();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!animal) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden shadow-2xl relative group aspect-[4/3] bg-gray-200">
              <img 
                src={animal.imageUrl} 
                alt={animal.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="badge badge-primary px-4 py-3 uppercase text-[10px] font-black tracking-[0.2em] shadow-lg">
                  {animal.category}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {animal.galleryImages && animal.galleryImages.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-colors cursor-pointer shadow-md bg-gray-200">
                   <img src={img} alt={`${animal.name} ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Information */}
          <div className="flex flex-col">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-black font-zentry uppercase text-gray-900 tracking-tighter leading-none">{animal.name}</h1>
              <p className="text-xl text-primary font-bold mt-2 font-robert-medium">{animal.species}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
               <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Zone</p>
                    <p className="font-bold text-gray-800">{animal.location?.zone || 'TBA'}</p>
                  </div>
               </div>

               <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Conservation</p>
                    <p className="font-bold text-gray-800">{animal.conservationStatus || 'Least Concern'}</p>
                  </div>
               </div>
            </div>

            <div className="card bg-white shadow-sm border border-gray-100 mb-8 p-6">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" /> About {animal.name}
              </h3>
              <p className="text-gray-600 leading-relaxed font-robert-regular text-lg">
                {animal.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <Leaf className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                   <div>
                     <p className="font-bold text-gray-900">Natural Habitat</p>
                     <p className="text-gray-600 text-sm">{animal.habitat || 'Information pending'}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <Utensils className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                   <div>
                     <p className="font-bold text-gray-900">Dietary Needs</p>
                     <p className="text-gray-600 text-sm">{animal.diet || 'Information pending'}</p>
                   </div>
                </div>
              </div>

              {animal.funFact && (
                <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg group">
                   <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 transition-transform duration-700 group-hover:scale-125" />
                   <h4 className="font-black uppercase text-[10px] tracking-[0.3em] mb-2">Did You Know?</h4>
                   <p className="font-medium text-blue-50 leading-snug">{animal.funFact}</p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 flex gap-4">
              <Link to="/tickets" className="btn btn-primary px-8 shadow-md">Book A Visit</Link>
              <button className="btn btn-ghost px-8 border-gray-200">Share Story</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetails;
