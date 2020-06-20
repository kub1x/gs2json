/* eslint no-console: "off" */
const { GoogleSpreadsheet } = require('google-spreadsheet');
const _ = require('lodash');
const fs = require('fs');

const GOOGLE_SERVICE_API_KEY = require('../keys/google_service_api_key.json');
const DATA_DIR = '../data';


async function getDoc(spreadsheetId) {
  // Setup document
  const doc = new GoogleSpreadsheet(spreadsheetId);

  // Setup Auth
  await doc.useServiceAccountAuth(GOOGLE_SERVICE_API_KEY);

  // Get sheets list
  await doc.loadInfo();

  return doc;
}


async function fetchRows(spreadsheetId, sheetNumber) {
  const doc = await getDoc(spreadsheetId);
  const sheet = doc.sheetsByIndex[sheetNumber] || doc.sheetsById[sheetNumber];
  const rows = (await sheet.getRows()).map((row) => _.omitBy(row, (value, key) => key.startsWith('_')));
  return rows;
}

async function fetchSheetList(spreadsheetId) {
  const doc = await getDoc(spreadsheetId);
  const res = doc.sheetsByIndex.map(sheet => ({ index: sheet.index, id: sheet.sheetId, title: sheet.title }));
  return res;
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
    data = cacheRetore(fileName);
  } else {
    data = await fetchFn();
    cacheStore(fileName, data);
  }
  return data;
}



async function fetchAsJson({ spreadsheetId, sheetNumber = 1, refetch }) {
  try {

    const fileName = `${__dirname}/${DATA_DIR}/${spreadsheetId}-${sheetNumber}.json`;
    const fetchFn = () => fetchRows(spreadsheetId, sheetNumber);

    const rows = await justGetIt({ fileName, refetch, fetchFn });

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

    sheets = sheets.map(sheet => _.pick(sheet, ['index', 'id', 'title']));

    return { data: sheets };

  } catch (e) {
    console.error('Error from fetcher', e);
    return { error: e };
  }

}



module.exports = { fetchAsJson, listSheets };
