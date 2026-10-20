/*
 * ### Archivo: admin.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Panel administrador (métricas, tablas, nuevo producto y restablecer demo)
 */

// ### Estados ###
let panelActivo = "resumen";

// ### Datos calculados ###
// locales + demo
const obtenerPedidosTienda = () => [...obtenerPedidosLocales(), ...PEDIDOS_TIENDA_SEMILLA];

const calcularMetricas = () => {
  const mesActual = fechaHoyIso().slice(0, 7);
  const localesMes = obtenerPedidosLocales().filter((pedido) => pedido.fecha.startsWith(mesActual));
  const ventasMes = METRICAS_BASE.ventasMes + localesMes.reduce((suma, pedido) => suma + pedido.total, 0);
  const pedidosMes = METRICAS_BASE.pedidosMes + localesMes.length;
  const porDespachar = METRICAS_BASE.porDespachar + localesMes.filter((pedido) => pedido.estado !== "Entregado").length;
  const stockBajo = obtenerProductos().filter((producto) => stockTotal(producto) < 5).length;

  return {
    ventasMes,
    pedidosMes,
    porDespachar,
    // redondeo a centenas
    ticket: Math.round(ventasMes / pedidosMes / 100) * 100,
    stockBajo,
  };
};

// ### Componentes del panel ###
const crearMetrica = (titulo, valor, nota, alerta = false) => `
  <div class="metrica ${alerta ? "alerta" : ""}">
    <p class="metrica-titulo">${titulo}</p>
    <p class="metrica-valor">${valor}</p>
    <p class="metrica-nota">${nota}</p>
  </div>`;

const crearTabla = ({ titulo, columnas, filas, accion }) => `
  <div class="tabla-admin">
    <div class="tabla-admin-cabeza">
      <h2>${titulo}</h2>
      ${accion ? `<button type="button" data-ir="${accion.panel}">${accion.texto}</button>` : ""}
    </div>
    <table>
      <thead><tr>${columnas.map((columna) => `<th scope="col">${columna}</th>`).join("")}</tr></thead>
      <tbody>${filas.join("")}</tbody>
    </table>
  </div>`;

const filaPedido = (pedido) => `
  <tr>
    <td>#${pedido.codigo}</td>
    <td>${escaparHtml(pedido.cliente || "Cliente web")}</td>
    <td>${formatearFecha(pedido.fecha, false)}</td>
    <td>${pedido.estado}</td>
    <td class="mono">${formatearPrecio(pedido.total)}</td>
  </tr>`;

