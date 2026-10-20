/*
 * ### Archivo: datos.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Datos semilla de la tienda (productos, colores, categorías y pedidos de ejemplo)
 */

// ### Catálogos base ###
// solo prendas superiores
const CATEGORIAS = [
  { id: "todo", nombre: "Todo" },
  { id: "hoodies", nombre: "Hoodies" },
  { id: "camisetas", nombre: "Camisetas" },
  { id: "mascotas", nombre: "Mascotas" },
];

const COLORES = {
  hielo: { nombre: "Blanco hielo", corto: "Hielo", hex: "#EDEDE6", punto: "assets/img/punto-hielo.svg" },
  noche: { nombre: "Negro noche", corto: "Noche", hex: "#0A0A0D", punto: "assets/img/punto-noche.svg" },
  humo: { nombre: "Gris humo", corto: "Humo", hex: "#8C9499", punto: "assets/img/punto-humo.svg" },
  lila: { nombre: "Lila", corto: "Lila", hex: "#C9B8D9", punto: "assets/img/punto-lila.svg" },
};

const TALLAS = ["XS", "S", "M", "L", "XL"];

const DESCRIPCION_BASE = "Algodón felpado de 380 g con capucha cerrada tipo pasamontañas. El estampado trazo recorre la manga izquierda y termina en la espalda. Corte amplio, sin marcas visibles por fuera.";

const FOTOS = "assets/img/productos/";

// ### Productos ###
// stock por talla, 0 = agotado
const PRODUCTOS_SEMILLA = [
  { id: "hoodie-pasamontanas", nombre: "Hoodie Pasamontañas", precio: 189900, categoria: "hoodies", colores: ["noche", "hielo"], color: "noche", stock: { XS: 3, S: 5, M: 7, L: 6, XL: 2 }, tag: "NUEVO", imagen: FOTOS + "hoodie-pasamontanas.jpg", fecha: "2026-10-12", descripcion: DESCRIPCION_BASE + " Viene en negro noche y blanco hielo." },
  { id: "set-trazo-neon", nombre: "Set Trazo Neón · Tú y tu perro", precio: 149900, categoria: "mascotas", colores: ["noche"], color: "noche", stock: { XS: 2, S: 4, M: 5, L: 4, XL: 2 }, tag: "NUEVO", imagen: FOTOS + "set-trazo-neon.jpg", fecha: "2026-10-10", descripcion: "Dos camisetas negras a juego: una para ti y otra cortada para tu perro, con el trazo cian reflectivo y el corazón SSS en el pecho. La talla elegida es la tuya; la de tu perro se ajusta al confirmar el pedido." },
  { id: "hoodie-mascota-hielo", nombre: "Hoodie Mascota · Hielo", precio: 79900, categoria: "mascotas", colores: ["hielo"], color: "hielo", stock: { XS: 4, S: 5, M: 3, L: 2, XL: 1 }, imagen: FOTOS + "hoodie-mascota-hielo.jpg", fecha: "2026-10-05", descripcion: "La misma felpa del hoodie humano, en versión para perro. Cremallera al frente, capucha y puños elásticos." },
  { id: "camiseta-manga-larga-lila", nombre: "Camiseta Manga Larga · Lila", precio: 89900, categoria: "camisetas", colores: ["lila", "noche"], color: "lila", stock: { XS: 3, S: 4, M: 4, L: 2, XL: 0 }, imagen: FOTOS + "camiseta-manga-larga-lila.jpg", fecha: "2026-09-28", descripcion: "Tejido acanalado suave, cuello alto y manga larga con abertura para el pulgar. Corte corto a la cintura." },
  { id: "camiseta-manga-larga-noche", nombre: "Camiseta Manga Larga · Noche", precio: 89900, categoria: "camisetas", colores: ["noche", "lila"], color: "noche", stock: { XS: 0, S: 1, M: 2, L: 1, XL: 0 }, tag: "ÚLTIMAS", imagen: FOTOS + "camiseta-manga-larga-noche.jpg", fecha: "2026-09-20", descripcion: "Tejido acanalado ajustado al cuerpo, cuello redondo alto y manga larga con abertura para el pulgar." },
  { id: "camiseta-basica-hielo", nombre: "Camiseta Básica · Hielo", precio: 79900, categoria: "camisetas", colores: ["hielo", "noche", "humo"], color: "hielo", stock: { XS: 5, S: 8, M: 9, L: 7, XL: 4 }, imagen: FOTOS + "camiseta-basica-hielo.jpg", fecha: "2026-09-12", descripcion: "Algodón flameado de 200 g, cuello redondo alto y manga corta. La básica que va con todo." },
  { id: "camiseta-sin-mangas-noche", nombre: "Camiseta Sin Mangas · Noche", precio: 74900, categoria: "camisetas", colores: ["noche", "humo"], color: "noche", stock: { XS: 2, S: 4, M: 5, L: 4, XL: 3 }, imagen: FOTOS + "camiseta-sin-mangas-noche.jpg", fecha: "2026-09-02", descripcion: "Tejido waffle de algodón, sisa amplia y caída suelta. Para los días de sol en la ciudad." },
];

// ### Pedidos de ejemplo ###
// pedidos demo mis pedidos
const PEDIDOS_USUARIO_SEMILLA = [
  { codigo: "STF-01482", fecha: "2026-10-12", estado: "En camino", total: 339800, items: [{ id: "hoodie-pasamontanas", talla: "M", color: "noche", cantidad: 1 }, { id: "set-trazo-neon", talla: "M", color: "noche", cantidad: 1 }] },
  { codigo: "STF-01377", fecha: "2026-09-28", estado: "Entregado", total: 189900, items: [{ id: "hoodie-pasamontanas", talla: "M", color: "hielo", cantidad: 1 }] },
  { codigo: "STF-01201", fecha: "2026-09-03", estado: "Entregado", total: 261700, items: [{ id: "camiseta-manga-larga-lila", talla: "S", color: "lila", cantidad: 1 }, { id: "hoodie-mascota-hielo", talla: "S", color: "hielo", cantidad: 1 }, { id: "camiseta-basica-hielo", talla: "M", color: "hielo", cantidad: 1 }] },
];

// pedidos demo admin
const PEDIDOS_TIENDA_SEMILLA = [
  { codigo: "STF-01482", cliente: "Camila Ruiz", fecha: "2026-10-12", estado: "En camino", total: 339800 },
  { codigo: "STF-01481", cliente: "Andrés Mora", fecha: "2026-10-12", estado: "Por despachar", total: 189900 },
  { codigo: "STF-01480", cliente: "Laura Gómez", fecha: "2026-10-11", estado: "Pagado", total: 259800 },
  { codigo: "STF-01479", cliente: "Mateo Peña", fecha: "2026-10-11", estado: "Entregado", total: 99900 },
  { codigo: "STF-01478", cliente: "Sara Díaz", fecha: "2026-10-10", estado: "Entregado", total: 109900 },
  { codigo: "STF-01477", cliente: "Felipe Rojas", fecha: "2026-10-09", estado: "Entregado", total: 189900 },
  { codigo: "STF-01476", cliente: "Valentina Castro", fecha: "2026-10-08", estado: "Entregado", total: 229800 },
];

// métricas base del mes
const METRICAS_BASE = { ventasMes: 18420000, pedidosMes: 126, porDespachar: 9, variacionVentas: "+12 % vs. sep", variacionTicket: "+4 %" };
