/* eslint no-console: "off" */


const GoogleSpreadsheet = require('google-spreadsheet');
const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');

const GOOGLE_SERVICE_API_KEY = require('../keys/google_service_api_key.json');
const DATA_DIR = '../data';


async function getDoc(spreadsheetId) {
  // Setup document
  const doc = Promise.promisifyAll(new GoogleSpreadsheet(spreadsheetId));

  // Setup Auth
  await doc.useServiceAccountAuthAsync(GOOGLE_SERVICE_API_KEY);

  return doc;
}


async function fetchRows(spreadsheetId, sheetNumber) {
  const doc = await getDoc(spreadsheetId);
  return await doc.getRowsAsync(sheetNumber);
}

async function fetchSheetList(spreadsheetId) {
  const doc = await getDoc(spreadsheetId);
  let info = await doc.getInfoAsync();
  return info.worksheets;
}



async function fetchAsJson(spreadsheetId, sheetNumber = 1, options) {

  try {

    const { fields, refetch } = options;

    const fileName = `${__dirname}/${DATA_DIR}/${spreadsheetId}-${sheetNumber}.json`;

    let rows;

    if (!refetch && fs.existsSync(fileName)) {
      console.log('-- found file: ', fileName);
      rows = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    } else {
      console.log('-- fetching: ', { spreadsheetId, sheetNumber });
      rows = await fetchRows(spreadsheetId, sheetNumber);
      console.log('-- writing file: ', fileName);
      await fs.writeFileSync(fileName, JSON.stringify(rows, null, 2), 'utf8');
    }

    console.log('-- got datas: ', rows.length);

    const OMITTED_ROW_FIELDS = ['_xml', 'id', 'app:edited', '_links'];
    rows = rows.map(row => _.omit(row, OMITTED_ROW_FIELDS));

    if (fields) {
      rows = rows.map(row => _.pick(row, fields.split(',')));
      console.log('-- returning fields: ', fields);
    }

    return { data: rows };

  } catch (e) {
    console.error('Error from fetcher', e);
    return { error: e };
  }

}



async function listSheets(spreadsheetId) {

  try {

    console.log('-- fetching sheet list: ', { spreadsheetId });

    let sheets = await fetchSheetList(spreadsheetId);
    sheets = sheets.map(sheet => _.pick(sheet, ['id', 'title']));
    console.log('-- got sheets: ', sheets.length);

    return { data: sheets };

  } catch (e) {
    console.error('Error from fetcher', e);
    return { error: e };
  }

}



module.exports = { fetchAsJson, listSheets };
