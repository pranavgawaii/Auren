const fs = require('fs');

const files = [
  'src/components/auren/app/app-shell.tsx',
  'src/components/auren/app/settings-view.tsx',
  'src/components/auren/app/history-panel.tsx',
  'src/components/blocks/pricing.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.warn("File not found:", f);
    return;
  }
  let content = fs.readFileSync(f, 'utf8');
  
  content = content.replace(/bg-auren-bg\/90/g, 'bg-[rgba(251,243,236,0.92)] dark:bg-[#1A1512]/90');
  content = content.replace(/bg-auren-bg/g, 'bg-[#FAF8F5] dark:bg-[#1A1512]');
  content = content.replace(/bg-auren-surface-hover/g, 'bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(250,248,245,0.06)]');
  content = content.replace(/bg-auren-surface-active/g, 'bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(250,248,245,0.12)]');
  content = content.replace(/bg-auren-surface/g, 'bg-white dark:bg-[#241B14]');
  
  content = content.replace(/text-auren-fg/g, 'text-[#241B14] dark:text-[#FAF8F5]');
  
  content = content.replace(/border-auren-border-strong/g, 'border-[rgba(36,27,20,0.15)] dark:border-[rgba(250,248,245,0.15)]');
  content = content.replace(/border-auren-border/g, 'border-[rgba(36,27,20,0.08)] dark:border-[rgba(250,248,245,0.08)]');
  content = content.replace(/border-auren-surface-hover/g, 'border-[rgba(36,27,20,0.04)] dark:border-[rgba(250,248,245,0.04)]');
  
  content = content.replace(/text-auren-muted-light/g, 'text-[rgba(36,27,20,0.4)] dark:text-[rgba(250,248,245,0.4)]');
  content = content.replace(/text-auren-muted/g, 'text-[rgba(36,27,20,0.5)] dark:text-[rgba(250,248,245,0.5)]');
  
  // Brand
  content = content.replace(/bg-auren-brand/g, 'bg-[#E8593C]');
  content = content.replace(/text-auren-brand/g, 'text-[#E8593C]');
  content = content.replace(/border-auren-brand/g, 'border-[#E8593C]');
  content = content.replace(/ring-auren-brand/g, 'ring-[#E8593C]');
  content = content.replace(/hover:bg-auren-brand-hover/g, 'hover:bg-[#D14F31]');
  
  // Special
  content = content.replace(/bg-auren-success/g, 'bg-[#10B981]');
  content = content.replace(/text-auren-success/g, 'text-[#10B981]');
  content = content.replace(/border-auren-success/g, 'border-[#10B981]');
  content = content.replace(/bg-auren-danger/g, 'bg-[#EF4444]');
  content = content.replace(/text-auren-danger/g, 'text-[#EF4444]');
  content = content.replace(/border-auren-danger/g, 'border-[#EF4444]');
  content = content.replace(/bg-auren-info/g, 'bg-[#4285F4]');
  content = content.replace(/text-auren-info/g, 'text-[#4285F4]');
  content = content.replace(/border-auren-info/g, 'border-[#4285F4]');

  fs.writeFileSync(f, content);
  console.log("Updated", f);
});
console.log("Done reverse refactoring.");
