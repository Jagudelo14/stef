/*
 * ### Archivo: almacen.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Persistencia en localStorage (carrito, pedidos, productos) y utilidades de formato
 */

// ### Llaves de almacenamiento ###
const LLAVES = {
  carrito: "stef_carrito",
  cupon: "stef_cupon",
  pedidos: "stef_pedidos",
  productosNuevos: "stef_productos_nuevos",
  cliente: "stef_cliente",
};

const CUPONES = { STEF10: 0.1 };
const ENVIO_GRATIS_DESDE = 250000;
const COSTO_ENVIO = 12000;

// ### Lectura y escritura segura ###
// fallback valor por defecto
const leerJSON = (llave, valorDefecto) => {
  try {
    const valor = localStorage.getItem(llave);
    return valor ? JSON.parse(valor) : valorDefecto;
  } catch (error) {
    console.error("Error leyendo localStorage:", error);
    return valorDefecto;
  }
};

const guardarJSON = (llave, valor) => {
  try {
    localStorage.setItem(llave, JSON.stringify(valor));
  } catch (error) {
    console.error("Error guardando en localStorage:", error);
  }
};

// ### Productos ###
// productos sin foto no se muestran
const obtenerProductos = () => [...leerJSON(LLAVES.productosNuevos, []).filter((producto) => producto.imagen), ...PRODUCTOS_SEMILLA];

const buscarProducto = (id) => obtenerProductos().find((producto) => producto.id === id);

const stockTotal = (producto) => Object.values(producto.stock).reduce((suma, cantidad) => suma + cantidad, 0);

// rango de tallas con stock
const rangoTallas = (producto) => {
  const disponibles = TALLAS.filter((talla) => producto.stock[talla] > 0);
  if (disponibles.length === 0) return "AGOTADO";
  if (disponibles.length === 1) return disponibles[0];
  return `${disponibles[0]} – ${disponibles[disponibles.length - 1]}`;
};

const guardarProductoNuevo = (producto) => {
  const nuevos = leerJSON(LLAVES.productosNuevos, []);
  guardarJSON(LLAVES.productosNuevos, [producto, ...nuevos]);
};

// ### Carrito ###
// descartar productos retirados
const obtenerCarrito = () => leerJSON(LLAVES.carrito, []).filter((linea) => buscarProducto(linea.id));

const guardarCarrito = (carrito) => {
  guardarJSON(LLAVES.carrito, carrito);
  actualizarContadorCarrito();
};

const cantidadCarrito = () => obtenerCarrito().reduce((suma, linea) => suma + linea.cantidad, 0);

// misma talla y color suma cantidad
const agregarAlCarrito = (nuevaLinea) => {
  const carrito = obtenerCarrito();
  const existente = carrito.find((linea) => linea.id === nuevaLinea.id && linea.talla === nuevaLinea.talla && linea.color === nuevaLinea.color);
  if (existente) {
    existente.cantidad += nuevaLinea.cantidad;
  } else {
    carrito.push(nuevaLinea);
  }
  guardarCarrito(carrito);
};

const obtenerCupon = () => leerJSON(LLAVES.cupon, null);

const guardarCupon = (codigo) => guardarJSON(LLAVES.cupon, codigo);

// totales con descuento y envío
const calcularTotales = (carrito, cupon) => {
  const subtotal = carrito.reduce((suma, linea) => {
    const producto = buscarProducto(linea.id);
    return producto ? suma + producto.precio * linea.cantidad : suma;
  }, 0);
  const porcentaje = cupon && CUPONES[cupon] ? CUPONES[cupon] : 0;
  const descuento = Math.round(subtotal * porcentaje);
  const envio = subtotal === 0 || subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
  const unidades = carrito.reduce((suma, linea) => suma + linea.cantidad, 0);
  return { subtotal, descuento, envio, total: subtotal - descuento + envio, unidades };
};

// ### Pedidos ###
const obtenerPedidosLocales = () => leerJSON(LLAVES.pedidos, []);

const obtenerPedidosUsuario = () => [...obtenerPedidosLocales(), ...PEDIDOS_USUARIO_SEMILLA];

const guardarPedido = (pedido) => guardarJSON(LLAVES.pedidos, [pedido, ...obtenerPedidosLocales()]);

// código consecutivo
const generarCodigoPedido = () => {
  const numeros = [...obtenerPedidosUsuario(), ...PEDIDOS_TIENDA_SEMILLA].map((pedido) => Number(pedido.codigo.split("-")[1]));
  const siguiente = Math.max(...numeros) + 1;
  return `STF-${String(siguiente).padStart(5, "0")}`;
};

// ### Cliente ###
const obtenerCliente = () => leerJSON(LLAVES.cliente, null);

const guardarCliente = (cliente) => guardarJSON(LLAVES.cliente, cliente);

// ### Formatos ###
const formatearPrecio = (valor) => `$${Math.round(valor).toLocaleString("es-CO")}`;

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

// iso a 12 OCT 2026 sin desfase
const formatearFecha = (fechaIso, conAnio = true) => {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  const texto = `${String(dia).padStart(2, "0")} ${MESES[mes - 1]}`;
  return conAnio ? `${texto} ${anio}` : texto;
};

const fechaHoyIso = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
};

const fechaHoyLarga = () => {
  const hoy = new Date();
  return `${DIAS[hoy.getDay()]} ${String(hoy.getDate()).padStart(2, "0")} ${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;
};

// evitar inyección html
const escaparHtml = (texto) => String(texto).replace(/[&<>"']/g, (caracter) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[caracter]));
