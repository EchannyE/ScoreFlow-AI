import nodemailer from 'nodemailer'
 
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) ?? 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})
 
export const send = ({ to, subject, html }) =>
  transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'noreply@scoreflow.ai',
    to, subject, html,
  })
 
export const submissionConfirmation = ({ name, email, title }) =>
  send({
    to:      email,
    subject: `Submission Received — ${title}`,
    html:    `<p>Hi ${name},</p>
              <p>Your submission <strong>${title}</strong> has been received and is being processed.</p>
              <p>— ScoreFlow AI</p>`,
  })
 
export const scoreReleased = ({ name, email, title, score }) =>
  send({
    to:      email,
    subject: `Results Ready — ${title}`,
    html:    `<p>Hi ${name},</p>
              <p>Your submission <strong>${title}</strong> has been evaluated.</p>
              <p><strong>Final Score: ${score} / 100</strong></p>
              <p>— ScoreFlow AI</p>`,
  })
 
export const evaluatorNudge = ({ name, email, pendingCount }) =>
  send({
    to:      email,
    subject: `${pendingCount} entries awaiting your review`,
    html:    `<p>Hi ${name},</p>
              <p>You have <strong>${pendingCount}</strong> pending entries in your queue.</p>
              <p><a href="${process.env.CLIENT_URL}/evaluator">Open Queue →</a></p>
              <p>— ScoreFlow AI</p>`,
  })
 
 