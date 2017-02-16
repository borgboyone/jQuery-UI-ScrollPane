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

	// TODO: need fix-up for keyboard escape during sort
	$.widget( "ui.sortable", $.ui.sortable, {
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

			//Do this in _mouseStart
			if ( !this.lastPositionAbs ) {
				this.lastPositionAbs = this.positionAbs;
			}

			//Do scrolling
			if ( this.options.scroll ) {
				scrolled = this._scroll( event );
				if (scrolled) {
					// we can adjust positionAbs and lastPositionAbs via the scrolled delta, if we tracked that
					this.positionAbs = this._convertPositionTo( "absolute" );
					// lastPositionAbs
				}
				if ( scrolled !== false && $.ui.ddmanager && !o.dropBehaviour ) {
					$.ui.ddmanager.prepareOffsets( this, event );
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
