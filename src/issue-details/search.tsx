import React, { useCallback, useState } from 'react';

interface Props {
	searchTerm: string;
	handleSearch: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
}

export function Search( { searchTerm, handleSearch }: Props ) {
	return <input type="search" value={ searchTerm } onChange={ handleSearch } />;
}
