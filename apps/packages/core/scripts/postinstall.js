#!/usr/bin/env node
/**
 * Lightweight postinstall notice — does NOT clone or compile.
 * Run setup explicitly: npx my-wispr-setup
 */
console.log('[my-wispr] Installed. Next: npx my-wispr-setup  (clones/builds whisper.cpp + model)');
console.log('[my-wispr] Or set WISPR_BIN / WISPR_MODEL if you already have them.');
