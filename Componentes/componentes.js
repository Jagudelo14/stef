/*
 * ### Archivo: componentes.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Componentes compartidos (header, footer, tarjeta de producto, carrusel y alertas)
 */

// ### Alertas ###
// tema oscuro swal
const Alerta = Swal.mixin({
  customClass: { popup: "alerta-stef" },
  buttonsStyling: false,
  confirmButtonText: "Aceptar",
  cancelButtonText: "Cancelar",
});

const alertaExito = (titulo, texto) => Alerta.fire({ icon: "success", title: titulo, text: texto, timer: 2000, showConfirmButton: false, iconColor: "#5cf4e6" });

const alertaError = (titulo, texto) => Alerta.fire({ icon: "error", title: titulo, text: texto, iconColor: "#ff6b6b" });

const alertaInfo = (titulo, texto) => Alerta.fire({ icon: "info", title: titulo, text: texto, iconColor: "#5cf4e6" });

// ### Encabezado ###
const ENLACES_NAV = [
  { id: "tienda", nombre: "TIENDA", url: "catalogo.html" },
  { id: "hoodies", nombre: "HOODIES", url: "catalogo.html?categoria=hoodies" },
  { id: "camisetas", nombre: "CAMISETAS", url: "catalogo.html?categoria=camisetas" },
  { id: "mascotas", nombre: "MASCOTAS", url: "catalogo.html?categoria=mascotas" },
];

const crearLogo = () => `
  <a href="index.html" class="logo-stef" aria-label="STEF - Inicio">
    <img class="logo-marca" src="assets/img/logo-marca.png" alt="">
    <span class="logo-texto">STEF</span>
  </a>`;

const renderHeader = ({ promo = true, activo = "" } = {}) => {
  const contenedor = document.getElementById("header");
  if (!contenedor) return;

  const enlaces = ENLACES_NAV.map((enlace) => `<a href="${enlace.url}" class="nav-link ${enlace.id === activo ? "activo" : ""}">${enlace.nombre}</a>`).join("");
  // carrito activo menos en cuenta
  const carritoActivo = activo !== "cuenta";

  contenedor.className = "header-stef";
  contenedor.innerHTML = `
    ${promo ? `<div class="promo-bar">ENVÍO GRATIS EN COMPRAS DESDE $250.000   /   DROP 02 DISPONIBLE</div>` : ""}
    <nav class="nav-stef" aria-label="Principal">
      <button class="nav-menu-boton" type="button" aria-expanded="false" aria-controls="nav-principal">MENÚ</button>
      <div class="nav-grupo nav-grupo-izquierda" id="nav-principal">
        ${enlaces}
        <button type="button" class="nav-link solo-movil" data-accion="buscar">BUSCAR</button>
        <a href="pedidos.html" class="nav-link solo-movil ${activo === "cuenta" ? "activo" : ""}">CUENTA</a>
      </div>
      ${crearLogo()}
      <div class="nav-grupo nav-grupo-derecha">
        <button type="button" class="nav-link nav-link-secundario" data-accion="buscar">BUSCAR</button>
        <a href="pedidos.html" class="nav-link nav-link-secundario ${activo === "cuenta" ? "activo" : ""}">CUENTA</a>
        <a href="carrito.html" class="nav-link ${carritoActivo ? "activo" : ""}">CARRITO (<span data-contador-carrito>0</span>)</a>
      </div>
    </nav>`;

  // ### Manejadores del header ###
  const nav = contenedor.querySelector(".nav-stef");
  const botonMenu = contenedor.querySelector(".nav-menu-boton");
  botonMenu.addEventListener("click", () => {
    const abierto = nav.classList.toggle("menu-abierto");
    botonMenu.setAttribute("aria-expanded", abierto);
    botonMenu.textContent = abierto ? "CERRAR" : "MENÚ";
  });
  contenedor.querySelectorAll('[data-accion="buscar"]').forEach((boton) => boton.addEventListener("click", handleBuscar));

  actualizarContadorCarrito();
};

const actualizarContadorCarrito = () => {
  const cantidad = cantidadCarrito();
  document.querySelectorAll("[data-contador-carrito]").forEach((nodo) => {
    nodo.textContent = cantidad;
  });
};

// búsqueda va al catálogo
const handleBuscar = async () => {
  const { value: termino } = await Alerta.fire({
    title: "Buscar",
    input: "text",
    inputPlaceholder: "Hoodie, camiseta, mascota...",
    showCancelButton: true,
    confirmButtonText: "Buscar",
    inputValidator: (valor) => {
      if (!valor.trim()) return "¡Escribe qué estás buscando!";
    },
  });
  if (termino) {
    window.location.href = `catalogo.html?q=${encodeURIComponent(termino.trim())}`;
  }
};

