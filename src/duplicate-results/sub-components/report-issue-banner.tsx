import React from 'react';
import { ReactComponent as MegaphoneIllustration } from '../svgs/megaphone.svg';
import { Banner } from '../../common/components';
import styles from '../duplicate-results.module.css';

export function ReportIssueBanner() {
	return (
		<Banner className={ styles.banner }>
			<div className={ styles.bannerTextAndImage }>
				<MegaphoneIllustration className={ styles.bannerIllustration } />
				<div className={ styles.bannerTextWrapper }>
					<h3 className={ styles.bannerHeader }>{ "Couldn't find what you were looking for?" }</h3>
					<p className={ styles.bannerMessage }>
						File a bug or request a feature using our reporting tool.
					</p>
				</div>
			</div>
			<div className={ styles.bannerButtonWrapper }>
				<button>Report an Issue</button>
			</div>
		</Banner>
	);
}
