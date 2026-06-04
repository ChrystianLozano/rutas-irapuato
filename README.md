# 🗺️ Mapa de Rutas de Irapuato (Estilo Mini Motorways)

¡Bienvenido al **Mapa de Rutas de Irapuato**! Este es un visualizador y simulador interactivo de transporte público inspirado en el diseño estético plano, minimalista y dinámico del aclamado juego **Mini Motorways**. 

El proyecto dibuja las trayectorias de tránsito real sobre las calles de Irapuato, Guanajuato, permitiendo reproducir recorridos virtuales de autobús con pasajeros simulados, paradas detalladas y animaciones interactivas.

---

## ✨ Características Principales

* **🎨 Estética Premium "Mini Motorways"**: Colores HSL curados, diseño HUD flotante, íconos estilizados de casitas residenciales como origen y corporativos como destino.
* **🌸 Easter Egg de Sakura**: Un botón especial que activa una caída sutil de pétalos de sakura al estilo de los mapas asiáticos del juego original.
* **🌓 Modo Día/Noche**: Alternancia dinámica entre mapas vectoriales oscuros y claros con transiciones suaves en todos los paneles de información.
* **🔄 Arquitectura Modular por JSON**: Todos los datos de las rutas (coordenadas geográficas viales, paradas e itinerarios) están modularizados en archivos JSON individuales dentro del directorio `routes/`. Esto optimiza la carga inicial reduciendo el código JS principal.
* **🎏 Animaciones Elásticas Kawaii**: Los paneles de la interfaz, el marcador del coche y los paraderos del mapa brotan con suaves y divertidos rebotes elásticos (`cubic-bezier`).
* **🚍 Simulación en Tiempo Real**: Un autobús capsule-styled recorre los puntos geográficos de la red vial adaptando su rotación al ángulo de la calle. Conforme pasa por las paradas, el contador de pasajeros se actualiza aleatoriamente con efectos de escala y pulso.

---

## 🛣️ Rutas Disponibles

1. **Ruta 01 (Las Carmelitas - CRIT)**: Cruza la ciudad de sur a noreste cubriendo vialidades como Av. San Roque, Manuel Doblado y Blvd. Díaz Ordaz.
2. **Ruta 02 (Las Heras - Centro)**: Recorrido céntrico de alta afluencia.
3. **Ruta 05 (San Roque - Plaza Jacarandas)**: Conexión clave sur-norte.
4. **Ruta 3R (Anillo Vial)**: Ruta perimetral interior que circunvala el centro urbano.

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

## 🌐 Despliegue en GitHub Pages

Al tratarse de una aplicación estática (HTML, CSS y JS planos), es idónea para ser alojada de forma gratuita en **GitHub Pages**. Esta opción además soluciona de forma nativa la restricción de CORS al servir el contenido bajo protocolo seguro `https://`.

### Pasos para publicar tu mapa:

1. **Inicializa tu repositorio Git local e importa los archivos**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Mapa de Rutas de Irapuato estilo Mini Motorways"
   ```

2. **Crea un repositorio vacío en GitHub** (puedes nombrarlo `rutas-irapuato`).

3. **Vincula tu repositorio local con GitHub y sube los archivos**:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/rutas-irapuato.git
   git branch -M main
   git push -u origin main
   ```

4. **Habilita GitHub Pages**:
   * Ve a la pestaña **Settings** (Configuración) de tu repositorio en GitHub.
   * En el menú lateral izquierdo, haz clic en **Pages**.
   * Bajo **Build and deployment**, en la sección *Branch*, selecciona la rama `main` (o la rama correspondiente) y la carpeta `/ (root)`.
   * Haz clic en **Save** (Guardar).

5. ¡Listo! En un par de minutos, GitHub te proporcionará un enlace web público similar a:
   `https://TU_USUARIO.github.io/rutas-irapuato/`

---

## 🛠️ Tecnologías y Librerías Utilizadas

* **Leaflet.js**: Motor de mapas interactivos 2D liviano y móvil-friendly.
* **CARTO / OpenStreetMap**: Proveedores de las teselas de mapas planos (estilo minimalista y de alto contraste).
* **FontAwesome**: Iconografía del HUD y paneles de control.
* **Google Fonts**: Tipografías `Outfit` (títulos mecánicos del juego) e `Inter` (cuerpo de texto limpio).
