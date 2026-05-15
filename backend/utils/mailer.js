const { Resend } = require('resend');

async function sendPasswordResetEmail(toEmail, resetLink) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: 'WorkLog <onboarding@resend.dev>',
    to: toEmail,
    subject: 'WorkLog — Password Reset Request',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f1117;font-family:'IBM Plex Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
          style="background:#181c24;border:1px solid #262d3a;border-radius:12px;padding:40px;">
          <tr>
            <td>
              <p style="margin:0 0 4px 0;font-family:monospace;font-size:18px;color:#e8eaf0;letter-spacing:0.05em;">
                WORK<span style="color:#f5a623;">LOG</span>
              </p>
              <p style="margin:0 0 32px 0;font-size:12px;color:#556070;font-family:monospace;">
                Password Reset Request
              </p>
              <p style="font-size:14px;color:#8892a4;line-height:1.7;margin:0 0 16px 0;">
                Someone requested a password reset for your WorkLog account.
                This link expires in <strong style="color:#e8eaf0;">20 minutes</strong>.
              </p>
              <p style="margin:0 0 32px 0;">
                <a href="${resetLink}"
                  style="display:inline-block;background:#f5a623;color:#0f1117;font-weight:600;
                         font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
                  Reset my password
                </a>
              </p>
              <p style="font-size:12px;color:#556070;line-height:1.6;margin:0;">
                If the button doesn't work, paste this link into your browser:<br/>
                <span style="color:#8892a4;word-break:break-all;">${resetLink}</span>
              </p>
              <hr style="border:none;border-top:1px solid #262d3a;margin:28px 0 20px;" />
              <p style="font-size:11px;color:#556070;margin:0;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  if (error) {
    console.error('❌ Email FAILED:', error);
    throw new Error(error.message);
  }

  console.log('✅ Email sent to:', toEmail, '| ID:', data.id);
}

module.exports = { sendPasswordResetEmail };