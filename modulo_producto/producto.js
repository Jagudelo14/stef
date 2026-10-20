/*
 * ### Archivo: producto.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Detalle de producto (galería, color, talla, cantidad y agregar al carrito)
 */

// ### Estados ###
const producto = buscarProducto(leerParametro("id") || "hoodie-pasamontanas");

const estado = {
  color: producto?.color,
  // M por defecto o la primera con stock
  talla: producto ? (producto.stock.M > 0 ? "M" : TALLAS.find((talla) => producto.stock[talla] > 0) || null) : null,
  cantidad: 1,
};

// ### Render ###
const renderNoEncontrado = () => {
  document.getElementById("contenido-producto").innerHTML = `
    <section class="cabecera-pagina">
      <p class="seccion-etiqueta">— ERROR 404</p>
      <h1>Producto no encontrado</h1>
      <div class="estado-vacio">
        <p>Puede que el enlace esté mal escrito o que el producto ya no exista.</p>
        <a href="catalogo.html" class="boton boton-primario">Ver la tienda</a>
      </div>
    </section>`;
};

const renderInfo = () => {
  const categoria = CATEGORIAS.find((item) => item.id === producto.categoria);
  document.title = `${producto.nombre} · STEF`;
  document.getElementById("migas-producto").innerHTML = `<a href="catalogo.html">TIENDA</a>  /  <a href="catalogo.html?categoria=${categoria.id}">${categoria.nombre.toUpperCase()}</a>  /  ${escaparHtml(producto.nombre.toUpperCase())}`;
  document.getElementById("nombre-producto").textContent = producto.nombre.replace(" · ", " ");
  document.getElementById("precio-producto").textContent = formatearPrecio(producto.precio);
  document.getElementById("descripcion-producto").textContent = producto.descripcion || DESCRIPCION_BASE;
};

// sin imagen queda el placeholder
const renderGaleria = () => {
  document.getElementById("galeria-principal").innerHTML = producto.imagen
    ? `<img class="foto-imagen" src="${escaparHtml(producto.imagen)}" alt="${escaparHtml(producto.nombre)}">`
    : `<span class="foto-etiqueta">[ ${escaparHtml(producto.nombre)} ]</span>`;
};

const renderColores = () => {
  document.getElementById("label-color").textContent = `COLOR  —  ${COLORES[estado.color].corto.toUpperCase()}`;
  document.getElementById("selector-colores").innerHTML = producto.colores.map((color) => `
    <button type="button" class="color-opcion ${color === estado.color ? "activo" : ""}" role="radio" aria-checked="${color === estado.color}" aria-label="${COLORES[color].nombre}" data-color="${color}" style="background-color: ${COLORES[color].hex}"></button>`).join("");
};

const renderTallas = () => {
  document.getElementById("selector-tallas").innerHTML = TALLAS.map((talla) => {
    const agotada = producto.stock[talla] === 0;
    return `<button type="button" class="talla-opcion ${talla === estado.talla ? "activo" : ""}" role="radio" aria-checked="${talla === estado.talla}" data-talla="${talla}" ${agotada ? "disabled" : ""}>${talla}</button>`;
  }).join("");
};

// texto de stock
const renderStock = () => {
  const texto = document.querySelector("#info-stock span");
  const agotadas = TALLAS.filter((talla) => producto.stock[talla] === 0);
  const botonAgregar = document.getElementById("agregar-carrito");

  if (!estado.talla) {
    texto.textContent = "Producto agotado en todas las tallas";
    botonAgregar.disabled = true;
    botonAgregar.textContent = "Agotado";
    return;
  }

  const partes = [`Quedan ${producto.stock[estado.talla]} en talla ${estado.talla}`];
  if (agotadas.length) partes.push(`${agotadas.join(", ")} agotado`);
  texto.textContent = partes.join(" · ");
  document.getElementById("cantidad").textContent = estado.cantidad;
};

const renderCombina = () => {
  // otras categorías primero
  const sugeridos = obtenerProductos()
    .filter((item) => item.id !== producto.id && stockTotal(item) > 0)
    .sort((a, b) => (a.categoria === producto.categoria) - (b.categoria === producto.categoria))
    .slice(0, 8);

  const track = document.getElementById("combina-track");
  track.innerHTML = sugeridos.map((item) => crearTarjetaProducto(item, { carrusel: true })).join("");

  iniciarCarrusel({
    viewport: document.getElementById("combina-viewport"),
    track,
    anterior: document.getElementById("combina-anterior"),
    siguiente: document.getElementById("combina-siguiente"),
  });
};

// ### Manejadores ###
const handleCambiarColor = (evento) => {
  const boton = evento.target.closest("[data-color]");
  if (!boton) return;
  estado.color = boton.dataset.color;
  renderColores();
};

const handleCambiarTalla = (evento) => {
  const boton = evento.target.closest("[data-talla]");
  if (!boton || boton.disabled) return;
  estado.talla = boton.dataset.talla;
  // ajustar cantidad al stock
  estado.cantidad = Math.min(estado.cantidad, producto.stock[estado.talla]);
  renderTallas();
  renderStock();
};

const handleCambiarCantidad = (cambio) => {
  if (!estado.talla) return;
  const maximo = producto.stock[estado.talla];
  const nuevaCantidad = estado.cantidad + cambio;
  if (nuevaCantidad < 1) return;
  if (nuevaCantidad > maximo) {
    alertaInfo("Sin más unidades", `Solo quedan ${maximo} en talla ${estado.talla}.`);
    return;
  }
  estado.cantidad = nuevaCantidad;
  renderStock();
};

const handleAgregarCarrito = async () => {
  if (!estado.talla) return;

  agregarAlCarrito({ id: producto.id, talla: estado.talla, color: estado.color, cantidad: estado.cantidad });

  const { isConfirmed } = await Alerta.fire({
    icon: "success",
    iconColor: "#5cf4e6",
    title: "Agregado al carrito",
    text: `${producto.nombre} · Talla ${estado.talla} · ${COLORES[estado.color].nombre} × ${estado.cantidad}`,
    showCancelButton: true,
    confirmButtonText: "Ver carrito",
    cancelButtonText: "Seguir comprando",
  });
  if (isConfirmed) window.location.href = "carrito.html";
};

// ### Inicio ###
renderHeader({ promo: true, activo: producto && ENLACES_NAV.some((enlace) => enlace.id === producto.categoria) ? producto.categoria : "tienda" });
renderFooterSimple();

if (!producto) {
  renderNoEncontrado();
} else {
  renderInfo();
  renderGaleria();
  renderColores();
  renderTallas();
  renderStock();
  renderCombina();

  document.getElementById("selector-colores").addEventListener("click", handleCambiarColor);
  document.getElementById("selector-tallas").addEventListener("click", handleCambiarTalla);
  document.getElementById("restar-cantidad").addEventListener("click", () => handleCambiarCantidad(-1));
  document.getElementById("sumar-cantidad").addEventListener("click", () => handleCambiarCantidad(1));
  document.getElementById("agregar-carrito").addEventListener("click", handleAgregarCarrito);
  document.getElementById("guia-tallas").addEventListener("click", () => alertaInfo(TEXTOS_AYUDA.tallas.titulo, TEXTOS_AYUDA.tallas.texto));
}
