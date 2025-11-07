import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "SOBRE", href: "#sobre" },
    { name: "O RESTAURANTE", href: "#restaurante" },
    { name: "CARDÁPIO", href: "/cardapio" }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">
              <span className="text-jamal-gold script-font text-3xl">Jamal</span>
              <span className="text-white ml-2">Esfiharia</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.target || "_self"}
                className="text-white hover:text-jamal-gold transition-colors duration-200 font-medium text-sm tracking-wide"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-jamal-gold transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.target || "_self"}
                className="block text-white hover:text-jamal-gold py-2 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;