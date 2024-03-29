import React, { ReactNode } from 'react';
import styles from './../feature-selector-form.module.css';
import { ReactComponent as CollapsedIcon } from '../../common/svgs/chevron-right.svg';
import { ReactComponent as ExpandedIcon } from '../../common/svgs/chevron-down.svg';

interface Props {
	children: ReactNode;
	label: ReactNode;
	description?: string;
	isExpanded: boolean;
	handleToggle: () => void;
}

export function ExpandableTreeNode( {
	label,
	children,
	isExpanded,
	handleToggle,
	description,
}: Props ) {
	// We need a unique ID for setting aria-controls and tooltip anchors.
	// This kind of random string should be plenty.
	// If needed in the future, we can crawl the label for text content and add that.
	const randomString = Math.random().toString( 16 ).slice( 2 );
	const contentId = `expandable-tree-node-content_${ randomString }`;
	const descriptionId = `expandable-tree-node-description_${ randomString }`;

	let icon: React.ReactNode;
	if ( isExpanded ) {
		icon = <ExpandedIcon aria-hidden={ true } className={ styles.inlineIcon } />;
	} else {
		icon = <CollapsedIcon aria-hidden={ true } className={ styles.inlineIcon } />;
	}

	return (
		<li>
			<button
				type="button"
				aria-expanded={ isExpanded }
				aria-controls={ contentId }
				className={ styles.treeNode }
				onClick={ handleToggle }
				aria-describedby={ descriptionId }
			>
				{ icon }
				<span
					className={ styles.treeNodeContentWrapper }
					data-tooltip-id="feature-tree-tooltip"
					data-tooltip-content={ description }
				>
					{ label }
				</span>
			</button>
			<span hidden={ true } id={ descriptionId }>
				{ description }
			</span>
			<div id={ contentId }>{ children }</div>
		</li>
	);
}
