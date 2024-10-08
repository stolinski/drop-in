// About JWT
// A JWT is not encrypted. It is based64 encoded and signed.
// So anyone can decode the token and use its data.
// A JWT's signature is used to verify that it is in fact from a legitimate source.
// https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
// https://blog.logrocket.com/jwt-authentication-best-practices/
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '$env/static/private';

export type JwtData = {
	token: string;
	isImpersonated: boolean;
	user_id: string;
};

// This is a *special* token that is embedded into the JWT
// That way we always know the request from the client is correctly validated
export const JWTSecretToken = TOKEN_SECRET;

const generateAccessToken = ({ secret, payload = {} }: { secret: jwt.Secret; payload?: any }) =>
	jwt.sign(payload, secret);

const generateRefreshToken = ({ secret, payload = {} }: { secret: jwt.Secret; payload?: any }) =>
	jwt.sign(payload, secret);

export async function createAccessToken({
	token,
	user_id,
}: {
	token: string;
	user_id: string;
}): Promise<string> {
	try {
		const jwtData = {
			token,
			user_id,
		};

		const accessToken = generateAccessToken({
			payload: jwtData,
			secret: JWTSecretToken,
		});
		return accessToken;
	} catch (e) {
		console.error(e);
		throw new Error('Create Access Token Failed');
	}
}

export function decode_access_token(accessToken: string): JwtData {
	return jwt.verify(accessToken, JWTSecretToken) as JwtData;
}

export function create_tokens({ token, user_id }: { token: string; user_id: number }) {
	const jwtData = {
		token,
		user_id,
	};

	const accessToken = generateAccessToken({
		payload: jwtData,
		secret: JWTSecretToken,
	});

	const refreshToken = generateRefreshToken({
		payload: {
			sessionToken: token,
		},
		secret: JWTSecretToken,
	});

	return { accessToken, refreshToken };
}
