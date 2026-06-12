const fs = require('fs');
const path = require('path');

const API_CONST = "`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}`";

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Regex to replace 'http://localhost:3001/api/...' or `http://localhost:3001/api/...`
  // We'll replace the base URL with ${API_URL} inside template literals.
  
  // First, change single quotes to template literals for strings starting with http://localhost:3001/api
  content = content.replace(/'http:\/\/localhost:3001\/api([^']*)'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}$1`");
  // Second, fix existing template literals
  content = content.replace(/`http:\/\/localhost:3001\/api([^`]*)`/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}$1`");
  
  fs.writeFileSync(filePath, content);
}

const files = [
  'frontend/src/pages/AIAssistant.tsx',
  'frontend/src/pages/Clients.tsx',
  'frontend/src/pages/Dashboard.tsx',
  'frontend/src/pages/InvoiceDetail.tsx',
  'frontend/src/pages/InvoiceEditor.tsx',
  'frontend/src/pages/Invoices.tsx'
];

files.forEach(f => replaceInFile(path.join(__dirname, f)));
console.log('URLs replaced successfully');
