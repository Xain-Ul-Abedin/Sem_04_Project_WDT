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
    const element = document.getElementById("story-img"); // targeting by ID directly inside useGSAP

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
    // ... existing logic ...
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
      // Adding zIndex to ensure it stays proper if needed, but transformPerspective handles 3D
    });
  };

  const handleMouseLeave = () => {
    // ... existing logic ...
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
      className="min-h-dvh w-screen bg-gray-700 text-blue-50 overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-dvh">
        {/* Left Column: Text Content */}
        <div className="flex flex-col justify-center px-10 md:px-20 py-20 relative z-10">
          <p className="font-general text-sm uppercase md:text-[10px] tracking-[0.2em] text-blue-50 mb-6">
            1988 – 2017
          </p>

          <AnimatedTitle
            title="The Leg<b>a</b>cy <br /> of Su<b>z</b>i"
            containerClass="pointer-events-none mix-blend-difference relative z-10 mb-8 !text-white"
            sectionClass="!justify-start"
          />
          <div className="space-y-6 max-w-md">
            <p className="font-circular-web text-blue-50 text-lg leading-relaxed opacity-70">
              For 29 years, Suzi was the soul of Lahore Zoo. As the only African
              elephant in Pakistan, she carried the weight of being a solitary
              giant with grace.
            </p>
            <p className="font-circular-web text-blue-50 text-sm leading-relaxed opacity-70">
              Her gentle rumble and playful trunk waves are missed by
              generations who grew up visiting her. This tribute stands to honor
              her memory and advocate for the welfare of all captive animals.
            </p>
          </div>

          <div className="mt-10">
            <Button
              id="realm-btn"
              title="Read Her Full Story"
              containerClass="bg-white border border-transparent hover:border-green-300 transition-all duration-300"
              accentColor="#22c55e"
            />
          </div>
        </div>

        {/* Right Column: Floating Image */}
        <div className="relative w-full h-[50vh] md:h-full bg-gray-500 overflow-hidden">
          <div id="story-img" className="story-img-container w-full h-full">
            <div className="story-img-mask w-full h-full absolute inset-0">
              <div className="story-img-content w-full h-full">
                <img
                  ref={frameRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseLeave}
                  onMouseEnter={handleMouseLeave}
                  src="img/Suzi.webp"
                  alt="Suzi the Elephant"
                  className="object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-500 hover:scale-105 transform"
                />
              </div>
            </div>
          </div>

          {/* Gradient overlay for blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent md:bg-gradient-to-l pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default FloatingImage;
