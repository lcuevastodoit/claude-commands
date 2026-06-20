# /step-5-code-review

Performs an **AI-assisted code review** on the changes implemented during the current session. Evaluates against principles like DRY, best practices, project patterns, common sense, frequent security, performance, possible bugs, and linting according to language. The AI reports findings **without automatically applying changes**; the user decides what to fix. If any correction is accepted, corresponding unit tests are adjusted.

## Prompt / Task Context

$ARGUMENTS

---

## Objective

Before finishing a task, critically review the introduced code to detect quality, maintainability, security, or risk issues. This step:

1. Analyzes implementation and test files created or modified in the session.
2. Compares code against project patterns and standards.
3. Detects possible bugs, duplications, performance problems, security risks, and style deviations.
4. Avoids false positives: only reports findings with clear technical basis.
5. Presents findings classified and prioritized to the user.
6. **Does not modify code until the user explicitly approves each correction.**
7. If the user accepts corrections, applies them and updates unit tests if behavior or structures change.
8. Executes the complete suite at the end to validate everything remains in GREEN.

## Preconditions

1. Previous steps should have left the functionality implemented and unit tests in GREEN.
2. A clear diff of changes made in the session must exist (implementation and test files).
3. The user must be available to review findings and make decisions.

## Command Phases

### Phase 0 — Collect Session Changes

1. Identify files modified or created during the current session:
   - Implementation files.
   - Test files.
   - Factories, fixtures, helpers, migrations, or affected configurations.
2. Get the diff of changes from the starting point.
3. Determine involved languages (Ruby, JavaScript, Vue, Groovy/Grails, etc.).
4. Briefly review the predominant style and patterns in the project to use as reference.

### Phase 1 — Verify Against Original Requirement

Before reviewing internal quality, validate that what was implemented meets what was requested:

1. **If a ticket key exists in the session context**:
   - Use the issue tracking system MCP (e.g., Jira) with `fields: "*all"` and `expand: "renderedFields,transitions,changelog"`.
   - Extract:
     - Ticket title and description.
     - Acceptance criteria.
     - Definition of Done (DoD).
     - Relevant comments.
     - Subtasks, related links, or epics.
   - Compare point by point with what was implemented.
   - Identify uncovered, misinterpreted, or out-of-scope requirements.

2. **If the ticket key is unknown**:
   - Ask the user if there's an associated ticket and its key.
   - If there's no ticket, ask the user to confirm the expected scope and acceptance criteria.

3. **DoD Verification**:
   - Review each Definition of Done item.
   - Mark if it's fulfilled, partially fulfilled, or pending.
   - If something is missing, report it as a critical finding before continuing with the rest of the review.

### Phase 2 — AI-Assisted Review

Analyze changes from multiple dimensions. For each dimension, look for real problems and avoid generic warnings.

#### 1.1 DRY (Don't Repeat Yourself)

- Detect logic duplication introduced in the session.
- Identify if code is repeated that already exists in helpers, services, mixins, utils, or shared libraries.
- Verify if private methods, utility functions, or reusable components can be extracted.
- Don't force premature abstractions: only propose refactor if it improves clarity and maintainability.

#### 1.2 Best Practices and Project Patterns

- Review if code follows the project architecture (MVC, services, jobs, stores, components, etc.).
- Verify use of file, class, method, and variable naming conventions.
- Review if existing patterns are used:
  - Rails: concerns, services, form objects, query objects, serializers, policies.
  - Vue.js: components, mixins, store modules, composables, HTTP services.
  - Grails: controllers, services, domains, plugins.
- Detect SOLID violations (single responsibility, dependency inversion, etc.).

#### 1.3 Common Sense and Clarity

- Descriptive names for variables, methods, and classes.
- Methods that are too long or have too many parameters.
- Excessive nested conditionals or hard-to-follow logic.
- Dead code, obsolete comments, or residual debugging (`console.log`, `puts`, `debugger`, etc.).
- Magic values without constants.
- Error handling consistent with the rest of the project.

#### 1.4 Security

- Validation and sanitization of user inputs.
- Safe SQL usage (avoid SQL injection, use parameterized queries).
- Authentication and authorization handling (don't expose other users' data, verify permissions).
- Exposure of sensitive information in logs, JSON responses, or exceptions.
- Use of `eval`, dynamic `send`, `innerHTML`, `dangerouslySetInnerHTML`, or similar.
- CORS, tokens, secrets configuration.
- Possible CSRF, XSS, or SSRF problems.
- Handling of uploaded files or system paths.

#### 1.5 Performance

- Unresolved N+1 queries.
- Excessive memory loads.
- Inefficient loops or unbounded recursion.
- Synchronous calls to external services that should be asynchronous.
- Improper caching usage if the project uses Redis, Memcached, internal caching library, or similar.
- Unnecessary renderings in Vue components.

#### 1.6 Possible Bugs

- Race conditions.
- Inconsistent states.
- Handling of nil/null/undefined.
- Dates, time zones, or currency format.
- Off-by-one, division by zero, overflow.
- Concurrency or idempotency.
- Dependency on execution order.
- Tests that pass by chance but don't validate real behavior.

#### 1.7 Linting and Style by Language

- **Ruby**: run `bundle exec rubocop` on modified files (if the project supports it). Review alignment with repository's `.rubocop.yml`.
- **JavaScript/Vue**: run `yarn lint` or `npx eslint` on modified files. Review project's `.eslintrc.json`.
- **Grails/Groovy**: review project style; if a linting tool is configured, run it.
- Only report clear violations, not irrelevant cosmetic warnings.

