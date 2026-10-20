/*
 * ### Archivo: home.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Lógica de la página de inicio (marquee, carrusel lo nuevo y newsletter)
 */

// ### Marquee ###
const VELOCIDAD_MARQUEE = 100; // px por segundo

const renderMarquee = () => {
  const track = document.getElementById("marquee-track");
  // bloque duplicado para loop sin salto
  const bloque = Array.from({ length: 8 }, () => "<span>SIMPLICIDAD SELECTA</span><span>/</span>").join("");
  track.innerHTML = bloque + bloque;

  // duración según ancho, esperar fuente
  document.fonts.ready.then(() => {
    const mitad = track.scrollWidth / 2;
    track.style.animationDuration = `${mitad / VELOCIDAD_MARQUEE}s`;
  });
};

// ### Lo nuevo ###
const renderLoNuevo = () => {
  const track = document.getElementById("nuevo-track");
  // 8 más recientes
  const recientes = obtenerProductos()
    .slice()
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 8);
  track.innerHTML = recientes.map((producto) => crearTarjetaProducto(producto, { carrusel: true })).join("");

  iniciarCarrusel({
    viewport: document.getElementById("nuevo-viewport"),
    track,
    anterior: document.getElementById("nuevo-anterior"),
    siguiente: document.getElementById("nuevo-siguiente"),
  });
};

// ### Manejadores ###
const handleSuscribir = (evento) => {
  evento.preventDefault();
  const input = document.getElementById("correo-newsletter");
  const correo = input.value.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    alertaError("Correo inválido", "Revisa que el correo esté bien escrito.");
    return;
  }

  input.value = "";
  alertaExito("¡Listo!", "Te escribimos cuando salga el siguiente drop.");
};

// ### Inicio ###
renderHeader({ promo: true, activo: "tienda" });
renderMarquee();
renderLoNuevo();
activarEnlacesAyuda(document.querySelector(".footer-home"));
document.getElementById("form-newsletter").addEventListener("submit", handleSuscribir);
