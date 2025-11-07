import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "/esfiha1.png",
      alt: "Esfihas de carne tradicionais"
    },
    {
      id: 2,
      image: "/esfiha2.png",
      alt: "Esfihas de queijo"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      ))}

      {/* Logo and Text Overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center">
          {/* Esfiha Icon */}
          <div className="mb-6">
            <svg
              width="80"
              height="60"
              viewBox="0 0 100 75"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto text-white"
            >
              <path
                d="M50 10 C30 20, 20 35, 25 50 C30 65, 70 65, 75 50 C80 35, 70 20, 50 10 Z"
                stroke="currentColor"
                strokeWidth="3"
                fill="rgba(255,255,255,0.1)"
              />
              <path
                d="M35 35 L50 25 L65 35 L60 45 L40 45 Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="rgba(255,255,255,0.2)"
              />
            </svg>
          </div>

          {/* Main Logo Text */}
          <h1 className="text-6xl md:text-8xl font-bold mb-4">
            <span className="script-font text-jamal-gold">Jamal</span>
            <br />
            <span className="tracking-wider">Esfiharia</span>
          </h1>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-jamal-gold transition-colors duration-200"
      >
        <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center hover:bg-white hover:bg-opacity-10">
          <ChevronLeft size={24} />
        </div>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-jamal-gold transition-colors duration-200"
      >
        <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center hover:bg-white hover:bg-opacity-10">
          <ChevronRight size={24} />
        </div>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentSlide ? "bg-jamal-gold" : "bg-white bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;