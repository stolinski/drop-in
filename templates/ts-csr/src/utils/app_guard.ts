import { pb } from "$/pocketbase"
import { settings } from "$settings"
import type { UsersResponse } from "$/types/pocketbase"
import { goto } from "$app/navigation"

// Sends users to the app if they try to access login or landing pages after logging in.
export function app_guard() {
	let user: UsersResponse | undefined
	if (pb.authStore.isValid) {
		user = pb.authStore.model as UsersResponse
	} else {
		user = undefined
	}

	if (user) {
		goto(settings.app_route)
	}
}