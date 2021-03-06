var args = process.argv.slice(2);
var http=require('http');

var moment=require('moment');
var containerarch=process.platform;

//var containerip = require('os').networkInterfaces().eth0[0].address;

var ifaces = require('os').networkInterfaces();

var containerip = "";



Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }
    containerip=containerip+" "+iface.address;
    ++alias;
  });
});

var rootpath = "/";

var containername=require('os').hostname();

var fs = require('fs');

var app_down_file = "/tmp/down";

var port=args[0];

var random_colors=["white","black","blue","red","grey","cyan","orange","yellow"]

var appversion="1.21";

var appdate=+new Date();

var color = process.env.COLOR

var hostname = process.env.HOSTNAME

var data_path = "/data";

var redis_enabled = process.env.REDIS_ENABLED

var approot = process.env.APPROOT;

if ( !approot ) {
  console.log('App Root not defined, we will take / as Root App Path');
  approot = "";
}

if ( !color ) {
  console.log('Color not defined, we will take a random one');
  color = random_colors[Math.floor(Math.random()*random_colors.length)];
}

console.log('APP_VERSION: ' + appversion +
' COLOR: '+color +
' CONTAINER_NAME: ' + containername +
' CONTAINER_IP: ' + containerip +
' CONTAINER_ARCH: ' + containerarch +
' HOSTNAME: ' + hostname);

if ( redis_enabled ) {
  // Redis connection

  var redis = require('redis');

  var redis_port = process.env.REDIS_PORT || 6379;
  var redis_host = process.env.REDIS_HOST || 'redis';

  var redis_enabled = process.env.REDIS_ENABLED;

  var client = redis.createClient(redis_port, redis_host);
  client.on('connect', function() {
    console.log('connected');
    client.set(containerip, color, redis.print);
    client.expire(containerip, 60);
  });

}


if (fs.existsSync(data_path)) {

  data_string='APP_VERSION: ' + appversion +
  '\nCOLOR: ' + color +
  '\nCONTAINER_NAME: ' + containername +
  '\nCONTAINER_IP: ' + containerip +
  '\nCONTAINER_ARCH: ' + containerarch +
  '\HOSTNAME (from environment): ' + hostname+
  '\n';

  fs.writeFile(data_path + "/" + containername, data_string, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Data file " + data_path + "/" + containername + " was created.");
  });

}else{
  console.log("Data path " + data_path + " does not exist, no application fingerprint will be created.");
}

http.createServer(function (req, res) {
  console.log("URL: "+ req.url);

  if (req.headers['x-forwarded-for']) {
    clientip = req.headers['x-forwarded-for'].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
    clientip = req.connection.remoteAddress;
  } else {
    clientip = req.ip;
  }

  var strheaders = "";
  headers_map = req.headers;
  //console.log('HEADERS:');
  Object.keys(headers_map).forEach(function(header_key){
    //console.log(header_key + ': "' + headers_map[header_key] + '"');
    strheaders = strheaders + '\t- ' + header_key + ': "' + headers_map[header_key] + '"\n';
   });


  if (req.url == "/colors"){
    res.write('COLORS ROOT\n');
    res.write(strheaders);
    res.end();
    return;
    }

  if (req.url == approot + "/favicon.ico"){return;}
  if (req.url == approot + "/health"){
    result='I am OK thanks for asking.\n';
    if (fs.existsSync(app_down_file)){
      result='I am DOWN.\n';
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=UTF-8',
      'AppStatus': 'DOWN' });
    }else{
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8',
      'AppStatus': 'UP' });
    }
    console.log(result);
    res.write(result);
    res.end();
    return;
  }
  //var headers=JSON.stringify(req.headers);
  if (req.url == approot + "/text"){
    var datetime =moment().format('MMMM Do YYYY, h:mm:ss a');
    result='APP_VERSION: ' + appversion +
      '\nCOLOR: ' + color +
      '\nCONTAINER_NAME: ' + containername +
      '\nCONTAINER_IP: ' + containerip +
      '\nCLIENT_IP: ' + clientip +
      '\nCONTAINER_ARCH: ' + containerarch+
      '\nHOSTNAME (from environment): ' + hostname+
      '\nDATETIME: ' + datetime+
      '\nHEADERS: \n' + strheaders+
      '\n';
    console.log(result);
    res.write(result);
    res.end();
    return;
  }
  if (req.url == approot + "/headers"){
    res.write('HEADERS:\n');
    res.write(strheaders);
    res.end();
    return;
  }

  if (req.url == approot + "/headers"){
    res.write('HEADERS:\n');
    res.write(strheaders);
    res.end();
    return;
  }
  
  var match_approot = new RegExp("^"+ approot + "($|\/$)");


  if ( match_approot.test(req.url)){
  
    fs.readFile('index.html', 'utf-8', function (err, result) {
      var datetime =moment().format('MMMM Do YYYY, h:mm:ss a');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        result = result.replace('{{DATETIME}}', datetime);
        result = result.replace('{{APP_VERSION}}', appversion);
        result = result.replace('{{CONTAINER_IP}}', containerip);
        result = result.replace('{{CLIENT_IP}}', client);
        result = result.replace('{{CONTAINER_NAME}}', containername);
        result = result.replace('{{CONTAINER_ARCH}}', containerarch);
        result = result.replace('{{HOSTNAME}}', hostname);
        strheaders = strheaders.replace(/\t- /g, '<p>');
        result = result.replace('{{HEADERS}}', strheaders);
        result = result.replace(new RegExp('{{COLOR}}', 'g'), color);
        console.log(result);
        res.write(result);
        // Closing response
        res.write('</body>\n');
        res.write('</html>\n');
        res.end();
    });
  }else{
    res.write('URL '+ req.url +' NOT FOUND\n');
    res.end();
    return;
  }

}).listen(port);






console.log('[' + appdate + ']  ' + containerip+' - '+containername);

console.log('Server running at http://'+containerip+':'+port+ approot+ '/');

