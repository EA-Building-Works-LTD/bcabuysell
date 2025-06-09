#!/usr/bin/env node

// Script to fix common deployment issues
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running fix-deployment script...');

// Function to ensure a file exists
function ensureFileExists(filepath, content) {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, content);
    console.log(`Created: ${filepath}`);
    return true;
  }
  return false;
}

// Path to eslint ignore file
const eslintIgnorePath = path.join(process.cwd(), '.eslintignore');

// .eslintignore content
const eslintIgnoreContent = `
# Dependencies
node_modules
.pnp
.pnp.js

# Build files
.next/
out/
build/
dist/

# Cache
.swc/
.turbo

# Misc
.DS_Store
*.pem
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel
`;

// Ensure .eslintignore exists
ensureFileExists(eslintIgnorePath, eslintIgnoreContent);

// Try to fix Next.js config
try {
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    let configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Fix experimental config if needed
    if (configContent.includes('experimental: {')) {
      // Ensure server actions are properly formatted as strings
      configContent = configContent.replace(
        /allowedOrigins: \[(.*?)\]/g, 
        (match, origins) => {
          // Make sure origins are quoted strings
          const fixedOrigins = origins
            .split(',')
            .map(o => o.trim())
            .filter(Boolean)
            .map(o => o.startsWith('"') || o.startsWith("'") ? o : `"${o}"`)
            .join(', ');
          
          return `allowedOrigins: [${fixedOrigins}]`;
        }
      );
      
      console.log('Fixed allowedOrigins in next.config.js');
    }
    
    fs.writeFileSync(nextConfigPath, configContent);
  }
} catch (error) {
  console.error('Error fixing Next.js config:', error);
}

// Fix environment variables
try {
  // Check for .env file
  const envFilePath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envFilePath)) {
    // Create a minimal .env file for Vercel
    fs.writeFileSync(envFilePath, 'HUSKY=0\n');
    console.log('Created .env file');
  }
} catch (error) {
  console.error('Error fixing environment variables:', error);
}

// Ensure vercel.json exists with proper configuration
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
const vercelConfig = {
  version: 2,
  buildCommand: "npm run vercel-build",
  installCommand: "npm install",
  framework: "nextjs",
  outputDirectory: ".next",
  regions: ["iad1"],
  env: {
    HUSKY: "0"
  }
};

console.log('Writing vercel.json configuration...');
fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));

// Create .vercelignore file to exclude unnecessary files
const vercelIgnorePath = path.join(process.cwd(), '.vercelignore');
const vercelIgnoreContent = `
.git
.github
node_modules
.husky
.vscode
README.md
*.log
.env.local
.env.development
`;

console.log('Creating .vercelignore file...');
fs.writeFileSync(vercelIgnorePath, vercelIgnoreContent.trim());

// Create a client-side only indicator
const clientWrapperPath = path.join(process.cwd(), 'src/components/ClientOnly.tsx');
const clientWrapperContent = `'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? children : fallback;
}
`;

console.log('Creating ClientOnly component...');
fs.writeFileSync(clientWrapperPath, clientWrapperContent);

// Fix known issue with CarListWrapper to ensure it only runs on client
const carListWrapperPath = path.join(process.cwd(), 'src/components/cars/CarListWrapper.tsx');

if (fs.existsSync(carListWrapperPath)) {
  console.log('Checking CarListWrapper component...');
  let carListWrapperContent = fs.readFileSync(carListWrapperPath, 'utf8');
  
  // Make sure the first line is 'use client'
  if (!carListWrapperContent.startsWith("'use client'")) {
    carListWrapperContent = "'use client';\n\n" + carListWrapperContent;
  }
  
  // Make sure fetch patching happens in useEffect
  if (carListWrapperContent.includes('window.fetch =') && 
      !carListWrapperContent.includes('useEffect(() => {') && 
      !carListWrapperContent.includes('window.fetch =')) {
    console.log('Wrapping window.fetch code in useEffect for CarListWrapper...');
    carListWrapperContent = carListWrapperContent.replace(
      /const originalFetch = window\.fetch;/g,
      `useEffect(() => {
  const originalFetch = window.fetch;`
    );
    
    carListWrapperContent = carListWrapperContent.replace(
      /};(\s*)\n\s*export default/g,
      `};
  
  // Cleanup function to restore original fetch
  return () => {
    window.fetch = originalFetch;
  };
}, []);\n\nexport default`
    );
  }
  
  fs.writeFileSync(carListWrapperPath, carListWrapperContent);
}

// Ensure cars page is set to dynamic
const carsPagePath = path.join(process.cwd(), 'src/app/cars/page.tsx');
if (fs.existsSync(carsPagePath)) {
  console.log('Checking cars page...');
  let carsPageContent = fs.readFileSync(carsPagePath, 'utf8');
  
  if (!carsPageContent.includes("export const dynamic = 'force-dynamic'")) {
    console.log('Adding dynamic export to cars page...');
    // Add after imports but before other content
    const importEndIndex = carsPageContent.indexOf('\n\n');
    if (importEndIndex !== -1) {
      carsPageContent = 
        carsPageContent.slice(0, importEndIndex + 2) + 
        "// Set dynamic rendering for this route\nexport const dynamic = 'force-dynamic';\n\n" + 
        carsPageContent.slice(importEndIndex + 2);
      
      fs.writeFileSync(carsPagePath, carsPageContent);
    }
  }
}

console.log('Fix-deployment script completed successfully.');
console.log('\nTo deploy your application, run:');
console.log('npm run deploy'); 