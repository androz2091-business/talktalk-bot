const { google } = require('googleapis');

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

require('dotenv').config();

const credentials = {
  type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const parseExpDate = (expDateStr, today) => {
  if (expDateStr == "-") return null;
  const date = dayjs(expDateStr, ['D/M/YY', 'D/M/YYYY', 'D/MM/YY', 'D/MM/YYYY'], true);
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
  const range = 'Hoja 1!A3:E'; // ['Name', 'E-mail', 'Number of classes', 'Date', 'Comment']

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

  // console.log('Headers:', headers);
  for (const row of dataRows) {
    const rowData = {};
    headers.forEach((header, idx) => {
      rowData[header] = row[idx];
    });
    // console.log('RowData:', rowData);

    const name = rowData['Name']?.trim();
    const email = rowData['E-mail']?.trim();
    const packStr = rowData['Number of classes']?.trim();
    const expDateStr = rowData['Date']?.trim();
    const comment = rowData['Comment']?.trim();

    console.log(`Name: ${name}, Email: ${email}, Pack: ${packStr}, ExpDate: ${expDateStr}, comment: ${comment}`);

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

    const groupId = emails.sort().join('&');

    for (let i = 0; i < emails.length; i++) {
      const isAlone = names.length === 1 && emails.length > 1; // alone if only one name but multiple emails
      validClients.push({
        name: names[i]?.trim() || names[0]?.trim() || 'Unknown',
        email: emails[i].trim(),
        currentPack: pack,
        expirationDate: expDate,
        groupId,
        comment: comment || '',
        isAlone,
      });
    }
  }

  return validClients;
}

module.exports = readSheet;
