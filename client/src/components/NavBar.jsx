import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Button from "./Button";
import { TiLocationArrow, TiThMenu, TiTimes } from "react-icons/ti";
import { ChevronDown, LayoutDashboard, LogOut, Settings, Tickets, UserCircle2 } from "lucide-react";
import gsap from "gsap";

const navItems = [
  { name: "About Us", link: "#about-us" },
  { name: "What We Offer", link: "#what-we-offer" },
  { name: "Get Involved", link: "#adopt" },
  { name: "Info Desk", link: "#how-to-reach" },
  { name: "Media Room", link: "#story" },
];

const NavBar = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const lastScrollYRef = useRef(0);
  const navContainerRef = useRef(null);
  const audioElementRef = useRef(null);
  const profileMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const isHomePage = location.pathname === "/";
  const isHeroState = isHomePage && scrollY === 0 && !isMobileMenuOpen;
  const isFloating = !isHomePage || isMobileMenuOpen || scrollY > 0;
  const isNavVisible =
    !isHomePage || isMobileMenuOpen || scrollY === 0 || scrollDirection === "up";

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
    const handleScroll = () => {
      const nextScrollY = window.scrollY;

      if (nextScrollY !== lastScrollYRef.current) {
        setScrollDirection(nextScrollY > lastScrollYRef.current ? "down" : "up");
        lastScrollYRef.current = nextScrollY;
      }

      setScrollY(nextScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navContainerRef.current) {
      return;
    }

    navContainerRef.current.classList.toggle("floating-nav", isFloating);
  }, [isFloating]);

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
    if (!audioElementRef.current) {
      return;
    }

    if (isAudioPlaying) {
      audioElementRef.current.play();
    } else {
      audioElementRef.current.pause();
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const profileMenuItems = isAdmin
    ? [
        { label: "Profile", icon: UserCircle2, to: "/profile" },
        { label: "Account Settings", icon: Settings, to: "/profile" },
        { label: "Admin Dashboard", icon: LayoutDashboard, to: "/admin" },
      ]
    : [
        { label: "Profile", icon: UserCircle2, to: "/profile" },
        { label: "Account Settings", icon: Settings, to: "/profile" },
        { label: "My Bookings", icon: Tickets, to: "/my-bookings" },
      ];
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'Z';

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
              title={isAuthenticated ? (isAdmin ? "Dashboard" : "Book Tickets") : "Login to Book"}
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue-50 md:flex hidden item-center justify-center gap-1"
              accentColor="#22c55e"
              onClick={() => navigate(isAuthenticated ? (isAdmin ? "/admin" : "/tickets") : "/login")}
            />
          </div>

          <div className="flex h-full items-center">
            <div className="hidden md:block">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.link}
                  onClick={(e) => handleNavClick(e, item.link)}
                  className={`nav-hover-btn ${isHeroState || isFloating ? "nav-text-white" : "text-black"}`}
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
                  className={`indicator-line ${isIndicatorActive ? "active" : ""} ${isHeroState || isFloating ? "nav-bg-white" : "bg-black"}`}
                  style={{ animationDelay: `${bar * 0.1}s` }}
                />
              ))}
            </button>

            {/* Auth Menu */}
            <div className="ml-5 hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen}
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm transition ${
                      isFloating
                        ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
                        : "border-black/10 bg-white/90 text-black hover:bg-white"
                    }`}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user?.name || 'Profile avatar'} className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" />
                    ) : (
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        isFloating ? "bg-white/15 text-white" : "bg-emerald-100 text-emerald-900"
                      }`}>
                        {userInitial}
                      </div>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-3xl border border-white/60 bg-white/95 p-3 text-black shadow-[0_18px_60px_rgba(17,24,39,0.18)] backdrop-blur">
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-4">
                        <div className="flex items-center gap-3">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user?.name || 'Profile avatar'} className="h-12 w-12 rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-black uppercase text-emerald-900">
                              {userInitial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">{user?.name}</p>
                            <p className="mt-1 truncate text-xs font-medium text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.label}
                            to={item.to}
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                          navigate("/");
                        }}
                        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-red-100 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className={`text-sm font-bold uppercase transition-colors ${isHeroState || isFloating ? "text-white hover:text-blue-200" : "text-black hover:text-blue-600"}`}>
                  Login
                </Link>
              )}
            </div>

            <button
              className={`ml-5 md:hidden text-2xl flex items-center justify-center p-2 transition-colors ${isHeroState || isFloating ? "text-white" : "text-black"}`}
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
            title={isAuthenticated ? (isAdmin ? "Dashboard" : "Book Tickets") : "Login to Book"}
            rightIcon={<TiLocationArrow />}
            containerClass="bg-blue-50 flex item-center justify-center gap-1 w-full max-w-[200px]"
            accentColor="#22c55e"
              onClick={() => {
                setIsProfileMenuOpen(false);
                navigate(isAuthenticated ? (isAdmin ? "/admin" : "/tickets") : "/login");
                setIsMobileMenuOpen(false);
              }}
          />
          {isAuthenticated ? (
            <div className="flex w-full flex-col gap-3 border-t border-white/10 pt-4 text-center">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
              >
                Profile
              </Link>
              <Link
                to={isAdmin ? "/admin" : "/my-bookings"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
              >
                {isAdmin ? "Admin Dashboard" : "My Bookings"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                  setIsMobileMenuOpen(false);
                }}
                className="rounded-full border border-red-500/40 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-300 transition hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default NavBar;
