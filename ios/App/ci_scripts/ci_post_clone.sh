#!/bin/sh

# Install Node.js
brew install node

# Navigate up to the root of the repository
cd ../../../

# 1. Install dependencies (You already have this)
npm install --legacy-peer-deps

# 2. Compile the raw web code into the production bundle
echo "VITE_PB_URL=https://caisterplayz-caisterplayz-backend.hf.space" > .env
npm run build

# 3. Sync the compiled bundle and config files into the iOS native folder
npx cap sync ios
