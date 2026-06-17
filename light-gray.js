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
  
  // Replace the Zinc background
  content = content.replace(/dark:bg-\[\#18181B\]/g, 'dark:bg-[#707070]');
  content = content.replace(/dark:bg-\[\#18181B\]\/90/g, 'dark:bg-[#707070]/90');
  
  // Replace the Zinc surface
  content = content.replace(/dark:bg-\[\#27272A\]/g, 'dark:bg-[#7D7D7D]');

  fs.writeFileSync(f, content);
  console.log("Updated", f);
});
