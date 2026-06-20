# /step-4-functional-tests

Guides the user in executing **manual functional tests** on the functionality implemented during the TDD cycle. Suggests the appropriate test plan according to the type of affected system (API, frontend, service, legacy), waits for user feedback, and applies corrections or adjustments (logs, fixes, unit tests) within the same step. At the end, the user decides if the task is ready or if the next step should be invoked.

## Prompt / Task Context

$ARGUMENTS

---

## Objective

Validate that the implemented functionality behaves correctly in an environment as close to real as possible, outside the unit suite. This step:

1. Proposes a functional test plan adapted to the type of affected project.
2. Provides concrete commands (`curl`, `rails console`, scripts, browser, etc.).
3. Waits for the user to execute the tests and report results.
4. Applies corrections, logs, or adjustments requested by the user.
5. Updates or adds unit tests if functional tests reveal new cases or regressions.
6. Leaves the final decision to the user: `all good` or `invoke next step`.

## Preconditions

1. TDD implementation from the previous step (`step-3-tdd-execution`) must be complete.
2. Unit tests must be in GREEN.
3. An environment to execute functional tests (local, Docker, staging, preview) must exist and be accessible to the user.

## Command Phases

### Phase 0 — Current Status Summary

1. Collect from the session context:
   - Affected projects.
   - Implemented functionality.
   - Created unit tests and their status.
   - Modified implementation files.
2. Present a clear summary to the user:
   - What was implemented.
   - What projects were touched.
   - What endpoints, screens, jobs, services, or components are involved.
   - Current status of unit tests.
3. Confirm that the functional testing environment is available. If not, propose how to start it.

### Phase 1 — Functional Test Plan

According to the affected project type, generate a detailed plan. The plan must include:

- **Scenarios to test**: happy path and relevant edge cases.
- **Preconditions**: data, authentication, system state.
- **Steps**: exact actions to perform.
- **Expected result**: what should be observed.
- **Command / tool**: how to execute the test.

#### 1.1 APIs (Rails/Node/Python/Go/etc.)

Suggest tests with:

- `curl` for REST endpoints (include `Authorization`, `Content-Type`, language headers, etc.).
- Framework console (`rails console`, `python manage.py shell`, `node`, etc.) to verify model states, jobs in queue, database records.
- `docker exec <container> <command>` if the app runs in containers.
- Server logs to trace requests and responses.

Example structure:

```bash
# Happy path
curl -X POST http://localhost:3000/api/v1/resource \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"field":"value"}'

# Edge case: invalid data
curl -X POST http://localhost:3000/api/v1/resource \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"field":""}'
```

#### 1.2 Frontend Vue.js / React / Angular / Generic SPA

Suggest tests with:

- Browser + DevTools: verify rendering, store state (Vuex, Redux, Context, etc.), network calls, console.
- Interaction cases: clicks, forms, validations, navigation, errors.
- Different viewports or browsers if applicable.
- i18n verification if the functionality has translations.

#### 1.3 Backend Monoliths (Rails, Django, Laravel, etc.)

Suggest tests with:

- Framework console (`rails console`, `python manage.py shell`, etc.) to verify business logic, services, jobs.
- Browser for flows that include server-side views or embedded frontend components.
- Job worker logs (Sidekiq, Celery, RQ, etc.) if there are asynchronous processes.

#### 1.4 Legacy (Grails, Old Java, etc.)

Suggest tests with:

- Browser on the running app (use the start command defined in the project, e.g., `make serve`, `grails run-app`, etc.).
- Legacy app logs or Docker container.
- App console if available.

#### 1.5 Jobs / Asynchronous Processes

Suggest tests with:

- Manually enqueue the job from `rails console` or endpoint.
- Verify execution in Sidekiq / DelayedJob.
- Review processing logs and final state in database.

### Phase 2 — Execution by User

