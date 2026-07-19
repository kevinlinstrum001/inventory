const INVENTORY_SPREADSHEET_ID = '1w64dwKNUsVAkcpT1WqrRDcRTfXFlhR25gszIbT952IA';

function processReceivedInventory(e) {
  if (!e || !e.namedValues) {
    throw new Error(
      'This function must run from a spreadsheet form-submit trigger.'
    );
  }

  const response = e.namedValues;

  const timestamp = firstValue_(response['Timestamp']);
  const productName = firstValue_(
    response['Select product being received']
  );
  const quantity = Number(firstValue_(response['Quantity']));
  const destinationName = firstValue_(response['Destination']);
  const condition = firstValue_(response['Condition']);
  const notes = firstValue_(response['Notes']);

  if (!productName || !destinationName || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('The form response contains invalid product, location, or quantity data.');
  }

  const inventoryFile =
    SpreadsheetApp.openById(INVENTORY_SPREADSHEET_ID);

  const productsSheet = inventoryFile.getSheetByName('Products');
  const locationsSheet = inventoryFile.getSheetByName('Locations');
  const inventorySheet = inventoryFile.getSheetByName('Current Inventory');
  const eventsSheet = inventoryFile.getSheetByName('Inventory Events');

  if (!productsSheet || !locationsSheet || !inventorySheet || !eventsSheet) {
    throw new Error('One or more required inventory tabs are missing.');
  }

  const productId = findIdByName_(productsSheet, 1, 2, productName);
  const locationId = findIdByName_(locationsSheet, 1, 2, destinationName);

  if (!productId) {
    throw new Error(`Product not found in Products sheet: ${productName}`);
  }

  if (!locationId) {
    throw new Error(`Location not found in Locations sheet: ${destinationName}`);
  }

  const inventoryUnit =
    findValueById_(productsSheet, 1, 7, productId) || 'item';

  updateCurrentInventory_(
    inventorySheet,
    productId,
    locationId,
    quantity,
    inventoryUnit,
    timestamp
  );

  appendInventoryEvent_(
    eventsSheet,
    timestamp,
    productId,
    quantity,
    locationId,
    condition,
    notes
  );
}

function findIdByName_(sheet, idColumn, nameColumn, targetName) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return null;
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, Math.max(idColumn, nameColumn))
    .getValues();

  const normalizedTarget = String(targetName).trim().toLowerCase();

  for (const row of values) {
    const name = String(row[nameColumn - 1]).trim().toLowerCase();

    if (name === normalizedTarget) {
      return row[idColumn - 1];
    }
  }

  return null;
}

function findValueById_(sheet, idColumn, valueColumn, targetId) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return '';
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, Math.max(idColumn, valueColumn))
    .getValues();

  const normalizedTarget = String(targetId).trim();

  for (const row of values) {
    if (String(row[idColumn - 1]).trim() === normalizedTarget) {
      return String(row[valueColumn - 1] || '').trim();
    }
  }

  return '';
}

function updateCurrentInventory_(
  sheet,
  productId,
  locationId,
  quantityReceived,
  inventoryUnit,
  timestamp
) {
  const lastRow = sheet.getLastRow();

  if (lastRow >= 2) {
    const values = sheet
      .getRange(2, 1, lastRow - 1, 6)
      .getValues();

    for (let index = 0; index < values.length; index += 1) {
      const row = values[index];

      if (row[1] === productId && row[2] === locationId) {
        const existingQuantity = Number(row[3]) || 0;
        const sheetRow = index + 2;

        sheet.getRange(sheetRow, 4).setValue(
          existingQuantity + quantityReceived
        );
        sheet.getRange(sheetRow, 6).setValue(
          new Date(timestamp)
        );

        return;
      }
    }
  }

  const inventoryId = createId_('INV');

  sheet.appendRow([
    inventoryId,
    productId,
    locationId,
    quantityReceived,
    inventoryUnit || 'item',
    new Date(timestamp),
  ]);
}

