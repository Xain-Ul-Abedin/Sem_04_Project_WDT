import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";

import Button from "./Button";
import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const FloatingImage = () => {
  const frameRef = useRef(null);

  useGSAP(() => {
    const element = document.getElementById("story-img");

    gsap.set(element, {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });

    gsap.from(element, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: element,
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const element = frameRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((yPos - centerY) / centerY) * -5;
    const rotateY = ((xPos - centerX) / centerX) * 5;

    gsap.to(element, {
      duration: 0.3,
      rotateX,
      rotateY,
      transformPerspective: 500,
      ease: "power1.inOut",
    });
  };

  const handleMouseLeave = () => {
    const element = frameRef.current;
    if (element) {
      gsap.to(element, {
        duration: 0.3,
        rotateX: 0,
        rotateY: 0,
        ease: "power1.inOut",
      });
    }
  };

  return (
    <div
      id="story"
      className="min-h-dvh w-screen overflow-hidden bg-gray-700 text-blue-50"
    >
      <div className="grid h-full min-h-dvh grid-cols-1 md:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center px-10 py-20 md:px-20">
          <p className="mb-6 font-general text-sm uppercase tracking-[0.2em] text-blue-50 md:text-[10px]">
            Zoo Conservation
          </p>

          <AnimatedTitle
            title="Wild <b>H</b>eritage <br /> In C<b>a</b>re"
            containerClass="pointer-events-none relative z-10 mb-8 mix-blend-difference !text-white"
            sectionClass="!justify-start"
          />
          <div className="max-w-md space-y-6">
            <p className="font-circular-web text-lg leading-relaxed text-blue-50 opacity-70">
              Lahore Zoo brings visitors closer to species they may never see in
              the wild, from powerful big cats to river giants and colorful birds.
            </p>
            <p className="font-circular-web text-sm leading-relaxed text-blue-50 opacity-70">
              Every enclosure, keeper interaction, and visitor moment should reinforce
              care, habitat awareness, and respect for wildlife conservation.
            </p>
          </div>

          <div className="mt-10">
            <Button
              id="realm-btn"
              title="Explore Animal Care"
              containerClass="bg-white border border-transparent hover:border-green-300 transition-all duration-300"
              accentColor="#22c55e"
            />
          </div>
        </div>

        <div className="relative h-[50vh] w-full overflow-hidden bg-gray-500 md:h-full">
          <div id="story-img" className="story-img-container h-full w-full">
            <div className="story-img-mask absolute inset-0 h-full w-full">
              <div className="story-img-content h-full w-full">
                <img
                  ref={frameRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseLeave}
                  onMouseEnter={handleMouseLeave}
                  src="/img/animals/safari-landscape.jpg"
                  alt="Protected wildlife habitat"
                  className="h-full w-full object-cover opacity-90 transition-opacity duration-500 hover:scale-105 hover:opacity-100"
                />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent md:bg-gradient-to-l" />
        </div>
      </div>
    </div>
  );
};

export default FloatingImage;
