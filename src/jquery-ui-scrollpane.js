(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

/*!
 * jQuery UI ScrollPane 0.9.1
 * https://github.com/borgboyone/jQuery-UI-ScrollPane
 *
 * Copyright 2017 Anthony Wells
 * Released under the MIT license.
 * https://raw.githubusercontent.com/borgboyone/jQuery-UI-ScrollPane/master/LICENSE
 *
 * http://borgboyone.github.io/jQuery-UI-ScrollPane/
 */

var scrollPane = $.widget('aw.scrollPane', {
	version: '1.0.0',
	options: {
		maintainInitialScrollPosition: true,
		innerPaneClasses: 'ui-scrollpane-fullwidth ui-scrollPane-autoheight',
		events: ['mouse', 'wheel'], // string or array of 'mouse', 'wheel', 'touch', 'keyboard'
		animate: true,
		scroll: undefined, //callback function for scroll events
		wheelStep: 0.2,
		verticalScrollBar: {
			position: 'right',
			visiblity: 'auto',
			showArrows: 'hidden', //arrows: 'visible', 'hidden'
			arrowAlignment: 'ends', // 'start', 'end'
			arrowStep: 0.125,
			handleMinimumSize: 0.1, // allow px and %
			handleMaximumSize: undefined,
		//	handleStep: 0.8, (this would be specific to the scrollbar widget)
			pageStep: 0.9,
			arrowClassIcons: {start: 'ui-icon ui-icon-triangle-1-n', end: 'ui-icon ui-icon-triangle-1-s'}
		},
		horizontalScrollBar: {
			position: 'bottom',
			visiblity: 'auto', // 'always', 'never'
			showArrows: 'hidden', //arrows: 'visible', 'hidden'
			arrowAlignment: 'ends', // 'start', 'end'
			arrowStep: 0.125,
			handleMinimumSize: 0.1,
			handleMaximumSize: undefined,
		//	handleStep: 0.8,
			pageStep: 0.9,
			arrowClassIcons: {start: 'ui-icon ui-icon-triangle-1-w', end: 'ui-icon ui-icon-triangle-1-e'}
		}
	},
	_create: function() {
		this._super();
		if (this.options.maintainInitialScrollPosition === true) {
			this.currentHorizontalScrollPosition = this.element.scrollLeft();
			this.currentVerticalScrollPosition = this.element.scrollTop();
		} else {
			this.currentHorizontalScrollPosition = this.currentVerticalScrollPosition = 0;
		}

		var $outerPanel = this.element,
			outerPanelWidth = this.outerPanelWidth = $outerPanel.width(), // this is inner width
			outerPanelHeight = this.outerPanelHeight = $outerPanel.height(); // this is inner height
		// store element property based styles here for recovery in destroy
		this.oldPosition = $outerPanel.prop('style')['position'] ? $outerPanel.prop('style')['position'] : '';
		this.oldOverflow = $outerPanel.prop('style')['overflow'] ? $outerPanel.prop('style')['overflow'] : '';

		$outerPanel
			.wrapInner('<div class="ui-scrollpane-wrapper" style="position: absolute; overflow: hidden; width: ' + this.outerPanelWidth + 'px; height: ' + this.outerPanelHeight + 'px;"><div class="ui-scrollpane-inner ui-scrollable-area ' + this.options.innerPaneClasses + '" style="position: absolute;">')
			.append('<div class="ui-scrollpane-scrollbar ui-scrollpane-scrollbar-vertical ui-scrollbar ui-scrollbar-vertical ui-helper-hidden" style="position: absolute;">' +
				'<div class="ui-scrollpane-scrollbar-vertical-arrow-up ui-scrollbar-arrow ui-scrollbar-arrow-start' + (this.options.verticalScrollBar.showArrows == 'visible' ? '' : ' ui-helper-hidden') + '"><span class="' + this.options.verticalScrollBar.arrowClassIcons['start'] + '"></span></div>' +
				'<div class="ui-scrollpane-scrollbar-vertical-track ui-scrollbar-track"><div class="ui-scrollpane-scrollbar-vertical-track-scrollhandle ui-scrollbar-scrollhandle"></div></div>' +
				'<div class="ui-scrollpane-scrollbar-vertical-arrow-down ui-scrollbar-arrow ui-scrollbar-arrow-end' + (this.options.verticalScrollBar.showArrows == 'visible' ? '' : ' ui-helper-hidden') + '"><span class="' + this.options.verticalScrollBar.arrowClassIcons['end'] + '"></span></div></div>')
			.append('<div class="ui-scrollpane-scrollbar ui-scrollpane-scrollbar-horizontal ui-scrollbar ui-scrollbar-horizontal ui-helper-hidden" style="position: absolute;">' +
				'<div class="ui-scrollpane-scrollbar-horizontal-arrow-left ui-scrollbar-arrow ui-scrollbar-arrow-start' + (this.options.horizontalScrollBar.showArrows == 'visible' ? '' : ' ui-helper-hidden') + '"><span class="' + this.options.horizontalScrollBar.arrowClassIcons['start'] + '"></span></div>' +
				'<div class="ui-scrollpane-scrollbar-horizontal-track ui-scrollbar-track"><div class="ui-scrollpane-scrollbar-horizontal-track-scrollhandle"></div></div>' +
				'<div class="ui-scrollpane-scrollbar-horizontal-arrow-right ui-scrollbar-arrow ui-scrollbar-arrow-end' + (this.options.horizontalScrollBar.showArrows == 'visible' ? '' : ' ui-helper-hidden') + '"><span class="' + this.options.horizontalScrollBar.arrowClassIcons['end'] + '"></span></div></div>')
			.addClass('ui-scrollpane ui-scrollable')
			.css({'position': ($outerPanel.css('position') == 'absolute' ? 'absolute' : 'relative'), 'overflow': 'hidden'})
			.data('ui-scrollable', this);

		var $innerPanel = this.$innerPanel = $outerPanel.find('.ui-scrollpane-inner'),
			innerPanelWidth = $innerPanel.outerWidth(),
			innerPanelHeight = $innerPanel.outerHeight();

		if (this.options.maintainInitialScrollPosition === true) {
			var temp;
			// if this.currentVerticalScrollPosition > 0, then innerPanelHeight - outerPanelHeight should be greater than 0
			// but as a saftey, check again after adding the wrapper
			if (this.currentVerticalScrollPosition > 0) {
				temp = Math.max(innerPanelHeight - outerPanelHeight, 0);
				this.currentVerticalScrollPosition = temp > 0 ? Math.min(this.currentVerticalScrollPosition / temp, 1) : 0;
			}
			if (this.currentHorizontalScrollPosition > 0) {
				temp = Math.max(innerPanelWidth - outerPanelWidth, 0);
				this.currentHorizontalScrollPosition = temp > 0 ? Math.min(this.currentHorizontalScrollPosition / temp, 1) : 0;
			}
		}

		this.verticalScrollBarVisible = this.horizontalScrollBarVisible = false;

		// add event listeners
		this._events();

		// let's do this
		this._update(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, outerPanelWidth, outerPanelHeight);
	},
	_verticalScrollBarWidth: function () {
		if (this.options.verticalScrollBar.visiblity == 'never') return 0;
		var	$scrollbar = this.element.find('.ui-scrollpane-scrollbar-vertical').clone().css({'position': 'absolute', 'visiblity': 'hidden'}).removeClass('ui-helper-hidden').appendTo('body'),
			width = $scrollbar.outerWidth();
		$scrollbar.remove();
		return width;
	},
	_horizontalScrollBarHeight: function () {
		if (this.options.horizontalScrollBar.visiblity == 'never') return 0;
		var	$scrollbar = this.element.find('.ui-scrollpane-scrollbar-horizontal').clone().css({'position': 'absolute', 'visiblity': 'hidden'}).removeClass('ui-helper-hidden').appendTo('body'),
			height = $scrollbar.outerHeight();
		$scrollbar.remove();
		return height;
	},
	_events: function() {
		// FIXME: initialize per options
		var $outerPanel = this.element,
			$innerPanel = this.$innerPanel,
			$wrapper = $outerPanel.find('> .ui-scrollpane-wrapper'),
			that = this;

		this._on($outerPanel.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle, .ui-scrollpane-scrollbar-horizontal-track-scrollhandle'), {
			click: function(event) {
				event.preventDefault();
				event.stopPropagation();
			}
		});
		this._on($outerPanel.find('.ui-scrollpane-scrollbar-vertical-track'), {
			'click': function(event) {
				event.preventDefault();
				event.stopPropagation();
				var wrapperHeight = $wrapper.outerHeight(),
					delta = wrapperHeight * this.options.verticalScrollBar.pageStep;

				// CONSIDER: safety bounds check event.outsetY should stopPropagation on handle not work
				if (!(event.offsetY > $outerPanel.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle').position().top)) {
					delta = -delta;
				}

				this._verticalPosition(-$innerPanel.position().top + delta, event);
			}
		});
		// FIXME: clean-up and reorganize, if possible
		var mouseDownTimer = null,
			timerFunction = null,
			verticalScrollBarArrowHandler = function(event) {
				var wrapperHeight = $wrapper.outerHeight(),
					delta = wrapperHeight * that.options.verticalScrollBar.arrowStep;

				if ($(event.target).closest('.ui-scrollbar-arrow').hasClass('ui-scrollbar-arrow-start')) {
					delta = -delta;
				}

				that._verticalPosition(-$innerPanel.position().top + delta, event);
			},
			horizontalScrollBarArrowHandler = function(event) {
				var wrapperWidth = $wrapper.outerWidth(),
					delta = wrapperWidth * that.options.horizontalScrollBar.arrowStep;

				if ($(event.target).closest('.ui-scrollbar-arrow').hasClass('ui-scrollbar-arrow-start')) {
					delta = -delta;
				}

				that._horizontalPosition(-$innerPanel.position().left + delta, event);
			};
		if (this.options.verticalScrollBar.showArrows == 'visible') {
			this._on($outerPanel.find('.ui-scrollpane-scrollbar-vertical .ui-scrollbar-arrow'), {
				'mousedown': function(event) {
					event.preventDefault();
					event.stopPropagation();

					verticalScrollBarArrowHandler(event);
					mouseDownTimer = window.setTimeout(timerFunction = 
						(function(event, that) {
							var timerFunction = function() {
								verticalScrollBarArrowHandler(event);
								if (!((that.currentVerticalScrollPosition == 0) || (that.currentVerticalScrollPosition == 1))) {
									mouseDownTimer = window.setTimeout(timerFunction, 150);
								}
							};
							return timerFunction;
						})(event, that), 250);
						this._on( this.document, {
							mouseup: function(event) {
								if (mouseDownTimer !== null) {
									clearTimeout(mouseDownTimer); // this may not be needed with mouseout/enter
									mouseDownTimer = null;
									this._off( this.document );
								}
							}
						});
				},
				'mouseup': function(event) {
					event.preventDefault();
					event.stopPropagation();
					if (mouseDownTimer !== null) {
						clearTimeout(mouseDownTimer);
						mouseDownTimer = null;
						this._off( this.document );
					}
				},
				'mouseout': function(event) {
					if ((mouseDownTimer !== null) && (!(mouseDownTimer instanceof jQuery))) {
						clearTimeout(mouseDownTimer);
						mouseDownTimer = $(event.target);
					}
				},
				'mouseenter': function(event) {
					if (mouseDownTimer !== null) {
						if ($(event.target).is(mouseDownTimer)) {
							timerFunction();
							//window.setTimeout(timerFunction, 150);
						}
					}
				}
			});
		}
		$outerPanel.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle').draggable({
			axis: 'y',
			containment: $outerPanel.find('.ui-scrollpane-scrollbar-vertical-track'),
			start: function(event, ui) {
				$(this).data('ui-draggable').scrollParent = $outerPanel.find('.ui-scrollpane-scrollbar-vertical');
			},
			drag: function(event, ui) {
				var wrapperHeight = $wrapper.outerHeight(),
					innerPanelHeight = $innerPanel.outerHeight(),
					trackHeight = $outerPanel.find('.ui-scrollpane-scrollbar-vertical .ui-scrollpane-scrollbar-vertical-track').height(),
					scrollHandleHeight = $outerPanel.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle').outerHeight(),
					delta = ui.position.top == 0 ? 0 : (ui.position.top / (trackHeight - scrollHandleHeight));

					that._verticalPosition(delta * (innerPanelHeight - wrapperHeight), event);
			}
		});
		this._on($outerPanel.find('.ui-scrollpane-scrollbar-horizontal-track'), {
			'click': function(event) {
				event.preventDefault();
				event.stopPropagation();
				var wrapperWidth = $wrapper.outerWidth(),
					delta = wrapperWidth * this.options.horizontalScrollBar.pageStep,
					$innerPanel = $outerPanel.find('.ui-scrollpane-inner');

				// CONSIDER: safety bounds check event.outsetX should stopPropagation not work
				if (!(event.offsetX > $outerPanel.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle').position().left)) {
					delta = -delta;
				}

				this._horizontalPosition(-$innerPanel.position().left + delta, event);
			}
		});
		if (this.options.horizontalScrollBar.showArrows == 'visible') {
			this._on($outerPanel.find('.ui-scrollpane-scrollbar-horizontal .ui-scrollbar-arrow'), {
				'mousedown': function(event) {
					event.preventDefault();
					event.stopPropagation();

					horizontalScrollBarArrowHandler(event);
					mouseDownTimer = window.setTimeout(timerFunction = 
						(function(event, that) {
							var timerFunction = function() {
								horizontalScrollBarArrowHandler(event);
								if (!((that.currentHorizontalScrollPosition == 0) || (that.currentHorizontalScrollPosition == 1))) {
									mouseDownTimer = window.setTimeout(timerFunction, 150);
								}
							};
							return timerFunction;
						})(event, that), 250);
						this._on( this.document, {
							mouseup: function(event) {
								if (mouseDownTimer !== null) {
									clearTimeout(mouseDownTimer); // this may not be needed with mouseout/enter
									mouseDownTimer = null;
									this._off( this.document );
								}
							}
						});
				},
				'mouseup': function(event) {
					event.preventDefault();
					event.stopPropagation();
					if (mouseDownTimer !== null) {
						clearTimeout(mouseDownTimer);
						mouseDownTimer = null;
						this._off( this.document );
					}
				},
				'mouseout': function(event) {
					if ((mouseDownTimer !== null) && (!(mouseDownTimer instanceof jQuery))) {
						clearTimeout(mouseDownTimer);
						mouseDownTimer = $(event.target);
					}
				},
				'mouseenter': function(event) {
					if (mouseDownTimer !== null) {
						if ($(event.target).is(mouseDownTimer)) {
							timerFunction();
							//window.setTimeout(timerFunction, 150);
						}
					}
				}
			});
		}
		$outerPanel.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle').draggable({
			axis: 'x',
			containment: $outerPanel.find('.ui-scrollpane-scrollbar-horizontal-track'),
			drag: function(event, ui) {
				var wrapperWidth = $wrapper.outerWidth(),
					innerPanelHeight = $innerPanel.outerHeight(),
					trackWidth = $outerPanel.find('.ui-scrollpane-scrollbar-horizontal .ui-scrollpane-scrollbar-horizontal-track').width(),
					scrollHandleWidth = $outerPanel.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle').outerWidth(),
					delta = ui.position.left == 0 ? 0 : (ui.position.left / (trackWidth - scrollHandleWidth));

					that._horizontalPosition(delta * (innerPanelWidth - wrapperWidth), event);
			}
		});
		this._on($wrapper, {
			'mousewheel': function(event, delta, deltaX, deltaY) {
				// FIXME: add check for delta, deltaX, deltaY, if (deltaY != 0 || delta != 0) delta = deltaY == 0 ? delta : deltaY;
				var position;
				if (event.deltaFactor) {
					position = -$innerPanel.position().top + (-deltaY * event.deltaFactor);
				} else {
					position = ((-deltaY * this.options.wheelStep) + this.currentVerticalScrollPosition) * ($innerPanel.outerHeight() - $wrapper.outerHeight());
				}
				this._verticalPosition(position, event);
			}
		});
		// CONSIDER: whole scrollbar
		this._on($outerPanel.find('.ui-scrollpane-scrollbar-vertical-track'), {
			'mousewheel': function (event, delta, deltaX, deltaY) {
				event.stopPropagation();
				// TODO: save as regular mousewheel except force deltaX to 0
			}
		});
	},
	_verticalPosition: function(position, event) {
		// must have vertical scroll bar showing and FIXME: active
		if (!this.verticalScrollBarVisible) return;
		var $outerPanel = this.element,
			wrapperHeight = $outerPanel.find('> .ui-scrollpane-wrapper').outerHeight(),
			$innerPanel = this.$innerPanel,
			innerPanelHeight = $innerPanel.outerHeight(),
			innerPanelTop = this._constrain(position, 0, innerPanelHeight - wrapperHeight); // this can problaby be merged with this.cvsp below; should not be called innerPanelTop but reflect incoming value

		// if innerPanelTop is not changed then exit
		if (innerPanelTop == -$innerPanel.position().top) return;

		this.currentVerticalScrollPosition = innerPanelTop == 0 ? 0 : innerPanelTop / (innerPanelHeight - wrapperHeight);

		var $track = $outerPanel.find('.ui-scrollpane-scrollbar-vertical-track'),
			$scrollHandle = $track.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle');

		$scrollHandle.css('top', ($track.height() - $scrollHandle.outerHeight()) * this.currentVerticalScrollPosition); // = scrollHandleTop

		if (this.options.animate === true) {
			$innerPanel.finish().animate({'top': -innerPanelTop}, 'fast');
		} else {
			$innerPanel.css('top', -innerPanelTop);
		}

		this._updateVerticalArrows();
		if (event) this._trigger('scroll', event, {'axis': 'y', 'scrollY': innerPanelTop, 'scrollX': undefined});
	},
	_horizontalPosition: function(position, event) {
		// must have horizontal scroll bar showing and FIXME: active
		if (!this.horizontalScrollBarVisible) return;

		// if innerPanelLeft is not changed then exit
		var $outerPanel = this.element,
			wrapperWidth = $outerPanel.find('> .ui-scrollpane-wrapper').outerWidth(),
			$innerPanel = this.$innerPanel,
			innerPanelWidth = $innerPanel.outerWidth(),
			innerPanelLeft = this._constrain(position, 0, innerPanelWidth - wrapperWidth);

		if (innerPanelLeft == -$innerPanel.position().left) return;

		this.currentHorizontalScrollPosition = innerPanelLeft == 0 ? 0 : innerPanelLeft / (innerPanelWidth - wrapperWidth);

		var $track = $outerPanel.find('.ui-scrollpane-scrollbar-horizontal-track'),
			$scrollHandle = $track.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle');

		$scrollHandle.css('left', ($track.width() - $scrollHandle.outerWidth()) * this.currentHorizontalScrollPosition); // = scrollHandleLeft

		if (this.options.animate === true) {
			$innerPanel.finish().animate({'left': -innerPanelLeft}, 'fast');
		} else {
			$innerPanel.css('left', -innerPanelLeft);
		}

		this._updateHorizontalArrows();
		if (event) this._trigger('scroll', event, {'axis': 'y', 'scrollY': undefined, 'scrollX': innerPanelLeft});
	},
	_updateVerticalArrows() {
		var $outerPanel = this.element;

		if (this.options.verticalScrollBar.showArrows === 'visible') {
			$outerPanel.find('.ui-scrollpane-scrollbar-vertical .ui-scrollbar-arrow-start').toggleClass('ui-state-disabled', this.currentVerticalScrollPosition == 0);
			$outerPanel.find('.ui-scrollpane-scrollbar-vertical .ui-scrollbar-arrow-end').toggleClass('ui-state-disabled', this.currentVerticalScrollPosition == 1);
		}
	},
	_updateHorizontalArrows() {
		var $outerPanel = this.element;

		if (this.options.horizontalScrollBar.showArrows === 'visible') {
			$outerPanel.find('.ui-scrollpane-scrollbar-horizontal .ui-scrollbar-arrow-start').toggleClass('ui-state-disabled', this.currentHorizontalScrollPosition == 0);
			$outerPanel.find('.ui-scrollpane-scrollbar-horizontal .ui-scrollbar-arrow-end').toggleClass('ui-state-disabled', this.currentHorizontalScrollPosition == 1);
		}
	},
	refresh: function() {
		var $outerPanel = this.element,
			outerPanelWidth = $outerPanel.width(), // this is inner width
			outerPanelHeight = $outerPanel.height(), // this is inner height
			outerChanged = (this.outerPanelWidth !== outerPanelWidth) || (this.outerPanelHeight !== outerPanelHeight),
			$innerPanel = this.$innerPanel,
			innerPanelWidth,
			innerPanelHeight,
			innerChanged;

		if (outerChanged) {
			// update wrapper size first
			var wrapperWidth = outerPanelWidth - this.isShowingVerticalScrollBar() ? widthofit : 0,
				wrapperHeight = outerPanelHeight - this.isShowingHorizontalScrollBar() ? heightofit : 0;
			$outerPanel.find('jquery-ui-scrollpane-wrapper').css({'width': wrappWidth, 'height': wrapperHeight});
			// CONSIDER: might have to create an immediate delay function to call the rest of this to ensure propagation of the width and height change on the wrapper
		}

		// get innerPanel sizes after updating wrapper
		innerPanelWidth = $innerPanel.outerWidth(),
		innerPanelHeight = $innerPanel.outerHeight(),
		innerChanged = (this.innerPanelWidth !== innerPanelWidth) || (this.innerPaneHeight !== innerPaneHeight);
		if (outerChanged || innerChanged) {
			// save changed values (outerPanel here) or potentially do it in _update with innerPanel
			this.outerPanelWidth = outerPanelWidth;
			this.outerPanelHeight = outerPanelHeight;
			this._update(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight);
		}
	},
	_isNeededVerticalScrollBar: function(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight) {
		return outerPanelHeight - (outerPanelWidth < innerPanelWidth ? this._horizontalScrollBarHeight : 0) < innerPanelHeight;
	},
	_isNeededHorizontalScrollBar: function(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight) {
		// secondary to _isNeededVerticalScrollBar
		return wrapperWidth < innerPanelWidth;
	},
	_update: function(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight) {
		// FIXME: don't user outerPanelHeight and Width but wrapperHeight and Width for view sizing calculations
		var $outerPanel = this.element,
			$innerPanel = this.$innerPanel,
			$wrapper = $outerPanel.find('> .ui-scrollpane-wrapper');

		// is vertical still needed (or forced, just do auto for now)
		var verticalScrollBarVisible/*Needed*/ = this._isNeededVerticalScrollBar(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight); //<= use apply?  How to handle needed verses visible!
		//verticalScrollBarVisible = this._isVisibleVerticalScrollBar(verticalScrollBarNeeded);

		// adjust wrapperWidth immediately, but only if needed and reget innerPanelWidth and Height if changed and save
		if (verticalScrollBarVisible !== this.verticalScrollBarVisible) {
			wrapperWidth = outerPanelWidth - (verticalScrollBarVisible ? this._verticalScrollBarWidth() : 0);
			$wrapper.css('width', wrapperWidth);
			innerPanelWidth = $innerPanel.outerWidth();
			innerPanelHeight = $innerPanel.outerHeight();
		}

		// save changed values (innerPanel here)
		this.innerPanelWidth = innerPanelWidth;
		this.innerPanelHeight = innerPanelHeight;

		var horizontalScrollBarVisible = this._isNeededHorizontalScrollBar(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight);
		if (horizontalScrollBarVisible !== this.horizontalScrollBarVisible) {
			// CONSIDER: would this ever cause a change in the $innerPanel size???
			wrapperHeight = outerPanelHeight - (horizontalScrollBarVisible ? this._horizontalScrollBarHeight() : 0);
			$wrapper.css('height', wrapperHeight);
		}

		if (verticalScrollBarVisible) { //(outerPanelHeight < innerPanelHeight) {
			var verticalRatio = innerPanelHeight / outerPanelHeight;

			this._updateVerticalArrows();

			// set location and size on scrollbar before making visible and getting trackWidth
			$outerPanel.find('.ui-scrollpane-scrollbar-vertical').css({'left': wrapperWidth, 'width': this._verticalScrollBarWidth(), 'height': wrapperHeight});
			// make visible as appropriate
			if (!this.verticalScrollBarVisible) {
				$outerPanel.find('.ui-scrollpane-scrollbar-vertical').removeClass('ui-helper-hidden');
			}
			var trackHeight = $outerPanel.find('.ui-scrollpane-scrollbar-vertical .ui-scrollpane-scrollbar-vertical-track').height(), // inner height
				scrollHandleHeight = this._constrain(Math.ceil(1 / verticalRatio * trackHeight), this.options.verticalScrollBar.handleMinimumSize, Math.min(typeof this.options.verticalScrollBar.handleMaximumSize === 'undefined' ? trackHeight : this.options.verticalScrollBar.handleMaximumSize, trackHeight)),
				// bar drag/handle top here
				scrollHandleTop =  (trackHeight - scrollHandleHeight) * this.currentVerticalScrollPosition; //verticalRatio; // Offset or Start

			// update scrollbar scrollhandle
			$outerPanel.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle').css({'top': scrollHandleTop, 'height': scrollHandleHeight});
		} else {
			$outerPanel.find('.ui-scrollpane-scrollbar-vertical').addClass('ui-helper-hidden');
			this.currentVerticalScrollPosition = 0;
		}
		this.verticalScrollBarVisible = verticalScrollBarVisible;

		if (horizontalScrollBarVisible) {
			var horizontalRatio = innerPanelWidth / outerPanelWidth;

			this._updateHorizontalArrows();

			// set location and size on scrollbar before making visible and getting trackHeight
			$outerPanel.find('.ui-scrollpane-scrollbar-horizontal').css({'top': wrapperHeight, 'width': wrapperWidth, 'height': this._horizontalScrollBarHeight()});
			// make visible as appropriate
			if (!this.horizontalScrollBarVisible) {
				$outerPanel.find('.ui-scrollpane-scrollbar-horizontal').removeClass('ui-helper-hidden');
			}
			var trackWidth = $outerPanel.find('.ui-scrollpane-horizontal-scrollbar .ui-scrollpane-scrollbar-horizontal-track').width(), // inner width
				scrollHandleWidth = this._constrain(Math.ceil(1 / horizontalRatio * trackWidth), this.options.horizontalScrollBar.handleMinimumSize, Math.min(typeof this.options.horizontalScrollBar.handleMaximumSize === 'undefined' ? trackWidth : this.options.HorizontalScrollBar.handleMaximumSize, trackWidth)),
				// bar drag/handle top here
				scrollHandleLeft = (trackWidth - scrollHandleWidth) * this.currentHorizontalScrollPosition;

			// update scrollbar scrollhandle
			$outerPanel.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle').css({'left': scrollHandleLeft, 'width': scrollHandleWidth});
		} else {
			if (this.horizontalScrollBarVisible) {
				$outerPanel.find('.ui-scrollpane-scrollbar-horizontal').addClass('ui-helper-hidden');
				this.currentHorizontalScrollPosition = 0;
			}
		}
		this.horizontalScrollBarVisible = horizontalScrollBarVisible;
		
		// CONSIDER: should this be wrapper instead of outerPanel?
		$innerPanel.css({'left': Math.floor(this.currentHorizontalScrollPosition * (outerPanelWidth - innerPanelWidth)), 'top': Math.floor(this.currentVerticalScrollPosition * (outerPanelHeight - innerPanelHeight))});
	},
	_constrain: function(value, min, max) {
		if (value < min) {
			return min;
		} else if (value > max) {
			return max;
		}
		return value;
	},
	_destroy: function() {
		this.element
			.removeData('ui-scrollable')
			.css({'overflow': this.oldOverflow, 'position': this.oldPosition})
			.removeClass('ui-scrollpane ui-scrollable')
			.remove('.ui-scrollpane-scrollbar')
			.find('.ui-scrollpane-inner').unwrap().contents().unwrap();
		this._super();
	},

	/** scrollable related function **/
	inScrollableArea: function(element) {
		return this.element.find('.ui-scrollable-area').has(element).length > 0;
	},
	scrollTop: function(value) {
		if (typeof value === 'undefined') {
			return -this.element.find('.ui-scrollable-area').position().top;
		} else {
			this._verticalPosition(value);
		}
	},
	scrollLeft: function(value) {
		if (typeof value === 'undefined') {
			return -this.element.find('.ui-scrollable-area').position().left;
		} else {
			this._horizontalPosition(value);
		}
	},
	scrollHeight: function() {
		return this.$innerPanel.outerHeight();
	},
	scrollWidth: function() {
		return this.$innerPanel.outerWidth();
	}
});

}));