function appendInventoryEvent_(
  sheet,
  timestamp,
  productId,
  quantity,
  locationId,
  condition,
  notes
) {
  const eventId = createId_('EVT');

  const combinedNotes = [
    condition ? `Condition: ${condition}` : '',
    notes || '',
  ]
    .filter(Boolean)
    .join(' — ');

  sheet.appendRow([
    eventId,
    new Date(timestamp),
    'RECEIVED',
    productId,
    quantity,
    'OUTSIDE_SYSTEM',
    locationId,
    'Form submission',
    combinedNotes,
  ]);
}

function createId_(prefix) {
  const shortId = Utilities.getUuid()
    .replace(/-/g, '')
    .slice(0, 8)
    .toUpperCase();

  return `${prefix}-${shortId}`;
}

function firstValue_(value) {
  return Array.isArray(value) ? value[0] : value;
}

function useOneProduct(productId, locationId) {
  const inventoryFile =
    SpreadsheetApp.openById(INVENTORY_SPREADSHEET_ID);

  const inventorySheet =
    inventoryFile.getSheetByName('Current Inventory');

  const eventsSheet =
    inventoryFile.getSheetByName('Inventory Events');

  const lastRow = inventorySheet.getLastRow();

  if (lastRow < 2) {
    throw new Error('No inventory records exist.');
  }

  const values = inventorySheet
    .getRange(2, 1, lastRow - 1, 6)
    .getValues();

  for (let index = 0; index < values.length; index += 1) {
    const row = values[index];

    if (row[1] === productId && row[2] === locationId) {
      const currentQuantity = Number(row[3]) || 0;

      if (currentQuantity < 1) {
        throw new Error('No inventory is available to use.');
      }

      const sheetRow = index + 2;
      const timestamp = new Date();

      eventsSheet.appendRow([
        createId_('EVT'),
        timestamp,
        'USED_UP',
        productId,
        1,
        locationId,
        'OUTSIDE_SYSTEM',
        'Inventory view',
        'One container used up',
      ]);

      inventorySheet
        .getRange(sheetRow, 4)
        .setValue(currentQuantity - 1);

      inventorySheet
        .getRange(sheetRow, 6)
        .setValue(timestamp);

      return {
        success: true,
        previousQuantity: currentQuantity,
        newQuantity: currentQuantity - 1,
      };
    }
  }

  throw new Error(
    `Inventory record not found for ${productId} at ${locationId}`
  );
}

function testUseOne() {
  const result = useOneProduct(
    'CHEM-001',
    'LOC-CART-01'
  );

  console.log(result);
}

function doGet(e) {
  const routes = {
    home: 'HomeView',
    products: 'ProductDirectoryView',
    inventory: 'InventoryView',
    product: 'ProductView',
    sds: 'SdsDirectoryView',
  };

  const view = String(
    e && e.parameter && e.parameter.view
      ? e.parameter.view
      : 'home'
  ).toLowerCase();

  const fileName = routes[view] || routes.home;

  return HtmlService
    .createHtmlOutputFromFile(fileName)
    .setTitle('Klinswork Inventory')
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}

