interface ContactEmail {
  name: string;
  email: string;
  subject?: string;
  message: string;
  attachmentUrl?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendContactEmail(recipient: string, submission: ContactEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error('Email delivery is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to .env.');
  }

  const subject = submission.subject || 'New portfolio contact submission';
  const attachmentLine = submission.attachmentUrl
    ? `\nAttachment: ${submission.attachmentUrl}`
    : '';
  const attachmentHtml = submission.attachmentUrl
    ? `<p><a href="${escapeHtml(submission.attachmentUrl)}">Open attachment</a></p>`
    : '';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: submission.email,
      subject,
      html: `
        <h2>New portfolio contact submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(submission.message).replace(/\n/g, '<br />')}</p>
        ${attachmentHtml}
      `,
      text: [
        `Name: ${submission.name}`,
        `Email: ${submission.email}`,
        `Subject: ${subject}`,
        '',
        submission.message,
        attachmentLine,
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend request failed: ${error}`);
  }
}
