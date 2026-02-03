import React from "react";
import Hero from "./components/Hero";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden-hidden">
      <NavBar />
      <Hero />
      <Footer />
    </main>
  );
};

export default App;
