/*
 * ### Archivo: carrito.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Lógica del carrito (cantidades, quitar productos, cupón y totales)
 */

// ### Render ###
const renderLineas = () => {
  const carrito = obtenerCarrito();
  const contenedor = document.getElementById("lineas");

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <p>Tu bolsa está vacía. El drop 02 te está esperando.</p>
        <a href="catalogo.html" class="boton boton-primario">Ver la tienda</a>
      </div>`;
    return;
  }

  contenedor.innerHTML = carrito.map((linea, indice) => {
    const producto = buscarProducto(linea.id);
    if (!producto) return "";
    return `
      <article class="linea">
        ${crearFoto({ ...producto, tag: null }, "linea-foto")}
        <div class="linea-info">
          <a href="producto.html?id=${encodeURIComponent(producto.id)}" class="linea-nombre">${escaparHtml(producto.nombre)}</a>
          <p class="linea-variante">TALLA ${linea.talla}  /  ${COLORES[linea.color].nombre.toUpperCase()}</p>
          <button type="button" class="linea-quitar" data-accion="quitar" data-indice="${indice}">QUITAR</button>
        </div>
        <div class="contador">
          <button type="button" data-accion="restar" data-indice="${indice}" aria-label="Restar uno">−</button>
          <span>${linea.cantidad}</span>
          <button type="button" data-accion="sumar" data-indice="${indice}" aria-label="Sumar uno">+</button>
        </div>
        <p class="linea-precio">${formatearPrecio(producto.precio * linea.cantidad)}</p>
      </article>`;
  }).join("");
};

const renderResumen = () => {
  const carrito = obtenerCarrito();
  const cupon = obtenerCupon();
  const totales = calcularTotales(carrito, cupon);
  const vacio = carrito.length === 0;

  document.getElementById("etiqueta-bolsa").textContent = `— TU BOLSA · ${totales.unidades} ${totales.unidades === 1 ? "PRODUCTO" : "PRODUCTOS"}`;
  document.getElementById("label-subtotal").textContent = `Subtotal (${totales.unidades})`;
  document.getElementById("valor-subtotal").textContent = formatearPrecio(totales.subtotal);
  document.getElementById("fila-descuento").hidden = totales.descuento === 0;
  document.getElementById("label-descuento").textContent = `Descuento ${cupon || ""}`;
  document.getElementById("valor-descuento").textContent = `−${formatearPrecio(totales.descuento)}`;
  document.getElementById("valor-envio").textContent = totales.envio === 0 ? "Gratis" : formatearPrecio(totales.envio);
  document.getElementById("valor-total").textContent = formatearPrecio(totales.total);
  document.getElementById("input-cupon").value = cupon || "";

  // sin productos no hay pago
  const botonPagar = document.getElementById("ir-pagar");
  botonPagar.classList.toggle("deshabilitado", vacio);
  botonPagar.setAttribute("aria-disabled", vacio);
  document.getElementById("form-cupon").hidden = vacio;
};

const recargar = () => {
  renderLineas();
  renderResumen();
};

// ### Manejadores ###
const handleAccionLinea = async (evento) => {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;

  const carrito = obtenerCarrito();
  const indice = Number(boton.dataset.indice);
  const linea = carrito[indice];
  const producto = buscarProducto(linea.id);

  if (boton.dataset.accion === "sumar") {
    if (linea.cantidad >= producto.stock[linea.talla]) {
      alertaInfo("Sin más unidades", `Solo quedan ${producto.stock[linea.talla]} en talla ${linea.talla}.`);
      return;
    }
    linea.cantidad += 1;
  }

  if (boton.dataset.accion === "restar") {
    // restar en 1 = quitar
    if (linea.cantidad === 1) {
      boton.dataset.accion = "quitar";
      return handleAccionLinea(evento);
    }
    linea.cantidad -= 1;
  }

  if (boton.dataset.accion === "quitar") {
    const { isConfirmed } = await Alerta.fire({
      title: "¿Quitar producto?",
      text: `${producto.nombre} · Talla ${linea.talla}`,
      showCancelButton: true,
      confirmButtonText: "Quitar",
    });
    if (!isConfirmed) {
      recargar();
      return;
    }
    carrito.splice(indice, 1);
  }

  guardarCarrito(carrito);
  recargar();
};

const handleAplicarCupon = (evento) => {
  evento.preventDefault();
  const codigo = document.getElementById("input-cupon").value.trim().toUpperCase();

  // vacío quita cupón
  if (!codigo) {
    guardarCupon(null);
    renderResumen();
    return;
  }

  if (!CUPONES[codigo]) {
    alertaError("Código no válido", "Revisa que el código esté bien escrito.");
    return;
  }

  guardarCupon(codigo);
  renderResumen();
  alertaExito("Código aplicado", `${codigo} te da ${CUPONES[codigo] * 100} % de descuento.`);
};

const handleIrPagar = (evento) => {
  if (obtenerCarrito().length === 0) {
    evento.preventDefault();
    alertaInfo("Bolsa vacía", "Agrega al menos un producto para continuar.");
  }
};

// ### Inicio ###
renderHeader({ promo: false, activo: "carrito" });
renderFooterSimple();
recargar();

document.getElementById("lineas").addEventListener("click", handleAccionLinea);
document.getElementById("form-cupon").addEventListener("submit", handleAplicarCupon);
document.getElementById("ir-pagar").addEventListener("click", handleIrPagar);
