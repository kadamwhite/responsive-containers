/* eslint-env node */
const { helpers, presets } = require( '@humanmade/webpack-helpers' );
const { filePath } = helpers;

module.exports = presets.production( {
	entry: filePath( 'src/responsive-containers' ),
	output: {
		path: filePath( 'build' ),
		filename: 'responsive-containers.js',
	},
} );
