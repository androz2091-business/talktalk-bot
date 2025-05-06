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
  const range = 'Hoja 1!A3:D'; // ['Name', 'e-mail', 'Number of classes', 'Date']

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
  
    const name = rowData['Name']?.trim();
    const email = rowData['E-mail']?.trim();
    const packStr = rowData['Number of classes']?.trim();
    const expDateStr = rowData['Date']?.trim();
  
    const pack = parseInt(packStr);
    const expDate = dayjs(expDateStr, ['D/M/YY', 'D/M/YYYY', 'YYYY-MM-DD'], true);
  
    if (!email || Number.isNaN(pack) || !expDateStr) continue;
    if (!expDate.isValid() || expDate.isBefore(today)) continue;
  
    validClients.push({
      name,
      email,
      currentPack: pack,
      expirationDate: expDate.format('YYYY-MM-DD'),
    });
  }  

  return validClients;
}

module.exports = readSheet;
