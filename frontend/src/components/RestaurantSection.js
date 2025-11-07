import React from "react";
import { Clock, MapPin, Phone } from "lucide-react";

const RestaurantSection = () => {
  return (
    <section id="restaurante" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              O RESTAURANTE
            </h2>
            <div className="flex items-center justify-center">
              <div className="h-px bg-jamal-red w-24"></div>
              <div className="mx-4 text-jamal-red">✧</div>
              <div className="h-px bg-jamal-red w-24"></div>
            </div>
          </div>

          {/* Restaurant Content */}
          <div className="max-w-3xl mx-auto">


            {/* Restaurant Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Um ambiente acolhedor e familiar, onde a tradição das esfihas árabes se une 
                  ao carinho brasileiro. Nossa cozinha aberta permite que você acompanhe o 
                  preparo artesanal de cada esfiha, garantindo frescor e qualidade.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Com mais de 30 anos de experiência, oferecemos um espaço confortável para 
                  toda a família desfrutar dos melhores sabores da culinária árabe-brasileira.
                </p>
              </div>

              {/* Quick Info Cards */}
              <div className="grid gap-4">
                <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <MapPin className="text-jamal-red" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Localização</h4>
                    <p className="text-gray-600">Av. Gago Coutinho, 310 - Santa Maria, Santo André - SP CEP: 09070-000</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Clock className="text-jamal-red" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Horário</h4>
                    <p className="text-gray-600">Seg-Qui: 18h às 23h30</p>
                    <p className="text-gray-600">Sex-Sáb: 18h às 00h</p>
                    <p className="text-gray-600">Domingo: 18h às 23h</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Phone className="text-jamal-red" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Reservas</h4>
                    <p className="text-gray-600">(11) 93333-1106</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantSection;