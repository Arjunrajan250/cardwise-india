import { spawn } from 'child_process';
import fs from 'fs';

const ARTIFACT_DIR = '/home/arjunr/.gemini/antigravity-ide/brain/461965aa-3156-4b65-9bff-16fc56d16afc';

async function main() {
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9333',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1400,1100',
    'about:blank'
  ]);

  // wait for chrome to start
  await new Promise(r => setTimeout(r, 1200));

  async function cdpCall(ws, method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 1000000);
      const handler = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  try {
    // 1. Open article page
    const newPageRes = await fetch('http://127.0.0.1:9333/json/new?http://localhost:3000/blogs/what-is-upi-credit-card', { method: 'PUT' });
    const pageData = await newPageRes.json();
    const ws = new WebSocket(pageData.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    // Wait for content & images to load
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to Section 1 (At a Glance: How Does a UPI Credit Card Work?)
    await cdpCall(ws, 'Runtime.evaluate', {
      expression: `
        const sec1 = document.getElementById('toc-sec-1');
        if (sec1) {
          sec1.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      `
    });

    await new Promise(r => setTimeout(r, 1000));

    // Capture Section 2 screenshot
    const shotSec1 = await cdpCall(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${ARTIFACT_DIR}/upi_blog_section2_image.png`, Buffer.from(shotSec1.data, 'base64'));
    console.log('Saved upi_blog_section2_image.png');

    // 2. Open Homepage and scroll to credit guides section
    await cdpCall(ws, 'Page.navigate', { url: 'http://localhost:3000/#credit-guides-section' });
    await new Promise(r => setTimeout(r, 2000));

    await cdpCall(ws, 'Runtime.evaluate', {
      expression: `
        const section = document.getElementById('creditGuidesSection');
        if (section) {
          section.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      `
    });

    await new Promise(r => setTimeout(r, 800));

    const shotCard = await cdpCall(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${ARTIFACT_DIR}/homepage_upi_card_image.png`, Buffer.from(shotCard.data, 'base64'));
    console.log('Saved homepage_upi_card_image.png');

    ws.close();
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    chrome.kill('SIGTERM');
  }
}

main();
