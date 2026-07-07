import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(".");
const outDir = join(root, "public", "assets", "videos");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9333;

const videos = [
  {
    file: "about-product.webm",
    poster: "about-product-poster.svg",
    title: "About the Product",
    subtitle: "A realistic walkthrough of preparation, SOS, route guidance, sensors, and manager coordination.",
    accent: "#FA6A63",
    mode: "product"
  },
  {
    file: "about-team.webm",
    poster: "about-team-poster.svg",
    title: "About the Team",
    subtitle: "How the team researched, designed, tested, and deployed ReadyDorm as an inclusive prototype.",
    accent: "#2EC5B6",
    mode: "team"
  }
];

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function posterSvg(video) {
  const productPanel = video.mode === "product"
    ? `
      <rect x="770" y="142" width="350" height="470" rx="34" fill="#082B49"/>
      <rect x="794" y="172" width="302" height="410" rx="22" fill="#FFFFFF"/>
      <text x="830" y="228" font-size="20" font-weight="900" fill="#082B49">Emergency plan</text>
      <rect x="830" y="260" width="230" height="70" rx="14" fill="#FFF0EF"/>
      <text x="852" y="302" font-size="18" font-weight="900" fill="#DE514B">SOS ready</text>
      <rect x="830" y="356" width="230" height="70" rx="14" fill="#E7F8F5"/>
      <text x="852" y="398" font-size="18" font-weight="900" fill="#08796F">Exit B route</text>
      <rect x="830" y="452" width="230" height="70" rx="14" fill="#EEF3F8"/>
      <text x="852" y="494" font-size="18" font-weight="900" fill="#0E3B64">Manager synced</text>`
    : `
      <rect x="720" y="154" width="430" height="350" rx="28" fill="#FFFFFF" stroke="#D9E2EC" stroke-width="2"/>
      <rect x="758" y="200" width="110" height="110" rx="24" fill="#DDF7F3"/>
      <rect x="900" y="200" width="110" height="110" rx="24" fill="#EEF3F8"/>
      <rect x="1042" y="200" width="70" height="110" rx="24" fill="#FFE7E5"/>
      <text x="758" y="370" font-size="20" font-weight="900" fill="#082B49">Research</text>
      <text x="900" y="370" font-size="20" font-weight="900" fill="#082B49">Design</text>
      <text x="1042" y="370" font-size="20" font-weight="900" fill="#082B49">Build</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${escapeXml(video.title)}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#F8FBFF"/>
      <stop offset="0.58" stop-color="#EEF5FA"/>
      <stop offset="1" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1128" cy="96" r="190" fill="${video.accent}" opacity="0.14"/>
  <rect x="64" y="72" width="1152" height="576" rx="42" fill="#FFFFFF" stroke="#D9E2EC" stroke-width="2"/>
  <text x="106" y="158" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="900" fill="${video.accent}">READYDORM</text>
  <text x="106" y="232" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="900" fill="#082B49">${escapeXml(video.title)}</text>
  <foreignObject x="106" y="260" width="530" height="120">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:24px;line-height:1.35;color:#607285">${escapeXml(video.subtitle)}</div>
  </foreignObject>
  <rect x="106" y="468" width="178" height="56" rx="14" fill="${video.accent}"/>
  <text x="148" y="504" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Watch demo</text>
  ${productPanel}
</svg>`;
}

async function startChrome() {
  const userDataDir = join(root, ".tmp-chrome-video");
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--mute-audio",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank"
  ], { stdio: "ignore" });

  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return chrome;
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 150));
    }
  }
  chrome.kill();
  throw new Error("Chrome remote debugging did not start.");
}

async function cdp(wsUrl) {
  const socket = new WebSocket(wsUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    socket.onopen = resolveOpen;
    socket.onerror = rejectOpen;
  });

  let id = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolveMessage, rejectMessage } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rejectMessage(new Error(message.error.message));
      else resolveMessage(message.result);
    }
  };

  return {
    send(method, params = {}) {
      const messageId = ++id;
      socket.send(JSON.stringify({ id: messageId, method, params }));
      return new Promise((resolveMessage, rejectMessage) => {
        pending.set(messageId, { resolveMessage, rejectMessage });
      });
    },
    close() {
      socket.close();
    }
  };
}

