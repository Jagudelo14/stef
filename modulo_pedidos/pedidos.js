/*
 * ### Archivo: pedidos.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Cuenta del cliente (pedidos, datos personales, direcciones y métodos de pago)
 */

// ### Estados ###
let panelActivo = "pedidos";

// ### Render ###
const renderCabecera = () => {
  const cliente = obtenerCliente();
  const nombre = cliente ? cliente.nombre : "JUAN CAMILO";
  document.getElementById("etiqueta-cuenta").textContent = `— CUENTA / ${nombre.toUpperCase()}`;
};

const crearTarjetaPedido = (pedido) => {
  // máx 4 miniaturas
  const fotos = pedido.items
    .map((item) => buscarProducto(item.id))
    .filter(Boolean)
    .slice(0, 4)
    .map((producto) => crearFoto({ ...producto, tag: null }, "pedido-foto"))
    .join("");
  return `
    <article class="pedido">
      <div class="pedido-cabeza">
        <div class="pedido-textos">
          <p class="pedido-codigo">PEDIDO #${pedido.codigo}</p>
          <p class="texto-mono texto-muted">${formatearFecha(pedido.fecha)}</p>
        </div>
        <span class="pedido-estado ${pedido.estado !== "Entregado" ? "destacado" : ""}">${pedido.estado.toUpperCase()}</span>
      </div>
      <div class="pedido-pie">
        ${fotos}
        <p class="pedido-total">${formatearPrecio(pedido.total)}</p>
        <button type="button" class="boton boton-fantasma" data-codigo="${pedido.codigo}">Ver pedido</button>
      </div>
    </article>`;
};

const crearFilaDato = (etiqueta, valor) => `<div class="dato-fila"><span>${etiqueta}</span><span>${escaparHtml(valor)}</span></div>`;

const sinDatos = (texto) => `
  <div class="estado-vacio">
    <p>${texto}</p>
    <a href="catalogo.html" class="boton boton-primario">Ir a la tienda</a>
  </div>`;

const PANELES = {
  pedidos: {
    titulo: "Mis pedidos",
    render: () => obtenerPedidosUsuario().map(crearTarjetaPedido).join(""),
  },
  datos: {
    titulo: "Mis datos",
    render: () => {
      const cliente = obtenerCliente();
      if (!cliente) return sinDatos("Tus datos aparecen aquí después de tu primera compra.");
      return `
        <div class="tarjeta-dato">
          <h2>Contacto</h2>
          ${crearFilaDato("NOMBRE", `${cliente.nombre} ${cliente.apellidos}`)}
          ${crearFilaDato("CORREO", cliente.correo)}
          ${crearFilaDato("CELULAR", cliente.celular)}
        </div>`;
    },
  },
  direcciones: {
    titulo: "Direcciones",
    render: () => {
      const cliente = obtenerCliente();
      if (!cliente) return sinDatos("Guardamos la dirección de entrega cuando haces un pedido.");
      return `
        <div class="tarjeta-dato">
          <h2>Principal</h2>
          ${crearFilaDato("DIRECCIÓN", cliente.direccion)}
          ${crearFilaDato("BARRIO", cliente.barrio)}
          ${crearFilaDato("CIUDAD", cliente.ciudad)}
        </div>`;
    },
  },
  pagos: {
    titulo: "Métodos de pago",
    render: () => {
      const cliente = obtenerCliente();
      if (!cliente) return sinDatos("Aún no has usado ningún método de pago.");
      return `
        <div class="tarjeta-dato">
          <h2>Último usado</h2>
          ${crearFilaDato("MÉTODO", cliente.metodo)}
        </div>`;
    },
  },
};

const renderPanel = () => {
  const panel = PANELES[panelActivo];
  document.getElementById("titulo-cuenta").textContent = panel.titulo;
  document.getElementById("panel-cuenta").innerHTML = panel.render();
  document.querySelectorAll("[data-panel]").forEach((boton) => {
    boton.classList.toggle("activo", boton.dataset.panel === panelActivo);
  });
};

// ### Manejadores ###
const handleMenu = async (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  if (boton.dataset.accion === "salir") {
    const { isConfirmed } = await Alerta.fire({
      title: "¿Cerrar sesión?",
      text: "Se borran tus datos guardados en este navegador. Tus pedidos se conservan.",
      showCancelButton: true,
      confirmButtonText: "Cerrar sesión",
    });
    if (isConfirmed) {
      guardarCliente(null);
      renderCabecera();
      renderPanel();
      alertaExito("Sesión cerrada", "Vuelve pronto.");
    }
    return;
  }

  panelActivo = boton.dataset.panel;
  renderPanel();
};

const handleVerPedido = (evento) => {
  const boton = evento.target.closest("[data-codigo]");
  if (!boton) return;

  const pedido = obtenerPedidosUsuario().find((item) => item.codigo === boton.dataset.codigo);
  const lineas = pedido.items.map((item) => {
    const producto = buscarProducto(item.id);
    const nombre = producto ? producto.nombre : "Producto";
    return `<div><span>${escaparHtml(nombre)} · ${item.talla} · ${COLORES[item.color].corto} ×${item.cantidad}</span><strong>${producto ? formatearPrecio(producto.precio * item.cantidad) : ""}</strong></div>`;
  }).join("");

  Alerta.fire({
    title: `Pedido #${pedido.codigo}`,
    html: `
      <div class="alerta-detalle">
        <div><span>Fecha</span><strong>${formatearFecha(pedido.fecha)}</strong></div>
        <div><span>Estado</span><strong>${pedido.estado}</strong></div>
        ${pedido.metodo ? `<div><span>Pago</span><strong>${pedido.metodo}</strong></div>` : ""}
        ${lineas}
        <div><span>Total</span><strong>${formatearPrecio(pedido.total)}</strong></div>
      </div>`,
    confirmButtonText: "Cerrar",
  });
};

// ### Inicio ###
renderHeader({ promo: false, activo: "cuenta" });
renderFooterSimple();
renderCabecera();
renderPanel();

document.getElementById("menu-cuenta").addEventListener("click", handleMenu);
document.getElementById("panel-cuenta").addEventListener("click", handleVerPedido);
