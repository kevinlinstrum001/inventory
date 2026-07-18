# Klinswork Issue Management Ruleset

## Purpose

This ruleset defines how Klinswork project ideas, bugs, questions, documentation needs, and proposed changes are captured, evaluated, implemented, tested, documented, and closed.

The goal is to preserve the reason for every meaningful change and prevent code changes from beginning before the intended behavior is understood.

---

## Core Workflow

```text
Observe
→ Record
→ Classify
→ Clarify
→ Prioritize
→ Approve
→ Implement
→ Test
→ Document
→ Close
```

An issue is not considered complete merely because code was changed. It is complete only when the intended behavior has been verified and the result has been documented.

---

## Issue Types

### Bug

Use when the system behaves incorrectly compared with its intended behavior.

Required sections:

```text
Current behavior
Expected behavior
Steps to reproduce
Affected component
Evidence
Severity
Acceptance test
```

Example:

```text
The Move action accepts an invalid destination and partially changes inventory.
```

### Enhancement

Use when the current behavior works but could be improved.

Required sections:

```text
Problem
Proposed behavior
Current workaround
Reason for change
Example
Acceptance test
Target version
```

Example:

```text
Add a Remove All action that reduces the selected location quantity to zero.
```

### Task

Use for specific work that does not represent a bug or new user-facing feature.

Required sections:

```text
Objective
Work required
Affected files or components
Dependencies
Completion test
Target version
```

Example:

```text
Add successful-execution logging to the Change Inventory processor.
```

### Documentation

Use when instructions, explanations, diagrams, field definitions, or project records need to be created or corrected.

Required sections:

```text
Documentation needed
Intended reader
Affected document
Reason
Completion test
```

Example:

```text
Document the difference between Used Up, Removed, Moved, and Count Corrected.
```

### Question

Use when the correct behavior is not yet settled.

Required sections:

```text
Question
Why it matters
Known options
Current behavior
Decision needed
```

A question should normally be resolved before implementation begins.

---

## Issue Titles

Titles should:

* describe one specific problem or change;
* begin with an action or clear condition;
* avoid vague wording;
* remain understandable without opening the issue.

Good examples:

```text
Add Remove All inventory action
Reject moves to inactive locations
Document Count Corrected behavior
Add successful trigger execution logs
```

Weak examples:

```text
Inventory problem
New idea
Fix script
Changes
```

---

## One-Issue Rule

Each issue should describe one independently understandable change.

Do not combine unrelated work such as:

```text
Add Remove All, redesign the inventory page, and create email alerts
```

Create separate issues unless the changes cannot be implemented or tested independently.

---

## Labels

Initial labels:

```text
bug
enhancement
task
documentation
question
```

Optional management labels:

```text
priority-high
priority-medium
priority-low
blocked
needs-review
ready
deferred
v1.1
v1.2
```

Labels should help organize issues, not replace the written explanation.

---

## Status Meanings

### Proposed

The issue has been recorded but not yet approved.

### Needs Clarification

Important behavior, requirements, or acceptance conditions remain unsettled.

### Ready

The issue is sufficiently clear to implement.

### In Progress

Work has begun.

### Testing

Implementation exists and is being verified.

### Blocked

Work cannot continue because of a dependency, missing decision, or unresolved problem.

### Deferred

The issue is valid but intentionally postponed.

### Closed

The acceptance test passed and the outcome was documented.

GitHub may represent most of these through labels while the issue itself remains either open or closed.

---

## Clarification Requirements

Before implementation, the issue should make clear:

```text
What is happening now?
What should happen instead?
Why does the change matter?
Which part of the system is affected?
How will we know the change works?
```

Do not begin coding when the proposed behavior still has multiple plausible meanings.

---

## Priority

### High

Use when the issue may:

* corrupt inventory data;
* create incorrect event records;
* allow negative quantities;
* silently lose information;
* block ordinary use.

### Medium

Use when the issue affects usability or reliability but has a safe workaround.

### Low

Use for convenience improvements, visual refinements, or deferred ideas that do not interfere with current use.

Priority should reflect operational effect, not excitement about the idea.

---

## Target Versions

Assign a target version only after the issue is understood well enough to schedule.

Examples:

```text
v1.0
v1.1
v1.2
Future
```

Version 1 changes should remain limited to behavior required for a stable pilot.

