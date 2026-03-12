/**
 * Build script — Alpha Convites Editor
 * Usa esbuild para empacotar React + Polotno SDK em um único bundle.
 *
 * Uso:
 *   npm run build       → bundle minificado (produção)
 *   npm run build:dev   → bundle não-minificado (dev, source maps)
 *   npm run watch       → re-build ao salvar arquivos
 */

const esbuild = require('esbuild');
const path    = require('path');
const isDev   = process.argv.includes('--dev');
const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: [path.join(__dirname, 'src', 'index.jsx')],
  bundle:      true,
  outfile:     path.join(__dirname, '..', 'public', 'js', 'personalizar.bundle.js'),
  platform:    'browser',
  target:      ['chrome90', 'firefox90', 'safari14'],
  define: {
    'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
  },
  loader: {
    '.jsx': 'jsx',
    '.js':  'js',
    '.css': 'text',
    '.svg': 'text',
    '.png': 'dataurl',
  },
  jsx:           'automatic',
  jsxImportSource: 'react',
  minify:        !isDev,
  sourcemap:     isDev,
  logLevel:      'info',
};

if (isWatch) {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('[build] Watching for changes...');
  });
} else {
  esbuild.build(config)
    .then(() => console.log('[build] Bundle gerado em public/js/personalizar.bundle.js'))
    .catch(() => process.exit(1));
}
