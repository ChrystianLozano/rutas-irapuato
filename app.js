// --- Estado y Carga Dinámica de Rutas ---
const MAP_DEFAULT_CENTER = [20.6780, -101.3600]; // Centro general de Irapuato
const MAP_DEFAULT_ZOOM = 13;

let map;
let activeTheme = 'dark';
let activeRouteGroup = ''; // Empieza vacío (sin selección)
let activeRoute = 'salida';     // 'salida' o 'retorno'
let tilesLayer;
let routePolylines = {};
let stopMarkers = [];
let hoverMarker = null;

// Datos cargados dinámicamente de la ruta actual
let currentRouteData = null;

// Coordenadas y límites del mapa dinámico
let MAP_CENTER = MAP_DEFAULT_CENTER;
let ZOOM_LEVEL = MAP_DEFAULT_ZOOM;

// Estado del simulador
let simStatus = 'paused'; 
let simInterval = null;
let simMarker = null;
let simCoords = [];
let simIndex = 0;
let simSpeedMs = 1200; 
let passengersCount = 0;
let lastMatchedStopIndex = -1;

const tilesConfig = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
};

// --- Inicialización ---

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initSakura();
  setupEventHandlers();
});

function initMap() {
  map = L.map('map', {
    zoomControl: false,
    minZoom: 11,
    maxZoom: 17
  }).setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);

  tilesLayer = L.tileLayer(tilesConfig.dark, {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map);

  L.control.zoom({
    position: 'bottomleft'
  }).addTo(map);
}

function drawRoutes() {
  if (!activeRouteGroup || !currentRouteData) return;
  
  if (routePolylines.salida) map.removeLayer(routePolylines.salida);
  if (routePolylines.retorno) map.removeLayer(routePolylines.retorno);

  const colors = {
    dark: {
      salida: activeRoute === 'salida' ? '#ff5e6c' : 'rgba(72, 82, 84, 0.4)',
      retorno: activeRoute === 'retorno' ? '#00e5ff' : 'rgba(72, 82, 84, 0.4)'
    },
    light: {
      salida: activeRoute === 'salida' ? '#f14e5a' : 'rgba(206, 213, 219, 0.6)',
      retorno: activeRoute === 'retorno' ? '#1cb3c9' : 'rgba(206, 213, 219, 0.6)'
    }
  };

  const currentColors = colors[activeTheme];
  const currentCoords = currentRouteData.coords;

  // Dibujar camino Salida
  routePolylines.salida = L.polyline(currentCoords.salida, {
    color: currentColors.salida,
    weight: 7,
    lineCap: 'round',
    lineJoin: 'round',
    opacity: 1.0
  }).addTo(map);

  // Dibujar camino Retorno
  routePolylines.retorno = L.polyline(currentCoords.retorno, {
    color: currentColors.retorno,
    weight: 7,
    lineCap: 'round',
    lineJoin: 'round',
    opacity: 1.0
  }).addTo(map);

  updateGameMarkers();
}

// Dibujar casitas y oficinas estilo Mini Motorways
function updateGameMarkers() {
  if (!activeRouteGroup || !currentRouteData) return;

  stopMarkers.forEach(marker => map.removeLayer(marker));
  stopMarkers = [];

  const stops = currentRouteData.itinerary[activeRoute];
  const startStop = stops[0];
  const endStop = stops[stops.length - 1];

  const themeClass = activeRoute === 'salida' ? '' : 'retorno';

  // 1. Crear Casas en el Origen (Spawned Houses)
  const housesIcon = L.divIcon({
    className: 'office-destination',
    html: `
      <div class="spawned-houses">
        <div class="house-item ${themeClass}"></div>
        <div class="house-item ${themeClass}" style="animation-delay: 0.3s;"></div>
        <div class="house-item ${themeClass}" style="animation-delay: 0.6s;"></div>
      </div>
      <div class="map-marker-label">INICIO: ${startStop.short || startStop.street}</div>
    `,
    iconSize: [44, 15],
    iconAnchor: [22, 10]
  });

  const housesMarker = L.marker(startStop.coord, { icon: housesIcon }).addTo(map);
  housesMarker.bindPopup(`
    <div style="font-family: var(--font-body); text-align: center;">
      <strong style="display:block; font-size:0.85rem;">Zona Residencial</strong>
      <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">Origen: ${startStop.street}</p>
    </div>
  `);
  stopMarkers.push(housesMarker);

  // 2. Crear Edificio en el Destino (Destination Office)
  const officeIcon = L.divIcon({
    className: 'office-destination',
    html: `
      <div class="office-card ${themeClass}">
        <div class="office-pin"><i class="fas fa-map-marker-alt"></i></div>
      </div>
      <div class="map-marker-label">FIN: ${endStop.short || endStop.street}</div>
    `,
    iconSize: [32, 44],
    iconAnchor: [16, 32]
  });

  const officeMarker = L.marker(endStop.coord, { icon: officeIcon }).addTo(map);
  officeMarker.bindPopup(`
    <div style="font-family: var(--font-body); text-align: center;">
      <strong style="display:block; font-size:0.85rem;">Edificio de Oficinas</strong>
      <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">Destino: ${endStop.street}</p>
    </div>
  `);
  stopMarkers.push(officeMarker);
}

