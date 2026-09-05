import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// Parse .env.local manually
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.warn("Could not read .env.local", e);
}

// Override server-only module for standalone test environment
const require = createRequire(import.meta.url);
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {}
};

async function testShipping() {
  const { calculateShipping } = await import('../lib/shipping.ts');

  console.log("=== Testing Mandatory Shipping Fees (No Free Shipping) ===");

  const testCases = [
    { name: "Odisha - Bhubaneswar (751001)", state: "Odisha", pincode: "751001", city: "Bhubaneswar", subtotal: 500 },
    { name: "Odisha - Cuttack (753001)", state: "Odisha", pincode: "753001", city: "Cuttack", subtotal: 1500 },
    { name: "Odisha - Jagatsinghpur (754101)", state: "Odisha", pincode: "754101", city: "Jagatsinghpur", subtotal: 5000 },
    { name: "Odisha - Khordha (752001)", state: "Odisha", pincode: "752001", city: "Khordha", subtotal: 10000 },
    { name: "Tamil Nadu - Chennai (600001)", state: "Tamil Nadu", pincode: "600001", city: "Chennai", subtotal: 2000 },
    { name: "Karnataka - Bengaluru (560001)", state: "Karnataka", pincode: "560001", city: "Bengaluru", subtotal: 3000 },
    { name: "Maharashtra - Mumbai (400001)", state: "Maharashtra", pincode: "400001", city: "Mumbai", subtotal: 500 },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const res = await calculateShipping(tc.state, tc.pincode, tc.subtotal, tc.city);
    console.log(`[TEST] ${tc.name} -> Fee: ₹${res.amount} (${res.rateName})`);
    if (res.amount > 0) {
      console.log(`  ✅ PASSED: Non-zero fee charged.`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: Zero fee charged!`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

testShipping();
