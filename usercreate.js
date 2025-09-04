import fs from "fs";

const browsers = [
  "Chrome", "Firefox", "Edge", "Safari", "Opera"
];

const osList = [
  "Windows NT 10.0; Win64; x64",
  "Windows NT 11.0; Win64; x64",
  "Macintosh; Intel Mac OS X 13_5",
  "X11; Linux x86_64",
  "Linux; Android 14; Pixel 8",
  "iPhone; CPU iPhone OS 17_0 like Mac OS X"
];

function randomVersion(min, max) {
  return `${min + Math.floor(Math.random() * (max - min + 1))}.${Math.floor(Math.random()*200)}.${Math.floor(Math.random()*200)}.${Math.floor(Math.random()*200)}`;
}

function generateUA() {
  const browser = browsers[Math.floor(Math.random() * browsers.length)];
  const os = osList[Math.floor(Math.random() * osList.length)];
  
  switch(browser) {
    case "Chrome":
      return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomVersion(90, 116)} Safari/537.36`;
    case "Firefox":
      return `Mozilla/5.0 (${os}; rv:${Math.floor(Math.random()*30)+80}.0) Gecko/20100101 Firefox/${Math.floor(Math.random()*30)+80}.0`;
    case "Edge":
      return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomVersion(90,116)} Safari/537.36 Edg/${randomVersion(90,116)}`;
    case "Safari":
      return `Mozilla/5.0 (${os}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${Math.floor(Math.random()*10)+14}.0 Safari/605.1.15`;
    case "Opera":
      return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomVersion(90,116)} Safari/537.36 OPR/${randomVersion(70,102)}`;
  }
}

// --- Generate ribuan User-Agent ---
const NUM = 3;
const uas = new Set();

while(uas.size < NUM) {
  uas.add(generateUA());
}

fs.writeFileSync("useragents.txt", Array.from(uas).join("\n"));
console.log(`[✓] Generated ${uas.size} User-Agents in useragents.txt`);

