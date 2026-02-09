import React from "react";
import Hero from "./components/Hero";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import About from "./components/About";
import Features from "./components/Features";

const App = () => {
  
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <NavBar />
      <Hero />
      <About />
      <Features />
      <Footer />
    </main>
  );
};

export default App;
