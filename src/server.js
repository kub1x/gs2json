const { fetchAsJson, listSheets } = require('./google-spreadsheet');

const express = require('express');
const cors = require('cors');

const app = express();

const allowedTokens = require('../keys/allowed-tokens.json');

// Enable all cors for now
app.use(cors());

// Check auth token
app.use(function (req, res, next) {
  let { token } = req.query;
  if (allowedTokens.indexOf(token) === -1) {
    res.json({ error: 'Error: Invalid access token.' });
  } else {
    next();
  }
});


app.get('/:spreadsheetId', async function (req, res) {
  console.log('== Got request', req.originalUrl);

  const { spreadsheetId } = req.params;

  console.log('== with params: ', JSON.stringify({ spreadsheetId }, null, 2));

  const { data, error } = await listSheets(spreadsheetId);

  return res.json({ data, error });
});


app.get('/:spreadsheetId/:sheetNumber', async function (req, res) {
  console.log('== Got request', req.originalUrl);

  const { spreadsheetId, sheetNumber } = req.params;
  let { refetch } = req.query;
  refetch = !!+refetch; // "0"/"1" -> false/true

  console.log('== with params: ', JSON.stringify({ spreadsheetId, sheetNumber, refetch }, null, 2));

  const { data, error } = await fetchAsJson(spreadsheetId, sheetNumber, { refetch });

  return res.json({ data, error });
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


const PORT = process.env.PORT;
app.listen(PORT, function () {
  console.error('========================================================================');
  console.log('========================================================================');
  console.log(`gs2json app listening on port ${PORT}!`)
}); // eslint-disable-line no-console

