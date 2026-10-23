/* Local, read-only UI validation. Start serve.py first. No production/model calls. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const playwright = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright') : require('playwright');
const origin = process.env.PET_REVIEW_ORIGIN || 'http://127.0.0.1:8989';
const kit = path.resolve(__dirname, '..');
const catalogPath = path.join(kit, 'pet-actions/catalog.json');
if (!fs.existsSync(catalogPath)) throw new Error('Actual action catalog is required; no fabricated frames are substituted.');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const catalogURL = new URL('/pet-actions/catalog.json', origin);
const posterURL = new URL(catalog.poster, catalogURL).href;
const frameURL = src => new URL(src, new URL(catalog.basePath || './', catalogURL)).href;
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const checks = [], errors = [];
if (process.env.PET_EXPECT_CATALOG_SHA256) assert.equal(sha(catalogPath), process.env.PET_EXPECT_CATALOG_SHA256, 'Catalog changed before validation.');
const pilot = process.env.PET_REVIEW_PHASE === 'pilot';
const report = {schemaVersion: 1, revision: 'v5', phase: pilot ? 'pilot' : 'full-delivery', status: 'RUNNING', executedAt: new Date().toISOString(), testScriptSHA256: sha(__filename), catalogSHA256: sha(catalogPath), catalogSummary: {characterId: catalog.characterId, appearanceVersion: catalog.appearanceVersion, actionCount: catalog.actions.length, sourceActionCount: catalog.sourceActionCount, derivedActionCount: catalog.derivedActionCount, sourcePoseCount: catalog.sourcePoseCount}, checks, limits: ['Local Chromium only; not real mobile hardware performance.', 'Visibility listener is tested with a simulated visibilitychange event.', 'Visual identity and animation aesthetics require separate human review.', 'No production deployment, AI, growth, financial or administrative APIs exercised.']};
const player = page => page.locator('.actions-demo__art .pet-action-player');
const snapshot = page => player(page).evaluate(node => ({action: node.dataset.action, frame: node.dataset.frame, running: node.dataset.running, fallback: node.dataset.fallback, image: node.querySelector('img').currentSrc}));
async function check(name, fn) {await fn();checks.push({name, result: 'PASS'});console.log('PASS ' + name);}

(async () => {
  const browser = await playwright.chromium.launch({headless: true, ...(process.env.PET_BROWSER_EXECUTABLE ? {executablePath: process.env.PET_BROWSER_EXECUTABLE} : {}), args: ['--no-sandbox']});
  try {
    report.browserVersion = browser.version();
    const context = await browser.newContext({viewport: {width: 1440, height: 1100}, reducedMotion: 'no-preference'});
    const page = await context.newPage();page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/integration/actions-demo.html');
    await player(page).filter({has: page.locator('img')}).waitFor();
    await page.waitForFunction(() => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.running === 'true');
    await check('catalog controls match delivered actions', async () => {assert.equal(await page.locator('.actions-demo__action').count(), catalog.actions.length);});
    await check('all declared frame URLs decode', async () => {
      const files = [...new Map(catalog.actions.flatMap(action => action.frames.map(frame => [frameURL(frame.src), {src: frameURL(frame.src), width: action.frameSize.width, height: action.frameSize.height}]))).values()];
      const failed = await page.evaluate(async files => (await Promise.all(files.map(file => new Promise(resolve => {const image = new Image();image.onload = () => resolve(image.naturalWidth === file.width && image.naturalHeight === file.height ? null : file.src);image.onerror = () => resolve(file.src);image.src = file.src;})))).filter(Boolean), files);
      report.catalogSummary.uniqueFrameFileCount = files.length;
      assert.deepEqual(failed, []);
    });
    const actionEvidence = [];
    for (const action of catalog.actions) {
      await page.locator(`[data-action-id="${action.id}"]`).click();
      await player(page).scrollIntoViewIfNeeded();
      await page.waitForFunction(id => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.action === id, action.id);
      const first = await snapshot(page);
      await page.waitForFunction(({id, frame}) => {const el = document.querySelector('.actions-demo__art .pet-action-player');return el?.dataset.action === id && el.dataset.frame !== frame;}, {id: action.id, frame: first.frame}, {timeout: Math.max(...action.frames.map(frame => frame.durationMs)) + 1800});
      const next = await snapshot(page);
      assert.notEqual(first.image, next.image);
      actionEvidence.push({id: action.id, distinctObservedFrameIndices: [first.frame, next.frame], mirror: Boolean(action.mirror)});
      console.log('FRAME ' + action.id);
    }
    checks.push({name: 'actual distinct frame changes for every action', result: 'PASS', actions: actionEvidence});
    await check('directional travel stays continuous across repeated gait cycles', async () => {
      const evidence = [];
      for (const id of ['walk-right', 'walk-left']) {
        const action = catalog.actions.find(item => item.id === id);
        if (!action || !action.motion) continue;
        await page.locator(`[data-action-id="${id}"]`).click();await player(page).scrollIntoViewIfNeeded();
        await page.waitForFunction(id => {const node = document.querySelector('.actions-demo__art .pet-action-player');return node?.dataset.action === id && node.dataset.running === 'true';}, id);
        await page.waitForTimeout(40);
        const x = () => page.locator('.actions-demo__art .pet-action-player__travel').evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41);
        const total = action.frames.reduce((sum, frame) => sum + frame.durationMs, 0);
        const positions = [await x()];await page.waitForTimeout(total * .3);positions.push(await x());await page.waitForTimeout(total * .3);positions.push(await x());
        const sign = action.direction === 'left' ? -1 : 1;
        assert((positions[1] - positions[0]) * sign > 0);assert((positions[2] - positions[1]) * sign > 0);
        if (action.mirror) assert.equal(await page.locator('.actions-demo__art .pet-action-player__image').evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m11), -1);
        evidence.push({id, positions});
      }
      report.travelEvidence = evidence;
    });
    await check('pause freezes character frame', async () => {
      await page.getByRole('button', {name: '暂停一下', exact: true}).click();
      const before = await snapshot(page);await page.waitForTimeout(400);const after = await snapshot(page);
      assert.equal(after.running, 'false');assert.equal(after.image, before.image);assert.equal(after.frame, before.frame);
      await page.getByRole('button', {name: '继续动作', exact: true}).click();
    });
    await check('one-shot returns to idle and can replay', async () => {
      const action = catalog.actions.find(item => item.id === 'jump') || catalog.actions.find(item => item.playback === 'once');
      assert(action, 'No one-shot action exists.');
      await page.locator(`[data-action-id="${action.id}"]`).click();await player(page).scrollIntoViewIfNeeded();
      await page.waitForFunction(id => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.action === id, action.id);
      await page.waitForFunction(id => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.action === id, action.returnTo || catalog.defaultAction, {timeout: action.frames.reduce((sum, frame) => sum + frame.durationMs, 0) + 2500});
      const idleId = action.returnTo || catalog.defaultAction;
      const idleAction = catalog.actions.find(item => item.id === idleId);
      assert.equal(await page.locator('.actions-demo__details h2').textContent(), idleAction.label);
      assert.equal(await page.locator(`[data-action-id="${idleId}"]`).getAttribute('aria-pressed'), 'true');
      await page.getByRole('button', {name: '再来一次', exact: false}).click();
      await page.waitForFunction(id => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.action === id, action.id);
    });
    await check('browser reduced-motion renders original poster', async () => {
      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.waitForFunction(() => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.action === 'poster');
      const state = await snapshot(page);assert.equal(state.running, 'false');assert.equal(state.image, posterURL);
      assert(await page.locator('.actions-demo__action').first().isDisabled());
      await page.emulateMedia({reducedMotion: 'no-preference'});
      await page.waitForFunction(() => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.running === 'true');
    });
    await check('hidden visibility event pauses time', async () => {
      await page.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, get: () => true});document.dispatchEvent(new Event('visibilitychange'));});
      await page.waitForFunction(() => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.running === 'false');
      const before = await snapshot(page);await page.waitForTimeout(350);const after = await snapshot(page);assert.equal(after.frame, before.frame);
      await page.evaluate(() => {delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
      await page.waitForFunction(() => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.running === 'true');
    });
    await check('offscreen player pauses', async () => {
      await page.setViewportSize({width: 1440, height: 360});await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForFunction(() => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.running === 'false');
      await player(page).scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('.actions-demo__art .pet-action-player')?.dataset.running === 'true');
    });
    await check('light dark and mobile layout without horizontal overflow', async () => {
      await page.getByRole('button', {name: '切换为深色主题'}).click();assert.equal(await page.locator('.actions-demo').getAttribute('data-theme'), 'dark');
      await page.setViewportSize({width: 390, height: 844});assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.getByRole('button', {name: '切换为浅色主题'}).click();assert.equal(await page.locator('.actions-demo').getAttribute('data-theme'), 'light');
    });
    await check('website pet actions keyboard and form avoidance', async () => {
      await page.goto(origin + '/integration/website-pet-demo.html');
      const launcher = page.getByRole('button', {name: '打开奶喵，AI 宠物'});await launcher.click();
      await page.getByRole('combobox', {name: '选择奶喵动作', exact: true}).waitFor();
      const target = catalog.actions.find(item => item.id === 'jump') || catalog.actions[0];
      await page.getByRole('combobox', {name: '选择奶喵动作', exact: true}).selectOption(target.id);
      await page.waitForFunction(id => document.querySelector('.website-pet__stage .pet-action-player')?.dataset.action === id, target.id);
      if (target.playback === 'once') {
        const idleId = target.returnTo || catalog.defaultAction;
        await page.waitForFunction(id => document.querySelector('.website-pet__stage .pet-action-player')?.dataset.action === id, idleId, {timeout: target.frames.reduce((sum, frame) => sum + frame.durationMs, 0) + 2500});
        assert.equal(await page.getByRole('combobox', {name: '选择奶喵动作', exact: true}).inputValue(), idleId);
      }
      assert(await page.getByRole('button', {name: '发送', exact: true}).isDisabled());
      const drag = page.getByRole('button', {name: '移动宠物面板；方向键微调，Home 回到右下角'});await drag.focus();
      const before = await page.locator('.website-pet').boundingBox();await page.keyboard.press('ArrowLeft');const after = await page.locator('.website-pet').boundingBox();assert(after.x <= before.x);
      await page.keyboard.press('Escape');await launcher.waitFor();await page.waitForFunction(() => document.activeElement === document.querySelector('.website-pet__launcher'));assert.equal(await launcher.evaluate(node => document.activeElement === node), true);
      await page.locator('#page-note').focus();await page.waitForFunction(() => getComputedStyle(document.querySelector('.website-pet')).visibility === 'hidden');
    });
    await check('missing frame keeps original poster', async () => {
      const failurePage = await context.newPage();
      const defaultAction = catalog.actions.find(action => action.id === catalog.defaultAction);
      await failurePage.route(frameURL(defaultAction.frames[0].src), route => route.fulfill({status: 404, body: ''}));
      await failurePage.goto(origin + '/integration/actions-demo.html');
      await failurePage.waitForFunction(() => {const el = document.querySelector('.actions-demo__art .pet-action-player');return el?.dataset.fallbackReason === 'frame' && el.dataset.action === 'poster';});
      await failurePage.waitForTimeout(300);assert.equal((await snapshot(failurePage)).image, posterURL);await failurePage.close();
    });
    await check('appearance version mismatch stays static', async () => {
      const mismatchPage = await context.newPage();
      await mismatchPage.route(catalogURL.href, route => route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({...catalog, appearanceVersion: '999.0.0'})}));
      await mismatchPage.goto(origin + '/integration/website-pet-demo.html');
      await mismatchPage.waitForFunction(() => {const el = document.querySelector('.website-pet__launcher .pet-action-player');return el?.dataset.fallbackReason === 'appearance-version' && el.dataset.action === 'poster';});
      assert.equal(await mismatchPage.locator('.website-pet__launcher .planar-pet-art').count(), 0);
      assert.equal(await mismatchPage.locator('.website-pet__launcher .pet-action-player').getAttribute('data-running'), 'false');
      await mismatchPage.close();
    });
    assert.equal(sha(catalogPath), report.catalogSHA256, 'Catalog changed during validation.');
    report.completedAt = new Date().toISOString();
    assert.deepEqual(errors, []);checks.push({name: 'no page JavaScript errors', result: 'PASS'});
    report.status = pilot ? 'PILOT_ACTIONS_RUNTIME_CHECKS_PASSED' : 'ACTIONS_RUNTIME_CHECKS_PASSED';
    report.sources = Object.fromEntries(['PetActionPlayer.tsx','pet-action-types.ts','pet-action-player.css','WebsitePet.tsx','website-pet.css','actions-demo.tsx','actions-demo.css','website-pet-appearance-catalog.json','vendor/actions-demo.bundle.js','vendor/website-pet-demo.bundle.js','vendor/actions-demo.bundle.css','vendor/website-pet-demo.bundle.css','vendor/9mew-review-sc.woff'].map(name => [name, sha(path.join(__dirname, name))]));
  } catch (error) {report.status = 'FAILED';report.error = String(error);throw error;}
  finally {fs.writeFileSync(path.join(__dirname, pilot ? 'actions-runtime-pilot-validation.json' : 'actions-runtime-validation.json'), JSON.stringify(report, null, 2) + '\n');await browser.close();}
})().catch(error => {console.error(error);process.exitCode = 1;});
