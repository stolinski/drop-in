import type { Query as QueryParam, QueryType, Smash } from '@rocicorp/zero';
import { type TableSchema, type AdvancedQuery } from '@rocicorp/zero/advanced';
import { svelteViewFactory } from './svelte-view.svelte.js';

export class Query<TSchema extends TableSchema, TReturn extends QueryType> {
	data = $state() as unknown as Smash<TReturn>;
	q: QueryParam<TSchema, TReturn>;

	constructor(q: QueryParam<TSchema, TReturn>) {
		this.q = q;
		this.data = {} as unknown as Smash<TReturn>;

		// We probably don't need an effect here? maybe you would want one just to destroy on cleanup?
		// NOt sure the best way to handle this.

		const view = this.q.materialize(svelteViewFactory);
		this.data = view;
	}
}