function getInventoryItem(productId, locationId) {
  const inventoryFile =
    SpreadsheetApp.openById(INVENTORY_SPREADSHEET_ID);

  const inventorySheet =
    inventoryFile.getSheetByName('Current Inventory');

  const productsSheet =
    inventoryFile.getSheetByName('Products');

  const inventoryLastRow = inventorySheet.getLastRow();

  if (inventoryLastRow < 2) {
    throw new Error('No inventory records exist.');
  }

  const inventoryValues = inventorySheet
    .getRange(2, 1, inventoryLastRow - 1, 6)
    .getValues();

  let inventoryRecord = null;

  for (const row of inventoryValues) {
    if (row[1] === productId && row[2] === locationId) {
      inventoryRecord = row;
      break;
    }
  }

  if (!inventoryRecord) {
    throw new Error(
      `Inventory record not found for ${productId} at ${locationId}`
    );
  }

  const productsLastRow = productsSheet.getLastRow();

  if (productsLastRow < 2) {
    throw new Error('No product definitions exist.');
  }

  const productValues = productsSheet
    .getRange(2, 1, productsLastRow - 1, 10)
    .getValues();

  let productRecord = null;

  for (const row of productValues) {
    if (row[0] === productId) {
      productRecord = row;
      break;
    }
  }

  if (!productRecord) {
    throw new Error(`Product definition not found: ${productId}`);
  }

  return {
    inventoryId: String(inventoryRecord[0]),
    productId: String(inventoryRecord[1]),
    locationId: String(inventoryRecord[2]),
    quantity: Number(inventoryRecord[3]) || 0,
    unit: String(productRecord[6] || inventoryRecord[4] || 'item'),
    lastUpdated: inventoryRecord[5] instanceof Date
      ? inventoryRecord[5].toISOString()
      : String(inventoryRecord[5] || ''),
    productName: String(productRecord[1] || ''),
    manufacturer: String(productRecord[2] || ''),
    productCode: String(productRecord[3] || ''),
    category: String(productRecord[4] || ''),
    containerSize: String(productRecord[5] || ''),
    inventoryUnit: String(productRecord[6] || 'item'),
    imageUrl: getImageUrl(productRecord[7]),
    manufacturerPageUrl: String(productRecord[8] || ''),
  };
}

function getCartInventory(locationId) {
  const inventoryFile =
    SpreadsheetApp.openById(INVENTORY_SPREADSHEET_ID);

  const inventorySheet =
    inventoryFile.getSheetByName('Current Inventory');

  const productsSheet =
    inventoryFile.getSheetByName('Products');

  if (!inventorySheet || !productsSheet) {
    throw new Error('Required inventory sheets are missing.');
  }

  const inventoryLastRow = inventorySheet.getLastRow();
  const productsLastRow = productsSheet.getLastRow();

  if (inventoryLastRow < 2) {
    return [];
  }

  const inventoryValues = inventorySheet
    .getRange(2, 1, inventoryLastRow - 1, 6)
    .getValues();

  const productValues = productsLastRow >= 2
    ? productsSheet
        .getRange(2, 1, productsLastRow - 1, 10)
        .getValues()
    : [];

  const productsById = {};

  for (const row of productValues) {
    const productId = String(row[0] || '');

    if (!productId) {
      continue;
    }

    productsById[productId] = {
      productName: String(row[1] || productId),
      manufacturer: String(row[2] || ''),
      productCode: String(row[3] || ''),
      category: String(row[4] || ''),
      containerSize: String(row[5] || ''),
      inventoryUnit: String(row[6] || 'item'),
      imageUrl: getImageUrl(row[7]),
      manufacturerPageUrl: String(row[8] || ''),
    };
  }

  const results = [];

  for (const row of inventoryValues) {
    const rowLocationId = String(row[2] || '');

    if (rowLocationId !== locationId) {
      continue;
    }

    const productId = String(row[1] || '');
    const product = productsById[productId] || {};

    results.push({
      inventoryId: String(row[0] || ''),
      productId,
      locationId: rowLocationId,
      quantity: Number(row[3]) || 0,
      unit: String(product.inventoryUnit || row[4] || 'item'),
      lastUpdated: row[5] instanceof Date
        ? row[5].toISOString()
        : String(row[5] || ''),
      productName: product.productName || productId,
      manufacturer: product.manufacturer || '',
      productCode: product.productCode || '',
      category: product.category || '',
      containerSize: product.containerSize || '',
      imageUrl: product.imageUrl || '',
      manufacturerPageUrl:
        product.manufacturerPageUrl || '',
    });
  }

  results.sort((a, b) =>
    a.productName.localeCompare(b.productName)
  );

  return results;
}

const IMAGE_BASE_URL =
  'https://raw.githubusercontent.com/kevinlinstrum001/inventory/main/';

function getImageUrl(value) {
  const text = String(value || '').trim();

  if (!text) return '';

  if (/^https?:\/\//i.test(text)) {
    return text;
  }

  return IMAGE_BASE_URL + text.replace(/^\/+/, '');
}
