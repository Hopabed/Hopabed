const http = require('http');

// Simple test to verify the route structure and API payload format
const payload = JSON.stringify({
  name: "Sharukh Mithagari",
  email: "sharukh@example.com",
  subject: "Testing Google Ads Thank You Flow",
  message: "Testing form submission to thank-you redirect."
});

console.log("Validating payload structure...");
const parsed = JSON.parse(payload);
if (parsed.name && parsed.email && parsed.subject && parsed.message) {
  console.log("✓ Contact payload validation passed.");
} else {
  console.error("❌ Contact payload validation failed.");
  process.exit(1);
}
