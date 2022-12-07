import React, { useEffect } from 'react';
import { FeatureSelector } from '../issue-details/feature-selector';
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
			<h2>Select a feature:</h2>
			<FeatureSelector />
		</div>
	);
}
