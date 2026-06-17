const fs = require('fs');

const files = [
  'src/components/auren/app/app-shell.tsx',
  'src/components/auren/app/settings-view.tsx',
  'src/components/auren/app/history-panel.tsx',
  'src/components/blocks/pricing.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) {
    return;
  }
  let content = fs.readFileSync(f, 'utf8');
  
  // Backgrounds
  content = content.replace(/dark:bg-\[\#2E2A27\]/g, 'dark:bg-[#18181B]');
  content = content.replace(/dark:bg-\[\#1A1512\]/g, 'dark:bg-[#18181B]');
  content = content.replace(/dark:bg-\[\#2E2A27\]\/90/g, 'dark:bg-[#18181B]/90');
  content = content.replace(/dark:bg-\[rgba\(46,42,39,0\.92\)\]/g, 'dark:bg-[rgba(24,24,27,0.92)]');
  
  // Surfaces
  content = content.replace(/dark:bg-\[\#3C3733\]/g, 'dark:bg-[#27272A]');
  content = content.replace(/dark:bg-\[\#241B14\]/g, 'dark:bg-[#27272A]');
  
  // Hovers
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.04\)\]/g, 'dark:bg-[rgba(255,255,255,0.04)]');
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.06\)\]/g, 'dark:bg-[rgba(255,255,255,0.06)]');
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.08\)\]/g, 'dark:bg-[rgba(255,255,255,0.08)]');
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.1\)\]/g, 'dark:bg-[rgba(255,255,255,0.1)]');
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.12\)\]/g, 'dark:bg-[rgba(255,255,255,0.12)]');
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.15\)\]/g, 'dark:bg-[rgba(255,255,255,0.15)]');

  // Borders
  content = content.replace(/dark:border-\[rgba\(250,248,245,0\.04\)\]/g, 'dark:border-[rgba(255,255,255,0.04)]');
  content = content.replace(/dark:border-\[rgba\(250,248,245,0\.06\)\]/g, 'dark:border-[rgba(255,255,255,0.06)]');
  content = content.replace(/dark:border-\[rgba\(250,248,245,0\.08\)\]/g, 'dark:border-[rgba(255,255,255,0.08)]');
  content = content.replace(/dark:border-\[rgba\(250,248,245,0\.1\)\]/g, 'dark:border-[rgba(255,255,255,0.1)]');
  content = content.replace(/dark:border-\[rgba\(250,248,245,0\.15\)\]/g, 'dark:border-[rgba(255,255,255,0.12)]');

  // Text
  content = content.replace(/dark:text-\[\#FAF8F5\]/g, 'dark:text-[#F4F4F5]');
  content = content.replace(/dark:text-\[rgba\(250,248,245,0\.4\)\]/g, 'dark:text-[rgba(255,255,255,0.4)]');
  content = content.replace(/dark:text-\[rgba\(250,248,245,0\.5\)\]/g, 'dark:text-[rgba(255,255,255,0.5)]');

  fs.writeFileSync(f, content);
  console.log("Updated", f);
});
