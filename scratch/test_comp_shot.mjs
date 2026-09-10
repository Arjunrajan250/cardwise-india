import fs from 'fs';
import { spawn } from 'child_process';

async function main() {
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'http://127.0.0.1:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const versionRes = await fetch('http://127.0.0.1:9222/json/list');
    const pages = await versionRes.json();
    const page = pages.find(p => p.url.includes('3000')) || pages[0];
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

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1400,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false
    });

    await new Promise(r => setTimeout(r, 1500));

    // Clear and toggle cards in comparator
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          window.app.comparator.clearAll();
          window.app.comparator.toggleCard('hdfc-regalia-gold');
          window.app.comparator.toggleCard('yes-bank-pop-club');
          window.app.comparator.toggleCard('indusind-legend');
          window.app.openComparatorModal();
          return { ok: true, cards: window.app.comparator.getSelectedCards().map(c => c.id) };
        })()
      `,
      returnByValue: true
    });
    console.log('Eval result:', evalRes.result.value);

    await new Promise(r => setTimeout(r, 1000));

    const shotComp = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_comparator_showcase.png', Buffer.from(shotComp.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_comparator_showcase.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_comparator_showcase.png');
    console.log('Saved screenshot_comparator_showcase.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);
