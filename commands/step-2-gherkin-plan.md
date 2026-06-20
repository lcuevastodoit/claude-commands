# /step-2-gherkin-plan

Converts the current conversation context (or received arguments) into a plan of executable specifications written in **Gherkin** following the Cucumber standard: https://cucumber.io/docs/gherkin/reference/.

## Prompt / Task Context

$ARGUMENTS

---

## Objective

Transform user story requirements, acceptance criteria, and technical details discovered during the current conversation into a complete, clear Gherkin scenario suite ready to become automated tests. **Do not execute code changes or modify files in phase 1.**

Once the user approves, modifies, or suggests changes to the Gherkin plan, each approved scenario must be converted into **real test cases** within the corresponding project's test suite (RSpec for Ruby/Rails, Jest for Vue.js/JavaScript), respecting existing patterns, helpers, and test styles in each project.

## Inputs to Consider

1. **Command arguments**: `$ARGUMENTS`.
2. **Current conversation context**: message history of this session (questions, answers, investigations, decisions).
3. **Mentioned tracking tickets**: title, description, acceptance criteria, Definition of Done.
4. **Related MRs/PRs**: detected technical changes.
5. **Repository projects involved**: deduced from prompt, repo structure, and conversation (backend, frontend, shared libraries, legacy, etc.).

## Stack and Reference Technologies

- **Ruby/Rails**: RSpec can use `feature/scenario` with Capybara or conventional `describe/context/it`. Gherkin scenarios can be adapted to both.
- **Vue.js/JavaScript**: Jest + Testing Library, Vue Test Utils, Cypress e2e.
- **Legacy**: Grails / Spock.

## Command Phases

### Phase 1 — Generate Gherkin Plan

Analyze the context and produce the Gherkin specification following the rules in this section. **Do not write test code or modify project files yet.**

### Phase 2 — Plan Approval / Review

Present the Gherkin plan and ask the user to:

- **Approve** the plan as is.
- **Modify** scenarios, add new ones, or delete those that don't apply.
- **Suggest changes** in wording, scope, edge cases, or feature splitting.

**Do not proceed to Phase 3 without explicit user approval.**

### Phase 3 — Convert Gherkin to Real Tests

Once the Gherkin plan is approved:

1. Identify the repository projects that will be safely modified.
2. For each identified project, generate the corresponding test files:
   - **Ruby/Rails**: use **RSpec** or the suite defined in the project.
   - **Vue.js/JavaScript**: use **Jest**, Testing Library, or the suite defined in the project.
   - **Other languages**: use the project's predominant testing framework.
3. Map each Gherkin scenario to one or more test cases in the corresponding suite.
4. Before creating tests, inspect the project's existing suite to respect:
   - Folder structure (`spec/`, `__tests__/`, etc.).
   - File and `describe/context/it` naming conventions.
   - Most used helpers, factories, fixtures, and mocks.
   - Predominant assertion/expectation style.
   - Way of handling database, sidekiq, requests, components, stores, etc.

## Expected Output Structure

### Phase 1

For each identified **Feature**, generate:

```gherkin
@<project-tag> @<priority-tag>
Feature: <Descriptive name of functionality>

  As a <user type>
  I want <objective>
  So that <benefit>

  Background:
    Given <common preconditions>

  Scenario: <brief description>
    Given <initial state>
    When <action>
    Then <expected result>
    And <additional result>
```

### Phase 3

For each generated test case, the file must meet:

- 100% **English** code.
- **No comments** in the code unless exceptional complexity justifies it.
- **Single expectation per test case** (`expect(...).to ...`). If a Gherkin scenario validates multiple results, split it into several `it` within the same `describe/context`.
- Use the **same helpers, factories, fixtures, and mocks** as most tests in the project.
- Follow the order: `describe` → `context` → `it`, with descriptive names reflecting the Gherkin scenario.
- Prefer `let`, `let!`, `before` according to the project pattern; avoid repeating setup between tests.
- In RSpec:
  - Use `feature/scenario` or `describe/context/it` according to the project standard.
  - Use FactoryBot, WebMock, Shoulda Matchers, custom helpers, shared context, etc., if present.
