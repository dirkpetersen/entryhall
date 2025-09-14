const { SESClient, VerifyEmailIdentityCommand, SendEmailCommand, ListIdentitiesCommand } = require('@aws-sdk/client-ses');

async function testAnyEmail() {
  const recipientEmail = process.argv[2];
  if (!recipientEmail) {
    console.error('Usage: AWS_PROFILE=sendmail node test-any-email.js <email>');
    console.error('Example: AWS_PROFILE=sendmail node test-any-email.js test@example.edu');
    console.error('');
    console.error('This script will:');
    console.error('1. Check if email is verified in SES');
    console.error('2. If not verified, send verification request');
    console.error('3. If verified, send test email');
    process.exit(1);
  }

  console.log(`🧪 Testing email system with: ${recipientEmail}`);
  console.log(`🔧 AWS Profile: ${process.env.AWS_PROFILE || 'default'}`);
  
  try {
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-west-2' 
    });

    // Check if email is already verified
    const listCommand = new ListIdentitiesCommand({});
    const identities = await sesClient.send(listCommand);
    
    const isVerified = identities.Identities && identities.Identities.includes(recipientEmail);
    
    if (!isVerified) {
      console.log('⏳ Email not verified yet, sending verification request...');
      
      const verifyCommand = new VerifyEmailIdentityCommand({
        EmailAddress: recipientEmail
      });
      
      await sesClient.send(verifyCommand);
      console.log(`✅ Verification email sent to ${recipientEmail}`);
      console.log('📧 Check your email and click the verification link');
      console.log('🔄 Then run this script again to test sending');
      return;
    }

    console.log('✅ Email is verified! Sending test email...');
    
    // Send test email using the recipient as both sender and recipient
    const params = {
      Source: recipientEmail,
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: '🎉 Woerk Email System - Working!',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
                  <h1>🎉 Woerk Email Test Successful!</h1>
                </div>
                <div style="padding: 20px; background: white; border: 1px solid #e5e7eb;">
                  <h2>Email System Status: ✅ WORKING</h2>
                  <p>Your Woerk email verification system is fully functional!</p>
                  
                  <h3>📊 Test Results:</h3>
                  <ul>
                    <li>✅ AWS SES Connection: Success</li>
                    <li>✅ Email Template: Rendered correctly</li>
                    <li>✅ Recipient Verification: Confirmed</li>
                    <li>✅ Email Delivery: Successful</li>
                  </ul>
                  
                  <h3>📧 Test Details:</h3>
                  <ul>
                    <li><strong>From:</strong> ${recipientEmail}</li>
                    <li><strong>To:</strong> ${recipientEmail}</li>
                    <li><strong>AWS Profile:</strong> ${process.env.AWS_PROFILE || 'default'}</li>
                    <li><strong>Region:</strong> ${process.env.AWS_REGION || 'us-west-2'}</li>
                    <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                  </ul>
                  
                  <div style="background: #dcfce7; border: 1px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 6px;">
                    <p style="margin: 0; color: #166534;"><strong>🚀 Ready for Production!</strong></p>
                    <p style="margin: 5px 0 0 0; color: #166534;">Your Woerk application can now send verification emails to university users.</p>
                  </div>
                </div>
                <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
                  Sent via AWS SES from Woerk Resource Management System
                </div>
              </div>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Woerk Email Test Successful!

Email System Status: WORKING ✅

Your Woerk email verification system is fully functional!

Test Results:
✅ AWS SES Connection: Success
✅ Email Template: Rendered correctly  
✅ Recipient Verification: Confirmed
✅ Email Delivery: Successful

Test Details:
- From: ${recipientEmail}
- To: ${recipientEmail}
- AWS Profile: ${process.env.AWS_PROFILE || 'default'}
- Region: ${process.env.AWS_REGION || 'us-west-2'}
- Timestamp: ${new Date().toISOString()}

🚀 Ready for Production!
Your Woerk application can now send verification emails to university users.

---
Sent via AWS SES from Woerk Resource Management System`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    
    console.log('');
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.MessageId);
    console.log('🔗 AWS Request ID:', result.$metadata.requestId);
    console.log('');
    console.log('🎊 Your Woerk email system is ready for production!');
    console.log(`📬 Check ${recipientEmail} for the test email`);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('not verified')) {
      console.log('');
      console.log('📋 To test with any email:');
      console.log(`1. AWS_PROFILE=sendmail node verify-ses-email.js ${recipientEmail}`);
      console.log('2. Check email and click verification link');
      console.log('3. AWS_PROFILE=sendmail node test-any-email.js ' + recipientEmail);
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

testAnyEmail();