export const verifyEmail = ({ otp, title }: { otp: string; title: string }): string => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:40px 0;">
            <table width="600" border="0" cellspacing="0" cellpadding="0" 
              style="background:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">
              
              <!-- Header -->
              <tr>
                <td align="center" style="background:#630E2B;padding:30px;">
                  <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png" 
                    alt="Logo" width="80" style="display:block;" />
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td align="center" style="padding:30px 20px 10px 20px;">
                  <h1 style="margin:0;color:#222;font-size:24px;font-weight:600;">${title}</h1>
                </td>
              </tr>
  
              <!-- Message -->
              <tr>
                <td align="center" style="padding:0 40px 20px 40px;color:#555;font-size:15px;line-height:1.6;">
                  <p>Please use the following code to complete your verification process:</p>
                </td>
              </tr>
  
              <!-- OTP -->
              <tr>
                <td align="center" style="padding:20px;">
                  <div style="display:inline-block;background:#630E2B;color:#fff;
                    font-size:28px;letter-spacing:4px;padding:15px 30px;
                    border-radius:8px;font-weight:bold;">
                    ${otp}
                  </div>
                </td>
              </tr>
  
              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding:20px;">
                  <a href="http://localhost:4200/#/" target="_blank" 
                    style="background:#630E2B;color:#fff;text-decoration:none;
                    padding:12px 24px;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">
                    Verify Account
                  </a>
                </td>
              </tr>
  
              <!-- Footer -->
              <tr>
                <td align="center" style="padding:30px 20px;background:#f9f9f9;">
                  <h3 style="margin:0 0 15px 0;font-size:16px;color:#333;">Stay Connected</h3>
                  <div style="display:flex;justify-content:center;gap:20px;">
                    <a href="${process.env.facebookLink}" target="_blank">
                      <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" 
                        alt="Facebook" width="32" style="display:inline-block;" />
                    </a>
                    <a href="${process.env.instegram}" target="_blank">
                      <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" 
                        alt="Instagram" width="32" style="display:inline-block;" />
                    </a>
                    <a href="${process.env.twitterLink}" target="_blank">
                      <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" 
                        alt="Twitter" width="32" style="display:inline-block;" />
                    </a>
                  </div>
                </td>
              </tr>
  
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
  };