const { SESClient, GetSendQuotaCommand } = require('@aws-sdk/client-ses');

async function checkSESStatus() {
  console.log('Checking AWS SES access and quota...');
  
  try {
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-west-2' 
    });

    // Try to get send quota (this requires minimal permissions)
    const command = new GetSendQuotaCommand({});
    const result = await sesClient.send(command);
    
    console.log('✓ SES access confirmed!');
    console.log('📊 Send quota:', result.Max24HourSend, 'emails per 24 hours');
    console.log('📈 Send rate:', result.MaxSendRate, 'emails per second');
    console.log('📧 Sent today:', result.SentLast24Hours, 'emails');
    console.log('');
    console.log('✅ Your AWS SES is ready to use!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify your email in AWS SES Console:');
    console.log('   https://console.aws.amazon.com/ses/');
    console.log('2. Go to "Verified identities" → "Create identity"');
    console.log('3. Enter your email and verify it');
    console.log('4. Then test with: node test-email-simple.js your@email.edu');
    
  } catch (error) {
    console.error('✗ SES access failed:', error.message);
    
    if (error.name === 'AccessDeniedException') {
      console.log('');
      console.log('🔒 Your AWS user needs SES permissions.');
      console.log('Ask your AWS admin to add SES permissions, or:');
      console.log('');
      console.log('1. Go to AWS IAM Console');
      console.log('2. Find user: aider');  
      console.log('3. Add inline policy with SES permissions');
      console.log('4. Use the policy from woerk-ses-policy.json');
    }
  }
}

checkSESStatus();