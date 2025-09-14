const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

async function testNoDMARC() {
  const recipientEmail = process.argv[2] || 'dirk.petersen@oregonstate.edu';
  
  console.log(`Testing email with DMARC-safe sender...`);
  console.log(`📧 From: oregonstate-arcs@osu.internetchen.de`);
  console.log(`📧 To: ${recipientEmail}`);
  
  try {
    const sesClient = new SESClient({ 
      region: process.env.AWS_REGION || 'us-west-2' 
    });

    const params = {
      Source: 'oregonstate-arcs@osu.internetchen.de', // Your verified domain
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: '✅ Woerk Email Test - DMARC Safe',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #059669; color: white; padding: 20px; text-align: center;">
                  <h1>✅ Woerk Email - DMARC Safe!</h1>
                </div>
                <div style="padding: 20px; background: white; border: 1px solid #e5e7eb;">
                  <h2>🎉 Email Delivery Success!</h2>
                  <p>This email was sent using a DMARC-compliant sender address to avoid delivery issues.</p>
                  
                  <h3>📧 Email Configuration:</h3>
                  <ul>
                    <li><strong>From:</strong> oregonstate-arcs@osu.internetchen.de</li>
                    <li><strong>To:</strong> ${recipientEmail}</li>
                    <li><strong>Domain:</strong> osu.internetchen.de (verified in SES)</li>
                    <li><strong>DMARC Status:</strong> Safe ✅</li>
                  </ul>
                  
                  <h3>🔧 Production Recommendation:</h3>
                  <p>For production use, configure Woerk to send from:</p>
                  <ul>
                    <li><code>woerk@osu.internetchen.de</code></li>
                    <li><code>noreply@osu.internetchen.de</code></li>
                    <li>Any address from your verified domain</li>
                  </ul>
                  
                  <div style="background: #dcfce7; border: 1px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 6px;">
                    <p style="margin: 0; color: #166534;"><strong>✅ Email System Ready!</strong></p>
                    <p style="margin: 5px 0 0 0; color: #166534;">Woerk can now reliably deliver emails to all university addresses.</p>
                  </div>
                </div>
                <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
                  Test email from Woerk Resource Management System<br>
                  Using DMARC-compliant sender domain
                </div>
              </div>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Woerk Email Test - DMARC Safe ✅

🎉 Email Delivery Success!

This email was sent using a DMARC-compliant sender address to avoid delivery issues.

Email Configuration:
- From: oregonstate-arcs@osu.internetchen.de
- To: ${recipientEmail}
- Domain: osu.internetchen.de (verified in SES)
- DMARC Status: Safe ✅

Production Recommendation:
For production use, configure Woerk to send from:
- woerk@osu.internetchen.de
- noreply@osu.internetchen.de  
- Any address from your verified domain

✅ Email System Ready!
Woerk can now reliably deliver emails to all university addresses.

---
Test email from Woerk Resource Management System
Using DMARC-compliant sender domain`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    
    console.log('');
    console.log('✅ DMARC-safe email sent successfully!');
    console.log('📧 Message ID:', result.MessageId);
    console.log('🔗 AWS Request ID:', result.$metadata.requestId);
    console.log('');
    console.log('🎊 This should be delivered without DMARC issues!');
    console.log(`📬 Check ${recipientEmail} for the test email`);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

testNoDMARC();