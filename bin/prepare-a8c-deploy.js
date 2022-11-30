/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require( 'fs' );
const path = require( 'path' );

/* 
Create React App is SO close to having everything we need for this application.
The main challenge is that it is very hardcoded in how it generates the production build files.
Everything else works great for Bugomattic and keeps things really clean and simple.

For deploying internally at a8c, we just need one directory of all the css and js files.
We also need those files to have the same static name overtime for easy deployment.
(We handle cache busting in our own way.)

Create React App includes content hashes in their build names, and outputs a more nested directory structure.

So, for now, to keep the many benefits of using Create React App (namely simplicity), we'll just massage
the output files into the structure we need with this script. The tradeoff makes sense for now.

In the future if we do end up needing to ditch Create React App, we can probably scrap this script in favor
of webpack configuration.
*/

const originalOutputDirectory = path.resolve( __dirname, '..', 'build' );
const targetOutputDirectory = path.resolve( __dirname, '..', 'dist' );

console.log(
	'Transforming the Create React App build output into deployment-ready directory for A8c...'
);
console.log( `Build files will be located at: ${ targetOutputDirectory }` );

if ( ! fs.existsSync( originalOutputDirectory ) ) {
	console.error(
		'Unable to find the build directory from Create React App. Did you run "react-scripts build" first?'
	);
	process.exit( 1 );
}

// Create a fresh output directory
if ( fs.existsSync( targetOutputDirectory ) ) {
	fs.rmSync( targetOutputDirectory, { recursive: true } );
}
fs.mkdirSync( targetOutputDirectory, { recursive: true } );

const originalCssDirectory = path.join( originalOutputDirectory, 'static', 'css' );
const originalJsDirectory = path.join( originalOutputDirectory, 'static', 'js' );

const allOriginalCssFiles = fs.readdirSync( originalCssDirectory );
const originalCssFilename = allOriginalCssFiles.find( ( filename ) => filename.endsWith( '.css' ) );
const originalCssMapFilename = allOriginalCssFiles.find( ( filename ) =>
	filename.endsWith( '.map' )
);

if ( originalCssFilename === undefined || originalCssMapFilename === undefined ) {
	console.error(
		`Unable to find expected css build files. Searched in directory: ${ originalCssDirectory }`
	);
	process.exit( 1 );
}

const allOriginalJsFiles = fs.readdirSync( originalJsDirectory );
const originalJsFilename = allOriginalJsFiles.find( ( filename ) => filename.endsWith( '.js' ) );
const originalJsMapFilename = allOriginalJsFiles.find( ( filename ) =>
	filename.endsWith( '.map' )
);

if ( originalJsFilename === undefined || originalJsMapFilename === undefined ) {
	console.error(
		`Unable to find expected js build files. Searched in directory: ${ originalJsDirectory }`
	);
	process.exit( 1 );
}

const targetCssFilename = 'bugomattic.bundle.css';
const targetCssMapFilename = 'bugomattic.bundle.css.map';
const targetJsFilename = 'bugomattic.bundle.js';
const targetJsMapFilename = 'bugomattic.bundle.js.map';

// We use these paths a lot later, so let's define them once now.
const targetCssPath = path.join( targetOutputDirectory, targetCssFilename );
const targetJsPath = path.join( targetOutputDirectory, targetJsFilename );

// Move and rename all the build files.
try {
	fs.renameSync( path.join( originalCssDirectory, originalCssFilename ), targetCssPath );

	fs.renameSync(
		path.join( originalCssDirectory, originalCssMapFilename ),
		path.join( targetOutputDirectory, targetCssMapFilename )
	);

	fs.renameSync( path.join( originalJsDirectory, originalJsFilename ), targetJsPath );

	fs.renameSync(
		path.join( originalJsDirectory, originalJsMapFilename ),
		path.join( targetOutputDirectory, targetJsMapFilename )
	);
} catch ( error ) {
	console.error(
		`Error occurred when trying to move and rename the build files. Original error: ${ error.toString() }`
	);
	process.exit( 1 );
}

// Swap out the map file reference in the CSS file
const cssContents = fs.readFileSync( targetCssPath, {
	encoding: 'utf-8',
} );
// Since we are using the Regex constructor with a string, we need to escape some symbols.
const regexSafeCssMapName = originalCssMapFilename.replace( /\./g, '\\.' );
// Including the 'sourceMappingUrl' gives us a bit more accuracy in making the swap.
const cssRegex = new RegExp( `sourceMappingURL=${ regexSafeCssMapName }`, 'm' );
const modifiedCss = cssContents.replace( cssRegex, `sourceMappingURL=${ targetCssMapFilename }` );
// We can easily check if we were actually successful!
if ( ! modifiedCss.endsWith( '/*# sourceMappingURL=bugomattic.bundle.css.map*/' ) ) {
	console.error( 'Unable to correctly replace the css map reference.' );
	process.exit( 1 );
}
fs.writeFileSync( targetCssPath, modifiedCss );

// Swap out the map file reference in the JS file.
const jsContents = fs.readFileSync( targetJsPath, {
	encoding: 'utf-8',
} );
const regexSafeJsMapName = originalJsMapFilename.replace( /\./g, '\\.' );
const jsRegex = new RegExp( `sourceMappingURL=${ regexSafeJsMapName }`, 'm' );
const modifiedJs = jsContents.replace( jsRegex, `sourceMappingURL=${ targetJsMapFilename }` );
if ( ! modifiedJs.endsWith( '//# sourceMappingURL=bugomattic.bundle.js.map' ) ) {
	console.error( 'Unable to correctly replace the js map reference.' );
	process.exit( 1 );
}
fs.writeFileSync( targetJsPath, modifiedJs );

// Finally, clean up the original build directory.
fs.rmSync( originalOutputDirectory, { recursive: true } );
