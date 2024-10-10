import crypto from 'crypto';
import { type AuthDataSource } from './types';
import bcrypt from 'bcryptjs';
import type { CookieSerializeOptions } from '@types/cookie';
import type { Session, User } from '$src/schema';
import { bcryptPassword, getPasswordString } from '../auth';
const { compare } = bcrypt;

export class AuthService {
	constructor(
		private dataSource: AuthDataSource,
		private options: { cookie: CookieSerializeOptions & { path: string } } = {
			cookie: {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict' as const,
				path: '/',
				maxAge: 30 * 24 * 60 * 60 * 1000,
			},
		},
	) {}

	async authenticateUser(
		sessionToken: string | undefined,
		updateCookie?: (options: CookieSerializeOptions & { path: string }) => void,
	): Promise<User | null> {
		if (!sessionToken) {
			return null;
		}

		const session = await this.dataSource.getSessionByToken(sessionToken);
		if (!session || this.isSessionExpired(session)) {
			await this.dataSource.deleteSession(sessionToken);
			return null;
		}

		const user = await this.dataSource.getUserById(session.userId);
		if (!user) {
			await this.dataSource.deleteSession(sessionToken);
			return null;
		}

		if (this.shouldExtendSession(session)) {
			await this.extendSession(sessionToken);
			if (updateCookie) updateCookie(this.options.cookie);
		}

		return user;
	}

	async verifyCurrentPassword(user_email: string, user_password: string): Promise<boolean> {
		const user = await this.dataSource.getUserByEmail(user_email, true);

		if (!user) {
			return false;
		}
		const passwordHash = crypto.createHash('sha256').update(user_password).digest('hex');
		return this.verifyPassword(passwordHash, user.hashedPassword);
	}

	async login(
		email: string,
		password: string,
	): Promise<{
		user: User;
		sessionToken: string;
		cookie_options: CookieSerializeOptions & { path: string };
	} | null> {
		const user = await this.dataSource.getUserByEmail(email, true);

		if (!user) {
			return null;
		}
		const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
		const isVerified = await this.verifyPassword(passwordHash, user.hashedPassword);
		if (!isVerified) {
			return null;
		}

		const sessionToken = this.generateSessionToken();
		const expirationDate = this.getNewExpirationDate();

		await this.dataSource.createSession(user.id, sessionToken, expirationDate);

		return { user, sessionToken, cookie_options: this.options.cookie };
	}

	async logout(
		sessionToken: string,
		clearCookie: (options: CookieSerializeOptions & { path: string }) => void,
	): Promise<void> {
		await this.dataSource.deleteSession(sessionToken);

		// Clear the session cookie
		clearCookie(this.options.cookie);
	}

	async signUp(
		email: string,
		password: string,
	): Promise<{
		user: User;
		sessionToken: string;
		cookie_options: CookieSerializeOptions & { path: string };
	} | null> {
		const normalizedEmail = this.normalizeEmail(email);

		if (!this.isValidEmail(normalizedEmail)) {
			throw new Error('Invalid email');
		}

		if (!this.checkIsPasswordValid(password)) {
			throw new Error('Invalid password');
		}

		try {
			// Check if user exists
			const userExists = await this.dataSource.getUserByEmail(normalizedEmail);

			if (userExists) {
				throw new Error('User already exists');
			}

			// Hash password
			const passwordHash: string = getPasswordString(password);

			// Salts the hashed password before saving to the db
			// Salt Password
			const passwordBcrypt: string = await bcryptPassword(passwordHash);

			// Create new user
			const newUser = await this.dataSource.createUser(normalizedEmail, passwordBcrypt);

			// Generate session token and create session
			const sessionToken = this.generateSessionToken();
			const expirationDate = this.getNewExpirationDate();
			await this.dataSource.createSession(newUser.id, sessionToken, expirationDate);

			return { user: newUser, sessionToken, cookie_options: this.options.cookie };
		} catch (e) {
			console.error('Error during sign up:', e);
			throw new Error(e.message);
		}
	}

	private normalizeEmail(email: string): string {
		// Implement email normalization logic here
		return decodeURIComponent(email).toLowerCase().trim();
	}

	private isValidEmail(maybeEmail: string): boolean {
		// Implement email validation logic here
		if (typeof maybeEmail !== 'string') return false;
		if (maybeEmail.length > 255) return false;
		const emailRegexp = /^.+@.+$/; // [one or more character]@[one or more character]
		return emailRegexp.test(maybeEmail);
	}

	private checkIsPasswordValid(password: string): boolean {
		return typeof password === 'string' && password.length >= 6 && password.length <= 255;
	}

	private async extendSession(sessionToken: string): Promise<void> {
		const newExpirationDate = this.getNewExpirationDate();
		await this.dataSource.extendSession(sessionToken, newExpirationDate);
	}

	private isSessionExpired(session: Session): boolean {
		return new Date() > new Date(session.expiresAt);
	}

	private shouldExtendSession(session: Session): boolean {
		const now = new Date();
		const sessionExpiry = new Date(session.expiresAt);
		const thresholdDate = new Date(now.getTime() + 365 * 60 * 60 * 1000); // 1 day from now
		return sessionExpiry < thresholdDate;
	}

	private getNewExpirationDate(): Date {
		const now = new Date();
		return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 7 days
	}

	private generateSessionToken(): string {
		return crypto.randomBytes(64).toString('hex');
	}

	private async verifyPassword(
		incoming_user_hashed_password: string,
		database_hashed_password: string,
	): Promise<boolean> {
		return compare(incoming_user_hashed_password, database_hashed_password);
	}
}
