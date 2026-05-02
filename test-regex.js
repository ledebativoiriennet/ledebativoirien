function getFirstParagraphs(html) {
  const regex = /<\/p>/gi;
  let match;
  let splitIndex = -1;
  
  while ((match = regex.exec(html)) !== null) {
    const htmlUpToMatch = html.substring(0, match.index + 4);
    const textOnly = htmlUpToMatch.replace(/<[^>]+>/g, '').trim();
    if (textOnly.length > 50) {
      splitIndex = match.index + 4;
      break;
    }
  }
  
  if (splitIndex !== -1) {
    return html.substring(0, splitIndex);
  }
  return html.substring(0, 400);
}

const html1 = '<h2>Headline</h2><p><br></p><p>This is a very short text.</p><p>This is a much longer paragraph that definitely exceeds fifty characters in total length so it should split here.</p><p>Secret stuff!</p>';
console.log("TEST 1:");
console.log(getFirstParagraphs(html1));

const html2 = '<p>Short</p>';
console.log("TEST 2:");
console.log(getFirstParagraphs(html2));
