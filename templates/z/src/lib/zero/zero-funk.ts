import type { Query, QueryImpl, QueryType, Smash, TableSchema } from '@rocicorp/zero';
import { deepClone } from './shared/deep-clone';

export function useQuery<TSchema extends TableSchema, TReturn extends QueryType>(
	q: Query<TSchema, TReturn>,
	enable: boolean = true,
): Smash<TReturn> {
	const queryImpl = q as QueryImpl<TSchema, TReturn>;
	let snapshot: Smash<TReturn> = $state(
		queryImpl.singular ? undefined : [],
	) as unknown as Smash<TReturn>;

	$effect(() => {
		if (enable) {
			const view = q.materialize();
			const unsubscribe = view.addListener((snap) => {
				snapshot = snap === undefined ? snap : (deepClone(snap) as Smash<TReturn>);
			});
			view.hydrate();
			return () => {
				unsubscribe();
				view.destroy();
			};
		}
		snapshot = (queryImpl.singular ? undefined : []) as unknown as Smash<TReturn>;

		return () => {};
	});

	return {
		get data() {
			return snapshot;
		},
	};
}
