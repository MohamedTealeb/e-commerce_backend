import * as fs from 'fs';
import * as path from 'path';

// Export function to get logo path for attachments
export const getLogoPath = (): string | null => {
  const currentDir = __dirname;
  const isDist = currentDir.includes('dist');
  
  const possiblePaths = [
    ...(isDist ? [
      path.join(currentDir, 'logo.png'),
      path.join(currentDir, '..', '..', '..', '..', 'src', 'common', 'utils', 'email', 'logo.png'),
    ] : []),
    ...(!isDist ? [
      path.join(currentDir, 'logo.png'),
    ] : []),
    path.join(process.cwd(), 'src', 'common', 'utils', 'email', 'logo.png'),
    path.join(process.cwd(), 'dist', 'common', 'utils', 'email', 'logo.png'),
    path.resolve(currentDir, '..', '..', '..', '..', 'src', 'common', 'utils', 'email', 'logo.png'),
    path.resolve(currentDir, '..', '..', '..', '..', '..', 'src', 'common', 'utils', 'email', 'logo.png'),
  ];

  for (const logoPath of possiblePaths) {
    try {
      const normalizedPath = path.normalize(logoPath);
      if (fs.existsSync(normalizedPath)) {
        return normalizedPath;
      }
    } catch {
      continue;
    }
  }
  return null;
};

// Helper function to get logo as base64 data URI
const getLogoDataUri = (): string => {
  try {
    // Get project root (assuming we're in dist or src)
    const currentDir = __dirname;
    const isDist = currentDir.includes('dist');
    
    // Try multiple possible paths (for both src and dist directories)
    const possiblePaths = [
      // From dist directory
      ...(isDist ? [
        path.join(currentDir, 'logo.png'), // Same directory in dist
        path.join(currentDir, '..', '..', '..', '..', 'src', 'common', 'utils', 'email', 'logo.png'), // From dist to src
      ] : []),
      // From src directory
      ...(!isDist ? [
        path.join(currentDir, 'logo.png'), // Same directory in src
      ] : []),
      // From project root (most reliable)
      path.join(process.cwd(), 'src', 'common', 'utils', 'email', 'logo.png'),
      path.join(process.cwd(), 'dist', 'common', 'utils', 'email', 'logo.png'),
      // Alternative: go up from current directory to find project root
      path.resolve(currentDir, '..', '..', '..', '..', 'src', 'common', 'utils', 'email', 'logo.png'),
      path.resolve(currentDir, '..', '..', '..', '..', '..', 'src', 'common', 'utils', 'email', 'logo.png'),
    ];

    for (const logoPath of possiblePaths) {
      try {
        const normalizedPath = path.normalize(logoPath);
        if (fs.existsSync(normalizedPath)) {
          const logoBuffer = fs.readFileSync(normalizedPath);
          const base64Logo = logoBuffer.toString('base64');
          console.log('Logo loaded successfully from:', normalizedPath);
          return `data:image/png;base64,${base64Logo}`;
        }
      } catch (pathError) {
        // Continue to next path
        continue;
      }
    }

    // If none of the paths work, throw an error to trigger fallback
    throw new Error('Logo file not found in any expected location');
  } catch (error) {
    console.error('Error reading logo file:', error);
    console.error('Current __dirname:', __dirname);
    console.error('Current process.cwd():', process.cwd());
    // Fallback to original Cloudinary URL if local file is not found
    return 'https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png';
  }
};

export const verifyEmail = ({ otp, title, useCid = false }: { otp: string; title: string; useCid?: boolean }): string => {
    const logoDataUri = getLogoDataUri();
    const logoSrc = useCid ? 'cid:logo' : logoDataUri;
    
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#000000;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="600" border="0" cellspacing="0" cellpadding="0" 
              style="background:#1a1a1a;border-radius:16px;box-shadow:0 8px 32px rgba(212,175,55,0.2);overflow:hidden;border:1px solid rgba(212,175,55,0.1);">
              
              <!-- Header -->
              <tr>
                <td align="center" style="background:#000000;padding:40px 30px;">
                  <img src="${logoSrc}" 
                    alt="Logo" width="100" style="display:block;" />
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td align="center" style="padding:40px 30px 20px 30px;">
                  <h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:700;letter-spacing:1px;">${title}</h1>
                </td>
              </tr>
  
              <!-- Message -->
              <tr>
                <td align="center" style="padding:0 40px 30px 40px;">
                  <p style="margin:0;color:#e0e0e0;font-size:16px;line-height:1.8;">Please use the following code to complete your verification process:</p>
                </td>
              </tr>
  
              <!-- OTP -->
              <tr>
                <td align="center" style="padding:0 30px 30px 30px;">
                  <div style="display:inline-block;background:#D4AF37;color:#000000;
                    font-size:32px;letter-spacing:6px;padding:20px 40px;
                    border-radius:12px;font-weight:bold;box-shadow:0 4px 16px rgba(212,175,55,0.4);
                    border:2px solid rgba(212,175,55,0.3);">
                    ${otp}
                  </div>
                </td>
              </tr>
  
              <!-- CTA Button -->
              <tr>
               
                </td>
              </tr>
  
              <!-- Footer -->
              <tr>
                <td align="center" style="padding:30px 30px 40px 30px;border-top:1px solid rgba(212,175,55,0.1);">
                  <p style="margin:0;color:#888;font-size:14px;line-height:1.6;">
                    If you didn't request this verification, please ignore this email.
                  </p>
                </td>
              </tr>
  
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
  };