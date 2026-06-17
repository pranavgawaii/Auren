const fs = require('fs');

const files = [
  'src/components/auren/app/app-shell.tsx',
  'src/components/auren/app/settings-view.tsx',
  'src/components/auren/app/history-panel.tsx',
  'src/components/blocks/pricing.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/switch.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.warn("File not found:", f);
    return;
  }
  let content = fs.readFileSync(f, 'utf8');
  
  // Strict Backgrounds
  content = content.replace(/bg-\[\#FAF8F5\]/g, 'bg-auren-bg');
  content = content.replace(/bg-white/g, 'bg-auren-surface');
  
  // Foreground text
  content = content.replace(/text-\[\#241B14\]/g, 'text-auren-fg');
  
  // Borders
  content = content.replace(/border-\[rgba\(36,27,20,0\.08\)\]/g, 'border-auren-border');
  content = content.replace(/border-\[rgba\(36,27,20,0\.06\)\]/g, 'border-auren-border');
  content = content.replace(/border-\[rgba\(36,27,20,0\.1\)\]/g, 'border-auren-border-strong');
  content = content.replace(/border-\[rgba\(36,27,20,0\.04\)\]/g, 'border-auren-surface-hover');
  
  // Muted text
  content = content.replace(/text-\[rgba\(36,27,20,0\.5\)\]/g, 'text-auren-muted');
  content = content.replace(/text-\[rgba\(36,27,20,0\.6\)\]/g, 'text-auren-muted');
  content = content.replace(/text-\[rgba\(36,27,20,0\.65\)\]/g, 'text-auren-muted');
  content = content.replace(/text-\[rgba\(36,27,20,0\.4\)\]/g, 'text-auren-muted-light');
  content = content.replace(/text-\[rgba\(36,27,20,0\.45\)\]/g, 'text-auren-muted-light');
  content = content.replace(/text-\[rgba\(36,27,20,0\.3\)\]/g, 'text-auren-muted-light');
  content = content.replace(/text-\[rgba\(36,27,20,0\.15\)\]/g, 'text-auren-border-strong');
  
  // Muted backgrounds
  content = content.replace(/bg-\[rgba\(36,27,20,0\.04\)\]/g, 'bg-auren-surface-hover');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.12\)\]/g, 'bg-auren-surface-active');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.06\)\]/g, 'bg-auren-surface-active');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.03\)\]/g, 'bg-auren-surface-hover');
  content = content.replace(/bg-\[rgba\(36,27,20,0\.02\)\]/g, 'bg-auren-surface-hover');
  
  // Brand
  content = content.replace(/bg-\[\#E8593C\]/g, 'bg-auren-brand');
  content = content.replace(/text-\[\#E8593C\]/g, 'text-auren-brand');
  content = content.replace(/border-\[\#E8593C\]/g, 'border-auren-brand');
  content = content.replace(/ring-\[\#E8593C\]/g, 'ring-auren-brand');
  content = content.replace(/hover:bg-\[\#D14F31\]/g, 'hover:bg-auren-brand-hover');
  
  // Special colors
  content = content.replace(/bg-\[\#10B981\]/g, 'bg-auren-success');
  content = content.replace(/text-\[\#10B981\]/g, 'text-auren-success');
  content = content.replace(/border-\[\#10B981\]/g, 'border-auren-success');
  content = content.replace(/bg-\[\#EF4444\]/g, 'bg-auren-danger');
  content = content.replace(/text-\[\#EF4444\]/g, 'text-auren-danger');
  content = content.replace(/border-\[\#EF4444\]/g, 'border-auren-danger');
  content = content.replace(/bg-\[\#4285F4\]/g, 'bg-auren-info');
  content = content.replace(/text-\[\#4285F4\]/g, 'text-auren-info');
  content = content.replace(/border-\[\#4285F4\]/g, 'border-auren-info');

  fs.writeFileSync(f, content);
  console.log("Updated", f);
});
console.log("Done refactoring.");
