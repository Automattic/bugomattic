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

let lastFeatureGroup;

for ( const row of parsedCsv.data ) {
	const { name, isGroup, description, keywords, labels, projectSlugs, productName } = row;

	if ( ! outputJson[ productName ] ) {
		outputJson[ productName ] = {};
	}

	const product = outputJson[ productName ];

	if ( ! product.featureGroups ) {
		product.featureGroups = {};
	}

	if ( ! product.features ) {
		product.features = {};
	}

	if ( isGroup.toLowerCase() === 'yes' ) {
		const featureGroup = {
			description,
			features: {},
		};

		if ( hasLearnMoreData( row ) ) {
			featureGroup.learnMoreLinks = makeLearnMoreLinks( row );
		}

		product.featureGroups[ name ] = featureGroup;
		lastFeatureGroup = name; // This should be name, not featureGroup
	} else {
		const feature = {
			description,
		};
		let additionalLabels = [];
		let projectSlugsList = [];

		if ( hasLearnMoreData( row ) ) {
			feature.learnMoreLinks = makeLearnMoreLinks( row );
		}

		if ( keywords ) {
			feature.keywords = keywords.split( ',' ).map( ( keyword ) => keyword.trim() );
		}

		if ( labels ) {
			additionalLabels = labels.split( ',' ).map( ( label ) => label.trim() );
		}

		if ( projectSlugs ) {
			projectSlugsList = projectSlugs.split( ',' ).map( ( slug ) => slug.trim() );
		}

		const labelName = `[Feature] ${ name.trim() }`;
		const { repository, bugTemplate, featureRequestTemplate } = getRepositoryAndTemplateData( row );

		feature.tasks = {
			bug: [
				{
					link: {
						type: 'github',
						repository: repository,
						template: bugTemplate,
						labels: [ labelName, ...additionalLabels ],
						projectSlugs: [ 'Automattic/343', ...projectSlugsList ],
					},
				},
			],
			featureRequest: [
				{
					link: {
						type: 'github',
						repository: repository,
						template: featureRequestTemplate,
						labels: [ labelName, ...additionalLabels ],
						projectSlugs: [ 'Automattic/343', ...projectSlugsList ],
					},
				},
			],
			urgent: [
				{
					link: {
						type: 'github',
						repository: repository,
						template: bugTemplate,
						labels: [ '[Pri] BLOCKER', labelName, ...additionalLabels ],
						projectSlugs: [ 'Automattic/343', ...projectSlugsList ],
					},
				},
			],
		};

		// Check if there's an active Feature Group to add the Feature to
		if ( lastFeatureGroup && product.featureGroups[ lastFeatureGroup ] ) {
			// If there's an active Feature Group, add the Feature to it
			product.featureGroups[ lastFeatureGroup ].features[ name ] = feature;
		} else {
			// If there's no active Feature Group, add the Feature to the Product
			product.features[ name ] = feature;
		}
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

function setRepositoryDefaults( productName, defaultValue ) {
	const defaultValues = {
		'WordPress.com': 'Automattic/wp-calypso',
		Jetpack: 'Automattic/jetpack',
	};
	return defaultValues[ productName ] || defaultValue;
}

function setTemplateDefaults( productName, defaultValue ) {
	const defaultValues = {
		'WordPress.com': 'bug_report.yml',
		Jetpack: 'bug-report.yml',
	};
	return defaultValues[ productName ] || defaultValue;
}

function getRepositoryAndTemplateData( dataRow ) {
	const { repository, productName, template } = dataRow;
	let featureRequestTemplateName = 'feature_request.yml';

	let repositoryLink =
		repository && repository.trim() !== '' ? repository : setRepositoryDefaults( productName, '' );

	let bugTemplateName =
		template && template.trim() !== ''
			? template
			: setTemplateDefaults( repositoryLink, 'bug_report.yml' );

	return {
		repository: repositoryLink,
		bugTemplate: bugTemplateName,
		featureRequestTemplate: featureRequestTemplateName,
	};
}
