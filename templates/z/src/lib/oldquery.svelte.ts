import type { Query as QueryParam, QueryImpl, QueryType, Smash } from '@rocicorp/zero';
import type { Change, Entry, Format, Input, Output, View } from '@rocicorp/zero/advanced';
import type { TableSchema } from '@rocicorp/zero/schema';

// Editors Note:
// There is a lot of casting going on here. Much of which is based on zero-react.
// If you can solve some of these issues, please PR, but since it's how the Zero team is doing it
// I'm ok with it.
// - Scott

export class Query<TSchema extends TableSchema, TReturn extends QueryType> {
	// I have to do this casting because I can't create $state in the constructor and otherwise TS
	// will think non-sigular might be undefined (where they will be an array);
	data = $state() as unknown as Smash<TReturn>;
	q: QueryParam<TSchema, TReturn>;

	constructor(q: QueryParam<TSchema, TReturn>) {
		this.data = {} as unknown as Smash<TReturn>;
		this.q = q;

		// $effect(() => {
		const view = this.q.materialize(svelteViewFactory);
		console.log('view', view);
		this.data = view.data;
		// 	return () => {
		// 		view.destroy();
		// 	};
		// });
	}
}

export function svelteViewFactory<TSchema extends TableSchema, TReturn extends QueryType>(
	_query: Query<TSchema, TReturn>,
	input: Input,
	format: Format,
	onDestroy: () => void,
): SvelteView<Smash<TReturn>> {
	const v = new SvelteView<Smash<TReturn>>(input, format, onDestroy);
	return v;
}

class SvelteView<V extends View> implements Output {
	readonly #input: Input;
	readonly #format: Format;
	readonly #onDestroy: () => void;

	// Synthetic "root" entry that has a single "" relationship, so that we can
	// treat all changes, including the root change, generically.
	#root: Entry = $state({ '': undefined });

