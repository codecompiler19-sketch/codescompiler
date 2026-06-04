/**
 * upgrade-python-editors.mjs
 * 
 * Replaces the raw <section class="pyscript-container">...</section> block
 * in every python-*.mdx tutorial with the proper <PythonEditor> component.
 * 
 * Run: node scripts/upgrade-python-editors.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tutorialsDir = join(__dirname, '..', 'src', 'content', 'tutorials');

const files = readdirSync(tutorialsDir).filter(
  f => f.startsWith('python-') && f.endsWith('.mdx')
);

console.log(`Found ${files.length} Python tutorial files to upgrade.\n`);

let upgraded = 0;
let skipped  = 0;

for (const filename of files) {
  const filepath = join(tutorialsDir, filename);
  let content = readFileSync(filepath, 'utf-8');

  // Skip if already using PythonEditor
  if (content.includes('<PythonEditor')) {
    console.log(`  SKIP  ${filename} (already upgraded)`);
    skipped++;
    continue;
  }

  // Extract the Python code — handles both <py-script> and <script type="py">
  const pyScriptMatch =
    content.match(/<py-script[^>]*>([\s\S]*?)<\/py-script>/) ||
    content.match(/<script[^>]*type=["']py["'][^>]*>([\s\S]*?)<\/script>/);

  if (!pyScriptMatch) {
    console.log(`  SKIP  ${filename} (no py-script found)`);
    skipped++;
    continue;
  }

  // Get the code, clean it up
  let code = pyScriptMatch[1]
    .replace(/\\{/g, '{')   // un-escape braces from our earlier fix
    .replace(/\\}/g, '}')
    .trim();

  // Escape for use in a JSX prop string (double-quoted)
  // We'll use a template literal approach: store as data attribute
  const escapedCode = code
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '\\`');

  // Build the import line (add after frontmatter if not already present)
  const importLine = `import PythonEditor from '../../components/PythonEditor.astro';`;

  // Build the replacement block
  const replacement = `<PythonEditor code={\`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`} />`;

  // Replace the entire <section class="pyscript-container">...</section> block
  const sectionRegex = /<section[^>]*pyscript-container[^>]*>[\s\S]*?<\/section>/;
  if (!sectionRegex.test(content)) {
    console.log(`  SKIP  ${filename} (no pyscript-container section found)`);
    skipped++;
    continue;
  }

  let newContent = content.replace(sectionRegex, replacement);

  // Add import after frontmatter (after closing ---)
  if (!newContent.includes("import PythonEditor")) {
    newContent = newContent.replace(
      /^(---[\s\S]*?---\n)/,
      `$1\nimport PythonEditor from '../../components/PythonEditor.astro';\n`
    );
  }

  writeFileSync(filepath, newContent, 'utf-8');
  console.log(`  ✓     ${filename}`);
  upgraded++;
}

console.log(`\nDone! Upgraded: ${upgraded}, Skipped: ${skipped}`);
