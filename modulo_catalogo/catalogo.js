/*
 * ### Archivo: catalogo.js ###
 * Autor: Juan Camilo Agudelo (Jagudelo14)
 * Correo: camiloagu1401@gmail.com
 * Formación: Tecnólogo ADSO - SENA
 * Ficha: 3186662
 * Fecha: 2026-10-19
 * Descripción: Filtros, orden, búsqueda y paginación del catálogo
 */

// ### Configuración ###
const PRODUCTOS_POR_PAGINA = 8;

const RANGOS_PRECIO = [
  { id: "hasta-100", nombre: "Hasta $100.000", cumple: (precio) => precio <= 100000 },
  { id: "100-200", nombre: "$100.000 – $200.000", cumple: (precio) => precio > 100000 && precio <= 200000 },
  { id: "mas-200", nombre: "Más de $200.000", cumple: (precio) => precio > 200000 },
];

// ### Estados ###
const categoriaInicial = leerParametro("categoria");
const estado = {
  categoria: CATEGORIAS.some((categoria) => categoria.id === categoriaInicial) ? categoriaInicial : "todo",
  busqueda: leerParametro("q") || "",
  tallas: new Set(),
  colores: new Set(),
  precios: new Set(),
  soloStock: false,
  orden: "nuevo",
  pagina: 1,
};

// quitar tildes
const normalizar = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ### Filtrado y orden ###
const filtrarProductos = () => {
  const termino = normalizar(estado.busqueda);

  const filtrados = obtenerProductos().filter((producto) => {
    if (estado.categoria !== "todo" && producto.categoria !== estado.categoria) return false;
    if (termino && !normalizar(`${producto.nombre} ${producto.categoria}`).includes(termino)) return false;
    if (estado.tallas.size && ![...estado.tallas].some((talla) => producto.stock[talla] > 0)) return false;
    if (estado.colores.size && !producto.colores.some((color) => estado.colores.has(color))) return false;
    if (estado.precios.size && !RANGOS_PRECIO.some((rango) => estado.precios.has(rango.id) && rango.cumple(producto.precio))) return false;
    if (estado.soloStock && stockTotal(producto) === 0) return false;
    return true;
  });

  const comparadores = {
    nuevo: (a, b) => b.fecha.localeCompare(a.fecha),
    "precio-asc": (a, b) => a.precio - b.precio,
    "precio-desc": (a, b) => b.precio - a.precio,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
  };
  return filtrados.sort(comparadores[estado.orden]);
};

// ### Render ###
const renderCabecera = (total) => {
  const categoria = CATEGORIAS.find((item) => item.id === estado.categoria);
  const titulo = document.getElementById("titulo-catalogo");

  if (estado.busqueda) {
    titulo.textContent = `"${estado.busqueda}"`;
    document.getElementById("migas").textContent = "TIENDA  /  BÚSQUEDA";
  } else {
    titulo.textContent = estado.categoria === "todo" ? "TODO EL CATÁLOGO" : categoria.nombre.toUpperCase();
    document.getElementById("migas").textContent = `TIENDA  /  ${categoria.nombre.toUpperCase()}`;
  }

  document.getElementById("total-productos").textContent = `${total} ${total === 1 ? "PRODUCTO" : "PRODUCTOS"}`;
  document.title = `${estado.busqueda ? "Búsqueda" : categoria.nombre} · STEF`;
};

const renderChips = () => {
  const contenedor = document.getElementById("chips-categorias");
  contenedor.innerHTML = CATEGORIAS.map((categoria) => `
    <button type="button" class="chip ${categoria.id === estado.categoria ? "activo" : ""}" role="tab" aria-selected="${categoria.id === estado.categoria}" data-categoria="${categoria.id}">${categoria.nombre}</button>`).join("");
};

const renderFiltros = () => {
  const crearCheck = (grupo, valor, texto) => `
    <label class="check"><input type="checkbox" data-grupo="${grupo}" value="${valor}"><span>${texto}</span></label>`;

  document.getElementById("filtro-tallas").innerHTML = TALLAS.map((talla) => crearCheck("tallas", talla, talla)).join("");
  document.getElementById("filtro-colores").innerHTML = Object.entries(COLORES).map(([id, color]) => crearCheck("colores", id, color.nombre)).join("");
  document.getElementById("filtro-precios").innerHTML = RANGOS_PRECIO.map((rango) => crearCheck("precios", rango.id, rango.nombre)).join("");
};

