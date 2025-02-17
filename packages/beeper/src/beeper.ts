/// <reference path="./app.d.ts" />

// This is beeper.
// It's a wrapper around nodemailer that makes it easier to send emails.
// Why a wrapper? Well, we want to use the same config for nodemailer as we do for the rest of the app.
// Also if you don't have the config, it just outputs to the console. Which is nice for getting up and running. Meteor did this and I liked it.

// Change your import to use a namespace import:
import * as nodemailer from 'nodemailer';

// The beeper class could be used if you want, but you are probably better off just using nodemailer directly at that point. Use beeper instance to send emails configured with config.email
export class Beeper {
	transporter: nodemailer.Transporter | undefined;
	from: string | undefined;
	mode: 'PRINT' | 'SEND' = 'PRINT';
	constructor({
		host,
		port,
		secure,
		from,
	}:
		| {
				host?: string;
				port?: number;
				secure?: boolean;
				from?: string;
		  }
		| undefined = {}) {
		const auth = { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD };

		if (host) {
			this.mode = 'SEND';
			this.transporter = nodemailer.createTransport({
				host,
				port,
				secure,
				auth,
			});
		}
		this.from = from;
	}
	async send({
		to,
		subject,
		html,
		from = this.from,
	}: {
		to?: string;
		subject?: string;
		html?: string;
		from?: string;
	} = {}) {
		if (this.mode === 'SEND' && this.transporter) {
			try {
				await this.transporter.sendMail({
					from,
					to,
					subject,
					html,
				});
			} catch (error) {
				console.error('Error sending email', error);
			}
		} else {
			console.log(
				'Fake Email Send: If you indended this to be an actual email, you need to set email config in drop-in.config.json and the EMAIL_PASSWORD, EMAIL_USER env variables.',
				to,
				subject,
				html,
				from,
			);
		}
	}
}

export const beeper = new Beeper(DROP_IN.email);
