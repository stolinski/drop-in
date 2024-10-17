import '@drop-in/plugin/global';
import nodemailer from 'nodemailer';

console.log('MAILER', global.drop_in_config);

export class Beeper {
	transporter: nodemailer.Transporter | undefined;
	from: string | undefined;
	constructor(
		mail_config: {
			host?: string;
			port?: number;
			secure?: boolean;
			auth?: { user: string; pass: string };
		} = {},
		from: string = global.drop_in_config.email?.from || '',
	) {
		if (mail_config.host) {
			this.transporter = nodemailer.createTransport(mail_config);
		} else if (global.drop_in_config.email) {
			this.transporter = nodemailer.createTransport(global.drop_in_config.email);
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
		if (this.transporter) {
			await this.transporter.sendMail({
				from,
				to,
				subject,
				html,
			});
		} else {
			console.log('Sending email', to, subject, html, from);
		}
	}
}

export const beeper = new Beeper();
