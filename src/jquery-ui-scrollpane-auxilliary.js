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

	if ($.aw.scrollSortable) {
		$.widget( "aw.scrollSortable", $.aw.scrollSortable, {
			_scroll: function( event ) {
				var o = this.options,
					scrolled = { top: 0, left: 0 };

				if ( this.scrollParent[ 0 ] !== this.document[ 0 ] &&
						this.scrollParent[ 0 ].tagName !== "HTML" ) {

					if ( ( this.overflowOffset.top + this.scrollParent.outerHeight() ) -
							event.pageY < o.scrollSensitivity ) {
						scrolled.top = this.scrollParent.scrollTop();
						this.scrollParent.scrollTop(scrolled.top + o.scrollSpeed);
						scrolled.top -= this.scrollParent.scrollTop();
					} else if ( event.pageY - this.overflowOffset.top < o.scrollSensitivity ) {
						scrolled.top = this.scrollParent.scrollTop();
						this.scrollParent.scrollTop(scrolled.top - o.scrollSpeed);
						scrolled.top += -this.scrollParent.scrollTop();
					}

					if ( ( this.overflowOffset.left + this.scrollParent.outerWidth() ) -
							event.pageX < o.scrollSensitivity ) {
						scrolled.left = this.scrollParent.scrollLeft();
						this.scrollParent.scrollLeft(this.scrollParent.scrollLeft() + o.scrollSpeed);
						scrolled.left -= this.scrollParent.scrollLeft();
					} else if ( event.pageX - this.overflowOffset.left < o.scrollSensitivity ) {
						scrolled.left = this.scrollParent.scrollLeft();
						this.scrollParent.scrollLeft(this.scrollParent.scrollLeft() - o.scrollSpeed);
						scrolled.left += -this.scrollParent.scrollLeft();
					}

				} else {

					if ( event.pageY - this.document.scrollTop() < o.scrollSensitivity ) {
						scrolled.top = this.document.scrollTop();
						this.document.scrollTop( scrolled.top - o.scrollSpeed );
						scrolled.top += -this.document.scrollTop();
					} else if ( this.window.height() - ( event.pageY - this.document.scrollTop() ) <
							o.scrollSensitivity ) {
						scrolled.top = this.document.scrollTop();
						this.document.scrollTop( scrolled.top + o.scrollSpeed );
						scrolled.top -= this.document.scrollTop();
					}

					if ( event.pageX - this.document.scrollLeft() < o.scrollSensitivity ) {
						scrolled.left = this.document.scrollLeft();
						this.document.scrollLeft( scrolled.left - o.scrollSpeed );
						scrolled.left += -this.document.scrollLeft();
					} else if ( this.window.width() - ( event.pageX - this.document.scrollLeft() ) <
							o.scrollSensitivity ) {
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
})(jQuery);
