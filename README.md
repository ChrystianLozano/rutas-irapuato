# 🗺️ Mapa de Rutas de Irapuato (Estilo Mini Motorways)

¡Bienvenido al **Mapa de Rutas de Irapuato**! Este es un visualizador y simulador interactivo de transporte público inspirado en el diseño estético plano, minimalista y dinámico del aclamado juego **Mini Motorways**. 

El proyecto dibuja las trayectorias de tránsito real sobre las calles de Irapuato, Guanajuato, permitiendo reproducir recorridos virtuales de autobús con pasajeros simulados, paradas detalladas y animaciones interactivas.

---

## ✨ Características Principales

* **🎨 Estética Premium "Mini Motorways"**: Colores HSL curados, diseño HUD flotante, íconos estilizados de casitas residenciales como origen y corporativos como destino.
* **🌓 Modo Día/Noche**: Alternancia dinámica entre mapas vectoriales oscuros y claros con transiciones suaves en todos los paneles de información.
* **🔄 Arquitectura Modular por JSON**: Todos los datos de las rutas (coordenadas geográficas viales, paradas e itinerarios) están modularizados en archivos JSON individuales dentro del directorio `routes/`. Esto optimiza la carga inicial reduciendo el código JS principal.
* **🚍 Simulación en Tiempo Real**: Un autobús capsule-styled recorre los puntos geográficos de la red vial adaptando su rotación al ángulo de la calle. Conforme pasa por las paradas, el contador de pasajeros se actualiza aleatoriamente con efectos de escala y pulso.

---

## 🚀 Ejecución en Local (Desarrollo)

Dado que la aplicación realiza solicitudes asíncronas (`fetch()`) para cargar dinámicamente los datos de las rutas desde archivos JSON locales, **el navegador bloqueará las peticiones si abres el archivo `index.html` directamente haciendo doble clic (debido a la política CORS de archivos `file://`)**.

Para correr el proyecto localmente, debes servirlo a través de un servidor HTTP local.

### Opción 1: Con Python (Recomendado y ya configurado)
Si tienes Python instalado, ejecuta en tu terminal desde la raíz del proyecto:
```bash
python3 -m http.server 8000
```
Luego, abre tu navegador e ingresa a: **[http://localhost:8000](http://localhost:8000)**.

### Opción 2: Con Node.js / npm
Si prefieres herramientas de Node:
```bash
npx serve
# O también
npm install -g serve
serve .
```
E ingresa a la dirección que te indique la consola (generalmente `http://localhost:3000`).

---

## 📦 Estructura del Proyecto

```text
├── index.html          # Estructura HTML5 y metadatos SEO
├── style.css           # Estilos personalizados, temas y keyframes de animación
├── app.js              # Lógica de Leaflet.js, simulación y fetch asíncrono
├── .gitignore          # Archivos excluidos de Git (logs, configuraciones locales)
└── routes/             # Datos de rutas modularizados
    ├── ruta01.json
    ├── ruta02.json
    ├── ruta05.json
    └── ruta3r.json
```

---

## 🛠️ Tecnologías y Librerías Utilizadas

* **Leaflet.js**: Motor de mapas interactivos 2D liviano y móvil-friendly.
* **CARTO / OpenStreetMap**: Proveedores de las teselas de mapas planos (estilo minimalista y de alto contraste).
* **FontAwesome**: Iconografía del HUD y paneles de control.
* **Google Fonts**: Tipografías `Outfit` (títulos mecánicos del juego) e `Inter` (cuerpo de texto limpio).
