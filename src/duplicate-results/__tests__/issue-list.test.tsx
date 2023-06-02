import React from 'react';
import { render, screen } from '@testing-library/react';
import { IssueList } from '../sub-components/issue-list';
import { Issue } from '../types';

const twoDaysAgo = new Date();
twoDaysAgo.setDate( twoDaysAgo.getDate() - 2 );

const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth( threeMonthsAgo.getMonth() - 3 );

const mockIssue: Issue = {
	title: 'Test Issue Title',
	url: 'https://github.com/test/test/issues/1',
	content:
		'Fake issue content with two matches: <em data-search-match>foo</em> and <em data-search-match>bar</em>.',
	status: 'open',
	dateCreated: threeMonthsAgo.toISOString(),
	dateUpdated: twoDaysAgo.toISOString(),
	author: 'Fake Testing User',
	repo: 'Testorg/Testrepo',
};

describe( '[IssueList]', () => {
	test( 'Issue title is displayed correctly', () => {
		render( <IssueList issues={ [ mockIssue ] } /> );
		expect( screen.getByText( mockIssue.title ) ).toBeInTheDocument();
	} );

	test( 'Issue content is displayed correctly, including highlighting', () => {
		render( <IssueList issues={ [ mockIssue ] } /> );

		// Checking the preserved text content. Not doing "getByText" because it's broken into multiple elements.
		expect( screen.getByRole( 'listitem' ) ).toHaveTextContent(
			'Fake issue content with two matches: foo and bar.'
		);

		// Check the highlighting
		const matches = screen.getAllByTestId( 'highlighted-text-match' );
		expect( matches ).toHaveLength( 2 );
		expect( matches[ 0 ] ).toHaveTextContent( 'foo' );
		expect( matches[ 1 ] ).toHaveTextContent( 'bar' );
	} );

	test( 'Issue metadata is displayed correctly', () => {
		render( <IssueList issues={ [ mockIssue ] } /> );
		expect( screen.getByText( mockIssue.author ) ).toBeInTheDocument();
		expect( screen.getByText( 'Testrepo' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Created 3 months ago' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Updated 2 days ago' ) ).toBeInTheDocument();
	} );

	test( 'Issue link has correct URL', () => {
		render( <IssueList issues={ [ mockIssue ] } /> );
		const issueLink = screen.getByRole( 'link' );
		expect( issueLink ).toHaveAttribute( 'href', mockIssue.url );
	} );

	test( 'Displays the correct status icon and coloring class when issue is open', () => {
		render( <IssueList issues={ [ mockIssue ] } /> );
		expect( screen.getByTestId( 'open-icon' ) ).toBeInTheDocument();

		// I really don't like class assertions, but currently only way to test style change in our implementation.
		// If this is flaky or annoying over time, nuke it!
		expect( screen.getByRole( 'listitem' ) ).toHaveClass( 'openIssue' );
	} );

	test( 'Displays the correct status icon and coloring class when issue is closed', () => {
		const closedIssue: Issue = {
			...mockIssue,
			status: 'closed',
		};
		render( <IssueList issues={ [ closedIssue ] } /> );
		expect( screen.getByTestId( 'closed-icon' ) ).toBeInTheDocument();

		// I really don't like class assertions, but currently only way to test style change in our implementation.
		// If this is flaky or annoying over time, nuke it!
		expect( screen.getByRole( 'listitem' ) ).toHaveClass( 'closedIssue' );
	} );

	test( 'Displays all passed issues', () => {
		const issue1 = mockIssue;
		const issue2: Issue = {
			...mockIssue,
			title: 'Test Issue Title 2',
			url: 'https://github.com/test/test/issues/2',
		};
		const issue3: Issue = {
			...mockIssue,
			title: 'Test Issue Title 3',
			url: 'https://github.com/test/test/issues/3',
		};

		render( <IssueList issues={ [ issue1, issue2, issue3 ] } /> );
		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 3 );

		expect( screen.getByText( issue1.title ) ).toBeInTheDocument();
		expect( screen.getByText( issue2.title ) ).toBeInTheDocument();
		expect( screen.getByText( issue3.title ) ).toBeInTheDocument();
	} );
} );
