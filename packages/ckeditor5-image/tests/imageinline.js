/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ImageInline from '../src/imageinline';
import ImageInlineEditing from '../src/image/imageinlineediting';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ImageTextAlternative from '../src/imagetextalternative';
import ImageInsertUI from '../src/imageinsert/imageinsertui';

describe( 'ImageInline', () => {
	let editorElement, editor;

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ImageInline, Paragraph ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageInline ) ).to.instanceOf( ImageInline );
		expect( editor.plugins.get( 'ImageInline' ) ).to.instanceOf( ImageInline );
	} );

	it( 'should load ImageInlineEditing plugin', () => {
		expect( editor.plugins.get( ImageInlineEditing ) ).to.instanceOf( ImageInlineEditing );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );

	it( 'should load ImageTextAlternative plugin', () => {
		expect( editor.plugins.get( ImageTextAlternative ) ).to.instanceOf( ImageTextAlternative );
	} );

	it( 'should load ImageInsertUI plugin', () => {
		expect( editor.plugins.get( ImageInsertUI ) ).to.instanceOf( ImageInsertUI );
	} );
} );
