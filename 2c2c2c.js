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
  
  // Replace the Background
  content = content.replace(/dark:bg-\[\#707070\]/g, 'dark:bg-[#2C2C2C]');
  content = content.replace(/dark:bg-\[\#707070\]\/90/g, 'dark:bg-[#2C2C2C]/90');
  
  // Replace the Surface
  content = content.replace(/dark:bg-\[\#7D7D7D\]/g, 'dark:bg-[#383838]');

  fs.writeFileSync(f, content);
  console.log("Updated", f);
});
