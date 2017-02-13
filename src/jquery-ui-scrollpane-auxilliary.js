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
					return previousScrollTop.apply(this, arguments);
				}
		} else {
			return this.each(function() {
				var $this = $(this);
				if ($this.hasClass('ui-scrollable')) {
					var scrollInterface = $this.data('ui-scrollable');
					if (scrollInterface) scrollInterface.scrollTop(value);
				} else {
					previousScrollTop.apply(this, arguments);
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
					previousScrollLeft.apply($this, arguments);
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

})(jQuery);
