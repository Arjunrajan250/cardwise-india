import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const brainDir = path.resolve('/home/arjunr/.gemini/antigravity-ide/brain/66906170-4c43-45e6-a124-59a79d57929f');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 }); // iPhone 13/14

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#cardGrid');

  // 1. Mobile Header & Category Bar
  await page.screenshot({
    path: path.join(brainDir, 'icons_mobile_header.png'),
    clip: { x: 0, y: 0, width: 390, height: 400 }
  });
  console.log('Saved icons_mobile_header.png');

  // 2. Open Category Picker Bottom Sheet Drawer
  const moreChip = await page.$('.chip-more-trigger');
  if (moreChip) {
    await moreChip.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(brainDir, 'icons_category_drawer.png'),
      clip: { x: 0, y: 300, width: 390, height: 544 }
    });
    console.log('Saved icons_category_drawer.png');
    // Close drawer
    const closeBtn = await page.$('#btnCloseCategoryPicker');
    if (closeBtn) await closeBtn.click();
    await page.waitForTimeout(300);
  }

  // 3. Card Catalog item (Contactless wave, rating star, checkmark, compare button)
  const firstCard = await page.$('.card');
  if (firstCard) {
    await firstCard.screenshot({
      path: path.join(brainDir, 'icons_card_catalog.png')
    });
    console.log('Saved icons_card_catalog.png');
  }

  // 4. Mobile Bottom Nav Bar
  await page.screenshot({
    path: path.join(brainDir, 'icons_mobile_bottom_nav.png'),
    clip: { x: 0, y: 760, width: 390, height: 84 }
  });
  console.log('Saved icons_mobile_bottom_nav.png');

  // 5. Open Smart Match Quiz
  const launchQuizBtn = await page.$('.btn-launch-quiz');
  if (launchQuizBtn) {
    await launchQuizBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(brainDir, 'icons_quiz_step1.png'),
      clip: { x: 0, y: 150, width: 390, height: 600 }
    });
    console.log('Saved icons_quiz_step1.png');

    // Select income low -> step 2
    const tileLow = await page.$('[data-quiz-choice="income"][data-val="low"]');
    if (tileLow) {
      await tileLow.click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(brainDir, 'icons_quiz_step2.png'),
        clip: { x: 0, y: 150, width: 390, height: 600 }
      });
      console.log('Saved icons_quiz_step2.png');

      // Select shopping -> step 3
      const tileShop = await page.$('[data-quiz-choice="primarySpend"][data-val="shopping"]');
      if (tileShop) {
        await tileShop.click();
        await page.waitForTimeout(400);
        await page.screenshot({
          path: path.join(brainDir, 'icons_quiz_step3.png'),
          clip: { x: 0, y: 150, width: 390, height: 600 }
        });
        console.log('Saved icons_quiz_step3.png');

        // Select cashback -> results
        const tileCash = await page.$('[data-quiz-choice="topPriority"][data-val="cashback"]');
        if (tileCash) {
          await tileCash.click();
          await page.waitForTimeout(500);
          await page.screenshot({
            path: path.join(brainDir, 'icons_quiz_results.png'),
            clip: { x: 0, y: 100, width: 390, height: 680 }
          });
          console.log('Saved icons_quiz_results.png');
        }
      }
    }

    // Close quiz modal
    const closeQuizBtn = await page.$('#quizModal .btn-close-modal, #quizModal .btn-close-icon');
    if (closeQuizBtn) await closeQuizBtn.click();
    await page.waitForTimeout(300);
  }

  // 6. Desktop view: Comparator & Loans
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#cardGrid');

  // Select 2 cards to compare
  const compareBtns = await page.$$('.btn-compare');
  if (compareBtns.length >= 2) {
    await compareBtns[0].click();
    await compareBtns[1].click();
    await page.waitForTimeout(300);

    const openCompareModalBtn = await page.$('#btnOpenCompareModal');
    if (openCompareModalBtn) {
      await openCompareModalBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(brainDir, 'icons_comparator_desktop.png'),
        clip: { x: 100, y: 50, width: 1080, height: 750 }
      });
      console.log('Saved icons_comparator_desktop.png');
    }
  }

  await browser.close();
  console.log('Verification finished successfully!');
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
