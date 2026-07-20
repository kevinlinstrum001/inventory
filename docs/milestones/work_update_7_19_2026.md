## IV. Embedded Apps Script Navigation Troubleshooting

### A. Navigation instability discovered

After the individual Apps Script views were created, navigation between them did not behave consistently when the web application was embedded in another page.

The problem was not the route map itself. Directly opening URLs such as:

```text
?view=home
?view=inventory
?view=products
?view=sds
```

could load the correct view, but links clicked from inside an embedded Apps Script page were unreliable.

Observed behavior included:

* navigation working in one context but failing in another;
* links opening inside the wrong frame;
* the embedded area appearing blank or failing to replace the current view;
* navigation behaving differently when the web app was opened directly versus embedded;
* attempts to correct the problem with `_top` or `_parent` targets producing inconsistent results;
* repeated navigation making the embedded application appear unstable.

This created an important distinction:

```text
Routing worked
≠
navigation between embedded views worked reliably
```

The server could correctly map a URL to an HTML file, but the browser still needed a reliable way to leave the current Apps Script frame and request the next complete web-app URL.

### B. Cause isolated to the embedded-frame environment

Apps Script HTML pages run inside a sandboxed frame. When that web app is itself embedded in another page, the browser may be dealing with more than one frame level.

The effective structure can resemble:

```text
Host page
└── embedded Apps Script web app
    └── sandboxed Apps Script HTML view
```

A relative link such as:

```html
<a href="?view=inventory">Inventory</a>
```

depends on the browser resolving that link from the correct document and frame.

Likewise, navigation targets such as:

```html
target="_top"
```

or:

```html
target="_parent"
```

depend on which frame the browser considers the parent or top-level document. Their behavior can therefore change depending on whether the app is:

* opened directly;
* running through the Apps Script development URL;
* running through the deployed URL;
* embedded in another site or page.

This explained why the individual pages and routes could work while the application still appeared unstable during normal navigation.

Apps Script pages also require special handling when reading URL parameters. The reusable Product View reads its selected product through:

```javascript
google.script.url.getLocation(function(location) {
  const productId = location.parameter.id;
});
```

This avoids assuming that the sandboxed HTML document can always read the outer web-app URL in the same way as a conventional page.

### C. Relative-link approaches tested

Several link structures were tested during troubleshooting.

#### Relative route with `_top`

```html
<a href="?view=sds" target="_top">
  SDS Directory
</a>
```

#### Absolute application URL with `_parent`

```html
<a
  href="<?= appUrl ?>?view=sds"
  target="_parent"
>
  SDS Directory
</a>
```

#### Absolute application URL without relying on a relative route

```html
<a href="<?= appUrl ?>?view=sds">
  SDS Directory
</a>
```

The existence of separate navigation-fixed versions of the Home, Inventory, Product Directory, Product View, and SDS Directory records this troubleshooting stage. Those versions replaced locally interpreted route links with links built from a common `appUrl`.

### D. Shared `appUrl` solution implemented

The stable solution was to have the Apps Script server provide the full web-application base URL to every HTML template.

Conceptually:

```javascript
function doGet(e) {
  const template = HtmlService.createTemplateFromFile(viewFile);

  template.appUrl = ScriptApp.getService().getUrl();

  return template.evaluate();
}
```

Each page then constructs its navigation links from the same base URL:

```html
<a href="<?= appUrl ?>?view=home">Home</a>
<a href="<?= appUrl ?>?view=products">Products</a>
<a href="<?= appUrl ?>?view=inventory">Inventory</a>
<a href="<?= appUrl ?>?view=sds">SDS Directory</a>
```

Product links can use the same pattern while adding a stable product ID:

```html
<a
  href="<?= appUrl ?>?view=product&id=CHEM-001"
>
  Open product
</a>
```

The resulting navigation flow is:

```text
User clicks navigation link
→ browser receives a complete Apps Script web-app URL
→ doGet(e) receives the new view parameter
→ route map selects the correct HTML file
→ the complete destination view is rendered
```

The link no longer depends on the embedded page correctly resolving:

```text
?view=...
```

against its current frame URL.

### E. Navigation standardized across views

The same application URL and route names were added to the navigation bars in:

* `HomeView.html`;
* `InventoryView.html`;
* `ProductDirectoryView.html`;
* `ProductView.html`;
* `SdsDirectoryView.html`.

Each page now uses the same primary destinations:

```text
Home
Products
Inventory
SDS Directory
```

The active view is visually identified, while the route names remain consistent with the server route map.

The completed Milestone 7 status record confirms that routing and shared `appUrl` navigation now work across the existing views.

### F. Troubleshooting result

The important result was not merely a change to the appearance of the navigation bar. The work established a stable boundary between the embedded interface and the Apps Script router.

Before:

```text
embedded HTML view
→ relative link
→ uncertain frame resolution
→ inconsistent navigation
```

After:

```text
embedded HTML view
→ complete shared appUrl
→ Apps Script deployment
→ doGet(e)
→ route map
→ requested view
```

### G. Architectural lesson preserved

The troubleshooting established several rules for the remainder of the project:

1. **Do not assume that a relative URL will behave normally inside an Apps Script sandbox or nested embed.**

2. **Treat routing and navigation as separate systems.**

   * Routing determines which view the server returns.
   * Navigation determines whether the browser successfully requests that route.

3. **Generate navigation from one shared application base URL.**

   * Do not manually copy deployment URLs into every page.
   * Do not allow different views to invent different navigation methods.

4. **Test views in their actual deployment context.**

   * A page that works directly may still fail when embedded.

5. **Use Apps Script URL tools for parameters needed inside sandboxed pages.**

   * For example, use `google.script.url.getLocation()` for the Product View’s `id` parameter.

6. **Retest every route from every view after changing navigation.**

   * A successful Home-to-Inventory link does not prove that Inventory-to-SDS or Product-to-Home works.

### H. Verification completed

The following behavior was verified:

* Home loads through the shared route system;
* Products loads through the shared route system;
* Product detail loads through the shared route system;
* Inventory loads through the shared route system;
* SDS Directory loads through the shared route system;
* navigation is available across all existing views;
* each view uses the common application URL;
* existing Inventory View behavior remains functional;
* Product View URL parameters continue to identify the correct product;
* SDS Directory data and links continue to work after navigation changes.

Current result:

```text
Routing: Complete
Shared navigation: Complete
Embedded navigation instability: Resolved
```

The project status now records shared navigation as complete alongside the existing Home, Inventory, Product, and SDS views.
