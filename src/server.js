const gsJsonFetcher = require('./gsJsonFetcher');

const express = require('express');
const cors = require('cors');

const app = express();

const allowedTokens = require('../keys/allowed-tokens.json');

// Enable all cors for now
app.use(cors());

app.get('/:spreadsheetId/:sheetNumber?', async function (req, res) {
  console.log('== Got request', req.originalUrl);

  const { spreadsheetId, sheetNumber = 1 } = req.params;
  let { fields, token, refetch } = req.query;
  refetch = !!+refetch; // "0"/"1" -> false/true

  console.log('== with params: ', JSON.stringify({ spreadsheetId, sheetNumber, fields, token, refetch }, null, 2));

  if (allowedTokens.indexOf(token) === -1) {
    return res.json({ error: 'Error: Invalid access token.' });
  }

  const { data, error } = await gsJsonFetcher(spreadsheetId, sheetNumber, { fields, refetch });

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
app.listen(PORT, () => console.log(`gs2json app listening on port ${PORT}!`)); // eslint-disable-line no-console

