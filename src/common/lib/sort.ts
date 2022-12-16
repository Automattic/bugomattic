interface EntityDictionary {
	[ entityId: string ]: {
		name: string;
	};
}

export function sortEntityIdsByName( entityIds: string[], entityDictionary: EntityDictionary ) {
	// Array sort makes the changes in place. We might be sorting some piece of state, which is directly immutable.
	// So to be safe and avoid any errors, let's make a copy to return.
	const copy = [ ...entityIds ];
	return copy.sort( ( idA, idB ) => {
		const nameA = entityDictionary[ idA ].name.toUpperCase();
		const nameB = entityDictionary[ idB ].name.toUpperCase();

		if ( nameA < nameB ) {
			return -1;
		}

		if ( nameA > nameB ) {
			return 1;
		}

		return 0;
	} );
}
