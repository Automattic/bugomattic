import React, { useEffect } from 'react';
import { FeatureSelectorForm } from '../feature-selector-form/feature-selector-form';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { NextSteps } from '../next-steps/next-steps';
import { TitleTypeForm } from '../title-type-form/title-type-form';

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
				<FeatureSelectorForm />
			</div>
			<div>
				<NextSteps />
			</div>
		</div>
	);
}
