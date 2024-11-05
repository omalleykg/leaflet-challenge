function createMap(earthquake, avgLat, avgLon) {
    // Create the tile layer that will be the background of our map.
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object to hold the streetmap layer.
    let baseMaps = {
      "Street Map": streetmap
    };

    // Create an overlayMaps object to hold the Earthquake layer.
    let overlayMaps = {
      "Earthquake": earthquake
    };

    // Create the map object with options.
    let map = L.map("map", {
      center: [avgLat, avgLon],
      zoom: 3,
      layers: [streetmap, earthquake]
    });

    // Add the legend to the map by passing the map to createLegend
    createLegend(map);

    // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);
}

// Add Legend to Map
function createLegend(map) {
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let depths = [0, 10, 30, 50, 70, 90]; // Define depth ranges
        let labels = [];

        // Loop through the depth ranges and create a label for each
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' + // Use getColor to set the background
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
        }

        return div;
    };

    legend.addTo(map); // Add the legend to the map
}

// Create colors based on depth
function getColor(depth) {
    return depth >= 90 ? '#FF0000' : // Red for depths >= 90 km
           depth >= 70 ? '#FF7F00' : // Orange for depths between 70 and 90 km
           depth >= 50 ? '#FFFF00' : // Yellow for depths between 50 and 70 km
           depth >= 30 ? '#7FFF00' : // Light green for depths between 30 and 50 km
           depth >= 10 ? '#00FF00' : // Green for depths between 10 and 30 km
                        '#00FFFF';   // Cyan for depths < 10 km
}

// Create markers function
function createMarkers(response) {
    // Pull the "features" property from response.data.
    let features = response.features;

    // Initialize an array to hold earthquake markers
    let quakeMarkers = [];
    let totalLat = 0;
    let totalLon = 0;

    // Loop through the earthquake array.
    for (let index = 0; index < features.length; index++) {
        let feature = features[index];

        // Extract coordinates and create a marker
        let coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        totalLat += coordinates[0];
        totalLon += coordinates[1];

        let depth = feature.geometry.coordinates[2]; 
        // Get the depth

        // Create a circle marker with color based on depth
        let quakeMarker = L.circleMarker(coordinates, {
            radius: feature.properties.mag * 2, // Adjust size based on magnitude
            fillColor: getColor(depth), // Get color based on depth
            color: "#000", // Border color
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup("<h3>" + feature.properties.place + "</h3><h3>Magnitude: " + feature.properties.mag + "</h3><h3>Depth: " + depth + " km</h3>");
      
        // Add the marker to the quakeMarkers array.
        quakeMarkers.push(quakeMarker);
    }

    // Calculate average latitude and longitude
    let avgLat = totalLat / features.length;
    let avgLon = totalLon / features.length;

    // Create a layer group that's made from the quake markers array, and pass it to the createMap function.
    createMap(L.layerGroup(quakeMarkers), avgLat, avgLon);
}


// Perform an API call to get earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson").then(createMarkers);
