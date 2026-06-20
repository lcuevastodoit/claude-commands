# /step-1-context

Gain quick context about a task **without executing changes**. I analyze the prompt, investigate the tracking ticket if it exists, deduce the projects and repository parts involved, search for similar functions/previous patterns, review local documentation, and query the version control platform for related MRs/PRs. At the end, I present a clear summary and propose an action plan.

## Received Prompt

$ARGUMENTS

---

## Objective

Investigate and understand the complete context of the task. **Do not modify code, configuration, or data.** If a step doesn't apply or fails, continue with the others.

## Stack and Repository Projects

- Identify relevant projects/languages from the prompt (e.g., Rails/Ruby, Vue.js/JavaScript, Python/Django, Go, Node/Nest, legacy Java/Grails, etc.).
- **Local Docs**: search for documentation in common paths like `<repo>/handbook/`, `<repo>/docs/`, `<repo>/README.md`, or others used by the project.

---

## Investigation Flow

### 1. Analyze the Prompt

1. Read `$ARGUMENTS` carefully.
2. Extract:
   - Possible ticket keys (format `[A-Z]+-[0-9]+`, e.g., `PROJ-123`).
   - Names of projects, modules, screens, endpoints, or functionalities.
   - Mentioned technologies (Vue.js 2, Rails, MongoDB, Grails, etc.).
   - Keywords for later searches.

### 2. Investigate Tracking Ticket (if there's a key)

If a ticket key is detected in the prompt (typical format `[A-Z]+-[0-9]+`):

1. Use the available issue tracking MCP (e.g., Jira) with `fields: "*all"` and `expand: "renderedFields,transitions,changelog"`.
2. Extract from the ticket:
   - Title, description, and **Definition of Done**.
   - Status, priority, assignee, and reporter.
   - Relevant comments if available.
   - Any other related issue keys (epic, subtasks, links).

If there's no ticket key, skip this step.

### 3. Deduce Projects and Areas Involved

From the prompt and tracking ticket, determine which repository projects are likely involved. Generic guiding criteria:

- **Frontend / SPA / main web** → frontend project identified in the prompt or repo structure.
- **APIs, multi-region databases / microservices** → identified backend/API projects.
- **Assistants, chatbots, conversational features** → associated services and clients.
- **Documents, content management, libraries** → corresponding modules or gems/libraries.
- **Legacy** → applications or modules marked as legacy or maintenance.

### 4. Search for Similar Functions and Previous Patterns

In each identified project:

1. List its relevant structure (components, controllers, services, models, views).
2. Use `grep` or file searches to find:
   - Components or functions similar to what was requested.
   - File naming conventions and structure.
   - Reusable helpers, mixins, stores, or utilities.
   - Existing tests as reference.
3. Identify patterns the team has already solved and can reuse (DRY, SOLID).

### 5. Consult Local Documentation

Search for relevant documentation in the repository's usual paths, for example:

- `<repo>/handbook/`
- `<repo>/docs/`
- `<repo>/README.md`
- `<repo>/ARCHITECTURE.md` or other reference documents.

Use `grep -r` or file reading to find guides on:

- Involved technologies.
- Design standards, accessibility, or UX.
- Team procedures (onboarding, methodology, incidents).

### 6. Search for Related MRs/PRs

Use the version control platform MCP (GitLab, GitHub, Bitbucket, etc.) to search for related merge requests or pull requests:

1. If the main project identifier is known, use `list_merge_requests` / `list_pull_requests` with `scope: "all"` and `search` with keywords from the ticket or prompt.
2. If the identifier is unknown, use `list_projects` / `list_repositories` or get candidates with the available API.
3. Search by:
   - Tracking ticket key.
   - Keywords from the task title or description.
   - Branch name if known.
4. Review diffs of open/recent MRs/PRs that may overlap or provide context.

> **Note**: No step blocks another. If the ticket system doesn't respond, the version control platform returns no results, or local documentation has nothing relevant, continue with the rest.

---

## Output Format

At the end of the investigation, present a structured summary:

### 1. Task Understanding
- Summary in 2-3 sentences of what needs to be done.
- Motivation or problem it solves (if inferred).

### 2. Ticket Context (if applicable)
- Title and key of the tracking ticket.
- Status, priority, and assignee.
- Acceptance criteria / Definition of Done.

### 3. Projects and Areas Involved
- List of affected repository projects.
- Layers or modules within each project (frontend, backend, tests, infrastructure).

### 4. Relevant Files and Patterns Found
- Existing similar files.
- Patterns or conventions to reuse.
- Useful test references as guides.

### 5. Local Documentation
- Links or paths to useful documents found.
- Applicable architectural decisions or standards.

### 6. Related MRs/PRs
- Open/closed related MRs/PRs, with title, author, and status.
- Observations on overlaps or dependencies.

### 7. Risks, Blockers, or Uncertainties
- Missing information, external dependencies, unclear parts of the prompt or ticket.

### 8. Proposed Plan
- Suggested steps to address the task, logically ordered.
- Recommended tools or commands for each step.
- Points where it's best to ask for approval or confirmation before continuing.

---

## Rules

1. **Investigate only**: do not create, edit, or delete files, nor run migrations or destructive tests.
2. **Language**: respond in the language used to request the task (English or Spanish).
3. **Don't block**: if a step doesn't apply or fails, continue with the others.
4. **Prefer MCP tools** for the ticket system and version control platform when possible.
5. **Don't silently ignore errors**: if a tool fails, report it in the summary.
6. **DRY/SOLID**: when proposing the plan, highlight reuse of existing patterns and components.