- In Jest:
  - Use `@testing-library/vue`, `@vue/test-utils`, `jest.mock`, `msw`, etc., according to the project standard.
  - Mock stores, services, and dependencies following the existing pattern.

## Rules

### Gherkin Phase Rules

1. **One scenario per clear requirement**: each acceptance criterion must map to at least one Gherkin scenario.
2. **Mandatory edge cases**: always include scenarios for:
   - Happy path (main flow)
   - Invalid data / validation errors
   - Permissions / authentication / authorization
   - Extreme states (empty, limit, timeout, external service failure)
   - Idempotency and concurrency when applicable
3. **Ubiquitous language**: use the same terms from the business, tracking ticket, and conversation (don't invent names).
4. **Don't specify UI details unless required**: focus on observable behavior, not button IDs or colors.
5. **Tags**: use `@<project>` (affected project name), `@regression`, `@smoke`, `@wip` as appropriate.
6. **Common Background**: if several scenarios share preconditions, extract them to a `Background`.
7. **Scenario Outline**: when there are multiple data variations for the same logic, use `Scenario Outline` + `Examples`.
8. **Explicit acceptance criteria**: include at the end a list of verifiable acceptance criteria.
9. **Plan only in Phase 1**: don't create, edit, or delete code files until the user approves.
10. **Language**: respond in the language used to request the task (English or Spanish). Gherkin can be in English.
11. **Don't ignore errors**: if context is missing or there's ambiguity, report it clearly and ask for clarification.

### Real Tests Phase Rules

1. **Prior approval mandatory**: don't generate tests without explicit user confirmation on the Gherkin plan.
2. **Safe projects only**: create tests only for projects that will certainly be modified. If in doubt, ask first.
3. **Code language**: all test cases in **English**.
4. **No comments**: test code should not have inline comments; the test name should be descriptive enough.
5. **Single expectation per test case** (`expect(...).to ...` or equivalent). If a Gherkin scenario has multiple `Then`, split it into several `it`.
6. **Use project helpers and patterns**: review existing tests of the same type (model, request, component, store, job, service) and replicate their style, helpers, and setup.
7. **Don't duplicate factories/fixtures**: reuse existing ones; if a new one is needed, create it following project conventions.
8. **Keep DRY within the test file**: extract common setup to `let`, `before`, `shared_examples`, `setup()`, or local helpers, according to the project standard.
9. **Don't implement functionality**: in this phase only create tests; they should fail (RED) if the functionality doesn't exist yet.
10. **Show diff and list**: at the end, present a summary of created files and a clear diff before asking for approval to continue.

## Output Format

### Phase 1 — Gherkin Plan

#### 1. Task Summary
- 2-3 sentences about what must be achieved.

#### 2. Identified Features
- List of features with their tag and purpose.

#### 3. Gherkin Specifications
- Complete Gherkin blocks for each feature.

#### 4. Verifiable Acceptance Criteria
- Numbered list of conditions that must be met.

#### 5. Questions / Blockers / Risks
- What's missing clarification before moving to implementation.

#### 6. Recommended Next Steps
- Ask for approval, modification, or suggestions on the Gherkin plan.

### Phase 3 — Real Tests (after approval)

#### 1. Conversion Summary
- Table mapping each Gherkin scenario to its corresponding test case (project, file, approximate line, `it` name).

#### 2. Created Test Files
- Absolute path of each file.
- Project it belongs to.
- Test type (model, request, service, component, store, job, etc.).

#### 3. Summary Diff
- Changes introduced (only new files in this phase, no production code modification).

#### 4. Test Status
- Recommended command to execute them.
- If executed, expected result: **RED** (fail because functionality doesn't exist yet).

#### 5. Recommended Next Steps
- Start TDD implementation or approval to continue.

## Note on Context

If `$ARGUMENTS` is empty, assume the complete context is in this session's conversation history. In that case, synthesize requirements from that history instead of asking for more information.
