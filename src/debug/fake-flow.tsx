import React, { useEffect } from 'react';
import { FeatureSelector, TitleTypeForm } from '../issue-details';
import { useMonitoring } from '../monitoring';

export function FakeFlow() {
	const monitoring = useMonitoring();
	useEffect(
		() =>
			monitoring.analytics.recordEvent(
				'Page load (will fire twice due to React "Strict Mode" debugger)'
			),
		[ monitoring ]
	);
	return (
		<div>
			<div>
				<TitleTypeForm />
			</div>
			<div>
				<FeatureSelector />
			</div>
		</div>
	);
}