### Phase 3 — Classify and Present Findings

Group findings into two main blocks:

#### Block A — Original Requirement vs Implementation

- List of verified acceptance criteria / DoD.
- Pending or partially implemented requirements.
- Detected scope deviations.
- Recommended action for each gap.

#### Block B — Code Quality Review

1. Group findings by dimension (DRY, security, performance, etc.).
2. Assign a severity to each:
   - **Critical**: probable bug, security risk, or regression. Recommend fixing.
   - **High**: important maintainability or performance problem. Suggest fixing.
   - **Medium**: quality improvement or pattern adherence. Propose optional correction.
   - **Low**: minor style or preference. Mention only if quick to fix.
3. For each finding include:
   - Exact location (file and approximate line).
   - Problem description.
   - Technical justification.
   - Risk if not fixed.
   - Solution proposal.
   - Indication if it affects unit tests.

4. **Don't propose corrections by inertia**: if a project pattern is intentionally violated or the change is valid, omit it or mark it as discussable.

### Phase 4 — User Decision

Present the user with the complete list of findings (requirement + quality) and ask for a decision for each:

- **fix**: apply the proposed correction.
- **skip**: do nothing; record why it's skipped (e.g., it's a false positive or the user prefers to leave it).
- **discuss**: ask for more context before deciding.

The user can decide:
- Fix everything at once.
- Fix one by one.
- Fix nothing.

**Do not apply any change without explicit user approval.**

### Phase 5 — Apply Approved Corrections

If the user approves corrections:

1. Apply changes following the project style.
2. Keep code in **English** and without inline comments unless justified.
3. If the correction modifies observable behavior or structures used by tests:
   - Update affected unit tests.
   - Execute those tests and confirm GREEN.
4. If the correction introduces a new edge case or changes expectations:
   - Consider adding an additional unit test.
5. Show diff of each applied correction.
6. Briefly explain the technical justification.

### Phase 6 — Final Validation

1. Execute linting on modified files.
2. Execute the complete suite of each affected project.
3. If failures appear, analyze if they are caused by applied corrections.
4. Fix regressions before declaring closure.
5. Present final summary:
   - Total findings.
   - Applied corrections.
   - Skipped findings and why.
   - Final test status.
   - User decision: `continue with next step or mark task as finished?`

## Rules

1. **Verify original requirement first**: before reviewing internal quality, confirm that what was implemented covers what was requested in the tracking ticket or what the user defined as scope.
2. **Don't modify without approval**: the AI only reports; the user decides.
3. **Avoid false positives**: if a finding is doubtful, weak, or questionable, mark it as discussable or skip it.
4. **Project context**: use the project's style, helpers, patterns, and linting rules as reference, not generic standards.
5. **One correction at a time**: if there are several, apply them orderly, showing diff and justification for each.
6. **Unit tests always adjusted**: any change affecting behavior or structure must be reflected in tests.
7. **Language**: code should be in **English**. Communication with the user should be in the language used to request the task.
8. **Complete suite after corrections**: never finish without validating everything remains in GREEN.
9. **Don't ignore linting or test errors**: report and ask for a decision.
10. **Respect user decisions**: if the user prefers not to fix something, accept it and document the reason.
11. **No committing or pushing**: this step ends with code reviewed and ready for the user's final decision.
12. **DoD as closure criterion**: if Definition of Done items remain pending, don't declare the task finished without the user reviewing and deciding.

## Output Format

### Phase 0 — Analyzed Changes

- Reviewed implementation files.
- Reviewed test files.
- Involved languages.
- Available linting tools.

### Phase 2 — Findings

#### Block A — Original Requirement vs Implementation

| # | Criterion / DoD | Status | Observation | Recommended Action |
|---|---|---|---|---|
| 1 | `...` | ✅ Fulfilled / ⚠️ Partial / ❌ Pending | `...` | `...` |

#### Block B — Code Quality

##### 🔴 Criticals

| # | File | Line | Problem | Justification | Risk | Proposal | Affects tests |
|---|---|---|---|---|---|---|---|
| 1 | `...` | `...` | `...` | `...` | `...` | `...` | Yes / No |

##### 🟠 High

| # | File | Line | Problem | Justification | Risk | Proposal | Affects tests |
|---|---|---|---|---|---|---|---|
| 1 | `...` | `...` | `...` | `...` | `...` | `...` | Yes / No |

##### 🟡 Medium

| # | File | Line | Problem | Justification | Risk | Proposal | Affects tests |
|---|---|---|---|---|---|---|---|
| 1 | `...` | `...` | `...` | `...` | `...` | `...` | Yes / No |

##### 🟢 Low

| # | File | Line | Problem | Justification | Risk | Proposal | Affects tests |
|---|---|---|---|---|---|---|---|
| 1 | `...` | `...` | `...` | `...` | `...` | `...` | Yes / No |

### Phase 4 — User Decision

- List of approved / skipped / discussed actions.

### Phase 5 — Applied Corrections

- For each correction:
  - Modified files.
  - Summary diff.
  - Adjusted tests if applicable.
  - Technical justification.

### Phase 6 — Final Validation

- Linting result.
- Complete suite result by project.
- Skipped findings and reason.
- Recommended next step or closure.

## Note on Context

If `$ARGUMENTS` is empty, use the current conversation history to identify modified files, implemented functionality, and affected projects. If it's not possible to determine the exact diff, ask the user to specify the files or use `git diff` / `git status` before continuing.
