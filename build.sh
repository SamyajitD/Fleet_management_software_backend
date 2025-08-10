#!/bin/bash

# Install Chromium if in serverless environment
if [ "$AWS_LAMBDA_FUNCTION_VERSION" = "true" ]; then
    echo "Setting up for serverless environment..."
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
else
    echo "Setting up for local environment..."
    npx puppeteer browsers install chrome
fi

# Install dependencies
npm install
