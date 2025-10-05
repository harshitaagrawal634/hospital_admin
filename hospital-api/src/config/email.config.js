/**
 * src/config/email.config.js
 * * Configures and exports the Nodemailer transporter for sending emails.
 */
const nodemailer = require('nodemailer');

// If credentials are provided, create a normal SMTP transporter synchronously.
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com', // e.g., 'smtp.gmail.com' for Gmail
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Your email address from .env
            pass: process.env.EMAIL_PASS  // Your email password or app-specific password from .env
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    module.exports = transporter;
} else {
    // Dev fallback: export a transporter-like object whose sendMail lazily creates
    // an Ethereal test account and transport. This keeps the API callback-compatible
    // so existing code (promisify(transporter.sendMail)) continues to work.
    console.warn('Email credentials (EMAIL_USER, EMAIL_PASS) are not set. Falling back to Ethereal test account for dev.');

    const fallback = {
        _client: null,
        _initPromise: null,
        // callback-style sendMail to remain compatible
        sendMail(mailOptions, cb) {
            const init = async () => {
                if (this._client) return this._client;
                const testAccount = await nodemailer.createTestAccount();
                this._client = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
                // attach test account for inspection if needed
                this._client.__testAccount = testAccount;
                console.log('Ethereal test account created (dev). You can view message previews in the console when sendMail is called.');
                return this._client;
            };

            if (!this._initPromise) {
                this._initPromise = init();
            }

            this._initPromise.then(client => client.sendMail(mailOptions, cb)).catch(cb);
        }
    };

    module.exports = fallback;
}
