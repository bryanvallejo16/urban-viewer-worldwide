// ADDING BASE MAPS AND MAP DEFINITION
var map=L.map('map').setView([25, 12], 3);

var osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'Open Street Maps | Bryan R. Vallejo'});
var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community | Bryan R. Vallejo',maxZoom: 18});
var esridark = L.esri.basemapLayer('DarkGray',{attribution: 'Bryan R. Vallejo'});
var esrigray = L.esri.basemapLayer('Gray',{attribution: 'Bryan R. Vallejo'});

esridark.addTo(map)

var basemaps={
  'DarkGray': esridark,
  'Satellite': esri,
	'OSM': osm
}


//ADDING SCALE BAR
L.control.scale({imperial:false, position:'bottomleft'}).addTo(map);

//ADDING A POLYGON FEATURE WITH STYLE

//Function to highlight Features
 function highlightFeature(e) {
     var activefeature = e.target;
     activefeature.setStyle({
         weight: 5,
         color: '#F0F92B',

         dashArray: '',
         fillOpacity: 0.3
     });
     if (!L.Browser.ie && !L.Browser.opera) {
         activefeature.bringToFront();
     } info.update(activefeature.feature.properties);
   }
//function for resetting the highlight
 function resetHighlight(e) {
   	cities.resetStyle(e.target);
		info.update();
   }
 function zoomToFeature(e) {
	     map.flyTo(e.target.getLatLng(),6);
	 }
//to call these methods we need to add listeners to our features
//the word ON is a short version of addEventListener
 function interactiveFunction(feature, layer) {
       layer.on({
           mouseover: highlightFeature,
           mouseout: resetHighlight,
           click: zoomToFeature,
      } );
   }


// calculate the circles' radius given the cities' population
function getRadius(pop) {
  var maxSymbolsize = 20; // maximum symbol size
  var maxValue = 37393129; // highest population value in the dataset
  r = maxSymbolsize * Math.sqrt(pop/maxValue); // proportional by area
  return r;
}

// create the circles' style

function getColor(d) {
return d > 10000000  ? '#d7301f' :
       d > 5000000  ? '#fc8d59' :
       d > 1000000   ? '#fdcc8a' :
                       '#fef0d9' ;
}


function style(feature) {
  return {
    radius: getRadius(feature.properties.a2020), // radius calculated with function above and population property form GeoJSON as input
    fillColor:getColor(feature.properties.a2020),//HERE YOU PUT THE FUNCTION FOR THE COLORS
    color: "#000",
    weight: 1,
    opacity: 0,
    fillOpacity: 0.9
  };
}

// Add circles, popups and tooltips to the map
var cities=L.geoJson(pop_cities, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, style(feature));
  },
  onEachFeature: interactiveFunction
}).addTo(map)


//ADDING A INFO CONTROL BOX
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h3> Cities and population </h3>' +  (props ?
         '<b>'+props.City_name +'</b>'+ ' 🌆' +'<br/>' + props.a2020 + ' Inhabitants in 2020'
        :
	  'Hover the mouse over the map to see data.'+'<br/>'+'¡Try clicking over the cities!' );
};

info.addTo(map);

 //ADDING A LEGEND WITH COLORS
 var legendcolor = L.control({position: 'bottomleft'});
 legendcolor.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [300000, 1000000, 5000000, 10000000],
        labels = [];
// loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
        '<i class ="circle" style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');

          }    return div;
   };
  legendcolor.addTo(map);

//ADDING A LAYER CONTROL
 var features={
   'Cities': cities
 }
 var legend = L.control.layers(basemaps, features, {position: 'bottomleft', collapsed:true}).addTo(map);
