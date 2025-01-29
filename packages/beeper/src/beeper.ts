// This is beeper.
// It's a wrapper around nodemailer that makes it easier to send emails.
// Why a wrapper? Well, we want to use the same config for nodemailer as we do for the rest of the app.
// Also if you don't have the config, it just outputs to the console. Which is nice for getting up and running. Meteor did this and I liked it.

// I'm having to do this import to get the config d.ts file to work so that way we get access to the config object types. If you know a better way to do this, please let me know.
// I'm sure you could do it, but I spent hours on it and got frustrated.
/// <reference types="@drop-in/plugin/global" />
// Change your import to use a namespace import:
import * as nodemailer from 'nodemailer';
import config from 'virtual:dropin-server-config';

// The beeper class could be used if you want, but you are probably better off just using nodemailer directly at that point. Use beeper instance to send emails configured with config.email
export class Beeper {
	transporter: nodemailer.Transporter | undefined;
	from: string | undefined;
	mode: 'PRINT' | 'SEND' = 'PRINT';
	constructor({
		host,
		port,
		secure,
		auth,
		from,
	}:
		| {
				host?: string;
				port?: number;
				secure?: boolean;
				auth?: { user: string; pass: string };
				from?: string;
		  }
		| undefined = {}) {
		console.log('host', host);
		console.log('config.email', config);
		if (host) {
			this.mode = 'SEND';
			this.transporter = nodemailer.createTransport({
				host,
				port,
				secure,
				auth,
			});
		} else if (config?.email?.host) {
			this.mode = 'SEND';
			this.transporter = nodemailer.createTransport(config?.email);
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
			console.log('Sending email', to, subject, html, from);
		}
	}
}

// This is the beeper that's configured in the global config file.
export const beeper = new Beeper(config?.email);