	constructor(
		input: Input,
		format: Format = { singular: false, relationships: {} },
		onDestroy: () => void = () => {},
	) {
		this.#input = input;
		this.#format = format;
		this.#onDestroy = onDestroy;
		this.#input.setOutput(this);
		this.#root = { '': format.singular ? undefined : [] };
		for (const node of this.#input.fetch({})) {
			applyChange(this.#root, { type: 'add', node }, this.#input.getSchema(), '', this.#format);
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

export function applyChange(parentEntry, change, schema, relationship, format) {
	if (schema.isHidden) {
		switch (change.type) {
			case 'add':
			case 'remove':
				for (const [relationship, children] of Object.entries(change.node.relationships)) {
					const childSchema = must(schema.relationships[relationship]);
					for (const node of children) {
						applyChange(
							parentEntry,
							{ type: change.type, node },
							childSchema,
							relationship,
							format,
						);
					}
				}
				return;
			case 'edit':
				// If hidden at this level it means that the hidden row was changed. If
				// the row was changed in such a way that it would change the
				// relationships then the edit would have been split into remove and
				// add.
				return;
			case 'child': {
				const childSchema = must(schema.relationships[change.child.relationshipName]);
				applyChange(parentEntry, change.child.change, childSchema, relationship, format);
				return;
			}
			default:
				unreachable(change);
		}
	}
	const { singular, relationships: childFormats } = format;
	switch (change.type) {
		case 'add': {
			// TODO: Only create a new entry if we need to mutate the existing one.
			const newEntry = {
				...change.node.row,
			};
			if (singular) {
				assertUndefined(parentEntry[relationship], 'single output already exists');
				parentEntry[relationship] = newEntry;
			} else {
				const view = parentEntry[relationship];
				assertArray(view);
				const { pos, found } = binarySearch(view, newEntry, schema.compareRows);
				assert(!found, 'node already exists');
				view.splice(pos, 0, newEntry);
			}
			for (const [relationship, children] of Object.entries(change.node.relationships)) {
				// TODO: Is there a flag to make TypeScript complain that dictionary access might be undefined?
				const childSchema = must(schema.relationships[relationship]);
				const childFormat = must(childFormats[relationship]);
				const newView = childFormat.singular ? undefined : [];
				newEntry[relationship] = newView;
				for (const node of children) {
					applyChange(newEntry, { type: 'add', node }, childSchema, relationship, childFormat);
				}
			}
			break;
		}
		case 'remove': {
			if (singular) {
				assertObject(parentEntry[relationship]);
				parentEntry[relationship] = undefined;
			} else {
				assertArray(parentEntry[relationship]);
				const view = parentEntry[relationship];
				const { pos, found } = binarySearch(view, change.node.row, schema.compareRows);
				assert(found, 'node does not exist');
				view.splice(pos, 1);
			}
			break;
		}
		case 'child': {
			let existing;
			if (singular) {
				assertObject(parentEntry[relationship]);
				existing = parentEntry[relationship];
			} else {
				assertArray(parentEntry[relationship]);
				const list = parentEntry[relationship];
				const { pos, found } = binarySearch(list, change.row, schema.compareRows);
				assert(found, 'node does not exist');
				existing = list[pos];
			}
			const childSchema = must(schema.relationships[change.child.relationshipName]);
			const childFormat = must(format.relationships[change.child.relationshipName]);
			applyChange(
				existing,
				change.child.change,
				childSchema,
				change.child.relationshipName,
				childFormat,
			);
			break;
		}
		case 'edit': {
			if (singular) {
				assertObject(parentEntry[relationship]);
				parentEntry[relationship] = {
					...parentEntry[relationship],
					...change.row,
				};
			} else {
				assertArray(parentEntry[relationship]);
				const view = parentEntry[relationship];
				// If the order changed due to the edit, we need to remove and reinsert.
				if (schema.compareRows(change.oldRow, change.row) === 0) {
					const { pos, found } = binarySearch(view, change.oldRow, schema.compareRows);
					assert(found, 'node does not exists');
					view[pos] = makeEntryPreserveRelationships(change.row, view[pos], schema.relationships);
				} else {
					// Remove
					const { pos, found } = binarySearch(view, change.oldRow, schema.compareRows);
					assert(found, 'node does not exists');
					const oldEntry = view[pos];
					view.splice(pos, 1);
					// Insert
					{
						const { pos, found } = binarySearch(view, change.row, schema.compareRows);
						assert(!found, 'node already exists');
						view.splice(
							pos,
							0,
							makeEntryPreserveRelationships(change.row, oldEntry, schema.relationships),
						);
					}
				}
			}
			break;
		}
		default:
			unreachable(change);
	}
}

export function must(v, msg) {
	// eslint-disable-next-line eqeqeq
	if (v == null) {
		throw new Error(msg ?? `Unexpected ${v} value`);
	}
	return v;
}

// TODO: Do not return an object. It puts unnecessary pressure on the GC.
function binarySearch(view, target, comparator) {
	let low = 0;
	let high = view.length - 1;
	while (low <= high) {
		const mid = (low + high) >>> 1;
		const comparison = comparator(view[mid], target);
		if (comparison < 0) {
			low = mid + 1;
		} else if (comparison > 0) {
			high = mid - 1;
		} else {
			return { pos: mid, found: true };
		}
	}
	return { pos: low, found: false };
}
function makeEntryPreserveRelationships(row, entry, relationships) {
	const result = { ...row };
	for (const relationship in relationships) {
		assert(!(relationship in row), 'Relationship already exists');
		result[relationship] = entry[relationship];
	}
	return result;
}
export function assert(b, msg = 'Assertion failed') {
	if (!b) {
		throw new Error(msg);
	}
}
export function assertString(v) {
	assertType(v, 'string');
}
export function assertNumber(v) {
	assertType(v, 'number');
}
export function assertBoolean(v) {
	assertType(v, 'boolean');
}
function assertType(v, t) {
	if (typeof v !== t) {
		throwInvalidType(v, t);
	}
}
export function assertObject(v) {
	if (v === null) {
		throwInvalidType(v, 'object');
	}
	assertType(v, 'object');
}
export function assertArray(v) {
	if (!Array.isArray(v)) {
		throwInvalidType(v, 'array');
	}
}
export function invalidType(v, t) {
	let s = 'Invalid type: ';
	if (v === null || v === undefined) {
		s += v;
	} else {
		s += `${typeof v} \`${v}\``;
	}
	return s + `, expected ${t}`;
}
export function throwInvalidType(v, t) {
	throw new Error(invalidType(v, t));
}
export function assertNotNull(v) {
	if (v === null) {
		throw new Error('Expected non-null value');
	}
}
export function assertUndefined(v, msg = 'Expected undefined value') {
	if (v !== undefined) {
		throw new Error(msg);
	}
}
export function assertNotUndefined(v, msg = 'Expected non undefined value') {
	if (v === undefined) {
		throw new Error(msg);
	}
}
export function assertInstanceof(v, t) {
	if (!(v instanceof t)) {
		throw new Error(`Expected instanceof ${t.name}`);
	}
}
export function assertUint8Array(v) {
	assertInstanceof(v, Uint8Array);
}
export function unreachable(_) {
	throw new Error('Unreachable');
}
export function notImplemented() {
	throw new Error('Not implemented');
}
