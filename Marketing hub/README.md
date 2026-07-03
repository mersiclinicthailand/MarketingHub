# Mersi Marketing Hub

ศูนย์รวมทุก Dashboard ของ Mersi Clinic ไว้ในเว็บเดียว — Login กลาง + สิทธิ์ตาม role + Admin Panel ในเว็บ + ฐานข้อมูล Google Sheet + Dark mode

## โครงสร้างไฟล์

```
Marketing hub/
├── index.html            ← ตัวแอป Hub (เปิดไฟล์นี้)
├── dashboards.config.js  ← config เริ่มต้น (ผู้ใช้/dashboard สำรอง + ที่วาง API URL)
├── apps-script/Code.gs   ← ★ backend วางใน Google Sheet (ดูขั้นตอนด้านล่าง)
├── hash-tool.html        ← เครื่องมือสร้าง hash รหัสผ่าน
├── assets/fonts/         ← ฟอนต์แบรนด์ (DB Helvethaica X + TT Ramillas)
├── dashboards/           ← วางโฟลเดอร์ dashboard HTML เพิ่มเติมได้
└── README.md
```

## ★ เชื่อมฐานข้อมูล Google Sheet (แนะนำ — ทำครั้งเดียว ~3 นาที)

เมื่อเชื่อมแล้ว: **สร้าง/ปิด/ลบผู้ใช้ได้ในเว็บทันที ใช้ร่วมกันทุกเครื่อง** + เพิ่ม dashboard ได้จากชีตโดยไม่ต้องแก้โค้ด + เก็บ log การใช้งาน + ตั้งประกาศหน้าแรก

1. สร้าง Google Sheet ใหม่ (sheets.new) ตั้งชื่อ `Mersi Hub Database`
2. Extensions → **Apps Script** → ลบโค้ดเดิม → วางเนื้อหาไฟล์ `apps-script/Code.gs` ทั้งหมด → Save
3. เลือกฟังก์ชัน **setup** แล้วกด **Run** (กดอนุญาตสิทธิ์ครั้งแรก) → ระบบสร้างแท็บให้อัตโนมัติ: USERS · DASHBOARDS · CATEGORIES · ACTIVITY_LOG · ANNOUNCEMENTS พร้อมผู้ใช้เริ่มต้นและ dashboard ครบ 13 ตัว
4. **Deploy → New deployment → Web app** · Execute as: `Me` · Who has access: `Anyone` → Deploy → คัดลอก URL `/exec`
5. เปิด Hub → login `admin` → เมนู **ผู้ดูแลระบบ** → วาง URL → ทดสอบ → บันทึก ✓

ไม่เชื่อมก็ยังใช้ได้: ระบบทำงาน "โหมดในเครื่อง" จาก dashboards.config.js เหมือนเดิม (แท็บ admin จะเก็บผู้ใช้ในเบราว์เซอร์ + มีปุ่มคัดลอก config)

## แท็บผู้ดูแลระบบ (เห็นเฉพาะ role admin)

- **ผู้ใช้งาน** — สร้างผู้ใช้ใหม่ (username/ชื่อ/role/รหัสผ่าน), เปิด-ปิดการใช้งาน, ตั้งรหัสใหม่, ลบ · รหัสผ่านถูกแฮชเป็น SHA-256 ก่อนส่งเสมอ
- **การเชื่อมต่อ** — วาง/ทดสอบ Web App URL ของ Google Sheet
- **ประกาศ** — ตั้งข้อความแจ้งทีมบนหน้าแรก (ทั่วไป/สำคัญ)
- **สถิติ** (เมื่อเชื่อม Sheet) — จำนวนครั้งเปิดใช้, dashboard ยอดนิยม, กิจกรรมล่าสุด

## ฟีเจอร์ใหม่ v2

- 🌙 **Dark mode** (Midnight Forest) — ปุ่ม ☾ มุมขวาบน จำค่าอัตโนมัติ
- ⌘ **Command Palette** — Ctrl+K ค้นหา/เปิด dashboard ด้วยคีย์บอร์ด (↑↓ + Enter)
- ✨ พื้นหลัง Aurora + เงาแก้ว + การ์ดไล่จังหวะ (stagger) + ตัวเลขนับขึ้น
- 🟢 จุด LIVE บน dashboard ที่เป็น real-time
- 📣 แถบประกาศจากทีม admin
- 📊 เก็บ log ทุกครั้งที่เปิด dashboard (เมื่อเชื่อม Sheet)

## Dashboard ที่ใส่ให้แล้ว (ตรวจสถานะออนไลน์ 2 ก.ค. 2569)

| หมวด | Dashboard |
|---|---|
| Sales & Revenue | Sales Dashboard Group · Branch Revenue Monitoring · Sales Intelligence Offline×Online · Market & Sales Intelligence · Mersi Dashboard (Apps Script) |
| Ads & Performance | Ads Daily Performance · Ads Creative Performance · Customer Insight & FB Ads |
| CRM | CRM Overview · CRM เปรียบเทียบสาขา · CRM Ranking พนักงาน |
| Inventory | รายงานสินค้าสูญหาย · อันดับคลังที่สูญเสียสูงสุด |

repo ที่ยังไม่ยืนยันสถานะ (Marketingteams, AllSale ฯลฯ) อยู่ในบล็อกคอมเมนต์ท้าย config — ลบ `//` ออกเพื่อเปิดใช้

## เริ่มใช้งาน

1. เปิด `index.html`
2. Login ทดสอบ: `admin` / `admin1234` · `marketing` / `mkt1234` · `area` / `area1234`
3. **เปลี่ยนรหัสผ่านก่อนใช้จริง** — เปิด `hash-tool.html` สร้าง hash แล้ววางใน `dashboards.config.js`