// ### Paneles ###
const PANELES = {
  resumen: {
    titulo: "RESUMEN",
    render: () => {
      const metricas = calcularMetricas();
      return `
        <div class="metricas">
          ${crearMetrica("VENTAS DEL MES", formatearPrecio(metricas.ventasMes), METRICAS_BASE.variacionVentas)}
          ${crearMetrica("PEDIDOS", metricas.pedidosMes, `${metricas.porDespachar} por despachar`)}
          ${crearMetrica("TICKET PROMEDIO", formatearPrecio(metricas.ticket), METRICAS_BASE.variacionTicket)}
          ${crearMetrica("STOCK BAJO", metricas.stockBajo, "productos &lt; 5 uds", metricas.stockBajo > 0)}
        </div>
        ${crearTabla({
          titulo: "ÚLTIMOS PEDIDOS",
          columnas: ["PEDIDO", "CLIENTE", "FECHA", "ESTADO", "TOTAL"],
          filas: obtenerPedidosTienda().slice(0, 5).map(filaPedido),
          accion: { panel: "pedidos", texto: "VER TODOS →" },
        })}`;
    },
  },
  productos: {
    titulo: "PRODUCTOS",
    render: () => crearTabla({
      titulo: `${obtenerProductos().length} PRODUCTOS`,
      columnas: ["PRODUCTO", "CATEGORÍA", "COLORES", "PRECIO", "STOCK"],
      filas: obtenerProductos().map((producto) => `
        <tr>
          <td><a href="producto.html?id=${encodeURIComponent(producto.id)}">${escaparHtml(producto.nombre)}</a></td>
          <td>${CATEGORIAS.find((categoria) => categoria.id === producto.categoria).nombre}</td>
          <td>${producto.colores.map((color) => COLORES[color].corto).join(", ")}</td>
          <td class="mono">${formatearPrecio(producto.precio)}</td>
          <td class="mono ${stockTotal(producto) < 5 ? "stock-bajo" : ""}">${stockTotal(producto)} uds</td>
        </tr>`),
    }),
  },
  inventario: {
    titulo: "INVENTARIO",
    render: () => crearTabla({
      titulo: "UNIDADES POR TALLA",
      columnas: ["PRODUCTO", ...TALLAS, "TOTAL"],
      filas: obtenerProductos()
        .slice()
        .sort((a, b) => stockTotal(a) - stockTotal(b))
        .map((producto) => `
          <tr>
            <td>${escaparHtml(producto.nombre)}</td>
            ${TALLAS.map((talla) => `<td class="mono ${producto.stock[talla] === 0 ? "stock-cero" : producto.stock[talla] < 3 ? "stock-bajo" : ""}">${producto.stock[talla]}</td>`).join("")}
            <td class="mono">${stockTotal(producto)}</td>
          </tr>`),
    }),
  },
  pedidos: {
    titulo: "PEDIDOS",
    render: () => crearTabla({
      titulo: `${obtenerPedidosTienda().length} PEDIDOS RECIENTES`,
      columnas: ["PEDIDO", "CLIENTE", "FECHA", "ESTADO", "TOTAL"],
      filas: obtenerPedidosTienda().map(filaPedido),
    }),
  },
  clientes: {
    titulo: "CLIENTES",
    render: () => {
      // agrupar por cliente
      const resumen = obtenerPedidosTienda().reduce((acumulado, pedido) => {
        const nombre = pedido.cliente || "Cliente web";
        acumulado[nombre] = acumulado[nombre] || { pedidos: 0, total: 0, ultima: pedido.fecha };
        acumulado[nombre].pedidos += 1;
        acumulado[nombre].total += pedido.total;
        return acumulado;
      }, {});
      return crearTabla({
        titulo: `${Object.keys(resumen).length} CLIENTES`,
        columnas: ["CLIENTE", "PEDIDOS", "ÚLTIMA COMPRA", "TOTAL COMPRADO"],
        filas: Object.entries(resumen).map(([nombre, datos]) => `
          <tr>
            <td>${escaparHtml(nombre)}</td>
            <td class="mono">${datos.pedidos}</td>
            <td>${formatearFecha(datos.ultima)}</td>
            <td class="mono">${formatearPrecio(datos.total)}</td>
          </tr>`),
      });
    },
  },
  descuentos: {
    titulo: "DESCUENTOS",
    render: () => crearTabla({
      titulo: "CÓDIGOS ACTIVOS",
      columnas: ["CÓDIGO", "DESCUENTO", "APLICA A"],
      filas: Object.entries(CUPONES).map(([codigo, porcentaje]) => `
        <tr>
          <td class="mono">${codigo}</td>
          <td>${porcentaje * 100} %</td>
          <td>Todo el catálogo</td>
        </tr>`),
    }),
  },
  ajustes: {
    titulo: "AJUSTES",
    render: () => `
      <div class="tabla-admin">
        <div class="tabla-admin-cabeza"><h2>DATOS DE DEMOSTRACIÓN</h2></div>
        <div style="padding: 0 24px 24px; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
          <p class="texto-muted">Los pedidos, productos nuevos y el carrito se guardan en este navegador. Restablecer deja la tienda como recién publicada.</p>
          <button type="button" class="boton boton-fantasma" data-accion="restablecer">Restablecer demo</button>
        </div>
      </div>`,
  },
};

// ### Render ###
const renderPanel = () => {
  const panel = PANELES[panelActivo];
  document.getElementById("titulo-admin").textContent = panel.titulo;
  document.getElementById("panel-admin").innerHTML = panel.render();
  document.querySelectorAll("[data-panel]").forEach((boton) => {
    boton.classList.toggle("activo", boton.dataset.panel === panelActivo);
  });
};

