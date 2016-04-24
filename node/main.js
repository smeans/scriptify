var fs = require('fs');
var cachemere = require('cachemere');
var http = require('http');
var anyBody = require('body/any');
var qs = require('querystring');

var url_map = {'/':'/index.html'};

var URL = require('url');

var js_handlers = {};

function handleJSRequest(req, res) {
  try {
    var url = URL.parse(req.url, true);
    var handler = url.pathname.substring('/~'.length);
    var mpa = handler.split('::');

    var jsr = mpa[0] in js_handlers ? js_handlers[mpa[0]] : (js_handlers[mpa[0]] = require('./handlers/' + mpa[0] + '.js'));

    if (req.method == 'GET') {
      var p = req.url.split('?');

      if (p.length > 1) {
        req.query = qs.parse(p[1]);
      } else {
        req.query = {};
      }

      jsr[mpa[1]](req, res, url.query);

      res.end();
    } else {
      anyBody(req, res, {}, function (err, body) {
        if (err) {
          res.statusCode = 400;
          return res.end(JSON.stringify({error:'bad request', message:err.toString()}));
        }

        req.body = body;

        jsr[mpa[1]](req, res, url.query);

        res.end();
      });
    }
  } catch (e) {
    console.log(e);

    req.url = "/www_public/400.html";

    cachemere.fetch(req, function (err, resource) {
      resource.output(res);

      return;
    });
  }
}

function init() {
  global.args = process.argv.slice(2);

  global.debug = args.indexOf('debug') >= 0;

  if (global.debug) {
    console.error('DEBUGGING ENABLED');
  }

  var hma = fs.readdirSync('handlers');

  for (var i = 0; i < hma.length; i++) {
    js_handlers[hma[i]] = require('./handlers/' + hma[0]);
  }
}

init();

global.server = http.createServer(function (req, res) {
    req.original_url = req.url;

    if (req.url.indexOf('/~') === 0) {
      handleJSRequest(req, res);

      return;
    }

    if (req.url in url_map) {
      req.url = url_map[req.url];
    }

    var url = URL.parse(req.url, true);

    req.url = '/www_public' + url.pathname;

    cachemere.fetch(req, function (err, resource) {
        /*
        Note that you can manipulate the Resource object's
        properties before outputting it to the response.
        */
        if (err) {
          for (var k in js_handlers) {
            if ('handle404' in js_handlers[k]) {
              if (js_handlers[k].handle404(req, res)) {
                return;
              }
            }
          }
          req.url = "/www_public/404.html";

          cachemere.fetch(req, function (err, resource) {
            resource.output(res);
          });
        } else {
          resource.output(res);
        }
    });
});

global.server.listen(8080);
