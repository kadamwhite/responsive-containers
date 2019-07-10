import {
	getBreakpoints,
	responsiveContainerBreakpoints,
	updateContainerClasses,
} from './responsive-containers';

describe( 'getBreakpoints', () => {
	beforeAll( () => {
		/* eslint-disable indent */
		document.body.innerHTML = `
			<div id="no-overrides" data-responsive-container></div>
			<div id="has-overrides" data-responsive-container="${
				responsiveContainerBreakpoints( {
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

describe( 'responsiveContainerBreakpoints', () => {
	it( 'is a function', () => {
		expect( responsiveContainerBreakpoints ).toBeInstanceOf( Function );
	} );

	it( 'serializes an object as escaped JSON', () => {
		const result = responsiveContainerBreakpoints( {
			small: 400,
			large: 2501,
		} );
		expect( typeof result ).toBe( 'string' );
		expect( result ).toEqual( '{&quot;small&quot;:400,&quot;large&quot;:2501}' );
	} );

	it( 'strips non-numeric values', () => {
		const result = responsiveContainerBreakpoints( {
			small: 400,
			medium: 'highly questionable',
			large: 2501,
			infinite: function madhax() {},
		} );
		expect( typeof result ).toBe( 'string' );
		expect( result ).toEqual( '{&quot;small&quot;:400,&quot;large&quot;:2501}' );
	} );
} );

describe( 'updateContainerClasses', () => {
	beforeEach( () => {
		/* eslint-disable indent */
		document.body.innerHTML = `
			<div id="container" data-responsive-container="${
				responsiveContainerBreakpoints( {
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
