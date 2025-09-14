const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

async function testEmail() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node test-email-simple.js <your-verified-email>');
    console.error('Example: node test-email-simple.js dirk.petersen@oregonstate.edu');
    console.error('');
    console.error('Note: In SES sandbox mode, you can only send TO verified emails.');
    console.error('First run: node verify-ses-email.js <your-email>');
    process.exit(1);
  }

  console.log(`Testing SES by sending ${email} -> ${email}...`);
  
  try {
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-west-2' 
    });

    // In sandbox mode, use the same email as sender and recipient
    const params = {
      Source: email,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Woerk SES Test - Success!',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <h2>🎉 Woerk Email System Test Successful!</h2>
              <p>This email confirms that your AWS SES integration is working correctly.</p>
              <ul>
                <li><strong>Sender:</strong> ${email}</li>
                <li><strong>Recipient:</strong> ${email}</li>
                <li><strong>Region:</strong> ${process.env.AWS_REGION || 'us-west-2'}</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              </ul>
              <p>You can now use the Woerk email verification system!</p>
              <hr>
              <small>Sent via AWS SES from Woerk Resource Management System</small>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Woerk Email System Test Successful!
            
This email confirms that your AWS SES integration is working correctly.

Sender: ${email}
Recipient: ${email}
Region: ${process.env.AWS_REGION || 'us-west-2'}
Timestamp: ${new Date().toISOString()}

You can now use the Woerk email verification system!

---
Sent via AWS SES from Woerk Resource Management System`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    
    console.log('✓ Email sent successfully!');
    console.log('📧 Message ID:', result.MessageId);
    console.log('🔗 AWS Request ID:', result.$metadata.requestId);
    console.log('');
    console.log(`Check ${email} for the test email!`);
    
  } catch (error) {
    console.error('✗ Failed to send email:', error.message);
    
    if (error.message.includes('not verified')) {
      console.log('');
      console.log('🔧 To verify your email address in SES:');
      console.log(`node verify-ses-email.js ${email}`);
      console.log('');
      console.log('Or manually in AWS Console:');
      console.log('1. Go to AWS SES Console');
      console.log('2. Click "Verified identities"');
      console.log('3. Click "Create identity"');
      console.log(`4. Enter ${email}`);
      console.log('5. Check your email and click verification link');
    }
    
    if (error.name === 'MessageRejected' && error.message.includes('sandbox')) {
      console.log('');
      console.log('📮 SES is in sandbox mode - you can only send to verified emails.');
      console.log('To send to any email, request production access in AWS SES console.');
    }
  }
}

testEmail();