const renderPaginacion = (totalPaginas) => {
  const contenedor = document.getElementById("paginacion");
  if (totalPaginas <= 1) {
    contenedor.innerHTML = "";
    return;
  }

  const numeros = Array.from({ length: totalPaginas }, (_, i) => i + 1)
    .map((numero) => `<button type="button" class="boton-cuadrado ${numero === estado.pagina ? "activo" : ""}" data-pagina="${numero}" aria-label="Página ${numero}" ${numero === estado.pagina ? 'aria-current="page"' : ""}>${numero}</button>`)
    .join("");

  contenedor.innerHTML = `
    <button type="button" class="boton-cuadrado" data-pagina="${estado.pagina - 1}" aria-label="Página anterior" ${estado.pagina === 1 ? "disabled" : ""}>←</button>
    ${numeros}
    <button type="button" class="boton-cuadrado" data-pagina="${estado.pagina + 1}" aria-label="Página siguiente" ${estado.pagina === totalPaginas ? "disabled" : ""}>→</button>`;
};

const renderListado = () => {
  const productos = filtrarProductos();
  const totalPaginas = Math.max(1, Math.ceil(productos.length / PRODUCTOS_POR_PAGINA));
  if (estado.pagina > totalPaginas) estado.pagina = totalPaginas;

  const indicePrimero = (estado.pagina - 1) * PRODUCTOS_POR_PAGINA;
  const paginados = productos.slice(indicePrimero, indicePrimero + PRODUCTOS_POR_PAGINA);
  const grid = document.getElementById("grid-productos");

  renderCabecera(productos.length);

  if (paginados.length === 0) {
    grid.innerHTML = `
      <div class="estado-vacio" style="grid-column: 1 / -1">
        <p>No encontramos productos con esos filtros.</p>
        <button type="button" class="boton boton-fantasma" data-accion="limpiar">Limpiar filtros</button>
      </div>`;
    document.getElementById("texto-mostrando").textContent = "MOSTRANDO 0 DE 0";
  } else {
    grid.innerHTML = paginados.map((producto) => crearTarjetaProducto(producto)).join("");
    document.getElementById("texto-mostrando").textContent = `MOSTRANDO ${indicePrimero + 1} – ${indicePrimero + paginados.length} DE ${productos.length}`;
  }

  renderPaginacion(totalPaginas);
};

// categoría en url
const sincronizarUrl = () => {
  const parametros = new URLSearchParams();
  if (estado.categoria !== "todo") parametros.set("categoria", estado.categoria);
  if (estado.busqueda) parametros.set("q", estado.busqueda);
  const consulta = parametros.toString();
  history.replaceState(null, "", consulta ? `?${consulta}` : window.location.pathname);
};

// ### Manejadores ###
const handleCambiarCategoria = (evento) => {
  const boton = evento.target.closest("[data-categoria]");
  if (!boton) return;
  estado.categoria = boton.dataset.categoria;
  estado.busqueda = "";
  estado.pagina = 1;
  sincronizarUrl();
  renderChips();
  renderHeader({ promo: true, activo: ENLACES_NAV.some((enlace) => enlace.id === estado.categoria) ? estado.categoria : "tienda" });
  renderListado();
};

const handleCambiarFiltro = (evento) => {
  const input = evento.target;
  if (input.id === "filtro-stock") {
    estado.soloStock = input.checked;
  } else if (input.dataset.grupo) {
    const conjunto = estado[input.dataset.grupo];
    input.checked ? conjunto.add(input.value) : conjunto.delete(input.value);
  }
  estado.pagina = 1;
  renderListado();
};

const handleLimpiarFiltros = () => {
  estado.tallas.clear();
  estado.colores.clear();
  estado.precios.clear();
  estado.soloStock = false;
  estado.pagina = 1;
  document.querySelectorAll("#filtros input[type='checkbox']").forEach((input) => {
    input.checked = false;
  });
  renderListado();
};

const handleCambiarPagina = (evento) => {
  const boton = evento.target.closest("[data-pagina]");
  if (!boton || boton.disabled) return;
  estado.pagina = Number(boton.dataset.pagina);
  renderListado();
  document.querySelector(".cuerpo-catalogo").scrollIntoView({ behavior: "smooth" });
};

const handleToggleFiltros = (evento) => {
  const abierto = document.getElementById("filtros").classList.toggle("abierto");
  evento.currentTarget.setAttribute("aria-expanded", abierto);
};

// ### Inicio ###
renderHeader({ promo: true, activo: ENLACES_NAV.some((enlace) => enlace.id === estado.categoria) ? estado.categoria : "tienda" });
renderFooterSimple();
renderChips();
renderFiltros();
renderListado();

document.getElementById("chips-categorias").addEventListener("click", handleCambiarCategoria);
document.getElementById("filtros").addEventListener("change", handleCambiarFiltro);
document.getElementById("limpiar-filtros").addEventListener("click", handleLimpiarFiltros);
document.getElementById("paginacion").addEventListener("click", handleCambiarPagina);
document.getElementById("toggle-filtros").addEventListener("click", handleToggleFiltros);
document.getElementById("ordenar").addEventListener("change", (evento) => {
  estado.orden = evento.target.value;
  estado.pagina = 1;
  renderListado();
});
document.getElementById("grid-productos").addEventListener("click", (evento) => {
  if (evento.target.closest('[data-accion="limpiar"]')) handleLimpiarFiltros();
});
