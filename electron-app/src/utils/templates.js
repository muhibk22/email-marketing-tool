export const EMAIL_TEMPLATES = {
  modern: {
    name: 'Modern (Default)',
    render: (content, heading = '📢 New Update') => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f2f2f2;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:25px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;padding:30px;box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <tr>
          <td align="center" style="padding-bottom:20px;border-bottom: 2px solid #f0f0f0;">
            <h2 style="margin:0;color:#333;font-size:24px;">${heading}</h2>
          </td>
        </tr>
        <tr>
          <td style="font-size:16px;color:#444;line-height:1.6;padding: 25px 0;">
            ${content}
          </td>
        </tr>
        <!-- INLINE_IMAGES_PLACEHOLDER -->
        <tr>
          <td align="center" style="font-size:12px;color:#888;padding-top:25px;border-top: 1px solid #f0f0f0;">
            <p style="margin:0;">FES Gateway ${new Date().getFullYear()}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
  },

  corporate: {
    name: 'Corporate Blue',
    render: (content, heading = 'Official Communication') => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#ffffff;font-family: Helvetica, Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="background-color: #0056b3; padding: 20px 0;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${heading}</h1>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding: 40px 0;">
      <table width="600" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:16px;color:#333;line-height:1.5;">
            ${content}
          </td>
        </tr>
        <!-- INLINE_IMAGES_PLACEHOLDER -->
        <tr>
          <td style="padding-top: 30px; border-top: 2px solid #e9ecef; text-align: center;">
            <p style="font-size: 12px; color: #6c757d; margin-bottom: 10px;">
              FES Gateway ${new Date().getFullYear()}
            </p>
            <p style="font-size: 11px; color: #adb5bd; font-style: italic;">
              This message is intended for the addressee only and may contain confidential information.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
  },

  minimal: {
    name: 'Minimalist',
    render: (content, heading = '') => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#ffffff;font-family: Georgia, serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px;">
  <tr>
    <td align="center">
      <table width="500" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:18px;color:#222;line-height:1.8;">
            ${content}
          </td>
        </tr>
        <!-- INLINE_IMAGES_PLACEHOLDER -->
        <tr>
          <td style="padding-top: 40px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; margin-top: 40px;">
            <p style="letter-spacing: 1px; text-transform: uppercase;">FES Gateway ${new Date().getFullYear()}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
  }
};
