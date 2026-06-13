const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class EmailService {
  constructor() {
    this.transporter = null;
    this.useMock = true;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port: parseInt(port),
          auth: { user, pass },
          secure: port === "465"
        });
        this.useMock = false;
        logger.info("EmailService: SMTP Transporter initialized successfully.");
      } catch (err) {
        logger.error("EmailService: Failed to initialize SMTP Transporter. Falling back to Mock Logs.", err);
      }
    } else {
      logger.info("EmailService: SMTP credentials not fully provided. Initializing Mock Email Service.");
    }
  }

  async sendMail({ to, subject, html, text }) {
    if (this.useMock) {
      logger.info(`[MOCK EMAIL SENT]
To: ${to}
Subject: ${subject}
Text: ${text || "N/A"}
Html: ${html || "N/A"}
---------------------------------------`);
      return { messageId: `mock-${Date.now()}` };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"OpusFlow ERP" <no-reply@opusflow.com>',
        to,
        subject,
        text,
        html
      });
      logger.info(`EmailService: Email sent to ${to}, MessageID: ${info.messageId}`);
      return info;
    } catch (err) {
      logger.error(`EmailService: Failed to send email to ${to}`, err);
      throw err;
    }
  }

  async sendVerificationEmail(email, name, token, frontendUrl) {
    const verificationLink = `${frontendUrl}/verify/${token}`;
    const subject = "Verify your email for OpusFlow";
    const html = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2>Welcome ${name}!</h2>
        <p>We are excited to welcome you to <strong>OpusFlow</strong>.</p>
        <p>Please verify your email using the link below:</p>
        <p><a href="${verificationLink}" style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a></p>
        <p>If the button doesn't work, copy and paste the following link into your browser:</p>
        <p>${verificationLink}</p>
        <br/>
        <p>Best regards,<br/>OpusFlow Team</p>
      </div>
    `;
    const text = `Welcome ${name}! Please verify your email using the link: ${verificationLink}`;
    return this.sendMail({ to: email, subject, html, text });
  }

  async sendWelcomeEmail(email, employeeName) {
    const subject = "Welcome to OpusFlow!";
    const html = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2>Welcome ${employeeName}!</h2>
        <p>We are excited to welcome you to the team at <strong>OpusFlow</strong>.</p>
        <p>Your ERP portal account has been configured. You can now log in using your registered credentials to view your profile, apply for leaves, and track company assets.</p>
        <br/>
        <p>Best regards,<br/>HR Team<br/>OpusFlow</p>
      </div>
    `;
    const text = `Welcome ${employeeName}! We are excited to welcome you to the team at OpusFlow.`;
    return this.sendMail({ to: email, subject, html, text });
  }

  async sendLeaveStatusEmail(email, employeeName, leaveType, startDate, endDate, status) {
    const subject = `Leave Request Update: ${status.toUpperCase()}`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2>Hello ${employeeName},</h2>
        <p>Your leave request for <strong>${leaveType}</strong> from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been <strong>${status.toUpperCase()}</strong>.</p>
        <p>Please log in to the ERP portal to see details or contact your manager for questions.</p>
        <br/>
        <p>Best regards,<br/>HR Team<br/>OpusFlow</p>
      </div>
    `;
    const text = `Hello ${employeeName}, Your leave request for ${leaveType} from ${startDate} to ${endDate} has been ${status.toUpperCase()}.`;
    return this.sendMail({ to: email, subject, html, text });
  }

  async sendAssetEmail(email, employeeName, assetName, assetCode, actionType) {
    const isAllocation = actionType === "allocated" || actionType === "allocation";
    const subject = isAllocation ? "Asset Allocation Notification" : "Asset Return Acknowledgment";
    const html = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2>Hello ${employeeName},</h2>
        <p>This is to confirm that the asset <strong>${assetName} (${assetCode})</strong> has been successfully <strong>${isAllocation ? "allocated to you" : "returned by you"}</strong>.</p>
        <p>Please inspect the item and report any issues immediately to the IT support team.</p>
        <br/>
        <p>Best regards,<br/>IT & Assets Dept<br/>OpusFlow</p>
      </div>
    `;
    const text = `Hello ${employeeName}, The asset ${assetName} (${assetCode}) has been ${isAllocation ? "allocated to you" : "returned by you"}.`;
    return this.sendMail({ to: email, subject, html, text });
  }
}

module.exports = new EmailService();
