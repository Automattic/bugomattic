import React from 'react';
import { useAppSelector } from '../app/hooks';
import { selectNormalizedReportingConfig } from '../reporting-config/reporting-config-slice';

interface Props {
	taskId: string;
}

export function Task( { taskId }: Props ) {
	const { tasks } = useAppSelector( selectNormalizedReportingConfig );
	const { title, details, link } = tasks[ taskId ];
}
