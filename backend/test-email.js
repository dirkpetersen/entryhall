const { SESClient, SendEmailCommand, ListIdentitiesCommand, VerifyEmailIdentityCommand } = require('@aws-sdk/client-ses');

async function testSESConnection() {
  console.log('Testing AWS SES connection...');
  
  const recipientEmail = process.argv[2];
  if (!recipientEmail) {
    console.error('Usage: node test-email.js <recipient-email>');
    console.error('Example: node test-email.js dirk.petersen@oregonstate.edu');
    process.exit(1);
  }
  
  try {
    // Initialize SES client (uses AWS CLI credentials)
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-west-2' 
    });

    // First, let's check what identities are verified
    console.log('Checking verified SES identities...');
    const listCommand = new ListIdentitiesCommand({});
    const identities = await sesClient.send(listCommand);
    
    console.log('Verified identities:', identities.Identities);
    
    let senderEmail = 'woerk@example.edu';
    
    // Use a verified identity if available
    if (identities.Identities && identities.Identities.length > 0) {
      senderEmail = identities.Identities[0];
      console.log(`Using verified sender: ${senderEmail}`);
    } else {
      console.log('No verified identities found. Let me help you verify an email...');
      
      // Auto-verify the recipient email for testing
      console.log(`Attempting to verify ${recipientEmail}...`);
      const verifyCommand = new VerifyEmailIdentityCommand({
        EmailAddress: recipientEmail
      });
      
      await sesClient.send(verifyCommand);
      console.log(`✓ Verification email sent to ${recipientEmail}`);
      console.log('Check your email and click the verification link, then run this script again.');
      return;
    }

    // Test sending a simple email
    const params = {
      Source: senderEmail,
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: 'Woerk Email System Test',
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: `This is a test email from the Woerk system to verify AWS SES integration.\n\nSent to: ${recipientEmail}\nFrom: ${senderEmail}\nTimestamp: ${new Date().toISOString()}`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    
    console.log('✓ Email sent successfully!');
    console.log('Message ID:', result.MessageId);
    console.log('AWS Request ID:', result.$metadata.requestId);
    
  } catch (error) {
    console.error('✗ Failed to send email:', error.message);
    
    if (error.name === 'MessageRejected') {
      console.log('Possible causes:');
      console.log('- Sender email not verified in SES');
      console.log('- SES still in sandbox mode');
      console.log('- Invalid recipient email');
    }
    
    if (error.name === 'AccessDeniedException') {
      console.log('Possible causes:');
      console.log('- AWS credentials not configured');
      console.log('- Insufficient SES permissions');
      console.log('- Wrong AWS region');
    }
  }
}

// Get AWS region from environment or use default
const awsRegion = process.env.AWS_REGION || 'us-west-2';
console.log(`Using AWS region: ${awsRegion}`);

testSESConnection();