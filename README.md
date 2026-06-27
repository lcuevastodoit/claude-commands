![Claude Code Commands](banner.png)

# Claude Code Custom Commands

A collection of custom commands for [Claude Code](https://claude.ai/code) that automate software development workflows, web scraping, and quality assurance processes.

### Why These Commands Exist

**The Problem:** Every developer knows the pain...

🔄 **Starting a task without context** → You spend hours digging through tickets, PRs, and documentation just to understand what needs to be done.

📝 **Writing tests after coding** → You rush through test creation, missing edge cases and creating brittle tests that break with every refactor.

🔴 **"Works on my machine"** → Code passes locally but fails in production because functional scenarios were never validated.

🔍 **Code reviews that miss the big picture** → Reviews focus on syntax nitpicks while architectural issues and security risks slip through.

📊 **No documentation, no traceability** → Weeks later, nobody remembers why decisions were made or how to test the feature.

😰 **The Sunday night deploy anxiety** → Pushing code with a nervous feeling that something might break.

---

**The Solution:** A mindful, repeatable workflow that catches issues *before* they become problems.

✅ **Start with clarity** → `/step-1-context` analyzes requirements, investigates tickets, finds similar code, and proposes a plan—giving you confidence before writing a single line.

✅ **Tests first, always** → `/step-2-gherkin-plan` converts requirements into executable Gherkin specs—the human-readable contract—then transforms them into unit tests in your project's preferred stack (RSpec, Jest, pytest, etc.), so you know exactly what "done" looks like.

✅ **TDD done right** → `/step-3-tdd-execution` guides you through RED → GREEN cycles with user approval at each step, ensuring every feature is tested and intentional.

✅ **Validate reality** → `/step-4-functional-tests` provides concrete commands to verify your code works in real scenarios, not just in unit tests.

✅ **Catch what others miss** → `/step-5-code-review` performs AI-assisted analysis checking DRY, security, performance, and patterns—finding issues humans often overlook.

✅ **Finish with confidence** → `/step-6-conscious-closure` generates documentation, publishes summaries to tickets, and leaves clear testing instructions for reviewers.

✅ **Extract any data** → `/web-snapshot` captures dynamic web content that traditional scraping can't touch, with support for continuous monitoring.

---

**What You Gain:**

- 🧠 **Peace of mind** → Deploy knowing every scenario has been tested and validated  
- ⏱️ **Time saved** → No more context-switching or figuring out "what was I doing?"
- 🎯 **Quality by default** → Issues caught early, when they're cheap to fix
- 📈 **Team confidence** → Clear documentation and test plans for every feature
- 🔄 **Repeatable success** → Same high quality on every task, regardless of complexity

---

## Table of Contents

- [Overview](#overview)
- [Available Commands](#available-commands)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Advanced Configuration](#advanced-configuration)
  - [Using Ollama LLMs](#using-ollama-llms-with-claude-code)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This repository provides two categories of commands:

1. **Developer Workflow Process** - A structured 6-step development workflow for professional software engineering
2. **Utility Commands** - Specialized tools for web scraping and data extraction

All commands are designed to work with Claude Code's MCP (Model Context Protocol) system and adapt to your project's existing patterns and conventions.

### Key Features

- 🌐 **Multilingual**: Responds in the language you use (English or Spanish)
- 🔧 **Project-Aware**: Adapts to your existing codebase patterns and conventions
- 🧪 **Test-Driven**: Built-in support for TDD and comprehensive testing workflows
- 🤖 **AI-Assisted**: Leverages Claude's capabilities for code review and analysis
- 📝 **Documentation-Friendly**: Automatic generation of summaries and documentation

---

## Available Commands

### 1. Developer Workflow Process

A complete 6-step development lifecycle that guides you from understanding a task to delivering production-ready code:

| Step | Command | Purpose |
|:----:|:--------|:--------|
| 1 | `/step-1-context` | **Context Gathering** - Analyze requirements, investigate tickets, find patterns, and propose an action plan without executing changes |
| 2 | `/step-2-gherkin-plan` | **Test Planning** - Convert requirements into Gherkin specifications and generate test cases (RSpec/Jest) after approval |
| 3 | `/step-3-tdd-execution` | **TDD Implementation** - Execute strict RED → GREEN cycle, one test at a time, with user approval at each step |
| 4 | `/step-4-functional-tests` | **Manual Validation** - Guide functional testing with concrete commands (curl, console, browser) and apply fixes |
| 5 | `/step-5-code-review` | **Code Review** - AI-assisted review checking DRY, security, performance, and linting - reports only, no auto-changes |
| 6 | `/step-6-conscious-closure` | **Task Closure** - Generate executive summary, publish to ticket system, and provide testing instructions |

### 2. Utility Commands

| Command | Purpose |
|:--------|:--------|
| `/web-snapshot` | **Web Scraping** - Capture and analyze web pages using Chrome DevTools MCP + Playwright. Ideal for dynamic JavaScript, Shadow DOM, and anti-scraping protections. Supports continuous monitoring with `/loop` |

### 3. Discord Bot Gateway Plugin

Real-time Discord integration with bidirectional communication:

| Component | Purpose |
|:----------|:--------|
| `discord-bot-gateway` | **Real-time Bot** - WebSocket Gateway connection, automatic message monitoring, Claude receives instant notifications and can respond to Discord messages live |

**Location:** `commands/skills/discord-bot/`  
**Features:**
- ✅ Always online status in Discord
- ✅ Real-time message notifications to Claude
- ✅ Bidirectional communication (send and receive)
- ✅ Auto-start with Claude Code sessions

**Documentation:** See `commands/skills/discord-bot/README.md`

---

## Requirements

### Prerequisites for All Commands

- [Claude Code](https://claude.ai/code) installed and configured
- Access to Claude Code's MCP system

### Developer Workflow Commands

**Required:**
- Project-specific testing frameworks (RSpec, Jest, pytest, etc.)
- Git repository (for tracking changes)

**Recommended MCPs for Full Functionality:**

| Category | MCPs | Purpose |
|:---------|:-----|:--------|
| Issue Tracking | Jira, Azure DevOps, Linear | Fetch ticket details, update status, post comments |
| Version Control | GitHub, GitLab, Bitbucket | Analyze MRs/PRs, check related changes |
| Communication | Slack, Discord | Notify team about progress |
| Documentation | Confluence, Notion | Link to relevant docs |
| Monitoring | Sentry, DataDog | Check error context (optional) |

> **Note:** Commands work without these MCPs, but features like automatic ticket updates and PR analysis will require manual steps.

### Web Snapshot Command

**Required:**
- Node.js ≥ 16.x
- Playwright: `npm install -g playwright`
- Chrome DevTools MCP configured
- Chrome running with remote debugging: `--remote-debugging-port=9222`
- **LLM with vision capabilities** (local or cloud) - for analyzing screenshots

**Installation:**
```bash
npm install -g playwright
npx playwright install chromium
```

---

## Installation

### Option 1: Copy to Project (Recommended)

Copy the `commands/` folder to your project's Claude Code directory:

```bash
cp -r commands/ /your/project/.claude/
```

### Option 2: Clone as Submodule

Add this repository as a submodule to your project:

```bash
git submodule add https://github.com/your-repo/claude-code-commands.git .claude/commands
```

### Option 3: Global Installation

For use across multiple projects, copy to Claude Code's global commands directory.

### Verification

After installation, verify commands are available:

```
/commands
```

You should see the list of available commands.

---

## Usage Examples

### Developer Workflow Example

Complete workflow from task to delivery:

```
# Step 1: Understand the task
/step-1-context Implement user authentication with OAuth2

# Step 2: Define test scenarios  
/step-2-gherkin-plan

# Step 3: Implement with TDD
/step-3-tdd-execution

# Step 4: Validate manually
/step-4-functional-tests

# Step 5: Review quality
/step-5-code-review

# Step 6: Close and document
/step-6-conscious-closure
```

### Web Snapshot Examples

**Single capture:**
```
/web-snapshot url="https://example.com/products" goal="product prices and names"
```

**Extract specific data:**
```
/web-snapshot url="https://sports-site.com/matches" goal="match results with teams, scores, and status"
```

**Wait for dynamic content:**
```
/web-snapshot url="https://spa-app.com/dashboard" goal="metrics values" wait=10
```

**Continuous monitoring with /loop:**

```
# Monitor live sports every 2 minutes
/loop 2m /web-snapshot url="https://sports-site.com/live" goal="live match scores and time"

# Track product prices every 5 minutes
/loop 5m /web-snapshot url="https://store.com/product/123" goal="current price and availability"

# Monitor news headlines every 10 minutes
/loop 10m /web-snapshot url="https://news-site.com/headlines" goal="latest headlines and timestamps"
```

> **Tip:** The `goal` parameter is essential for focused data extraction. Be specific about what you want.

---

## Command Features

### Language Support

All commands automatically detect your request language and respond accordingly:
- **Communication**: English or Spanish based on your input
- **Code**: Always in English (following best practices)
- **Documentation**: Matches your request language

### Workflow Integration

The 6-step workflow can be used:
- **Individually**: Use only the steps you need
- **Sequentially**: Run the complete development cycle
- **Iteratively**: Repeat steps as needed

**Visual workflow:**

```
    ┌─────────────────────────────────────────────────────────────────────┐
    │                     DEVELOPMENT WORKFLOW                            │
    └─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    step-1    │────▶│    step-2    │────▶│    step-3    │────▶│    step-4    │
│    Context   │     │     Plan     │     │   TDD Exec   │     │  Functional  │
│  Understanding│    │   (Gherkin)   │     │  (RED/GREEN) │     │    Tests     │
└──────────────┘     └──────────────┘     └──────────────┘     │  (Manual QA) │
                                                               └──────┬───────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │    step-5    │
                                                               │  Code Review │
                                                               │ (AI Assisted)│
                                                               └──────┬───────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │    step-6    │
                                                               │    Closure   │
                                                               │   (Summary)  │
                                                               └──────────────┘
```

### Best Practices Enforced

- ✅ **SOLID Principles**: Single responsibility, open/closed, etc.
- ✅ **DRY**: Don't Repeat Yourself - code reuse encouraged
- ✅ **Test Coverage**: RED/GREEN cycles ensure testability
- ✅ **Code Quality**: Automated linting and review processes
- ✅ **Documentation**: Automatic summary generation

---

## Project Structure

```
.claude/commands/
├── step-1-context.md              # Context gathering
├── step-2-gherkin-plan.md         # Gherkin test planning  
├── step-3-tdd-execution.md        # TDD execution cycle
├── step-4-functional-tests.md     # Manual functional testing
├── step-5-code-review.md          # AI-assisted code review
├── step-6-conscious-closure.md    # Conscious task closure
└── web-snapshot.md                # Web page capture and analysis
```

---

## Advanced Configuration

### Using Ollama LLMs with Claude Code (optional)

You can integrate local and cloud-based Ollama models with Claude Code for running these commands.

#### Quick Start (Recommended)

The easiest way to use Ollama with Claude Code:

```bash
# Launch Claude Code with Ollama (auto-configures everything)
ollama launch claude

# Or specify a model
ollama launch claude -- --model llama3.2
```

This command automatically:
- Starts the Ollama server
- Configures Claude Code to use the specified model
- Handles all connection settings

#### Install Ollama

If you haven't installed Ollama yet:

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

#### Using Local Models

Pull models you want to use:

```bash
ollama pull llama3.3-70b:cloud
ollama pull kimi-k2.7-code:cloud
ollama pull qwen2.5-72b:cloud
```

# List available models
ollama list
```

Then launch Claude Code:

```bash
ollama launch claude -- --model codellama
```

#### Using Cloud Models (Large Models)

For very large models that require significant GPU resources, use Ollama Cloud with the `:cloud` suffix:

```bash
# Use large cloud models
ollama launch claude -- --model llama3.3-70b:cloud
ollama launch claude -- --model kimi-k2.7-code:cloud
ollama launch claude -- --model qwen2.5-72b:cloud
```

**Syntax:** `model-name:cloud`

Available models: [ollama.com/library](https://ollama.com/search)

#### Troubleshooting

**"ollama launch claude" not found:**
- Update Ollama: `brew upgrade ollama` or reinstall
- Or use manual setup: `ollama serve` then configure Claude Code settings

**Model not found:**
```bash
ollama pull llama3.2
```

**Out of memory:**
- Use cloud models: `model-name:cloud`
- Use quantized versions: `llama3.2:q4_0`
- Close other applications

---

## Contributing

We welcome contributions! When creating new commands:

1. **Structure**: Follow the existing format with clear sections
2. **Preconditions**: Document what must be true before running
3. **Phases**: Break down into logical execution phases
4. **Rules**: Define clear behavior guidelines
5. **Language**: Support multilingual responses
6. **Documentation**: Update this README with examples

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-command`
3. Commit your changes: `git commit -am 'Add new command'`
4. Push to the branch: `git push origin feature/my-command`
5. Submit a pull request

---

## License

These commands are provided as-is for use with Claude Code.

---

## Support

For issues, questions, or feature requests:
- Open an issue in this repository
- Refer to [Claude Code documentation](https://docs.anthropic.com/)
- Check command-specific documentation in each `.md` file

---

**Happy coding!** 🚀
