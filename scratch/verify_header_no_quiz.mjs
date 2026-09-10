import fs from 'fs';

async function main() {
  const versionRes = await fetch('http://127.0.0.1:9222/json/version');
  const { webSocketDebuggerUrl } = await versionRes.json();
  const ws = new WebSocket(webSocketDebuggerUrl);

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

    // 1. Mobile Viewport 390 x 844
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sendSession('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 1200));

    const shotMobile390 = await sendSession('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 390, height: 75, scale: 1 }
    });
    fs.writeFileSync('/home/arjunr/.gemini/antigravity-ide/brain/66906170-4c43-45e6-a124-59a79d57929f/mobile_header_no_smart_match_390.png', Buffer.from(shotMobile390.data, 'base64'));
    console.log('Saved mobile_header_no_smart_match_390.png');

    // 2. Small Mobile Viewport 360 x 740
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 740,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 800));

    const shotMobile360 = await sendSession('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 360, height: 75, scale: 1 }
    });
    fs.writeFileSync('/home/arjunr/.gemini/antigravity-ide/brain/66906170-4c43-45e6-a124-59a79d57929f/mobile_header_no_smart_match_360.png', Buffer.from(shotMobile360.data, 'base64'));
    console.log('Saved mobile_header_no_smart_match_360.png');

    // 3. Desktop Viewport 1280 x 800 (Smart Match preserved)
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 2,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 800));

    const shotDesktop = await sendSession('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 680, height: 75, scale: 1 }
    });
    fs.writeFileSync('/home/arjunr/.gemini/antigravity-ide/brain/66906170-4c43-45e6-a124-59a79d57929f/desktop_header_preserved.png', Buffer.from(shotDesktop.data, 'base64'));
    console.log('Saved desktop_header_preserved.png');

    await sendSession('Target.closeTarget', { targetId });
    ws.close();
    process.exit(0);
  };
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
