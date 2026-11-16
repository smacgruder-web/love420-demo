import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const dir = new URL('.', import.meta.url).pathname;
const demoJs = fs.readFileSync(path.join(dir, 'demo.js'), 'utf8');
const lines = [...demoJs.matchAll(/vo:\s*'([^']+)'/g)].map((m) => m[1]);

if (!lines.length) {
  console.error('No vo strings found in demo.js');
  process.exit(1);
}

const outDir = path.join(dir, 'audio');
fs.mkdirSync(outDir, { recursive: true });

async function generateClip(text, outFile) {
  if (process.env.OPENAI_API_KEY) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: 'coral',
        input: text,
        instructions: 'Warm, confident, concise product demo narrator.',
      }),
    });
    if (!res.ok) throw new Error(`OpenAI TTS ${res.status}: ${await res.text()}`);
    fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
    return;
  }

  if (process.env.ELEVENLABS_API_KEY) {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
    return;
  }

  execFileSync('edge-tts', [
    '--voice', 'en-US-AvaMultilingualNeural',
    '--text', text,
    '--write-media', outFile,
  ], { stdio: 'inherit' });
}

for (let i = 0; i < lines.length; i++) {
  const outFile = path.join(outDir, `vo-${i}.mp3`);
  console.log(`Generating audio/vo-${i}.mp3...`);
  await generateClip(lines[i], outFile);
}
console.log('Voiceover clips ready.');
