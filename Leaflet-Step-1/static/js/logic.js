// USGS GeoJSON data for all earthquakes in past 7 days updated every minute
var geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var defaultCoordinates = [10, 10]

// Pull in data and get map features using current geoJSON data
d3.json(geoData).then(eqData => {
  console.log("Earthquake Data", eqData);
  getFeatures(eqData.features);
});

// Function to get map features
function getFeatures(eqData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<h3>Location: " + feature.properties.place + "</h3><hr>" +
      "<p><b>Magnitude: </b>" + feature.properties.mag + "</p>" + 
      "<p><b>Depth: </b>" + feature.geometry.coordinates[2] + "</p>" +
      "<p><b>Date and Time: </b>" + new Date(feature.properties.time) + "</p>"
    );
  };
  
  var earthquakes = L.geoJSON(eqData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {
      var markerAttributes = {
        radius: 5 * feature.properties.mag,
        fillColor: getColor(feature.geometry.coordinates[2]),
        weight: 1,
        opacity: 1,
        fillOpacity: 1,
        color: "#000000",
        stroke: true,
        weight: 0.25
      };

      return L.circleMarker(latlng, markerAttributes);
    }
  });
  
  createMap(earthquakes);
};


// Function to create map
function createMap(earthquakes) {

  // Create tile layers
  var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
    {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",
      accessToken: API_KEY
    }
  );

  // Tile layer
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
    {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/satellite-v9",
      accessToken: API_KEY
    }
  );

  // Tile layer
  var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
    {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/outdoors-v11",
      accessToken: API_KEY
    }
  );

  // Create base map
  var baseMaps = {
    "Grayscale": grayscaleMap,
    "Satellite": satelliteMap,
    "Outdoors": outdoorsMap
  };

  // Create overlay maps
  var mapOverlay = {
    Earthquakes: earthquakes
  };

  // Create map with default tile layer and overlay
  var myMap = L.map("map", {
    center: defaultCoordinates,
    zoom: 3,
    layers: [grayscaleMap, earthquakes]
  });

  // Create control layers and add to map
  L.control.layers(baseMaps, mapOverlay, {collapsed: false}).addTo(myMap);

  // Create legend to display on bottom right of map
  var legend = L.control({
    position: "bottomright"
  });

  // Create legend DOM object
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend"),
    depths = [-10, 10, 30, 50, 70, 90];

    // Legend header
    div.innerHTML += "<h4>Depth</h4>";

    // Loop to assign legend color to depth ranges
    for (var i = 0; i < depths.length; i++) {
      // console.log("getColor--->", getColor(depths[i] + 1));
      div.innerHTML += 
                                                              // Adding space here controls width color block in legend
        '<i style="background: ' + getColor(depths[i] + 1) + ';">&nbsp&nbsp&nbsp&nbsp&nbsp</i> ' + 
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }
    return div;
  };

  // Add legend to map
  legend.addTo(myMap);

};

// Set marker color ranges
function getColor(depth) {
  switch (true) {
    case depth >= 90:
      return "#CA4113" // Red
    case depth >= 70:
      return "#CA7622" // Dark Orange
    case depth >= 50:
      return "#D9AF34" // Light Orange
    case depth >= 30:
      return "#E6D55D" // Yellow
    case depth >= 10:
      return "#93B020" // Yellow Green
    default:
      return "#4B7221"; // Green
  }
};


