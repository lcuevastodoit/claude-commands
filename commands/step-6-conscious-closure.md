# /step-6-conscious-closure

Closes the work session consciously by generating an **executive summary** of what was achieved and the most technically notable aspects. This summary is published as a comment on the tracking system ticket (Jira, Azure DevOps, Linear, etc.) using the MCP if possible. If it can't be published automatically, the user is suggested to paste it manually. Additionally, **5 manual testing suggestions** are included for functionality reviewers.

## Prompt / Task Context

$ARGUMENTS

---

## Objective

Finalize the task leaving clear and useful evidence for the team:

1. Summarize the most important achievements with the changes.
2. Highlight the most technically notable aspects to consider (risks, decisions, dependencies, technical debt).
3. Publish that summary as a comment on the associated tracking system ticket, if known and the MCP is available.
4. If automatic publishing is not possible, deliver the text ready for the user to paste manually.
5. Suggest 5 manual testing instructions for reviewers.
6. Leave the task ready for the user to decide to commit, push, or move to human review.

## Preconditions

1. Previous steps should have left the functionality implemented, unit tests in GREEN, and functional tests reviewed.
2. A ticket key must exist in the session context, or the user must provide it.
3. The environment must allow publishing comments in the tracking system via MCP, or the user must be willing to do it manually.

## Command Phases

### Phase 0 — Collect Closure Context

1. Identify from the session history:
   - Associated ticket key.
   - Title and description of implemented functionality.
   - Affected repository projects.
   - Created or modified implementation and test files.
   - Important technical decisions made during TDD or code review.
   - Risks, technical debt, or points of attention.
   - Final test suite status.
   - Manual functional test results.

2. If the ticket key is unknown, ask the user:
   - `What is the key of the associated ticket?`
   - If there's no ticket, offer to generate only the plain text summary.

### Phase 1 — Draft Executive Summary

The summary should be brief, clear, and useful for reviewers, QA, and stakeholders. Suggested structure:

```markdown
## Summary of Changes

- Functionality implemented in one sentence.
- Affected projects.
- Main files or areas touched.

## Most Technically Notable

- Key decisions and their justification.
- Risks or dependencies introduced.
- Technical debt or points to review in the future.
- Performance, security, or compatibility considerations.

## Tests

- Executed suites and final status.
- New unit tests added.

## Manual Testing Instructions for Reviewers

1. ...
2. ...
3. ...
4. ...
5. ...
```

Rules for the summary:

- Maximum 2-3 paragraphs per section.
- Clear language, without unnecessary jargon.
- Focused on what a reviewer or QA needs to know.
- If there's technical debt, mention it honestly.
- If a change is sensitive (security, permissions, data), highlight it explicitly.

### Phase 2 — Suggest 5 Manual Testing Instructions

Generate exactly 5 manual testing suggestions for reviewers. They must cover:

1. **Main happy path**: the normal usage flow of the functionality.
2. **Data edge case**: invalid, empty, extreme, or unexpected input.
3. **Permissions / authentication / authorization**: access with unprivileged users or invalid sessions.
4. **Controlled error or failure**: how the functionality behaves in the face of an error (external service down, validation failed, timeout).
5. **Integration or side effect**: verify that the change doesn't break an adjacent functionality or that data persists/updates correctly in another system.

Each instruction must include:

- Preconditions.
- Concrete steps.
- Expected result.
- Technical note if applicable (endpoint, screen, job, etc.).

### Phase 3 — Publish in Tracking System

1. **If the ticket key is known**:
   - Use the tracking system MCP (e.g., `mcp__jira__jira_add_comment` if available) to publish the summary as a comment.
   - The comment body should be in Markdown.
   - Confirm to the user that it was published correctly, including the ID or link of the comment if available.

2. **If the ticket key is unknown or the MCP doesn't respond**:
   - Show the full summary text to the user.
   - Suggest they paste it manually as a comment on the corresponding ticket.
   - Don't attempt to publish without a valid key.

3. **If the MCP fails to publish**:
   - Report the error clearly.
   - Deliver the text ready to copy and paste.
   - Don't retry indefinitely without user authorization.

### Phase 4 — Final Closure

1. Present a minimal final summary to the user:
   - Delivered functionality.
   - Test status.
   - Summary published in the tracking system (or instructions to paste it).
   - Suggested next steps (commit, push, MR/PR, human review, QA).

2. Ask if they want to:
   - Finalize the session.
   - Continue with another command.
   - Perform manual commit/push (don't automate without approval).

## Rules

1. **Don't modify code in this step**: only summarize and publish.
2. **Ticket key**: if unknown, ask before attempting to publish.
3. **Honest summary**: don't hide technical debt, risks, or questionable decisions.
4. **5 manual testing suggestions**: exactly five, covering happy path, data limit, permissions, controlled error, and integration.
5. **Clear Markdown**: use format that the tracking system renders well (headers, lists, bold).
6. **Language**: communication with the user should be in the language used to request the task. The summary for the ticket can be in English or Spanish according to team convention.
7. **Don't retry publication without authorization**: if publication fails, deliver the text to the user.
8. **No committing or pushing**: the closure is informative; final action remains with the user.
9. **Don't ignore errors**: if publishing in the tracking system fails, report it and offer the manual alternative.

## Output Format

### 1. Generated Executive Summary

```markdown
## Summary of Changes
...

## Most Technically Notable
...

## Tests
...

## Manual Testing Instructions for Reviewers

1. ...
2. ...
3. ...
4. ...
5. ...
```

### 2. Publication Status in Tracking System

- Published as comment in `[TICKET-KEY]` successfully.
- Or: Could not publish; copy and paste manually.
- Or: Ticket key unknown; provide it to publish.

### 3. Final Closure

- Functionality ready.
- Tests in GREEN.
- Suggested next step.
- User decision.

## Note on Context

If `$ARGUMENTS` is empty, use the complete current conversation history to build the summary. If a ticket key is not found, ask the user explicitly before continuing.
