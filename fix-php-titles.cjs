const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Computer/Desktop/github/New_codecompiler/App/src/content/tutorials';

const fixes = [
  { file: 'php-guide.mdx',           title: 'PHP \u2013 Guide',           desc: 'Welcome to the CodesCompiler PHP tutorial. Discover what PHP is, how it powers over 77% of the web, and start building dynamic applications.', order: 1 },
  { file: 'php-roadmap.mdx',         title: 'PHP \u2013 Roadmap',         desc: 'A structured PHP learning roadmap from beginner to confident developer \u2014 covering syntax basics, OOP, databases, and modern PHP 8 features.', order: 2 },
  { file: 'php-intro.mdx',           title: 'PHP \u2013 Intro',           desc: 'An introduction to PHP: what it is, how it works as a server-side language, and why millions of developers choose it for web applications.', order: 3 },
  { file: 'php-install.mdx',         title: 'PHP \u2013 Install',         desc: 'Learn how to install PHP on Windows, macOS, and Linux. Set up XAMPP or a standalone PHP environment and run your first local PHP script.', order: 4 },
  { file: 'php-history.mdx',         title: 'PHP \u2013 History',         desc: 'Explore the history of PHP from Rasmus Lerdorf\'s Personal Home Page tools in 1994 to the modern PHP 8 powerhouse used by billions of websites.', order: 5 },
  { file: 'php-features.mdx',        title: 'PHP \u2013 Features',        desc: 'Discover the top features that make PHP dominant: open source, cross-platform support, rich database connectivity, and blazing performance.', order: 6 },
  { file: 'php-syntax.mdx',          title: 'PHP \u2013 Syntax',          desc: 'Master PHP syntax fundamentals: how PHP scripts start, how statements end, case sensitivity rules, and how PHP embeds inside HTML documents.', order: 7 },
  { file: 'php-first-program.mdx',   title: 'PHP \u2013 First Program',   desc: 'Write your very first PHP program! Learn to output text with echo, understand the PHP opening tag, and run PHP live in your browser.', order: 8 },
  { file: 'php-comments.mdx',        title: 'PHP \u2013 Comments',        desc: 'Learn all three PHP comment styles: single-line, multi-line, and DocBlock. Discover when and why to comment your code for clarity.', order: 9 },
  { file: 'php-variables.mdx',       title: 'PHP \u2013 Variables',       desc: 'Variables are the building blocks of PHP. Learn strict naming rules, dynamic typing, variable assignment, and string interpolation.', order: 10 },
  { file: 'php-echo-print.mdx',      title: 'PHP \u2013 Echo/Print',      desc: 'Compare PHP\'s echo and print output constructs. Understand their differences and when to use each in your PHP programs.', order: 11 },
  { file: 'php-var-dump.mdx',        title: 'PHP \u2013 var_dump',        desc: 'Master PHP\'s var_dump() to inspect any variable\'s type and value. Compare it to print_r() and var_export() for effective debugging.', order: 12 },
  { file: 'php-reference-vars.mdx',  title: 'PHP \u2013 $ & $$ Vars',    desc: 'Understand the difference between PHP variables and variable variables. Learn how dynamic variable names work and when to use them safely.', order: 13 },
  { file: 'php-constants.mdx',       title: 'PHP \u2013 Constants',       desc: 'Learn how to define PHP constants using define() and const. Discover why constants are faster than variables and use predefined PHP constants.', order: 14 },
  { file: 'php-magic-constants.mdx', title: 'PHP \u2013 Magic Const',     desc: 'Explore PHP\'s eight magic constants like __LINE__, __FILE__, __CLASS__, and __FUNCTION__ that change value depending on where they are used.', order: 15 },
  { file: 'php-data-types.mdx',      title: 'PHP \u2013 Data Types',      desc: 'PHP supports 8 primitive data types: String, Integer, Float, Boolean, Array, Object, NULL, and Resource. Master them all with live examples.', order: 16 },
  { file: 'php-type-casting.mdx',    title: 'PHP \u2013 Type Casting',    desc: 'Master PHP type casting to explicitly convert values between types using (int), (float), (string), (bool), (array), and (object) operators.', order: 17 },
  { file: 'php-type-juggling.mdx',   title: 'PHP \u2013 Type Juggling',   desc: 'Understand how PHP automatically converts data types behind the scenes. Learn juggling rules that affect comparisons, arithmetic, and logic.', order: 18 },
  { file: 'php-strings.mdx',         title: 'PHP \u2013 Strings',         desc: 'Master PHP strings from creation and concatenation to 20+ powerful built-in string functions that supercharge your text processing skills.', order: 19 },
];

for (const { file, title, desc, order } of fixes) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`MISSING: ${file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace frontmatter block
  content = content.replace(/^title:.*$/m, `title: "${title}"`);
  content = content.replace(/^description:.*$/m, `description: "${desc}"`);
  content = content.replace(/^order:.*$/m, `order: ${order}`);
  // Remove old group line if any
  content = content.replace(/^group:.*\n?/m, '');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${file} -> ${title}`);
}
console.log('\nAll titles fixed!');
