import React, { FunctionComponent, ReactElement, SVGProps, forwardRef, useCallback } from 'react';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from './dropdown';
import { IssueType } from '../../issue-details/types';
import { ReactComponent as BugIcon } from '../svgs/bug-icon.svg';
import { ReactComponent as FeatureIcon } from '../svgs/megaphone-icon.svg';
import { ReactComponent as UrgentIcon } from '../svgs/warning-circle.svg';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setIssueType } from '../../issue-details/issue-details-slice';
import { setActiveReportingStep } from '../../reporting-flow-page/active-reporting-step-slice';
import { setActivePage } from '../../active-page/active-page-slice';
import { updateHistoryWithState } from '../../url-history/actions';

import styles from './report-issue-dropdown-menu.module.css';
import { selectNextReportingStep } from '../../combined-selectors/next-reporting-step';

interface Props {
	children: ReactElement;
	additionalOnIssueTypeSelect?: ( issueType: IssueType ) => void;
}

interface IssueTypeDetails {
	value: IssueType;
	label: string;
	icon: FunctionComponent< SVGProps< SVGSVGElement > >;
}

// We are forwarding the ref here because in some parent components, we need to force focus on the trigger element.
export const ReportIssueDropdownMenu = forwardRef< HTMLElement, Props >(
	function ReportingIssueDropdownMenu( { children, additionalOnIssueTypeSelect }: Props, ref ) {
		const dispatch = useAppDispatch();
		const nextReportingFlowStep = useAppSelector( selectNextReportingStep );
		const issueTypeOptions: IssueTypeDetails[] = [
			{
				value: 'bug',
				label: 'Report a bug',
				icon: BugIcon,
			},
			{
				value: 'feature-request',
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
			( issueType: IssueType ) => {
				// In the future, if we re-use this dropdown apart from navigation from duplicate searching,
				// we may have defer more of these actions to calling components.
				dispatch( setIssueType( issueType ) );
				dispatch( setActiveReportingStep( nextReportingFlowStep ) );
				dispatch( setActivePage( 'reportingFlow' ) );
				dispatch( updateHistoryWithState() );

				if ( additionalOnIssueTypeSelect ) {
					additionalOnIssueTypeSelect( issueType );
				}
			},
			[ dispatch, nextReportingFlowStep, additionalOnIssueTypeSelect ]
		);

		return (
			<Dropdown role="menu" placement="bottom">
				<DropdownTrigger ref={ ref }>{ children }</DropdownTrigger>
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
);
