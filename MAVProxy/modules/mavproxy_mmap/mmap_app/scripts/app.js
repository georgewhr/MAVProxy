goog.provide('Avisky.App');

goog.require('Avisky.GpsPopoverViewDelegate');
goog.require('Avisky.GpsButtonView');
goog.require('Avisky.FlightStatusPopoverViewDelegate');
goog.require('Avisky.FlightStatusButtonView');
goog.require('Avisky.PopoverView');
goog.require('Avisky.RadioButtonPopoverView');




goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.async.AnimationDelay');
goog.require('goog.async.Throttle');
goog.require('goog.debug.Console');
goog.require('goog.debug.FpsDisplay');
goog.require('goog.dom');
goog.require('goog.net.jsloader');
/**
 * Mavelous App object.
 *
 * @constructor
 */
Avisky.App = function() {
};



function TrailPlotter(marker_clip) {
  this.marker_clip = marker_clip

  var last_trail_time = 0;

  this.update = function() {
    var now = new Date().getTime();
      if (last_trail_time == 0 || now - last_trail_time > 10000) {
        var trail_marker = this.marker_clip.createDefaultMarker(2);
        this.marker_clip.addMarker(trail_marker, new MM.Location(state.lat, state.lon));
        last_trail_time = now;
    }
  }
}


function MarkerClip(map) {

    this.map = map;

    var theClip = this;

    var markerDiv = document.createElement('div');
    markerDiv.id = map.parent.id + '-markerClip-' + new Date().getTime();
    markerDiv.style.margin = '0';
    markerDiv.style.padding = '0';
    markerDiv.style.position = 'absolute';
    markerDiv.style.top = '0px';
    markerDiv.style.left = '0px';
    markerDiv.style.width = map.dimensions.x+'px';
    markerDiv.style.height = map.dimensions.y+'px';        
    map.parent.appendChild(markerDiv);    
    
    function onMapChange() {
        theClip.updateMarkers();    
    }

    map.addCallback('drawn', onMapChange);

    map.addCallback('resized', function() {
        markerDiv.style.width = map.dimensions.x+'px';
        markerDiv.style.height = map.dimensions.y+'px';        
        theClip.updateMarkers();
    });

    this.updateMarkers = function() {
        for (var i = 0; i < this.markers.length; i++) {
            this.updateMarkerAt(i);
        }
    };
    
    this.markers = [];
    this.markerLocations = [];
    this.markerOffsets = [];
    
    this.addMarker = function(element, location, offset) {
        element.style.position = 'absolute';
        if (!offset) {
            offset = new MM.Point(element.offsetWidth/2, element.offsetHeight/2);
        }
        markerDiv.appendChild(element);
        this.markers.push(element);
        this.markerLocations.push(location);
        this.markerOffsets.push(offset);
        this.updateMarkerAt(this.markers.length-1);
    };

    this.setMarkerLocation = function(index, location) {
      this.markerLocations[index] = location;
    }
    
    this.updateMarkerAt = function(index) {
        var point = map.locationPoint(this.markerLocations[index]),
            offset = this.markerOffsets[index],
            element = this.markers[index];
        MM.moveElement(element, { 
          x: point.x - offset.x, 
          y: point.y - offset.y,
          scale: 1, width: 10, height: 10 });
    };

    var createdMarkerCount = 0;

    this.createDefaultMarker = function(size) {
        var marker = document.createElement('div');
        marker.id = map.parent.id+'-marker-'+createdMarkerCount;
        createdMarkerCount++;
        px_size = size + 'px';
        marker.style.width = px_size;
        marker.style.height = px_size;
        marker.style.margin = '0';
        marker.style.padding = '0';
        marker.style.backgroundColor = '#ffffff';
        marker.style.borderWidth = '2px';
        marker.style.borderColor = 'black';
        marker.style.borderStyle = 'solid';
        marker.style.MozBorderRadius = px_size;
        marker.style.borderRadius = px_size;
        marker.style.WebkitBorderRadius = px_size;
        return marker;
    };
}


var map;
var map_layer;
var marker_clip;
var trail_plotter;
var last_state_update_time;

var state = {};
state.lat = 37.407739;
state.lon = -122.030342;
state.heading = 0.0;



