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
  
  // Background
  content = content.replace(/dark:bg-\[\#1A1512\]/g, 'dark:bg-[#2E2A27]');
  content = content.replace(/dark:bg-\[\#1A1512\]\/90/g, 'dark:bg-[#2E2A27]/90');
  content = content.replace(/dark:bg-\[rgba\(26,21,18,0\.92\)\]/g, 'dark:bg-[rgba(46,42,39,0.92)]');
  
  // Surface
  content = content.replace(/dark:bg-\[\#241B14\]/g, 'dark:bg-[#3C3733]');
  
  // Hover/Active
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.04\)\]/g, 'dark:bg-[rgba(250,248,245,0.06)]');
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.06\)\]/g, 'dark:bg-[rgba(250,248,245,0.08)]');
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.08\)\]/g, 'dark:bg-[rgba(250,248,245,0.1)]');
  content = content.replace(/dark:bg-\[rgba\(250,248,245,0\.12\)\]/g, 'dark:bg-[rgba(250,248,245,0.15)]');

  fs.writeFileSync(f, content);
  console.log("Updated", f);
});
