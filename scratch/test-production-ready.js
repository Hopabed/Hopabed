const fs = require('fs');
const path = require('path');

console.log("=========================================");
console.log("PRODUCTION-READY AUTOMATED TEST SUITE");
console.log("=========================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// Test 1: Check required data file existence
const dataPath = path.join(__dirname, '../src/data/kiddotubeData.ts');
assert(fs.existsSync(dataPath), "Data file src/data/kiddotubeData.ts exists");

// Test 2: Check SEO helper existence
const seoPath = path.join(__dirname, '../src/lib/seo.ts');
assert(fs.existsSync(seoPath), "SEO utility file src/lib/seo.ts exists");

// Test 3: Check component existence
const jsonLdPath = path.join(__dirname, '../src/components/JsonLd.tsx');
const breadcrumbsPath = path.join(__dirname, '../src/components/Breadcrumbs.tsx');
const videoCardPath = path.join(__dirname, '../src/components/VideoCard.tsx');

assert(fs.existsSync(jsonLdPath), "Component src/components/JsonLd.tsx exists");
assert(fs.existsSync(breadcrumbsPath), "Component src/components/Breadcrumbs.tsx exists");
assert(fs.existsSync(videoCardPath), "Component src/components/VideoCard.tsx exists");

// Test 4: Check key route existence
const routes = [
  'src/app/page.tsx',
  'src/app/age/[slug]/page.tsx',
  'src/app/category/[slug]/page.tsx',
  'src/app/watch/[videoId]/page.tsx',
  'src/app/search/page.tsx',
  'src/app/parents/private/page.tsx',
  'src/app/favorites/page.tsx',
  'src/app/history/page.tsx',
  'src/app/account/page.tsx',
  'src/app/sitemap.ts',
  'src/app/robots.ts',
  'src/app/about/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/not-found.tsx'
];

routes.forEach((routePath) => {
  const fullPath = path.join(__dirname, '..', routePath);
  assert(fs.existsSync(fullPath), `Route file ${routePath} exists`);
});

// Test 5: Verify no hardcoded localhost in production metadata files
const seoContent = fs.readFileSync(seoPath, 'utf8');
assert(!seoContent.includes("http://localhost"), "src/lib/seo.ts does not contain hardcoded localhost");

const sitemapContent = fs.readFileSync(path.join(__dirname, '../src/app/sitemap.ts'), 'utf8');
assert(!sitemapContent.includes("localhost"), "src/app/sitemap.ts does not contain localhost");

const robotsContent = fs.readFileSync(path.join(__dirname, '../src/app/robots.ts'), 'utf8');
assert(!robotsContent.includes("localhost"), "src/app/robots.ts does not contain localhost");

// Test 6: Verify noindex on private & search pages
const searchContent = fs.readFileSync(path.join(__dirname, '../src/app/search/page.tsx'), 'utf8');
assert(searchContent.includes("noindex: true"), "Search page correctly includes noindex: true");

const parentPrivateContent = fs.readFileSync(path.join(__dirname, '../src/app/parents/private/page.tsx'), 'utf8');
assert(parentPrivateContent.includes("noindex: true"), "Parent private page correctly includes noindex: true");

const favContent = fs.readFileSync(path.join(__dirname, '../src/app/favorites/page.tsx'), 'utf8');
assert(favContent.includes("noindex: true"), "Favorites page correctly includes noindex: true");

const historyContent = fs.readFileSync(path.join(__dirname, '../src/app/history/page.tsx'), 'utf8');
assert(historyContent.includes("noindex: true"), "History page correctly includes noindex: true");

// Test 7: Verify disallow rules in robots.ts
assert(robotsContent.includes("/admin/") && robotsContent.includes("/parents/private/"), "robots.ts correctly disallows private routes");

console.log("\n=========================================");
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("=========================================");

if (failed > 0) {
  process.exit(1);
}
