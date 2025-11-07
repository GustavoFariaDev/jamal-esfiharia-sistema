import React from "react";

const WelcomeSection = () => {
  return (
    <section id="sobre" className="py-20 bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative Line */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-jamal-red w-24"></div>
            <div className="mx-4 text-jamal-red">✧</div>
            <div className="h-px bg-jamal-red w-24"></div>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            <span className="text-jamal-red">JAMAL</span>
            <br />
            <span className="text-gray-700">ESFIHARIA</span>
          </h2>

          {/* Decorative Line */}
          <div className="flex items-center justify-center mb-12">
            <div className="h-px bg-jamal-red w-24"></div>
            <div className="mx-4 text-jamal-red">✧</div>
            <div className="h-px bg-jamal-red w-24"></div>
          </div>

          {/* Description Text */}
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Tradição árabe em cada esfiha. Preparamos nossos produtos artesanalmente com 
            ingredientes frescos e receitas tradicionais passadas de geração em geração. 
            Venha experimentar o autêntico sabor da culinária árabe.
          </p>

          {/* Call to Action */}
          <div className="mt-12">
            <a
              href="https://jamal-esfiharia.onrender.com/cardapio"
              className="inline-block bg-jamal-red hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              CONHEÇA NOSSO CARDÁPIO
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;