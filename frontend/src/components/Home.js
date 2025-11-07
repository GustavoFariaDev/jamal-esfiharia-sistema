import React from "react";
import Header from "./Header";
import HeroSlider from "./HeroSlider";
import WelcomeSection from "./WelcomeSection";
import RestaurantSection from "./RestaurantSection";
import Footer from "./Footer";
import RestaurantStatusBanner from "./RestaurantStatusBanner";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <RestaurantStatusBanner />
      <HeroSlider />
      <WelcomeSection />
      <RestaurantSection />
      <Footer />
    </div>
  );
};

export default Home;