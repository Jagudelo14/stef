/*
 * ### Archivo: checkout.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-11-05
 * Descripción: Validación del checkout y creación del pedido simulado
 */

// ### Configuración ###
const CAMPOS = ["correo", "celular", "nombre", "apellidos", "direccion", "ciudad", "barrio"];

const MENSAJES_VACIO = {
  correo: "Escribe tu correo",
  celular: "Escribe tu celular",
  nombre: "Escribe tu nombre",
  apellidos: "Escribe tus apellidos",
  direccion: "Escribe la dirección de entrega",
  ciudad: "Escribe la ciudad",
  barrio: "Escribe el barrio o la localidad",
};

const VALIDADORES = {
  correo: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) || "Revisa el correo; debe verse como nombre@correo.com",
  celular: (valor) => valor.replace(/\D/g, "").length >= 10 || "El celular debe tener al menos 10 dígitos",
};

// ### Render ###
const renderResumen = () => {
  const carrito = obtenerCarrito();
  const cupon = obtenerCupon();
  const totales = calcularTotales(carrito, cupon);

  document.getElementById("resumen-items").innerHTML = carrito.map((linea) => {
    const producto = buscarProducto(linea.id);
    return producto ? `<div class="resumen-fila"><span>${escaparHtml(producto.nombre)}  ×${linea.cantidad}</span><span>${formatearPrecio(producto.precio * linea.cantidad)}</span></div>` : "";
  }).join("");

  document.getElementById("fila-descuento").hidden = totales.descuento === 0;
  document.getElementById("label-descuento").textContent = `Descuento ${cupon || ""}`;
  document.getElementById("valor-descuento").textContent = `−${formatearPrecio(totales.descuento)}`;
  document.getElementById("valor-envio").textContent = totales.envio === 0 ? "Gratis" : formatearPrecio(totales.envio);
  document.getElementById("valor-total").textContent = formatearPrecio(totales.total);
  document.getElementById("boton-pagar").textContent = `Pagar ${formatearPrecio(totales.total)}`;
};

// precarga última compra
const precargarCliente = () => {
  const cliente = obtenerCliente();
  if (!cliente) return;
  CAMPOS.forEach((campo) => {
    document.getElementById(campo).value = cliente[campo] || "";
  });
  const metodo = document.querySelector(`input[name="metodo"][value="${cliente.metodo}"]`);
  if (metodo) metodo.checked = true;
};

// ### Validación ###
// mensaje junto al campo
const pintarError = (input, mensaje) => {
  const idMensaje = `${input.id}-error`;
  document.getElementById(idMensaje)?.remove();
  input.classList.toggle("campo-error", mensaje !== true);

  if (mensaje === true) {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
    return;
  }

  const parrafo = document.createElement("p");
  parrafo.id = idMensaje;
  parrafo.className = "campo-mensaje";
  parrafo.textContent = mensaje;
  input.after(parrafo);
  input.setAttribute("aria-invalid", "true");
  input.setAttribute("aria-describedby", idMensaje);
};

const validarFormulario = () => {
  const errores = [];

  CAMPOS.forEach((campo) => {
    const input = document.getElementById(campo);
    const valor = input.value.trim();
    let mensaje = valor ? true : MENSAJES_VACIO[campo];
    if (valor && VALIDADORES[campo]) mensaje = VALIDADORES[campo](valor);

    pintarError(input, mensaje);
    if (mensaje !== true) errores.push({ input, mensaje });
  });

  return errores;
};

// ### Manejadores ###
const handlePagar = async (evento) => {
  evento.preventDefault();

  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    window.location.href = "carrito.html";
    return;
  }

  const errores = validarFormulario();
  if (errores.length) {
    errores[0].input.focus(); // foco al primer error
    return;
  }

  const cliente = Object.fromEntries(CAMPOS.map((campo) => [campo, document.getElementById(campo).value.trim()]));
  cliente.metodo = document.querySelector('input[name="metodo"]:checked').value;
  const totales = calcularTotales(carrito, obtenerCupon());

  // pago simulado
  Alerta.fire({
    title: "Procesando pago...",
    allowOutsideClick: false,
    didOpen: () => {
      Alerta.showLoading();
    },
  });
  await new Promise((resolver) => setTimeout(resolver, 1500));

  const pedido = {
    codigo: generarCodigoPedido(),
    fecha: fechaHoyIso(),
    estado: cliente.metodo === "Contra entrega" ? "Por despachar" : "Pagado",
    total: totales.total,
    metodo: cliente.metodo,
    cliente: `${cliente.nombre} ${cliente.apellidos}`,
    items: carrito,
  };

  guardarPedido(pedido);
  guardarCliente(cliente);
  guardarCarrito([]);
  guardarCupon(null);

  await Alerta.fire({
    icon: "success",
    iconColor: "#5cf4e6",
    title: "¡Pedido confirmado!",
    text: `Tu pedido #${pedido.codigo} quedó registrado. Te escribimos a ${cliente.correo}.`,
    confirmButtonText: "Ver mis pedidos",
  });
  window.location.href = "pedidos.html";
};

// limpiar error al escribir
const handleLimpiarError = (evento) => {
  if (evento.target.classList.contains("campo-error")) {
    pintarError(evento.target, true);
  }
};

// ### Inicio ###
renderFooterSimple();

if (obtenerCarrito().length === 0) {
  Alerta.fire({ icon: "info", iconColor: "#5cf4e6", title: "Bolsa vacía", text: "Agrega productos antes de pagar." }).then(() => {
    window.location.href = "catalogo.html";
  });
} else {
  renderResumen();
  precargarCliente();
}

document.getElementById("form-checkout").addEventListener("submit", handlePagar);
document.getElementById("form-checkout").addEventListener("input", handleLimpiarError);
