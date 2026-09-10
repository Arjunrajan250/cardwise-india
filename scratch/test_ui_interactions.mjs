import fs from 'fs';

async function main() {
  const versionRes = await fetch('http://127.0.0.1:9222/json/list');
  const pages = await versionRes.json();
  const page = pages.find(p => p.url.includes('3000')) || pages[0];
  console.log('Connecting to page:', page.title, page.url);

  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  });

  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  console.log('Connected to Chrome DevTools Protocol!');

  // Set viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // 1. Open Card Details Modal for HDFC Millennia
  console.log('Triggering openCardDetails for hdfc-millennia...');
  await send('Runtime.evaluate', {
    expression: `
      window.app.openCardDetails('hdfc-millennia');
    `
  });

  // Wait 1s for modal transition and image rendering
  await new Promise(r => setTimeout(r, 1000));

  // Take screenshot of Modal
  const modalScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/screenshot_modal_showcase.png', Buffer.from(modalScreenshot.data, 'base64'));
  fs.copyFileSync('scratch/screenshot_modal_showcase.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_modal_showcase.png');
  console.log('Captured screenshot_modal_showcase.png');

  // 2. Close Modal and test Comparator
  console.log('Closing modal and opening comparator...');
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('cardDetailModal')?.classList.remove('open');
      window.app.comparator.selectedCardIds = ['hdfc-millennia', 'sbi-cashback'];
      window.app.openComparatorModal();
    `
  });

  await new Promise(r => setTimeout(r, 1000));

  // Take screenshot of Comparator
  const compScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/screenshot_comparator_showcase.png', Buffer.from(compScreenshot.data, 'base64'));
  fs.copyFileSync('scratch/screenshot_comparator_showcase.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_comparator_showcase.png');
  console.log('Captured screenshot_comparator_showcase.png');

  ws.close();
  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
