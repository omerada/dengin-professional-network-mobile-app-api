#!/bin/bash

# LocalStack Initialization Script
# Creates S3 bucket on startup

echo "Waiting for LocalStack to be ready..."
sleep 5

echo "Creating S3 buckets..."
awslocal s3 mb s3://dengin-dev
awslocal s3 mb s3://dengin-verifications

echo "Setting bucket CORS configuration..."
awslocal s3api put-bucket-cors --bucket dengin-dev --cors-configuration file:///etc/localstack/init/ready.d/cors.json

echo "Listing S3 buckets:"
awslocal s3 ls

echo "LocalStack initialization completed!"