1. Present the test plan clearly and numbered.
2. Wait for the user to execute the tests and report results.
3. The user can respond with:
   - `all good`: the functionality behaves as expected.
   - `fails X`: describes which test failed and why.
   - `add log in Y`: requests adding debugging logs at a specific point.
   - `fix Z`: asks for an adjustment in the implementation.
   - `new case W`: detects a scenario not covered by unit tests.
   - `invoke next step`: moves to the next command if everything is correct.

### Phase 3 — Apply Feedback

According to the received feedback:

#### 3.1 Add Logs

- Add minimal and temporary logs at the requested point.
- In Ruby/Rails: use `Rails.logger.info`, `Rails.logger.debug`, `Rails.logger.error` according to appropriate level.
- In JavaScript/Vue: use `console.log` or `console.error` temporarily; remove before closing the task.
- In Grails: use `log.info`, `log.debug`.
- Prefer structured logs if the project uses them.
- Explain what information each log provides.

#### 3.2 Fix Implementation

- Identify the root cause of the functional failure.
- Apply the minimum correction.
- Update unit tests if expected behavior changes.
- Re-execute the affected unit test and, if applicable, the project suite.
- Show diff and technical justification.

#### 3.3 Add New Uncovered Functional Case

- If the user detects a new scenario:
  - Convert it to unit test following `step-2-gherkin-plan` rules.
  - Execute mini TDD (`step-3-tdd-execution`) for that case: RED → GREEN.
  - Update the Gherkin plan if necessary.

#### 3.4 Re-execute Functional Tests

- After each correction, ask the user to re-execute the affected functional test.
- If the user requests, provide new commands or adjust existing ones.

### Phase 4 — Closure

When the user reports that functional tests pass:

1. Check that no temporary logs, `console.log`, `puts`, `debugger`, `binding.pry`, etc. remain.
2. Re-execute the complete unit suite of each affected project to confirm nothing broke.
3. Present final summary:
   - Executed functional tests.
   - Applied corrections.
   - Added or modified unit tests.
   - Final suite status.
4. Ask the user:
   - `Is everything good?` → finalize the task.
   - `Invoke next step?` → ask which is the next step and proceed.

## Rules

1. **Concrete suggestions**: test plans must include exact commands, URLs, payloads, UI steps, and sample data. Don't stay in vague descriptions.
2. **Wait for user feedback**: this step doesn't automate functional tests; the human executes and reports them.
3. **Corrections within the same step**: if the user asks for a fix, log, or adjustment, apply it here and don't delegate to another command.
4. **Update unit tests**: any new functional discovery must be reflected in the unit suite.
5. **Don't leave debugging logs**: before closing, remove `console.log`, `puts`, `debugger`, `Rails.logger.debug` temporaries, etc.
6. **Language**: code should be in **English**. Communication with the user should be in the language used to request the task.
7. **One change at a time**: if there are multiple corrections, address them one by one, showing diff and justification.
8. **Complete suite after corrections**: each significant correction must end with the project suite in GREEN.
9. **Don't ignore errors**: if a command, test, or functional test fails, report it and ask for a decision.
10. **Final user decision**: only the user determines if the task is ready or if the next step is invoked.

## Output Format

### Phase 0 — Summary

- Implemented functionality.
- Affected projects.
- Implementation files.
- Unit test status.

### Phase 1 — Functional Test Plan

For each functional scenario:

| # | Scenario | Preconditions | Steps | Expected Result | Command / Tool |
|---|---|---|---|---|---|
| 1 | Happy path | ... | ... | ... | `curl ...` |
| 2 | Edge case X | ... | ... | ... | `rails console` |

### Phase 2 — User Feedback

- Received response.
- Decided action.

### Phase 3 — Applied Corrections

- Added / removed logs.
- Implemented fixes.
- Added or modified unit tests.
- Summary diff.

### Phase 4 — Closure

- Final unit suite: result by project.
- Functional tests summary.
- User decision: `all good` or `invoke next step`.

## Note on Context

If `$ARGUMENTS` is empty, use the complete current conversation history to reconstruct the implemented functionality, affected projects, and existing unit tests.
