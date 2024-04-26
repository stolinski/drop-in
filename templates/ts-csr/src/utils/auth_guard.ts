import { pb } from "$/pocketbase"
import type { UsersResponse } from "$/types/pocketbase"
import { goto } from "$app/navigation"

export function auth_guard() {
	let user: UsersResponse | undefined
	if (pb.authStore.isValid) {
		user = pb.authStore.model as UsersResponse
	} else {
		user = undefined
	}

	if (!user) {
		goto('/login')
	}
}