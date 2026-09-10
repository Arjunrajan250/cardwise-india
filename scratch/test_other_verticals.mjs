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

    // 1. OneCard Metal
    await send('Runtime.evaluate', {
      expression: `
        const card = document.querySelector('[data-card-id=\"onecard-metal\"]');
        if (card) {
          const rect = card.getBoundingClientRect();
          window.scrollTo(0, window.scrollY + rect.top - 120);
        }
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_onecard_row.png', Buffer.from(shot1.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_onecard_row.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_onecard_row.png');
    console.log('Saved screenshot_onecard_row.png');

    // 2. SBI Cashback
    await send('Runtime.evaluate', {
      expression: `
        const card = document.querySelector('[data-card-id=\"sbi-cashback\"]');
        if (card) {
          const rect = card.getBoundingClientRect();
          window.scrollTo(0, window.scrollY + rect.top - 120);
        }
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_sbicashback_row.png', Buffer.from(shot2.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_sbicashback_row.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_sbicashback_row.png');
    console.log('Saved screenshot_sbicashback_row.png');

    // 3. Scapia Federal
    await send('Runtime.evaluate', {
      expression: `
        const card = document.querySelector('[data-card-id=\"scapia-federal\"]');
        if (card) {
          const rect = card.getBoundingClientRect();
          window.scrollTo(0, window.scrollY + rect.top - 120);
        }
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_scapia_row.png', Buffer.from(shot3.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_scapia_row.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_scapia_row.png');
    console.log('Saved screenshot_scapia_row.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);