// ### Pie de página ###
const renderFooterSimple = () => {
  const contenedor = document.getElementById("footer");
  if (!contenedor) return;
  contenedor.className = "footer-simple";
  contenedor.innerHTML = `
    <p>© ${new Date().getFullYear()} STEF · Simplicidad Selecta · Bogotá, Colombia</p>
    <nav aria-label="Ayuda"><a href="#" data-ayuda="envios">Envíos</a>  /  <a href="#" data-ayuda="cambios">Cambios</a>  /  <a href="#" data-ayuda="contacto">Contacto</a></nav>`;
  activarEnlacesAyuda(contenedor);
};

const TEXTOS_AYUDA = {
  envios: { titulo: "Envíos", texto: "Despachamos a todo Colombia en 24 a 48 horas hábiles. Envío gratis en compras desde $250.000." },
  cambios: { titulo: "Cambios", texto: "Puedes cambiar talla dentro de los primeros 15 días. La prenda debe estar sin uso y con etiquetas." },
  contacto: { titulo: "Contacto", texto: "Escríbenos a hola@stef.co o por Instagram. Respondemos de lunes a sábado." },
  tallas: { titulo: "Guía de tallas", texto: "Corte amplio. Si estás entre dos tallas, elige la menor para un fit más ajustado." },
};

const activarEnlacesAyuda = (contenedor) => {
  contenedor.querySelectorAll("[data-ayuda]").forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      evento.preventDefault();
      const ayuda = TEXTOS_AYUDA[enlace.dataset.ayuda];
      alertaInfo(ayuda.titulo, ayuda.texto);
    });
  });
};

// ### Foto producto ###
// sin imagen queda el placeholder con el nombre
const crearFoto = (producto, extraClase = "") => `
  <div class="foto ${extraClase}">
    ${producto.imagen
      ? `<img class="foto-imagen" src="${escaparHtml(producto.imagen)}" alt="${escaparHtml(producto.nombre)}" loading="lazy">`
      : `<span class="foto-etiqueta">[ ${escaparHtml(producto.nombre)} ]</span>`}
    ${producto.tag ? `<span class="tag">${escaparHtml(producto.tag)}</span>` : ""}
  </div>`;

// ### Tarjeta producto ###
const crearTarjetaProducto = (producto, { carrusel = false } = {}) => `
  <a href="producto.html?id=${encodeURIComponent(producto.id)}" class="tarjeta-producto ${carrusel ? "tarjeta-carrusel" : ""}">
    ${crearFoto(producto)}
    <div class="tarjeta-info">
      <p class="tarjeta-nombre">${escaparHtml(producto.nombre)}</p>
      <p class="tarjeta-precio">${formatearPrecio(producto.precio)}</p>
    </div>
    <div class="tarjeta-variantes">
      ${producto.colores.map((color) => `<img src="${COLORES[color].punto}" alt="${COLORES[color].nombre}">`).join("")}
      <span class="tarjeta-tallas">${rangoTallas(producto)}</span>
    </div>
  </a>`;

// ### Carrusel ###
// avance automático con loop
const iniciarCarrusel = ({ viewport, track, anterior, siguiente, intervalo = 2600 }) => {
  let indice = 0;
  let temporizador = null;

  const medirPaso = () => {
    const primera = track.children[0];
    if (!primera) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return primera.getBoundingClientRect().width + gap;
  };

  const maxIndice = () => {
    const paso = medirPaso();
    if (!paso) return 0;
    const visibles = Math.floor((viewport.clientWidth + 1) / paso) || 1;
    return Math.max(0, track.children.length - visibles);
  };

  const mover = (nuevoIndice) => {
    const limite = maxIndice();
    if (nuevoIndice > limite) nuevoIndice = 0;
    if (nuevoIndice < 0) nuevoIndice = limite;
    indice = nuevoIndice;
    track.style.transform = `translateX(${-indice * medirPaso()}px)`;
  };

  const iniciar = () => {
    detener();
    temporizador = setInterval(() => mover(indice + 1), intervalo);
  };

  const detener = () => clearInterval(temporizador);

  anterior?.addEventListener("click", () => { mover(indice - 1); iniciar(); });
  siguiente?.addEventListener("click", () => { mover(indice + 1); iniciar(); });

  // pausa en hover y foco
  viewport.addEventListener("mouseenter", detener);
  viewport.addEventListener("mouseleave", iniciar);
  viewport.addEventListener("focusin", detener);
  viewport.addEventListener("focusout", iniciar);
  window.addEventListener("resize", () => mover(indice));

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) iniciar();
};

// ### Parámetros de URL ###
const leerParametro = (nombre) => new URLSearchParams(window.location.search).get(nombre);
