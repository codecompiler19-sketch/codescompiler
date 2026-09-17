import fs from 'fs';
import path from 'path';

const dir = './src/content/tutorials';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));

let fixedCount = 0;

files.forEach(file => {
  const fullPath = path.join(dir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  let lines = content.split('\n');
  let inCodeBlock = false;

  let newLines = lines.map(line => {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inCodeBlock) return line;

    if (line.includes('|')) {
      // Fix un-backticked single `<` or `>` cells in tables
      line = line.replace(/\|\s*<\s*\|/g, '| `<` |');
      line = line.replace(/\|\s*>\s*\|/g, '| `>` |');
      line = line.replace(/\|\s*<=\s*\|/g, '| `<=` |');
      line = line.replace(/\|\s*>=\s*\|/g, '| `>=` |');
      line = line.replace(/\|\s*<>\s*\|/g, '| `<>` |');
      line = line.replace(/\|\s*!=\s*\|/g, '| `!=` |');
      line = line.replace(/\|\s*==\s*\|/g, '| `==` |');
      line = line.replace(/\|\s*===\s*\|/g, '| `===` |');
      line = line.replace(/\|\s*!==\s*\|/g, '| `!==` |');
      line = line.replace(/\|\s*<<\s*\|/g, '| `<<` |');
      line = line.replace(/\|\s*>>\s*\|/g, '| `>>` |');
    }

    return line;
  });

  let newContent = newLines.join('\n');
  if (newContent !== original) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log('Fixed table symbols in:', file);
    fixedCount++;
  }
});

console.log(`Finished fixing ${fixedCount} files.`);
