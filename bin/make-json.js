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

let currentProduct;

for ( const row of parsedCsv.data ) {
	const { name, isGroup, description, keywords, taskType, productName } = row;

	if ( ! outputJson[ productName ] ) {
		outputJson[ productName ] = {};
	}

	const product = outputJson[ productName ];

	if ( productName !== currentProduct ) {
		product.featureGroups = {};
		product.features = {};

		currentProduct = productName;
		lastFeatureGroup = null;
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
		lastFeatureGroup = name;
	} else {
		const task = createTask( row );

		// Check if the feature exists in featureGroups
		if ( lastFeatureGroup && product.featureGroups[ lastFeatureGroup ]?.features[ name ] ) {
			// If it exists in featureGroups, add the task to that feature
			product.featureGroups[ lastFeatureGroup ].features[ name ].tasks[ taskType ].push( task );
		} else {
			let feature;

			if (
				lastFeatureGroup &&
				product.featureGroups[ lastFeatureGroup ] &&
				product.featureGroups[ lastFeatureGroup ].features[ name ]
			) {
				// If the feature already exists in the active featureGroup, use that feature
				feature = product.featureGroups[ lastFeatureGroup ].features[ name ];
			} else {
				// Otherwise, check if the feature already exists in product.features
				feature = product.features[ name ];
			}

			if ( ! feature ) {
				feature = {
					description,
					tasks: {
						bug: [],
						featureRequest: [],
						urgent: [],
					},
				};

				if ( productName === 'WordPress.com' || productName === 'Jetpack' ) {
					feature.tasks.featureRequest.push( makeDefaultWordPressJetpackFeatureTask( row ) );
					feature.tasks.urgent.push( makeDefaultWordPressJetpackUrgentTask( row ) );
				}
			}

			const task = createTask( row );

			if ( ! ( taskType === 'bug' || taskType === 'urgent' || taskType === 'featureRequest' ) ) {
				throw new Error( `Invalid taskType: ${ taskType }` );
			}
			// Push the task into the appropriate task array
			feature.tasks[ taskType ].push( task );

			if ( hasLearnMoreData( row ) ) {
				feature.learnMoreLinks = makeLearnMoreLinks( row );
			}

			if ( keywords ) {
				feature.keywords = keywords.split( ',' ).map( ( keyword ) => keyword.trim() );
			}

			if (
				lastFeatureGroup &&
				product.featureGroups[ lastFeatureGroup ] &&
				! product.featureGroups[ lastFeatureGroup ].features[ name ]
			) {
				// If the feature is not already added to the active featureGroup, add it
				product.featureGroups[ lastFeatureGroup ].features[ name ] = feature;
			} else {
				// Add the feature to product.features
				product.features[ name ] = feature;
			}
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

function createTask( dataRow ) {
	const {
		name,
		taskType,
		taskTitle,
		taskDetails,
		linkType,
		linkHref,
		repository,
		template,
		jiraHostName,
		jiraProjectId,
		jiraIssueTypeId,
		productName,
	} = dataRow;

	if ( ! linkType ) {
		throw new Error( `Invalid linkType for: ${ name }` );
	}

	if ( taskType && linkType ) {
		const task = {};

		if ( taskTitle ) {
			task.title = taskTitle;
		}

		if ( taskDetails ) {
			task.details = taskDetails;
		}

		if ( linkType ) {
			task.link = {
				type: linkType,
			};
		}

		const defaultLabels = [
			`[Feature] ${ name.trim() }`,
			'[Type] Bug',
			'Needs triage',
			'User Report',
		];

		if ( linkType === 'github' ) {
			if ( repository ) task.link.repository = repository;
			if ( template ) task.link.template = template;
			const labels = getGitHubLabels( dataRow );
			if ( labels.length > 0 ) {
				task.link.labels = [ ...labels ];
			}
			const projectSlugs = getGitHubProjectSlugs( dataRow );
			if ( projectSlugs.length > 0 ) {
				task.link.projectSlugs = [ ...projectSlugs ];
			}

			if ( productName === 'WordPress.com' || productName === 'Jetpack' ) {
				if ( ! task.link.projectSlugs ) {
					task.link.projectSlugs = [];
				}
				task.link.projectSlugs.push( 'Automattic/343' );

				if ( ! task.link.labels ) {
					task.link.labels = [];
				}
				task.link.labels.push( ...defaultLabels );
			}
		} else if ( linkType === 'jira' ) {
			if ( jiraHostName ) task.link.hostName = jiraHostName;
			if ( jiraProjectId ) task.link.projectId = jiraProjectId;
			if ( jiraIssueTypeId ) task.link.issueTypeId = jiraIssueTypeId;
		} else if ( linkType === 'general' && linkHref ) {
			task.link.href = linkHref;
		} else if ( linkType === 'p2' && linkHref ) {
			task.link.subdomain = linkHref.replace( /^\+/, '' );
		} else if ( linkType === 'slack' && linkHref ) {
			task.link.channel = linkHref.replace( /^#/, '' );
		}

		return task;
	}
}

function getGitHubLabels( dataRow ) {
	const { labels } = dataRow;
	let outputLabels = [];
	if ( labels ) {
		outputLabels = labels.split( ',' ).map( ( label ) => label.trim() );
	}

	return outputLabels;
}

function getGitHubProjectSlugs( dataRow ) {
	const { projectSlugs } = dataRow;
	let outputProjectSlugs = [];
	if ( projectSlugs ) {
		outputProjectSlugs = projectSlugs.split( ',' ).map( ( slug ) => slug.trim() );
	}

	return outputProjectSlugs;
}

function makeDefaultWordPressJetpackFeatureTask( dataRow ) {
	const { name, repository } = dataRow;
	const defaultLabels = [ `[Feature] ${ name.trim() }`, '[Type] Feature Request' ];

	const template =
		repository === 'Automattic/jetpack' ? 'feature-request.yml' : 'feature_request.yml';
	return {
		link: {
			type: 'github',
			repository: repository,
			template: template,
			labels: [ ...defaultLabels, ...getGitHubLabels( dataRow ) ],
			projectSlugs: [ 'Automattic/343', ...getGitHubProjectSlugs( dataRow ) ],
		},
	};
}

function makeDefaultWordPressJetpackUrgentTask( dataRow ) {
	const { name, repository } = dataRow;
	const defaultLabels = [
		'[Pri] BLOCKER',
		`[Feature] ${ name.trim() }`,
		'[Type] Bug',
		'Needs triage',
		'User Report',
	];
	const template = repository === 'Automattic/jetpack' ? 'bug-report.yml' : 'bug_report.yml';
	return {
		link: {
			type: 'github',
			repository: repository,
			template: template,
			labels: [ ...defaultLabels, ...getGitHubLabels( dataRow ) ],
			projectSlugs: [ 'Automattic/343', ...getGitHubProjectSlugs( dataRow ) ],
		},
	};
}
