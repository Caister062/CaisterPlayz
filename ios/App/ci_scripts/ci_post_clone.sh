#!/bin/sh

# Install Node.js using Homebrew to ensure npm is available in the container
brew install node

# Navigate up from ios/App/ci_scripts to the root of the repository
cd ../../../

# Install the node modules and ignore peer dependency conflicts
npm install --legacy-peer-deps
