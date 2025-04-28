import type { QueryType, Smash } from '@rocicorp/zero';
import {
	applyChange,
	type Change,
	type Format,
	type Input,
	type Output,
	type View,
	type Entry,
	type TableSchema
} from '@rocicorp/zero/advanced';
import type { Query } from 'pg';

export class SvelteView<V extends View> implements Output {
	readonly #input: Input;
	readonly #format: Format;
	readonly #onDestroy: () => void;

	// Synthetic "root" entry that has a single "" relationship, so that we can
	// treat all changes, including the root change, generically.
	readonly #root: Entry = $state({ '': undefined });

	constructor(
		input: Input,
		format: Format = { singular: false, relationships: {} },
		onDestroy: () => void = () => {}
	) {
		this.#input = input;
		this.#format = format;
		this.#onDestroy = onDestroy;
		this.#root = {
			'': format.singular ? undefined : []
		};
		input.setOutput(this);
		for (const node of input.fetch({})) {
			applyChange(this.#root, { type: 'add', node }, input.getSchema(), '', this.#format);
		}
	}

	get data() {
		return this.#root[''] as V;
	}

	destroy() {
		this.#onDestroy();
	}

	push(change: Change): void {
		applyChange(this.#root, change, this.#input.getSchema(), '', this.#format);
	}
}

export function svelteViewFactory<TSchema extends TableSchema, TReturn extends QueryType>(
	_query: Query<TSchema, TReturn>,
	input: Input,
	format: Format,
	onDestroy: () => void
): SvelteView<Smash<TReturn>> {
	const v = new SvelteView<Smash<TReturn>>(input, format, onDestroy);

	return v;
}
