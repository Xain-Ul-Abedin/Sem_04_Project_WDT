import React, { useEffect, useRef, useState } from "react";
import { useWindowScroll } from "react-use";
import Button from "./Button";
import { TiLocation, TiLocationArrow, TiThMenu, TiTimes } from "react-icons/ti";
import gsap from "gsap";

const navItems = [
  "About Us",
  "What We Offer",
  "Get Involved",
  "Info Desk",
  "Media Room",
];

const NavBar = () => {
  const [lastScrollY, setLastScrollY] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(true);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navContainerRef = useRef(null);
  const audioElementRef = useRef(null);

  const { y: currentScrollY } = useWindowScroll();

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY == 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY, isMobileMenuOpen]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  const toggleAudioIndicator = () => {
    setIsAudioPlaying((prev) => !prev);
    setIsIndicatorActive((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  (useEffect(() => {
    if (isAudioPlaying) {
      audioElementRef.current.play();
    } else {
      audioElementRef.current.pause();
    }
  }),
    [isAudioPlaying]);

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-3">
          <div className="flex items-center gap-7">
            <img src="/img/logo.png" alt="logo" className="w-12.5 rounded-lg" />

            <Button
              id="Ticket-button"
              title="Book Now"
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue-50 md:flex hidden item-center justify-center gap-1"
            />
          </div>

          <div className="flex h-full items-center">
            <div className="hidden md:block">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLocaleLowerCase()}`}
                  className=" nav-hover-btn "
                >
                  {item}
                </a>
              ))}
            </div>

            <button
              className="flex items-center space-x-0.5 cursor-pointer md:ml-10"
              onClick={toggleAudioIndicator}
            >
              <audio
                ref={audioElementRef}
                className="hidden"
                src="/audio/loop.mp3"
                loop
              />

              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`indicator-line ${isIndicatorActive ? "active" : ""}`}
                  style={{ animationDelay: `${bar * 0.1}s` }}
                />
              ))}
            </button>

            <button
              className="ml-5 md:hidden text-2xl flex items-center justify-center p-2 text-white"
              onClick={toggleMobileMenu}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <TiTimes /> : <TiThMenu />}
            </button>
          </div>
        </nav>
      </header>
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black rounded-lg border border-white/20 mt-2 p-6 flex flex-col items-center gap-6 md:hidden">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLocaleLowerCase()}`}
              className="text-white text-lg font-bold uppercase hover:text-blue-400 transition-colors text-[10px]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <Button
            id="Ticket-button-mobile"
            title="Book Now"
            rightIcon={<TiLocationArrow />}
            containerClass="bg-blue-50 flex item-center justify-center gap-1 w-full max-w-[200px]"
          />
        </div>
      )}
    </div>
  );
};

export default NavBar;
