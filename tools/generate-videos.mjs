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
    subtitle: "ReadyDorm turns emergency planning into clear action.",
    scenes: [
      ["Prepare", "Emergency profile, contacts, backpack, and routes in one place."],
      ["Respond", "SOS, safe check-ins, evacuation guidance, and nearby clinics."],
      ["Coordinate", "Roommates, families, and residence managers stay aligned."]
    ],
    accent: "#FA6A63"
  },
  {
    file: "about-team.webm",
    poster: "about-team-poster.svg",
    title: "About the Team",
    subtitle: "Built by students for safer shared living.",
    scenes: [
      ["Research", "We focused on students, roommates, families, and residence managers."],
      ["Design", "We prioritized accessibility, fast decisions, and low cognitive load."],
      ["Build", "We delivered a responsive landing page deployed with GitHub Pages."]
    ],
    accent: "#2EC5B6"
  }
];

function posterSvg(video) {
  const sceneText = video.scenes.map((scene, index) => `
    <g transform="translate(84 ${250 + index * 76})">
      <circle cx="18" cy="18" r="18" fill="${video.accent}"/>
      <text x="18" y="24" text-anchor="middle" font-size="18" font-weight="800" fill="#ffffff">${index + 1}</text>
      <text x="58" y="14" font-size="25" font-weight="800" fill="#082B49">${scene[0]}</text>
      <text x="58" y="45" font-size="18" fill="#526274">${scene[1]}</text>
    </g>
  `).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${video.title}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#F8FBFF"/>
      <stop offset="0.55" stop-color="#EEF5FA"/>
      <stop offset="1" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1080" cy="120" r="190" fill="${video.accent}" opacity="0.13"/>
  <circle cx="90" cy="650" r="220" fill="#0E3B64" opacity="0.10"/>
  <rect x="60" y="54" width="1160" height="612" rx="38" fill="#ffffff" stroke="#D9E2EC" stroke-width="2"/>
  <text x="84" y="132" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="900" fill="${video.accent}">READYDORM</text>
  <text x="84" y="194" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="900" fill="#082B49">${video.title}</text>
  <text x="84" y="235" font-family="Inter, Arial, sans-serif" font-size="24" fill="#526274">${video.subtitle}</text>
  ${sceneText}
  <circle cx="1042" cy="360" r="84" fill="${video.accent}"/>
  <polygon points="1020,316 1020,404 1096,360" fill="#ffffff"/>
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
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
      const chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };

      function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }

      function frame(t) {
        const progress = Math.min(1, t / 4800);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
        gradient.addColorStop(0, "#F8FBFF");
        gradient.addColorStop(0.6, "#EEF5FA");
        gradient.addColorStop(1, "#FFFFFF");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1280, 720);

        ctx.globalAlpha = 0.13;
        ctx.fillStyle = data.accent;
        ctx.beginPath();
        ctx.arc(1080, 120, 190 + Math.sin(t / 420) * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.10;
        ctx.fillStyle = "#0E3B64";
        ctx.beginPath();
        ctx.arc(90, 650, 220, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.shadowColor = "rgba(8,43,73,.12)";
        ctx.shadowBlur = 34;
        ctx.shadowOffsetY = 14;
        roundRect(60, 54, 1160, 612, 38);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#D9E2EC";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = "900 30px Arial";
        ctx.fillStyle = data.accent;
        ctx.fillText("READYDORM", 84, 132);
        ctx.font = "900 56px Arial";
        ctx.fillStyle = "#082B49";
        ctx.fillText(data.title, 84, 194);
        ctx.font = "24px Arial";
        ctx.fillStyle = "#526274";
        ctx.fillText(data.subtitle, 84, 235);

        data.scenes.forEach((scene, index) => {
          const reveal = Math.max(0, Math.min(1, (progress * 4) - index * 0.75));
          const y = 250 + index * 76 + (1 - reveal) * 18;
          ctx.globalAlpha = reveal;
          ctx.fillStyle = data.accent;
          ctx.beginPath();
          ctx.arc(102, y + 18, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "800 18px Arial";
          ctx.textAlign = "center";
          ctx.fillText(String(index + 1), 102, y + 24);
          ctx.textAlign = "left";
          ctx.fillStyle = "#082B49";
          ctx.font = "800 25px Arial";
          ctx.fillText(scene[0], 142, y + 14);
          ctx.fillStyle = "#526274";
          ctx.font = "18px Arial";
          ctx.fillText(scene[1], 142, y + 45);
          ctx.globalAlpha = 1;
        });

        const pulse = 1 + Math.sin(t / 260) * 0.045;
        ctx.save();
        ctx.translate(1042, 360);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = data.accent;
        ctx.beginPath();
        ctx.arc(0, 0, 84, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(-22, -44);
        ctx.lineTo(-22, 44);
        ctx.lineTo(54, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      recorder.start();
      const start = performance.now();
      await new Promise((resolve) => {
        function tick(now) {
          const elapsed = now - start;
          frame(elapsed);
          if (elapsed < 5200) requestAnimationFrame(tick);
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
      const base64 = result.result.value;
      await writeFile(join(outDir, video.file), Buffer.from(base64, "base64"));
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
