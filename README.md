# jQuery-UI-ScrollPane
Compact, highly functional scroll pane drop-in or native replacement with superbly tailered interative behaviors and a plentitude of meaningful options.

The jQuery-UI-ScrollPane plugin offers a no tear solution to customizing scrollbar look and feel in scrollable areas.  It is adaptable to numerous situations and uses even without the need to specify widths or heights on the target element.  jQuery scrollTop and scrollLeft support, as well as scrollWidth and scrollHeight functions, is also available via an exported *ui-scrollable* component (See Auxilliary).

Extensive features:

- No need to specify width and height values; auto displays scrollbars as appropriate.
- Events can be chosen independently of one another ('mouse', 'wheel', 'keyboard', 'touch').
- Mouse behaviors/interactions are adapted to match those of the native environment.
- Available refresh function updates visibility of scrollbars based on both the scrollpane and contents sizes.
- Track handle, arrow and wheel steps are customizable via pixels, percentage of viewable area, or function.
- Can specify callback function for scroll events.
- Animation of scroll view can be turned off or on.
- Scrollbar arrows can be hidden, displayed apart or together at either end.
- Scrollbar options are applied independently to either the vertical or hotizontal scrollbar.

Demos and further information is available at http://borgboyone.github.io/jQuery-UI-ScrollPane/

Options
-------
###Scrollpane Options
-	`maintainInitialScrollPosition`: When initializing the scrollpane, keep the current scroll position. (default: true)
-	`innerPaneClasses`: Classes to add to the inner scrollable area. (default: 'ui-scrollpane-fullwidth ui-scrollPane-autoheight')
-	`events`: A string or array specifing the event handlers that should be bound to the scrollpane.  Acceptable values are 'mouse', 'wheel', 'keywoard', and 'touch'. (default: ['mouse', 'wheel', 'keyboard'])
-	`animate`: Animate scrolling of the viewable area when triggered by the scrollbar(s). (default: true)
-	`scroll`: Callback function for scroll events (default: undefined)
-	`wheelStep`: Percentage of viewport to scroll the targeted axis if not passed in the event by the OS (default: 0.2)
-	`verticalScrollBar`, `horizontalScrollBar`: See Scrollbar Options.

###Scrollbar Options
-	`position`: Scrollbar panel alignment. (default: verticalScrollBar => 'right', horizontalScrollBar => 'bottom')
-	`visiblity`: Determines how the scrollbar should be displayed.  Acceptable values are 'always', 'auto', and 'never'. (default: 'auto')
-	`showArrows`: Determines if the arrows are displayed on the scrollbar.  Acceptable values are 'visible' and 'hidden'. (default: 'hidden')
-	`arrowAlignment`: Determines the position of the arrows on the scrollbar.  Acceptable values are 'ends', 'start', 'end'. (default: 'ends')
-	`arrowStep`: Percentage of viewport to scroll the targeted axis when clicked. (default: 0.125)
-	`handleMinimumSize`: Minimum size of the scrollbar track handle.  Acceptable values must be numeric with those less than 1 treated as a percentage of track size and those 1 or greater treated as pixel values. (default: 0.1)
-	`handleMaximumSize`: Maximum size of the scrollbar track handle.  Acceptable values must be either numeric following the same constraints as 'handleMinimumSize' or undefined for maximum track size. (default: undefined)
-	`pageStep`: Percentage of viewport to scroll targeted axis if a page specific movement is initiated (eg. clicking on track area). (default: 0.9)
-	`arrowClassIcons`: Icon classes to use for the scrollbar arrows.  (default: verticalScrollBar => {start: 'ui-icon ui-icon-triangle-1-n', end: 'ui-icon ui-icon-triangle-1-s'}, horizontalScrollBar => {start: 'ui-icon ui-icon-triangle-1-w', end: 'ui-icon ui-icon-triangle-1-e'})

Methods
-------
-	`refresh`:
-	`scrollTop`:
-	`scrollLeft`:
-	`scrollHeight`:
-	`scrollWidth`:

Usage
-----
Typical:
```js
    $('#content .article').scrollpane();
```

Ultimate No Tears (via MarcJ's [CSS Element Queries](http://marcj.github.io/css-element-queries/) plugin):
```js
	$('#content .article').scrollpane();
	new new ResizeSensor($('#content .article').get(0), function() { $('#content .article').scrollpane('refresh'); });
	new new ResizeSensor($('#content .article .ui-scrollpane-inner').get(0), function() { $('#content .article').scrollpane('refresh'); });
```

Padding Transfer (lazy CSS method):
```css
	.my-padding {
		padding: 2px 4px 6px 8px;
	}
	.my-padding.ui-scrollpane {
		padding: 0;
	}
	.my-padding.ui-scrollpane > .ui-scrollpane-wrapper > .ui-scrollpane-innerpane {
		padding: 2px 4px 6px 8px;
	}
```

Body:
```css
	.body-scrollpane {
		height: 100%;
		margin: 0;
		overflow: hidden;
	}
```
```html
	<body class="body-scrollpane">
```
```js
	$('body').scrollpane();
```

Auxilliary
----------
A fix-up version of the jQuery UI Sortable widget is provided that fixes (or at least strives to) all issues associated with scrolling and sorting.  This version will work in tandem with the ScrollPane provided you reference the Scroll Sortable plugin before the Scroll Pane.  This Scroll Sortable plugin takes all the same options as its counterpart but  is instantiated with .scrollSortable({...}) instead of .sortable({...}).

The Scroll Pane plugin introduces the concept of a Scrollable widget by exporting itself as an instance of ui-scrollable and implementing functions defined in a mock Scrollable widget (ie. an interface).  Any widget can take on a scrollable nature in this way by implementing these functions:
- scrollTop([value])
- scrollLeft([value])
- scrollWidth()
- scrollHeight()
- inScrollableArea(element or jQuery): Complex constructs can potentially have elements that are part of the widget's interface but are not actually a part of the scrollable DOM.  This allows functions such as scrollParent to treat these elements as separate from the Scrollable.

The jQuery scrollParent, scrollTop and scrollLeft default functions are overridden to take advantage of the ui-scrollable implementation.  This permits users to include jQuery UI Draggable and similar components inside the scrollable area.  For the sake of completeness, jQuery functions are added for scrollWidth and scrollHeight and they also function with the Scroll Pane plugin (or any other widget that exports itself as a Scrollable instance).

ToDo
----
You heard it here first folks.  Not everything is finished.
-	CONSIDER: Separate notion of innerPaneClasses and packing basis
-	Add touchscreen support (testing of project in actual setting)
-	Add options validation
-	CONSIDER: Honoring the ScrollBar position option
-	CONSIDER: Userspace/namespace for classes (so instead of "ui-", you would have "aw-")
-	REQUEST: Have scrollbars float over content and fade-in and/or slide-in on activity

License
-------
MIT License. Copyright 2017, Anthony Wells.