function recorderScript(video) {
  return `
    (async () => {
      const data = ${JSON.stringify(video)};
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      document.body.style.margin = "0";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
      const chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };

      function rr(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      function text(value, x, y, size, weight = 700, color = "#082B49", align = "left") {
        ctx.font = weight + " " + size + "px Inter, Arial";
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(value, x, y);
        ctx.textAlign = "left";
      }

      function wrap(value, x, y, max, lh, size, color = "#607285") {
        ctx.font = "500 " + size + "px Inter, Arial";
        ctx.fillStyle = color;
        const words = value.split(" ");
        let line = "";
        for (const word of words) {
          const test = line ? line + " " + word : word;
          if (ctx.measureText(test).width > max && line) {
            ctx.fillText(line, x, y);
            line = word;
            y += lh;
          } else {
            line = test;
          }
        }
        ctx.fillText(line, x, y);
      }

      function bg(t) {
        const g = ctx.createLinearGradient(0, 0, 1280, 720);
        g.addColorStop(0, "#F8FBFF");
        g.addColorStop(0.58, "#EEF5FA");
        g.addColorStop(1, "#FFFFFF");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 1280, 720);
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = data.accent;
        ctx.beginPath();
        ctx.arc(1120, 90, 190 + Math.sin(t / 420) * 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      function phone(x, y, w, h, phase) {
        ctx.shadowColor = "rgba(8,43,73,.22)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 18;
        rr(x, y, w, h, 36);
        ctx.fillStyle = "#082B49";
        ctx.fill();
        ctx.shadowBlur = 0;
        rr(x + 18, y + 28, w - 36, h - 56, 24);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        text("ReadyDorm", x + 44, y + 76, 18, 900, "#0E3B64");
        const states = [
          ["Emergency profile", "Contacts, medication, routes and backpack are ready.", "#DDF7F3"],
          ["SOS active", "Location and profile shared with trusted contacts.", "#FFE7E5"],
          ["Exit B", "Follow the main corridor to the front park.", "#E7F8F5"]
        ];
        const item = states[Math.min(states.length - 1, Math.floor(phase * states.length))];
        rr(x + 44, y + 110, w - 88, 92, 18);
        ctx.fillStyle = item[2];
        ctx.fill();
        text(item[0], x + 64, y + 148, 24, 900, "#082B49");
        wrap(item[1], x + 64, y + 176, w - 128, 20, 14);
        rr(x + 44, y + 230, w - 88, 180, 18);
        ctx.fillStyle = "#F4F7FB";
        ctx.fill();
        ctx.strokeStyle = "#D9E2EC";
        ctx.stroke();
        ctx.strokeStyle = "#2EC5B6";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 84, y + 340);
        ctx.lineTo(x + 148 + phase * 80, y + 304);
        ctx.lineTo(x + 250, y + 346);
        ctx.stroke();
        ctx.lineWidth = 1;
        rr(x + 44, y + 438, w - 88, 54, 12);
        ctx.fillStyle = data.accent;
        ctx.fill();
        text(phase > 0.42 ? "Safe check-in sent" : "Hold to send SOS", x + w / 2, y + 472, 17, 900, "#FFFFFF", "center");
      }

      function dashboard(x, y, w, h, phase) {
        ctx.shadowColor = "rgba(8,43,73,.16)";
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 14;
        rr(x, y, w, h, 26);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.shadowBlur = 0;
        text("Residence dashboard", x + 34, y + 48, 22, 900);
        rr(x + w - 170, y + 24, 126, 34, 10);
        ctx.fillStyle = "#FFE7E5";
        ctx.fill();
        text("Live drill", x + w - 146, y + 47, 14, 900, "#DE514B");
        const cards = [["42", "safe"], ["8", "pending"], ["2", "alerts"]];
        cards.forEach((card, i) => {
          rr(x + 34 + i * 142, y + 82, 122, 80, 14);
          ctx.fillStyle = "#F4F7FB";
          ctx.fill();
          text(card[0], x + 56 + i * 142, y + 124, 30, 900);
          text(card[1], x + 56 + i * 142, y + 148, 14, 800, "#607285");
        });
        rr(x + 34, y + 190, w - 68, h - 226, 18);
        ctx.fillStyle = "#F8FBFF";
        ctx.fill();
        ctx.strokeStyle = "#D9E2EC";
        ctx.stroke();
        ctx.strokeStyle = "#D9E2EC";
        for (let gx = x + 70; gx < x + w - 50; gx += 58) {
          ctx.beginPath(); ctx.moveTo(gx, y + 204); ctx.lineTo(gx, y + h - 52); ctx.stroke();
        }
        for (let gy = y + 228; gy < y + h - 48; gy += 48) {
          ctx.beginPath(); ctx.moveTo(x + 48, gy); ctx.lineTo(x + w - 50, gy); ctx.stroke();
        }
        ctx.strokeStyle = "#2EC5B6";
        ctx.lineWidth = 9;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 120, y + 340);
        ctx.lineTo(x + 246 + phase * 115, y + 288);
        ctx.lineTo(x + 480, y + 332);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.fillStyle = "#FA6A63";
        ctx.beginPath(); ctx.arc(x + 120, y + 340, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#2EC5B6";
        ctx.beginPath(); ctx.arc(x + 480, y + 332, 13, 0, Math.PI * 2); ctx.fill();
        rr(x + 390, y + 406, 146, 34, 17);
        ctx.fillStyle = "#0E3B64";
        ctx.fill();
        text("Meeting point", x + 410, y + 428, 13, 900, "#FFFFFF");
      }

      function productFrame(t) {
        const p = Math.min(1, t / 7600);
        bg(t);
        text("READYDORM", 70, 78, 26, 900, data.accent);
        text("About the Product", 70, 136, 54, 900);
        wrap("A practical emergency companion for residents, families, and residence managers.", 72, 176, 470, 30, 22);
        phone(92, 250, 310, 390, p);
        dashboard(470, 112, 690, 500, p);
        rr(70, 646, 390, 18, 9);
        ctx.fillStyle = "#D9E2EC"; ctx.fill();
        rr(70, 646, 390 * p, 18, 9);
        ctx.fillStyle = data.accent; ctx.fill();
      }

      function teamFrame(t) {
        const p = Math.min(1, t / 7600);
        bg(t);
        text("READYDORM", 72, 78, 26, 900, data.accent);
        text("About the Team", 72, 136, 54, 900);
        wrap("We designed the prototype around real emergency stress: fast scanning, accessible controls, and clear responsibilities.", 74, 176, 540, 30, 22);
        const steps = [
          ["Research", "Students, roommates, families, and residence staff."],
          ["Design", "Low cognitive load, mobile-first flows, accessible states."],
          ["Prototype", "Videos, responsive landing page, product detail page."],
          ["Deploy", "GitHub Pages delivery with documented scope."]
        ];
        steps.forEach((step, i) => {
          const reveal = Math.max(0, Math.min(1, p * 4.5 - i * 0.72));
          const x = 92 + i * 276;
          const y = 310 - (1 - reveal) * 24;
          ctx.globalAlpha = reveal;
          rr(x, y, 230, 230, 28);
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "rgba(8,43,73,.12)";
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
          rr(x + 26, y + 28, 72, 72, 20);
          ctx.fillStyle = i % 2 ? "#EEF3F8" : "#DDF7F3";
          ctx.fill();
          text(String(i + 1), x + 52, y + 75, 28, 900, data.accent);
          text(step[0], x + 26, y + 136, 24, 900);
          wrap(step[1], x + 26, y + 170, 178, 22, 15);
          ctx.globalAlpha = 1;
        });
        rr(72, 646, 390, 18, 9);
        ctx.fillStyle = "#D9E2EC"; ctx.fill();
        rr(72, 646, 390 * p, 18, 9);
        ctx.fillStyle = data.accent; ctx.fill();
      }

      function frame(t) {
        if (data.mode === "team") teamFrame(t);
        else productFrame(t);
      }

      recorder.start();
      const start = performance.now();
      await new Promise((resolve) => {
        function tick(now) {
          const elapsed = now - start;
          frame(elapsed);
          if (elapsed < 8000) requestAnimationFrame(tick);
          else resolve();
        }
        requestAnimationFrame(tick);
      });
      recorder.stop();
      await new Promise((resolve) => { recorder.onstop = resolve; });
      const blob = new Blob(chunks, { type: "video/webm" });
      const buffer = await blob.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    })()
  `;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  for (const video of videos) {
    await writeFile(join(outDir, video.poster), posterSvg(video), "utf8");
  }

  const chrome = await startChrome();
  try {
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const pageTarget = pages.find((page) => page.type === "page");
    if (!pageTarget) throw new Error("No Chrome page target found.");
    const client = await cdp(pageTarget.webSocketDebuggerUrl);
    await client.send("Runtime.enable");
    for (const video of videos) {
      const result = await client.send("Runtime.evaluate", {
        expression: recorderScript(video),
        awaitPromise: true,
        returnByValue: true
      });
      await writeFile(join(outDir, video.file), Buffer.from(result.result.value, "base64"));
      console.log(`generated ${video.file}`);
    }
    client.close();
  } finally {
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