//function initMap() {
Avisky.App.prototype.start = function() {

  // name of a div element:
  var parent = 'map';

  // defaults to Google-style Mercator projection, so works
  // out of the box with OpenStreetMap and friends:
  // var template = 'http://tile.openstreetmap.org/{Z}/{X}/{Y}.png';
  // var provider = new MM.TemplatedMapProvider(template);

  // --------------------
  // Blue Marble
  // var provider = new MM.BlueMarbleProvider();

  // --------------------
  // Microsoft Bing
  // please use your own API key!  This is jjwiseman's!
  var key = "At_H_Y9GzOU6galYJ326-Q_K3vp_FCCFOhj8wfskOEd5VMgNhdjaXKUMG7WtS2_G";
  var style = 'AerialWithLabels';
  var provider = new MM.BingProvider(key, style);

  map_layer = new MM.Layer(provider);

  // without a size, it will expand to fit the parent:
  map = new MM.Map(parent, map_layer);

  marker_clip = new MarkerClip(map);
  //var marker = marker_clip.createDefaultMarker(20);
  //var location = new MM.Location(0, 0);
  //marker.title = "lovedrone";
  //marker_clip.addMarker(marker, location);

  map.setCenterZoom(new MM.Location(37.407739,-122.030342), 20);

  setInterval(updateState, 500);
  $('#layerpicker').change(updateLayer);

  trail_plotter = new TrailPlotter(marker_clip);

  this.gpsButtonView = new Avisky.GpsButtonView({
    //'mavlinkSrc': this.mavlinkAPI,
    'el': $('#navbar-btn-gps')
  });

  this.flightstatusButtonView = new Avisky.FlightStatusButtonView({
    //'mavlinkSrc': this.mavlinkAPI,
    'el': $('#navbar-btn-flightstatus')
  });
    /* Radio view controller */
  this.statusButtons = new Avisky.RadioButtonPopoverView({
    popovers: [ { btn: this.gpsButtonView,
                  delegate: new Avisky.GpsPopoverViewDelegate({
                    'mavlinkSrc': this.mavlinkAPI
                    })
                },

                { btn: this.flightstatusButtonView,
                  delegate: new Avisky.FlightStatusPopoverViewDelegate({
                    'packetLossModel': this.packetLossModel
                    })
                }

              ]
  });
}


function updateState() {
  $.getJSON("data",
    function(data){
      state = data;
      updateMap();
      updateTelemetryDisplay();
      last_state_update_time = new Date().getTime();
      updateMap();
    });
  var now = (new Date()).getTime();
  if (now - last_state_update_time > 5000) {
    $("#t_link").html('<span class="link error">ERROR</span>');
  } else if (now - last_state_update_time > 1000) {
    $("#t_link").html('<span class="link slow">SLOW</span>');
  } else {
    $("#t_link").html('<span class="link ok">OK</span>');
  }
}


function updateMap() {
  var location = new MM.Location(state.lat, state.lon);
  map.setCenter(location);
}


function updateTelemetryDisplay() {
  $("#t_lat").html(state.lat);
  $("#t_lon").html(state.lon);
  $("#t_alt").html(state.alt.toPrecision(4));
  $("#t_gspd").html(state.groundspeed.toPrecision(3));
  $("#t_aspd").html(state.airspeed.toPrecision(3));
  $("#t_thrd").html(state.throttle.toPrecision(3));
  $("#t_hdg").html(state.heading)
  now = new Date().getTime();
  $("#t_fps").html((1000.0 / (now - last_state_update_time)).toPrecision(3));

  
  rotate_drone(state.heading)
  trail_plotter.update();
  marker_clip.setMarkerLocation(0, new MM.Location(state.lat, state.lon));
}


function rotate_drone(deg){
  var rotate = "rotate(" + (deg) + "deg);";
  var tr = new Array(
    "transform:" + rotate,
    "-moz-transform:" + rotate,
    "-webkit-transform:" + rotate,
    "-ms-transform:" + rotate,
    "-o-transform:" + rotate
  );

  var drone = document.getElementById("drone");
  drone.setAttribute("style", tr.join(";"));
}


function updateLayer() {
  var provider;
  var layerNum = $(this).attr('value');
  console.log("Switching to layer " + layerNum);
  var bing_key = "At_H_Y9GzOU6galYJ326-Q_K3vp_FCCFOhj8wfskOEd5VMgNhdjaXKUMG7WtS2_G";
  if (layerNum == '1') {
    var style = 'AerialWithLabels';
    provider = new MM.BingProvider(bing_key, style, function(provider) { map_layer.setProvider(provider); });
  } else if (layerNum == '2') {
    var style = 'BirdseyeWithLabels';
    provider = new MM.BingProvider(bing_key, style, function(provider) { map_layer.setProvider(provider); });
  } else if (layerNum == '3') {
    var style = 'Road';
    provider = new MM.BingProvider(bing_key, style, function(provider) { map_layer.setProvider(provider); });
  } else if (layerNum == '4') {
    provider = new MM.BlueMarbleProvider();
    map_layer.setProvider(provider);
  }
}

goog.exportSymbol('Avisky.App', Avisky.App);
goog.exportSymbol('Avisky.App.prototype.start', Avisky.App.prototype.start);