function renderItinerary() {
  if (!activeRouteGroup || !currentRouteData) return;

  const container = document.getElementById('itinerary-list');
  container.className = `itinerary-list route-${activeRoute}`;
  container.innerHTML = '';

  const stops = currentRouteData.itinerary[activeRoute];

  stops.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'itinerary-item';
    el.setAttribute('data-index', index);

    el.innerHTML = `
      <div class="itinerary-dot"></div>
      <div class="itinerary-info">
        <span class="itinerary-es">
          <span class="item-tag">${item.type}</span>
          ${item.street}
        </span>
      </div>
    `;

    el.addEventListener('click', () => {
      focusOnStop(item);
      highlightItineraryItem(index);
    });

    el.addEventListener('mouseenter', () => {
      showHoverIndicator(item.coord);
    });
    
    el.addEventListener('mouseleave', () => {
      hideHoverIndicator();
    });

    container.appendChild(el);
  });

  highlightItineraryItem(0);
}

function focusOnStop(stop) {
  map.panTo(stop.coord, { animate: true, duration: 0.5 });
  
  const markerColor = activeRoute === 'salida' ? '#f14e5a' : '#1cb3c9';
  const popupContent = `
    <div style="font-family: var(--font-body); text-align: center;">
      <strong style="font-size: 0.85rem; color: ${markerColor}; display: block;">
        [${stop.type}] ${stop.street}
      </strong>
      <p style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 3px; line-height: 1.2;">
        ${stop.desc}
      </p>
    </div>
  `;

  L.popup({
    closeButton: false,
    offset: [0, -10]
  })
  .setLatLng(stop.coord)
  .setContent(popupContent)
  .openOn(map);
}

