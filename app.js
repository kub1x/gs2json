const gsJsonFetcher = require('./gsJsonFetcher');

const express = require('express');
const cors = require('cors')

const app = express();

// Enable all cors for now
app.use(cors());

app.get('/:spreadsheetId/:sheetNumber', async function (req, res) {
  const { spreadsheetId } = req.params;
  let { sheetNumber } = req.params;
  const { fields, refetch } = req.query;

  //console.log('got request', { spreadsheetId, sheetNumber, fields } );

  const { data, error } = await gsJsonFetcher(spreadsheetId, sheetNumber, { fields, refetch });
  res.json({ data, error });
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
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


const port = process.env.PORT;
app.listen(port, () => console.log(`gs2json app listening on port ${port}!`));
