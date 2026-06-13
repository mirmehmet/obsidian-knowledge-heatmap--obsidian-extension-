const fs = require('fs');
const path = require('path');

const vaultDir = path.join(__dirname, '..', 'test-vault');
const dirs = ['Inbox', 'Projects', 'Archive', 'Daily Notes', 'Reference'];

if (!fs.existsSync(vaultDir)) {
  fs.mkdirSync(vaultDir);
}

dirs.forEach(d => {
  const fullPath = path.join(vaultDir, d);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
  }
});

const noteNames = [];
for (let i = 1; i <= 80; i++) {
  noteNames.push(`Note-${i}`);
}

noteNames.forEach((name, index) => {
  const dir = dirs[index % dirs.length];
  const filePath = path.join(vaultDir, dir, `${name}.md`);
  
  const links = [];
  const linkCount = Math.floor(Math.random() * 5); 
  for (let j = 0; j < linkCount; j++) {
    const target = noteNames[Math.floor(Math.random() * noteNames.length)];
    if (target !== name) {
      links.push(`[[${target}]]`);
    }
  }

  const charLength = Math.floor(Math.random() * 6000); 
  let content = `# ${name}\n\n`;
  content += `This is a test note named ${name}.\n\n`;
  content += `Here are some links to other notes:\n`;
  links.forEach(l => {
    content += `- ${l}\n`;
  });
  content += `\n`;
  content += 'a'.repeat(charLength);

  fs.writeFileSync(filePath, content, 'utf8');

  const ageInDays = Math.floor(Math.random() * 120);
  const mtime = new Date();
  mtime.setDate(mtime.getDate() - ageInDays);
  fs.utimesSync(filePath, new Date(), mtime);
});

console.log('Test vault generated successfully with 80 notes!');
