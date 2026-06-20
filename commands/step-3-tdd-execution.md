# /step-3-tdd-execution

Executes a strict TDD cycle using the tests created in the previous step (`step-2-gherkin-plan`). Resolves **one test case at a time**, in RED → GREEN semaphore mode, pausing between each one to explain the diff, its technical justification, and obtain explicit user approval before continuing with the next. At the end, the complete suite of each affected project is executed.

## Prompt / Task Context

$ARGUMENTS

---

## Objective

Take the test files generated in `step-2-gherkin-plan` and, applying pure TDD, implement the minimum necessary functionality for each test to pass. Work **one test case per iteration**, verifying RED, achieving GREEN, and stopping to explain before continuing. After completing all, run the complete suite of affected projects.

## Preconditions

1. Tests created in the previous step must exist and be listed.
2. User must have previously approved the Gherkin plan and test cases.
3. There must be a clear mapping of which test case covers which Gherkin scenario.

## Command Phases

### Phase 0 — Preparation

1. Identify affected projects and test files created in the previous step.
2. Verify that tests exist and are executable.
3. Execute the created test(s) to confirm they fail (initial RED).
4. Present to user:
   - List of pending test cases ordered by logical priority (happy path first, then edge cases).
   - Command to execute the current test.
   - Initial RED result.
5. Ask for confirmation to start with the first test case.

### Phase 1 — RED/GREEN Cycle per Test Case

For each test case, repeat:

#### 1.1 RED

- Execute only the current test case.
- Capture and display the failure message.
- Confirm with the user that the failure is expected and that they understand what needs to be implemented.

#### 1.2 Implement GREEN

- Write the minimum and necessary code for the test to pass.
- Respect the project's SOLID and DRY principles.
- Don't add extra functionality not covered by the current test.
- Keep code language in **English** and avoid inline comments unless complexity justifies it.

#### 1.3 GREEN

- Re-execute the current test case.
- Confirm it passes.
- If it keeps failing, iterate until GREEN is achieved.

#### 1.4 Pause / Diff / Justification

- Show the diff of changes introduced in this iteration.
- Explain the technical justification:
  - What was implemented and why.
  - What principles or patterns were followed.
  - What decisions were made and why.
  - If existing code, helpers, services, or components were reused.
  - Risks or technical debt if applicable.
- Ask the user for one of these options:
  - **approve**: continue with the next test case.
  - **continue**: no changes, advance to the next.
  - **refactor**: allow additional improvement before continuing (only if it improves quality without changing behavior).
  - **review**: the user wants to review or modify something before continuing.

**Do not advance to the next test case without explicit user confirmation.**

### Phase 2 — Optional Refactor

If the user requests refactor after GREEN:

1. Apply quality improvements without changing observable behavior.
2. Maintain GREEN at all times.
3. Show diff and justification.
4. Ask for approval to continue.

### Phase 3 — Complete Suite

Once all test cases created in `step-2-gherkin-plan` pass in GREEN:

1. Execute the complete suite of each affected project:
   - **Ruby/Rails**: `bundle exec rspec` or the command defined in the project (`make test`).
   - **Vue.js/JavaScript**: `yarn test` or `npm test` according to the project.
2. If any test fails:
   - Analyze if the regression was introduced by changes from this task.
   - Correct before declaring the phase finished.
3. If there are previous tests failing for unrelated causes, report it clearly and ask the user for a decision.

## Rules

1. **One test case at a time**: never implement two tests simultaneously. Each cycle must be atomic.
2. **Confirmed RED**: always execute the test before writing code and verify it fails for the expected reason.
3. **Minimum code for GREEN**: don't anticipate future functionality. Resolve only what the current test demands.
4. **Code language**: all implementation code in **English**. Communication with the user should be in the language used to request the task.
5. **No inline comments**: method names, variables, and tests should be descriptive enough.
6. **Human approval between tests**: the user controls the pace. Never skip to the next test without their OK.
7. **Mandatory diff after GREEN**: each iteration ends showing the diff and a technical explanation.
8. **Complete suite at the end**: don't consider the task finished without running all tests of the affected project.
9. **No committing or pushing**: this phase ends with code ready for manual QA, not automatically uploaded.
10. **Don't ignore errors**: if a test fails unexpectedly, a command fails, or there's ambiguity, stop and report.

## Test Commands by Project

| Technology | Type | Recommended Command |
|------------|------|---------------------|
| Ruby/Rails | Ruby | `bundle exec rspec --fail-fast` |
| Vue.js/JavaScript | Jest | `yarn test --maxWorkers=1` |
| Node.js generic | Jest | `yarn test` or `npm test` |
| Python | pytest | `pytest -x` |
| Go | go test | `go test ./...` |
| Others | - | Use the command defined in the project (`make test`, `npm test`, etc.). |

> If the project uses Docker, prefer the commands from `make test` defined in its `Makefile`.

## Output Format by Iteration

### Iteration N — Test Case Name

#### 1. RED Status
- Executed command.
- Summarized failure output.

#### 2. GREEN Implementation
- Modified files.
- Key technical decisions.

#### 3. Diff
- Complete or summarized diff of the iteration.

#### 4. Technical Justification
- Why each decision was made.
- Applied patterns.
- Reuse of existing code.

#### 5. Next Step
- Ask the user: `Approve, continue, refactor, or review?`.

## Final Output Format

### 1. TDD Cycle Summary
- Total test cases.
- Implemented test cases.
- Refactor iterations if any.

### 2. Modified / Created Files
- List of implementation and test files.

### 3. Complete Suite
- Executed projects.
- Global result (pass / fail).
- Detected and corrected regressions.

### 4. Risks or Technical Debt
- Things left pending, temporary hacks, or points to review in manual QA.

### 5. Recommended Next Steps
- Manual QA.
- Code review.
- Commit and push manually.

## Note on Context

If `$ARGUMENTS` is empty, use the current conversation history to identify the test cases created in `step-2-gherkin-plan` and affected projects.
