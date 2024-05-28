/// <reference types="@sveltejs/kit" />
import type { TypedPocketBase, UsersResponse } from './types/pocket-types'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare global {
	namespace App {
		interface Locals {
			pb: TypedPocketBase
			user: UsersResponse | undefined
		}
		// interface Platform {}
		// interface Session {}
		// interface Stuff {}
	}
}
