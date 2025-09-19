// Example email implementations for different providers:

// For Node.js environments with nodemailer (install @drop-in/beeper for convenience):
// import { beeper } from '@drop-in/beeper';
// const sendEmail = async (options) => {
//   await beeper.send(options);
// };

// For Cloudflare Workers with Resend:
// const sendEmail = async ({ to, subject, html, from }) => {
//   const response = await fetch('https://api.resend.com/emails', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ to, subject, html, from }),
//   });
//   if (!response.ok) throw new Error(`Failed to send email: ${response.statusText}`);
// };

export default {
	email: {
		from: 'noreply@changeme.com',
		// Uncomment and configure one of the email implementations above:
		// sendEmail: sendEmail,
	},
	db: {
		url: process.env.DATABASE_URL
	},
	app: {
		public: {
			url: 'http://localhost:5173',
			name: 'Drop In',
			route: '/dashboard'
		}
	}
};
