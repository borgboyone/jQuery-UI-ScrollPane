( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

/*!
 * jQuery UI ScrollPane 1.0.0
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
		events: ['mouse', 'wheel', 'keyboard'], // string or array of 'mouse', 'wheel', 'touch', 'keyboard'
		animate: true,
		scroll: null, //callback function for scroll events
		wheelStep: 0.2,
		verticalScrollBar: {
			position: 'right',
			visiblity: 'auto', // 'always', 'never'
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
		this.oldTabIndex = $outerPanel.attr('tabindex');

		$outerPanel
			.wrapInner('<div class="ui-scrollpane-wrapper" style="position: absolute; overflow: hidden; width: ' + this.outerPanelWidth + 'px; height: ' + this.outerPanelHeight + 'px;"><div class="ui-scrollpane-inner ui-scrollable-area ' + this.options.innerPaneClasses + '">')
			.append('<div class="ui-scrollpane-scrollbar ui-scrollpane-scrollbar-vertical ui-scrollbar ' + (this.options.verticalScrollBar.arrowAlignment == 'start' ? 'ui-scrollbar-arrows-start' : (this.options.verticalScrollBar.arrowAlignment == 'end' ? 'ui-scrollbar-arrows-end' : 'ui-scrollbar-arrows-ends')) + ' ui-scrollbar-vertical ui-helper-hidden ui-state-disabled" style="position: absolute;">' +
				'<div class="ui-scrollpane-scrollbar-vertical-arrow-up ui-scrollbar-arrow ui-scrollbar-arrow-start' + (this.options.verticalScrollBar.showArrows == 'visible' ? '' : ' ui-helper-hidden') + ' ui-state-disabled"><span class="' + this.options.verticalScrollBar.arrowClassIcons['start'] + '"></span></div>' +
				'<div class="ui-scrollpane-scrollbar-vertical-track ui-scrollbar-track ui-state-disabled"><div class="ui-scrollpane-scrollbar-vertical-track-scrollhandle ui-scrollbar-track-scrollhandle"></div></div>' +
				'<div class="ui-scrollpane-scrollbar-vertical-arrow-down ui-scrollbar-arrow ui-scrollbar-arrow-end' + (this.options.verticalScrollBar.showArrows == 'visible' ? '' : ' ui-helper-hidden') + ' ui-state-disabled"><span class="' + this.options.verticalScrollBar.arrowClassIcons['end'] + '"></span></div></div>')
			.append('<div class="ui-scrollpane-scrollbar ui-scrollpane-scrollbar-horizontal ui-scrollbar ' + (this.options.horizontalScrollBar.arrowAlignment == 'start' ? 'ui-scrollbar-arrows-start' : (this.options.horizontalScrollBar.arrowAlignment == 'end' ? 'ui-scrollbar-arrows-end' : 'ui-scrollbar-arrows-ends')) + ' ui-scrollbar-horizontal ui-helper-hidden" style="position: absolute;">' +
				'<div class="ui-scrollpane-scrollbar-horizontal-arrow-left ui-scrollbar-arrow ui-scrollbar-arrow-start' + (this.options.horizontalScrollBar.showArrows == 'visible' ? '' : ' ui-helper-hidden') + '"><span class="' + this.options.horizontalScrollBar.arrowClassIcons['start'] + '"></span></div>' +
				'<div class="ui-scrollpane-scrollbar-horizontal-track ui-scrollbar-track"><div class="ui-scrollpane-scrollbar-horizontal-track-scrollhandle ui-scrollbar-track-scrollhandle"></div></div>' +
				'<div class="ui-scrollpane-scrollbar-horizontal-arrow-right ui-scrollbar-arrow ui-scrollbar-arrow-end' + (this.options.horizontalScrollBar.showArrows == 'visible' ? '' : ' ui-helper-hidden') + '"><span class="' + this.options.horizontalScrollBar.arrowClassIcons['end'] + '"></span></div></div>')
			.addClass('ui-scrollpane ui-scrollable')
			.css({'position': ($outerPanel.css('position') == 'absolute' ? 'absolute' : 'relative'), 'overflow': 'hidden'})
			.data('ui-scrollable', this);

		var $innerPanel = this.$innerPanel = $outerPanel.find('> .ui-scrollpane-wrapper > .ui-scrollpane-inner'),
			innerPanelWidth = $outerPanel.find('> .ui-scrollpane-wrapper').get(0).scrollWidth,
			innerPanelHeight = $outerPanel.find('> .ui-scrollpane-wrapper').get(0).scrollHeight;

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

		this.$verticalScrollBar = $outerPanel.find('> .ui-scrollpane-scrollbar-vertical'),
		this.$horizontalScrollBar = $outerPanel.find('> .ui-scrollpane-scrollbar-horizontal');
		this.verticalScrollBarVisible = this.horizontalScrollBarVisible = false;
		this.verticalScrollBarNeeded = this.horizontalScrollBarNeeded = false;

		// add event listeners
		this._events();

		// let's do this
		this._update(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, outerPanelWidth, outerPanelHeight);
	},
	_verticalScrollBarWidth: function () {
		if (this.options.verticalScrollBar.visiblity == 'never') return 0;
		var	$scrollbar = this.$verticalScrollBar.clone().css({'position': 'absolute', 'visiblity': 'hidden'}).removeClass('ui-helper-hidden').appendTo('body'),
			width = $scrollbar.outerWidth();
		$scrollbar.remove();
		return width;
	},
	_horizontalScrollBarHeight: function () {
		if (this.options.horizontalScrollBar.visiblity == 'never') return 0;
		var	$scrollbar = this.$horizontalScrollBar.clone().css({'position': 'absolute', 'visiblity': 'hidden'}).removeClass('ui-helper-hidden').appendTo('body'),
			height = $scrollbar.outerHeight();
		$scrollbar.remove();
		return height;
	},
	_events: function() {
		// TODO: clean-up and reorganize, if possible
		var $outerPanel = this.element,
			$innerPanel = this.$innerPanel,
			$wrapper = $outerPanel.find('> .ui-scrollpane-wrapper'),
			$verticalScrollBar = this.$verticalScrollBar,
			$horizontalScrollBar = this.$horizontalScrollBar,
			that = this;
// mouse start
	if (($.isArray(this.options.events) && (this.options.events.indexOf('mouse') !== -1)) || this.options.events == 'mouse') {
		this._on($wrapper, {
			click: function(event) {
				event.stopPropagation();
				$outerPanel.focus();
			}
		});
		this._on($verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle').add($horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle')), {
			click: function(event) {
				event.preventDefault();
				event.stopPropagation();
			}
		});
		this._on($verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track'), {
			'click': function(event) {
				event.preventDefault();
				event.stopPropagation();
				var wrapperHeight = $wrapper.outerHeight(),
					delta = wrapperHeight * this.options.verticalScrollBar.pageStep;

				// CONSIDER: safety bounds check event.outsetY should stopPropagation on handle not work
				if (!(event.offsetY > $verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle').position().top)) {
					delta = -delta;
				}

				this._verticalPosition($wrapper.get(0).scrollTop + delta, event);
			}
		});
		var mouseDownTimer = null,
			timerFunction = null,
			verticalScrollBarArrowHandler = function(event) {
				var wrapperHeight = $wrapper.outerHeight(),
					delta = wrapperHeight * that.options.verticalScrollBar.arrowStep;

				if ($(event.target).closest('.ui-scrollbar-arrow').hasClass('ui-scrollbar-arrow-start')) {
					delta = -delta;
				}

				that._verticalPosition($wrapperPanel.get(0).scrollTop + delta, event);
			},
			horizontalScrollBarArrowHandler = function(event) {
				var wrapperWidth = $wrapper.outerWidth(),
					delta = wrapperWidth * that.options.horizontalScrollBar.arrowStep;

				if ($(event.target).closest('.ui-scrollbar-arrow').hasClass('ui-scrollbar-arrow-start')) {
					delta = -delta;
				}

				that._horizontalPosition($wrapperPanel.get().scrollLeft + delta, event);
			};
		if (this.options.verticalScrollBar.showArrows == 'visible') {
			this._on($verticalScrollBar.find('.ui-scrollbar-arrow'), {
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
		$verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle').draggable({
			axis: 'y',
			containment: $verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track'),
			drag: function(event, ui) {
				var wrapperHeight = $wrapper.outerHeight(),
					innerPanelHeight = $wrapper.get(0).scrollHeight,
					trackHeight = $verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track').height(),
					scrollHandleHeight = $verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle').outerHeight(),
					delta = ui.position.top == 0 ? 0 : (ui.position.top / (trackHeight - scrollHandleHeight));

					that._verticalPosition(delta * (innerPanelHeight - wrapperHeight), event, false);
			},
			stop: function() {
				$outerPanel.focus();
			}
		});
		this._on($horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track'), {
			'click': function(event) {
				event.preventDefault();
				event.stopPropagation();
				var wrapperWidth = $wrapper.outerWidth(),
					delta = wrapperWidth * this.options.horizontalScrollBar.pageStep;

				// CONSIDER: safety bounds check event.outsetX should stopPropagation not work
				if (!(event.offsetX > $horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle').position().left)) {
					delta = -delta;
				}

				this._horizontalPosition($wrapper.get(0).scrollLeft + delta, event);
			}
		});
		if (this.options.horizontalScrollBar.showArrows == 'visible') {
			this._on($horizontalScrollBar.find('.ui-scrollbar-arrow'), {
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
		$horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle').draggable({
			axis: 'x',
			containment: $horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track'),
			drag: function(event, ui) {
				var wrapperWidth = $wrapper.outerWidth(),
					innerPanelWidth = $wrapper.get(0).scrollWidth,
					trackWidth = $horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track').width(),
					scrollHandleWidth = $horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle').outerWidth(),
					delta = ui.position.left == 0 ? 0 : (ui.position.left / (trackWidth - scrollHandleWidth));

					that._horizontalPosition(delta * (innerPanelWidth - wrapperWidth), event, false);
			},
			stop: function() {
				$outerPanel.focus();
			}
		});
	}
// mouse end
	if (($.isArray(this.options.events) && (this.options.events.indexOf('wheel') !== -1)) || this.options.events == 'wheel') {
		this._on($outerPanel, {
			'mousewheel': function(event) {
				var deltaY = event.deltaY || event.delta || 0,
					deltaX = event.deltaX || 0;
				// if scroll occurs, stopPropagation of event, otherwise allow it to bubble up
				if ((!(this.verticalScrollBarVisible && this.verticalScrollBarNeeded) || (this.verticalScrollBarVisible && this.verticalScrollBarNeeded && (deltaY === 0))) && (!(this.horizontalScrollBarVisible && this.horizontalScrollBarNeeded) || (this.horizontalScrollBarVisible && this.horizontalScrollBarNeeded && (deltaX === 0))))
						return;
				if (deltaY !== 0) {
					if (this.currentVerticalScrollPosition == 0) {
						if ((deltaY < 0) && (deltaX == 0)) {
   							event.preventDefault();
							event.stopPropagation();
							// preferentially, if deltaX !== 0 we'd like to kill the event entirely, blank out deltaY and retrigger the event natively
						} else if (deltaX === 0) return;
					} else if (this.currentVerticalScrollPosition == 1) {
						if ((deltaY > 0) && (deltaX == 0)) {
							event.preventDefault();
							event.stopPropagation();
						} else if (deltaX == 0) return;
					}
				}
				if (deltaX !== 0) {
					if (this.currentHorizontalScrollPosition == 0) {
						if ((deltaX < 0) && (deltaY == 0)) {
   							event.preventDefault();
							event.stopPropagation();
							// preferentially, if deltaX !== 0 we'd like to kill the event entirely, blank out deltaY and retrigger the event natively
						} else if (deltaY === 0) return;
					} else if (this.currentHorizontalScrollPosition == 1) {
						if ((deltaX > 0) && (deltaY == 0)) {
							event.preventDefault();
							event.stopPropagation();
						} else if (deltaY == 0) return;
					}
				}
				var position;
				if (deltaY !== 0) {
					if (event.deltaFactor) {
						position = $wrapper.get(0).scrollTop + (-deltaY * event.deltaFactor);
					} else {
						position = ((-deltaY * this.options.wheelStep) + this.currentVerticalScrollPosition) * ($wrapper.get(0).scrollHeight - $wrapper.outerHeight());
					}
					this._verticalPosition(position, event);
				}
				if (deltaX !== 0) {
					if (event.deltaFactor) {
						position = $wrapper.get(0).scrollLeft + (-deltaX * event.deltaFactor);
					} else {
						position = ((-deltaX * this.options.wheelStep) + this.currentHorizontalScrollPosition) * ($wrapper.get(0).scrollWidth - $wrapper.outerWidth());
					}
					this._horizontalPosition(position, event);
				}
			}
		});
	} // wheel events
	if (($.isArray(this.options.events) && (this.options.events.indexOf('keyboard') !== -1)) || this.options.events == 'keyboard') {
		if (typeof this.oldTabIndex === 'undefined') $outerPanel.attr('tabindex', -1);
		var keyHandler = function(event) {
			if (this.verticalScrollBarVisible && this.verticalScrollBarNeeded) {
				switch(event.keyCode) {
					case $.ui.keyCode.PAGE_DOWN:
						if (this.currentVerticalScrollPosition !== 1) {
							var wrapperHeight = $wrapper.outerHeight(),
								delta = wrapperHeight * this.options.verticalScrollBar.pageStep;
							this._verticalPosition($wrapper.get(0).scrollTop + delta, event);
							return true;
						}
						break;
					case $.ui.keyCode.DOWN:
						if (this.currentVerticalScrollPosition !== 1) {
							var wrapperHeight = $wrapper.outerHeight(),
								delta = wrapperHeight * that.options.verticalScrollBar.arrowStep;
							this._verticalPosition($wrapper.get(0).scrollTop + delta, event);
							return true;
						}
						break;
					case $.ui.keyCode.UP:
						if (this.currentVerticalScrollPosition !== 0) {
							var wrapperHeight = $wrapper.outerHeight(),
								delta = wrapperHeight * that.options.verticalScrollBar.arrowStep;
							this._verticalPosition($wrapper.get(0).scrollTop - delta, event);
							return true;
						}
						break;
					case $.ui.keyCode.PAGE_UP:
						if (this.currentVerticalScrollPosition !== 0) {
							var wrapperHeight = $wrapper.outerHeight(),
								delta = wrapperHeight * this.options.verticalScrollBar.pageStep;
							this._verticalPosition($wrapper.get(0).scrollTop - delta, event);
							return true;
						}
						break;
					case $.ui.keyCode.HOME:
						if (this.currentVerticalScrollPosition !== 0) {
							this._verticalPosition(0, event);
							return true;
						}
						break;
					case $.ui.keyCode.END:
						if (this.currentVerticalScrollPosition !== 1) {
							this._verticalPosition($wrapper.get(0).scrollHeight, event);
							return true;
						}
						break;
				}
			}
			if (this.horizontalScrollBarVisible && this.horizontalScrollBarNeeded) {
				switch(event.keyCode) {
					case $.ui.keyCode.LEFT:
						if (this.currentHorizontalScrollPosition !== 0) {
							var wrapperWidth = $wrapper.outerWidth(),
								delta = wrapperWidth * that.options.horizontalScrollBar.arrowStep;
							this._horizontalPosition($wrapper.get(0).scrollLeft - delta, event);
							return true;
						}
						break;
					case $.ui.keyCode.RIGHT:
						if (this.currentHorizontalScrollPosition !== 1) {
							var wrapperWidth = $wrapper.outerWidth(),
								delta = wrapperWidth * that.options.horizontalScrollBar.arrowStep;
							this._horizontalPosition($wrapper.get(0).scrollLeft + delta, event);
							return true;
						}
						break;
				}
			}
			return false;
		};
		this._on($outerPanel, {
			'keydown':function (event) {
				if (keyHandler.call(this, event)) {
					event.preventDefault();
					event.stopPropagation();
				}
			}
		});
	} // keyboard events
	},
	_verticalPosition: function(position, event, animate) {
		// must have vertical scroll bar showing and active
		if (!this.verticalScrollBarVisible || !this.verticalScrollBarNeeded) return;

		var $outerPanel = this.element,
			$wrapper = $outerPanel.find('> .ui-scrollpane-wrapper'),
			wrapperHeight = $wrapper.outerHeight(),
			innerPanelHeight = $wrapper.get(0).scrollHeight,
			innerPanelTop = this._constrain(position, 0, innerPanelHeight - wrapperHeight); // this can problaby be merged with this.cvsp below; should not be called innerPanelTop but reflect incoming value

		// if innerPanelTop is not changed then exit
		if (innerPanelTop == $wrapper.get(0).scrollTop) return;

		this.currentVerticalScrollPosition = innerPanelTop == 0 ? 0 : innerPanelTop / (innerPanelHeight - wrapperHeight);

		var $track = this.$verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track'),
			$scrollHandle = $track.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle');

		// you can pass a duration of 0 to give the same behavior as no animation. This would make the code more manageable
		// finish() is required instead of stop() for scroll arrow behavior. However, stop() is better for paging
		if ((animate !== false) && (this.options.animate === true)) {
			var that = this;
			$().add($wrapper).add($scrollHandle).finish('ui-scrollpane');
			$().add(
			$wrapper.animate({'scrollTop': innerPanelTop},  // the queue should be uniquely identified
				{'queue': 'ui-scrollpane',
				 'progress': function(animation, progress) {
						// yikes! progress is called for the initial start (unless duration is 0)!
						if (progress !== 0) {
							if (event)
								that._trigger('scroll', event, {'axis': 'y', 'scrollPosition': $wrapper.scrollPosition()});
						}
					},
				 'done': function() { that._updateVerticalArrows(); },
				 'duration': 'fast'})
			).add(
			$scrollHandle.animate({'top': ($track.height() - $scrollHandle.outerHeight()) * this.currentVerticalScrollPosition}, 
				{'queue': 'ui-scrollpane', 'duration': 'fast'})
			).dequeue('ui-scrollpane');
		} else {
			$scrollHandle.css('top', ($track.height() - $scrollHandle.outerHeight()) * this.currentVerticalScrollPosition); // = scrollHandleTop
			$wrapper.get(0).scrollTop = innerPanelTop;

			this._updateVerticalArrows();
			if (event) this._trigger('scroll', event, {'axis': 'y', 'scrollPosition': $wrapper.scrollPosition()});
		}
	},
	_horizontalPosition: function(position, event, animate) {
		// must have horizontal scroll bar showing and active
		if (!this.horizontalScrollBarVisible || !this.horizontalScrollBarNeeded) return;

		var $outerPanel = this.element,
			$wrapper = $outerPanel.find('> .ui-scrollpane-wrapper'),
			wrapperWidth = $wrapper.outerWidth(),
			innerPanelWidth = $wrapper.get(0).scrollWidth,
			innerPanelLeft = this._constrain(position, 0, innerPanelWidth - wrapperWidth);

		// if innerPanelLeft is not changed then exit
		if (innerPanelLeft == $wrapper.get(0).scrollLeft) return;

		this.currentHorizontalScrollPosition = innerPanelLeft == 0 ? 0 : innerPanelLeft / (innerPanelWidth - wrapperWidth);

		var $track = this.$horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track'),
			$scrollHandle = $track.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle');

		if ((animate !== false) && (this.options.animate === true)) {
			var that = this;
			$().add($wrapper).add($scrollHandle).finish('ui-scrollpane');
			$().add(
			$wrapper.animate({'scrollLeft': innerPanelLeft},
				{'queue': 'ui-scrollpane',
				 'progress': function(animation, progress) {
					 	if (progress !== 0) {
							if (event)
								that._trigger('scroll', event, {'axis': 'x', 'scrollPosition': $wrapper.scrollPosition()});
					 	}
				 	},
				 'done': function() { that._updateHorizontalArrows(); },
				 'duration': 'fast'})
			).add(
			$scrollHandle.animate({'left': ($track.width() - $scrollHandle.outerWidth()) * this.currentHorizontalScrollPosition},
			 {'queue': 'ui-scrollpane', 'duration': 'fast'})
			).dequeue('ui-scrollpane');
		} else {
			$scrollHandle.css('left', ($track.width() - $scrollHandle.outerWidth()) * this.currentHorizontalScrollPosition); // = scrollHandleLeft
			$wrapper.get(0).scrollLeft = innerPanelLeft;

			this._updateHorizontalArrows();
			if (event) this._trigger('scroll', event, {'axis': 'x', 'scrollPosition': $wrapper.scrollPosition()});
		}
	},
	_updateVerticalArrows() {
		var $verticalScrollBar = this.$verticalScrollBar;

		if (this.options.verticalScrollBar.showArrows === 'visible') {
			$verticalScrollBar.find('.ui-scrollbar-arrow-start').toggleClass('ui-state-disabled', this.currentVerticalScrollPosition == 0).end()
				.find('.ui-scrollbar-arrow-end').toggleClass('ui-state-disabled', this.currentVerticalScrollPosition == 1);
		}
	},
	_updateHorizontalArrows() {
		var $horizontalScrollBar = this.$horizontalScrollBar;

		if (this.options.horizontalScrollBar.showArrows === 'visible') {
			$horizontalScrollBar.find('> .ui-scrollpane-scrollbar-horizontal').find('.ui-scrollbar-arrow-start').toggleClass('ui-state-disabled', this.currentHorizontalScrollPosition == 0).end()
				.find('.ui-scrollbar-arrow-end').toggleClass('ui-state-disabled', this.currentHorizontalScrollPosition == 1);
		}
	},
	refresh: function() {
		var $outerPanel = this.element,
			outerPanelWidth = $outerPanel.width(), // this is inner width
			outerPanelHeight = $outerPanel.height(), // this is inner height
			outerChanged = (this.outerPanelWidth !== outerPanelWidth) || (this.outerPanelHeight !== outerPanelHeight),
			$wrapper = $outerPanel.find('> .ui-scrollpane-wrapper'),
			wrapperWidth = $wrapper.outerWidth(), // outerWidth should equal innerWidth otherwise there is a CSS issue
			wrapperHeight = $wrapper.outerHeight(), // outerHeight should equal innerHeight otherwise there is a CSS issue
			innerPanelWidth,
			innerPanelHeight,
			innerChanged;

		if (outerChanged) {
			// update wrapper size first
			wrapperWidth = outerPanelWidth - (this.verticalScrollBarVisible ? $outerPanel.find('> .ui-scrollpane-scrollbar-vertical').outerWidth() : 0);
			wrapperHeight = outerPanelHeight - (this.horizontalScrollBarVisible ? $outerPanel.find('> .ui-scrollpane-scrollbar-horizontal').outerHeight() : 0);
			$wrapper.css({'width': wrapperWidth, 'height': wrapperHeight});
			// CONSIDER: might have to create an immediate delay function to call the rest of this to ensure propagation of the width and height change on the wrapper
		}

		// get innerPanel sizes after updating wrapper
		innerPanelWidth = $wrapper.get(0).scrollWidth,
		innerPanelHeight = $wrapper.get(0).scrollHeight,
		innerChanged = (this.innerPanelWidth !== innerPanelWidth) || (this.innerPanelHeight !== innerPanelHeight);
		if (outerChanged || innerChanged) {
			// save changed values (outerPanel here) or potentially do it in _update with innerPanel
			this.outerPanelWidth = outerPanelWidth;
			this.outerPanelHeight = outerPanelHeight;
			this._update(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight);
		}
	},
	_isNeededVerticalScrollBar: function(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight) {
		return outerPanelHeight - (outerPanelWidth < innerPanelWidth ? this._horizontalScrollBarHeight() : 0) < innerPanelHeight;
	},
	_isNeededHorizontalScrollBar: function(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight) {
		// secondary to _isNeededVerticalScrollBar
		return wrapperWidth < innerPanelWidth;
	},
	_update: function(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight) {
		var $outerPanel = this.element,
			$innerPanel = this.$innerPanel,
			$wrapper = $outerPanel.find('> .ui-scrollpane-wrapper'),
			$verticalScrollBar = this.$verticalScrollBar,
			$horizontalScrollBar = this.$horizontalScrollBar,
			verticalScrollBarVisible, verticalScrollBarNeeded,
			horizontalScrollBarVisible, horizontalScrollBarNeeded;

		switch(this.options.verticalScrollBar.visibility) {
			case 'never':
				verticalScrollBarNeeded = false;
				verticalScrollBarVisible = false;
				break;
			case 'always':
				verticalScrollBarNeeded = this._isNeededVerticalScrollBar(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight);
				verticalScrollBarVisible = true;
				break;
			default:
				verticalScrollBarVisible = verticalScrollBarNeeded = this._isNeededVerticalScrollBar(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight);
				break;
		}

		// adjust wrapperWidth immediately, but only if needed and reget innerPanelWidth and Height if changed and save
		if (verticalScrollBarVisible !== this.verticalScrollBarVisible) {
			wrapperWidth = outerPanelWidth - (verticalScrollBarVisible ? this._verticalScrollBarWidth() : 0);
			$wrapper.css('width', wrapperWidth);
			innerPanelWidth = $wrapper.get(0).scrollWidth;
			innerPanelHeight = $wrapper.get(0).scrollHeight;
		}

		// save changed values (innerPanel here)
		this.innerPanelWidth = innerPanelWidth;
		this.innerPanelHeight = innerPanelHeight;

		switch(this.options.horizontalScrollBar.visibility) {
			case 'never':
				horizontalScrollBarNeeded = false;
				horizontalScrollBarVisible = false;
				break;
			case 'always':
				horizontalScrollBarNeeded = this._isNeededHorizontalScrollBar(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight);
				horizontalScrollBarVisible = true;
				break;
			default:
				horizontalScrollBarVisible = horizontalScrollBarNeeded = this._isNeededHorizontalScrollBar(outerPanelWidth, outerPanelHeight, innerPanelWidth, innerPanelHeight, wrapperWidth, wrapperHeight);
				break;
		}

		if (horizontalScrollBarVisible !== this.horizontalScrollBarVisible) {
			// CONSIDER: would this ever cause a change in the $innerPanel size???
			wrapperHeight = outerPanelHeight - (horizontalScrollBarVisible ? this._horizontalScrollBarHeight() : 0);
			$wrapper.css('height', wrapperHeight);
		}

		if (verticalScrollBarVisible && verticalScrollBarNeeded) { // Needed && Visible
			var verticalRatio = innerPanelHeight / outerPanelHeight;

			// set location and size on scrollbar before making visible and getting trackWidth
			$verticalScrollBar.css({'left': wrapperWidth, 'width': this._verticalScrollBarWidth(), 'height': wrapperHeight});

			// make needed (active) as appropriate
			if (!this.verticalScrollBarNeeded) {
				$verticalScrollBar.removeClass('ui-state-disabled').find('.ui-scrollbar-track').removeClass('ui-state-disabled').end().find('.ui-scrollbar-track-scrollhandle').show();				
			}

			this._updateVerticalArrows();

			// make visible as appropriate
			if (!this.verticalScrollBarVisible) {
				$verticalScrollBar.removeClass('ui-helper-hidden');
			}

			var trackHeight = $verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track').height(), // inner height
				scrollHandleHeight = this._constrain(Math.ceil(1 / verticalRatio * trackHeight), this.options.verticalScrollBar.handleMinimumSize, Math.min(typeof this.options.verticalScrollBar.handleMaximumSize === 'undefined' ? trackHeight : this.options.verticalScrollBar.handleMaximumSize, trackHeight)),
				// bar drag/handle top here
				scrollHandleTop =  (trackHeight - scrollHandleHeight) * this.currentVerticalScrollPosition; //verticalRatio; // Offset or Start

			// update scrollbar scrollhandle
			$verticalScrollBar.find('.ui-scrollpane-scrollbar-vertical-track-scrollhandle').css({'top': scrollHandleTop, 'height': scrollHandleHeight});
		} else if (verticalScrollBarVisible && !verticalScrollBarNeeded) { // visible && not needed
			$verticalScrollBar.css({'left': wrapperWidth, 'width': this._verticalScrollBarWidth(), 'height': wrapperHeight});

			if (this.verticalScrollBarNeeded && this.verticalScrollBarVisible) {
				$verticalScrollBar.addClass('ui-state-disabled').find('.ui-scrollbar-arrow').addClass('ui-state-disabled').end().find('.ui-scrollbar-track').addClass('ui-state-disabled').end().find('.ui-scrollbar-track-scrollhandle').hide();
			}
			if (!this.verticalScrollBarVisible) {
				$verticalScrollBar.removeClass('ui-helper-hidden');
			}
			this.currentVerticalScrollPosition = 0;
			// CONSIDER: disable wheel and keyboard events
		} else { // not visible && not needed
			if (this.verticalScrollBarVisible) {
				$verticalScrollBar.addClass('ui-helper-hidden');
			}
			this.currentVerticalScrollPosition = 0;
			// CONSIDER: disable wheel and keyboard events
		}
		this.verticalScrollBarVisible = verticalScrollBarVisible; this.verticalScrollBarNeeded = verticalScrollBarNeeded;

		if (horizontalScrollBarVisible && horizontalScrollBarNeeded) {
			var horizontalRatio = innerPanelWidth / outerPanelWidth;

			// set location and size on scrollbar before making visible and getting trackHeight
			$horizontalScrollBar.css({'top': wrapperHeight, 'width': wrapperWidth, 'height': this._horizontalScrollBarHeight()});

			// make needed (active) as appropriate
			if (!this.horizontalScrollBarNeeded) {
				$horizontalScrollBar.removeClass('ui-state-disabled').find('.ui-scrollbar-track').removeClass('ui-state-disabled').end().find('.ui-scrollbar-track-scrollhandle').show();				
			}

			this._updateHorizontalArrows();

			// make visible as appropriate
			if (!this.horizontalScrollBarVisible) {
				$horizontalScrollBar.removeClass('ui-helper-hidden');
			}
			var trackWidth = $horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track').width(), // inner width
				scrollHandleWidth = this._constrain(Math.ceil(1 / horizontalRatio * trackWidth), this.options.horizontalScrollBar.handleMinimumSize, Math.min(typeof this.options.horizontalScrollBar.handleMaximumSize === 'undefined' ? trackWidth : this.options.HorizontalScrollBar.handleMaximumSize, trackWidth)),
				// bar drag/handle top here
				scrollHandleLeft = (trackWidth - scrollHandleWidth) * this.currentHorizontalScrollPosition;

			// update scrollbar scrollhandle
			$horizontalScrollBar.find('.ui-scrollpane-scrollbar-horizontal-track-scrollhandle').css({'left': scrollHandleLeft, 'width': scrollHandleWidth});
		} else if (horizontalScrollBarVisible && !horizontalScrollBarNeeded) { // visible && not needed
			$horizontalScrollBar.css({'top': wrapperHeight, 'width': wrapperWidth, 'height': this._horizontalScrollBarHeight()});

			if (!this.horizontalScrollBarVisible) {
				$horizontalScrollBar.removeClass('ui-helper-hidden');
			}
			if (this.horizontalScrollBarNeeded && this.horizontalScrollBarVisible) {
				$horizontalScrollBar.addClass('ui-state-disabled').find('.ui-scrollbar-arrow').addClass('ui-state-disabled').end().find('.ui-scrollbar-track').addClass('ui-state-disabled').end().find('.ui-scrollbar-track-scrollhandle').hide();
			}
			this.currentHorizontalScrollPosition = 0;
			// CONSIDER: disable wheel and keyboard events
		} else { // not visible && not needed
			if (this.horizontalScrollBarVisible) {
				$horizontalScrollBar.addClass('ui-helper-hidden');
			}
			this.currentHorizontalScrollPosition = 0;
			// CONSIDER: disable wheel and keyboard events
		}
		this.horizontalScrollBarVisible = horizontalScrollBarVisible; this.horizontalScrollBarNeeded = horizontalScrollBarNeeded;

		$wrapper.get(0).scrollTop = Math.floor(this.currentVerticalScrollPosition * (wrapperHeight - innerPanelHeight));
		$wrapper.get(0).scrollLeft = Math.floor(this.currentHorizontalScrollPosition * (wrapperWidth - innerPanelWidth));
		//$innerPanel.css({'left': Math.floor(this.currentHorizontalScrollPosition * (wrapperWidth - innerPanelWidth)), 'top': Math.floor(this.currentVerticalScrollPosition * (wrapperHeight - innerPanelHeight))});
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
			.attr('tabindex', this.oldTabIndex)
			.removeData('ui-scrollable')
			.css({'overflow': this.oldOverflow, 'position': this.oldPosition})
			.removeClass('ui-scrollpane ui-scrollable')
			.remove('.ui-scrollpane-scrollbar')
			.find('.ui-scrollpane-inner').unwrap().contents().unwrap();
		this._super();
	},

	/** scrollable related functions **/
	inScrollableArea: function(element) {
		return this.element.find('> * > .ui-scrollable-area').has(element).length > 0;
	},
	scrollTop: function(value) {
		if (typeof value === 'undefined') {
			return this.element.find('> .ui-scrollpane-wrapper').get(0).scrollTop;
		} else {
			this._verticalPosition(value, null, false);
		}
	},
	scrollLeft: function(value) {
		if (typeof value === 'undefined') {
			return this.element.find('> .ui-scrollpane-wrapper').get(0).scrollLeft;
		} else {
			this._horizontalPosition(value, null, false);
		}
	},
	scrollHeight: function() {
		return this.$innerPanel.outerHeight();
	},
	scrollWidth: function() {
		return this.$innerPanel.outerWidth();
	}
});

	/* Fix-Up for scroll related jQuery and jQuery UI functions to accomodate scrollable components */

	var scrollParent = $.fn.scrollParent = function( includeHidden ) {
		var that = this,
			position = this.css( "position" ),
			excludeStaticParent = position === "absolute",
			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			scrollParent = this.parents().filter( function() {
				var parent = $( this );
				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
					return false;
				}
				if (parent.hasClass('ui-scrollable')) {
					var scrollInterface = parent.data('ui-scrollable');
					return scrollInterface ? scrollInterface.inScrollableArea(that) : false;
				}
				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) +
					parent.css( "overflow-x" ) );
			} ).eq( 0 );

		return position === "fixed" || !scrollParent.length ?
			$( this[ 0 ].ownerDocument || document ) :
			scrollParent;
	};

	var previousScrollTop = $.fn.scrollTop,
		previousScrollLeft = $.fn.scrollLeft;

	$.fn.scrollTop = function(value) {
		if (typeof value === 'undefined') {
				var $this = this.first();
				if ($this.hasClass('ui-scrollable')) {
					var scrollInterface = $this.data('ui-scrollable');
					return scrollInterface ? scrollInterface.scrollTop() : undefined;
				} else {
					return previousScrollTop.call($this);
				}
		} else {
			return this.each(function() {
				var $this = $(this);
				if ($this.hasClass('ui-scrollable')) {
					var scrollInterface = $this.data('ui-scrollable');
					if (scrollInterface) scrollInterface.scrollTop(value);
				} else {
					previousScrollTop.call($this, value);
				}
			});
		}
	};
	$.fn.scrollLeft = function(value) {
		if (typeof value === 'undefined') {
				var $this = this.first();
				if ($this.hasClass('ui-scrollable')) {
					var scrollInterface = $this.data('ui-scrollable');
					return scrollInterface ? scrollInterface.scrollLeft() : undefined;
				} else {
					return previousScrollLeft.call($this);
				}
		} else {
			return this.each(function() {
				var $this = $(this);
				if ($this.hasClass('ui-scrollable')) {
					var scrollInterface = $this.data('ui-scrollable');
					if (scrollInterface) scrollInterface.scrollLeft(value);
				} else {
					previousScrollLeft.call($this, value);
				}
			});
		}
	};
	$.fn.scrollWidth = function() {
		var $this = $(this).first();
		if ($this.hasClass('ui-scrollable')) {
			var scrollInterface = $this.data('ui-scrollable');
			return scrollInterface ? scrollInterface.scrollWidth() : undefined;
		} else {
			return $this[0].scrollWidth;
		}
	}
	$.fn.scrollHeight = function() {
		var $this = $(this).first();
		if ($this.hasClass('ui-scrollable')) {
			var scrollInterface = $this.data('ui-scrollable');
			return scrollInterface ? scrollInterface.scrollHeight() : undefined;
		} else {
			return $this[0].scrollHeight;
		}
	}

	/* Create scrollabe interface */

	var scrollable = $.widget('aw.scrollable', {
		inScrollableArea: function(element) {},
		scrollTop: function(value) {},
		scrollLeft: function(value) {},
		scrollWidth: function() {},
		scrollHeight: function() {}
	});

	$.fn.scrollPosition = function() {
		var $this = $(this).first();
		return {left: $this.scrollLeft(), top: $this.scrollTop()};
	}

	/* Allow scrollPane to function as a native replacement for the scrollSortable widget
	   by switching all scroll related functions from using their DOM properties to using
	   their jQuery counterparts instead, if it has been declared.
	*/

	if ($.aw.scrollSortable) {
		$.widget( "aw.scrollSortable", $.aw.scrollSortable, {
			_scroll: function( event, direction ) {
				var o = this.options,
					scrolled = { top: 0, left: 0 };

				if ( this.scrollParent[ 0 ] !== this.document[ 0 ] &&
						this.scrollParent[ 0 ].tagName !== "HTML" ) {

					if ( ( ( this.overflowOffset.top + this.scrollParent.outerHeight() ) -
							event.pageY < o.scrollSensitivity ) && ( ( typeof direction === 'undefined' ) || ( direction.vertical === 'down' ) ) ) {
						scrolled.top = this.scrollParent.scrollTop();
						this.scrollParent.scrollTop(scrolled.top + o.scrollSpeed);
						scrolled.top -= this.scrollParent.scrollTop();
					} else if ( ( event.pageY - this.overflowOffset.top < o.scrollSensitivity ) && ( ( typeof direction === 'undefined' ) || ( direction.vertical === 'up' ) ) ) {
						scrolled.top = this.scrollParent.scrollTop();
						this.scrollParent.scrollTop(scrolled.top - o.scrollSpeed);
						scrolled.top += -this.scrollParent.scrollTop();
					}

					if ( ( ( this.overflowOffset.left + this.scrollParent.outerWidth() ) -
							event.pageX < o.scrollSensitivity ) && ( ( typeof direction === 'undefined' ) || ( direction.horizontal === 'right' ) ) ) {
						scrolled.left = this.scrollParent.scrollLeft();
						this.scrollParent.scrollLeft(this.scrollParent.scrollLeft() + o.scrollSpeed);
						scrolled.left -= this.scrollParent.scrollLeft();
					} else if ( ( event.pageX - this.overflowOffset.left < o.scrollSensitivity ) && ( ( typeof direction === 'undefined' ) || ( direction.horizontal === 'left' ) ) ) {
						scrolled.left = this.scrollParent.scrollLeft();
						this.scrollParent.scrollLeft(this.scrollParent.scrollLeft() - o.scrollSpeed);
						scrolled.left += -this.scrollParent.scrollLeft();
					}

				} else {

					if ( ( event.pageY - this.document.scrollTop() < o.scrollSensitivity ) && ( ( typeof direction === 'undefined' ) || ( direction.vertical === 'up' ) ) ) {
						scrolled.top = this.document.scrollTop();
						this.document.scrollTop( scrolled.top - o.scrollSpeed );
						scrolled.top += -this.document.scrollTop();
					} else if ( ( this.window.height() - ( event.pageY - this.document.scrollTop() ) <
							o.scrollSensitivity ) && ( ( typeof direction === 'undefined' ) || ( direction.vertical === 'down' ) ) ) {
						scrolled.top = this.document.scrollTop();
						this.document.scrollTop( scrolled.top + o.scrollSpeed );
						scrolled.top -= this.document.scrollTop();
					}

					if ( ( event.pageX - this.document.scrollLeft() < o.scrollSensitivity ) && ( ( typeof direction === 'undefined' ) || ( direction.horizontal === 'left' ) ) ) {
						scrolled.left = this.document.scrollLeft();
						this.document.scrollLeft( scrolled.left - o.scrollSpeed );
						scrolled.left += -this.document.scrollLeft();
					} else if ( ( this.window.width() - ( event.pageX - this.document.scrollLeft() ) <
							o.scrollSensitivity ) && ( ( typeof direction === 'undefined') || ( direction.horizontal === 'right' ) ) ) {
						scrolled.left = this.document.scrollLeft();
						this.document.scrollLeft( scrolled.left + o.scrollSpeed );
						scrolled.left -= this.document.scrollLeft();
					}

				}

				return scrolled === false ||
					( ( scrolled.left === 0 ) && ( scrolled.top === 0 ) ) ? false : scrolled;
			}
		});
	}

}));