Ideas that are useful but unnecessary for the current pilot should normally be assigned to a later version.

---

## Approval Rule

An issue is ready for implementation when:

* its type is identified;
* the problem is understandable;
* the expected behavior is defined;
* affected components are known;
* an acceptance test exists;
* major risks or dependencies are identified.

An issue may remain open as **Proposed** without being approved.

Recording an idea does not obligate the project to implement it.

---

## Implementation Workflow

Before changing code:

1. Review the issue.
2. Review the current roadmap.
3. Identify affected files, functions, forms, sheets, and views.
4. Confirm whether the change affects existing data.
5. Define the expected result and failure behavior.
6. Preserve the current working version.
7. Produce a complete revised file rather than fragile disconnected code fragments when practical.

The preferred workflow is:

```text
understand behavior
→ inspect relevant structure
→ revise complete affected file
→ replace carefully
→ test one behavior at a time
```

---

## Testing Requirements

Testing should include both success and failure cases when relevant.

For inventory-processing changes, consider:

```text
valid transaction succeeds
event record is created
current quantity is correct
timestamp is updated
invalid transaction is rejected
no partial update occurs
no false event is created
inventory cannot become negative
live view reflects the accepted result
```

Testing evidence may include:

* execution status;
* error message;
* Inventory Events row;
* Current Inventory values;
* response-sheet entry;
* screenshot;
* written test result.

---

## Acceptance Tests

Each issue should have a test that can answer:

```text
Did the implemented behavior satisfy the issue?
```

Example for **Remove All**:

```text
Given a product with quantity 2 at Cart 01,
when Remove All is submitted,
the Cart 01 quantity becomes 0,
a REMOVED event records quantity 2,
the destination is OUTSIDE_SYSTEM,
and the submitted notes are preserved.
```

Acceptance tests should describe observable results rather than internal coding details whenever possible.

---

## Documentation Requirements

Before closing an issue, document:

```text
What changed
Which files or components changed
How it was tested
What result was observed
Whether any workaround or limitation remains
Which version contains the change
```

Significant behavior changes should also be reflected in the roadmap, README, operating instructions, or release notes where appropriate.

---

## Closure Rule

Do not close an issue merely because:

* code was written;
* a file was replaced;
* the script saved successfully;
* the change looked correct without testing.

Close an issue only when:

1. the implementation is complete;
2. the acceptance test passes;
3. no unexpected data changes occurred;
4. the result is documented;
5. remaining limitations are stated;
6. the target version is identified.

A useful closing comment format is:

```markdown
## Result

Implemented in v1.1.

## Changes

- Added Remove All processing.
- Added validation for zero existing quantity.
- Recorded the actual removed quantity in Inventory Events.

## Testing

Tested with 2 bottles at LOC-CART-01.

Expected:
- current quantity becomes 0;
- event quantity is 2;
- destination is OUTSIDE_SYSTEM.

Observed:
- all expected results passed.

## Remaining limitations

None identified.
```

---

## Reopening Issues

Reopen a closed issue when:

* the accepted behavior does not actually work;
* a regression appears;
* the implementation only partially satisfied the acceptance test;
* new evidence shows that the original problem remains.

Create a new issue instead when the new request represents a separate enhancement rather than a failure of the completed issue.

---

## Rejected or Deferred Issues

When an issue will not be implemented, do not simply delete it.

Record:

```text
Decision: Rejected or Deferred
Reason
Date
Possible future condition for reconsideration
```

This preserves the project’s decision history.

---

## Source-of-Truth Principle

Use each system for its proper role:

```text
Roadmap
= planned project direction and milestones

GitHub Issues
= proposed, active, deferred, and completed changes

Code repository
= implemented system

Inventory Events
= accepted operational inventory changes

Form response sheets
= submitted requests, including rejected attempts

Apps Script logs
= technical execution and troubleshooting information
```

No single source should be expected to perform all of these roles.

---

## Initial Design Principles

1. Record the reason for a change before implementing it.
2. Understand behavior before editing code.
3. Keep one issue focused on one change.
4. Separate observations from accepted changes.
5. Preserve rejected attempts where useful without polluting permanent operational records.
6. Test failure behavior as deliberately as success behavior.
7. Do not allow partial inventory updates.
8. Prefer complete, coherent file revisions over manual fragment assembly.
9. Close issues only after verification.
10. Allow real use to determine which proposed features are actually necessary.
