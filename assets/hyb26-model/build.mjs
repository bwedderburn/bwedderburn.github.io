// Optional maintainer rebuild. The checked-in browser bundle needs no build.
// Supply an installed esbuild/lib/main.js and its containing node_modules.
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
if (!process.argv[2] || !process.argv[3]) throw new Error('Usage: node build.mjs <esbuild/lib/main.js> <node_modules>');
const esbuild = await import(pathToFileURL(resolve(process.argv[2])).href);
await esbuild.build({
  entryPoints: [resolve(here, 'source/badge-editor-model.ts')],
  outfile: resolve(here, 'renderer.mjs'), bundle: true, format: 'esm',
  target: 'es2022', minify: false, legalComments: 'eof',
  nodePaths: [resolve(process.argv[3])],
  plugins: [{ name: 'local-three-runtime', setup(build) {
    build.onResolve({ filter: /^three$/ }, () => ({ path: '../vendor/three/three.module.js', external: true }));
  } }],
  banner: { js: '// Adapted HYB26 renderer. See LICENSE-UPSTREAM.txt and docs/portfolio/HYB26-MODEL.md. Do not edit this generated bundle.' },
});
