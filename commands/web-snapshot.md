# /web-snapshot

Captures and analyzes any web page using Chrome DevTools MCP + Playwright. Ideal for obtaining data from sites with Shadow DOM, dynamic JavaScript, or anti-scraping protections.

## When to Use It

- Sites with content loaded dynamically with JavaScript
- Pages that use Shadow DOM (like marca.com)
- When traditional APIs fail or require authentication
- To get a complete "photo" of the current page state
- **When you need to extract specific data** (prices, results, news, etc.)

## ⚙️ Technical Requirements

### Required Dependencies

| Component | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | ≥ 16.x | Run Playwright scripts |
| **Playwright** | Latest | Launch Chrome with `--remote-debugging-port=9222` |
| **Chrome DevTools MCP** | Configured | Connect to remote Chrome and execute commands |

### Installing Dependencies

```bash
# Install Playwright globally
npm install -g playwright

# Or in the project
npm install playwright

# Install Playwright browsers
npx playwright install chromium
```

### Environment Configuration

**Step 1:** Verify that Chrome DevTools MCP is available
- The MCP must be configured in Claude Code
- Default port: `9222`

**Step 2:** Verify connection
```bash
# Chrome must be running with remote debugging
lsof -i :9222  # Verify that the port is in use
```

### System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User          │────▶│  Claude Code     │────▶│  Chrome DevTools│
│   /web-snapshot │     │  Skill           │     │  MCP            │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                              │                          │
                              │  Launches (if none exists)│
                              ▼                          │
                        ┌──────────────────┐            │
                        │  Playwright      │────────────▶
                        │  Chromium        │   CDP Connection
                        │  --remote-debug  │
                        └──────────────────┘
```

### Automatic Launch Command

If Chrome is not running, the command executes:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--remote-debugging-port=9222']
  });
  const page = await browser.newPage();
  await page.goto('about:blank');
  console.log('Chrome ready on port 9222');
  await new Promise(() => {});  // Keeps alive
})();
"
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CHROME_DEBUG_PORT` | Port for remote debugging | 9222 |
| `PLAYWRIGHT_BROWSERS_PATH` | Path to Playwright browsers | Auto-detect |

### Troubleshooting Common Issues

**Error: "Cannot connect to Chrome DevTools"**
- Verify that Chrome is running: `lsof -i :9222`
- If not running, it will launch automatically
- Verify that Playwright is installed: `npm list -g playwright`

**Error: "Playwright not found"**
```bash
npm install -g playwright
npx playwright install chromium
```

**Error: "Screenshot failed"**
- Verify write permissions in the directory
- Change output path if necessary

**The page doesn't load completely**
- Increase the `wait` parameter (default: 5s)
- Example: `wait=10` to wait 10 seconds

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 4 GB | 8 GB |
| Disk | 500 MB | 2 GB (for browsers) |
| Network | Stable connection | High speed |

### Compatibility

| System | Support | Notes |
|----------|---------|-------|
| macOS | ✅ | Native with Playwright |
| Linux | ✅ | Requires system dependencies |
| Windows | ✅ | WSL recommended |

### Functionality Test

To verify that everything is configured correctly:

```bash
/web-snapshot url="https://example.com" goal="page title"
```

If you get the title without errors, the system is working correctly.

## Parameters

- `url` (required) - The URL to visit
- `goal` (optional but recommended) - **Description of WHAT to extract**. Examples:
  - `goal="football match results with teams and scores"`
  - `goal="prices of products in the list"`
  - `goal="main news headlines"`
  - `goal="standings table with positions and points"`
- `wait` (optional) - Seconds to wait for dynamic loading (default: 5)
- `extract` (optional) - Output format: `text`, `structured`, `screenshot`, `all` (default: `all`)
- `cookies` (optional) - If `true`, automatically accepts cookie banners (default: `true`)

## Usage Examples

```bash
# Extract sports results
/web-snapshot url="https://www.marca.com/resultados/futbol/mundial.html" goal="match results with teams, scores, and status"

# Extract product prices
/web-snapshot url="https://example.com/store" goal="prices and names of listed products"

# Get main news
/web-snapshot url="https://news.ycombinator.com" goal="headlines of main news with their scores"

# Specific structured data
/web-snapshot url="https://example.com/data" goal="data table with columns Name, Value, Date" wait=3
```

## 🔄 Usage with `/loop` for Continuous Monitoring

To execute the command periodically (e.g., every 2 minutes), use `/loop`:

### Example 1: Monitor sports results every 2 minutes

```bash
/loop 2m /web-snapshot url="https://www.marca.com/resultados/futbol/mundial.html" goal="match results with teams, scores, and status"
```

**What it does:**
- Executes `/web-snapshot` every 2 minutes
- Extracts updated results automatically
- The loop self-regenerates until you cancel it

### Example 2: Price monitoring with self-regeneration

```bash
/loop 5m /web-snapshot url="https://example.com/product" goal="current product price"
```

### Example 3: Dynamic mode (no fixed interval)

```bash
/loop /web-snapshot url="https://www.marca.com/futbol/mundial/calendario/dieciseisavos.html" goal="qualified teams"
```

**Note:** In dynamic mode, it chooses the most appropriate delay (recommended: 120s for monitoring).

### How Self-Regeneration Works

