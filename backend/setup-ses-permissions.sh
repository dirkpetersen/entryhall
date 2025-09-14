#!/bin/bash

echo "Setting up AWS SES permissions for Woerk..."
echo ""

# Get current AWS identity
CURRENT_USER=$(aws sts get-caller-identity --query 'Arn' --output text 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "Current AWS identity: $CURRENT_USER"
else
    echo "❌ AWS CLI not configured or no permissions to check identity"
    echo "Run: aws configure"
    exit 1
fi

# Create SES policy
cat > woerk-ses-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail",
                "ses:VerifyEmailIdentity",
                "ses:ListIdentities",
                "ses:GetIdentityVerificationAttributes",
                "ses:GetIdentityDkimAttributes",
                "ses:GetSendQuota",
                "ses:GetSendStatistics"
            ],
            "Resource": "*"
        }
    ]
}
EOF

echo ""
echo "📄 Created woerk-ses-policy.json"
echo ""
echo "To apply this policy, run ONE of these options:"
echo ""
echo "OPTION 1: Attach to existing user (recommended):"
echo "aws iam put-user-policy --user-name YOUR_USERNAME --policy-name WoerkSESPolicy --policy-document file://woerk-ses-policy.json"
echo ""
echo "OPTION 2: Create new policy and attach:"
echo "aws iam create-policy --policy-name WoerkSESPolicy --policy-document file://woerk-ses-policy.json"
echo "aws iam attach-user-policy --user-name YOUR_USERNAME --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/WoerkSESPolicy"
echo ""
echo "OPTION 3: Quick test - verify your email first:"
echo "node verify-ses-email.js your.email@example.edu"
echo ""
echo "After setting permissions, test with:"
echo "node test-email-simple.js your.email@example.edu"