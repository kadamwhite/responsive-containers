/* eslint-env node */
const { helpers, presets } = require( '@humanmade/webpack-helpers' );
const { filePath } = helpers;

// Build the same entrypoint twice, once using a development configuration
// to provide the bundle used when SCRIPT_DEBUG is true, and once for the
// normal optimized production build.
module.exports = [
	presets.development( {
		entry: filePath( 'src/responsive-containers' ),
		output: {
			path: filePath( 'build' ),
			filename: 'responsive-containers.js',
		},
	} ),
	presets.production( {
		entry: filePath( 'src/responsive-containers' ),
		output: {
			path: filePath( 'build' ),
			filename: 'responsive-containers.min.js',
		},
	} ),
];
