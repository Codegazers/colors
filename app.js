var args = process.argv.slice(2);
var http=require('http');
var containerip = require('os').networkInterfaces().eth0[0].address;
var containername=require('os').hostname();
var fs = require('fs');
var port=args[0];

var APP_VERSION="1.0";

var appdate=+new Date();

var color = process.env.COLOR

console.log('APP_VERSION: ' + APP_VERSION + ' COLOR: '+color + ' CONTAINER NAME: ' + containername + ' CONTAINER IP: ' + containerip);

http.createServer(function (req, res) {
  if (req.url == "/favicon.ico"){return;}

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

