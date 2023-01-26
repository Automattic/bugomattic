import React from 'react';
import { createGeneralHref, createP2Href, createSlackHref } from '../../common/lib';
import { Feature, FeatureGroup, LearnMoreLink, Product } from '../../reporting-config/types';
import styles from '../next-steps.module.css';

interface Props {
	entity: Product | FeatureGroup | Feature;
}

export function EntityInfo( { entity }: Props ) {
	const { name, description, learnMoreLinks } = entity;

	const slackLinks = learnMoreLinks?.filter( ( link ) => link.type === 'slack' );
	const p2Links = learnMoreLinks?.filter( ( link ) => link.type === 'p2' );
	const generalLinks = learnMoreLinks?.filter( ( link ) => link.type === 'general' );

	function LinkList( { links }: { links: LearnMoreLink[] } ) {
		return (
			<ul>
				{ links.map( ( link, index ) => (
					<li
						className={ styles.moreInfoListItem }
						key={ `${ entity.id }_${ link.type }_${ index }` }
					>
						<a href={ createLinkHref( link ) }>
							{ link.displayText || getDefaultLinkText( link ) }
						</a>
					</li>
				) ) }
			</ul>
		);
	}

	return (
		<div className={ styles.moreInfoColumn }>
			<h5 className={ styles.moreInfoColumnHeader }>{ name }</h5>
			<div>
				{ description && (
					<div className={ styles.moreInfoColumnGroup }>
						<p>{ description }</p>
					</div>
				) }

				{ slackLinks && slackLinks.length > 0 && (
					<div className={ styles.moreInfoColumnGroup }>
						<h6 className={ styles.moreInfoColumnSubheader }>Slack</h6>
						<LinkList links={ slackLinks } />
					</div>
				) }

				{ p2Links && p2Links.length > 0 && (
					<div className={ styles.moreInfoColumnGroup }>
						<h6 className={ styles.moreInfoColumnSubheader }>P2</h6>
						<LinkList links={ p2Links } />
					</div>
				) }

				{ generalLinks && generalLinks.length > 0 && (
					<div className={ styles.moreInfoColumnGroup }>
						<h6 className={ styles.moreInfoColumnSubheader }>Other Links</h6>
						<LinkList links={ generalLinks } />
					</div>
				) }
			</div>
		</div>
	);
}

function createLinkHref( link: LearnMoreLink ): string {
	switch ( link.type ) {
		case 'general':
			return createGeneralHref( link );
		case 'slack':
			return createSlackHref( link );
		case 'p2':
			return createP2Href( link );
	}
}

function getDefaultLinkText( link: LearnMoreLink ): string {
	switch ( link.type ) {
		case 'general':
			return link.href;
		case 'slack':
			return `#${ link.channel }`;
		case 'p2':
			return `+${ link.subdomain }`;
	}
}
