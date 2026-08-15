import React from "react";
import { MapPin, Clock, Phone, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-jamal-red text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Footer Content Grid */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Address */}
              <div className="text-center md:text-left">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center md:justify-start">
                  <MapPin className="mr-2" size={20} />
                  ENDEREÇO
                </h3>
                <p className="text-white leading-relaxed">
                  Av. Gago Coutinho, 310<br />
                  Santa Maria, Santo André - SP<br />
                  CEP: 09070-000
                </p>
              </div>

              {/* Hours */}
              <div className="text-center md:text-left">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center md:justify-start">
                  <Clock className="mr-2" size={20} />
                  HORÁRIO DE ATENDIMENTO
                </h3>
                <div className="text-white space-y-1">
                  <p>Segunda a quinta: 18h às 23h</p>
                  <p>Sexta e sábado: 18h às 23h30</p>
                  <p>Domingo: 18h às 23h</p>
                </div>
              </div>

              {/* Delivery */}
              <div className="text-center md:text-left">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center md:justify-start">
                  <Phone className="mr-2" size={20} />
                  DELIVERY
                </h3>
                <div className="text-white space-y-2">
                  <p className="font-semibold">Telefone:</p>
                  <p className="text-xl text-jamal-yellow font-bold">(11) 4319-0009</p>

                </div>
              </div>
            </div>

            {/* Social */}
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg mb-4">
                REDES SOCIAIS
              </h3>
              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href="https://www.facebook.com/profile.php?id=100072024572559"
                  className="text-gray-400 hover:text-jamal-yellow transition-colors duration-200"
                >
                  <Facebook size={24} />
                </a>
                <a
                  href="https://www.instagram.com/esfihariajamal/"
                  className="text-gray-400 hover:text-jamal-yellow transition-colors duration-200"
                >
                  <Instagram size={24} />
                </a>

              </div>
              <div className="mt-4 text-white text-sm">
                <p>Siga-nos para novidades</p>
                <p>e promoções especiais!</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-white text-sm">
              <p>© Copyright 2024 Jamal Esfiharia - Todos os direitos reservados.</p>
              <p className="mt-2 md:mt-0">Desenvolvido para você</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;