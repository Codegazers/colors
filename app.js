var args = process.argv.slice(2);
var http=require('http');
var containerip = require('os').networkInterfaces().eth0[0].address;
var containername=require('os').hostname();
var fs = require('fs');
var app_down_file = "/tmp/down";
var port=args[0];
var random_colors=["white","black","blue","red","grey","cyan","orange","yellow"]

var APP_VERSION="1.0";

var appdate=+new Date();

var color = process.env.COLOR

if ( !color ) {
  console.log('Color not defined, we will take a random one');
  color = random_colors[Math.floor(Math.random()*random_colors.length)];
}

console.log('APP_VERSION: ' + APP_VERSION + ' COLOR: '+color + ' CONTAINER NAME: ' + containername + ' CONTAINER IP: ' + containerip);

http.createServer(function (req, res) {
  if (req.url == "/favicon.ico"){return;}
  if (req.url == "/health"){
    result='I am OK Thanks, and you?\n';
    if (fs.existsSync(app_down_file)){
      result='I am DOWN, thanks for asking\n';
    }

    console.log(result);
    res.write(result);
    res.end();
    return;
  }
  if (req.url == "/text"){
    result='APP_VERSION: ' + APP_VERSION + '\nCOLOR: '+color + '\nCONTAINER_NAME: ' + containername + '\nCONTAINER_IP: ' + containerip + '\n';
    console.log(result);
    res.write(result);
    res.end();
    return;
  }

    fs.readFile('index.html', 'utf-8', function (err, result) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      result = result.replace('{{APP_VERSION}}', APP_VERSION);
      result = result.replace('{{CONTAINER_IP}}', containerip);
      result = result.replace('{{CONTAINER_NAME}}', containername);
      result = result.replace(new RegExp('{{COLOR}}', 'g'), color);
      console.log(result);
      res.write(result);
      // Closing response
      res.write('</body>\n');
      res.write('</html>\n');
      res.end();
    });


}).listen(port);






console.log('[' + appdate + ']  ' + containerip+' - '+containername);

console.log('Server running at http://'+containerip+':'+port+'/');

