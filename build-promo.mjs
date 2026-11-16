import fs from 'node:fs';
import path from 'node:path';

const dir = new URL('.', import.meta.url).pathname;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'demo.css'), 'utf8');
const js = fs.readFileSync(path.join(dir, 'demo.js'), 'utf8');

const voData = {};
for (let i = 0; i < 10; i++) {
  const f = path.join(dir, 'audio', `vo-${i}.mp3`);
  if (!fs.existsSync(f)) break;
  voData[i] = `data:audio/mp3;base64,${fs.readFileSync(f).toString('base64')}`;
}

const voScript = Object.keys(voData).length
  ? `<script>window.__VO_DATA__ = ${JSON.stringify(voData)};</script>\n`
  : '';

const out = html
  .replace('<link rel="stylesheet" href="demo.css" />', `<style>\n${css}\n</style>`)
  .replace('<script src="demo.js"></script>', `${voScript}<script>\n${js}\n</script>`);

fs.writeFileSync(path.join(dir, 'promo.html'), out, 'utf8');
console.log(`Built promo.html (${Object.keys(voData).length} embedded voiceover clips).`);
