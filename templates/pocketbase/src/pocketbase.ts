import PocketBase from 'pocketbase'
import type { TypedPocketBase } from '$types/pocketbase'
import { PUBLIC_PB_URL } from '$env/static/public'

export const pb = new PocketBase(PUBLIC_PB_URL) as TypedPocketBase
export const users = pb.collection('users')