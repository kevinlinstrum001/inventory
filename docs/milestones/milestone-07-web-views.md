# Milestone 7 — <span style="color:cyan">Web Views</span>

> [!IMPORTANT]
> This document tracks Milestone 7 from routing setup through verified completion.

## Status

| Area | Status |
|---|---|
| Routing | Complete |
| Product Directory | In progress |
| Product Detail View | In progress |
| History View | Not started |
| SDS Directory | Not started |

## Table of Contents

- [Milestone 7 — Web Views](#milestone-7--web-views)
  - [Status](#status)
  - [Table of Contents](#table-of-contents)
  - [Purpose](#purpose)
  - [Architecture](#architecture)
  - [Routing](#routing)
  - [Product Directory View](#product-directory-view)
  - [Product View](#product-view)
    - [Route](#route)
    - [Reading the Product ID](#reading-the-product-id)
    - [Data Functions](#data-functions)
  - [Adding Inventory-by-location Section](#adding-inventory-by-location-section)
    - [Data Flow](#data-flow)
    - [Client-Side Call](#client-side-call)
    - [Page Structure](#page-structure)
    - [Rendering Function](#rendering-function)
    - [Quantity Formatting](#quantity-formatting)
    - [Suggested Styling](#suggested-styling)
    - [Verification](#verification)
    - [Verification](#verification-1)
  - [SDS Directory View](#sds-directory-view)
  - [Inventory History View](#inventory-history-view)
  - [Testing and Completion](#testing-and-completion)
  - [Decisions and Future Improvements](#decisions-and-future-improvements)

---

## Purpose

This document records the development of Milestone 7 from its initial structure through verified completion. It is intended to preserve, to a reasonable level of detail, what was built, why particular decisions were made, how the implementation was tested, and what was learned during the process.

The document serves several connected purposes:

- improve Kevin’s understanding of the code, data flow, routing, and interface structure;
- create an organized record of the work completed;
- preserve explanations and decisions that would otherwise be lost after the immediate task;
- strengthen documentation habits and general technical skills;
- make later troubleshooting, revision, and continuation easier;
- distinguish working behavior, planned behavior, and future improvements.

For Milestone 7 specifically, this document will track the creation of the reusable web views, the routing system that selects them, the data functions each view uses, the tests performed, any problems encountered, and the evidence used to determine that the milestone is complete.

The goal is not to record every keystroke or temporary mistake. The goal is to preserve enough of the process that the implementation can be understood, maintained, explained, and extended later.

## Architecture

```text
URL
→ doGet(e)
→ route lookup
→ HTML view
→ server data function
→ rendered page
```

## Routing

The web app uses the `view` URL parameter to decide which Apps Script HTML file to load.

Current route map:

```javascript
const routes = {
  home: 'HomeView',
  inventory: 'InventoryView',
  products: 'ProductDirectoryView',
  product: 'ProductView',
};
```

The route name is the public URL value. The mapped value is the internal Apps Script HTML filename.

Example:

```text
?view=product
→ routes["product"]
→ ProductView
→ ProductView.html
```

Unknown route values fall back safely to `HomeView`.

## Product Directory View

The Product Directory View will display all active product definitions and provide a path into the reusable Product View.

Planned route:

```text
?view=products
```

Planned server function:

```javascript
getProducts()
```

The directory should eventually display:

- product image;
- product name;
- manufacturer;
- category;
- container size;
- current quantity where appropriate;
- SDS availability;
- a link to the full product record.

The initial implementation should use a simple card layout. Search and filtering should be added only after the basic directory works.

## Product View

`ProductView.html` is the central completion requirement for Milestone 7.

One reusable template should display any product based on its stable `product_id`. There should not be a separate HTML file for every product.

### <span style="color:cyan">Route</span>

```text
?view=product&id=CHEM-001
```

The `view` parameter selects the reusable HTML template:

```text
view=product
→ ProductView.html
```

The `id` parameter selects the product record displayed by that template:

```text
id=CHEM-001
→ product_id CHEM-001
```

The router in `doGet(e)` maps the public route name to the internal Apps Script HTML filename:

```javascript
const routes = {
  home: 'HomeView',
  inventory: 'InventoryView',
  products: 'ProductDirectoryView',
  product: 'ProductView',
};
```

All of these routes should use the same `ProductView.html` file:

```text
?view=product&id=CHEM-001
?view=product&id=CHEM-004
?view=product&id=PAPER-001
```

### <span style="color:cyan">Reading the Product ID</span>

Because Apps Script HTML pages run inside a sandboxed frame, the Product View reads the web-app URL through the Apps Script URL API:

```javascript
google.script.url.getLocation(function(location) {
  const productId = location.parameter.id;
});
```

The `location` object contains information about the current web-app URL.

For this route:

```text
?view=product&id=CHEM-001
```

the relevant value is:

```javascript
location.parameter.id
// "CHEM-001"
```

The complete flow is:

```text
URL contains id=CHEM-001
→ location.parameter.id
→ productId = "CHEM-001"
→ getProduct("CHEM-001")
→ matching product record returned
→ ProductView.html renders the record
```

### <span style="color:cyan">Data Functions</span>

| Function | Responsibility |
|---|---|
| `getProduct(productId)` | Returns the normalized product definition |
| `getCurrentInventory()` | Returns current quantities by tracked location |
| `getCurrentSds(productId)` | Returns the current SDS record |
| `getInventoryHistory(productId)` | Returns recent inventory events |

The completed Product View is expected to combine:

- product name;
- product ID;
- manufacturer;
- manufacturer product code;
- category;
- container size;
- inventory unit;
- product image;
- manufacturer product-page link;
- current quantity by tracked location;
- current manufacturer SDS;
- SDS revision date;
- SDS verification date;
- recent inventory events for that product.

Now to remove the current placeholder HTML and replace with the first real version of `ProductView.html` while still using only `getProduct(productId)`.

Replace it with this:

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 24px;
        font-family: Arial, sans-serif;
        background: #f4f6f8;
        color: #17202a;
      }

      main {
        max-width: 900px;
        margin: 0 auto;
      }

      .product-card {
        display: grid;
        grid-template-columns: minmax(220px, 320px) 1fr;
        gap: 28px;
        padding: 24px;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }

      .product-image {
        width: 100%;
        min-height: 280px;
        object-fit: contain;
        background: #f7f9fb;
        border-radius: 14px;
        padding: 16px;
      }

      .product-image-placeholder {
        display: grid;
        place-items: center;
        min-height: 280px;
        padding: 24px;
        background: #f7f9fb;
        border-radius: 14px;
        color: #667085;
        text-align: center;
      }

      h1 {
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 2rem;
      }

      .product-id {
        margin-bottom: 24px;
        color: #667085;
        font-family: monospace;
      }

      .details {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 12px 20px;
        margin: 0;
      }

      .details dt {
        font-weight: 700;
      }

      .details dd {
        margin: 0;
      }

      .manufacturer-link {
        display: inline-block;
        margin-top: 24px;
        padding: 12px 18px;
        border-radius: 10px;
        background: #246482;
        color: #ffffff;
        text-decoration: none;
        font-weight: 700;
      }

      .status-message {
        padding: 24px;
        background: #ffffff;
        border-radius: 14px;
      }

      @media (max-width: 700px) {
        body {
          padding: 14px;
        }

        .product-card {
          grid-template-columns: 1fr;
          padding: 18px;
        }

        .details {
          grid-template-columns: 1fr;
          gap: 4px;
        }

        .details dd {
          margin-bottom: 12px;
        }
      }
    </style>
  </head>

  <body>
    <main id="product-page">
      <section class="status-message">
        Loading product...
      </section>
    </main>

    <script>
      const productPage = document.getElementById('product-page');

      google.script.url.getLocation(function(location) {
        const productId = location.parameter.id;

        console.log('Product ID:', productId);

        if (!productId) {
          showError({
            message: 'No product ID was provided in the URL.'
          });
          return;
        }

        google.script.run
          .withSuccessHandler(renderProduct)
          .withFailureHandler(showError)
          .getProduct(productId);
      });

      function renderProduct(product) {
        if (!product) {
          showError({
            message: 'No matching product was found.'
          });
          return;
        }

        const imageMarkup = product.imageUrl
          ? `
            <img
              class="product-image"
              src="${escapeHtml(product.imageUrl)}"
              alt="${escapeHtml(product.productName)}"
            >
          `
          : `
            <div class="product-image-placeholder">
              No product image available
            </div>
          `;

        const manufacturerLink = product.manufacturerPageUrl
          ? `
            <a
              class="manufacturer-link"
              href="${escapeHtml(product.manufacturerPageUrl)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open manufacturer product page
            </a>
          `
          : '';

        productPage.innerHTML = `
          <article class="product-card">
            <div>
              ${imageMarkup}
            </div>

            <section>
              <h1>${escapeHtml(product.productName)}</h1>

              <div class="product-id">
                ${escapeHtml(product.productId)}
              </div>

              <dl class="details">
                <dt>Manufacturer</dt>
                <dd>${displayValue(product.manufacturer)}</dd>

                <dt>Manufacturer code</dt>
                <dd>${displayValue(product.productCode)}</dd>

                <dt>Category</dt>
                <dd>${displayValue(product.category)}</dd>

                <dt>Container size</dt>
                <dd>${displayValue(product.containerSize)}</dd>

                <dt>Inventory unit</dt>
                <dd>${displayValue(product.inventoryUnit)}</dd>
              </dl>

              ${manufacturerLink}
            </section>
          </article>
        `;
      }

      function showError(error) {
        const message =
          error && error.message
            ? error.message
            : 'An unknown error occurred.';

        productPage.innerHTML = `
          <section class="status-message">
            <h1>Unable to load product</h1>
            <p>${escapeHtml(message)}</p>
          </section>
        `;
      }

      function displayValue(value) {
        return value
          ? escapeHtml(value)
          : 'Not provided';
      }

      function escapeHtml(value) {
        return String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
    </script>
  </body>
</html>
```

This completes the first real Product View section:

```text
product name
product ID
manufacturer
manufacturer code
category
container size
inventory unit
product image
manufacturer page link
loading state
error state
```

After saving, test the same two routes again:

```text
/dev?view=product&id=CHEM-001
/dev?view=product&id=PAPER-002
```

The same page should render both records with their complete identifying information.

## <span style="color:cyan">Adding Inventory-by-location Section</span>


The next Product View requirement is to show the selected product’s current quantity at every tracked location.

The page already knows the selected product ID:

```javascript
const productId = location.parameter.id;
````

The existing server function:

```javascript
getCurrentInventory(locationId)
```

returns normalized inventory records. When called without a location ID, it returns records from all tracked locations.

The Product View can therefore:

```text
read the current product ID
→ request all current inventory records
→ keep only records whose productId matches
→ display each location and quantity
```

### Data Flow

```text
?view=product&id=CHEM-001
→ productId = "CHEM-001"
→ getCurrentInventory()
→ filter rows by productId
→ render inventory by location
```

### Client-Side Call

After the main product record loads, call the existing inventory function:

```javascript
google.script.run
  .withSuccessHandler(function(inventory) {
    const matchingInventory = inventory.filter(function(item) {
      return item.productId === productId;
    });

    renderInventoryByLocation(matchingInventory);
  })
  .withFailureHandler(showError)
  .getCurrentInventory();
```

The `productId` variable must remain available to this callback. A simple approach is to define it outside the `getLocation()` callback:

```javascript
let currentProductId = '';
```

Then assign it when the URL is read:

```javascript
google.script.url.getLocation(function(location) {
  currentProductId = location.parameter.id;
});
```

The inventory filter can then use:

```javascript
item.productId === currentProductId
```

### Page Structure

Add an inventory section beneath the main product card:

```html
<section class="detail-section">
  <h2>Inventory by Location</h2>
  <div id="inventory-by-location">
    <p>Loading inventory...</p>
  </div>
</section>
```

### Rendering Function

```javascript
function renderInventoryByLocation(items) {
  const inventoryContainer =
    document.getElementById('inventory-by-location');

  if (!items || items.length === 0) {
    inventoryContainer.innerHTML = `
      <p>No inventory is currently recorded for this product.</p>
    `;
    return;
  }

  inventoryContainer.innerHTML = items
    .map(function(item) {
      return `
        <article class="inventory-location">
          <div>
            <strong>${escapeHtml(item.locationName)}</strong>
            <div class="secondary-text">
              ${escapeHtml(item.locationId)}
            </div>
          </div>

          <div class="inventory-quantity">
            ${formatQuantity(item.quantity, item.unit)}
          </div>
        </article>
      `;
    })
    .join('');
}
```

### Quantity Formatting

```javascript
function formatQuantity(quantity, unit) {
  const numericQuantity = Number(quantity) || 0;
  const safeUnit = escapeHtml(unit || 'item');

  const displayedUnit =
    numericQuantity === 1
      ? safeUnit
      : pluralizeUnit(safeUnit);

  return `${numericQuantity} ${displayedUnit}`;
}

function pluralizeUnit(unit) {
  if (unit.endsWith('s')) {
    return unit;
  }

  return `${unit}s`;
}
```

This basic pluralization is sufficient for the current inventory units. It can later be replaced with a more complete formatter if irregular unit names are introduced.

### Suggested Styling

```css
.detail-section {
  margin-top: 24px;
  padding: 24px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.detail-section h2 {
  margin-top: 0;
}

.inventory-location {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.inventory-location:last-child {
  border-bottom: 0;
}

.inventory-quantity {
  font-size: 1.2rem;
  font-weight: 700;
  white-space: nowrap;
}

.secondary-text {
  margin-top: 4px;
  color: #667085;
  font-size: 0.875rem;
}
```

### Verification

* [x] Product View calls `getCurrentInventory()`
* [x] Inventory records are filtered by the selected `productId`
* [x] Every matching tracked location is displayed
* [x] Each location shows the correct quantity and inventory unit
* [x] A product with no current inventory shows a clear empty state
* [x] Existing Product View identity information remains intact

```
```


<hr>

### <span style="color:cyan">Verification</span>

- [x] `?view=product` loads `ProductView.html`
- [x] The page reads the `id` parameter from the web-app URL
- [x] `getProduct(productId)` returns the matching product
- [x] Different IDs display different records through the same template
- [x] `CHEM-001` displayed its matching chemical product
- [x] `PAPER-002` displayed C-Fold tissue
- [x] Product image and complete identifying information added
- [x] Inventory-by-location section added
- [ ] Current SDS section added
- [ ] Recent inventory-events section added

## SDS Directory View

Planned route:

```text
?view=sds
```

Planned file:

```text
SdsDirectoryView.html
```

This section will track the creation of the SDS directory, the data displayed for each product, and the tests used to confirm current SDS records are shown correctly.

## Inventory History View

Planned route:

```text
?view=history
```

Planned file:

```text
HistoryView.html
```

This section will track the creation of the inventory history interface, its filtering behavior, its data sources, and its verification tests.



## Testing and Completion

Milestone 7 will be considered complete when:

- all required routes load the intended HTML views;
- the Product Directory displays active products;
- the reusable Product View displays different products from the same template;
- inventory quantities by location are shown correctly;
- current SDS information is displayed correctly;
- recent product history is displayed correctly;
- the History View works;
- the SDS Directory View works;
- navigation is consistent across views;
- existing Inventory View behavior remains intact;
- accepted functionality is verified through repeatable tests.

The decisive Product View test is:

```text
The same ProductView.html template displays multiple products correctly
when only the id parameter changes.
```

## Decisions and Future Improvements

Future improvements should be recorded here when they are identified but are not required for Milestone 7 completion.

Examples may include:

- shared CSS partials;
- shared navigation;
- search and filtering;
- richer dashboard elements;
- improved error handling;
- loading indicators;
- route-specific page titles;
- additional product actions;
- accessibility improvements;
- technical logging;
- issue references and commit links.
