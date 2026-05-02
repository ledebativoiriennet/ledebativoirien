const html = '<p>Test text</p><p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA" alt="test"></p>';
const match = html.match(/<img[^>]*?src=["']([^"']+)["']/i);
console.log(match ? match[1] : 'null');

const html2 = '<img alt="foo" src="https://example.com/image.jpg" />';
const match2 = html2.match(/<img[^>]*?src=["']([^"']+)["']/i);
console.log(match2 ? match2[1] : 'null');
