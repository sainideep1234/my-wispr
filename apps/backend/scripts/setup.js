import { execSync } from 'child_process';
import { existsSync, readdirSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const whisperDir = join(__dirname, '..', '..', '..', 'packages', 'whisper.cpp');
const binaryPath = join(whisperDir, 'main');

// Load environment variables from .env if present
let modelName = 'base.en';
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^WISPR_MODEL_NAME\s*=\s*(.+)$/m);
    if (match) {
      modelName = match[1].trim();
    }
  } catch (err) {
    console.warn('[my-wispr-server] Warning: Could not read .env file:', err.message);
  }
}

const modelPath = join(whisperDir, 'models', `ggml-${modelName}.bin`);

console.log('[my-wispr-server] Starting automatic whisper.cpp setup...');

try {
  // Check if directory doesn't exist or is empty
  const needsClone = !existsSync(whisperDir) || readdirSync(whisperDir).length === 0;

  if (needsClone) {
    if (!existsSync(whisperDir)) {
      mkdirSync(whisperDir, { recursive: true });
    }
    console.log('[my-wispr-server] Cloning whisper.cpp repository (this may take a moment)...');
    execSync(
      `git clone --depth 1 --branch v1.4.2 https://github.com/ggerganov/whisper.cpp.git "${whisperDir}"`,
      {
        stdio: 'inherit',
      },
    );
  } else {
    console.log('[my-wispr-server] whisper.cpp directory found at: ' + whisperDir);
  }

  if (!existsSync(binaryPath)) {
    console.log(
      '[my-wispr-server] Compiling whisper.cpp binary with make (this may take 1-2 minutes)...',
    );
    execSync('make main', {
      cwd: whisperDir,
      stdio: 'inherit',
    });
  } else {
    console.log('[my-wispr-server] whisper.cpp binary is already compiled.');
  }

  if (!existsSync(modelPath)) {
    console.log(`[my-wispr-server] Downloading ggml-${modelName}.bin model...`);
    execSync(`bash models/download-ggml-model.sh ${modelName}`, {
      cwd: whisperDir,
      stdio: 'inherit',
    });
  } else {
    console.log(`[my-wispr-server] ggml-${modelName}.bin model is already downloaded.`);
  }

  console.log('[my-wispr-server] Automatic setup completed successfully!');
} catch (error) {
  console.error('[my-wispr-server] Automatic setup failed:', error.message);
  process.exit(1);
}
