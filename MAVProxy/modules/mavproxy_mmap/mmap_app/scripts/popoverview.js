goog.provide('Avisky.PopoverView');
goog.provide('Avisky.SelectionModel');


/**
 * A simple selection model.
 * @param {{selected: boolean}=} opt_properties Model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Avisky.SelectionModel = function(opt_properties) {
  goog.base(this, opt_properties);
};
goog.inherits(Avisky.SelectionModel, Backbone.Model);

/**
 * @override
 * @export
 */
Avisky.SelectionModel.prototype.defaults = function() {
  return {
    'selected': false
  };
};


/**
 * popover Backbone view.
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Avisky.PopoverView = function(properties) {
  this.template = '<div class="popover"><div class="arrow"></div>' +
        '<div class="popover-inner"><h3 class="popover-title"></h3>' +
        '<div class="popover-content"><p></p></div></div></div>';
  goog.base(this, properties);
};
goog.inherits(Avisky.PopoverView, Backbone.View);


/**
 * @override
 * @export
 */
Avisky.PopoverView.prototype.initialize = function() {
  this.$el = null;
  console.log("hello 2");
  this.btn = this.options['btn'];
  this.placement = this.options['placement'] || 'bottom';
  this.delegate = this.options['delegate'];
  this.selectionModel = new Avisky.SelectionModel();
  this.radioBtnController = this.options['radioBtnController'];

  this.selectionModel.bind('change', this.onSelectionChange_, this);
  console.log(this.btn)
  this.btn.$el.click(
      goog.bind(this.radioBtnController.onButtonClick,
                this.radioBtnController, this));
};

Avisky.PopoverView.prototype.select = function () {
  this.selectionModel.set('selected', true);
};

Avisky.PopoverView.prototype.deselect = function () {
  this.selectionModel.set('selected', false);
};

Avisky.PopoverView.prototype.selected = function () {
  return this.selectionModel.get('selected');
};
/**
 * Handles selection change.
 */
Avisky.PopoverView.prototype.onSelectionChange_ = function() {
  console.log("hello 3");
  if (this.selectionModel.get('selected')) {
    this.createElement();
    var inner = this.$el.find('.popover-inner');
    this.delegate.popoverCreated(inner);
  } else {
    this.delegate.popoverDestroyed();
    this.destroyElement();
  }
};

Avisky.PopoverView.prototype.createElement= function () {
  console.log("hello 4");
  this.$el = $(this.template);
  this.$el.removeClass('fade top bottom left right in');
  this.$el
    .remove()
    .css({ top: 0, left: 0, display: 'block' })
    .appendTo(document.body);

  this.$el
    .css(this.placementStyle(this.placement))
    .addClass(this.placement)
    .addClass('in');
};

Avisky.PopoverView.prototype.placementStyle = function (placement) {
  var pos = $.extend({}, this.btn.$el.offset(),
      { width: this.btn.$el[0].offsetWidth,
        height: this.btn.$el[0].offsetHeight
      });
  var actualWidth = this.$el[0].offsetWidth;
  var actualHeight = this.$el[0].offsetHeight;
  switch (placement) {
    case 'bottom':
      return {top: pos.top + pos.height,
        left: pos.left + pos.width / 2 - actualWidth / 2};
    case 'top':
      return {top: pos.top - actualHeight,
        left: pos.left + pos.width / 2 - actualWidth / 2};
    case 'left':
      return {top: pos.top + pos.height / 2 - actualHeight / 2,
        left: pos.left - actualWidth};
    case 'right':
      return {top: pos.top + pos.height / 2 - actualHeight / 2,
        left: pos.left + pos.width};
  }
};

Avisky.PopoverView.prototype.destroyElement = function () {
  if (this.$el) {
    this.$el.remove();
  }
};
