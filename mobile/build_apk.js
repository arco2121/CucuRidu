const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mode = process.argv.includes('--release') ? 'release' : 'debug';
const ROOT = path.resolve(__dirname, '..');
const MOBILE_DIR = __dirname;
const ANDROID_DIR = path.join(MOBILE_DIR, 'android');
const OUT_DIR = path.join(MOBILE_DIR, 'out');
const isWin = process.platform === 'win32';

const run = (cmd, cwd) => {
    console.log(`\n> ${cmd}`);
    execSync(cmd, { cwd, stdio: 'inherit' });
};

// 1. Compila asset web, template EJS e bundle motore LAN
run('node build_mobile.js', ROOT);

// 2. Sincronizza www/ e plugin nativi nel progetto Android
run('npx cap sync android', MOBILE_DIR);

// 3. Compila l'APK con Gradle
if (!isWin) {
    fs.chmodSync(path.join(ANDROID_DIR, 'gradlew'), 0o755);
}
const gradlew = isWin ? 'gradlew.bat' : './gradlew';
const gradleTask = mode === 'release' ? 'assembleRelease' : 'assembleDebug';
run(`${gradlew} ${gradleTask}`, ANDROID_DIR);

// 4. Copia l'APK finale in mobile/out/ con nome pulito
fs.mkdirSync(OUT_DIR, { recursive: true });
const apkSubdir = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', mode);
const candidates = mode === 'release'
    ? ['app-release.apk', 'app-release-unsigned.apk']
    : ['app-debug.apk'];

const found = candidates.find(name => fs.existsSync(path.join(apkSubdir, name)));
if (!found) {
    throw new Error(`APK non trovato in ${apkSubdir}`);
}

const suffix = found.includes('unsigned') ? 'release-unsigned' : mode;
const destFile = path.join(OUT_DIR, `CucuRidu-${suffix}.apk`);
fs.copyFileSync(path.join(apkSubdir, found), destFile);

console.log(`\nAPK pronto: ${destFile}`);