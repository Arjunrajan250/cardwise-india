import { spawn } from 'child_process';

const chrome = spawn('google-chrome', [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=430,932',
  'http://localhost:3000/'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const versionRes = await fetch('http://127.0.0.1:9223/json/list');
  const pages = await versionRes.json();
  const page = pages[0];

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
    width: 430,
    height: 932,
    deviceScaleFactor: 2,
    mobile: true
  });

  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const winWidth = window.innerWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const docWidth = document.documentElement.offsetWidth;
        const overflowing = [];

        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > winWidth + 1) {
            overflowing.push({
              tag: el.tagName,
              id: el.id,
              class: el.className,
              rectRight: Math.round(rect.right),
              rectWidth: Math.round(rect.width)
            });
          }
        });
        return JSON.stringify({ winWidth, docWidth, scrollWidth, overflowing: overflowing.slice(0, 20) }, null, 2);
      })()
    `,
    returnByValue: true
  });

  console.log(res.result.value);
  ws.close();
} catch (err) {
  console.error('Error:', err);
} finally {
  chrome.kill();
  process.exit(0);
}
