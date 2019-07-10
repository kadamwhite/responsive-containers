/**
 * Find any elements on the page with data-responsive-container attributes,
 * and configure them with a ResizeObserver to add container size classes
 * to simulate container queries. See the blog post by Philip Walton linked
 * in the README for more information.
 */
import ResizeObserver from 'resize-observer-polyfill';

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

/**
 * Find all responsive container elements on the page and begin observing
 * them for width changes.
 */
const initializeResponsiveContainers = () => {
	// Populate the list with the new containers as we register them.
	// Run the update method manually for each item as a safeguard.
	getContainers().forEach( ( container ) => {
		ro.observe( container );
		// updateContainerClasses( container );
	} );
};

// Run the discovery method once on initial load.
document.addEventListener( 'DOMContentLoaded', initializeResponsiveContainers );
