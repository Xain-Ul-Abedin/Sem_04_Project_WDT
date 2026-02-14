import About from "./components/About";
import Hero from "./components/Hero";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Features from "./components/Features";
import Footer from "./components/Footer";
import GuideMap from "./components/GuideMap";
import Gallery from "./components/Gallery";
import Contact from "./components/Contact";
import FloatingImage from "./components/Story";
import AdoptPet from "./components/AdoptPet";
import HowToReach from "./components/HowToReach";

const Home = () => (
  <main className="relative min-h-screen w-screen overflow-x-hidden bg-white">
    <NavBar />
    <Hero />
    <About />
    <GuideMap />
    <Features />
    <FloatingImage />
    <AdoptPet />
    <Contact />
    <HowToReach />
    <Footer />
  </main>
);

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/gallery" element={<Gallery />} />
    </Routes>
  );
};

export default App;
