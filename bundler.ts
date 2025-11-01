import fs from 'node:fs/promises'

const outdir = './dist';
await fs.rm(outdir, { recursive: true, force: true })

const entrypoints = ["src/popup/popup.html"]
await Bun.build({
    entrypoints: entrypoints,
    outdir: outdir,
    minify: false,
});

const file = Bun.file('manifest.json');
await Bun.write(outdir + '/manifest.json', file);
