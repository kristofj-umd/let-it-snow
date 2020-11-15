// app.js


// try this out for a progress bar
// http://bl.ocks.org/mbostock/3750941
// this might be easier:
// http://www.competa.com/blog/2015/10/animated-progress-bars-with-d3-js/

// js-hint modifiers
/*globals d3, L */

// side panel functionality
// src: https://www.w3schools.com/howto/howto_js_collapse_sidepanel.asp
/* Set the width of the sidebar to 250px (show it) */
function openNav() {
    document.getElementById("mySidepanel").style.width = "250px";
}

/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}

window.onload = function () {
    
    main();
    
};

function main() {
    var data,
        map =
        // setup leaflet map
        _setupMap();

    // query weather service for latest weather data
    //    _getData(function(result)
    //    {
    //        // parse data and return records array
    //        data = result;
    //        // once data is available start dropping points
    ////        _addData2Map(map, data);
    //    });

}

// add weather data to map
// brefs:
// https://gist.github.com/d3noob/9267535
// http://bost.ocks.org/mike/leaflet/
function _addData2Map(map, weatherData) {
    console.log(weatherData, map);
    // var geojsonMarkerOptions = {
    //     radius: 8,
    //     fillColor: "#ff7800",
    //     color: "#000",
    //     weight: 1,
    //     opacity: 1,
    //     fillOpacity: 0.8
    // };

    d3.xml("falling-snowflakes-free-stock-vector-7.svg").mimeType("image/svg+xml").get(function (error, xml) {
        if (error) throw error;

        // var myIcon = L.icon({
        //         iconUrl: xml.documentElement,
        //         iconSize: [38, 38],
        //         iconAnchor: [17,17]
        //         // popupAnchor: [-3, -76],
        //     }),
        // var snowflakeSVG = d3.select(document.getElementById('snowflakesvg').contentDocument).select('#document')[0].parentNode,
        var myDivIcon = L.divIcon({
                className: 'my-div-icon-class',
                html: xml.documentElement.outerHTML,
                iconSize: [24, 24],
                iconAnchor: [12, 24]
            }),

            markerLayer = L.geoJSON(weatherData, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {
                        icon: myDivIcon
                    });
                },
                // onEachFeature: function(feature, layer) {
                //     console.log('feature', feature);
                //     console.log('layer', layer);
                // }
            });

        markerLayer.on('add', function (evt) {
            console.log('onadd', evt);
        });

        markerLayer.addTo(map);
    });
}

// setup leaflet map
// return map object
function _setupMap() {
    var token = "pk.eyJ1Ijoia3Jpc3RvZmoiLCJhIjoiY2lyd2o4emVuMDBpY2hrbmhoNDRtbmhyNSJ9.EJIBivPIIdDraJ8xvp7UoQ"; // replace with your Mapbox API Access token. Create a Mapbox account and find it on https://account.mapbox.com/

    var map = L.map('map').setView([46.782963, -92.094666], 7);
    var gl = L.mapboxGL({
        accessToken: token,
        style: 'mapbox://styles/kristofj/ckhi7csrl2y5519pjwcfoudah'
    }).addTo(map);

    return map;
}

// GET request to weather service
function _getData(callback) {
    var url = 'https://cors-anywhere.herokuapp.com/https://www.weather.gov/source/crh/lsr_snow.geojson';
    d3.json(url, function (json) {
        //code here
        console.log('json', json)
        callback(json);
    });

}
