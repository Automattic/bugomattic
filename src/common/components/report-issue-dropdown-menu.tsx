import React, { FunctionComponent, ReactElement, SVGProps, useCallback } from 'react';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from './dropdown';
import { IssueType } from '../../issue-details/types';
import { ReactComponent as BugIcon } from '../svgs/bug-icon.svg';
import { ReactComponent as FeatureIcon } from '../svgs/megaphone-icon.svg';
import { ReactComponent as UrgentIcon } from '../svgs/warning-circle.svg';
import { useAppDispatch } from '../../app/hooks';
import { setIssueType } from '../../issue-details/issue-details-slice';
import { setActiveReportingStep } from '../../reporting-flow-page/active-reporting-step-slice';
import { setActivePage } from '../../active-page/active-page-slice';
import { updateHistoryWithState } from '../../url-history/actions';
import { ActiveReportingStep } from '../../reporting-flow-page/types';

import styles from './report-issue-dropdown-menu.module.css';

interface Props {
	children: ReactElement;
	reportingFlowStep?: ActiveReportingStep;
}

interface IssueTypeDetails {
	value: IssueType;
	label: string;
	icon: FunctionComponent< SVGProps< SVGSVGElement > >;
}

export function ReportIssueDropdownMenu( { children, reportingFlowStep }: Props ) {
	const dispatch = useAppDispatch();
	const issueTypeOptions: IssueTypeDetails[] = [
		{
			value: 'bug',
			label: 'Report a bug',
			icon: BugIcon,
		},
		{
			value: 'featureRequest',
			label: 'Request a new feature',
			icon: FeatureIcon,
		},
		{
			value: 'urgent',
			label: 'Escalate something urgent',
			icon: UrgentIcon,
		},
	];

	const handleIssueTypeClick = useCallback(
		( issueType: string ) => {
			dispatch( setIssueType( issueType as IssueType ) );
			if ( reportingFlowStep ) {
				dispatch( setActiveReportingStep( 'featureSelection' ) );
			}
			dispatch( setActivePage( 'reportingFlow' ) );
			dispatch( updateHistoryWithState() );
		},
		[ dispatch, reportingFlowStep ]
	);

	return (
		<Dropdown role="menu" placement="bottom">
			<DropdownTrigger>{ children }</DropdownTrigger>
			<DropdownContent>
				{ issueTypeOptions.map( ( { value, label, icon: Icon } ) => (
					<DropdownItem
						key={ value }
						typeaheadLabel={ label }
						role="menuitem"
						onClick={ () => handleIssueTypeClick( value ) }
						className={ styles.menuItem }
					>
						<Icon aria-hidden="true" className={ styles.icon }></Icon>
						<span>{ label }</span>
					</DropdownItem>
				) ) }
			</DropdownContent>
		</Dropdown>
	);
}
