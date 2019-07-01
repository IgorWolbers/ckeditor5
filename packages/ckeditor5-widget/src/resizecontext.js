import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview';
import dragHandlerIcon from '../theme/icons/drag-handler.svg';

const HEIGHT_ATTRIBUTE_NAME = 'height';

/**
 * Returns coordinates of top-left corner of a element, relative to the document's top-left corner.
 *
 * @param {HTMLElement} element
 * @param {String} resizerPosition Position of the resize handler, e.g. `"top-left"`, `"bottom-right"`.
 * @returns {Object} return
 * @returns {Number} return.x
 * @returns {Number} return.y
 */
// function getAbsoluteBoundaryPoint( element ) {
function getAbsoluteBoundaryPoint( element, resizerPosition ) {
	const nativeRectangle = element.getBoundingClientRect();
	const positionParts = resizerPosition.split( '-' );
	const ret = {
		x: nativeRectangle.left + element.ownerDocument.defaultView.scrollX,
		y: positionParts[ 0 ] == 'bottom' ? nativeRectangle.bottom : nativeRectangle.top
	};

	ret.y += element.ownerDocument.defaultView.scrollY;

	return ret;
}

export default class ResizeContext {
	constructor() {
		// HTMLElement???
		this.resizeHost = null;
		// view/UiElement
		this.resizeWrapperElement = null;
		// view/Element
		this.widgetWrapperElement = null;
		// HTMLElement|null - might be uninitialized
		this.domResizeWrapper = null;
		this.domResizeShadow = null;

		// @todo: ---- options below seems like a little outside of a scope of a single context ----
		// Size before resizing.
		this.initialSize = {
			x: 0,
			y: 0
		};

		// Position of a clicked resize handler in x and y axes.
		this.direction = {
			y: 'top',
			x: 'left'
		};

		// Reference point of resizer where the dragging started. It is used to measure the distance to user cursor
		// traveled, thus how much the image should be enlarged.
		// This information is only known after DOM was rendered, so it will be updated later.
		this.referenceCoordinates = {
			y: 0,
			x: 0
		};
	}

	/**
	 *
	 * @param {module:engine/view/element~Element} widgetElement Widget's wrapper.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 */
	attach( widgetElement, writer ) {
		const that = this;

		this.widgetWrapperElement = widgetElement;

		this.resizeWrapperElement = writer.createUIElement( 'div', {
			class: 'ck ck-widget__resizer-wrapper'
		}, function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			that.domResizeShadow = that._appendShadowElement( domDocument, domElement );
			that._appendResizers( domElement );

			that.domResizeWrapper = domElement;

			return domElement;
		} );

