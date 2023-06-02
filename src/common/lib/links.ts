import {
	GeneralLink,
	NewGitHubIssueLink,
	NewJiraIssueLink,
	P2Link,
	SlackLink,
} from '../../static-data/reporting-config/types';
import urlJoin from 'url-join';

// We re-use some link data structures throughout the app. Let's centralize their santization to make sure they are safe.

export function createGeneralHref( link: GeneralLink ) {
	return new URL( link.href ).href;
}

export function createSlackHref( link: SlackLink ) {
	// In case people accidentally prefix with '#', strip it
	const trimmedChannel = link.channel.replace( /^#/, '' );
	const url = new URL( 'https://slack.com/app_redirect' );
	// Beyond trimming, there's not much else to do beyond make sure the query param is safely set.
	// If it's not a real channel, the link will just show an error saying as much.
	url.searchParams.append( 'channel', trimmedChannel );
	return url.href;
}

export function createP2Href( link: P2Link ) {
	// In case people accidentally prefix with '+', strip it
	const trimmedSubdomain = link.subdomain.replace( /^\+/, '' );
	// If it's not a valid subdomain, we need to throw.
	// We definitely don't want to try to sanitize and then send the user to some unknown subdomain!
	// Even if we can guarantee the wordpress.com domain, that's still bad form.
	const validSubdomainRegex = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
	if ( ! validSubdomainRegex.test( trimmedSubdomain ) ) {
		throw new Error( `Recieved an invalid p2 subdomain: ${ link.subdomain }.` );
	}
	const url = new URL( `https://${ trimmedSubdomain }.wordpress.com` );
	return url.href;
}

export function createNewGithubIssueHref( link: NewGitHubIssueLink, issueTitle?: string ) {
	// For safety, we don't really need to validate all the individual pieces here.
	// As long as we use the URL API and guarantee the root GitHub domain, we are safe.
	// Any broken pieces will just result in a Github 404 or the param being tossed out by Github.
	const url = new URL( 'https://github.com' );
	let pathEnd = 'new';
	if ( ! link.labels && ! link.projectSlugs && ! link.template ) {
		// If there's no other customization, lets default to the /choose route
		// which lets users pick a template.
		pathEnd = 'new/choose';
	}
	url.pathname = urlJoin( link.repository, 'issues', pathEnd );

	if ( issueTitle ) {
		url.searchParams.append( 'title', issueTitle );
	}

	if ( link.template ) {
		url.searchParams.append( 'template', link.template );
	}

	if ( link.projectSlugs && link.projectSlugs.length > 0 ) {
		url.searchParams.append( 'projects', link.projectSlugs.join( ',' ) );
	}

	if ( link.labels && link.labels.length > 0 ) {
		url.searchParams.append( 'labels', link.labels.join( ',' ) );
	}

	return url.href;
}

export function createNewJiraIssueHref( link: NewJiraIssueLink ) {
	// In case people accidentally prefix with 'https://', strip it
	const trimmedHostName = link.hostName.replace( /^https?:\/\//, '' );
	const url = new URL( `https://${ trimmedHostName }/secure/CreateIssueDetails!init.jspa` );
	// If the project ID or issue type is invalid, the link will just show an error saying as much.
	url.searchParams.append( 'pid', link.projectId.toString() );
	url.searchParams.append( 'issuetype', link.issueTypeId.toString() );
	return url.href;
}
