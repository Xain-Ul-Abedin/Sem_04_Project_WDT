import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";
import api from "../services/api";
import { getApiList } from "../services/apiResponse";
import { LAHORE_ZOO_EMAIL } from "../utils/siteConstants";

const ImageClipBox = ({ src, clipClass }) => (
  <div className={clipClass}>
    <img src={src} className="w-full h-full object-cover" alt="Animal" />
  </div>
);

const AdoptPet = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await api.get('/animals?limit=4');
        setAnimals(getApiList(response));
      } catch (error) {
        console.error('Failed to fetch animals for directory', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  return (
    <div id="adopt" className="my-20 min-h-96 w-screen px-10">
      <div className="relative rounded-lg bg-black py-24 text-blue-50 shadow-[0_20px_80px_rgba(0,0,0,0.3)] sm:overflow-hidden">
        <div className="absolute -left-20 top-0 hidden h-full w-72 overflow-hidden opacity-50 sm:block lg:left-20 lg:w-96">
          <ImageClipBox src="/img/animals/animal-05.jpg" clipClass="contact-clip-path-1" />
          <ImageClipBox
            src="/img/animals/animal-06.jpg"
            clipClass="contact-clip-path-2 translate-y-60 lg:translate-y-40"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="mb-10 font-general text-[10px] uppercase text-blue-50">Meet Our Residents</p>

          <AnimatedTitle
            title="Animal <br /> Directory"
            className="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !font-white !leading-[.9]"
          />

          {loading ? (
            <div className="mt-10 p-10">
              <span className="loading loading-bars loading-lg text-yellow-300"></span>
            </div>
          ) : (
            <div className="mt-10 grid w-full max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-4">
              {animals.map((animal) => (
                <div key={animal._id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition-all duration-300 hover:border-yellow-300">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={animal.imageUrl || "https://placehold.co/400x300?text=No+Image"}
                      alt={animal.name}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100"
                    />
                  </div>
                  <div className="p-4 text-left">
                    <h3 className="mb-1 text-2xl font-zentry uppercase text-yellow-300">{animal.name}</h3>
                    <p className="mb-2 text-xs font-general capitalize text-blue-50">
                      {animal.species} • {animal.category}
                    </p>
                    <p className="mb-4 line-clamp-2 text-xs text-blue-50">{animal.description}</p>
                    <Button
                      title="View Details"
                      containerClass="w-full bg-white border border-transparent hover:border-yellow-300 transition-all duration-300 text-xs py-2"
                      accentColor="#EDFF66"
                      onClick={() => navigate(`/animals/${animal._id}`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="relative z-20 mt-12 text-center">
            <p className="mb-6 text-sm font-general text-blue-50">
              Discover the incredible diversity of life at Lahore Zoo. <br /> Learn about their habitats, diets, and our conservation efforts.
            </p>
            <Button
              title="Explore Gallery"
              containerClass="cursor-pointer bg-yellow-300 border border-transparent hover:border-yellow-300 transition-all duration-300"
              accentColor="#fff"
              onClick={() => navigate('/gallery')}
            />
          </div>

          <div className="relative z-20 mt-16 w-full max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 backdrop-blur-sm sm:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-200">
              Get Involved
            </p>
            <AnimatedTitle
              title="Adopt A <br /> Pet"
              className="special-font mt-5 w-full !text-4xl !leading-[0.9] !text-white md:!text-[5rem]"
            />
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-blue-50/85 sm:text-base">
              Support animal care, enrichment, and habitat upkeep by becoming part of Lahore Zoo&apos;s
              adoption initiative. It is a meaningful way to contribute even if you cannot take an
              animal home.
            </p>

            <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-200">Sponsor Care</p>
                <h3 className="mt-3 text-xl font-bold text-white">Help feed and protect residents</h3>
                <p className="mt-3 text-sm leading-6 text-blue-50/75">
                  Contribute toward daily nutrition, habitat support, and medical attention for the
                  animals you care about most.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-200">Stay Connected</p>
                <h3 className="mt-3 text-xl font-bold text-white">Be part of zoo conservation efforts</h3>
                <p className="mt-3 text-sm leading-6 text-blue-50/75">
                  Adoption is symbolic and community-driven, designed to connect visitors with the
                  welfare and conservation work happening inside the zoo.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-200">Request Info</p>
                <h3 className="mt-3 text-xl font-bold text-white">Start with the zoo help desk</h3>
                <p className="mt-3 text-sm leading-6 text-blue-50/75">
                  Reach out to the zoo team for the latest guidance on sponsorship, available animals,
                  and any current adoption-style participation options.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                title="Contact For Adoption"
                containerClass="cursor-pointer bg-white border border-transparent hover:border-yellow-300 transition-all duration-300"
                accentColor="#EDFF66"
                onClick={() => navigate('/contact')}
              />
              <Button
                title="Email The Zoo"
                containerClass="cursor-pointer bg-green-300 border border-transparent hover:border-green-500 transition-all duration-300"
                accentColor="#fff"
                onClick={() => window.location.href = `mailto:${LAHORE_ZOO_EMAIL}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptPet;