// ### Manejadores ###
const handleMenu = (evento) => {
  const boton = evento.target.closest("[data-panel]");
  if (!boton) return;
  panelActivo = boton.dataset.panel;
  renderPanel();
};

const handleAccionPanel = async (evento) => {
  const irA = evento.target.closest("[data-ir]");
  if (irA) {
    panelActivo = irA.dataset.ir;
    renderPanel();
    return;
  }

  if (evento.target.closest('[data-accion="restablecer"]')) {
    const { isConfirmed } = await Alerta.fire({
      title: "¿Restablecer demo?",
      text: "Se borran pedidos, productos creados, carrito y datos del cliente de este navegador.",
      showCancelButton: true,
      confirmButtonText: "Restablecer",
    });
    if (!isConfirmed) return;
    Object.values(LLAVES).forEach((llave) => {
      try {
        localStorage.removeItem(llave);
      } catch (error) {
        console.error("Error limpiando localStorage:", error);
      }
    });
    renderPanel();
    alertaExito("Demo restablecida", "La tienda quedó como recién publicada.");
  }
};

const handleNuevoProducto = async () => {
  const opcionesCategoria = CATEGORIAS.filter((categoria) => categoria.id !== "todo").map((categoria) => `<option value="${categoria.id}">${categoria.nombre}</option>`).join("");
  const opcionesColor = Object.entries(COLORES).map(([id, color]) => `<option value="${id}">${color.nombre}</option>`).join("");
  // foto obligatoria, se elige de las disponibles
  const opcionesFoto = PRODUCTOS_SEMILLA.map((producto) => `<option value="${producto.imagen}">Foto: ${producto.nombre}</option>`).join("");

  const { value: datos } = await Alerta.fire({
    title: "Nuevo producto",
    html: `
      <input id="np-nombre" class="swal2-input" placeholder="Nombre del producto">
      <input id="np-precio" class="swal2-input" type="number" min="1000" step="100" placeholder="Precio (COP)">
      <select id="np-categoria" class="swal2-select">${opcionesCategoria}</select>
      <select id="np-color" class="swal2-select">${opcionesColor}</select>
      <select id="np-foto" class="swal2-select">${opcionesFoto}</select>
      <input id="np-stock" class="swal2-input" type="number" min="0" placeholder="Unidades por talla">`,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    focusConfirm: false,
    preConfirm: () => {
      const nombre = document.getElementById("np-nombre").value.trim();
      const precio = Number(document.getElementById("np-precio").value);
      const stock = Number(document.getElementById("np-stock").value);
      if (!nombre) return Swal.showValidationMessage("El nombre es obligatorio");
      if (!precio || precio < 1000) return Swal.showValidationMessage("El precio debe ser mayor a $1.000");
      if (Number.isNaN(stock) || stock < 0) return Swal.showValidationMessage("Las unidades no pueden ser negativas");
      return {
        nombre,
        precio,
        stock,
        categoria: document.getElementById("np-categoria").value,
        color: document.getElementById("np-color").value,
        imagen: document.getElementById("np-foto").value,
      };
    },
  });

  if (!datos) return;

  // id único para url
  const id = `${normalizarId(datos.nombre)}-${Date.now().toString(36)}`;
  guardarProductoNuevo({
    id,
    nombre: datos.nombre,
    precio: datos.precio,
    categoria: datos.categoria,
    colores: [datos.color],
    color: datos.color,
    stock: Object.fromEntries(TALLAS.map((talla) => [talla, datos.stock])),
    tag: "NUEVO",
    imagen: datos.imagen,
    fecha: fechaHoyIso(),
    descripcion: DESCRIPCION_BASE,
  });

  alertaExito("Producto creado", `${datos.nombre} ya aparece en el catálogo.`);
  renderPanel();
};

const normalizarId = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ### Inicio ###
document.getElementById("fecha-admin").textContent = `— ${fechaHoyLarga()}`;
renderPanel();

document.getElementById("menu-admin").addEventListener("click", handleMenu);
document.getElementById("panel-admin").addEventListener("click", handleAccionPanel);
document.getElementById("nuevo-producto").addEventListener("click", handleNuevoProducto);
