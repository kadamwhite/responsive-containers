const { readFileSync, writeFileSync } = require( 'fs' );
const { resolve } = require( 'path' );

// Two-digit version strings only: throw out final digit (should always be 0).
const version = require( '../package.json' ).version.replace( /(\d+)\.(\d+)\.\d+/, '$1.$2' );

const filePath = path => resolve( process.cwd(), path );

// Read in the README front matter & the README.md content.
let readmeHeader = readFileSync( filePath( 'readme-header.txt' ) );
readmeHeader = readmeHeader.toString();
let readmeContent = readFileSync( filePath( 'README.md' ) );
readmeContent = readmeContent.toString();

// Convert README.md markdown into readme.txt-compatible formatting.
readmeContent = [
	[ /<!-- ignore -->[\s\S]*?<!-- \/ignore -->/g, '' ],
	[ /\n## ([^\n]+)/g, '\n== $1 ==' ],
	[ /\n```\n/g, '\n</code></pre>\n' ],
	[ /```[a-z]+/g, '<pre><code>' ],
].reduce(
	( str, [ pattern, replacement ] ) => str.replace( pattern, replacement ),
	readmeContent
);

// Merge readme header material & content.
readmeContent = `${
	readmeHeader.replace( '{VERSION}', version )
}

${ readmeContent }`.replace( /\n\n+/g, '\n\n' );

// Write generated README content to a temporary file.
writeFileSync( filePath( 'readme.tmp' ), readmeContent );
