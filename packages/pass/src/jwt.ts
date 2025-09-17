import { jwtVerify, SignJWT } from 'jose';

export type JWTPayload = {
	sub: string;
	iat: number;
	exp?: number;
};

export async function create_jwt(user_id: string) {
	const jwtPayload: JWTPayload = {
		sub: user_id,
		iat: Math.floor(Date.now() / 1000),
	};

	return new SignJWT(jwtPayload)
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('15m')
		.sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

export async function verify_access_token(jwt: string): Promise<JWTPayload> {
	const { payload } = await jwtVerify(jwt, new TextEncoder().encode(process.env.JWT_SECRET));
	return payload as JWTPayload;
}
