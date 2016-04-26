var cachemere = require('cachemere');
var fs = require('fs');
var extend = require('extend');

var URL = require('url');

var request = require('request');

var templates = {};

function init() {
  console.log('initializing scriptify');
  var awf = fs.readdirSync('templates');

  for (var i = 0; i < awf.length; i++) {
    templates[awf[i]] = fs.readFileSync('templates/' + awf[i]).toString();
  }
}

function dictReplace(t, d) {
  for (var k in d) {
    if (d.hasOwnProperty(k)) {
      t = t.replace('$' + k, d[k]);
    }
  }

  return t;
}

function transform(t, s) {
  var scd = {'*':'slug', '**':'byline', '***':'title', '+':'action', '>':'character', '(':'paren', '/':'transition', '#':'comment'}
  var pd = {'title':'(untitled)'};
  var ignore = 0;

  var body = "";
  var lines = s.split('\n');
  var c = "", r = "";

  for (var i = 0; i < lines.length; i++) {
    line = lines[i].trim();

    if (!line) {
      continue;
    }

    if (line[0] == '(') {
      c = '(';
    } else {
      var is =  line.indexOf(' ');
      c = is >= 0 ? line.substr(0, is) : line[0];
      r = line.substr(is+1).trim();
    }

    switch (c) {
      case '[': {
        ignore++;
      } break;

      case ']': {
        ignore--;
      } break;

      case '#': {
        line = '';
      } break;

      default: {
        if (c in scd) {
          dc = scd[c];
          if (dc == 'title' || dc == 'byline') {
            pd[dc] = r;
          }

          if (dc == 'paren') {
            c = null;
          }
        } else {
          c = null;
          dc = 'dialog';
        }
      } break;
    }

    if (c) {
      line = line.substr(c.length).trim();
    }

    if (ignore <= 0 && line && dc) {
      body += '<div class="' + dc + '">' + line + '</div>\r\n';
    }
  }

  pd.body = body;

  return dictReplace(t, pd);
}

exports.handle404 = function (req, res) {
  var url = URL.parse(req.original_url, true);

  var auc = url.pathname.split('/');
  var session;

  if ('source' in url.query && auc[1] == 'format') {
    if (auc[2] in templates) {
      request(url.query.source, function (e, r, b) {
        var p = templates[auc[2]];

        if (r.statusCode == 200) {
          res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});

          res.write(transform(p, b));
        }

        res.end();
      });

      return true;
    }
  }

  return false;
};

init();
