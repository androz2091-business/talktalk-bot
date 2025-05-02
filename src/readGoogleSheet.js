const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const keyFile = path.join(__dirname, '..', 'service-account.json');
const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function readSheet() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = '19xh1to9QBLTzaDWYQ6AYgiUfmWV-t5KlFxl1QsY7SnY';
  const range = 'Hoja 1!A1:D33'; // A: Name, B: Email, C: Current pack, D: Expiration Date

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);
  const today = dayjs();

  const validClients = [];

  for (const row of dataRows) {
    const rowData = {};
    headers.forEach((header, idx) => {
      rowData[header] = row[idx];
    });

    const expDateStr = rowData['Expiration Date'];
    const packStr = rowData['Current pack'];

    // Skip if expiration date or pack missing
    if (!expDateStr || !packStr) continue;

    const expDate = dayjs(expDateStr, 'D/M/YY');
    if (!expDate.isValid() || expDate.isBefore(today)) continue;

    rowData['Current pack'] = parseInt(packStr);
    rowData['Expiration Date'] = expDate.format('YYYY-MM-DD');

    validClients.push(rowData);
  }

  console.log('✅ Valid Clients (not expired):');
  console.log(validClients);
}

readSheet().catch(console.error);
