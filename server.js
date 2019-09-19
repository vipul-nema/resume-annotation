const express = require('express');
const path = require('path');
const app = express();
const build = require('./scripts/dev');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

const request = require('request');
const origin = 'http://192.168.166.139:8080';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(upload.array());

app.use(express.static(path.join(__dirname, 'build')));

app.get('/htmlFiles/:htmlFileName', function (req, res) {
    // console.log('/htmlFiles/:htmlFileName', req.params);
    // let url = `${origin}/getFile/${req.params.htmlFileName}`;
    // console.log('url', url);
    // request.get(url).pipe(res);

    res.sendFile(path.join(__dirname, 'htmlFilesAnnt', `${req.params.htmlFileName}.html`));
});

app.post('/save', upload.none(), function (req, res) {
    // let url = `${origin}/getFile/${req.params.htmlFileName}`;
    // console.log('url', url);
    // request.get(url).pipe(res);
    const formData = req.body;
    console.log('form data', formData);
    res.send('Got a POST request')
    // res.sendFile(path.join(__dirname, 'htmlFilesAnnt', `${req.params.htmlFileName}.html`));
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



var PORT = 5000;
app.listen(PORT, function () {
    console.log('Server is running on PORT:', PORT);
});