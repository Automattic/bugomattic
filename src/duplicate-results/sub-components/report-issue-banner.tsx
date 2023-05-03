import React, { useCallback } from 'react';
import { ReactComponent as MegaphoneIllustration } from '../svgs/megaphone.svg';
import { Banner } from '../../common/components';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ReportIssueDropdownMenu } from '../../common/components/report-issue-dropdown-menu';
import { selectIssueType } from '../../issue-details/issue-details-slice';
import { ReactComponent as RightArrowIcon } from '../../common/svgs/arrow-right.svg';
import { ReactComponent as PlusIcon } from '../../common/svgs/plus.svg';
import { ReactComponent as DownChevronIcon } from '../../common/svgs/chevron-down.svg';
import styles from '../duplicate-results.module.css';
import { setActivePage } from '../../active-page/active-page-slice';
import { updateHistoryWithState } from '../../url-history/actions';

export function ReportIssueBanner() {
	const dispatch = useAppDispatch();
	const reportingIssueType = useAppSelector( selectIssueType );

	const handleSimpleButtonClick = useCallback( () => {
		dispatch( setActivePage( 'reportingFlow' ) );
		dispatch( updateHistoryWithState() );
	}, [ dispatch ] );

	const simpleButton = (
		<button className={ styles.bannerButton } onClick={ handleSimpleButtonClick }>
			<span className={ styles.bannerSimpleButtonText }>Report an Issue</span>
			<RightArrowIcon aria-hidden="true" className={ styles.bannerButtonIcon } />
		</button>
	);

	const buttonWithDropdown = (
		<ReportIssueDropdownMenu>
			<button className={ styles.bannerButton }>
				<PlusIcon aria-hidden="true" className={ styles.bannerButtonIcon } />
				<span>Report an Issue</span>
				<DownChevronIcon aria-hidden="true" className={ styles.bannerButtonIcon } />
			</button>
		</ReportIssueDropdownMenu>
	);

	const actionButton = reportingIssueType === 'unset' ? buttonWithDropdown : simpleButton;

	return (
		<Banner
			illustration={ <MegaphoneIllustration /> }
			header="Couldn't find what you were looking for?"
			message="File a bug or request a feature using our reporting tool"
			actionButton={ actionButton }
		/>
	);
}
