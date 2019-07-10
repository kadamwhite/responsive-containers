/**
 * Find any elements on the page with data-responsive-container attributes,
 * and configure them with a ResizeObserver to add container size classes
 * to simulate container queries. See the blog post by Philip Walton linked
 * in the README for more information.
 */
import ResizeObserver from 'resize-observer-polyfill';
import debounce from 'lodash.debounce';

// Default breakpoints that should apply to all observed
// elements that do not define their own custom breakpoints.
// Classes are exclusive: each class will apply up to its
// specified maximum value, but not above. A 500px-wide
// element therefore would only receive `.container-md`.
const defaultBreakpoints = {
	'container-sm': 0,
	'container-md': 520,
	'container-lg': 900,
	'container-xl': 1440,
};

/**
 * Take a data object and stringify it as JSON, then replace quotation marks
 * with HTML entities so the string may be used as a data attribute.
 *
 * @param {Object} obj An object to stringify & escape.
 * @return {string} Stringified object.
 */
export const responsiveContainerBreakpoints = ( obj ) => {
	// Clumsily sanitize the object by stripping non-numeric values.
	const sanitized = Object.keys( obj ).reduce(
		/* eslint-disable no-shadow */
		( sanitized, key ) => {
			if ( typeof obj[ key ] === 'number' ) {
				sanitized[ key ] = obj[ key ];
			}
			return sanitized;
		},
		/* eslint-enable */
		{}
	);
	return JSON.stringify( sanitized ).replace( /"/g, '&quot;' );
};

// Expose this method in the global scope.
window.responsiveContainerBreakpoints = responsiveContainerBreakpoints;

/**
 * Return the default breakpoints, or else node-specific breakpoints specified
 * through a `data-breakpoints` JSON string, formatted as a sorted array of
 * classname/size objects.
 *
 * @param {HTMLElement} node A DOM node.
 * @return {Object} The breakpoints to use for this object.
 */
export const getBreakpoints = ( node ) => {
	let breakpoints = defaultBreakpoints;
	if ( node && node.dataset && node.dataset.responsiveContainer ) {
		breakpoints = JSON.parse( node.dataset.responsiveContainer );
		if ( typeof breakpoints !== 'object' ) {
			// A data-attr written from React will often be set to `="true"`.
			breakpoints = defaultBreakpoints;
		}
	}
	return Object.keys( breakpoints ).reduce(
		( carry, className ) => carry.concat( {
			size: breakpoints[ className ],
			name: className,
		} ),
		[]
	).sort( ( a, b ) => a.size - b.size );
};

/**
 * Retrieve all nodes on the page with the `data-responsive-container` attribute.
 *
 * @return {HTMLElement[]} Array of responsive-container DOM nodes.
 */
const getContainers = () => [ ...document.querySelectorAll( '[data-responsive-container]' ) ];

/**
 * Calculate & assign the proper classes to a container based on its width.
 *
 * @param {HTMLElement} node    The DOM node for a responsive container.
 * @param {number}      [width] (optional) The width of the container. Will be
 *                              computed from the provided node if not specified.
 */
export const updateContainerClasses = ( node, width ) => {
	// If breakpoints are defined on the observed element,
	// use them. Otherwise use the defaults.
	const breakpoints = getBreakpoints( node );
	const nodeWidth = width || node.getBoundingClientRect().width;

	for ( let i = 0; i < breakpoints.length; i++ ) {
		const breakpoint = breakpoints[ i ];
		const nextBreakpoint = breakpoints[ i + 1 ] || { size: Infinity };
		node.classList.toggle(
			breakpoint.name,
			breakpoint.size <= nodeWidth && nextBreakpoint.size > nodeWidth
		);
	}
};

// Create a single ResizeObserver instance to handle all
// container elements. The instance is created with a callback,
// which is invoked as soon as an element is observed as well
// as any time that element's size changes.
const ro = new ResizeObserver( ( entries ) => {
	entries.forEach( ( entry ) => {
		updateContainerClasses( entry.target, entry.contentRect.width );
	} );
} );

// Maintain an internal list of containers so we can apply the observer
// to new elements as they're added to the page.
let containers = [];

/**
 * Find all responsive container elements on the page and begin observing
 * them for width changes.
 */
const initializeResponsiveContainers = () => {
	// Populate the list with the new containers as we register them.
	const activeContainers = {};
	getContainers().forEach( ( container ) => {
		const existingContainerIndex = containers.indexOf( container );
		if ( existingContainerIndex === -1 ) {
			// Container is new! Observe it.
			ro.observe( container );
			// Mark the incoming container as active.
			activeContainers[ containers.length ] = true;
			// Save a reference to the known container.
			containers.push( container );
		} else {
			activeContainers[ existingContainerIndex ] = true;
		}
	} );
	// Prune and unobserve containers which no longer appear on the page.
	containers = containers.filter( ( container, idx ) => {
		if ( ! activeContainers[ idx ] ) {
			ro.unobserve( container );
			return false;
		}
		return true;
	} );
};

// Run the discovery method once on initial load.
document.addEventListener( 'DOMContentLoaded', () => {
	initializeResponsiveContainers();

	// If the WordPress data module is present, periodially update our container
	// list when the editor store is altered.
	/* global wp:false */
	if ( window.wp && window.wp.data ) {
		// Create a debounced version of updateContainers, because the subscribe
		// callback can fire quite often. 100ms is a barely noticeable delay.
		const updateContainers = debounce( initializeResponsiveContainers, 100 );
		wp.data.subscribe( updateContainers );
	}
} );
