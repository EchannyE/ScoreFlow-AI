import nodemailer from 'nodemailer'

const SMTP_PORT = Number(process.env.SMTP_PORT) || 587

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function verifyMailer() {
  try {
    await transporter.verify()
    console.log('✅ SMTP connection verified')
  } catch (err) {
    console.error('❌ SMTP connection failed:', err.message)
  }
}

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function assertRecipient(to) {
  if (!to || typeof to !== 'string' || !to.trim()) {
    throw new Error('Email recipient is required')
  }
}

export async function send({ to, subject, html, text }) {
  assertRecipient(to)

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'ScoreFlow AI <noreply@scoreflow.ai>',
      to: to.trim(),
      subject,
      html,
      text: text || stripHtml(html),
    })

    console.log(`📧 Email sent to ${to}: ${info.messageId}`)
    return info
  } catch (err) {
    console.error(`❌ Email failed for ${to}:`, err.message)
    throw err
  }
}

// ================================
// 📌 1. SUBMISSION CREATED
// ================================
export async function submissionCreatedEmail({
  name,
  email,
  title,
  track,
}) {
  return send({
    to: email,
    subject: `Submission Received — ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${name || 'there'},</p>

        <p>Your submission <strong>${title}</strong> has been received successfully.</p>

        <p>
          <strong>Track:</strong> ${track || 'Not specified'}<br/>
          <strong>Status:</strong> Submitted
        </p>

        <p>Our system is now processing your entry and preparing it for evaluation.</p>

        <p>Next steps:</p>
        <ul>
          <li>AI enrichment will run automatically</li>
          <li>Your project may be prioritized based on quality signals</li>
          <li>You will be notified again when scoring is complete</li>
        </ul>

        <p>— ScoreFlow AI</p>
      </div>
    `,
  })
}

// ================================
// 📌 2. SUBMISSION SCORED
// ================================
export async function submissionScoredEmail({
  name,
  email,
  title,
  score,
  track,
  topScore = false,
}) {
  return send({
    to: email,
    subject: topScore
      ? `Top Score Achieved — ${title}`
      : `Results Ready — ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${name || 'there'},</p>

        <p>Your submission <strong>${title}</strong> has been evaluated.</p>

        <p>
          <strong>Track:</strong> ${track || 'Not specified'}<br/>
          <strong>Final Score:</strong> ${score} / 100
        </p>

        ${
          topScore
            ? `<p><strong>Congratulations:</strong> your submission is among the top-scoring entries.</p>`
            : `<p>Thank you for participating in the evaluation process.</p>`
        }

        <p>— ScoreFlow AI</p>
      </div>
    `,
  })
}

// ================================
// 📌 3. EVALUATOR REMINDER
// ================================
export async function evaluatorReminderEmail({
  name,
  email,
  pendingCount,
  overload = false,
}) {
  const queueUrl = `${process.env.CLIENT_URL || ''}/evaluator`

  return send({
    to: email,
    subject: overload
      ? `Urgent Reminder — ${pendingCount} entries awaiting your review`
      : `${pendingCount} entr${pendingCount === 1 ? 'y is' : 'ies are'} awaiting your review`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${name || 'Evaluator'},</p>

        <p>You currently have <strong>${pendingCount}</strong> pending ${
          pendingCount === 1 ? 'entry' : 'entries'
        } awaiting review.</p>

        ${
          overload
            ? `<p><strong>Priority notice:</strong> your evaluation queue is above the normal threshold and needs attention.</p>`
            : `<p>Please return to your evaluation queue to complete scoring.</p>`
        }

        <p>
          <a href="${queueUrl}" style="color: #0ea5e9; text-decoration: none;">
            Open Evaluation Queue →
          </a>
        </p>

        <p>— ScoreFlow AI</p>
      </div>
    `,
  })
}

// ================================
// 📌 4. OPTIONAL ERROR EMAIL FALLBACK
// ================================
export async function systemErrorEmail({
  email,
  source,
  message,
}) {
  return send({
    to: email,
    subject: `System Alert — ${source || 'ScoreFlow AI'}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p><strong>System Alert</strong></p>

        <p><strong>Source:</strong> ${source || 'Unknown source'}</p>
        <p><strong>Message:</strong> ${message || 'No details provided.'}</p>

        <p>This is an automated fallback notification.</p>
      </div>
    `,
  })
    }
