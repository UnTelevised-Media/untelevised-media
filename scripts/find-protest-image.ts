import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Search for Ohio Statehouse images
const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent('Ohio Statehouse Columbus')}&srnamespace=6&srlimit=5&format=json&origin=*`;
const sRes = await fetch(searchUrl);
const sData = (await sRes.json()) as { query?: { search?: Array<{ title: string }> } };
console.log('=== Ohio Statehouse Columbus ===');
for (const hit of sData.query?.search ?? []) console.log(' ', hit.title);

// Also get URL for the Oklahoma demo image (confirmed working)
const okFile = 'Oklahoma Guardsmen Provide Security for Political Demonstration (8835593).jpg';
const okUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(okFile)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
const okRes = await fetch(okUrl);
const okData = (await okRes.json()) as any;
const okPage = Object.values((okData as any).query.pages)[0] as any;
console.log('\nOklahoma demo image URL:', okPage.imageinfo[0].url);
