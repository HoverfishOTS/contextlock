import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Default configuration
const TARGET_URL = process.argv[2] || 'http://localhost:3000';
const NUM_USERS = parseInt(process.argv[3]) || 100;

// Generate dummy PDF for uploads
const dummyPdfPath = path.join(process.cwd(), 'dummy_resume.pdf');
if (!fs.existsSync(dummyPdfPath)) {
  fs.writeFileSync(dummyPdfPath, '%PDF-1.4\n1 0 obj\n<< /Title (Dummy Resume) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
}

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
    
    // 2. Navigate to Login page and SIGN UP
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' }).catch(() => {});
    await simulateScroll(page);
    
    const randomEmail = `user${Date.now()}${Math.floor(Math.random()*1000)}@test.contextlock.app`;
    console.log(`[User ${index}/${NUM_USERS}] Signing up with ${randomEmail}`);
    await page.fill('input[type="email"]', randomEmail);
    await page.fill('input[type="password"]', 'StrongPass123!');
    await page.click('button:has-text("REGISTER")');
    await randomWait(4000, 7000); // Wait for redirect to Dashboard

    // 3. Navigate to Resumes to UPLOAD
    await page.goto(`${TARGET_URL}/resumes`, { waitUntil: 'networkidle' }).catch(() => {});
    await randomWait(2000, 3000);
    console.log(`[User ${index}/${NUM_USERS}] Uploading mock resume...`);
    await page.setInputFiles('input[type="file"]', dummyPdfPath).catch(() => {});
    await randomWait(1000, 2000);
    await page.click('button:has-text("COMMIT")').catch(() => {});
    await randomWait(5000, 8000); // Wait for upload to complete

    // 4. Navigate to Applications/New to log a mock application
    await page.goto(`${TARGET_URL}/applications/new`, { waitUntil: 'networkidle' }).catch(() => {});
    await simulateScroll(page);
    
    console.log(`[User ${index}/${NUM_USERS}] Filing job application...`);
    await page.fill('input#companyName', 'Acme Mock Inc.').catch(() => {});
    await page.fill('input#jobTitle', 'Software Engineer').catch(() => {});
    await page.click('button:has-text("LOG APPLICATION")').catch(() => {});
    await randomWait(4000, 6000); 
    
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
