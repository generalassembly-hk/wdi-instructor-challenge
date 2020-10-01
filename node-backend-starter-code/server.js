var express = require('express');
var app = express();   //create a instance of app
var fs = require('fs');
var path = require('path');
 
app.use(express.static(path.join(__dirname, '/public')));   // to use static files like css and js(frontend js) files.
app.use(bodyParser.urlencoded({ extended: false }));   
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public'));

app.get('/favorites', function(req, res){
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
;

app.get('favorites', function(req, res){
  if(!req.body.name || !req.body.oid){
    res.send("Error");
    return
  
  var data = JSON.parse(fs.readFileSync('./data.json'));
  data.push(req.body);
  fs.writeFile('./data.json', JSON.stringify(data));
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

//server will listen on 3000 port
app.listen(3000, function(){
  console.log("Listening on port 3000");
});
