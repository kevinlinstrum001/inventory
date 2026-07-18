We are handing off from another conversation, starting a new project called "Inventory". We should upload **four core documents plus the current code files**.

## 1. `HANDOFF.md`

This is the entry point for the next conversation. It should explain:

* what Klinswork Inventory is;
* the current architecture;
* what has already been completed;
* exactly where work stopped;
* the next action;
* important working rules;
* links or filenames for the supporting documents.

Its final section should say something like:

```markdown
## Immediate Next Step

Populate the SDS sheet with at least one verified manufacturer SDS record, then test the Current SDS section in `ProductView.html`.

After the SDS section is verified, add recent inventory events to the Product View.
```

## 2. `roadmap.md`

This is the long-range project plan.

It should preserve:

* the overall purpose of Klinswork Inventory;
* completed milestones;
* Milestone 7 and later milestones;
* intended future functionality;
* major architectural principles;
* deferred enhancements such as Issue #1, “Remove All.”

This document answers:

```text
Where is the project going?
```

## 3. `docs/milestones/milestone-07-web-views.md`

This is the local working roadmap and learning record we have been building.

It should contain:

* status table;
* table of contents;
* routing explanation;
* Product Directory requirements;
* Product View development notes;
* inventory-by-location implementation;
* Current SDS implementation;
* verification checklists;
* later History and SDS Directory sections.

This document answers:

```text
What are we doing now, how are we doing it, and what has been verified?
```

## 4. `docs/architecture.md`

This should preserve the system model we clarified today:

```text
Browser URL
→ doGet(e)
→ route map
→ HTML view
→ google.script.run
→ Code.gs server function
→ spreadsheet
→ returned object
→ render function
```

It should also document:

* browser-side versus server-side code;
* `google.script.run` as the bridge;
* `/dev` versus `/exec`;
* URL parameters such as `view` and `id`;
* Apps Script event objects;
* public data functions versus underscore-suffixed helper functions;
* current spreadsheet tabs and their responsibilities.

This prevents the next thread from having to reconstruct the architecture from scattered conversation history.

## Current code snapshots

Include the latest working copies of:

```text
Code.gs
InventoryView.html
HomeView.html
ProductDirectoryView.html
ProductView.html
SdsDirectoryView.html
```

Even temporary views should be included because they document the current project state.

The current `ProductView.html` should be the version containing:

* complete product identity;
* product image;
* manufacturer link;
* inventory by location;
* Current SDS card and loading logic.

## Existing supporting documents

Keep these with the project rather than duplicating their contents:

```text
docs/issue-management-ruleset.md

docs/issue-templates/
├── bug-report.md
├── enhancement.md
├── task.md
└── documentation.md
```

## Recommended folder structure

```text
inventory/
├── README.md
├── HANDOFF.md
├── roadmap.md
├── Code.gs
├── InventoryView.html
├── HomeView.html
├── ProductDirectoryView.html
├── ProductView.html
├── SdsDirectoryView.html
│
├── docs/
│   ├── architecture.md
│   ├── issue-management-ruleset.md
│   │
│   ├── milestones/
│   │   ├── milestone-06.md
│   │   └── milestone-07-web-views.md
│   │
│   └── issue-templates/
│       ├── bug-report.md
│       ├── enhancement.md
│       ├── task.md
│       └── documentation.md
│
└── images/
    └── products/
```

The essential handoff packet is therefore:

```text
HANDOFF.md
roadmap.md
milestone-07-web-views.md
architecture.md
latest Apps Script files
```

That gives the next conversation the long-range direction, current local plan, conceptual architecture, exact implementation state, and immediate next step.
