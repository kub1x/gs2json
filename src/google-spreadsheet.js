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


function cacheExists(fileName) {
  return fs.existsSync(fileName);
}

function cacheStore(fileName, data) {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2), 'utf8');
}

function cacheRetore(fileName) {
  return JSON.parse(fs.readFileSync(fileName, 'utf8'));
}

async function justGetIt({ fileName, refetch, fetchFn }) {
  let data;
  if (!refetch && cacheExists(fileName)) {
    console.log('-- found file: ', fileName);
    data = cacheRetore(fileName);
  } else {
    console.log('-- fetching');
    data = await fetchFn();
    console.log('-- writing file: ', fileName);
    cacheStore(fileName, data);
  }
  return data;
}



async function fetchAsJson({ spreadsheetId, sheetNumber = 1, refetch }) {
  try {

    const fileName = `${__dirname}/${DATA_DIR}/${spreadsheetId}-${sheetNumber}.json`;
    const fetchFn = () => fetchRows(spreadsheetId, sheetNumber);

    let rows = await justGetIt({ fileName, refetch, fetchFn });

    const OMITTED_ROW_FIELDS = ['_xml', 'id', 'app:edited', '_links'];
    rows = rows.map(row => _.omit(row, OMITTED_ROW_FIELDS));
    console.log('-- got rows: ', rows.length);

    return { data: rows };

  } catch (e) {
    console.error('Error from fetcher', e);
    return { error: e };
  }
}



async function listSheets({ spreadsheetId, refetch }) {

  try {

    console.log('-- fetching sheet list: ', { spreadsheetId });

    const fileName = `${__dirname}/${DATA_DIR}/${spreadsheetId}-list.json`;
    const fetchFn = () => fetchSheetList(spreadsheetId);

    let sheets = await justGetIt({ fileName, refetch, fetchFn });

    sheets = sheets.map(sheet => _.pick(sheet, ['id', 'title']));
    console.log('-- got sheets: ', sheets.length);

    return { data: sheets };

  } catch (e) {
    console.error('Error from fetcher', e);
    return { error: e };
  }

}



module.exports = { fetchAsJson, listSheets };
