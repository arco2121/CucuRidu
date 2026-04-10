const esbuild = require('esbuild');
const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssConfig = require(path.join(__dirname, "postcss.config"));

const paths = {
    scriptsIn: path.join(__dirname, 'public', 'script'),
    scriptsOut: path.join(__dirname, 'public', 'dist', 'script'),
    cssSrc: path.join(__dirname, 'public', 'style'),
    cssDist: path.join(__dirname, 'public', 'dist', 'style'),
    babelConfig: JSON.parse(fs.readFileSync(path.join(__dirname, '.babelrc'), 'utf8') || "{}")
};
const toIgnore = ['external'];

const babelPlugin = {
    name: 'babel',
    setup(build) {
        build.onLoad({ filter: /\.js$/ }, async (args) => {
            const source = await fs.promises.readFile(args.path, 'utf8');
            const asyncFuncNames = [];
            const regex = /(?:async\s+function\s+([a-zA-Z0-9_$]+))|(?:(?:const|var|let)\s+([a-zA-Z0-9_$]+)\s*=\s*async)/g;
            let m;
            while ((m = regex.exec(source)) !== null) {
                asyncFuncNames.push(m[1] || m[2]);
            }
            const { code } = await babel.transformAsync(source, {
                filename: args.path,
                sourceType: "script",
                presets: paths.babelConfig.presets || [],
                plugins: paths.babelConfig.plugins || []
            });
            let injection = "\n/* --- Global Bridge Automatico --- */\n";
            asyncFuncNames.forEach(name => {
                injection += `
                    (function() {
                        var target = typeof ${name} !== 'undefined' ? ${name} : (typeof _${name} !== 'undefined' ? _${name} : null);
                        if (target && !window['${name}']) { window['${name}'] = target; }
                    })();`;
            });

            return { contents: code + injection };
        });
    },
};

const buildCSS = async () => {
    if (!fs.existsSync(paths.cssDist)) fs.mkdirSync(paths.cssDist, { recursive: true });

    const cssFiles = getFilesRecursively(paths.cssSrc, '.css');

    for (const file of cssFiles) {
        const relativePath = path.relative(paths.cssSrc, file);
        const to = path.join(paths.cssDist, relativePath);
        const destDir = path.dirname(to);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        const css = fs.readFileSync(file, 'utf8');

        const result = await postcss(postcssConfig.plugins).process(css, { from: file, to });
        fs.writeFileSync(to, result.css);
        if (result.map) fs.writeFileSync(to + '.map', result.map.toString());
    }
};

const getFilesRecursively = (dir, extension) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath, extension));
        } else if (file.endsWith(extension)) {
            results.push(filePath);
        }
    });
    return results;
};

const buildScripts = async () => {
    const allFiles = getFilesRecursively(paths.scriptsIn, '.js');
    const entryPoints = allFiles.filter(f => {
        const pathParts = f.split(path.sep);
        const isIgnored = pathParts.some(part => toIgnore.includes(part));
        return !isIgnored;
    });

    await esbuild.build({
        entryPoints: entryPoints,
        bundle: false,
        minify: false,
        target: ['es5'],
        plugins: [babelPlugin],
        outdir: paths.scriptsOut,
        outbase: paths.scriptsIn,
    });
}

buildScripts()
    .then(() => console.log("build script => true"))
    .catch(err => {
        console.error(err);
        process.exit(1);
    })
    .then(buildCSS).then(() => console.log("build styles => true\n"))
    .catch(err => {
        console.error(err);
        process.exit(2);
    })
    .then(() => console.log("Build completata\n"));