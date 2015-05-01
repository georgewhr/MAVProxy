goog.provide('Avisky.RadioButtonPopoverView');


/**
 * A radio button popover view.
 * @param {Object} properties View properties.
 * @constructor
 * @extends {Backbone.View}
 */
Avisky.RadioButtonPopoverView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Avisky.RadioButtonPopoverView, Backbone.View);


/**
 * @override
 * @export
 */
Avisky.RadioButtonPopoverView.prototype.initialize = function() {
  /* create child views with the given prototypes and this object as
   * the parent controller. children will connect their click handlers
   * to onButtonClick in initialize. */
   console.log("RadioButtonPopoverView initialized");
  var prototypes = this.options['popovers'];
  var self = this;
  this.popoverViews = goog.array.map(prototypes, function (proto) {
    goog.object.extend(proto, {'radioBtnController': self });
    return new Avisky.PopoverView(proto);
  });
};

/**
 * Handles button clicks.
 * @param {number} btnindex The button index.
 * @private
 */
Avisky.RadioButtonPopoverView.prototype.onButtonClick = function( clickedview ) {
  var selected = clickedview.selected();
  if (selected) {
    /* delselect this popover */
      console.log("button selected ");
    clickedview.deselect();
  } else {
    console.log("button not selected");
    /* deselect other popovers, then select this one. */
    goog.array.map(this.popoverViews, function(childview) {
      if (childview.selected()) {
        childview.deselect();
       }
    });
    clickedview.select();
  }
};


