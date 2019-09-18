const express = require('express');
const path = require('path');
const app = express();
const build = require('./scripts/dev');



app.use(express.static(path.join(__dirname, 'build')));

app.get('/htmlFiles/:htmlFileName', function (req, res) {
    console.log('/htmlFiles/:htmlFileName', req.params);
    res.sendFile(path.join(__dirname, 'htmlFilesAnnt', `${req.params.htmlFileName}.html`));
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



var PORT = 5000;
app.listen(PORT, function () {
    console.log('Server is running on PORT:', PORT);
});