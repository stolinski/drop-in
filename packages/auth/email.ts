import { RESEND_TOKEN, TOKEN_SECRET } from '$env/static/private';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { db } from '$src/hooks.server';
import { user, waitlist } from '$src/schema';

const resend = new Resend(RESEND_TOKEN);

export const isValidEmail = (maybeEmail: unknown): maybeEmail is string => {
	if (typeof maybeEmail !== 'string') return false;
	if (maybeEmail.length > 255) return false;
	const emailRegexp = /^.+@.+$/; // [one or more character]@[one or more character]
	return emailRegexp.test(maybeEmail);
};

export async function send_waitlist_invite(email: string) {
	// Send email with link
	resend.emails.send({
		from: 'no-reply@habitpath.io',
		to: email,
		subject: 'Track your habits now with Habit Path - Habit Path Now Open',
		html: `<p>
		Welcome to Habit Path, you can now sign up here: <a href="https://habitpath.io/signup">Habit Path Signup</a>
		</p>
		<p>Before asking for a feature, please check out <a href="https://habitpath.io/roadmap">Habit Path Roadmap</a> for information on what's changed and what's coming.</p>
		<p>Thank you, I hope you make positive change with Habit Path.</a>
		`,
	});

	// Update waitlist user sent property
	await db.update(waitlist).set({ invited: true }).where(eq(waitlist.email, email));
}

const createExpiringAuthDigest = (email: string, expirationTimestamp: number) => {
	const authString = `${TOKEN_SECRET}:${email}:${expirationTimestamp}`;
	return crypto.createHash('sha256').update(authString).digest('hex');
};

export function create_password_link(email: string): string {
	const expirationTimestamp = Date.now() + 1000 * 60 * 60 * 24;
	const authDigest = createExpiringAuthDigest(email, expirationTimestamp);
	const URIEncodedEmail = encodeURIComponent(email);
	return `https://habitpath.io/set-password?email=${URIEncodedEmail}&key=${authDigest}&expire=${expirationTimestamp}`;
}

export async function send_reset_password_email(email: string) {
	const set_password_url = create_password_link(email);
	// Send email with code
	resend.emails.send({
		from: 'no-reply@habitpath.io',
		to: email,
		subject: 'Habit Path Reset Email',
		html: `<p>
		A request was made on Habit Path to reset your password.
		</p>
		<p>To set your password, please click the set password link below.
          If you did not make this request to reset your password, 
          please contact our support team and we will assist to 
          ensure that your account is kept secure.</p>
		<p> <a href="${set_password_url}">Reset Password</a></p>
		`,
	});
}
function generate_verification_token() {
	const token = crypto.randomBytes(32).toString('hex');
	return token;
}

export async function send_verification_email(user_id: number) {
	const found_user = await db.select().from(user).where(eq(user.id, user_id)).execute();
	const email = found_user[0].email;
	const verificationToken = generate_verification_token();

	const verification_link = `https://habitpath.io/verify-email/${verificationToken}`;

	await resend.emails.send({
		from: 'no-reply@habitpath.io',
		to: email,
		subject: 'Verify your email - Habit Path',
		html: `<p>Please click the following link to verify your email:</p>
           <p><a href="${verification_link}">${verification_link}</a></p>
           <p>If you did not request this verification, please ignore this email.</p>`,
	});

	// Store the verification token in the database for later verification
	await db.update(user).set({ verificationToken }).where(eq(user.id, user_id)).execute();
}
