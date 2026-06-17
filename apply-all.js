const fs = require('fs');

function getAllFiles(dirPath, arrayOfFiles) {
  let localFiles = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  localFiles.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(dirPath + "/" + file)
      }
    }
  })

  return arrayOfFiles
}

const files = getAllFiles('./src/components');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Backgrounds
  content = content.replace(/bg-\[\#FAF8F5\](?!\s+dark:bg-)/g, 'bg-[#FAF8F5] dark:bg-[#2C2C2C]');
  content = content.replace(/bg-white(?!\s+dark:bg-)/g, 'bg-white dark:bg-[#383838]');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.02\)\](?!\s+dark:bg-)/g, 'bg-[rgba(36,27,20,0.02)] dark:bg-[rgba(255,255,255,0.02)]');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.03\)\](?!\s+dark:bg-)/g, 'bg-[rgba(36,27,20,0.03)] dark:bg-[rgba(255,255,255,0.03)]');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.04\)\](?!\s+dark:bg-)/g, 'bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)]');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.06\)\](?!\s+dark:bg-)/g, 'bg-[rgba(36,27,20,0.06)] dark:bg-[rgba(255,255,255,0.06)]');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.08\)\](?!\s+dark:bg-)/g, 'bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.08)]');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.12\)\](?!\s+dark:bg-)/g, 'bg-[rgba(36,27,20,0.12)] dark:bg-[rgba(255,255,255,0.12)]');
  
  // Text
  content = content.replace(/text-\[\#241B14\](?!\s+dark:text-)/g, 'text-[#241B14] dark:text-[#F4F4F5]');
  content = content.replace(/text-\[rgba\(36,27,20,0\.3\)\](?!\s+dark:text-)/g, 'text-[rgba(36,27,20,0.3)] dark:text-[rgba(255,255,255,0.3)]');
  content = content.replace(/text-\[rgba\(36,27,20,0\.35\)\](?!\s+dark:text-)/g, 'text-[rgba(36,27,20,0.35)] dark:text-[rgba(255,255,255,0.35)]');
  content = content.replace(/text-\[rgba\(36,27,20,0\.4\)\](?!\s+dark:text-)/g, 'text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]');
  content = content.replace(/text-\[rgba\(36,27,20,0\.45\)\](?!\s+dark:text-)/g, 'text-[rgba(36,27,20,0.45)] dark:text-[rgba(255,255,255,0.45)]');
  content = content.replace(/text-\[rgba\(36,27,20,0\.5\)\](?!\s+dark:text-)/g, 'text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]');
  content = content.replace(/text-\[rgba\(36,27,20,0\.6\)\](?!\s+dark:text-)/g, 'text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)]');
  content = content.replace(/text-\[rgba\(36,27,20,0\.7\)\](?!\s+dark:text-)/g, 'text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)]');
  
  // Borders
  content = content.replace(/border-\[rgba\(36,27,20,0\.04\)\](?!\s+dark:border-)/g, 'border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)]');
  content = content.replace(/border-\[rgba\(36,27,20,0\.06\)\](?!\s+dark:border-)/g, 'border-[rgba(36,27,20,0.06)] dark:border-[rgba(255,255,255,0.06)]');
  content = content.replace(/border-\[rgba\(36,27,20,0\.08\)\](?!\s+dark:border-)/g, 'border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]');
  content = content.replace(/border-\[rgba\(36,27,20,0\.1\)\](?!\s+dark:border-)/g, 'border-[rgba(36,27,20,0.1)] dark:border-[rgba(255,255,255,0.1)]');
  content = content.replace(/border-\[rgba\(36,27,20,0\.12\)\](?!\s+dark:border-)/g, 'border-[rgba(36,27,20,0.12)] dark:border-[rgba(255,255,255,0.12)]');
  content = content.replace(/border-\[rgba\(36,27,20,0\.15\)\](?!\s+dark:border-)/g, 'border-[rgba(36,27,20,0.15)] dark:border-[rgba(255,255,255,0.15)]');

  // Specific check for app-shell where I might have missed some
  if (f.includes('app-shell.tsx') || f.includes('settings-view.tsx')) {
     // I already applied `#2C2C2C` to them directly via the previous script, so they should be good.
  }

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log("Updated", f);
  }
});
