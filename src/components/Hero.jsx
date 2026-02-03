import { useState, useRef } from "react"; // Added useRef import

const Hero = () => {
  // FIX 1: Removed text like 'initialState:'.
  // FIX 2: Changed loadVideos to start at 0 since you are adding numbers to it.
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false); // Fixed typo 'Cliked'
  const [isLoading, setIsLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  const totalVideos = 3; // Fixed typo 'toatl'
  const nextVideoRef = useRef(null); // Removed 'initialValue:'

  const upcomingVideoIndex = (currentIndex % totalVideos) + 1;

  const handleMiniVdClick = () => {
    setHasClicked(true); // Removed 'value:'
    setCurrentIndex(upcomingVideoIndex);
  };

  const getVideoSrc = (index) => `videos/hero-${index}.mp4`;

  const handleVideoLoaded = () => {
    setLoadedVideos((prev) => prev + 1);
  };

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75"
      >
        <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
          <div
            onClick={handleMiniVdClick}
            className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
          >
            <video
              ref={nextVideoRef}
              src={getVideoSrc(upcomingVideoIndex)} // Changed to use the variable directly
              loop
              muted
              id="current-video"
              className="size-64 origin-center scale-150 object-cover object-center" // Fixed typo 'origin-cneter'
              onLoadedData={handleVideoLoaded} // Fixed typo 'handleVideoLoded'
            />
          </div>
        </div>

        <video
          ref={nextVideoRef}
          src={getVideoSrc(currentIndex)}
          loop
          muted
          id="next-video"
          className="absolute-center invisible absolute z-20 size-64 object-cover object center"
          onLoadedData={handleVideoLoaded}
        />
        <video
          src={getVideoSrc(currentIndex === totalVideos - 1 ? 1 : currentIndex)}
          autoPlay
          loop
          muted
          className="absolute left-0 top-0 size-full object-cover object-cenetr"
          onLoadedData={handleVideoLoaded}
        />
      </div>
      <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75">
        G<b>a</b>ming
      </h1>
    </div>
  );
};

export default Hero;
