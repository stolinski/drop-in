// Welcome to @drop-in/beeper
// This is the email package for drop-in.
// I grew up in the 90s and never had a beeper, but now I can.

// This is the main entry point for the package.
// Here we will export all the methods for the package.

// Beeper is largely a wrapper around nodemailer. It's designed to use your config as it's defaults. You can always just use nodemailer directly, but if you want to use @drop-in/pass, this works in conjunction with it.
// Right now Pass doesn't have hooks for sending emails, but it will. If you'd like to write that, you would probably have them be callbacks or something in the login functions. Well... anyways this package isn't about auth, so I'll stop talking about it.
export * from './beeper.js';
