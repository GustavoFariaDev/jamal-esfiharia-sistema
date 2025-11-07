// Mock data for Jamal Esfiharia

export const restaurantInfo = {
  name: "Jamal Esfiharia",
  established: 1992,
  description: "Tradição desde 1992, entregando sabores únicos em nossa cidade, a Jamal Esfiharia é símbolo de qualidade e agilidade no segmento da gastronomia.",
  specialties: ["Esfihas artesanais", "Mais de 80 sabores", "Massa 100% artesanal", "Ingredientes frescos"],
  contact: {
    phone: "(11) 3456-7890",
    whatsapp: "(11) 98765-4321",
    email: "contato@jamalesfiharia.com.br"
  },
  address: {
    street: "Av. São João, 1245",
    district: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01035-000"
  },
  hours: {
    monday_thursday: "18h às 23h",
    friday_saturday: "18h às 23h30", 
    sunday: "18h às 23h"
  },
  social: {
    facebook: "https://facebook.com/jamalesfiharia",
    instagram: "https://instagram.com/jamalesfiharia",
    twitter: "https://twitter.com/jamalesfiharia"
  }
};

export const menuCategories = [
  {
    id: 1,
    name: "Esfihas Salgadas",
    items: [
      { id: 1, name: "Esfiha de Carne", price: 8.90, description: "Carne temperada com cebola e especiarias árabes" },
      { id: 2, name: "Esfiha de Frango", price: 8.50, description: "Frango desfiado com temperos especiais" },
      { id: 3, name: "Esfiha de Queijo", price: 7.90, description: "Queijo mussarela derretido" },
      { id: 4, name: "Esfiha de Calabresa", price: 9.50, description: "Calabresa com cebola e pimentão" },
      { id: 5, name: "Esfiha de Atum", price: 10.90, description: "Atum com cream cheese e azeitonas" }
    ]
  },
  {
    id: 2,
    name: "Esfihas Doces",
    items: [
      { id: 6, name: "Esfiha de Chocolate", price: 6.90, description: "Chocolate cremoso com granulado" },
      { id: 7, name: "Esfiha de Doce de Leite", price: 7.50, description: "Doce de leite artesanal" },
      { id: 8, name: "Esfiha de Banana com Canela", price: 8.90, description: "Banana com canela e açúcar cristal" },
      { id: 9, name: "Esfiha de Brigadeiro", price: 8.50, description: "Brigadeiro cremoso com granulado" }
    ]
  },
  {
    id: 3,
    name: "Esfihas Especiais",
    items: [
      { id: 10, name: "Esfiha Jamal Especial", price: 15.90, description: "Carne, queijo, tomate seco e rúcula" },
      { id: 11, name: "Esfiha Vegetariana", price: 12.90, description: "Mix de vegetais com queijo" },
      { id: 12, name: "Esfiha Salmão", price: 18.90, description: "Salmão grelhado com cream cheese" }
    ]
  }
];

export const galleryImages = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1709114107937-6dec855d9ab5",
    alt: "Esfihas tradicionais variadas",
    category: "food"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", 
    alt: "Interior do restaurante Jamal",
    category: "restaurant"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1626379907504-327b925f4b79",
    alt: "Pratos da culinária árabe-brasileira",
    category: "food"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    alt: "Apresentação especial dos pratos",
    category: "food"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Maria Silva",
    rating: 5,
    comment: "As melhores esfihas da cidade! Massa perfeita e recheio abundante. Recomendo demais!",
    date: "2024-01-15"
  },
  {
    id: 2,
    name: "João Santos",
    rating: 5,
    comment: "Tradição familiar que vale a pena conhecer. Sabor autêntico e atendimento excelente.",
    date: "2024-01-10"  
  },
  {
    id: 3,
    name: "Ana Costa",
    rating: 5,
    comment: "Delivery rápido e esfihas quentinhas. Viramos clientes fiéis!",
    date: "2024-01-05"
  }
];

export default {
  restaurantInfo,
  menuCategories, 
  galleryImages,
  testimonials
};