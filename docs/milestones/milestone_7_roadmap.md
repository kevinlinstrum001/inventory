# Milestone 7 — Build the Web Views

## Purpose

Turn the working inventory data and processing system into a small, understandable web application.

Milestone 7 does **not** change how inventory is recorded. Milestone 6 already established that layer. This milestone organizes the information into reusable views so the user can move through inventory, products, SDS records, and history without opening spreadsheet tabs.

The original roadmap calls for reusable templates and URL routing rather than separate pages for every product. 

---

## Current Starting Point

Milestone 7 has already partially begun.

The current Apps Script web application:

* serves `InventoryView.html`;
* displays live inventory data from the spreadsheet;
* shows product images and definitions;
* displays correct quantities and units;
* includes the **Use One** action;
* refreshes after accepted inventory changes;
* uses `getInventoryItem()` and `getCartInventory()` to combine product and inventory data. 

Therefore, `InventoryView.html` is not a future item. It is the first working Milestone 7 view.

---

## Required Views

### 1. Home View

Create:

```text
HomeView.html
```

Purpose:

* provide the default landing screen;
* explain what the inventory application contains;
* provide clear navigation to the other views.

Suggested links:

```text
View Cart Inventory
Browse Products
Open SDS Directory
Review Inventory History
Receive Supplies
Record Inventory Change
```

The base web-app URL should open this view.

Example:

```text
.../exec
.../exec?view=home
```

---

### 2. Inventory View

Existing file:

```text
InventoryView.html
```

Current function:

* displays the current contents of Cart 01;
* shows product name, quantity, unit, image, and related information;
* permits quick subtraction through **Use One**.

The roadmap originally defined the inventory dashboard as showing quantity, container size, last updated information, product links, and an action for recording changes. 

Remaining improvements:

* add navigation back to Home;
* add a link to each Product View;
* add a link to the Change Inventory form;
* display the location name clearly;
* confirm last-updated timestamps are readable;
* preserve the working **Use One** behavior.

Example route:

```text
?view=inventory&location=LOC-CART-01
```

---

### 3. Product Directory View

Create:

```text
ProductDirectoryView.html
```

Purpose:

* display all active product definitions;
* allow the user to find a product without searching the Products sheet;
* provide one path into the reusable Product View.

Each product card should display:

* product image;
* product name;
* manufacturer;
* category;
* container size;
* current quantity where appropriate;
* SDS availability;
* link to the full product record.

The directory may initially use a simple card layout. Search and filtering can be added only after the basic directory works.

Example route:

```text
?view=products
```

---

### 4. Product Detail View

Create:

```text
ProductView.html
```

This is the central completion requirement for Milestone 7.

One template should display any product based on its stable `product_id`. The roadmap explicitly says there should not be a separate HTML file for every product. 

The view should combine:

* product name;
* product ID;
* manufacturer;
* manufacturer product code;
* category;
* container size;
* inventory unit;
* product image;
* manufacturer product-page link;
* current quantity by tracked location;
* current manufacturer SDS;
* SDS revision date;
* SDS verification date;
* recent inventory events for that product.

Example routes:

```text
?view=product&id=CHEM-001
?view=product&id=CHEM-004
?view=product&id=PAPER-001
```

All of those routes should use the same `ProductView.html` file.

---

### 5. Inventory History View

Create:

```text
HistoryView.html
```

Purpose:

* display accepted Inventory Events in readable form;
* make the event history understandable without opening the spreadsheet;
* preserve the distinction between accepted events and rejected form submissions.

Each history entry should include:

* timestamp;
* event type;
* product name;
* quantity;
* source location;
* destination;
* notes.

Examples:

```text
Received 2 bottles of Oxivir into Cart 01
Used up 1 bottle from Cart 01
Moved 2 bottles from Cart 01 to Supply Room
Corrected Prominence count from 1 to 2
Removed 1 missing bottle from Cart 01
```

The view should read from **Inventory Events**, not the raw form-response sheets. The roadmap defines this as the permanent event log in readable form. 

Example route:

```text
?view=history
```

---

### 6. SDS Directory View

Create:

```text
SdsDirectoryView.html
```

Purpose:

* provide direct access to exact manufacturer-issued SDS documents;
* connect each SDS record to its product definition;
* avoid searching manually through the SDS sheet.

Each entry should display:

* product name;
* manufacturer;
* SDS revision date;
* date last verified;
* official SDS link;
* link to the Product View.

The roadmap requires links to official manufacturer SDS records and includes revision and verification information. 

Example route:

```text
?view=sds
```

---

## Routing

Update `doGet(e)` so it selects a view based on URL parameters instead of always loading `InventoryView.html`.

Suggested routes:

