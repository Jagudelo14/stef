<!--
  ### Archivo: README.md ###
  Autor: Juan Camilo Agudelo (Jagudelo14)
  Correo: camiloagu1401@gmail.com
  Formación: Tecnólogo ADSO - SENA
  Ficha: 3186662
  Fecha: 2026-10-19
  Descripción: Guía del proyecto STEF y pasos para publicarlo en GitHub Pages
-->

# STEF · Rediseño e-commerce

Tienda de ropa unisex (hoodies, camisetas y ropa para mascotas) hecha en HTML, CSS y JavaScript puro a partir del diseño en Figma *STEF Setu – Rediseño E-commerce*.

## Pantallas

| Página | Archivo | Qué hace |
|---|---|---|
| Inicio | `index.html` | Hero, marquee, carrusel "Recién salido", editorial, categorías y newsletter |
| Catálogo | `catalogo.html` | Categorías, filtros (talla, color, precio, stock), orden, búsqueda y paginación |
| Producto | `producto.html?id=...` | Galería, color, talla con stock, cantidad, agregar al carrito y "Combina con" |
| Carrito | `carrito.html` | Cantidades, quitar, cupón `STEF10` (10 %) y envío gratis desde $250.000 |
| Checkout | `checkout.html` | Formulario validado, método de pago y pago simulado |
| Mis pedidos | `pedidos.html` | Historial, datos personales, direcciones y métodos de pago |
| Panel admin | `admin.html` | Métricas, últimos pedidos, productos, inventario, clientes, descuentos y "Nuevo producto" |

El panel admin no tiene enlace en la tienda: se abre escribiendo `/admin.html` en la URL.

## Estructura

```
stef/
  index.html, catalogo.html, ...   // Una página por pantalla
  Componentes/
    global.css                     // Tokens de diseño y estilos compartidos
    datos.js                       // Productos y pedidos de ejemplo
    almacen.js                     // localStorage (carrito, pedidos, cliente) y formatos
    componentes.js                 // Header, footer, tarjeta producto, carrusel y alertas
  modulo_<pantalla>/               // CSS y JS de cada pantalla
  assets/img/                      // SVG exportados de Figma
```

## Datos

No hay backend. Todo se guarda en el `localStorage` del navegador:

- El carrito, los pedidos nuevos, los productos creados desde el admin y los datos del cliente.
- Cada visitante ve sus propios datos; no se comparten entre personas ni dispositivos.
- En el admin, **Ajustes → Restablecer demo** deja la tienda como recién publicada.

Las fotos son marcadores (`[ hoodie blanco · modelo ]`) igual que en el diseño. Para poner fotos reales se cambia `crearFoto` en `Componentes/componentes.js`.

## Probar en local

Basta con abrir `index.html` en el navegador. Si prefieres un servidor:

```bash
python -m http.server 8000
```

y abrir `http://localhost:8000`.
