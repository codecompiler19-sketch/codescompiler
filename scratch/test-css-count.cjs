const http = require('http');

http.get('http://localhost:4321/tutorial/css-introduction', res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const matches = html.match(/href="\/tutorial\/[^"]+"/g) || [];
    console.log('Total tutorial links on CSS frontend page:', matches.length);
  });
});
