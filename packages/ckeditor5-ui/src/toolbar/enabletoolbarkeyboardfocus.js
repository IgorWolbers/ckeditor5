/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console */

/**
 * @module ui/toolbar/enabletoolbarkeyboardfocus
 */

/**
 * Enables focus/blur toolbar navigation using `Alt+F10` and `Esc` keystrokes.
 *
 * @deprecated
 * @param {Object} options Options of the utility.
 * @param {*} options.origin A view to which the focus will return when `Esc` is pressed and
 * `options.toolbar` is focused.
 * @param {module:utils/keystrokehandler~KeystrokeHandler} options.originKeystrokeHandler A keystroke
 * handler to register `Alt+F10` keystroke.
 * @param {module:utils/focustracker~FocusTracker} options.originFocusTracker A focus tracker
 * for `options.origin`.
 * @param {module:ui/toolbar/toolbarview~ToolbarView} options.toolbar A toolbar which is to gain
 * focus when `Alt+F10` is pressed.
 * @param {Function} [options.beforeFocus] A callback executed before the `options.toolbar` gains focus
 * upon the `Alt+F10` keystroke.
 * @param {Function} [options.afterBlur] A callback executed after `options.toolbar` loses focus upon
 * `Esc` keystroke but before the focus goes back to `options.origin`.
 */
export default function enableToolbarKeyboardFocus( {
	origin,
	originKeystrokeHandler,
	originFocusTracker,
	toolbar,
	beforeFocus,
	afterBlur
} ) {
	/**
	 * The {@link module:ui/toolbar/enabletoolbarkeyboardfocus~enableToolbarKeyboardFocus} helper has been deprecated and will be
	 * removed in the near future. Please use {@link module:core/editor/editorui~EditorUI#registerFocusableToolbar} instead
	 * to enable focus navigation to and from the toolbar using `Alt+F10` and `Esc` keystrokes.
	 *
	 * @param {module:ui/toolbar/toolbarview~ToolbarView} toolbar The toolbar the helper was enabled for.
	 * @param {*} origin A view to which the focus would return on `Esc` from the `toolbar`.
	 * @error ui-toolbar-enabletoolbarkeyboardfocus-deprecated
	 */
	console.warn(
		'ui-toolbar-enabletoolbarkeyboardfocus-deprecated: ' +
		'The enableToolbarKeyboardFocus() helper has been deprecated and will be removed in the near future. ' +
		'Please use EditorUI#registerFocusableToolbar() to enable focus navigation to and from the toolbar.', { origin, toolbar } );

	// Because toolbar items can get focus, the overall state of the toolbar must
	// also be tracked.
	originFocusTracker.add( toolbar.element );

	// Focus the toolbar on the keystroke, if not already focused.
	originKeystrokeHandler.set( 'Alt+F10', ( data, cancel ) => {
		if ( originFocusTracker.isFocused && !toolbar.focusTracker.isFocused ) {
			if ( beforeFocus ) {
				beforeFocus();
			}

			toolbar.focus();

			cancel();
		}
	} );

	// Blur the toolbar and bring the focus back to origin.
	toolbar.keystrokes.set( 'Esc', ( data, cancel ) => {
		if ( toolbar.focusTracker.isFocused ) {
			origin.focus();

			if ( afterBlur ) {
				afterBlur();
			}

			cancel();
		}
	} );
}
