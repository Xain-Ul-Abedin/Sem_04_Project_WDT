import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import InteractiveMap from "./InteractiveMap";

gsap.registerPlugin(ScrollTrigger);

const GuideMap = () => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(".map-title", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }).from(
        ".map-image",
        {
          scale: 0.9,
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        },
        "-=0.4",
      );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="guide-map"
      className="relative min-screen w-screen bg-[#008236] text-blue-50 py-20"
    >
      <div className="container mx-auto px-3 md:px-10 flex flex-col items-center">
        <div className="map-title text-center mb-10">
          <p className="font-general text-sm uppercase md:text-[10px]">
            Explore The Sanctuary
          </p>
          <h2 className="mt-5 text-4xl md:text-6xl font-zentry uppercase leading-[0.9]">
            Interactive <br /> Guide Map
          </h2>
          <p className="text-sm font-general mt-4">
            Find your way through the diverse habitats and attractions of our
            sanctuary.
          </p>
        </div>

        <div className="map-image relative w-full h-[60vh] md:h-[80vh] rounded-lg overflow-hidden border border-white/20 bg-amber-100 flex items-center justify-center">
          <InteractiveMap />
        </div>
      </div>
    </section>
  );
};

export default GuideMap;
