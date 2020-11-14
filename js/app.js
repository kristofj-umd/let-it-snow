// app.js


// try this out for a progress bar
// http://bl.ocks.org/mbostock/3750941
// this might be easier:
// http://www.competa.com/blog/2015/10/animated-progress-bars-with-d3-js/

// js-hint modifiers
/*globals d3, L */

window.onload = function()
{
    main();
};

function main()
{
    var data,
        map =
        // setup leaflet map
        _setupMap();

    // query weather service for latest weather data
    _getData(function(result)
    {
        // parse data and return records array
        data = result;
        // once data is available start dropping points
        _addData2Map(map, data);
    });
}

// add weather data to map
// brefs:
// https://gist.github.com/d3noob/9267535
// http://bost.ocks.org/mike/leaflet/
function _addData2Map(map, weatherData)
{
    console.log(weatherData, map);
    // var geojsonMarkerOptions = {
    //     radius: 8,
    //     fillColor: "#ff7800",
    //     color: "#000",
    //     weight: 1,
    //     opacity: 1,
    //     fillOpacity: 0.8
    // };

    d3.xml("falling-snowflakes-free-stock-vector-7.svg").mimeType("image/svg+xml").get(function(error, xml) {
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
                iconSize: [24,24],
                iconAnchor: [12, 24]
            }),

            markerLayer = L.geoJSON(weatherData, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {icon: myDivIcon});
                }
                ,
                // onEachFeature: function(feature, layer) {
                //     console.log('feature', feature);
                //     console.log('layer', layer);
                // }
            });

        markerLayer.on('add', function(evt) {
            console.log('onadd', evt);
        });

        markerLayer.addTo(map);
    });
}

// setup leaflet map
// return map object
function _setupMap()
{
    var token ="pk.eyJ1Ijoia3Jpc3RvZmoiLCJhIjoiY2lyd2o4emVuMDBpY2hrbmhoNDRtbmhyNSJ9.EJIBivPIIdDraJ8xvp7UoQ"; // replace with your Mapbox API Access token. Create a Mapbox account and find it on https://account.mapbox.com/

    var map = L.map('map').setView([46.782963, -92.094666], 7);
    var gl = L.mapboxGL({
        accessToken: token,
        style: 'mapbox://styles/kristofj/ckhi7csrl2y5519pjwcfoudah'
    }).addTo(map);
//    var map = L.map('map').setView([46.782963, -92.094666], 7),
//    Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
//    }).addTo(map);
    // NASAGIBS_ModisTerraTrueColorCR = L.tileLayer('http://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
    //     attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
    //     bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
    //     minZoom: 1,
    //     maxZoom: 9,
    //     format: 'jpg',
    //     time: '',
    //     tilematrixset: 'GoogleMapsCompatible_Level'
    // }).addTo(map),
    // CartoDB_DarkMatterOnlyLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    //     subdomains: 'abcd',
    //     maxZoom: 19
    // }).addTo(map);
    return map;
}

// GET request to weather service
function _getData(callback)
{
    var url = 'https://cors-anywhere.herokuapp.com/https://www.weather.gov/source/crh/lsr_snow.geojson';
    d3.json(url, function (json) {
        //code here
        console.log('json', json)
        callback(json);
    });

}

// parse raw data into useable records
function _parse(raw)
{
    //  console.log(raw.indexOf('\n'));
    //var re = /(..REMARKS..[^]*?&&)/,
    //  matches = raw.match(re);
    var regexs = {
            latLng: /\d{2}\.\d{2}[N]\s\d{2}\.\d{2}[W]/,
            value: /\d{1,2}\.\d{1,2}(?=\sINCH)/,
            date: /\d{2}\/\d{2}\/\d{4}/,
            time: /(\d{4}\s(AM|PM))/,
            lines: /\n/
        },
        records = [],
        data = {},
        lines = raw.split(regexs.lines),
        matches = [];

    lines.forEach(function(line, index, array)
    {
        var match = '';
        // check for snow
        if (line.indexOf('SNOW') === 12)
        {
            // check where next time is
            if (regexs.time.test(array[index + 3]))
            {
                match = array.slice(index, index + 3).join(' ');
            }
            else if (regexs.time.test(array[index + 5]))
            {
                match = array.slice(index, index + 5).join(' ');
            }
        }
        if (match) matches.push(match);
    });

    // console.log(regexs);
    // console.log('matches', matches);

    // loop through rows
    matches.forEach(function(row)
    {
        // exit if it's not a weather snippet
        // if (row.substr(2, 3) != '000') {
        //     return false;
        // }
        // set the date
        var theDate = new Date(row.match(regexs.date)[0]),
            theTime = row.match(regexs.time)[0],
            hours12 = parseInt(theTime.substr(0, 2)),
            hours24 = theTime.substr(-2) == 'AM' ? hours12 : hours12 + 12,

            // get lat long
            dirLatLng = row.match(regexs.latLng)[0],
            // convert from directional to hemispheric
            leafLatLng = dirLatLng.split(' ').map(function(latLng)
            {
                if (latLng.substr(-1) == 'N' || latLng.substr(-1) == 'E')
                {
                    return latLng.slice(0, 5) * 1;
                }
                else
                {
                    return latLng.slice(0, 5) * -1;
                }
            });
        // set the time
        theDate.setHours(hours24);
        theDate.setMinutes(theTime.substr(2, 2));

        // populate data
        data = {
            coords: leafLatLng,
            value: parseFloat(row.match(regexs.value)[0]),
            datetime: theDate
        };


        records.push(data);
    });

    // console.log('records', records);
    return records;
}
