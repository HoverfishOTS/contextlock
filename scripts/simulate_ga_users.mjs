import { chromium } from 'playwright';

// Default configuration
const TARGET_URL = process.argv[2] || 'http://localhost:3000';
const NUM_USERS = 100;

// Set up random sleep times to simulate real reading / engagement times
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomWait = (min, max) => sleep(Math.floor(Math.random() * (max - min + 1)) + min);

async function simulateUser(index) {
  console.log(`[User ${index}/${NUM_USERS}] Starting session...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Visit Main Page (which might be /login or /dashboard depending on redirect)
    await page.goto(TARGET_URL);
    await randomWait(3000, 6000); // Spend 3-6s on first load
    
    // Attempt to navigate to the Login page specifically
    await page.goto(`${TARGET_URL}/login`).catch(() => {});
    await randomWait(4000, 8000); // Spend 4-8s looking at login

    // Attempt to navigate to Dashboard
    await page.goto(`${TARGET_URL}/dashboard`).catch(() => {});
    await randomWait(5000, 10000); // Spend 5-10s "reading" dashboard metrics

    // Attempt to navigate to applications
    await page.goto(`${TARGET_URL}/applications/new`).catch(() => {});
    await randomWait(4000, 8000); // Spend 4-8s "filling out" a form
    
    console.log(`[User ${index}/${NUM_USERS}] Finished session successfully.`);
  } catch (error) {
    console.error(`[User ${index}/${NUM_USERS}] Error during simulation:`, error.message);
  } finally {
    await browser.close();
  }
}

async function runSimulation() {
  console.log(`Starting GA User Simulation targeting: ${TARGET_URL}`);
  console.log(`Simulating ${NUM_USERS} users. This will take a while to look realistic.`);
  
  // We'll run them sequentially or in small batches to avoid crashing the local machine
  // and to trickle events in over time, which looks more legitimate to GA.
  for (let i = 1; i <= NUM_USERS; i++) {
    await simulateUser(i);
    // Wait a bit before the next user arrives
    await randomWait(2000, 5000);
  }
  
  console.log("All user simulations completed! Check your Google Analytics Realtime Dashboard.");
}

runSimulation();
