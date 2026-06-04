const fs = require('fs');
const yaml = require('js-yaml');
try {
  const file = fs.readFileSync('./public/admin/config.yml', 'utf8');
  const doc = yaml.load(file);
  console.log('YAML is valid.');
} catch (e) {
  console.log('YAML Parse Error:', e);
}
