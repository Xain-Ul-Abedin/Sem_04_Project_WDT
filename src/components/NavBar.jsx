import React from "react";

const NavBar = () => {
  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/20 bg-linear-to-b from-white/10 to-transparent shadow-sm">
        <div className="mx-auto w-full px-2 sm:px-3 lg:px-6">
          {/* Adjusted height to standard h-48 or arbitrary h-[200px] if you want it big */}
          <div className="flex h-15 px-4 my-3 items-center justify-between">
            <div className="flex space-x-4 items-center">
              {/* FIXED: used text-[100px] instead of font-[100px] */}
              <h2 className="special-font hero-title text-blue-100 text-[40px] tracking-wider leading- text-shadow-2">
                Web Title
              </h2>
              <button className="border-transparent w-40 h-10 rounded-4xl font-bold bg-[#DFDFF2] hover:rounded-[5px] transition-all ease-in-out delay-350">
                Products
              </button>
              <button className="border-transparent w-40 h-10 rounded-4xl font-bold bg-[#DFDFF2] hover:rounded-[5px] transition-all ease-in-out delay-350">
                Btn2
              </button>
            </div>

            <div className="flex space-x-4">
              <a
                href="#"
                className="rounded-md px-3 py-2 text-sm font-medium  text-white drop-shadow-md hover:bg-white/10"
              >
                Home
              </a>
              <a
                href="#"
                className="rounded-md px-3 py-2 text-sm font-medium  text-white/90 drop-shadow-md hover:bg-white/10 hover:text-white"
              >
                About
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
