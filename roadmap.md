# Klinswork Inventory — Version 1 Roadmap

## Purpose

Build a small, working inventory system that helps track supplies once they enter the user's area of responsibility.

The system should answer:

* What products do we use?
* What is currently on the cart?
* What official manufacturer SDS applies to each product?
* What supplies were received?
* What supplies were used, moved, removed, or corrected?
* How did the current inventory reach its present state?

## Version 1 Mission

> When the physical contents of the cart change, record the event in less than one minute, update the current inventory, and preserve the history of what happened.

## System Boundary

Version 1 begins when supplies are delivered to a housekeeping cart or other managed location.

It does **not** attempt to manage:

* purchasing;
* vendor orders;
* invoices;
* the central warehouse;
* the employer's complete chemical inventory;
* official safety administration;
* automatic reordering;
* employee or patient records.

Klinswork organizes the user's own work, communications, references, and managed supplies.

---

## Core Data Model

### 1. Product Definitions

One record for each type of product.

A product definition answers:

> What is this product?

Suggested fields:

* `product_id`
* `product_name`
* `manufacturer`
* `manufacturer_product_code`
* `category`
* `container_size`
* `product_image_url`
* `manufacturer_page_url`
* `active`

### 2. SDS Records

One record for each SDS version.

An SDS record answers:

> Which official manufacturer-issued SDS applies to this product?

Suggested fields:

* `sds_id`
* `product_id`
* `revision_date`
* `document_url`
* `source`
* `date_verified`
* `current`

Only exact manufacturer-, importer-, or authorized-distributor-issued SDS documents should be linked. Klinswork does not create, rewrite, approve, or replace SDS documents.

### 3. Current Inventory Records

One record for each product-location combination.

An inventory record answers:

> What do we currently have, and where is it?

Suggested fields:

* `inventory_id`
* `product_id`
* `location_id`
* `quantity`
* `unit`
* `last_updated`

Version 1 should track quantities rather than assigning an individual ID to every bottle.

### 4. Inventory Event Records

One permanent record every time inventory changes.

An event record answers:

> What happened?

Suggested fields:

* `event_id`
* `timestamp`
* `event_type`
* `product_id`
* `quantity`
* `from_location`
* `to_location`
* `performed_by`
* `notes`

Initial event types:

* `RECEIVED`
* `USED_UP`
* `MOVED`
* `REMOVED`
* `COUNT_CORRECTED`

---

## Platform Responsibilities

### Google Sheets

Acts as the data store.

Recommended tabs:

1. `Products`
2. `SDS`
3. `Locations`
4. `Current Inventory`
5. `Inventory Events`
6. `Settings` or `Authorized Users` later, if needed

### Google Forms

Provides simple mobile data entry.

Version 1 forms:

#### Receive Inventory

Used when supplies are delivered.

Fields:

* product;
* quantity;
* destination;
* condition;
* notes.

#### Change Inventory

Used when supplies are:

* used up;
* moved;
* removed;
* corrected.

Fields:

* action;
* product;
* quantity;
* current location;
* destination, when required;
* notes or reason.

### Apps Script

Acts as the logic and application layer.

Responsibilities:

* validate form submissions;
* verify that products and locations exist;
* prevent negative quantities;
* require destinations for move events;
* write permanent event records;
* update current inventory;
* retrieve product, SDS, inventory, and history data;
* generate reusable HTML views;
* report errors clearly.

### Google Sites

Acts as an operational doorway.

Possible links:

* Open Inventory
* Receive Supplies
* Record Inventory Change
* Open Resource Center
* Open Housekeeping Alert System
* View Schedule

Google Sites should not contain the main inventory logic.

### GitHub Pages

Use for non-sensitive static material such as:

* Klinswork project documentation;
* development notes;
* generic examples;
* reusable reference guides;
* public demonstrations with sample data.

The live inventory should be served through Apps Script because it requires changing data and processing.

---

## Required Views

### 1. Inventory Dashboard

Shows the current contents of the cart.

Each product should display:

* product name;
* quantity;
* container size;
* last updated;
* link to product information;
* link or action to record a change.

### 2. Product Directory

A searchable or filterable list of product definitions.

Each product card may display:

* image;
* product name;
* manufacturer;
* category;
* container size;
* SDS availability;
* link to full product view.

### 3. Product Detail View

One reusable HTML template populated by `product_id`.

It should combine:

* product definition;
* manufacturer information;
* product image;
* manufacturer product page;
* current manufacturer SDS;
* SDS revision and verification dates;
* current inventory quantity;
* recent inventory events.

There should not be a separate HTML file for every product.

Example route:

```text
?view=product&id=CHEM-001
```

### 4. Inventory History View

Shows the permanent event log in readable form.

Examples:

* Received 2 bottles
* Used up 1 bottle
* Moved 1 bottle
* Corrected count from 2 to 1

### 5. SDS Directory

Shows products and their current manufacturer SDS links.

It should include:

* product name;
* manufacturer;
* revision date;
* date last verified;
* link to the official PDF.

---

## Architecture

```text
Google Forms
  Receive / Change Inventory
            ↓
        Apps Script
  validate + record event
  update current inventory
            ↓
       Google Sheets
 Products | SDS | Locations
 Inventory | Events
            ↓
  Apps Script Web Application
 Dashboard | Products | SDS | History
            ↓
 Google Sites or direct web-app link
```

---

## Development Roadmap

## Milestone 1 — Define the Pilot

* Choose one cart.
* Choose no more than ten products.
* Choose one optional storage location.
* Define the system boundary.
* Confirm that quantity-by-container is sufficient.
* Decide the location names and IDs.

