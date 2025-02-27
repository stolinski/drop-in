/// <reference path="./app.d.ts" />

import { create_expiring_auth_digest } from './utils.js';
import { db } from './db.js';
import { user } from './schema.js';
import { eq } from 'drizzle-orm';
import { beeper } from '@drop-in/beeper';

export function create_password_link(email: string): string {
	const expirationTimestamp = Date.now() + 1000 * 60 * 60 * 24;
	const authDigest = create_expiring_auth_digest(email, expirationTimestamp);
	const URIEncodedEmail = encodeURIComponent(email);
	return `${DROP_IN.app.url}/set-password?email=${URIEncodedEmail}&key=${authDigest}&expire=${expirationTimestamp}`;
}

export async function send_reset_password_email(email: string) {
	const set_password_url = create_password_link(email);
	// Send email with code
	beeper.send({
		to: email,
		subject: `${DROP_IN.app.name} Reset Email`,
		html: `<p>  
		A request was made on ${DROP_IN.app.name} to reset your password.
		</p>
		<p>To set your password, please click the set password link below.
          If you did not make this request to reset your password, 
          please contact our support team and we will assist to 
          ensure that your account is kept secure.</p>
		<p> <a href="${set_password_url}">Reset Password</a></p>
		`,
	});
}

export async function send_verification_email(user_id: string) {
	const expirationTimestamp = Date.now() + 1000 * 60 * 60 * 24;
	const found_user = await db.select().from(user).where(eq(user.id, user_id)).execute();
	const email = found_user[0].email;
	const verification_token = create_expiring_auth_digest(email, expirationTimestamp);
	const URIEncodedEmail = encodeURIComponent(email);

	const verification_link = `${DROP_IN.app.url}/verify-email?token=${verification_token}&email=${URIEncodedEmail}&expire=${expirationTimestamp}`;

	await beeper.send({
		to: email,
		subject: `${DROP_IN.app.name} Verify Email`,
		html: `<p>Please click the following link to verify your email:</p>
           <p><a href="${verification_link}">${verification_link}</a></p>
           <p>If you did not request this verification, please ignore this email.</p>`,
	});

	// Store the verification token in the database for later verification
	await db
		.update(user)
		.set({ verification_token: verification_token })
		.where(eq(user.id, user_id))
		.execute();
}
