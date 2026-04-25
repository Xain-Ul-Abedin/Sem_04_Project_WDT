import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { TiLocationArrow } from "react-icons/ti";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState(0);
  const [hasLoaderTimedOut, setHasLoaderTimedOut] = useState(false);
  const navigate = useNavigate();

  const totalVideos = 4;
  const nextVideoRef = useRef(null);

  const handleVideoLoaded = () => {
    setLoadedVideos((prev) => prev + 1);
  };

  const upcomingVideoIndex = (currentIndex % totalVideos) + 1;

  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex(upcomingVideoIndex);
  };

  const isLoading = !hasLoaderTimedOut && loadedVideos < totalVideos - 1;

  // 2. FALLBACK TIMEOUT (Safety Net)
  // If videos fail to trigger 'onLoadedData' (cached or network error),
  // this forces the loader to stop after 3 seconds so the site works.
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasLoaderTimedOut(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => nextVideoRef.current.play(),
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    { dependencies: [currentIndex], revertOnUpdate: true },
  );

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  const getVideoSrc = (index) => `videos/hero-${index}.mp4`;

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {isLoading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50">
          <div className="three-body">
            <div className="three-body__dot" />
            <div className="three-body__dot" />
            <div className="three-body__dot" />
          </div>
        </div>
      )}
      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75"
      >
        <div>
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <div
              onClick={handleMiniVdClick}
              className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
            >
              <video
                src={getVideoSrc(upcomingVideoIndex)}
                loop
                muted
                id="current-video"
                className="size-64 origin-center scale-150 object-cover object-center"
                onLoadedData={handleVideoLoaded}
              />
            </div>
          </div>

          <video
            ref={nextVideoRef}
            src={getVideoSrc(currentIndex)}
            loop
            muted
            id="next-video"
            className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
            onLoadedData={handleVideoLoaded}
          />
          <video
            src={getVideoSrc(
              currentIndex === totalVideos - 1 ? 1 : currentIndex,
            )}
            autoPlay
            loop
            muted
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoadedData={handleVideoLoaded}
          />
        </div>
        <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75">
          WildLife
        </h1>
        <div className=" absolute left-0 top-0 z-40 size-full">
          <div className=" mt-24 px-5 sm:px-10">
            <h1 className="special-font hero-heading text-blue-100">Explore</h1>
            <p className="mb-5 max-w-64 font-robert-regular text-blue-100">
              Enter the Jungle Layer <br /> An Adventure in the Wild
            </p>
            <Button
              id="Book-Ticket"
              title="Plan A visit"
              leftIcon={<TiLocationArrow />}
              containerClass="bg-green-300 flex-center gap-1 border border-transparent hover:border-green-500 transition-all duration-300"
              accentColor="#fff"
              onClick={() => navigate('/tickets')}
            />
            <Button
              id="Contact-Button"
              title="Contact Us"
              containerClass="mt-4 bg-white/95 flex-center gap-1 border border-white/70 hover:border-yellow-300 transition-all duration-300"
              accentColor="#EDFF66"
              onClick={() => navigate('/contact')}
            />
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading absolute bottom-5 right-5 text-black">
        WildLife
      </h1>
    </div>
  );
};

export default Hero;
