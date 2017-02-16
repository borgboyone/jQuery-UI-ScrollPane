(function($) {
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

	var scrollable = $.widget('aw.scrollable', {
		inScrollableArea: function(element) {},
		scrollTop: function(value) {},
		scrollLeft: function(value) {},
		scrollWidth: function() {},
		scrollHeight: function() {}
	});

	$.widget( "ui.sortable", $.ui.sortable, {
		_createHelper: function( event ) {

			var o = this.options,
				helper = $.isFunction( o.helper ) ?
					$( o.helper.apply( this.element[ 0 ], [ event, this.currentItem ] ) ) :
					( o.helper === "clone" ? this.currentItem.clone() : this.currentItem );

			//Add the helper to the DOM if that didn't happen already
			if ( !helper.parents( "body" ).length ) {
				this.appendTo[ 0 ].appendChild( helper[ 0 ] );
			}

			if ( helper[ 0 ] === this.currentItem[ 0 ] ) {
				this._storedCSS = {
					width: this.currentItem[ 0 ].style.width,
					height: this.currentItem[ 0 ].style.height,
					position: this.currentItem.css( "position" ),
					top: this.currentItem.css( "top" ),
					left: this.currentItem.css( "left" )
				};
			}

			if ( !helper[ 0 ].style.width || o.forceHelperSize ) {
				helper.width( this.currentItem.width() );
			}
			if ( !helper[ 0 ].style.height || o.forceHelperSize ) {
				helper.height( this.currentItem.height() );
			}

			return helper;

		},
		_mouseStart: function( event, overrideHandle, noActivation ) {

			var i, body,
				o = this.options;

			this.currentContainer = this;

			//We only need to call refreshPositions, because the refreshItems call has been moved to
			// mouseCapture
			this.refreshPositions();

			this.appendTo = $( o.appendTo !== "parent" ?
					o.appendTo :
					this.currentItem.parent() );

			//Create and append the visible helper
			this.helper = this._createHelper( event );

			//Cache the helper size
			this._cacheHelperProportions();

			/*
			 * - Position generation -
			 * This block generates everything position related - it's the core of draggables.
			 */

			//Cache the margins of the original element
			this._cacheMargins();

			//Get the next scrolling parent
			this.scrollParent = this.helper.scrollParent();

			//The element's absolute position on the page minus margins
			this.offset = this.currentItem.offset();
			this.offset = {
				top: this.offset.top - this.margins.top,
				left: this.offset.left - this.margins.left
			};

			$.extend( this.offset, {
				click: { //Where the click happened, relative to the element
					left: event.pageX - this.offset.left,
					top: event.pageY - this.offset.top
				},
				parent: this._getParentOffset(),

				// This is a relative to absolute position minus the actual position calculation -
				// only used for relative positioned helper
				relative: this._getRelativeOffset()
			} );

			// Only after we got the offset, we can change the helper's position to absolute
			// TODO: Still need to figure out a way to make relative sorting possible
			this.helper.css( "position", "absolute" );
			this.cssPosition = this.helper.css( "position" );

			//Generate the original position
			this.originalPosition = this._generatePosition( event );
			this.originalPageX = event.pageX;
			this.originalPageY = event.pageY;

			//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
			( o.cursorAt && this._adjustOffsetFromHelper( o.cursorAt ) );

			//Cache the former DOM position
			this.domPosition = {
				prev: this.currentItem.prev()[ 0 ],
				parent: this.currentItem.parent()[ 0 ]
			};

			// If the helper is not the original, hide the original so it's not playing any role during
			// the drag, won't cause anything bad this way
			if ( this.helper[ 0 ] !== this.currentItem[ 0 ] ) {
				this.currentItem.hide();
			}

			//Create the placeholder
			this._createPlaceholder();

			//Set a containment if given in the options
			if ( o.containment ) {
				this._setContainment();
			}

			if ( o.cursor && o.cursor !== "auto" ) { // cursor option
				body = this.document.find( "body" );

				// Support: IE
				this.storedCursor = body.css( "cursor" );
				body.css( "cursor", o.cursor );

				this.storedStylesheet =
					$( "<style>*{ cursor: " + o.cursor + " !important; }</style>" ).appendTo( body );
			}

			if ( o.opacity ) { // opacity option
				if ( this.helper.css( "opacity" ) ) {
					this._storedOpacity = this.helper.css( "opacity" );
				}
				this.helper.css( "opacity", o.opacity );
			}

			if ( o.zIndex ) { // zIndex option
				if ( this.helper.css( "zIndex" ) ) {
					this._storedZIndex = this.helper.css( "zIndex" );
				}
				this.helper.css( "zIndex", o.zIndex );
			}

			//Prepare scrolling
			if ( this.scrollParent[ 0 ] !== this.document[ 0 ] &&
					this.scrollParent[ 0 ].tagName !== "HTML" ) {
				this.overflowOffset = this.scrollParent.offset();
			}

			//Call callbacks
			this._trigger( "start", event, this._uiHash() );

			//Recache the helper size
			if ( !this._preserveHelperProportions ) {
				this._cacheHelperProportions();
			}

			//Post "activate" events to possible containers
			if ( !noActivation ) {
				for ( i = this.containers.length - 1; i >= 0; i-- ) {
					this.containers[ i ]._trigger( "activate", event, this._uiHash( this ) );
				}
			}

			//Prepare possible droppables
			if ( $.ui.ddmanager ) {
				$.ui.ddmanager.current = this;
			}

			if ( $.ui.ddmanager && !o.dropBehaviour ) {
				$.ui.ddmanager.prepareOffsets( this, event );
			}

			this.dragging = true;

			this._addClass( this.helper, "ui-sortable-helper" );

			if (!this.helper.parent().is(this.appendTo)) {
				this.helper.detach().appendTo(this.appendTo);
				// update position
				this.offset.parent = this._getParentOffset();
			}

			// set-up the helper's correct position
			this.position = this._generatePosition( event );
			this.lastPositionAbs = this.positionAbs = this._convertPositionTo( "absolute" );

			return true;

		},
		_scroll: function(event) {
			var o = this.options,
				scrolled = false;

			if ( this.scrollParent[ 0 ] !== this.document[ 0 ] &&
					this.scrollParent[ 0 ].tagName !== "HTML" ) {

				if ( ( this.overflowOffset.top + this.scrollParent.outerHeight() ) -
						event.pageY < o.scrollSensitivity ) {
					scrolled = this.scrollParent.scrollTop(
						this.scrollParent.scrollTop() + o.scrollSpeed);
				} else if ( event.pageY - this.overflowOffset.top < o.scrollSensitivity ) {
					scrolled = this.scrollParent.scrollTop(
						this.scrollParent.scrollTop() - o.scrollSpeed);
				}

				if ( ( this.overflowOffset.left + this.scrollParent.outerWidth() ) -
						event.pageX < o.scrollSensitivity ) {
					scrolled = this.scrollParent.scrollLeft(
						this.scrollParent.scrollLeft() + o.scrollSpeed);
				} else if ( event.pageX - this.overflowOffset.left < o.scrollSensitivity ) {
					scrolled = this.scrollParent.scrollLeft(
						this.scrollParent.scrollLeft() - o.scrollSpeed);
				}

			} else {

				if ( event.pageY - this.document.scrollTop() < o.scrollSensitivity ) {
					scrolled = this.document.scrollTop( this.document.scrollTop() - o.scrollSpeed );
				} else if ( this.window.height() - ( event.pageY - this.document.scrollTop() ) <
						o.scrollSensitivity ) {
					scrolled = this.document.scrollTop( this.document.scrollTop() + o.scrollSpeed );
				}

				if ( event.pageX - this.document.scrollLeft() < o.scrollSensitivity ) {
					scrolled = this.document.scrollLeft(
						this.document.scrollLeft() - o.scrollSpeed
					);
				} else if ( this.window.width() - ( event.pageX - this.document.scrollLeft() ) <
						o.scrollSensitivity ) {
					scrolled = this.document.scrollLeft(
						this.document.scrollLeft() + o.scrollSpeed
					);
				}

			}

			return scrolled;
		},
		_mouseDrag: function( event ) {
			var i, item, itemElement, intersection,
				o = this.options,
				scrolled = false;

			//Compute the helpers position
			this.position = this._generatePosition( event );
			this.positionAbs = this._convertPositionTo( "absolute" );

			//Do scrolling
			if ( this.options.scroll ) {
				scrolled = this._scroll( event );
				if (scrolled !== false) {
					// we can adjust positionAbs and lastPositionAbs via the scrolled delta, if we tracked that
					this.positionAbs = this._convertPositionTo( "absolute" );
					// lastPositionAbs
					if ( $.ui.ddmanager && !o.dropBehaviour ) {
						$.ui.ddmanager.prepareOffsets( this, event );
					}
				}
			}

			//Set the helper position
			if ( !this.options.axis || this.options.axis !== "y" ) {
				this.helper[ 0 ].style.left = this.position.left + "px";
			}
			if ( !this.options.axis || this.options.axis !== "x" ) {
				this.helper[ 0 ].style.top = this.position.top + "px";
			}

			//Rearrange
			for ( i = this.items.length - 1; i >= 0; i-- ) {

				//Cache variables and intersection, continue if no intersection
				item = this.items[ i ];
				itemElement = item.item[ 0 ];
				intersection = this._intersectsWithPointer( item );
				if ( !intersection ) {
					continue;
				}

				// Only put the placeholder inside the current Container, skip all
				// items from other containers. This works because when moving
				// an item from one container to another the
				// currentContainer is switched before the placeholder is moved.
				//
				// Without this, moving items in "sub-sortables" can cause
				// the placeholder to jitter between the outer and inner container.
				if ( item.instance !== this.currentContainer ) {
					continue;
				}

				// Cannot intersect with itself
				// no useless actions that have been done before
				// no action if the item moved is the parent of the item checked
				if ( itemElement !== this.currentItem[ 0 ] &&
					this.placeholder[ intersection === 1 ? "next" : "prev" ]()[ 0 ] !== itemElement &&
					!$.contains( this.placeholder[ 0 ], itemElement ) &&
					( this.options.type === "semi-dynamic" ?
						!$.contains( this.element[ 0 ], itemElement ) :
						true
					)
				) {

					this.direction = intersection === 1 ? "down" : "up";

					if ( this.options.tolerance === "pointer" || this._intersectsWithSides( item ) ) {
						this._rearrange( event, item );
					} else {
						break;
					}

					this._trigger( "change", event, this._uiHash() );
					break;
				}
			}

			//Post events to containers
			this._contactContainers( event );

			//Interconnect with droppables
			if ( $.ui.ddmanager ) {
				$.ui.ddmanager.drag( this, event );
			}

			//Call callbacks
			this._trigger( "sort", event, this._uiHash() );

			this.lastPositionAbs = this.positionAbs;
			return false;

		}
	});
})(jQuery);