When you use `/loop`:
1. Executes the command immediately
2. Schedules the next execution according to the interval
3. Self-regenerates automatically
4. To stop: omit the `ScheduleWakeup` in the next iteration or close the session

### Recommendations for Loops

| Use Case | Recommended Interval | Example |
|----------|---------------------|---------|
| Live sports results | 2m | `/loop 2m /web-snapshot ...` |
| Product prices | 5-10m | `/loop 5m /web-snapshot ...` |
| News | 10-15m | `/loop 10m /web-snapshot ...` |
| General monitoring | 30m-1h | `/loop 30m /web-snapshot ...` |

**⚠️ Important:** Loops in local session stop when Claude Code is closed. For persistent cloud loops, use `/schedule` instead of `/loop`.

## What It Does Internally

1. **Verifies requirements** - Checks that Playwright and Chrome DevTools MCP are available
2. **Launches Chrome if necessary** - Uses Playwright to start Chrome with remote debugging
3. **Navigates** to the URL using Chrome DevTools MCP
4. **Accepts cookies** if a banner appears (configurable)
5. **Waits** the specified time for dynamic loading
6. **Takes screenshot** for visual analysis
7. **Extracts the complete accessibility tree** from the page
8. **Analyzes according to GOAL** - Specifically looks for the data described in the `goal` parameter
9. **Presents results** focused on what was requested
10. **Cleans up** temporary files

## Advantages of the GOAL Parameter

- 🎯 **Focused extraction** - Doesn't return everything, only what you need
- 🧠 **Intelligent analysis** - Claude interprets the goal and looks for relevant patterns
- 📊 **Appropriate format** - Presents data in a useful way (tables, lists, etc.)
- ⏱️ **Efficient** - Avoids processing irrelevant information

## Examples of Effective GOALs

| Page Type | Suggested GOAL |
|-----------|----------------|
| Sports results | `"today's matches: home teams, away teams, scores, and status (finished/in progress)"` |
| Online store | `"products on offer: name, current price, previous price, discount"` |
| News | `"main headlines, brief summary, and publication time"` |
| Social networks | `"recent posts: author, content, likes, comments"` |
| Dashboard | `"main metrics: indicator name and numeric value"` |
| Standings | `"positions table: position, team, points, games played"` |

## Advantages Over Traditional Scraping

- ✅ No CORS issues
- ✅ Renders complex JavaScript (React, Angular, Vue, etc.)
- ✅ Accesses Shadow DOM and Web Components
- ✅ Handles cookie banners automatically
- ✅ Gets the real "visual" state of the page
- ✅ Doesn't require APIs or authentication tokens
- ✅ Works with Cloudflare and similar protections
- ✅ **Semantic extraction** - understands context, not just HTML

## Limitations

- Requires configured Chrome DevTools MCP
- Needs Chrome running with `--remote-debugging-port=9222` (handled automatically)
- Slower than a simple HTTP request (but more complete)
- Depends on GOAL clarity for optimal results
- Higher resource consumption (requires full Chrome)

## Technical Flow

```
User → /web-snapshot url=... goal="..." 
  → Verifies requirements → Launches Chrome if necessary
    → MCP connects → Navigates → Waits 
      → Screenshot + Accessibility Tree → Analysis with GOAL 
        → Focused extraction → Structured results
```

## Real Use Cases

- **Live sports results** from any site
- **Product prices** that load dynamically
- **News** from sites with soft paywalls
- **Dashboard data** that requires prior login (if there's active session)
- **Page change monitoring**
- **Competition** - competitor price tracking
- **Research** - data extraction for analysis

## Tip: How to Write a Good GOAL

1. **Be specific**: `"product prices"` vs `"information"`
2. **Mention format**: `"table with..."`, `"list of..."`, `"cards with..."`
3. **Include key fields**: `"name, price, availability"`
4. **Context helps**: `"2026 World Cup football matches"` vs `"matches"`

## If GOAL is Not Provided

The command will work in generic mode, extracting:
- Page title
- Meta description
- Main images
- General visible text
- Basic structure

But **it is always recommended to use `goal`** for optimal results.

## Error Diagnosis

### Error Code: CONN_REFUSED
**Cause:** Chrome is not running on port 9222  
**Solution:** The command will try to launch Chrome automatically. If it fails, run manually:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

### Error Code: TIMEOUT
**Cause:** The page takes too long to load  
**Solution:** Increase `wait` or verify internet connectivity

### Error Code: PLAYWRIGHT_NOT_FOUND
**Cause:** Playwright is not installed  
**Solution:** Check the dependencies installation section

### Error Code: SCREENSHOT_FAILED
**Cause:** No write permissions or invalid path  
**Solution:** Verify that the output path exists and has permissions

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Claude Code MCP Docs](https://docs.anthropic.com/)

## Rules

1. **Language**: respond in the language used to request the task (English or Spanish).
2. **Chrome availability**: verify that Chrome with remote debugging is available before executing.
3. **Respect user preferences**: honor user decisions on output format and parameters.

## Maintenance

To keep the command working correctly:

1. **Update Playwright** periodically: `npm update -g playwright`
2. **Update browsers**: `npx playwright install chromium`
3. **Check logs** in `~/.claude/commands/web-snapshot-log.json`
4. **Clean temporary files** if disk fills up
