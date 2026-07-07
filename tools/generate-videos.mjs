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
    subtitle: "SafetyTech for shared housing",
    caption: "Mobile emergency profile, SOS response, evacuation route, IoT sensors, contacts, and manager coordination.",
    accent: "#FA6A63",
    mode: "product"
  },
  {
    file: "about-team.webm",
    poster: "about-team-poster.svg",
    title: "About the Team",
    subtitle: "Research, UX/UI, implementation, and deployment",
    caption: "Five students built an English, responsive, accessible landing page with product videos and GitHub Pages deployment.",
    accent: "#2EC5B6",
    mode: "team"
  }
];

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function posterSvg(video) {
  const rightPanel = video.mode === "product"
    ? `
      <rect x="748" y="134" width="338" height="438" rx="38" fill="#082B49"/>
      <rect x="772" y="164" width="290" height="378" rx="26" fill="#FFFFFF"/>
      <text x="812" y="222" font-size="18" font-weight="900" fill="#607285">READYDORM</text>
      <text x="812" y="278" font-size="42" font-weight="900" fill="#082B49">SOS Ready</text>
      <rect x="812" y="314" width="208" height="58" rx="14" fill="#FFE7E5"/>
      <text x="838" y="350" font-size="18" font-weight="900" fill="#DE514B">Emergency profile</text>
      <rect x="812" y="392" width="208" height="58" rx="14" fill="#E7F8F5"/>
      <text x="838" y="428" font-size="18" font-weight="900" fill="#08796F">Exit B route</text>
      <rect x="812" y="470" width="208" height="58" rx="14" fill="#EEF3F8"/>
      <text x="838" y="506" font-size="18" font-weight="900" fill="#0E3B64">Manager dashboard</text>`
    : `
      <rect x="692" y="156" width="470" height="344" rx="30" fill="#FFFFFF" stroke="#D9E2EC" stroke-width="2"/>
      <rect x="734" y="212" width="146" height="94" rx="20" fill="#DDF7F3"/>
      <text x="764" y="268" font-size="20" font-weight="900" fill="#082B49">Research</text>
      <rect x="906" y="212" width="146" height="94" rx="20" fill="#EEF3F8"/>
      <text x="944" y="268" font-size="20" font-weight="900" fill="#082B49">Design</text>
      <rect x="734" y="336" width="146" height="94" rx="20" fill="#FFE7E5"/>
      <text x="772" y="392" font-size="20" font-weight="900" fill="#082B49">Build</text>
      <rect x="906" y="336" width="146" height="94" rx="20" fill="#E7F8F5"/>
      <text x="936" y="392" font-size="20" font-weight="900" fill="#082B49">Deploy</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${escapeXml(video.title)}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#F8FBFF"/>
      <stop offset="0.6" stop-color="#EEF5FA"/>
      <stop offset="1" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1120" cy="104" r="210" fill="${video.accent}" opacity="0.14"/>
  <rect x="64" y="70" width="1152" height="580" rx="42" fill="#FFFFFF" stroke="#D9E2EC" stroke-width="2"/>
  <text x="106" y="154" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="900" fill="${video.accent}">READYDORM</text>
  <text x="106" y="226" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="900" fill="#082B49">${escapeXml(video.title)}</text>
  <foreignObject x="108" y="248" width="520" height="52">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:28px;font-weight:800;line-height:1.2;color:#18324A">${escapeXml(video.subtitle)}</div>
  </foreignObject>
  <foreignObject x="108" y="316" width="540" height="140">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:23px;line-height:1.35;color:#607285">${escapeXml(video.caption)}</div>
  </foreignObject>
  <rect x="108" y="512" width="194" height="58" rx="14" fill="${video.accent}"/>
  <text x="150" y="548" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="900" fill="#FFFFFF">Watch demo</text>
  ${rightPanel}
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

  for (let i = 0; i < 60; i++) {
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
      document.body.style.background = "#ffffff";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
      const chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };

      const C = {
        navy: "#082B49",
        blue: "#0E3B64",
        text: "#18324A",
        muted: "#607285",
        border: "#D9E2EC",
        surface: "#F4F7FB",
        support: "#2EC5B6",
        supportSoft: "#DDF7F3",
        alert: "#FA6A63",
        alertSoft: "#FFE7E5",
        yellow: "#F4D45B"
      };

      function clamp(v, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
      function ease(v) { return 1 - Math.pow(1 - clamp(v), 3); }
      function rr(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }
      function fillRR(x, y, w, h, r, color) { rr(x, y, w, h, r); ctx.fillStyle = color; ctx.fill(); }
      function strokeRR(x, y, w, h, r, color = C.border, width = 1) { rr(x, y, w, h, r); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); ctx.lineWidth = 1; }
      function shadow(level = 1) {
        ctx.shadowColor = level > 1 ? "rgba(8,43,73,.22)" : "rgba(8,43,73,.12)";
        ctx.shadowBlur = level > 1 ? 32 : 20;
        ctx.shadowOffsetY = level > 1 ? 16 : 10;
      }
      function noShadow() { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
      function text(value, x, y, size, weight = 700, color = C.navy, align = "left") {
        ctx.font = weight + " " + size + "px Inter, Arial, sans-serif";
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(value, x, y);
        ctx.textAlign = "left";
      }
      function wrap(value, x, y, max, lh, size, color = C.muted, weight = 500) {
        ctx.font = weight + " " + size + "px Inter, Arial, sans-serif";
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
      function bg(t, title, subtitle) {
        const g = ctx.createLinearGradient(0, 0, 1280, 720);
        g.addColorStop(0, "#F8FBFF");
        g.addColorStop(0.58, "#EEF5FA");
        g.addColorStop(1, "#FFFFFF");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 1280, 720);
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = data.accent;
        ctx.beginPath();
        ctx.arc(1150, 82, 190 + Math.sin(t / 520) * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        text("READYDORM", 54, 54, 22, 900, data.accent);
        text(title, 54, 106, 42, 900, C.navy);
        if (subtitle) wrap(subtitle, 56, 138, 480, 24, 18, C.muted);
      }
      function progressBar(p) {
        fillRR(54, 674, 420, 14, 7, "#D9E2EC");
        fillRR(54, 674, 420 * p, 14, 7, data.accent);
      }
      function pill(label, x, y, color, bgColor) {
        fillRR(x, y, ctx.measureText(label).width + 34, 32, 9, bgColor);
        text(label, x + 16, y + 22, 13, 900, color);
      }
      function phoneFrame(x, y, w, h) {
        shadow(2);
        fillRR(x, y, w, h, 38, C.navy);
        noShadow();
        fillRR(x + 16, y + 26, w - 32, h - 52, 26, "#FFFFFF");
        fillRR(x + w / 2 - 42, y + 12, 84, 9, 5, "#0B2036");
        text("9:41", x + 38, y + 56, 12, 900, C.muted);
        text("ReadyDorm", x + 38, y + 86, 18, 900, C.blue);
      }
      function phoneNav(x, y, w, h, active) {
        const labels = ["Plan", "SOS", "Route", "Status"];
        const startY = y + h - 86;
        fillRR(x + 32, startY, w - 64, 46, 16, C.surface);
        labels.forEach((label, i) => {
          const cx = x + 58 + i * ((w - 116) / 3);
          ctx.fillStyle = i === active ? data.accent : C.muted;
          ctx.beginPath(); ctx.arc(cx, startY + 18, 5, 0, Math.PI * 2); ctx.fill();
          text(label, cx, startY + 36, 10, 900, i === active ? C.navy : C.muted, "center");
        });
      }
      function drawCheck(x, y, checked = true) {
        ctx.strokeStyle = checked ? C.support : C.border;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.stroke();
        if (checked) {
          ctx.beginPath();
          ctx.moveTo(x - 4, y);
          ctx.lineTo(x - 1, y + 4);
          ctx.lineTo(x + 6, y - 5);
          ctx.stroke();
        }
        ctx.lineWidth = 1;
      }
      function residentScreen(x, y, w, h, phase) {
        phoneFrame(x, y, w, h);
        const sx = x + 38, sy = y + 112;
        if (phase < 0.34) {
          text("Emergency profile", sx, sy, 24, 900);
          wrap("Medical information, trusted contacts, routes and backpack status in one place.", sx, sy + 32, w - 86, 19, 13);
          const items = [["Blood type", "O+"], ["Allergies", "Penicillin"], ["Contacts", "3 saved"], ["Backpack", "9 / 12 ready"]];
          items.forEach((item, i) => {
            const yy = sy + 90 + i * 54;
            fillRR(sx, yy, w - 76, 42, 12, i % 2 ? "#FFFFFF" : C.surface);
            strokeRR(sx, yy, w - 76, 42, 12, C.border);
            text(item[0], sx + 14, yy + 26, 13, 900, C.text);
            text(item[1], x + w - 58, yy + 26, 13, 900, i === 3 ? C.support : C.blue, "right");
          });
          phoneNav(x, y, w, h, 0);
        } else if (phase < 0.67) {
          text("SOS", sx, sy, 46, 900);
          wrap("Hold for 3 seconds to send location, medical profile and alert contacts.", sx, sy + 42, w - 86, 22, 15);
          const pulse = 1 + Math.sin(phase * 30) * 0.05;
          ctx.save();
          ctx.translate(x + w / 2, sy + 205);
          ctx.scale(pulse, pulse);
          ctx.fillStyle = C.alert;
          ctx.beginPath(); ctx.arc(0, 0, 72, 0, Math.PI * 2); ctx.fill();
          text("SOS", 0, 11, 32, 900, "#FFFFFF", "center");
          ctx.restore();
          fillRR(sx, sy + 305, w - 76, 40, 12, C.alertSoft);
          text("Safe check-in available", sx + 18, sy + 331, 14, 900, C.alert);
          phoneNav(x, y, w, h, 1);
        } else {
          text("Exit B route", sx, sy, 25, 900);
          wrap("Main corridor clear. Meeting point: front park.", sx, sy + 32, w - 86, 20, 14);
          fillRR(sx, sy + 84, w - 76, 228, 18, C.surface);
          strokeRR(sx, sy + 84, w - 76, 228, 18, C.border);
          ctx.strokeStyle = C.border;
          for (let gx = sx + 30; gx < x + w - 58; gx += 34) { ctx.beginPath(); ctx.moveTo(gx, sy + 98); ctx.lineTo(gx, sy + 296); ctx.stroke(); }
          for (let gy = sy + 118; gy < sy + 296; gy += 34) { ctx.beginPath(); ctx.moveTo(sx + 14, gy); ctx.lineTo(x + w - 58, gy); ctx.stroke(); }
          ctx.strokeStyle = C.support; ctx.lineWidth = 9; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(sx + 50, sy + 250); ctx.lineTo(sx + 116, sy + 188); ctx.lineTo(sx + 222, sy + 228); ctx.stroke();
          ctx.lineWidth = 1;
          ctx.fillStyle = C.alert; ctx.beginPath(); ctx.arc(sx + 50, sy + 250, 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = C.support; ctx.beginPath(); ctx.arc(sx + 222, sy + 228, 10, 0, Math.PI * 2); ctx.fill();
          phoneNav(x, y, w, h, 2);
        }
      }
      function floorPlan(x, y, w, h, p = 1) {
        fillRR(x, y, w, h, 20, "#FFFFFF");
        strokeRR(x, y, w, h, 20, C.border);
        text("Floor 3 evacuation map", x + 24, y + 38, 18, 900);
        pill("Exit B recommended", x + w - 188, y + 18, "#08796F", C.supportSoft);
        const fx = x + 26, fy = y + 72, fw = w - 52, fh = h - 116;
        fillRR(fx, fy, fw, fh, 18, "#EEF3F8");
        strokeRR(fx, fy, fw, fh, 18, "#CFDBE7");
        const rooms = [
          ["Room 301", fx + 28, fy + 30, "#EFFAF8", C.border],
          ["Room 304", fx + 160, fy + 30, C.alertSoft, C.alert],
          ["Room 305", fx + 292, fy + 30, "#FFFFFF", C.border],
          ["Room 306", fx + 424, fy + 30, "#FFFFFF", C.border],
          ["Stairs A", fx + 28, fy + 138, C.surface, C.border],
          ["Main corridor", fx + 160, fy + 138, "#FFFFFF", C.border],
          ["Exit B", fx + 424, fy + 138, C.supportSoft, C.support]
        ];
        rooms.forEach(([label, rx, ry, fill, stroke], i) => {
          const rw = label === "Main corridor" ? 230 : 104;
          fillRR(rx, ry, rw, 62, 10, fill);
          strokeRR(rx, ry, rw, 62, 10, stroke, label === "Room 304" || label === "Exit B" ? 2 : 1);
          text(label, rx + rw / 2, ry + 38, 13, 900, C.navy, "center");
        });
        ctx.strokeStyle = C.support; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(fx + 212, fy + 92);
        ctx.lineTo(fx + 212, fy + 170);
        ctx.lineTo(fx + 424 + 52 * p, fy + 170);
        ctx.lineTo(fx + 522, fy + 170);
        ctx.stroke();
        ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.moveTo(fx + 212, fy + 92); ctx.lineTo(fx + 80, fy + 170); ctx.stroke(); ctx.setLineDash([]);
        ctx.lineWidth = 1;
        ctx.fillStyle = C.alert; ctx.beginPath(); ctx.arc(fx + 212, fy + 92, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.support; ctx.beginPath(); ctx.arc(fx + 522, fy + 170, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(fx + 80, fy + 170, 8, 0, Math.PI * 2); ctx.fill();
        fillRR(fx + 385, fy + 224, 170, 36, 18, C.blue);
        text("Front park meeting point", fx + 470, fy + 247, 12, 900, "#FFFFFF", "center");
      }
      function managerDashboard(x, y, w, h, phase) {
        shadow(2);
        fillRR(x, y, w, h, 26, "#FFFFFF");
        noShadow();
        text("Residence dashboard", x + 28, y + 44, 20, 900);
        pill("Live drill", x + w - 124, y + 22, C.alert, C.alertSoft);
        const cards = [["42", "safe", C.support], ["8", "pending", C.yellow], ["2", "alerts", C.alert]];
        cards.forEach((card, i) => {
          const cx = x + 28 + i * 146;
          fillRR(cx, y + 74, 126, 86, 14, C.surface);
          strokeRR(cx, y + 74, 126, 86, 14, C.border);
          ctx.fillStyle = card[2]; ctx.beginPath(); ctx.arc(cx + 20, y + 98, 6, 0, Math.PI * 2); ctx.fill();
          text(card[0], cx + 18, y + 130, 25, 900);
          text(card[1], cx + 18, y + 151, 12, 800, C.muted);
        });
        floorPlan(x + 28, y + 180, w - 56, h - 208, phase);
      }
      function clinicCard(x, y) {
        shadow(1);
        fillRR(x, y, 262, 154, 18, "#FFFFFF");
        noShadow();
        text("Nearby support", x + 22, y + 36, 18, 900);
        [["Clinic San Pablo", "1.2 km"], ["Pharmacy", "650 m"], ["Police station", "2.0 km"]].forEach((row, i) => {
          const yy = y + 62 + i * 28;
          ctx.fillStyle = i === 0 ? C.alert : C.support;
          ctx.beginPath(); ctx.arc(x + 28, yy - 5, 5, 0, Math.PI * 2); ctx.fill();
          text(row[0], x + 42, yy, 13, 800, C.text);
          text(row[1], x + 232, yy, 13, 900, C.muted, "right");
        });
      }
      function backpackCard(x, y) {
        shadow(1);
        fillRR(x, y, 262, 154, 18, "#FFFFFF");
        noShadow();
        text("72-hour backpack", x + 22, y + 36, 18, 900);
        [["Water", true], ["Documents", true], ["Medication", true], ["Radio", false]].forEach((row, i) => {
          const yy = y + 64 + i * 22;
          drawCheck(x + 30, yy - 5, row[1]);
          text(row[0], x + 48, yy, 13, 800, C.text);
        });
        text("9 / 12 ready", x + 238, y + 128, 14, 900, C.support, "right");
      }
      function productFrame(t) {
        const p = clamp(t / 11800);
        bg(t, "About the Product", "SafetyTech platform for residents, managers and emergency contacts.");
        const stage = Math.floor(p * 4);
        const local = (p * 4) % 1;
        const slide = ease(local);
        residentScreen(60, 174, 318, 470, p);
        if (stage === 0) {
          shadow(1);
          fillRR(430, 180, 740, 416, 28, "#FFFFFF");
          noShadow();
          text("Prepare before risk", 466, 230, 34, 900);
          wrap("Emergency profile, trusted contacts, 72-hour backpack, and evacuation routes are ready before a crisis happens.", 468, 266, 500, 28, 20);
          backpackCard(468, 364);
          clinicCard(760, 364);
          pill("46 functional stories represented", 468, 538, C.blue, C.surface);
        } else if (stage === 1) {
          shadow(1);
          fillRR(430, 180, 740, 416, 28, "#FFFFFF");
          noShadow();
          text("Respond in seconds", 466, 230, 34, 900);
          wrap("Hold-to-send SOS, voice trigger, flashlight support, false alarm cancellation and safe check-ins reduce confusion.", 468, 266, 520, 28, 20);
          managerDashboard(468, 330, 650, 236, slide);
        } else if (stage === 2) {
          managerDashboard(430, 166, 740, 450, slide);
        } else {
          shadow(1);
          fillRR(430, 180, 740, 416, 28, "#FFFFFF");
          noShadow();
          text("Coordinate everyone", 466, 230, 34, 900);
          wrap("Roommates, family contacts and residence managers share status, routes, sensor signals and incident reports.", 468, 266, 520, 28, 20);
          const chips = ["Roommates", "Family alerts", "IoT sensors", "Manager reports", "Drills and badges"];
          chips.forEach((chip, i) => {
            pill(chip, 468 + (i % 2) * 250, 354 + Math.floor(i / 2) * 58, i === 2 ? C.alert : C.blue, i === 2 ? C.alertSoft : C.surface);
          });
        }
        progressBar(p);
      }
      function processBoard(x, y, w, h, phase) {
        shadow(2);
        fillRR(x, y, w, h, 26, "#FFFFFF");
        noShadow();
        text("Project delivery board", x + 28, y + 44, 20, 900);
        const columns = [
          ["Research", ["Interviews", "Personas", "Needfinding"]],
          ["UX/UI", ["Wireframes", "Mock-ups", "User flows"]],
          ["Build", ["HTML/CSS/JS", "Videos", "Responsive QA"]],
          ["Deploy", ["GitFlow", "GitHub Pages", "README"]]
        ];
        columns.forEach((col, i) => {
          const cx = x + 28 + i * ((w - 56) / 4);
          const cw = (w - 80) / 4;
          fillRR(cx, y + 72, cw, h - 100, 18, C.surface);
          text(col[0], cx + 18, y + 104, 16, 900, C.navy);
          col[1].forEach((item, j) => {
            const reveal = clamp(phase * 5 - i * 0.8 - j * 0.18);
            ctx.globalAlpha = reveal;
            fillRR(cx + 16, y + 128 + j * 56, cw - 32, 42, 12, "#FFFFFF");
            strokeRR(cx + 16, y + 128 + j * 56, cw - 32, 42, 12, C.border);
            text(item, cx + 30, y + 154 + j * 56, 13, 850, C.text);
            ctx.globalAlpha = 1;
          });
        });
      }
      function teamCard(x, y, name, role, color) {
        fillRR(x, y, 206, 82, 18, "#FFFFFF");
        strokeRR(x, y, 206, 82, 18, C.border);
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x + 38, y + 41, 20, 0, Math.PI * 2); ctx.fill();
        text(name, x + 70, y + 35, 14, 900, C.navy);
        text(role, x + 70, y + 58, 12, 800, C.muted);
      }
      function teamFrame(t) {
        const p = clamp(t / 11800);
        bg(t, "About the Team", "Five students turned the ReadyDorm report into a deployed landing page.");
        const stage = Math.floor(p * 3);
        const local = (p * 3) % 1;
        const e = ease(local);
        if (stage === 0) {
          processBoard(80, 186, 1080, 400, e);
          pill("Course: IHC y Tecnologias Moviles", 88, 620, C.blue, C.surface);
          pill("SafetyTech residential platform", 368, 620, C.alert, C.alertSoft);
        } else if (stage === 1) {
          shadow(1);
          fillRR(80, 176, 1080, 420, 28, "#FFFFFF");
          noShadow();
          text("Team responsibilities", 116, 226, 34, 900);
          wrap("The landing page communicates the same product scope documented in the report: segments, user stories, mobile UX, implementation and deployment.", 118, 264, 650, 27, 19);
          const names = [
            ["Junior", "Repository and structure", C.support],
            ["Abraham", "UX content and flows", C.alert],
            ["Patrik", "Responsive interface", C.blue],
            ["Gricel", "Accessibility and QA", C.yellow],
            ["Victor", "Deployment and polish", C.support]
          ];
          names.forEach((n, i) => teamCard(118 + (i % 3) * 238, 360 + Math.floor(i / 3) * 104, n[0], n[1], n[2]));
          fillRR(846, 246, 224, 238, 22, C.surface);
          text("Delivery", 878, 294, 25, 900);
          [["English", true], ["Responsive", true], ["Videos", true], ["GitHub Pages", true]].forEach((item, i) => {
            drawCheck(880, 334 + i * 34, true);
            text(item[0], 902, 339 + i * 34, 14, 850, C.text);
          });
        } else {
          shadow(1);
          fillRR(80, 176, 1080, 420, 28, "#FFFFFF");
          noShadow();
          text("Final website evidence", 116, 226, 34, 900);
          wrap("The page is written in English, includes product and team videos, keeps accessibility practices visible, and adds a complete product detail page for the extra modules.", 118, 264, 680, 27, 19);
          fillRR(122, 364, 286, 92, 18, C.supportSoft);
          text("GitHub Pages", 150, 404, 20, 900, C.navy);
          text("readydorm.github.io", 150, 432, 15, 850, "#08796F");
          fillRR(446, 364, 286, 92, 18, C.alertSoft);
          text("No frameworks", 474, 404, 20, 900, C.navy);
          text("HTML, CSS, JavaScript", 474, 432, 15, 850, C.alert);
          fillRR(770, 364, 286, 92, 18, C.surface);
          text("Product scope", 798, 404, 20, 900, C.navy);
          text("46 user stories represented", 798, 432, 15, 850, C.blue);
        }
        progressBar(p);
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
          if (elapsed < 12000) requestAnimationFrame(tick);
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
