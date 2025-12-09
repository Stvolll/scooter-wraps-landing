#!/bin/bash

# AWS S3 Setup Script for TXD Scooter Wraps
# This script helps you set up AWS S3 for file uploads

set -e

echo "🚀 AWS S3 Setup for TXD Scooter Wraps"
echo "======================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI is not installed."
    echo "   Install it from: https://aws.amazon.com/cli/"
    echo ""
    read -p "Continue with manual setup? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'ENVEOF'
# AWS S3 Configuration for File Uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_CLOUDFRONT_DOMAIN=
ENVEOF
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📋 Setup Steps:"
echo "==============="
echo ""
echo "1. Create S3 Bucket:"
echo "   - Go to: https://console.aws.amazon.com/s3/"
echo "   - Click 'Create bucket'"
echo "   - Choose a unique name (e.g., txd-uploads-$(date +%Y))"
echo "   - Select region (e.g., us-east-1)"
echo "   - Uncheck 'Block all public access' (or configure bucket policy)"
echo "   - Enable versioning (optional but recommended)"
echo ""
echo "2. Configure CORS:"
echo "   - Go to your bucket -> Permissions -> CORS"
echo "   - Add the CORS configuration (see S3_SETUP.md)"
echo ""
echo "3. Create IAM User:"
echo "   - Go to: https://console.aws.amazon.com/iam/"
echo "   - Users -> Add users"
echo "   - Name: s3-upload-user"
echo "   - Attach policy (see S3_SETUP.md for policy JSON)"
echo "   - Create access keys"
echo "   - Save Access Key ID and Secret Access Key"
echo ""
echo "4. Update .env.local:"
echo "   - Open .env.local"
echo "   - Fill in AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME"
echo ""
echo "5. Test the setup:"
echo "   - Run: npm run dev"
echo "   - Try uploading a file in the admin panel"
echo ""
echo "📖 For detailed instructions, see: S3_SETUP.md"
echo ""

