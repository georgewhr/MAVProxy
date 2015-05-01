goog.provide('Avisky.FlightStatusPopoverViewDelegate');
goog.provide('Avisky.FlightStatusButtonView');


Avisky.FlightStatusButtonView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Avisky.FlightStatusButtonView, Backbone.View);


Avisky.FlightStatusPopoverViewDelegate = function(properties) {

  this.popoverTitle = 'Flight Status';
  goog.base(this, properties);
};
goog.inherits(Avisky.FlightStatusPopoverViewDelegate , Backbone.View);


Avisky.FlightStatusButtonView.prototype.initialize = function() {
  console.log("hello FlightStatusButtonView initialized");

};
Avisky.FlightStatusPopoverViewDelegate.prototype.initialize = function() {
	console.log("hello FlightStatusButtonViewDelegate initialized");
  /*var mavlink = this.options['mavlinkSrc'];
  this.gps = mavlink.subscribe('GPS_RAW_INT', this.render, this);
  this.stat = mavlink.subscribe('GPS_STATUS', this.render, this);*/
};

Avisky.FlightStatusPopoverViewDelegate.prototype.popoverCreated = function(el) {
	console.log("FlightStatusButtonViewDelegate.prototype.popoverCreated");
  this.$el = el;
  this.$el.find('.popover-title').text(this.popoverTitle);
  this.$el.find('.popover-content').text(this.popoverContent);
  this.render();
};

Avisky.FlightStatusPopoverViewDelegate.prototype.popoverDestroyed = function() {
  this.$el = null;
};

Avisky.FlightStatusPopoverViewDelegate.prototype.render = function() {
  if (this.$el) {
    //var stat = this.stat.toJSON();
    var stat = 19
    var lat = 0;
    var lon = 0;
    var visible = 3;

    var content = '';
    //if ('satellites_visible' in stat) {
      //var visible = stat['satellites_visible'].toString();
      content += ('Satellites: ' + visible +
                  '<br /> Coordinates: ' + lat + ', ' + lon);
   // }

    /*var eph = this.gps.get('eph');
    if (typeof eph != 'undefined' && eph != 65535) {
      content += ('<br />HDOP: ' + (eph / 100).toFixed(2) + 'm');
    }
    var epv = this.gps.get('epv');
    if (typeof epv != 'undefined' && epv != 65535) {
      content += ('<br />VDOP: ' + (epv / 100).toFixed(2) + 'm');
    }*/
    this.$el.find('.popover-content').html(content);
  }
};