const { SESClient, VerifyEmailIdentityCommand } = require('@aws-sdk/client-ses');

async function verifySESEmail() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node verify-ses-email.js <email-address>');
    console.error('Example: node verify-ses-email.js dirk.petersen@oregonstate.edu');
    process.exit(1);
  }

  console.log(`Verifying ${email} in AWS SES...`);
  
  try {
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-west-2' 
    });

    const command = new VerifyEmailIdentityCommand({
      EmailAddress: email
    });
    
    const result = await sesClient.send(command);
    
    console.log('✓ Verification request sent successfully!');
    console.log(`📧 Check ${email} for a verification email from Amazon SES`);
    console.log('🔗 Click the verification link in the email');
    console.log('⏰ Once verified, you can use this email as sender in SES');
    console.log('');
    console.log('After verification, test with:');
    console.log(`node test-email.js ${email}`);
    
  } catch (error) {
    console.error('✗ Failed to verify email:', error.message);
    
    if (error.name === 'AccessDeniedException') {
      console.log('');
      console.log('🔒 Your AWS user needs SES permissions. Add this policy:');
      console.log(JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": [
              "ses:VerifyEmailIdentity",
              "ses:SendEmail",
              "ses:ListIdentities",
              "ses:GetIdentityVerificationAttributes"
            ],
            "Resource": "*"
          }
        ]
      }, null, 2));
    }
  }
}

verifySESEmail();