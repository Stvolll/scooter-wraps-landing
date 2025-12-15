# AWS S3 Cloud Storage Setup

This project uses AWS S3 for cloud-based file storage instead of local filesystem.

## Architecture

The upload flow works as follows:

1. **Client** sends file metadata to `/api/upload` (POST)
2. **Server** validates file (size, type, extension) and generates a signed URL
3. **Client** uploads file directly to S3 using the signed URL (PUT)
4. **Client** requests public URL from `/api/upload/url?key=...` (GET)
5. **Server** returns public URL for the uploaded file

## Environment Variables

Add these to your `.env.local` file:

```bash
# AWS Region
AWS_REGION=us-east-1

# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# S3 Bucket Name
AWS_S3_BUCKET_NAME=your-bucket-name

# Optional: CloudFront Domain (for CDN)
AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
```

## AWS S3 Setup

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket
3. Choose a unique bucket name
4. Select region (match with `AWS_REGION`)
5. Configure bucket settings:
   - **Block Public Access**: Can be enabled if using CloudFront
   - **Versioning**: Optional
   - **Encryption**: Recommended (SSE-S3 or SSE-KMS)

### 2. Configure CORS

Add CORS configuration to your bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 3. Create IAM User

1. Go to IAM Console
2. Create a new user (e.g., `s3-upload-user`)
3. Attach policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. Create access keys for the user
5. Add keys to `.env.local`

### 4. (Optional) CloudFront Setup

For better performance and CDN capabilities:

1. Create CloudFront distribution
2. Set origin to your S3 bucket
3. Configure caching behavior
4. Add `AWS_CLOUDFRONT_DOMAIN` to `.env.local`

## File Validation

The system validates files based on type:

- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg` (max 10MB)
- **Videos**: `.mp4`, `.webm`, `.mov`, `.avi` (max 100MB)
- **Documents**: `.pdf`, `.doc`, `.docx`, `.txt` (max 10MB)

## API Endpoints

### POST `/api/upload`

Validates file and returns signed URL for direct upload.

**Request:**

```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('type', 'images') // 'images', 'videos', 'documents', 'general'

const res = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
```

**Response:**

```json
{
  "success": true,
  "data": {
    "signedUrl": "https://bucket.s3.amazonaws.com/...?signature=...",
    "key": "uploads/images/1234567890-filename.jpg",
    "filename": "1234567890-filename.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000
  }
}
```

### GET `/api/upload/url?key=...`

Returns public URL for uploaded file.

**Request:**

```
GET /api/upload/url?key=uploads/images/1234567890-filename.jpg
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://bucket.s3.amazonaws.com/uploads/images/1234567890-filename.jpg",
    "key": "uploads/images/1234567890-filename.jpg"
  }
}
```

## Client Usage

Example client-side upload:

```typescript
// Step 1: Get signed URL
const formData = new FormData()
formData.append('file', file)
formData.append('type', 'images')

const res = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

const data = await res.json()
const { signedUrl, key } = data.data

// Step 2: Upload to S3
await fetch(signedUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type,
  },
})

// Step 3: Get public URL
const urlRes = await fetch(`/api/upload/url?key=${encodeURIComponent(key)}`)
const urlData = await urlRes.json()
const publicUrl = urlData.data.url
```

## Security Notes

- Signed URLs expire after 5 minutes
- File validation happens on server before generating signed URL
- IAM user should have minimal permissions (only PutObject, GetObject)
- Consider using CloudFront for additional security features
- Enable S3 bucket versioning for backup/recovery

## Troubleshooting

### "AWS_S3_BUCKET_NAME is not configured"

- Check that `.env.local` has `AWS_S3_BUCKET_NAME` set
- Restart development server after adding env variables

### "Failed to upload to S3"

- Check CORS configuration on S3 bucket
- Verify IAM user has correct permissions
- Check AWS credentials are correct

### "File type not allowed"

- Check file extension and MIME type match allowed types
- Verify file size is within limits




