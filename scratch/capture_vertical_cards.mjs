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

  // wait 2s for chrome to start
  await new Promise(r => setTimeout(r, 2000));

  try {
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
    console.log('Connected to CDP!');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1400,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Wait 1.5s for initial render
    await new Promise(r => setTimeout(r, 1500));

    // 1. Scroll to Yes Bank POP-Club
    console.log('Scrolling to Yes Bank POP-Club...');
    await send('Runtime.evaluate', {
      expression: `
        // Switch to "All Cards" or search "POP-Club"
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
          searchInput.value = 'POP-Club';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_pop_club_grid.png', Buffer.from(shot1.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_pop_club_grid.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_pop_club_grid.png');
    console.log('Captured screenshot_pop_club_grid.png');

    // 2. Open Modal for yes-bank-pop-club
    console.log('Opening modal for Yes Bank POP-Club...');
    await send('Runtime.evaluate', {
      expression: `window.app.openCardDetails('yes-bank-pop-club');`
    });
    await new Promise(r => setTimeout(r, 800));

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_pop_club_modal.png', Buffer.from(shot2.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_pop_club_modal.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_pop_club_modal.png');
    console.log('Captured screenshot_pop_club_modal.png');

    // Close modal
    await send('Runtime.evaluate', {
      expression: `
        const closeBtn = document.querySelector('.modal-close');
        if (closeBtn) closeBtn.click();
      `
    });
    await new Promise(r => setTimeout(r, 500));

    // 3. Clear search and test comparison with vertical and horizontal cards
    console.log('Testing comparator with vertical & horizontal cards...');
    await send('Runtime.evaluate', {
      expression: `
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        window.app.comparator.clear();
        window.app.comparator.addCard('hdfc-regalia-gold');
        window.app.comparator.addCard('yes-bank-pop-club');
        window.app.comparator.addCard('indusind-legend');
        window.app.comparator.openModal();
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_comp_vertical.png', Buffer.from(shot3.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_comp_vertical.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_comp_vertical.png');
    console.log('Captured screenshot_comp_vertical.png');

    // 4. View grid with SBI Cashback, OneCard, Tata Neu
    await send('Runtime.evaluate', {
      expression: `
        const closeCompBtn = document.querySelector('#closeComparatorModal');
        if (closeCompBtn) closeCompBtn.click();
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
          searchInput.value = 'Cashback';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/screenshot_cashback_grid.png', Buffer.from(shot4.data, 'base64'));
    fs.copyFileSync('scratch/screenshot_cashback_grid.png', '/home/arjunr/.gemini/antigravity-ide/brain/534fc4d7-4790-4011-bced-fe993491cd3a/screenshot_cashback_grid.png');
    console.log('Captured screenshot_cashback_grid.png');

    ws.close();
  } finally {
    chrome.kill();
  }
  console.log('Finished capturing all verification screenshots!');
}

main().catch(console.error);
