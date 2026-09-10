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
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Wait for render
    await new Promise(r => setTimeout(r, 1500));

    // Scroll to yes-bank-pop-club card
    await send('Runtime.evaluate', {
      expression: `
        // Click All Cards tab
        const allTab = Array.from(document.querySelectorAll('.filter-tab')).find(t => t.textContent.includes('All Cards'));
        if (allTab) allTab.click();

        const card = document.querySelector('[data-card-id=\"yes-bank-pop-club\"]');
        if (card) {
          const rect = card.getBoundingClientRect();
          window.scrollTo(0, window.scrollY + rect.top - 120);
        }
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_pop_club_row.png', Buffer.from(shot.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_pop_club_row.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_pop_club_row.png');
    console.log('Saved screenshot_pop_club_row.png');

    // Also test comparator with Yes Bank POP Club, HDFC Regalia Gold, IndusInd Legend
    await send('Runtime.evaluate', {
      expression: `
        window.app.comparator.clear();
        window.app.comparator.addCard('hdfc-regalia-gold');
        window.app.comparator.addCard('yes-bank-pop-club');
        window.app.comparator.addCard('indusind-legend');
        window.app.comparator.openModal();
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    const shotComp = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_comparator_row.png', Buffer.from(shotComp.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_comparator_row.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_comparator_row.png');
    console.log('Saved screenshot_comparator_row.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);
