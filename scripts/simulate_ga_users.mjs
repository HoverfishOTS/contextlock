import { chromium } from 'playwright';

// Default configuration
const TARGET_URL = process.argv[2] || 'http://localhost:3000';
const NUM_USERS = parseInt(process.argv[3]) || 100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomWait = (min, max) => sleep(Math.floor(Math.random() * (max - min + 1)) + min);

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/123.0.0.0'
];

async function simulateScroll(page) {
  await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
  await randomWait(1000, 2000);
  await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
}

async function simulateUser(index) {
  console.log(`[User ${index}/${NUM_USERS}] Starting session...`);
  const browser = await chromium.launch({ headless: true });
  
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  const context = await browser.newContext({ userAgent: randomUserAgent });
  const page = await context.newPage();

  try {
    // 1. Visit Main Page & Read
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await simulateScroll(page);
    await randomWait(2000, 4000); 
    
    // 2. Navigate to Login page
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' }).catch(() => {});
    await simulateScroll(page);
    await randomWait(4000, 7000);

    // 3. Navigate to Resumes view
    await page.goto(`${TARGET_URL}/resumes`, { waitUntil: 'networkidle' }).catch(() => {});
    await randomWait(2000, 5000);
    await simulateScroll(page);

    // 4. Navigate to Applications/New
    await page.goto(`${TARGET_URL}/applications/new`, { waitUntil: 'networkidle' }).catch(() => {});
    await simulateScroll(page);
    await randomWait(4000, 7000); 
    
    console.log(`[User ${index}/${NUM_USERS}] Finished session successfully.`);
  } catch (error) {
    console.error(`[User ${index}/${NUM_USERS}] Error during simulation:`, error.message);
  } finally {
    await browser.close();
  }
}

async function runSimulation() {
  console.log(`Starting GA User Simulation targeting: ${TARGET_URL}`);
  
  for (let i = 1; i <= NUM_USERS; i++) {
    await simulateUser(i);
    await randomWait(1000, 3000);
  }
  
  console.log("All user simulations completed!");
}

runSimulation();
