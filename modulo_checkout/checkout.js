/*
 * ### Archivo: checkout.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Validación del checkout y creación del pedido simulado
 */

// ### Configuración ###
const CAMPOS = ["correo", "celular", "nombre", "apellidos", "direccion", "ciudad", "barrio"];

const VALIDADORES = {
  correo: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) || "Correo inválido",
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
const validarFormulario = () => {
  const errores = [];

  CAMPOS.forEach((campo) => {
    const input = document.getElementById(campo);
    const valor = input.value.trim();
    let mensaje = valor ? true : "Campo obligatorio";
    if (valor && VALIDADORES[campo]) mensaje = VALIDADORES[campo](valor);

    input.classList.toggle("campo-error", mensaje !== true);
    input.setAttribute("aria-invalid", mensaje !== true);
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
    errores[0].input.focus();
    alertaError("Revisa tus datos", errores.map((error) => error.mensaje).filter((mensaje, indice, lista) => lista.indexOf(mensaje) === indice).join(". "));
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
    evento.target.classList.remove("campo-error");
    evento.target.removeAttribute("aria-invalid");
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
