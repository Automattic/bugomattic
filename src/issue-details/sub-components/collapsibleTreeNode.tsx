import React, { ReactNode, useEffect, useState } from 'react';
import styles from './../feature-selector.module.css';
import { ReactComponent as CollapsedIcon } from '../../common/svgs/chevron-right.svg';
import { ReactComponent as ExpandedIcon } from '../../common/svgs/chevron-down.svg';
import { useAppSelector } from '../../app';
import { selectReportingConfigSearchTerm } from '../../reporting-config';
import { replaceSpaces, SubstringHighlighter } from '../../common';

interface Props {
	collapsedContent: ReactNode;
	expandedContent: ReactNode;
	name: string;
}

export function CollapsibleTreeNode( { name, collapsedContent, expandedContent }: Props ) {
	const [ isExpanded, setIsExpanded ] = useState( false );
	const handleCollapseExpandToggle = () => setIsExpanded( ! isExpanded );

	// We need a unique ID for setting aria-controls. The name plus a random string should be plenty!
	const randomString = Math.random().toString( 16 ).slice( 2 );
	const contentId = `${ replaceSpaces( name ) }_${ randomString }`;

	let icon: React.ReactNode;
	if ( isExpanded ) {
		icon = <ExpandedIcon aria-hidden={ true } className={ styles.inlineIcon } />;
	} else {
		icon = <CollapsedIcon aria-hidden={ true } className={ styles.inlineIcon } />;
	}

	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	// Recollapse after every new search term
	useEffect( () => setIsExpanded( false ), [ searchTerm ] );

	return (
		<li>
			<button
				aria-expanded={ isExpanded }
				aria-controls={ contentId }
				className={ styles.treeNode }
				onClick={ handleCollapseExpandToggle }
			>
				{ icon }
				<SubstringHighlighter
					substring={ searchTerm }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ name }
				</SubstringHighlighter>
			</button>
			<div id={ contentId }>{ isExpanded ? expandedContent : collapsedContent }</div>
		</li>
	);
}