## ฟอนต์แบรนด์ — ★ ต้องทำ 1 ขั้นตอน

หัวข้อ/โลโก้: **TT Ramillas** (serif ตรงกับโลโก้) · เนื้อหา: **DB Helvethaica X** · ตัวเลข: **DB HelvethaicaMon X** — ไม่พึ่ง Google Fonts

**ติดตั้งฟอนต์ (เลือกวิธีใดวิธีหนึ่ง):**

1. **จากไฟล์ zip ที่ Claude เตรียมให้** — แตก `mersi-hub-fonts.zip` (ไฟล์ .woff2 ขนาดเล็ก 8 ไฟล์) ลงโฟลเดอร์ `assets/fonts/`
2. **จาก Font.zip ของคุณเอง** — แตก Font.zip แล้วก๊อป 8 ไฟล์นี้ไปวางใน `assets/fonts/` (ใช้ชื่อเดิม ไม่ต้องเปลี่ยน):
   `DB Helvethaica X v3.2.ttf` · `DB Helvethaica X Med v3.2.ttf` · `DB Helvethaica X Bd v3.2.ttf` · `DB Helvethaica X Li.ttf` · `DB HelvethaicaMon X Med.ttf` · `TT Ramillas Trial Light.ttf` · `TT Ramillas Trial Medium.ttf` · `TT Ramillas Trial Bold.ttf`

index.html หาฟอนต์เองตามลำดับ: ฟอนต์ที่ติดตั้งในเครื่อง → .woff2 → .ttf (มีอันไหนก็ใช้ได้เลย ถ้าไม่มีเลยจะ fallback เป็นฟอนต์ระบบ — หน้าเว็บยังใช้งานได้ปกติ)

- โลโก้เป็นแบบวาดด้วยโค้ด (วงกลม sage + Mersi CLINIC ฟอนต์ตรงแบรนด์) — ถ้าต้องการใช้ไฟล์ PNG จริง: วางเป็น `assets/logo.png` แล้วเปิดบรรทัด `logo:` ใน config
- ⚠️ ถ้าโฮสต์แบบ public ไฟล์ฟอนต์จะดาวน์โหลดได้จากเว็บ — ตรวจว่า license ครอบคลุม (TT Ramillas ที่ให้มาเป็นเวอร์ชัน Trial)

## วิธีเพิ่ม Dashboard

เพิ่มบล็อกใน `dashboards: [...]`:

```js
{
  id: "new-dash",                    // ห้ามซ้ำ
  title: "ชื่อ Dashboard",
  desc: "คำอธิบายสั้นๆ",
  category: "sales",                 // sales / ads / crm / inventory
  icon: "◆",
  url: "https://mersiclinicthailand.github.io/ชื่อrepo/",
  embed: true,                       // true = เปิดใน Hub / false = แท็บใหม่
  roles: ["marketing", "area"],      // admin เห็นทุกอันเสมอ
  tags: ["real-time"],
},
```

| ประเภท | url | embed |
|---|---|---|
| GitHub Pages | `https://mersiclinicthailand.github.io/repo/` | `true` ✓ |
| โฟลเดอร์ HTML ในเครื่อง | ย้ายเข้า `dashboards/` → `"dashboards/ชื่อ/index.html"` | `true` |
| Apps Script Web App | URL `.../exec` | ต้องแก้ .gs ก่อน (ด้านล่าง) |
| Looker Studio | ลิงก์ Embed | `true` |

## ⚠️ Apps Script ต้องเปิด iframe ก่อน embed

ใน `doGet` ของไฟล์ `.gs` ต้อง return:

```js
return HtmlService.createHtmlOutputFromFile("index")
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
```

แล้ว Deploy ใหม่ → เปลี่ยน `embed: false` เป็น `true` ใน config
(ตอนนี้ตัว Apps Script ตั้งเป็นเปิดแท็บใหม่ไว้ก่อน)

## การโฮสต์ (เลือก 1)

| วิธี | เหมาะกับ | ทำยังไง |
|---|---|---|
| **GitHub Pages** (แนะนำ — ใช้อยู่แล้ว) | ทีมใช้จากทุกที่ | สร้าง repo ใหม่ เช่น `MarketingHub` → push โฟลเดอร์นี้ → เปิด Pages |
| Netlify Drop | ไม่อยาก push git | ลากโฟลเดอร์ไปวางที่ app.netlify.com/drop |
| ในเครื่อง | ทดสอบ | ดับเบิลคลิก `index.html` |

## ความปลอดภัย — ต้องรู้

- Login ของ Hub เป็น client-side: กันคนทั่วไป/จัดสิทธิ์การมองเห็นในทีมได้ แต่กันโปรแกรมเมอร์ที่ตั้งใจเจาะไม่ได้
- Dashboard สำคัญ (CRM, Revenue) มี login ของตัวเองอีกชั้นอยู่แล้ว — ปลอดภัยสองชั้น
- อัปเกรดเป็น auth ผ่าน Apps Script/Firebase ได้ภายหลังโดยไม่ต้องรื้อโครงสร้าง

## ฟีเจอร์

- Login กลาง + role (admin เห็นทุกอัน) · session 12 ชม.
- ค้นหา Ctrl+K · รายการโปรด ★ · เปิดล่าสุด · หมวดหมู่ 4 กลุ่ม
- Viewer ในตัว: Refresh / เปิดแท็บใหม่ / เต็มจอ · Esc = กลับ
- ลิงก์ตรง: `index.html#d/sale` เปิด dashboard นั้นทันทีหลัง login
- Responsive มือถือ
