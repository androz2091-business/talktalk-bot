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

const parseExpDate = (expDateStr, today) => {
  if (expDateStr == "-") return null;
  const date = dayjs(expDateStr, ['D/M/YY', 'D/M/YYYY'], true);
  if (!date.isValid() || date.isBefore(today)) {
    return "INVALID";
  }
  return date.toDate().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

async function readSheet() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = '14T-7rbh8L3_AmFqWZKxt60Fp_oB8ZGj7718lQhB8v0Y';
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

    console.log(`Name: ${name}, Email: ${email}, Pack: ${packStr}, ExpDate: ${expDateStr}`);

    if (!email || !packStr || !expDateStr) continue;
  
    const pack = parseInt(packStr);
    const expDate = parseExpDate(expDateStr, today);
  
    if (!email || Number.isNaN(pack) || !expDateStr) continue;
    if (expDate == "INVALID") {
      console.log(`Invalid expiration date for ${name} (${email})`);
      continue;
    }

    const names = name.split(' & ');
    const emails = email.split(' & ');
    
    if (names.length !== emails.length) continue;

    const groupId = emails.sort().join('&');
  
    for (let i = 0; i < emails.length; i++) {
      validClients.push({
        name: names[i].trim(),
        email: emails[i].trim(),
        currentPack: pack,
        expirationDate: expDate,
        groupId,
      });
    }
  }  

  return validClients;
}

module.exports = readSheet;
