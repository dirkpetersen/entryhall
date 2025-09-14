const { SESClient, ListIdentitiesCommand, GetIdentityVerificationAttributesCommand } = require('@aws-sdk/client-ses');

async function listVerifiedEmails() {
  console.log('Checking verified SES identities...');
  
  try {
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-west-2' 
    });

    // List all identities
    const listCommand = new ListIdentitiesCommand({});
    const identities = await sesClient.send(listCommand);
    
    if (!identities.Identities || identities.Identities.length === 0) {
      console.log('❌ No verified identities found.');
      console.log('');
      console.log('To verify your email:');
      console.log('1. AWS Console: https://console.aws.amazon.com/ses/');
      console.log('2. Or run: AWS_PROFILE=sendmail node verify-ses-email.js your@email.edu');
      return;
    }

    // Get verification status for each identity
    const verifyCommand = new GetIdentityVerificationAttributesCommand({
      Identities: identities.Identities
    });
    const verificationInfo = await sesClient.send(verifyCommand);

    console.log('📧 SES Identities:');
    for (const identity of identities.Identities) {
      const status = verificationInfo.VerificationAttributes[identity];
      const verified = status?.VerificationStatus === 'Success';
      const icon = verified ? '✅' : '⏳';
      console.log(`${icon} ${identity} - ${status?.VerificationStatus || 'Unknown'}`);
    }
    
    const verifiedEmails = identities.Identities.filter(id => 
      verificationInfo.VerificationAttributes[id]?.VerificationStatus === 'Success'
    );
    
    if (verifiedEmails.length > 0) {
      console.log('');
      console.log('🎉 You can send emails from these verified addresses:');
      verifiedEmails.forEach(email => console.log(`   ${email}`));
      console.log('');
      console.log('Test with any of these:');
      verifiedEmails.forEach(email => {
        console.log(`AWS_PROFILE=sendmail node test-email-simple.js ${email}`);
      });
    }
    
  } catch (error) {
    console.error('✗ Failed to list identities:', error.message);
  }
}

listVerifiedEmails();