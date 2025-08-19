#!/bin/bash
set -e

# Scaffold React + TypeScript app with Vite in /cms/admin
npm create vite@latest ./cms/admin -- --template react-ts

cd ./cms/admin

# Install dependencies
npm install

# Update Vite config to output to /public/admin
if grep -q 'outDir' vite.config.ts; then
  echo 'Vite config already has outDir.'
else
  sed -i "/defineConfig({/a \\ \\  build: { outDir: '../../public/admin', emptyOutDir: false }," vite.config.ts
fi

# Print success message
echo "Admin UI scaffolded in /cms/admin. Build output will go to /public/admin." 