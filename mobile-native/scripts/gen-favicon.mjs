import { readFileSync, writeFileSync } from 'fs';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.resolve(__dirname, '../public/favicon.svg');
const outputPath = path.resolve(__dirname, '../public/favicon-100.png');

const svgContent = readFileSync(svgPath, 'utf-8');
const svgBase64 = Buffer.from(svgContent).toString('base64');
const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

const img = await loadImage(dataUrl);
const canvas = createCanvas(100, 100);
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0, 100, 100);
const buffer = canvas.toBuffer('image/png');
writeFileSync(outputPath, buffer);
console.log(`✅ Generated 100x100 PNG favicon: ${outputPath} (${buffer.length} bytes)`);
