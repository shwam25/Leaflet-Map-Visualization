// 1. grayMap background
var grayMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1Ijoic2h3ZXRhczEiLCJhIjoiY2tieHB1ZHhsMHNhczJzbnM1aDNnMWI1YSJ9.UlQSzgZvrz-xARTM-QlXkg");

// 2. satelliteMap background
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1Ijoic2h3ZXRhczEiLCJhIjoiY2tieHB1ZHhsMHNhczJzbnM1aDNnMWI1YSJ9.UlQSzgZvrz-xARTM-QlXkg");

// 3. outdoorsMap background
var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1Ijoic2h3ZXRhczEiLCJhIjoiY2tieHB1ZHhsMHNhczJzbnM1aDNnMWI1YSJ9.UlQSzgZvrz-xARTM-QlXkg");

// map object to an array of layers defined above
var map = L.map("mapid", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [grayMap, satelliteMap, outdoorsMap]
});

// add first 'grayMap' tile layer to the map
grayMap.addTo(map);

// layers for two different datasets- data1 for tectonicplates and data2 for earthquakes
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// base layers
var baseMaps = {
  Satellite: satelliteMap,
  Grayscale: grayMap,
  Outdoors: outdoorsMap
};

// overlays 
var overlayMaps = {
  "Fault Lines": tectonicplates,
  "Earthquakes": earthquakes
};

// control layers
L.control.layers(baseMaps, overlayMaps).addTo(map);

// retrieve earthquake geoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(data) {


  function styleProperties(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // setting color of the markers based on the earthquake magnitude
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }

  // setting radius of the marker based on the earthquake magnitude

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 3;
  }

  // add GeoJSON layer to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleProperties,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  }).addTo(earthquakes);

  earthquakes.addTo(map);


  var legend = L.control({
    position: "bottomright"
  });


  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var shades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

// looping through shades
    for (var i = 0; i < shades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " + shades[i] + (shades[i + 1] ? "&ndash;" + shades[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(map);

  // retrieving tectonic plates geoJSON data
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicplates);

      // add the tectonicplates layer to the map.
      tectonicplates.addTo(map);
    });
});