import { useState, useRef } from "react";
import { TiLocationArrow } from "react-icons/ti";

import { useNavigate } from "react-router-dom";

const featureImageMap = {
  jungleSafari: "/img/animals/jaguar.jpg",
  aviary: "/img/animals/animal-05.jpg",
  aquarium: "/img/animals/animal-09.jpg",
  nightSafari: "/img/animals/bear.jpg",
  habitat: "/img/animals/safari-landscape.jpg",
};

export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;

    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`;
    setTransformStyle(newTransform);
  };

  const handleMouseLeave = () => {
    setTransformStyle("");
  };

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({ src, title, description, isComingSoon, link }) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoverOpacity, setHoverOpacity] = useState(0);
  const hoverButtonRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseMove = (event) => {
    if (!hoverButtonRef.current) return;
    const rect = hoverButtonRef.current.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setHoverOpacity(1);
  const handleMouseLeave = () => setHoverOpacity(0);

  const handleClick = () => {
    if (link) navigate(link);
  };

  return (
    <div className={`relative size-full ${link ? 'cursor-pointer' : ''}`} onClick={handleClick}>
      <img
        src={src}
        alt={typeof title === "string" ? title : "Zoo feature"}
        className="absolute left-0 top-0 size-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50">
        <div>
          <h1 className="bento-title special-font">{title}</h1>
          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base">{description}</p>
          )}
        </div>

        {isComingSoon ? (
          <div
            ref={hoverButtonRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="border-hsla relative flex w-fit cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-black px-5 py-2 text-xs uppercase text-white/20"
          >
            {/* Radial gradient hover effect */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
              style={{
                opacity: hoverOpacity,
                background: `radial-gradient(100px circle at ${cursorPosition.x}px ${cursorPosition.y}px, #656fe288, #00000026)`,
              }}
            />
            <TiLocationArrow className="relative z-20" />
            <p className="relative z-20">coming soon</p>
          </div>
        ) : (
          link && (
            <div className="flex items-center gap-1 text-xs uppercase font-bold text-blue-50/60 hover:text-blue-50 transition-colors">
              <TiLocationArrow className="text-primary" />
              <span>Explore More</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const Features = () => (
  <section id="what-we-offer" className="bg-black pb-52">
    <div className="container mx-auto px-3 md:px-10">
      <div className="px-5 py-32">
        <p className="font-circular-web text-lg text-blue-50">
          Experience the Wild
        </p>
        <p className="max-w-md font-circular-web text-lg text-blue-50 opacity-50">
          Discover a world of wonder where nature's beauty meets conservation.
          Experience the diverse wildlife and engaging educational programs at Lahore Zoo.
        </p>
      </div>

      <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
        <BentoCard
          src={featureImageMap.jungleSafari}
          title={
            <>
              Jun<b>g</b>le Safari
            </>
          }
          description="Embark on a thrilling journey through our simulated natural habitats, observing majestic predators and gentle giants up close."
          link="/gallery"
        />
      </BentoTilt>

      <div className="grid h-[135vh] w-full grid-cols-2 grid-rows-3 gap-7">
        <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2">
          <BentoCard
            src={featureImageMap.aviary}
            title={
              <>
                Av<b>i</b>ary
              </>
            }
            description="Walk among hundreds of exotic birds in our expansive walk-through aviary, a paradise of color and song."
            link="/gallery"
          />
        </BentoTilt>

        <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:ms-0">
          <BentoCard
            src={featureImageMap.aquarium}
            title={
              <>
                Aqua<b>r</b>ium
              </>
            }
            description="Dive into the mysteries of the deep. Explore our collection of aquatic life from local rivers to the ocean."
            link="/gallery"
          />
        </BentoTilt>

        <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0">
          <BentoCard
            src={featureImageMap.nightSafari}
            title={
              <>
                Ni<b>g</b>ht Safari
              </>
            }
            description="Experience the zoo after dark. See nocturnal animals in their active element under the moonlight."
            isComingSoon
          />
        </BentoTilt>

        <BentoTilt className="bento-tilt_2">
          <div className="flex size-full flex-col justify-between bg-green-700 p-5">
            <h1 className="bento-title special-font max-w-64 text-blue-50">
              More coming soon.
            </h1>

            <TiLocationArrow className="m-3 scale-[3] self-end fill-blue-50" />
          </div>
        </BentoTilt>

        <BentoTilt className="bento-tilt_2">
          <img
            src={featureImageMap.habitat}
            alt="Zoo habitat feature"
            className="size-full object-cover object-center"
          />
        </BentoTilt>
      </div>
    </div>
  </section>
);

export default Features;
