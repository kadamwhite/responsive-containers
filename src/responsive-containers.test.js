import {
	getBreakpoints,
	updateContainerClasses,
} from './responsive-containers';

/**
 * Take a data object and stringify it as JSON, then replace quotation marks
 * with HTML entities so the string may be used as a data attribute.
 *
 * @param {Object} obj An object to stringify & escape.
 * @return {string} Stringified object.
 */
export const objToBreakpoints = ( obj ) => JSON.stringify( obj ).replace( /"/g, '&quot;' );

describe( 'getBreakpoints', () => {
	beforeAll( () => {
		/* eslint-disable indent */
		document.body.innerHTML = `
			<div id="no-overrides" data-responsive-container></div>
			<div id="has-overrides" data-responsive-container="${
				objToBreakpoints( {
					small: 400,
					huge: 1440,
					large: 800,
				} )
			}"></div>
		`;
		/* eslint-enable */
	} );

	it( 'is a function', () => {
		expect( getBreakpoints ).toBeInstanceOf( Function );
	} );

	it( 'returns a sorted array of default breakpoints when called with no arguments', () => {
		const result = getBreakpoints();
		expect( result ).toEqual( [
			{ name: 'container-sm', size: 0 },
			{ name: 'container-md', size: 420 },
			{ name: 'container-lg', size: 768 },
			{ name: 'container-xl', size: 1024 },
		] );
	} );

	it( 'returns a sorted array of default breakpoints when called with a DOM node specifying none of its own', () => {
		const result = getBreakpoints( document.getElementById( 'no-overrides' ) );
		expect( result ).toEqual( [
			{ name: 'container-sm', size: 0 },
			{ name: 'container-md', size: 420 },
			{ name: 'container-lg', size: 768 },
			{ name: 'container-xl', size: 1024 },
		] );
	} );

	it( 'returns a sorted array of custom breakpoints specified on a DOM node', () => {
		const result = getBreakpoints( document.getElementById( 'has-overrides' ) );
		expect( result ).toEqual( [
			{ name: 'small', size: 400 },
			{ name: 'large', size: 800 },
			{ name: 'huge', size: 1440 },
		] );
	} );
} );

describe( 'updateContainerClasses', () => {
	beforeEach( () => {
		/* eslint-disable indent */
		document.body.innerHTML = `
			<div id="container" data-responsive-container="${
				objToBreakpoints( {
					medium: 400,
					huge: 1440,
					large: 800,
				} )
			}"></div>
		`;
		/* eslint-enable */
	} );

	it( 'is a function', () => {
		expect( updateContainerClasses ).toBeInstanceOf( Function );
	} );

	it( 'sets the appropriate class on the element', () => {
		const node = document.getElementById( 'container' );
		updateContainerClasses( node, 320 );
		expect( node.classList.toString() ).toEqual( '' );
		updateContainerClasses( node, 520 );
		expect( node.classList.toString() ).toEqual( 'medium' );
		updateContainerClasses( node, 960 );
		expect( node.classList.toString() ).toEqual( 'large' );
		updateContainerClasses( node, 1440 );
		expect( node.classList.toString() ).toEqual( 'huge' );
		updateContainerClasses( node, 2501 );
		expect( node.classList.toString() ).toEqual( 'huge' );
	} );
} );