function highlightItineraryItem(index) {
  const items = document.querySelectorAll('.itinerary-item');
  items.forEach(item => item.classList.remove('active-stop'));
  
  const target = document.querySelector(`.itinerary-item[data-index="${index}"]`);
  if (target) {
    target.classList.add('active-stop');
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function showHoverIndicator(coord) {
  const markerColor = activeRoute === 'salida' ? 'var(--accent-red)' : 'var(--accent-cyan)';

  const radarIcon = L.divIcon({
    className: 'sim-car-icon',
    html: `
      <div style="
        width: 22px; 
        height: 22px; 
        border-radius: 50%; 
        border: 3px solid ${markerColor};
        background-color: var(--bg-secondary);
        box-shadow: 0 0 10px rgba(0,0,0,0.15);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  hoverMarker = L.marker(coord, { icon: radarIcon }).addTo(map);
}

function hideHoverIndicator() {
  if (hoverMarker) {
    map.removeLayer(hoverMarker);
    hoverMarker = null;
  }
}

// --- Lógica del Simulador ---

function setSimSpeed(speedState) {
  if (!activeRouteGroup || !currentRouteData) return;

  document.getElementById('btn-pause').classList.remove('active');
  document.getElementById('btn-play').classList.remove('active');
  document.getElementById('btn-fast').classList.remove('active');

  const clock = document.getElementById('clock-widget');
  clock.className = 'clock-widget'; 

  if (speedState === 'paused') {
    document.getElementById('btn-pause').classList.add('active');
    clock.classList.add('paused');
    simStatus = 'paused';
    pauseSimulation();
  } else if (speedState === 'play') {
    document.getElementById('btn-play').classList.add('active');
    simStatus = 'running';
    simSpeedMs = 100;
    startSimulation();
  } else if (speedState === 'fast') {
    document.getElementById('btn-fast').classList.add('active');
    clock.classList.add('speed-2');
    simStatus = 'running';
    simSpeedMs = 30;
    startSimulation();
  }
}

function startSimulation() {
  if (!activeRouteGroup || !currentRouteData) return;

  if (simInterval) clearInterval(simInterval);
  simCoords = currentRouteData.coords[activeRoute];

  const themeClass = activeRoute === 'salida' ? '' : 'retorno';

  if (!simMarker) {
    const carIcon = L.divIcon({
      className: 'sim-car-icon',
      html: `
        <div class="mini-car ${themeClass}" id="hud-sim-car"></div>
      `,
      iconSize: [22, 11],
      iconAnchor: [11, 5.5]
    });

    simMarker = L.marker(simCoords[simIndex], { icon: carIcon }).addTo(map);
  }

  simInterval = setInterval(() => {
    if (simIndex < simCoords.length) {
      const coord = simCoords[simIndex];
      simMarker.setLatLng(coord);

      if (simIndex < simCoords.length - 1) {
        const nextCoord = simCoords[simIndex + 1];
        const angle = calculateBearing(coord, nextCoord);
        const carEl = document.getElementById('hud-sim-car');
        if (carEl) {
          carEl.style.transform = `rotate(${angle}deg)`;
        }
      }

      const stops = currentRouteData.itinerary[activeRoute];
      const matchIndex = stops.findIndex(s => {
        const dLat = s.coord[0] - coord[0];
        const dLon = s.coord[1] - coord[1];
        return (dLat * dLat + dLon * dLon) < 1e-7;
      });
      if (matchIndex !== -1 && matchIndex !== lastMatchedStopIndex) {
        lastMatchedStopIndex = matchIndex;
        highlightItineraryItem(matchIndex);
        incrementScore();
      }

      simIndex++;
    } else {
      simIndex = 0;
    }
  }, simSpeedMs);
}

function pauseSimulation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
}

function calculateBearing(p1, p2) {
  const lat1 = p1[0] * Math.PI / 180;
  const lat2 = p2[0] * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return brng;
}

function triggerKawaiiPop(element) {
  if (!element) return;
  element.classList.remove('kawaii-pop');
  void element.offsetWidth; // Force reflow
  element.classList.add('kawaii-pop');
}

function incrementScore() {
  const delta = Math.floor(Math.random() * 12) + 8; 
  passengersCount += delta;
  
  const scoreVal = document.getElementById('score-value');
  scoreVal.innerText = passengersCount.toLocaleString();

  const panel = document.getElementById('score-panel');
  panel.style.transform = 'scale(1.1)';
  setTimeout(() => {
    panel.style.transform = 'scale(1)';
  }, 150);
}

function resetSimulation() {
  setSimSpeed('paused');
  if (simMarker) {
    map.removeLayer(simMarker);
    simMarker = null;
  }
  simIndex = 0;
  lastMatchedStopIndex = -1;
  
  if (activeRouteGroup && currentRouteData) {
    highlightItineraryItem(0);
    const startStop = currentRouteData.itinerary[activeRoute][0];
    map.setView(startStop.coord, currentRouteData.zoom);
  } else {
    map.setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);
  }
}

// --- Controladores de Eventos ---

function setupEventHandlers() {
  const routeSelector = document.getElementById('route-selector');
  routeSelector.addEventListener('change', (e) => {
    const routeId = e.target.value;
    
    // Deshabilitar temporalmente el selector durante la carga
    routeSelector.disabled = true;
    
    fetch(`routes/${routeId}.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`No se pudo cargar el archivo de la ruta: ${routeId}`);
        }
        return response.json();
      })
      .then(data => {
        const isFirstSelection = (activeRouteGroup === '');
        
        activeRouteGroup = routeId;
        currentRouteData = data;
        
        // Si es la primera selección, habilitamos el HUD y cambiamos los paneles
        if (isFirstSelection) {
          routeSelector.classList.remove('pulse-selector');
          document.getElementById('welcome-panel').style.display = 'none';
          document.getElementById('route-content-panel').style.display = 'block';
          
          // Habilitar los paneles del HUD removiendo la clase 'hud-disabled'
          document.getElementById('route-tabs').classList.remove('hud-disabled');
          document.getElementById('score-panel').classList.remove('hud-disabled');
          document.getElementById('sim-time-controls').classList.remove('hud-disabled');
        }
        
        // Configurar coordenadas centrales de la ruta elegida
        MAP_CENTER = currentRouteData.center;
        ZOOM_LEVEL = currentRouteData.zoom;
        
        activeRoute = 'salida';
        
        document.getElementById('tab-salida').classList.add('active');
        document.getElementById('tab-retorno').classList.remove('active');
        
        const scorePanel = document.getElementById('score-panel');
        if (activeRoute === 'salida') {
          scorePanel.className = 'score-panel';
        } else {
          scorePanel.className = 'score-panel route-retorno';
        }

        resetSimulation();
        drawRoutes();
        renderItinerary();
        updateStatsCard();
        
        triggerKawaiiPop(document.getElementById('sidebar-panel'));
        triggerKawaiiPop(document.getElementById('score-panel'));
        triggerKawaiiPop(document.getElementById('sim-time-controls'));
        triggerKawaiiPop(document.getElementById('brand-icon'));
        
        map.setView(MAP_CENTER, ZOOM_LEVEL);
      })
      .catch(error => {
        console.error("Error al cargar la ruta:", error);
        alert("Hubo un problema al cargar los datos de la ruta. Por favor, asegúrate de estar corriendo un servidor local (HTTP) para permitir peticiones AJAX.");
      })
      .finally(() => {
        routeSelector.disabled = false;
      });
  });

  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (!activeRouteGroup || !currentRouteData) return; // Deshabilitado si no hay ruta activa
      
      const targetRoute = tab.getAttribute('data-route');
      if (targetRoute !== activeRoute) {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        activeRoute = targetRoute;
        
        const scorePanel = document.getElementById('score-panel');
        if (activeRoute === 'salida') {
          scorePanel.className = 'score-panel';
        } else {
          scorePanel.className = 'score-panel route-retorno';
        }

        updateStatsCard();
        resetSimulation();
        drawRoutes();
        renderItinerary();
        
        const newStart = currentRouteData.itinerary[activeRoute][0];
        map.setView(newStart.coord, currentRouteData.zoom);
      }
    });
  });

  document.getElementById('btn-pause').addEventListener('click', () => setSimSpeed('paused'));
  document.getElementById('btn-play').addEventListener('click', () => setSimSpeed('play'));
  document.getElementById('btn-fast').addEventListener('click', () => setSimSpeed('fast'));

  const themeBtn = document.getElementById('theme-toggle');
  themeBtn.addEventListener('click', () => {
    if (activeTheme === 'dark') {
      activeTheme = 'light';
      document.body.setAttribute('data-theme', 'light');
      themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
      tilesLayer.setUrl(tilesConfig.light);
    } else {
      activeTheme = 'dark';
      document.body.setAttribute('data-theme', 'dark');
      themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
      tilesLayer.setUrl(tilesConfig.dark);
    }
    
    if (activeRouteGroup && currentRouteData) drawRoutes();
  });

  document.getElementById('btn-recenter').addEventListener('click', () => {
    if (activeRouteGroup && currentRouteData) {
      map.setView(MAP_CENTER, ZOOM_LEVEL);
    } else {
      map.setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);
    }
  });
  
  let sakuraActive = false;
  const sakuraBtn = document.getElementById('btn-sakura-toggle');
  sakuraBtn.addEventListener('click', () => {
    const container = document.getElementById('sakura-container');
    if (sakuraActive) {
      container.style.display = 'none';
      sakuraBtn.style.opacity = '0.4';
      sakuraActive = false;
    } else {
      container.style.display = 'block';
      sakuraBtn.style.opacity = '1';
      sakuraActive = true;
    }
  });
}

function updateStatsCard() {
  if (!activeRouteGroup || !currentRouteData) return;
  const currentStats = currentRouteData.stats[activeRoute];
  
  document.getElementById('stat-distance').innerText = currentStats.dist;
  document.getElementById('stat-stops').innerText = currentStats.stops;
  document.getElementById('stat-time').innerText = currentStats.time;
}

// --- Floración de Sakura ---

function initSakura() {
  const container = document.getElementById('sakura-container');
  const maxPetals = 15;

  for (let i = 0; i < maxPetals; i++) {
    createPetal(container);
  }
}

function createPetal(container) {
  const petal = document.createElement('div');
  petal.className = 'petal';

  const size = Math.random() * 6 + 4;
  const left = Math.random() * 100;
  const duration = Math.random() * 8 + 6;
  const delay = Math.random() * 8;

  petal.style.width = `${size}px`;
  petal.style.height = `${size}px`;
  petal.style.left = `${left}%`;
  petal.style.animationDuration = `${duration}s`;
  petal.style.animationDelay = `-${delay}s`;
  petal.style.transform = `rotate(${Math.random() * 360}deg)`;

  petal.addEventListener('animationiteration', () => {
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${Math.random() * 8 + 6}s`;
  });

  container.appendChild(petal);
}
