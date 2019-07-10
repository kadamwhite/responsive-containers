/**
 * Find any elements on the page with data-responsive-container attributes,
 * and configure them with a ResizeObserver to add container size classes
 * to simulate container queries. See the blog post below for more info.
 * https://philipwalton.com/articles/responsive-components-a-solution-to-the-container-queries-problem/
 */
import ResizeObserver from 'resize-observer-polyfill';

// Default breakpoints that should apply to all observed
// elements that don't define their own custom breakpoints.
const defaultBreakpoints = {
	'container-sm': 320,
	'container-md': 576,
	'container-lg': 768,
	'container-xl': 960,
};

/**
 * Return the default breakpoints, or else node-specific breakpoints specified
 * through a `data-breakpoints` JSON string, formatted as a sorted array of
 * classname/size objects.
 *
 * @param {HTMLElement} node A DOM node.
 * @returns {Object} The breakpoints to use for this object.
 */
const getBreakpoints = node => {
	let breakpoints = defaultBreakpoints;
	if ( node && node.dataset && node.dataset.breakpoints ) {
		breakpoints = JSON.parse( node.dataset.breakpoints );
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
 * @returns {HTMLElement[]} Array of responsive-container DOM nodes.
 */
const getContainers = () => [ ...document.querySelectorAll( '[data-responsive-container]' ) ];

/**
 * Map that will be used to store bound containers, so they may be later
 * updated or swapped out.
 */
const containers = [];

/**
 * Calculate & assign the proper classes to a container based on its width.
 *
 * @param {HTMLElement} node    The DOM node for a responsive container.
 * @param {Number}      [width] (optional) The width of the container. Will be
 *                              computed from the provided node if not specified.
 */
const updateContainerClasses = ( node, width ) => {
	// If breakpoints are defined on the observed element,
	// use them. Otherwise use the defaults.
	const breakpoints = getBreakpoints( node );
	const nodeWidth = width || node.getBoundingClientRect().width;

	for ( let i = 0; i < breakpoints.length; i++ ) {
		const breakpoint = breakpoints[ i ];
		const nextBreakpoint = breakpoints[ i + 1 ] || { size: Infinity };
		node.classList.toggle(
			breakpoint.name,
			breakpoint.size < nodeWidth && nextBreakpoint.size > nodeWidth
		);
	}
};

// Create a single ResizeObserver instance to handle all
// container elements. The instance is created with a callback,
// which is invoked as soon as an element is observed as well
// as any time that element's size changes.
// Debounce to one change every 100ms.
const ro = new ResizeObserver( entries => {
	entries.forEach( entry => {
		updateContainerClasses( entry.target, entry.contentRect.width );
	} );
} );

/**
 * Find all responsive container elements on the page and begin observing
 * them for width changes.
 */
const updateResponsiveContainers = () => {
	// Unbind any previously-registered containers,
	containers.forEach( element => {
		ro.unobserve( element );
	} );
	// then empty out the list.
	containers.length = 0;

	// Re-populatethe list with the new containers as we register them.
	// Run the update method manually for each item as a safeguard.
	getContainers().forEach( container => {
		ro.observe( container );
		updateContainerClasses( container );
		containers.push( container );
	} );
};

// Run the discovery method once on initial load.
document.addEventListener( 'DOMContentLoaded', updateResponsiveContainers );

// Expose the update method so a recompute may be triggered should another
// module modify the document structure and add or remove a container.
window.updateResponsiveContainers = updateResponsiveContainers;
