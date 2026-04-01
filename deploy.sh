#!/bin/bash
set -euo pipefail

S3_BUCKET="${S3_BUCKET:?S3_BUCKET env var required}"
CF_DISTRIBUTION_ID="${CF_DISTRIBUTION_ID:?CF_DISTRIBUTION_ID env var required}"

echo "Building..."
pnpm build

echo "Uploading to s3://$S3_BUCKET..."
aws s3 sync dist/ "s3://$S3_BUCKET" --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$CF_DISTRIBUTION_ID" \
  --paths "/*"

echo "Done."
