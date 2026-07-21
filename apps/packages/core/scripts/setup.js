#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modelName = process.env.WISPR_MODEL_NAME || 'base.en';

const whisperDirMonorepo = join(__dirname, '..', '..', '..', '..', 'packages', 'whisper.cpp');
const whisperDirStandalone = join(__dirname, '..', 'whisper.cpp');

let whisperDir = whisperDirStandalone;
if (existsSync(whisperDirMonorepo)) {
  whisperDir = whisperDirMonorepo;
}

const binaryPath = join(whisperDir, 'main');
const modelPath = join(whisperDir, 'models', `ggml-${modelName}.bin`);

console.log('[my-wispr] Setting up whisper.cpp...');
console.log('[my-wispr] Target directory:', whisperDir);

try {
  if (!existsSync(whisperDir)) {
    console.log('[my-wispr] Cloning whisper.cpp (shallow)...');
    execSync(`git clone --depth 1 https://github.com/ggerganov/whisper.cpp.git "${whisperDir}"`, {
      stdio: 'inherit',
    });
  } else {
    console.log('[my-wispr] whisper.cpp already present.');
  }

  if (!existsSync(binaryPath)) {
    console.log('[my-wispr] Compiling whisper.cpp with make (1–2 min)...');
    execSync('make', {
      cwd: whisperDir,
      stdio: 'inherit',
    });
  } else {
    console.log('[my-wispr] Binary already compiled:', binaryPath);
  }

  if (!existsSync(modelPath)) {
    console.log(`[my-wispr] Downloading ggml-${modelName}.bin...`);
    execSync(`bash models/download-ggml-model.sh ${modelName}`, {
      cwd: whisperDir,
      stdio: 'inherit',
    });
  } else {
    console.log('[my-wispr] Model already downloaded:', modelPath);
  }

  console.log('[my-wispr] Setup complete.');
  console.log('[my-wispr] Binary:', binaryPath);
  console.log('[my-wispr] Model: ', modelPath);
} catch (error) {
  console.error('[my-wispr] Setup failed:', error.message);
  console.error('[my-wispr] Fix manually in:', whisperDir);
  console.error('[my-wispr] Or set WISPR_BIN / WISPR_MODEL to existing paths.');
  process.exit(1);
}
