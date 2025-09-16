// Copy web-ifc WASM into /public/wasm so it ships with the build
import { cpSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = resolve(__dirname, '..', 'node_modules', 'web-ifc');
const dstDir = resolve(__dirname, '..', 'public', 'wasm');

try {
  if (!existsSync(dstDir)) mkdirSync(dstDir, { recursive: true });

  const files = [
    'web-ifc.wasm',
    'web-ifc-mt.wasm',
    'web-ifc.wasm.wasm',     // 패키지 배포본에 따라 있을 수 있음
    'web-ifc-mt.wasm.wasm'   // 패키지 배포본에 따라 있을 수 있음
  ];

  let copied = 0;
  for (const f of files) {
    const src = resolve(srcDir, f);
    try {
      cpSync(src, resolve(dstDir, f));
      copied++;
    } catch {
      // 없는 파일은 무시
    }
  }
  console.log(`[copy-wasm] Copied ${copied} web-ifc wasm files to /public/wasm`);
} catch (e) {
  console.error('[copy-wasm] Failed to copy WASM files:', e);
  // 설치 실패로 빌드가 멈추지 않도록
  process.exit(0);
}
