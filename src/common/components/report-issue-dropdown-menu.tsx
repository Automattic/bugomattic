import React, { FunctionComponent, ReactElement, SVGProps, forwardRef, useCallback } from 'react';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from './dropdown';
import { IssueType } from '../../issue-details/types';
import { ReactComponent as BugIcon } from '../svgs/bug.svg';
import { ReactComponent as FeatureIcon } from '../svgs/megaphone.svg';
import { ReactComponent as UrgentIcon } from '../svgs/warning.svg';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setIssueType } from '../../issue-details/issue-details-slice';
import { setActiveReportingStep } from '../../reporting-flow-page/active-reporting-step-slice';
import { setActivePage } from '../../active-page/active-page-slice';
import { updateHistoryWithState } from '../../url-history/actions';
import { useMonitoring } from '../../monitoring/monitoring-provider';
import { ReportIssueLocation } from '../../issue-search/types';

import styles from './report-issue-dropdown-menu.module.css';
import { selectNextReportingStep } from '../../combined-selectors/next-reporting-step';

interface Props {
	children: ReactElement;
	location: ReportIssueLocation;
	additionalOnIssueTypeSelect?: ( issueType: IssueType ) => void;
}

interface IssueTypeDetails {
	value: IssueType;
	label: string;
	icon: FunctionComponent< SVGProps< SVGSVGElement > >;
}

// We are forwarding the ref here because in some parent components, we need to force focus on the trigger element.
export const ReportIssueDropdownMenu = forwardRef< HTMLElement, Props >(
	function ReportingIssueDropdownMenu(
		{ children, location, additionalOnIssueTypeSelect }: Props,
		ref
	) {
		const dispatch = useAppDispatch();
		const monitoringClient = useMonitoring();
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
				// In the future, if we re-use this dropdown apart from navigation from issue searching,
				// we may have defer more of these actions to calling components.
				dispatch( setIssueType( issueType ) );
				dispatch( setActiveReportingStep( nextReportingFlowStep ) );
				dispatch( setActivePage( 'report-issue' ) );
				dispatch( updateHistoryWithState() );

				const eventType =
					location === 'banner' ? 'banner_report_issue_start' : 'navbar_report_issue_start';
				monitoringClient.analytics.recordEvent( eventType, { issueType: issueType } );

				if ( additionalOnIssueTypeSelect ) {
					additionalOnIssueTypeSelect( issueType );
				}
			},
			[
				dispatch,
				monitoringClient.analytics,
				nextReportingFlowStep,
				location,
				additionalOnIssueTypeSelect,
			]
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
