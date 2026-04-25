import About from "../components/About";
import Hero from "../components/Hero";
import Features from "../components/Features";
import GuideMap from "../components/GuideMap";
import FloatingImage from "../components/Story";
import AdoptPet from "../components/AdoptPet";
import Contact from "../components/Contact";
import HowToReach from "../components/HowToReach";

const Home = () => {
  return (
    <div className="relative w-screen overflow-x-hidden">
      <Hero />
      <About />
      <GuideMap />
      <Features />
      <FloatingImage />
      <AdoptPet />
      <Contact />
      <HowToReach />
    </div>
  );
};

export default Home;