```text
?view=home
?view=inventory
?view=products
?view=product&id=CHEM-001
?view=history
?view=sds
```

Default behavior:

```text
No view parameter
→ HomeView.html
```

Unknown behavior:

```text
Unknown view
→ safe Not Found message or HomeView.html
```

The existing `doGet()` currently always returns `InventoryView.html`, so routing is one of the first required code changes. 

---

## Required Apps Script Data Functions

Some functions already exist. Others should be added or consolidated.

### Existing foundation

```javascript
getInventoryItem(productId, locationId)
getCartInventory(locationId)
```

### Required for the new views

```javascript
getProducts()
getProduct(productId)
getProductInventory(productId)
getInventoryHistory(productId, locationId)
getRecentInventoryEvents(limit)
getCurrentSds(productId)
getSdsDirectory()
getLocation(locationId)
```

These functions should return structured objects. HTML files should display the returned information rather than directly reading spreadsheet cells.

---

## Navigation Standard

Every view should include consistent navigation:

```text
Home
Inventory
Products
SDS
History
```

Operational actions may appear separately:

```text
Receive Supplies
Record Inventory Change
```

Navigation should be generated consistently so one view does not become isolated from the rest of the application.

---

## Development Order

Build and test one vertical path at a time.

### Step 1 — Protect the existing working view

* preserve the current `InventoryView.html`;
* preserve **Use One**;
* record any regression as a GitHub bug issue;
* verify the inventory route before continuing.

### Step 2 — Add routing and Home View

* update `doGet(e)`;
* create `HomeView.html`;
* make Home the default;
* verify `?view=inventory` still displays the working inventory view.

### Step 3 — Build Product View first

* create `getProduct(productId)`;
* create `getProductInventory(productId)`;
* connect product and SDS data;
* create `ProductView.html`;
* test it with at least two different product IDs.

This is the most important reusable-template test.

### Step 4 — Build Product Directory

* create `getProducts()`;
* display product cards;
* link every card to Product View;
* verify that one template serves all products.

### Step 5 — Build SDS Directory

* read active SDS records;
* display official links and dates;
* link each record to Product View.

### Step 6 — Build History View

* read accepted Inventory Events;
* translate IDs into product and location names;
* display recent events clearly;
* confirm rejected submissions do not appear.

### Step 7 — Standardize navigation and presentation

* add the same navigation to every view;
* test mobile readability;
* test links and back navigation;
* confirm no existing function disappeared during file replacement.

---

## Regression-Control Rule

Every meaningful failure introduced after a change should become a GitHub Issue when it requires investigation or could be forgotten.

Example:

```text
After adding routing, the home screen disappeared.
```

That should be recorded as:

```text
Type: Bug
Affected milestone: Milestone 7
Affected component: doGet routing / HomeView
```

The issue is fixed and tested without changing the roadmap’s main position.

Small immediately corrected typing mistakes do not require issues. Broken views, routing failures, missing actions, incorrect data, and regressions do.

---

## Testing Requirements

Each view must be tested independently.

### Home View

* base URL opens Home;
* all navigation links work;
* operational form links work.

### Inventory View

* live quantities match Current Inventory;
* product names and units are correct;
* **Use One** still works;
* quantity cannot become negative;
* Product View links use the correct IDs.

### Product Directory

* all active products appear;
* product images load;
* every card opens the correct product.

### Product View

* at least two different products display correctly;
* current inventory is correct;
* exact SDS information is correct;
* recent events belong to the selected product;
* missing or unknown IDs fail safely.

### History View

* accepted events appear;
* names replace raw IDs where practical;
* notes remain readable;
* failed form submissions do not appear.

### SDS Directory

* each link opens the correct official SDS;
* product names and manufacturers match;
* revision and verification dates display correctly.

---

## Milestone 7 Completion Test

Milestone 7 is complete when:

1. the base URL opens a Home View;
2. the existing Inventory View still works;
3. Product Directory lists the active products;
4. one reusable Product View displays different products based on `product_id`;
5. History View displays accepted Inventory Events;
6. SDS Directory links products to their exact manufacturer SDS records;
7. every view is reachable through consistent navigation;
8. the views work on a phone;
9. no Milestone 6 inventory-processing behavior has regressed.

The decisive original roadmap test remains:

> The same Product View template displays every product based on its ID. 

## Current Status

```text
Milestone 6: Complete

Milestone 7:
Inventory View foundation: working
Routing: not yet built
Home View: not yet built
Product Directory: not yet built
Reusable Product View: not yet built
History View: not yet built
SDS Directory: not yet built
Consistent navigation: not yet built
```

The first Milestone 7 change should be **routing plus `HomeView.html`**, while protecting the existing working Inventory View.
