import fs from 'fs';

async function main() {
  const versionRes = await fetch('http://127.0.0.1:9222/json/version');
  const versionData = await versionRes.json();
  const wsUrl = versionData.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);

  let id = 1;
  const callbacks = new Map();

  ws.onopen = async () => {
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    async function sendSession(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
      });
    }

    await sendSession('Page.enable');
    await sendSession('DOM.enable');

    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sendSession('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll footer into view
    await sendSession('Runtime.evaluate', {
      expression: 'document.querySelector(".footer-brand").scrollIntoView({ behavior: "instant", block: "center" })'
    });
    await new Promise(r => setTimeout(r, 500));

    const brandBoxRes = await sendSession('Runtime.evaluate', {
      expression: 'const r = document.querySelector(".footer-brand").getBoundingClientRect(); ({ x: r.x, y: r.y, width: r.width, height: r.height })',
      returnByValue: true
    });
    const box = brandBoxRes.result.value;

    const shotFooter = await sendSession('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: Math.max(0, box.y - 30), width: 390, height: 160, scale: 1 }
    });
    fs.writeFileSync('/home/arjunr/.gemini/antigravity-ide/brain/66906170-4c43-45e6-a124-59a79d57929f/new_logo_footer.png', Buffer.from(shotFooter.data, 'base64'));
    console.log('Saved new_logo_footer.png');

    await sendSession('Target.closeTarget', { targetId });
    ws.close();
    process.exit(0);
  };
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
