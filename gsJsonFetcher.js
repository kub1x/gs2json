const GoogleSpreadsheet = require('google-spreadsheet');
const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');


async function fetchRows(spreadsheetId, sheetNumber) {
  // Setup document
  const doc = Promise.promisifyAll(new GoogleSpreadsheet(spreadsheetId));

  // Setup Auth
  const creds = require('./keys/google_service_api_key.json');
  await doc.useServiceAccountAuthAsync(creds);

  // Fetch data from #sheetNumber spreadsheet
  return await doc.getRowsAsync(sheetNumber);

}

async function gsJsonFetcher(spreadsheetId, sheetNumber = 1, options) {

  try {

    const { fields } = options;

    const fileName = `data/${spreadsheetId}-${sheetNumber}.json`;

    let rows;

    if (fs.existsSync(fileName)) {
      //console.log('-- found file');
      rows = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    } else {
      //console.log('-- fetching', { spreadsheetId, sheetNumber });
      rows = await fetchRows(spreadsheetId, sheetNumber);
      //console.log('-- writing file');
      fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf8');
    }

    //console.log('got data', rows);

    rows = rows.map(row => _.pick(row, fields.split(',')));

    //console.log('returning', rows);

    return { data: rows };

  } catch (e) {
    return { error: e };
  }

}

module.exports = gsJsonFetcher;