		// Append resizer wrapper to the widget's wrapper.
		writer.insert( writer.createPositionAt( widgetElement, widgetElement.childCount ), this.resizeWrapperElement );
		writer.addClass( [ 'ck-widget_with-resizer' ], widgetElement );
	}

	/**
	 *
	 * @param {HTMLElement} domResizeHandler Handler used to calculate reference point.
	 */
	begin( domResizeHandler ) {
		this.domResizeShadow.classList.add( 'ck-widget__resizer-shadow-active' );

		this.referenceHandlerPosition = this._getResizerPosition( domResizeHandler );

		this.referenceCoordinates = getAbsoluteBoundaryPoint( domResizeHandler, this.referenceHandlerPosition );
	}

	commit( editor ) {
		const modelEntry = this._getModel( editor, this.widgetWrapperElement );
		const newHeight = this.domResizeShadow.clientHeight;

		this._dismissShadow();

		editor.model.change( writer => {
			writer.setAttribute( HEIGHT_ATTRIBUTE_NAME, newHeight, modelEntry );
		} );

		this.redraw();

		// Again, render will most likely change image size, so resizers needs a redraw.
		editor.editing.view.once( 'render', () => this.redraw() );

		this.referenceHandlerPosition = null;
	}

	cancel() {
		this._dismissShadow();

		this.referenceHandlerPosition = null;
	}

	destroy() {
		this.cancel();

		this.domResizeShadow = null;
		this.wrapper = null;
		this.referenceHandlerPosition = null;
	}

	updateSize( domEventData ) {
		const currentCoordinates = this._extractCoordinates( domEventData );
		const yDistance = this.referenceCoordinates.y - currentCoordinates.y;

		if ( this.referenceHandlerPosition.includes( 'bottom-' ) ) {
			if ( yDistance < 0 ) {
				// enlarging
				this.domResizeShadow.style.bottom = `${ yDistance }px`;
			} else {
				// shrinking
				this.domResizeShadow.style.bottom = `${ yDistance }px`;
			}
		} else {
			// default handler: top-left.
			if ( yDistance > 0 ) {
				// enlarging
				this.domResizeShadow.style.top = ( yDistance * -1 ) + 'px';
			} else {
				// shrinking
				this.domResizeShadow.style.top = ( yDistance * -1 ) + 'px';
			}
		}
	}

	redraw() {
		if ( this.domResizeWrapper ) {
			const resizingHost = this.domResizeWrapper.parentElement.querySelector( 'img' );

			this.domResizeWrapper.style.left = resizingHost.offsetLeft + 'px';
			this.domResizeWrapper.style.right = resizingHost.offsetLeft + 'px';
		}
	}

	_appendShadowElement( domDocument, domElement ) {
		const shadowElement = domDocument.createElement( 'div' );
		shadowElement.setAttribute( 'class', 'ck ck-widget__resizer-shadow' );
		domElement.appendChild( shadowElement );

		return shadowElement;
	}

	_appendResizers( domElement ) {
		const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

		for ( const currentPosition of resizerPositions ) {
			// Use the IconView from the UI library.
			const icon = new IconView();
			icon.set( 'content', dragHandlerIcon );
			icon.extendTemplate( {
				attributes: {
					'class': `ck-widget__resizer ${ this._getResizerClass( currentPosition ) }`
				}
			} );

			// Make sure icon#element is rendered before passing to appendChild().
			icon.render();

			domElement.appendChild( icon.element );
		}
	}

	_dismissShadow() {
		this.domResizeShadow.classList.remove( 'ck-widget__resizer-shadow-active' );
		this.domResizeShadow.removeAttribute( 'style' );
	}

	/**
	 *
	 * @param {module:@ckeditor/ckeditor5-core/src/editor/editor~Editor} editor
	 * @param {module:@ckeditor/ckeditor5-engine/src/view/element~Element} widgetWrapperElement
	 * @returns {module:@ckeditor/ckeditor5-engine/src/model/element~Element|undefined}
	 */
	_getModel( editor, widgetWrapperElement ) {
		return editor.editing.mapper.toModelElement( widgetWrapperElement );
	}

	_extractCoordinates( event ) {
		return {
			x: event.domEvent.pageX,
			y: event.domEvent.pageY
		};
	}

	/**
	 * @private
	 * @param {String} resizerPosition Expected resizer position like `"top-left"`, `"bottom-right"`.
	 * @returns {String} A prefixed HTML class name for the resizer element
	 */
	_getResizerClass( resizerPosition ) {
		return `ck-widget__resizer-${ resizerPosition }`;
	}

	/**
	 * Determines the position of a given resize handler.
	 *
	 * @private
	 * @param {HTMLElement} domResizeHandler Handler used to calculate reference point.
	 * @returns {String|undefined} Returns a string like `"top-left"` or `undefined` if not matched.
	 */
	_getResizerPosition( domResizeHandler ) {
		const resizerPositions = [ 'top-left', 'top-right', 'bottom-right', 'bottom-left' ];

		for ( const position of resizerPositions ) {
			if ( domResizeHandler.classList.contains( this._getResizerClass( position ) ) ) {
				return position;
			}
		}
	}
}
