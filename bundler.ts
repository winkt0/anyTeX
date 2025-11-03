import fs from 'node:fs/promises'

const outdir = './dist';
await fs.rm(outdir, { recursive: true, force: true })

const entrypoints = ["src/popup/popup.html"]
await Bun.build({
    entrypoints: entrypoints,
    outdir: outdir,
    minify: false,
    target: "bun"
});

async function copyToDist(filename: string) {
    const file = Bun.file(filename);
    await Bun.write(outdir + '/' + filename, file);
}
copyToDist('manifest.json');
copyToDist('images/icon.png');
