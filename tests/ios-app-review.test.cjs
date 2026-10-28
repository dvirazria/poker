// The iOS app (ios-app/, a Capacitor shell around the built web app) and what App Review checks
// on a first submission (2026-10-28): iPhone-only and portrait, purpose strings for the photo
// picker's camera option, export compliance, the code bundled rather than fetched, links that
// actually open, no web-only copy, a way in for the reviewer, and native haptics/status bar.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('kupa-sgura.html', 'utf8');
const plist = fs.readFileSync('ios-app/ios/App/App/Info.plist', 'utf8');
const pbx = fs.readFileSync('ios-app/ios/App/App.xcodeproj/project.pbxproj', 'utf8');
const capConfig = JSON.parse(fs.readFileSync('ios-app/capacitor.config.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('ios-app/package.json', 'utf8'));
const syncWeb = fs.readFileSync('ios-app/sync-web.mjs', 'utf8');
const fn = name => {
  const s = Math.max(html.indexOf('  function ' + name + '('), html.indexOf('  async function ' + name + '('));
  assert.ok(s >= 0, 'missing ' + name);
  return html.slice(s, html.indexOf('\n  }\n', s) + 4);
};
const plistKey = (key) => {
  const at = plist.indexOf('<key>' + key + '</key>');
  assert.ok(at >= 0, 'Info.plist is missing ' + key);
  return plist.slice(at, plist.indexOf('<key>', at + 1) === -1 ? undefined : plist.indexOf('<key>', at + 1));
};

test('iPhone only, portrait only, arm64: no iPad screenshots or iPad layout review, no sideways UI', () => {
  assert.equal((pbx.match(/TARGETED_DEVICE_FAMILY = 1;/g) || []).length, 2, 'Debug and Release are iPhone-only');
  assert.doesNotMatch(pbx, /TARGETED_DEVICE_FAMILY = "1,2"/);
  assert.match(plistKey('UISupportedInterfaceOrientations'), /<array>\s*<string>UIInterfaceOrientationPortrait<\/string>\s*<\/array>/);
  assert.doesNotMatch(plist, /UISupportedInterfaceOrientations~ipad|Landscape/);
  assert.match(plistKey('UIRequiredDeviceCapabilities'), /<string>arm64<\/string>/);
});

test('the photo picker offers "take photo", so the camera purpose string exists (without it the app crashes)', () => {
  assert.match(html, /fileInput\.accept = "image\/\*";/);
  assert.match(plistKey('NSCameraUsageDescription'), /<string>[^<]*מצלמה[^<]*<\/string>/);
  assert.match(plistKey('NSPhotoLibraryUsageDescription'), /<string>[^<]*תמונ[^<]*<\/string>/);
});

test('export compliance is declared (HTTPS only), and the app speaks Hebrew', () => {
  assert.match(plistKey('ITSAppUsesNonExemptEncryption'), /<false\/>/);
  assert.match(plistKey('CFBundleDevelopmentRegion'), /<string>he<\/string>/);
  assert.match(plistKey('CFBundleLocalizations'), /<string>he<\/string>/);
});

test('the app bundles a pinned supabase-js instead of fetching the newest one from a CDN', () => {
  assert.match(pkg.devDependencies['@supabase/supabase-js'], /^\d+\.\d+\.\d+$/, 'an exact version, not a range');
  assert.match(syncWeb, /node_modules\/@supabase\/supabase-js\/dist\/umd\/supabase\.js/);
  assert.match(syncWeb, /const LOCAL_SUPABASE = "\.\/vendor\/supabase\.js";/);
  // both places the web page names the CDN: the <script> tag and the reconnect retry
  const cdn = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  assert.equal(html.split(cdn).length - 1, 2);
  assert.match(syncWeb, new RegExp('const CDN_SUPABASE = "' + cdn.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '";'));
  assert.match(syncWeb, /if \(uses !== 2\) throw new Error/);
});

test('native plugins: status bar and haptics are installed, link previews are off', () => {
  assert.ok(pkg.dependencies['@capacitor/status-bar']);
  assert.ok(pkg.dependencies['@capacitor/haptics']);
  assert.equal(capConfig.ios.allowsLinkPreview, false);
  assert.equal(capConfig.plugins.StatusBar.style, 'DARK', 'light clock over the dark launch and default theme');
});

test('the iOS-app helpers are no-ops on the web', () => {
  const section = html.slice(html.indexOf('  // ---------- iOS app (the Capacitor shell'), html.indexOf('  // ---------- theme (default: dark)'));
  const calls = [];
  const ctx = vm.createContext({
    location: { protocol: 'https:' }, document: { documentElement: { dataset: {} }, addEventListener: () => calls.push('listen') },
    window: { Capacitor: { Plugins: {}, isPluginAvailable: () => true } }, navigator: { vibrate: (ms) => calls.push('vibrate:' + ms) },
  });
  vm.runInContext(section, ctx);
  assert.equal(vm.runInContext('IN_IOS_APP', ctx), false);
  assert.equal(vm.runInContext('nativePlugin("Haptics")', ctx), null);
  vm.runInContext('syncStatusBar(); haptic("light"); haptic("success");', ctx);
  assert.deepEqual(calls, ['vibrate:20'], 'the website keeps its one buy-in vibration and nothing else');
});

test('inside the app: real haptics, the status bar follows the theme, legal links open the website', () => {
  const section = html.slice(html.indexOf('  // ---------- iOS app (the Capacitor shell'), html.indexOf('  // ---------- theme (default: dark)'));
  const calls = [];
  let clickHandler = null;
  const plugins = {
    Haptics: { impact: (o) => { calls.push('impact:' + o.style); return Promise.resolve(); },
      notification: (o) => { calls.push('notify:' + o.type); return Promise.resolve(); } },
    StatusBar: { setStyle: (o) => { calls.push('bar:' + o.style); return Promise.resolve(); } },
  };
  const ctx = vm.createContext({
    location: { protocol: 'capacitor:' },
    document: { documentElement: { dataset: { theme: 'light' } }, addEventListener: (type, h, capture) => { if (type === 'click' && capture) clickHandler = h; } },
    window: { Capacitor: { Plugins: plugins, isPluginAvailable: (n) => n in plugins }, open: (url, target) => calls.push('open:' + url + ' ' + target) },
    navigator: {}, PUBLIC_APP_ORIGIN: 'https://poker-tau-pink.vercel.app',
  });
  vm.runInContext(section, ctx);
  vm.runInContext('syncStatusBar(); haptic("light"); haptic("medium"); haptic("success");', ctx);
  assert.deepEqual(calls, ['bar:LIGHT', 'impact:LIGHT', 'impact:MEDIUM', 'notify:SUCCESS']);
  // a tap on the settings link (or the consent line's) opens the public page in Safari
  let prevented = false;
  const link = { getAttribute: () => './privacy.html' };
  clickHandler({ target: { closest: () => link }, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(calls[calls.length - 1], 'open:https://poker-tau-pink.vercel.app/privacy.html _blank');
  clickHandler({ target: { closest: () => null }, preventDefault: () => { throw new Error('other clicks are left alone'); } });
});

test('the haptics sit on a buy-in, on finishing a game and on closing the table; the theme drives the status bar', () => {
  assert.doesNotMatch(html, /try \{ if \(navigator\.vibrate\) navigator\.vibrate\(20\); \}/, 'the old buy-in vibration became haptic("light")');
  assert.match(html, /addEntry\(player, amount\);\n      save\(\);\n      haptic\("light"\);/);
  assert.match(html, /haptic\("medium"\); \/\/ the hold committed\n        finishGame\(\);/);
  assert.match(fn('finishCloseTable'), /haptic\("success"\);/);
  assert.match(fn('renderThemeIcon'), /syncStatusBar\(\);/);
});

test('no web-only copy inside the app: no "install to the home screen" notifications row, no Google button', () => {
  assert.match(fn('refreshPushRow'), /row\.hidden = !cloudMode\(\) \|\| IN_IOS_APP;/);
  assert.match(fn('refreshAuthBlock'), /authGoogleBtn"\)\.hidden = IN_IOS_APP;/);
  assert.doesNotMatch(html, /const inIosShell/);
});

test('App Review signs in on one fixed address with a password typed into the code field; nothing is emailed', () => {
  assert.match(html, /const REVIEW_EMAIL = "appreview@dvirazria\.co\.il";/);
  const send = fn('sendEmailCode');
  const review = send.indexOf('if (email.toLowerCase() === REVIEW_EMAIL) {');
  assert.ok(review > 0 && review < send.indexOf('signInWithOtp'), 'the review address returns before any email is sent');
  assert.match(fn('resendEmailCode'), /authEmailPending === REVIEW_EMAIL\) return;/);
  assert.match(fn('verifyEmailCode'), /authEmailPending === REVIEW_EMAIL\s*\? await supabase\.auth\.signInWithPassword\(\{ email: REVIEW_EMAIL, password: token \}\)\s*: await supabase\.auth\.verifyOtp\(/);
  // the password is never in the repo: only the address is
  assert.doesNotMatch(html, /REVIEW_PASSWORD|password: "\d/);
});

test('a support page (App Store Connect requires a support URL) with the same contact as the legal pages, linked from settings', () => {
  const support = fs.readFileSync('support.html', 'utf8');
  const privacy = fs.readFileSync('privacy.html', 'utf8');
  assert.ok(support.includes('<html lang="he" dir="rtl">'));
  assert.match(support, /<title>תמיכה — סוגרים קופה<\/title>/);
  const contact = privacy.match(/mailto:([^"]+)"/)[1];
  assert.ok(support.includes('mailto:' + contact), 'the same address as privacy.html');
  assert.match(support, /אזור מסוכן" ← "מחיקת חשבון"/, 'says where account deletion is');
  assert.doesNotMatch(support, /<script/i);
  assert.match(html, /<a class="set-row set-row-link" href="\.\/support\.html" target="_blank" rel="noopener">תמיכה ויצירת קשר<\/a>/);
  assert.match(html, /a\[href\$="support\.html"\]/, 'opens from the website inside the app too');
  // the privacy policy names the profile picture, which App Privacy lists as collected
  assert.match(privacy, /תמונת הפרופיל שלך/);
  assert.match(privacy, /your profile picture if you add one/);
});
