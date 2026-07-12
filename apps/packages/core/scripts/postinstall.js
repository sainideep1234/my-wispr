const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const whisperDirMonorepo = join(__dirname, '..', '..', '..', 'whisper.cpp');
const whisperDirStandalone = join(__dirname, '..', 'whisper.cpp');

let whisperDir = whisperDirStandalone;
if (existsSync(whisperDirMonorepo)) {
  whisperDir = whisperDirMonorepo;
}

const binaryPath = join(whisperDir, 'main');
const modelPath = join(whisperDir, 'models', 'ggml-base.en.bin');

console.log('[wispr-core] Starting automatic whisper.cpp setup...');

try {
  if (!existsSync(whisperDir)) {
    console.log('[wispr-core] Cloning whisper.cpp repository (this may take a moment)...');
    execSync(`git clone --depth 1 https://github.com/ggerganov/whisper.cpp.git "${whisperDir}"`, {
      stdio: 'inherit',
    });
  } else {
    console.log('[wispr-core] whisper.cpp directory found at: ' + whisperDir);
  }

  if (!existsSync(binaryPath)) {
    console.log('[wispr-core] Compiling whisper.cpp binary with make (this may take 1-2 minutes)...');
    execSync('make', {
      cwd: whisperDir,
      stdio: 'inherit',
    });
  } else {
    console.log('[wispr-core] whisper.cpp binary is already compiled.');
  }

  if (!existsSync(modelPath)) {
    console.log('[wispr-core] Downloading ggml-base.en.bin model (~150MB)...');
    execSync('bash models/download-ggml-model.sh base.en', {
      cwd: whisperDir,
      stdio: 'inherit',
    });
  } else {
    console.log('[wispr-core] ggml-base.en.bin model is already downloaded.');
  }

  console.log('[wispr-core] Automatic setup completed successfully!');
} catch (error) {
  console.error('[wispr-core] Automatic setup failed:', error.message);
  console.error('[wispr-core] Please try compiling manually inside:', whisperDir);
}
