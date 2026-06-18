/**
 * fix-sql-mdx.mjs
 * Fixes MDX parse errors in SQL tutorial files.
 * Escapes bare < and > characters in prose markdown that aren't inside
 * JSX template literal props ({`...`}) or fenced code blocks (```).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..', 'src', 'content', 'tutorials');

const files = readdirSync(dir).filter(f => f.startsWith('sql-') && f.endsWith('.mdx'));

let fixedCount = 0;

for (const filename of files) {
  const filepath = join(dir, filename);
  const content = readFileSync(filepath, 'utf-8');
  
  const lines = content.split('\n');
  let inCodeFence = false;
  let inJsxProp = false;
  let changed = false;

  const newLines = lines.map((line, i) => {
    // Track fenced code blocks
    if (/^```/.test(line)) {
      inCodeFence = !inCodeFence;
      return line;
    }
    if (inCodeFence) return line;

    // Track JSX prop template literals: lines with {` start them, lines with `} end them
    if (!inJsxProp && line.includes('{`')) inJsxProp = true;
    else if (inJsxProp && line.includes('`}')) { inJsxProp = false; return line; }
    if (inJsxProp) return line;

    // Skip JSX component lines
    if (line.startsWith('<') || line.startsWith('/>') || line.startsWith('  ')) return line;

    // In prose/bullet/table lines: escape bare >= and <= that aren't in inline code
    // Split by inline code spans to only modify non-code portions
    const parts = line.split(/(`[^`]*`)/);
    const fixedParts = parts.map((part, idx) => {
      // Odd indices are inline code — leave them alone
      if (idx % 2 === 1) return part;
      // Even indices are prose — escape problematic characters
      let fixed = part;
      // Replace >= that could be parsed as JSX arrow
      fixed = fixed.replace(/ >= /g, ' \\>= ');
      fixed = fixed.replace(/ <= /g, ' \\<= ');
      // Replace standalone >= and <= at word boundaries in prose
      fixed = fixed.replace(/\b>=\b/g, '\\>=');
      fixed = fixed.replace(/\b<=\b/g, '\\<=');
      if (fixed !== part) changed = true;
      return fixed;
    });
    return fixedParts.join('');
  });

  if (changed) {
    writeFileSync(filepath, newLines.join('\n'), 'utf-8');
    console.log(`  Fixed: ${filename}`);
    fixedCount++;
  }
}

console.log(`\nFixed ${fixedCount} files.`);
