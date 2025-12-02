#!/bin/bash

# LocalStack Initialization Script
# Creates S3 bucket on startup

echo "Waiting for LocalStack to be ready..."
sleep 10

echo "Creating S3 bucket: meslektas-dev"
awslocal s3 mb s3://meslektas-dev

echo "Setting bucket CORS configuration..."
awslocal s3api put-bucket-cors --bucket meslektas-dev --cors-configuration file:///docker-entrypoint-initaws.d/cors.json

echo "Listing S3 buckets:"
awslocal s3 ls

echo "LocalStack initialization completed!"
