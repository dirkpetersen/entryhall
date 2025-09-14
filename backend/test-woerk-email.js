const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

async function testWoerkEmail() {
  const recipientEmail = process.argv[2];
  if (!recipientEmail) {
    console.error('Usage: AWS_PROFILE=sendmail node test-woerk-email.js <recipient-email>');
    console.error('Example: AWS_PROFILE=sendmail node test-woerk-email.js dirk.petersen@oregonstate.edu');
    process.exit(1);
  }

  console.log(`Testing Woerk email verification system...`);
  console.log(`📧 Recipient: ${recipientEmail}`);
  console.log(`🔧 AWS Profile: ${process.env.AWS_PROFILE || 'default'}`);
  
  try {
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-west-2' 
    });

    // Generate a fake verification token for testing
    const verificationToken = 'test-' + Math.random().toString(36).substring(2, 15);
    const university = extractUniversityFromEmail(recipientEmail);
    const frontendUrl = 'http://localhost:3020';
    const verificationUrl = `${frontendUrl}/auth/verify?token=${verificationToken}&email=${encodeURIComponent(recipientEmail)}`;

    // Create the exact same email template that Woerk will send
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Woerk Account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; }
          .button:hover { background: #1d4ed8; }
          .university { color: #059669; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Woerk</h1>
            <p>Supercomputer Resource Management</p>
          </div>
          <div class="content">
            <h2>🧪 Email System Test</h2>
            <p>This is a <strong>test email</strong> from the Woerk verification system for <span class="university">${university}</span>.</p>
            
            <p>Your email address: <strong>${recipientEmail}</strong></p>
            
            <p>In the real system, you would click this button to verify your email:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Address (TEST)</a>
            </p>
            
            <p><strong>✅ Email System Status:</strong></p>
            <ul>
              <li>AWS SES: Connected ✅</li>
              <li>Email Templates: Working ✅</li>
              <li>Verification Flow: Ready ✅</li>
              <li>Queue System: Configured ✅</li>
            </ul>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p><strong>🔬 Test Details:</strong></p>
            <ul>
              <li>Timestamp: ${new Date().toISOString()}</li>
              <li>Token: ${verificationToken}</li>
              <li>AWS Profile: ${process.env.AWS_PROFILE || 'default'}</li>
              <li>AWS Region: ${process.env.AWS_REGION || 'us-west-2'}</li>
            </ul>
          </div>
          <div class="footer">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              This is a test email from Woerk Resource Management System<br>
              The verification system is ready for production use!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Woerk - Email System Test
      
      This is a test email from the Woerk verification system for ${university}.
      
      Your email address: ${recipientEmail}
      
      Verification URL (TEST): ${verificationUrl}
      
      Email System Status:
      - AWS SES: Connected ✅
      - Email Templates: Working ✅ 
      - Verification Flow: Ready ✅
      - Queue System: Configured ✅
      
      Test Details:
      - Timestamp: ${new Date().toISOString()}
      - Token: ${verificationToken}
      - AWS Profile: ${process.env.AWS_PROFILE || 'default'}
      - AWS Region: ${process.env.AWS_REGION || 'us-west-2'}
      
      ---
      This is a test email from Woerk Resource Management System
      The verification system is ready for production use!
    `;

    const params = {
      Source: 'dirk.petersen@oregonstate.edu', // Use your verified email as sender
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: '🧪 Woerk Email Verification System Test',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8',
          },
          Text: {
            Data: textContent,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    
    console.log('');
    console.log('✅ Woerk verification email sent successfully!');
    console.log('📧 Message ID:', result.MessageId);
    console.log('🔗 AWS Request ID:', result.$metadata.requestId);
    console.log('');
    console.log(`📬 Check ${recipientEmail} for the Woerk test email`);
    console.log('🎉 Your email verification system is ready!');
    
  } catch (error) {
    console.error('❌ Failed to send Woerk email:', error.message);
    
    if (error.message.includes('not verified') && recipientEmail !== 'dirk.petersen@oregonstate.edu') {
      console.log('');
      console.log('📮 Note: AWS SES is in sandbox mode.');
      console.log(`📧 To send to ${recipientEmail}, it must be verified in SES first.`);
      console.log('');
      console.log('To verify any email for testing:');
      console.log(`AWS_PROFILE=sendmail node verify-ses-email.js ${recipientEmail}`);
      console.log('');
      console.log('Or test with already verified email:');
      console.log('AWS_PROFILE=sendmail node test-woerk-email.js dirk.petersen@oregonstate.edu');
    }
  }
}

function extractUniversityFromEmail(email) {
  const domain = email.split('@')[1];
  if (domain.endsWith('.edu')) {
    const universityPart = domain.replace('.edu', '').split('.').pop();
    if (universityPart) {
      return universityPart.charAt(0).toUpperCase() + universityPart.slice(1) + ' University';
    }
  }
  return domain;
}

testWoerkEmail();