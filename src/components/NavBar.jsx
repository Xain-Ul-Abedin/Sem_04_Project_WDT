import React, { useEffect, useRef, useState } from "react";
import { useWindowScroll } from "react-use";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "./Button";
import { TiLocationArrow, TiThMenu, TiTimes, TiWeatherSunny, TiWeatherNight } from "react-icons/ti";
import gsap from "gsap";

const navItems = [
  { name: "About Us", link: "#about-us" },
  { name: "What We Offer", link: "#what-we-offer" },
  { name: "Get Involved", link: "#adopt" },
  { name: "Info Desk", link: "#how-to-reach" },
  { name: "Media Room", link: "#story" },
];

const NavBar = () => {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navContainerRef = useRef(null);
  const audioElementRef = useRef(null);

  const { y: currentScrollY } = useWindowScroll();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, link) => {
    e.preventDefault();

    if (link.startsWith("#")) {
      if (location.pathname === "/") {
        const section = document.querySelector(link);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to home and scroll
        navigate("/");
        setTimeout(() => {
          const section = document.querySelector(link);
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } else {
      navigate(link);
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY === 0) {
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

  useEffect(() => {
    if (isAudioPlaying) {
      audioElementRef.current.play();
    } else {
      audioElementRef.current.pause();
    }
  }, [isAudioPlaying]);

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-3">
          <div className="flex items-center gap-7">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="cursor-pointer"
            >
              <img src="/img/logo.png" alt="logo" className="w-12.5 rounded-lg" />
            </button>

            <Button
              id="Ticket-button"
              title="Book Now"
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue-50 md:flex hidden item-center justify-center gap-1"
              accentColor="#22c55e"
            />
          </div>

          <div className="flex h-full items-center">
            <div className="hidden md:block">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  onClick={(e) => handleNavClick(e, item.link)}
                  className=" nav-hover-btn "
                >
                  {item.name}
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

            {/* Theme Toggle Removed */}
            <button
              className="ml-5 flex items-center justify-center text-2xl cursor-pointer transition-colors duration-300 hover:text-blue-300"
              onClick={() => { }}
              style={{ display: 'none' }}
            >
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
              key={item.name}
              href={item.link}
              className="text-white text-lg font-bold uppercase hover:text-blue-400 transition-colors"
              onClick={(e) => {
                handleNavClick(e, item.link);
                setIsMobileMenuOpen(false);
              }}
            >
              {item.name}
            </a>
          ))}
          <Button
            id="Ticket-button-mobile"
            title="Book Now"
            rightIcon={<TiLocationArrow />}
            containerClass="bg-blue-50 flex item-center justify-center gap-1 w-full max-w-[200px]"
            accentColor="#22c55e"
          />
        </div>
      )}
    </div>
  );
};

export default NavBar;