### Completion test

The pilot has a clear list of products and locations without trying to model the entire workplace.

---

## Milestone 2 — Build the Google Sheet

Create the required tabs:

* Products
* SDS
* Locations
* Current Inventory
* Inventory Events

Add column headers and sample records.

Assign stable IDs:

```text
CHEM-001
SDS-001
LOC-CART-01
INV-001
EVT-001
```

### Completion test

A person can look at the workbook and understand the difference between definitions, current inventory, and events.

---

## Milestone 3 — Add Product and SDS Definitions

For each pilot product:

* record the exact product name;
* record the manufacturer;
* record the manufacturer product code;
* record container size;
* add a product image;
* add the manufacturer product page;
* locate the exact manufacturer-issued SDS;
* record the SDS revision date;
* record the source and verification date.

### Completion test

Every pilot product has an exact definition and a verified SDS link that matches the physical container.

---

## Milestone 4 — Establish Starting Inventory

Count the physical contents of the cart.

Enter the initial quantities.

Choose one of two methods:

1. create a `COUNT_CORRECTED` or `OPENING_BALANCE` event for each product; or
2. enter the starting state directly and mark it clearly as the opening inventory.

The event-based opening method is preferred because it preserves the origin of the first state.

### Completion test

The Current Inventory tab matches the physical cart.

---

## Milestone 5 — Create the Forms

### Receive Inventory Form

Create fields for:

* product;
* quantity;
* destination;
* condition;
* notes.

### Change Inventory Form

Create fields for:

* action;
* product;
* quantity;
* current location;
* destination;
* notes.

### Completion test

Both forms work on a phone and can be completed in less than one minute.

---

## Milestone 6 — Build Apps Script Processing

Create functions to:

* read form submissions;
* validate products and locations;
* create unique event IDs;
* write event records;
* add received quantities;
* subtract used or removed quantities;
* move quantities between locations;
* correct counts;
* reject invalid transactions;
* update timestamps.

Suggested data functions:

```javascript
getProducts()
getProduct(productId)
getCurrentInventory(locationId)
getInventoryHistory(productId, locationId)
getCurrentSds(productId)
```

### Completion test

Every accepted action creates an event and produces the correct current quantity.

---

## Milestone 7 — Build the Web Views

Create a small set of reusable templates:

* `HomeView.html`
* `InventoryView.html`
* `ProductDirectoryView.html`
* `ProductView.html`
* `HistoryView.html`
* `SdsDirectoryView.html`

Use routing such as:

```text
?view=inventory
?view=products
?view=product&id=CHEM-001
?view=history
?view=sds
```

### Completion test

The same Product View template displays every product based on its ID.

---

## Milestone 8 — Connect the Operational Entry Points

Add clear links from the existing utility page or Google Site:

* View My Cart
* Receive Supplies
* Record Inventory Change
* Product Resources
* SDS Directory
* Inventory History

### Completion test

A user can move from the daily work page into inventory actions without searching for separate URLs.

---

## Milestone 9 — Test the Complete Cycle

Run these scenarios:

1. Receive two bottles.
2. Confirm the current quantity increased by two.
3. Use up one bottle.
4. Confirm the quantity decreased by one.
5. Move one bottle to another location.
6. Confirm both locations updated correctly.
7. Attempt to use more than exists.
8. Confirm the system rejects the action.
9. Correct an inaccurate count.
10. Open the product definition and exact SDS.
11. Review the full event history.

### Completion test

The physical inventory, current state, and event history agree after every scenario.

---

## Milestone 10 — Begin Real Use

Use the system only for the pilot cart and products.

During the pilot, record:

* data-entry problems;
* confusing fields;
* missing event types;
* incorrect assumptions;
* actions that take too long;
* views that are useful;
* views that are ignored.

Do not expand until the basic cycle is stable.

### Completion test

The system supports ordinary receiving and use for at least one week without requiring manual repair after every transaction.

---

## Version 1 Definition of Done

Version 1 is working when:

* products have stable definitions;
* exact manufacturer SDS records are available;
* current cart quantities are visible;
* receiving can be recorded;
* use, movement, removal, and corrections can be recorded;
* inventory cannot become negative silently;
* every accepted change creates a permanent event;
* the current state matches the physical cart;
* product and SDS views work on a phone;
* the complete cycle takes little enough effort to use during normal work.

---

## Deferred Features

Do not include these in Version 1 unless actual use proves they are necessary:

* individual bottle IDs;
* barcode or QR scanning;
* purchasing and vendor management;
* automatic reorder requests;
* expiration alerts;
* cost tracking;
* warehouse inventory;
* multiple departments;
* complex permissions;
* analytics dashboards;
* offline synchronization;
* automatic SDS revision checking;
* employer-wide deployment;
* formal safety or compliance administration.

---

## Design Principles

1. **Track only what enters the user's responsibility.**
2. **Definitions describe products.**
3. **Inventory records describe the present.**
4. **Events explain how the present came to be.**
5. **Views display related information without duplicating it.**
6. **Use one reusable view for many records.**
7. **Link only exact manufacturer-issued SDS documents.**
8. **Keep the first pilot small enough to understand completely.**
9. **Do not automate a process before the manual structure is clear.**
10. **Expand only after real use reveals the next requirement.**

---

## Immediate Next Step

Create the Google Sheet structure with the five core tabs and enter one real product definition, one exact SDS record, one location, one opening inventory event, and one current inventory record.

That single vertical slice should be completed before adding the remaining pilot products.
