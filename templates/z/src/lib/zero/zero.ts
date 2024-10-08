import type { Query as QueryParam, QueryImpl, QueryType, Smash, TableSchema } from '@rocicorp/zero';
import { deepClone } from './shared/deep-clone';

export class Query<TSchema extends TableSchema, TReturn extends QueryType> {
	#queryImpl: QueryImpl<TSchema, TReturn>;
	data: Smash<TReturn> | undefined = $state();

	constructor(q: QueryParam<TSchema, TReturn>, enable: boolean = true) {
		this.#queryImpl = q as unknown as QueryImpl<TSchema, TReturn>;
		this.data = this.#queryImpl.singular ? undefined : ([] as unknown as Smash<TReturn>);
		$effect(() => {
			if (enable) {
				const view = this.#queryImpl.materialize();
				const unsubscribe = view.addListener((snap: Smash<TReturn> | undefined) => {
					this.data = snap === undefined ? snap : (deepClone(snap) as Smash<TReturn>);
				});
				view.hydrate();
				return () => {
					unsubscribe();
					view.destroy();
				};
			}
			this.data = (this.#queryImpl.singular ? undefined : []) as unknown as Smash<TReturn>;
			return () => {};
		});
	}
}
