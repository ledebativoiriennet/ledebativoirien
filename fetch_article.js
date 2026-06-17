const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const article = await prisma.article.findUnique({ where: { slug: 'operations-de-remblayage-robert-mambe-chef-du-gouvernement-tape-du-poing-sur-la-table-avec-7-mesures-directes-halte' }});
  if (!article) {
    console.log("NOT FOUND");
  } else {
    console.log("CONTENT LENGTH:", article.content.length);
    console.log("FIRST 500 CHARS:", article.content.substring(0, 500));
    console.log("ANY IFRAMES?", article.content.includes('<iframe'));
    console.log("ANY PRE/CODE?", article.content.includes('<pre'));
    console.log("ANY TABLES?", article.content.includes('<table'));
    // check if there's any huge word
    const words = article.content.replace(/<[^>]+>/g, '').split(/\s+/);
    const longWords = words.filter(w => w.length > 50);
    console.log("WORDS > 50 CHARS:", longWords);
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
