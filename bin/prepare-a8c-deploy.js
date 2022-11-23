/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require( 'fs' );
const path = require( 'path' );

const createReactAppOutputDirectory = path.resolve( __dirname, '..', 'build' );
const targetOutputDirectory = path.resolve( __dirname, '..', 'dist' );

if ( ! fs.existsSync( createReactAppOutputDirectory ) ) {
	console.error(
		'Unable to find the build directory from Create React App. Did you run "react-scripts build" first?'
	);
	process.exit( 1 );
}

if ( fs.existsSync( targetOutputDirectory ) ) {
	fs.rmSync( targetOutputDirectory, { recursive: true } );
}
fs.mkdirSync( targetOutputDirectory, { recursive: true } );

const cssDirectory = path.join( createReactAppOutputDirectory, 'static', 'css' );
const jsDirectory = path.join( createReactAppOutputDirectory, 'static', 'js' );

const allCssFiles = fs.readdirSync( cssDirectory );
const coreCssFilename = allCssFiles.find( ( filname ) => filname.endsWith( '.css' ) );
const cssMapFilename = allCssFiles.find( ( filname ) => filname.endsWith( '.map' ) );

const allJsFiles = fs.readdirSync( jsDirectory );
const coreJsFilename = allJsFiles.find( ( filname ) => filname.endsWith( '.js' ) );
const jsMapFilename = allJsFiles.find( ( filname ) => filname.endsWith( '.map' ) );

const targetOutputCssFilename = 'bugomattic.bundle.css';
const targetOutputCssMapFilename = 'bugomattic.bundle.css.map';
const targetOutputJsFilename = 'bugomattic.bundle.js';
const targetOutputJsMapFilename = 'bugomattic.bundle.js.map';

fs.renameSync(
	path.join( cssDirectory, coreCssFilename ),
	path.join( targetOutputDirectory, targetOutputCssFilename )
);

fs.renameSync(
	path.join( cssDirectory, cssMapFilename ),
	path.join( targetOutputDirectory, targetOutputCssMapFilename )
);

fs.renameSync(
	path.join( jsDirectory, coreJsFilename ),
	path.join( targetOutputDirectory, targetOutputJsFilename )
);

fs.renameSync(
	path.join( jsDirectory, jsMapFilename ),
	path.join( targetOutputDirectory, targetOutputJsMapFilename )
);

const cssContents = fs.readFileSync( path.join( targetOutputDirectory, targetOutputCssFilename ), {
	encoding: 'utf-8',
} );
const regexSafeCssMapName = cssMapFilename.replace( /\./g, '\\.' );
const cssRegex = new RegExp( `sourceMappingURL=${ regexSafeCssMapName }`, 'm' );
const modifiedCss = cssContents.replace(
	cssRegex,
	`sourceMappingURL=${ targetOutputCssMapFilename }`
);
fs.writeFileSync( path.join( targetOutputDirectory, targetOutputCssFilename ), modifiedCss );

const jsContents = fs.readFileSync( path.join( targetOutputDirectory, targetOutputJsFilename ), {
	encoding: 'utf-8',
} );
const regexSafeJsMapName = jsMapFilename.replace( /\./g, '\\.' );
const jsRegex = new RegExp( `sourceMappingURL=${ regexSafeJsMapName }`, 'm' );
const modifiedJs = jsContents.replace( jsRegex, `sourceMappingURL=${ targetOutputJsMapFilename }` );
fs.writeFileSync( path.join( targetOutputDirectory, targetOutputJsFilename ), modifiedJs );

fs.rmSync( createReactAppOutputDirectory, { recursive: true } );
