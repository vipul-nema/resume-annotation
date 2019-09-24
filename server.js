const express = require("express");
const path = require("path");
const app = express();
const build = require("./scripts/dev");
var bodyParser = require("body-parser");
// var multer = require("multer");
const request = require("request");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, __dirname + '/htmlFilesAnnt');
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// });

// var upload = multer({ storage: storage });

//ServerAPI origin
const origin = 'http://192.168.40.59:8080';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "build")));

app.get("/htmlFiles/:htmlFileName", function (req, res) {
  let url = `${origin}/getFile/${req.params.htmlFileName}`;
  console.log("url", url);
  request.get(url).pipe(res);

  // res.sendFile(path.join(__dirname, 'htmlFilesAnnt', `${req.params.htmlFileName}.html`));
});

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


// var cpUpload = upload.fields([{ name: 'files', maxCount: 10 }]);

// app.post("/uploadMultipleFiles", cpUpload, function (req, res) {
//   console.log('uploadMultipleFiles', req.body);
//   res.send('Success');
// });


var PORT = 5000;
app.listen(PORT, function () {
  console.log("Server is running on PORT:", PORT);
});
