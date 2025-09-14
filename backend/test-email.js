const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

async function testSESConnection() {
  console.log('Testing AWS SES connection...');
  
  try {
    // Initialize SES client (uses AWS CLI credentials)
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-west-2' 
    });

    // Test sending a simple email
    const params = {
      Source: 'woerk@example.edu', // Replace with verified SES email
      Destination: {
        ToAddresses: ['test@example.edu'], // Replace with test email
      },
      Message: {
        Subject: {
          Data: 'Woerk Email System Test',
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: 'This is a test email from the Woerk system to verify AWS SES integration.',
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