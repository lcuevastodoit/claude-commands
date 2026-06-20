![Claude Code Commands](banner.png)

# Claude Code Custom Commands

This repository contains custom Claude Code commands for workflow automation, web scraping, and software development best practices.

## Installation

Copy or move the `commands/` folder (or its contents) into your Claude Code project at:

```
.claude/commands/
```

After that, Claude Code will automatically discover and register the commands.

### Example Structure

Your project should look like:

```
.claude/commands/
├── step-1-context.md              # Context gathering
├── step-2-gherkin-plan.md         # Gherkin test planning
├── step-3-tdd-execution.md       # TDD execution cycle
├── step-4-functional-tests.md    # Manual functional testing
├── step-5-code-review.md          # AI-assisted code review
├── step-6-conscious-closure.md    # Conscious task closure
└── web-snapshot.md               # Web page capture and analysis
```

## Available Commands

### Workflow Commands (6-Step Process)

These commands implement a structured development workflow based on best practices:

| Command | Description |
|---------|-------------|
| `/step-1-context` | Gathers quick context about a task without executing changes. Analyzes the prompt, investigates tickets, searches for patterns, and proposes an action plan. |
| `/step-2-gherkin-plan` | Converts requirements into Gherkin specifications following Cucumber standards. Creates executable test plans and generates real test cases (RSpec/Jest) after user approval. |
| `/step-3-tdd-execution` | Executes strict TDD cycle (RED → GREEN) one test at a time. Pauses between iterations for user approval and explanation of technical decisions. |
| `/step-4-functional-tests` | Guides manual functional testing with concrete commands (curl, console, browser). Applies fixes and updates unit tests based on findings. |
| `/step-5-code-review` | Performs AI-assisted code review checking DRY principles, security, performance, and linting. Reports findings without auto-applying changes. |
| `/step-6-conscious-closure` | Generates executive summary of changes, publishes to ticket tracking system, and provides 5 manual testing suggestions for reviewers. |

### Utility Commands

| Command | Description |
|---------|-------------|
| `/web-snapshot` | Captures and analyzes web pages using Chrome DevTools MCP + Playwright. Ideal for sites with Shadow DOM, dynamic JavaScript, or anti-scraping protections. Supports continuous monitoring with `/loop`. |

## Language Support

All commands respond in the language used to request the task (English or Spanish). Implementation code is always in English following SOLID and DRY principles.

## Requirements

### For Workflow Commands
- Claude Code with MCP access
- Project-specific dependencies (RSpec, Jest, etc.)

### For Web Snapshot
- Node.js ≥ 16.x
- Playwright (`npm install -g playwright`)
- Chrome DevTools MCP configured
- Chrome with remote debugging port 9222
- **LLM with vision capabilities** (local or cloud) - Required for analyzing screenshots and extracting visual data from web pages

## Quick Start

1. Copy the commands to your project:
   ```bash
   cp -r commands/ /your/project/.claude/
   ```

2. Start using commands in Claude Code:
   ```
   /step-1-context Create a user authentication system
   ```

## Usage Examples

### Web Snapshot

Capture and analyze web pages with specific data extraction goals.

**Basic usage (single capture):**
```
/web-snapshot url="https://example.com/products" goal="product prices and names"
```

**Extract sports results:**
```
/web-snapshot url="https://sports-site.com/matches" goal="match results with teams, scores, and status"
```

**Get news headlines:**
```
/web-snapshot url="https://news.ycombinator.com" goal="headlines with scores and comment counts"
```

**Wait longer for dynamic content:**
```
/web-snapshot url="https://spa-app.com/dashboard" goal="metrics values" wait=10
```

**With /loop for continuous monitoring:**

Monitor live sports results every 2 minutes:
```
/loop 2m /web-snapshot url="https://sports-site.com/live" goal="live match scores and time"
```

Track product prices every 5 minutes:
```
/loop 5m /web-snapshot url="https://store.com/product/123" goal="current price and availability"
```

Monitor news headlines every 10 minutes:
```
/loop 10m /web-snapshot url="https://news-site.com/headlines" goal="latest headlines and timestamps"
```

> **Note:** The `goal` parameter is essential for focused data extraction. Be specific about what you want to extract.

## Command Options

### Response Language
All commands detect the language of your request and respond accordingly. Code implementation is always in English.

### Workflow Integration
The 6-step commands can be used individually or as a complete development cycle:

```
/step-1-context     → Understand the task
/step-2-gherkin-plan → Define test scenarios
/step-3-tdd-execution → Implement with TDD
/step-4-functional-tests → Validate manually
/step-5-code-review    → Review quality
/step-6-conscious-closure → Close and document
```

## Contributing

When creating new commands:
1. Follow the existing structure with clear sections
2. Include preconditions, phases, and rules
3. Specify language behavior (respond in request language)
4. Document parameters and examples
5. Update this README

## License

These commands are provided as-is for use with Claude Code.
