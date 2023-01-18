import React, { useCallback, useEffect, useState } from 'react';
import { FeatureSelectorForm } from '../feature-selector-form/feature-selector-form';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { NextSteps } from '../next-steps/next-steps';
import { StepContainer } from '../reporting-flow/step-container';
import { TitleTypeForm } from '../title-type-form/title-type-form';

function FakeStep() {
	const [ isActive, setIsActive ] = useState( false );

	const onContinue = () => setIsActive( false );
	const onEdit = useCallback( () => setIsActive( true ), [] );

	const activeContent = (
		<div>
			<p>This step is being edited currently.</p>
			<button className="primaryButton" onClick={ onContinue }>
				Continue
			</button>
		</div>
	);

	const inactiveContent = (
		<div>
			<p>This step is complete/inactive.</p>
		</div>
	);

	const stepContent = isActive ? activeContent : inactiveContent;

	return (
		<StepContainer
			stepNumber={ 1 }
			title="Fake Test Step"
			isComplete={ ! isActive }
			showEditButton={ ! isActive }
			onEdit={ onEdit }
		>
			{ stepContent }
		</StepContainer>
	);
}

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
			<div style={ { marginBottom: '32px' } }>
				<FakeStep />
			</div>
			<div>
				<TitleTypeForm />
			</div>
			<div style={ { marginTop: '48px' } }>
				<FeatureSelectorForm />
			</div>
			<div>
				<NextSteps />
			</div>
		</div>
	);
}
