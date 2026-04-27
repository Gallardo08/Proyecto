export type Product = {
  id: string;
  name: string;
  business: string;
  category: string;
  price: number;
  discount: number;
  description: string;
  location: string;
  whatsapp: string;
  image: string;
  date: string;
};

export const categories = [
  "Comida",
  "Moda",
  "Tecnología",
  "Hogar",
  "Belleza",
  "Servicios",
  "Artesanías",
];

export const initialProducts: Product[] = [
  {
    id: "p1",
    name: "Hamburguesa Artesanal La Brasa",
    business: "Brasa Ocaña",
    category: "Comida",
    price: 18000,
    discount: 15,
    description: "Carne 150g, queso cheddar, tocineta y papas a la francesa.",
    location: "Calle 11 #14-22, Ocaña",
    whatsapp: "573001112233",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop",
    date: "2026-04-20",
  },
  {
    id: "p2",
    name: "Bolso tejido a mano",
    business: "Artesanías Lucy",
    category: "Artesanías",
    price: 65000,
    discount: 0,
    description: "Bolso 100% algodón, tejido tradicional de la región.",
    location: "Cra. 12 #9-30, Ocaña",
    whatsapp: "573002223344",
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop",
    date: "2026-04-18",
  },
  {
    id: "p3",
    name: "Corte + Barba Premium",
    business: "Barbería El Patrón",
    category: "Servicios",
    price: 25000,
    discount: 20,
    description: "Corte clásico o moderno, perfilado de barba y mascarilla.",
    location: "Av. Francisco Fernández #5-12",
    whatsapp: "573003334455",
    image:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop",
    date: "2026-04-22",
  },
  {
    id: "p4",
    name: "Vestido floral verano",
    business: "Moda Selena",
    category: "Moda",
    price: 89000,
    discount: 10,
    description: "Vestido midi, tela fresca, estampado floral exclusivo.",
    location: "Centro Comercial Plaza, local 12",
    whatsapp: "573004445566",
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop",
    date: "2026-04-19",
  },
];
