import React, { useRef } from "react";
import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";

const ImageClipBox = ({ src, clipClass }) => (
    <div className={clipClass}>
        <img src={src} className="w-full h-full object-cover" alt="Pet" />
    </div>
);

const pets = [
    {
        id: 1,
        name: "Bella",
        age: "2 Years",
        breed: "Labrador Mix",
        image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1074&auto=format&fit=crop",
        description: "Loyal, friendly, and loves to play fetch."
    },
    {
        id: 2,
        name: "Charlie",
        age: "1 Year",
        breed: "Golden Retriever",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=662&auto=format&fit=crop",
        description: "Always happy and gets along well with kids."
    },
    {
        id: 3,
        name: "Luna",
        age: "3 Years",
        breed: "Siamese Cat",
        image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?q=80&w=735&auto=format&fit=crop",
        description: "Calm, independent, and enjoys sunbathing."
    },
    {
        id: 4,
        name: "Max",
        age: "4 Months",
        breed: "Beagle Puppy",
        image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=694&auto=format&fit=crop",
        description: "Curious, energetic, and a great snuggler."
    }
];

const AdoptPet = () => {
    return (
        <div id="adopt" className="my-20 min-h-96 w-screen px-10">
            <div className="relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden">

                {/* Decorative Clip Paths (inspired by Contact) */}
                <div className="absolute -left-20 top-0 hidden h-full w-72 overflow-hidden sm:block lg:left-20 lg:w-96 opacity-50">
                    <ImageClipBox
                        src="https://images.unsplash.com/photo-1583511655826-05700d52f4d9?q=80&w=688&auto=format&fit=crop"
                        clipClass="contact-clip-path-1"
                    />
                    <ImageClipBox
                        src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=764&auto=format&fit=crop"
                        clipClass="contact-clip-path-2 lg:translate-y-40 translate-y-60"
                    />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <p className="mb-10 font-general text-[10px] uppercase text-blue-50">
                        Find Your New Best Friend
                    </p>

                    <AnimatedTitle
                        title="Adopt A <br /> Pet Today"
                        className="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !font-white !leading-[.9]"
                    />

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 w-full max-w-7xl">
                        {pets.map((pet) => (
                            <div key={pet.id} className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-white/10 hover:border-yellow-300 transition-all duration-300">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        src={pet.image}
                                        alt={pet.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    />
                                </div>
                                <div className="p-4 text-left">
                                    <h3 className="text-2xl font-zentry uppercase text-yellow-300 mb-1">{pet.name}</h3>
                                    <p className="text-xs font-general text-blue-50 mb-2">{pet.breed} • {pet.age}</p>
                                    <p className="text-xs text-blue-50 line-clamp-2 mb-4">{pet.description}</p>
                                    <Button
                                        title="Adopt Me"
                                        containerClass="w-full bg-white border border-transparent hover:border-yellow-300 transition-all duration-300 text-xs py-2"
                                        accentColor="#EDFF66"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-sm font-general text-blue-50 mb-6">
                            Give a loving home to an animal in need. <br /> Browse our available pets and find the perfect companion.
                        </p>
                        <Button
                            title="View All Pets"
                            containerClass="cursor-pointer bg-yellow-300 border border-transparent hover:border-yellow-300 transition-all duration-300"
                            accentColor="#fff"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdoptPet;
