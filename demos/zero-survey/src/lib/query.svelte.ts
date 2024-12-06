import type { Query as QueryParam, QueryImpl, QueryType, Smash } from '@rocicorp/zero';
import { type TableSchema } from '@rocicorp/zero/advanced';

// Editors Note:
// There is a lot of casting going on here. Much of which is based on zero-react.
// If you can solve some of these issues, please PR, but since it's how the Zero team is doing it
// I'm ok with it.
// - Scott

export class Query<TSchema extends TableSchema, TReturn extends QueryType> {
	#queryImpl: QueryImpl<TSchema, TReturn>;
	// I have to do this casting because I can't create $state in the constructor and otherwise TS
	// will think non-sigular might be undefined (where they will be an array);
	data = $state() as unknown as Smash<TReturn>;
	#onChangeCallback?: (snap: Smash<TReturn>) => void;

	constructor(q: QueryParam<TSchema, TReturn>, enable: boolean = true) {
		this.#queryImpl = q as unknown as QueryImpl<TSchema, TReturn>;
		this.data = (this.#queryImpl.singular ? undefined : []) as unknown as Smash<TReturn>;

		$effect(() => {
			const view: QueryImpl<TSchema, TReturn> = this.#queryImpl.materialize();
			const unsubscribe = view.addListener((snap) => {
				this.data = (snap === undefined ? snap : $state.snapshot(snap)) as Smash<TReturn>;
				if (this.#onChangeCallback) {
					this.#onChangeCallback(this.data);
				}
			});
			return () => {
				unsubscribe();
			};
		});

		this.data = (this.#queryImpl.singular ? undefined : []) as unknown as Smash<TReturn>;
	}
	onChange(callback: (snap: Smash<TReturn>) => void) {
		this.#onChangeCallback = callback;
	}
}
