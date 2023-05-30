/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require( 'fs' );
const path = require( 'path' );
const papa = require( 'papaparse' );

const outputJsonPath = path.resolve( __dirname, 'output.json' );
const inputCsvPath = path.resolve( __dirname, 'input.csv' );

const inputCsv = fs.readFileSync( inputCsvPath, { encoding: 'utf8' } );
const parsedCsv = papa.parse( inputCsv, { header: true } );

const jsonString = fs.readFileSync( outputJsonPath, { encoding: 'utf8' } );
const outputJson = JSON.parse( jsonString );

const productName = 'WordPress.com';
if ( ! outputJson[ productName ] ) {
	outputJson[ productName ] = {};
}

const product = outputJson[ productName ];

if ( ! product.featureGroups ) {
	product.featureGroups = {};
}

let lastFeatureGroup;
for ( const row of parsedCsv.data ) {
	const { name, isGroup, description, keywords } = row;
	if ( isGroup.toLowerCase() === 'yes' ) {
		const featureGroup = {
			description,
			features: {},
		};
		if ( hasLearnMoreData( row ) ) {
			featureGroup.learnMoreLinks = makeLearnMoreLinks( row );
		}

		product.featureGroups[ name ] = featureGroup;
		lastFeatureGroup = featureGroup;
	} else {
		const feature = {
			description,
		};

		if ( hasLearnMoreData( row ) ) {
			feature.learnMoreLinks = makeLearnMoreLinks( row );
		}

		if ( keywords ) {
			feature.keywords = keywords.split( ',' ).map( ( keyword ) => keyword.trim() );
		}

		const labelName = `[Feature] ${ name.trim() }`;
		feature.tasks = {
			bug: [
				{
					link: {
						type: 'github',
						repository: 'Automattic/wp-calypso',
						template: 'bug_report.yml',
						labels: [ labelName ],
						projectSlugs: [ 'Automattic/343' ],
					},
				},
			],
			featureRequest: [
				{
					link: {
						type: 'github',
						repository: 'Automattic/wp-calypso',
						template: 'feature_request.yml',
						labels: [ labelName ],
						projectSlugs: [ 'Automattic/343' ],
					},
				},
			],
			urgent: [
				{
					link: {
						type: 'github',
						repository: 'Automattic/wp-calypso',
						template: 'bug_report.yml',
						labels: [ '[Pri] BLOCKER', labelName ],
						projectSlugs: [ 'Automattic/343' ],
					},
				},
			],
		};

		lastFeatureGroup.features[ name ] = feature;
	}
}

fs.writeFileSync( outputJsonPath, JSON.stringify( outputJson, null, 2 ) );

function hasLearnMoreData( dataRow ) {
	const { slackChannels, p2s, otherLinks } = dataRow;
	return slackChannels || p2s || otherLinks;
}

function makeLearnMoreLinks( dataRow ) {
	const { slackChannels, p2s, otherLinks } = dataRow;
	const links = [];
	const slackChannelsArray = slackChannels.split( ',' );
	const p2sArray = p2s.split( ',' );
	const otherLinksArray = otherLinks.split( ',' );

	for ( const slackChannel of slackChannelsArray ) {
		if ( slackChannel && slackChannel.trim() ) {
			links.push( {
				type: 'slack',
				channel: slackChannel.trim(),
			} );
		}
	}

	for ( const p2 of p2sArray ) {
		if ( p2 && p2.trim() ) {
			links.push( {
				type: 'p2',
				subdomain: p2.trim(),
			} );
		}
	}

	for ( const otherLink of otherLinksArray ) {
		if ( otherLink && otherLink.trim() ) {
			links.push( {
				type: 'general',
				href: otherLink.trim(),
			} );
		}
	}

	return links;
}
