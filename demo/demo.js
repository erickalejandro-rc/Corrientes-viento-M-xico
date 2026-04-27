//Mapa Satelital
function initDemoMap() {
  var Esri_WorldImagery = L.tileLayer(
    "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, " +
        "AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        minZoom:4,
        maxZoom:18,//Agregamos limitaciones al ZOOM 
    }
  );
  //Mapa oscuro
  var Esri_DarkGreyCanvas = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  {
     attribution: "Tiles © Esri",

    minZoom:4, 
    maxZoom: 18,
  }
);

  

  var baseLayers = {
    Satellite: Esri_WorldImagery,
    "Dark": Esri_DarkGreyCanvas,
    
  };

  var map = L.map("map", {
    layers: [Esri_WorldImagery]
  });
  //Código para agregrar  la marca del PINCC
  const customLogoTitle = L.control({ position: 'topleft' });

customLogoTitle.onAdd = function () {
    const div = L.DomUtil.create('div', 'custom-map-panel');
    div.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.9); padding: 12px; border-radius: 8px; font-family: 'Segoe UI', Arial, sans-serif; box-shadow: 0 0 15px rgba(0,0,0,0.2); border: 1px solid #ddd; max-width: 200px;">
            <strong style="font-size: 14px; color: #333;">Visualización WRF-CMIP6 2026</strong><br>
            <span style="font-size: 11px; color: #666;">Resolución: 10 km (México)</span><br>
            
            <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
            
            <a href="https://www.pincc.unam.mx/" target="_blank">
                <img src="https://www.pincc.unam.mx/wp-content/uploads/2022/06/logo-pincc-unam.png" 
                     alt="PINCC UNAM" 
                     style="width: 100%; display: block; margin: 5px auto 0;">
            </a>
            
            <div style="text-align: center; margin-top: 8px;">
                <small style="font-size: 9px; color: #777; line-height: 1.1; display: block;">
                    Programa de Investigación en Cambio Climático, UNAM
                </small>
            </div>
        </div>
    `;
    return div;
};
customLogoTitle.addTo(map);


  var layerControl = L.control.layers(baseLayers);
  layerControl.addTo(map);
  map.setView([19.410571, -99.124978], 5); // ponemos el foco de vista a México en vez de oceania
  
 


  return {
    map: map,
    layerControl: layerControl
  };
}





// demo map
var mapStuff = initDemoMap();
var map = mapStuff.map;
var layerControl = mapStuff.layerControl;

//Código para llamar al JSON Wind-great Barrier Reef
// load data (u, v grids) from somewhere (e.g. https://github.com/danwild/wind-js-server)
// $.getJSON("wind-gbr.json", function(data) {
//   var velocityLayer = L.velocityLayer({
//     displayValues: true,
//     displayOptions: {
//       velocityType: "GBR Wind",
//       position: "bottomleft",
//       emptyString: "No wind data",
//       showCardinal: true
//     },
//     data: data,
//     maxVelocity: 10
//   });

//   layerControl.addOverlay(velocityLayer, "Wind - Great Barrier Reef");
// });
//Código para llamar al JSON Ocean Current - Great Barrier Reef

// $.getJSON("water-gbr.json", function(data) {
//   var velocityLayer = L.velocityLayer({
//     displayValues: true,
//     displayOptions: {
//       velocityType: "GBR Water",
//       position: "bottomleft",
//       emptyString: "No water data"
//     },
//     data: data,
//     maxVelocity: 0.6,
//     velocityScale: 0.1 // arbitrary default 0.005
//   });

//   layerControl.addOverlay(velocityLayer, "Ocean Current - Great Barrier Reef");
// });

$.getJSON("wind-global.json", function(data) {
  var velocityLayer = L.velocityLayer({
    displayValues: true,
    displayOptions: {
      velocityType: "Global Wind",
      position: "bottomleft",
      emptyString: "No wind data"
    },
    data: data,
    maxVelocity: 15
  });

  layerControl.addOverlay(velocityLayer, "Wind - Global");
});




var windData = null; //  variable global donde voy a guardar los datos del JSON

//Código para cargar wind-data.json
$.getJSON("wind-data.json", function(data) {
  windData = data; //  guardamos los datos
  //Aquí se genera la animación que simula cómo se mueve el viento.
  var velocityLayer = L.velocityLayer({
    displayValues: true,//Muestra datos cuando pasas el mouse
    displayOptions: {
      velocityType: "WRF Viento 10m",//Nombre del tipo de viento
      position: "bottomleft", //Posicion del panel que nos muestra la ubicación y la velocidad del viento al pasar el mouse por la plantilla
      emptyString: "Sin datos",
      showCardinal: true,
      angleConvention: "meteoCW",
    },
    data: data,
    maxVelocity: 25,
    velocityScale: 0.005, //Qué tan rápido se mueven las partículas
    particleMultiplier: 1/200, // Cantidad de “líneas de viento” en pantalla
    lineWidth: 2,
    frameRate: 20,
    colorScale: ["#ffffff"]
  });

  layerControl.addOverlay(velocityLayer, "Viento WRF México");// Añade la capa al mapa para poder activarla
});



//código para dar información al dar un click
var map = mapStuff.map;
function getWindAtPoint(lat, lon, windData) { // Esta función ayuda a saber cuanto viento hay exactamente en este punto, el sistema calcula el viento aproximado entre varios puntos cercanos
  //En esta parte del código ubicamos las dos fuerzas del viento la horizontal y la vertical donde "u" es horizontal y "v" es vertical 
  var uData = windData[0].data;
  var vData = windData[1].data;
  var header = windData[0].header;
//Declaración de variables 
  var nx = header.nx;//numero de columnas
  var ny = header.ny;//numero de filas
  var lo1 = header.lo1;//longitud inicial(izquierda)
  var la1 = header.la1;//longitud inicial (arriba)
  var dx = header.dx;//tamaño de celda en la longitud
  var dy = header.dy;//tamaño de celda en la latitud

  // posición fraccional
  var x = (lon - lo1) / dx;
  var y = (la1 - lat) / dy;
//Convierte la latitud/longitud en posición dentro de la tabla
  var i = Math.floor(x);
  var j = Math.floor(y);

  var fi = x - i;
  var fj = y - j;

  // índices vecinos
  var idx = (ii, jj) => jj * nx + ii;
//Toma los cuatro puntos más cercanos alrededor del punto seleccionado
  try {
    var u00 = uData[idx(i, j)];
    var u10 = uData[idx(i + 1, j)];
    var u01 = uData[idx(i, j + 1)];
    var u11 = uData[idx(i + 1, j + 1)];

    var v00 = vData[idx(i, j)];
    var v10 = vData[idx(i + 1, j)];
    var v01 = vData[idx(i, j + 1)];
    var v11 = vData[idx(i + 1, j + 1)];

    if ([u00,u10,u01,u11,v00,v10,v01,v11].includes(null)) return null;

    // Método de interpolación bilineal(Sirve para estimar valores en puntos intermedios dentro de una cuadrícula 2D, basado en el promedio ponderado de los cuatro vecinos más cercanos.)
    var u =
      u00 * (1 - fi) * (1 - fj) +
      u10 * fi * (1 - fj) +
      u01 * (1 - fi) * fj +
      u11 * fi * fj;

    var v =
      v00 * (1 - fi) * (1 - fj) +
      v10 * fi * (1 - fj) +
      v01 * (1 - fi) * fj +
      v11 * fi * fj;

    return { u, v };

  } catch (e) {
    return null;
  }
}

// convertir grados a dirección cardinal

function getCardinal(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}


map.on("click", function(e) { // Detecta cuando haces click en el mapa

  if (!windData) {
    alert("Datos no cargados");
    return;
  }
//obtiene la ubicación
  var lat = e.latlng.lat;
  var lon = e.latlng.lng;

  var wind = getWindAtPoint(lat, lon, windData); //Calcula el viento

  if (!wind) {
    alert("Sin datos en este punto");
    return;
  }

  var speed = Math.sqrt(wind.u * wind.u + wind.v * wind.v) * 3.6; //Calcula la velicidad

  var direction = Math.atan2(wind.u, wind.v) * (180 / Math.PI);
  if (direction < 0) direction += 360; // Obtiene ángulo del viento

  var cardinal = getCardinal(direction);

  //  POPUP para mostrar la información (tipo Windy)
  L.popup()
    .setLatLng(e.latlng)
    .setContent(`
      <div style="font-family: Arial; min-width: 150px;">
        <strong>📍 Punto seleccionado</strong><br>
        Lat: ${lat.toFixed(2)}<br>
        Lon: ${lon.toFixed(2)}<br><br>
        
        Velocidad: <strong>${speed.toFixed(1)} km/h</strong><br>
        Dirección: ${cardinal} (${direction.toFixed(0)}°)
      </div>
    `)
    .openOn(map);

}); 
