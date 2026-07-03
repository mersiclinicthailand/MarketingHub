/* ============================================================
   MERSI MARKETING HUB — BACKEND API (Google Apps Script)
   ฐานข้อมูล = Google Sheet (สร้างอัตโนมัติด้วยฟังก์ชัน setup)

   วิธีติดตั้ง (ครั้งเดียว ~3 นาที):
   1. สร้าง Google Sheet ใหม่ (sheets.new) ตั้งชื่อ "Mersi Hub Database"
   2. Extensions → Apps Script → ลบโค้ดเดิม → วางไฟล์นี้ทั้งหมด → Save
   3. เลือกฟังก์ชัน setup แล้วกด Run (อนุญาตสิทธิ์ครั้งแรก)
      → ชีตทุกแท็บ + ผู้ใช้เริ่มต้น + dashboard ทั้งหมดถูกสร้างให้อัตโนมัติ
   4. Deploy → New deployment → Web app
      Execute as: Me · Who has access: Anyone → Deploy → คัดลอก URL /exec
   5. เปิด Hub → login ด้วย admin → แท็บ "ผู้ดูแลระบบ" → วาง URL → บันทึก
   ============================================================ */

const SHEETS = {
  USERS: "USERS",
  DASHBOARDS: "DASHBOARDS",
  CATEGORIES: "CATEGORIES",
  LOG: "ACTIVITY_LOG",
  ANNOUNCE: "ANNOUNCEMENTS",
};
const TOKEN_TTL = 21600; // 6 ชั่วโมง (สูงสุดของ CacheService)

/* ---------------- HTTP entrypoints ---------------- */
function doGet() {
  return json_({ ok: true, name: "Mersi Hub API", time: new Date().toISOString() });
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents || "{}");
    const action = req.action || "";
    const data = req.data || {};

    if (action === "ping")  return json_({ ok: true, name: "Mersi Hub API", time: new Date().toISOString() });
    if (action === "login") return login_(data);

    // ทุก action ต่อจากนี้ต้องมี token
    const user = auth_(req.token);
    if (!user) return json_({ ok: false, error: "TOKEN_EXPIRED" });

    if (action === "getConfig") return getConfig_();
    if (action === "logOpen")   return logOpen_(user, data);

    // เฉพาะ admin
    if (user.role !== "admin") return json_({ ok: false, error: "FORBIDDEN" });

    if (action === "listUsers")       return listUsers_();
    if (action === "addUser")         return addUser_(user, data);
    if (action === "setActive")       return setActive_(user, data);
    if (action === "resetPassword")   return resetPassword_(user, data);
    if (action === "deleteUser")      return deleteUser_(user, data);
    if (action === "setAnnouncement") return setAnnouncement_(user, data);
    if (action === "stats")           return stats_();

    return json_({ ok: false, error: "UNKNOWN_ACTION" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ---------------- Auth ---------------- */
function login_(d) {
  const sh = sheet_(SHEETS.USERS);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const [username, hash, displayName, role, active] = rows[i];
    if (String(username).toLowerCase() === String(d.username || "").toLowerCase()
        && String(hash) === String(d.hash)
        && String(active) === "TRUE") {
      const token = Utilities.getUuid();
      const u = { username: String(username), displayName: String(displayName), role: String(role) };
      CacheService.getScriptCache().put("tok_" + token, JSON.stringify(u), TOKEN_TTL);
      sh.getRange(i + 1, 7).setValue(new Date()); // lastLogin
      log_(u.username, "login", "");
      return json_({ ok: true, token: token, user: u });
    }
  }
  return json_({ ok: false, error: "INVALID_LOGIN" });
}

function auth_(token) {
  if (!token) return null;
  const s = CacheService.getScriptCache().get("tok_" + token);
  return s ? JSON.parse(s) : null;
}

/* ---------------- Config (dashboards + categories + announcement) ---------------- */
function getConfig_() {
  const cats = readAll_(SHEETS.CATEGORIES)
    .filter(r => r.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(r => ({ id: r.id, label: r.label, icon: r.icon }));

  const dashes = readAll_(SHEETS.DASHBOARDS)
    .filter(r => r.id && String(r.active) === "TRUE")
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(r => ({
      id: r.id, title: r.title, desc: r.desc, category: r.category,
      icon: r.icon, url: r.url,
      embed: String(r.embed) === "TRUE",
      roles: String(r.roles || "").split(",").map(s => s.trim()).filter(Boolean),
      tags:  String(r.tags  || "").split(",").map(s => s.trim()).filter(Boolean),
    }));

  const annRows = readAll_(SHEETS.ANNOUNCE).filter(r => String(r.active) === "TRUE" && r.text);
  const ann = annRows.length ? { text: annRows[annRows.length - 1].text, level: annRows[annRows.length - 1].level || "info" } : null;

  return json_({ ok: true, categories: cats, dashboards: dashes, announcement: ann });
}

/* ---------------- Users (admin) ---------------- */
function listUsers_() {
  const users = readAll_(SHEETS.USERS).filter(r => r.username).map(r => ({
    username: r.username, displayName: r.displayName, role: r.role,
    active: String(r.active) === "TRUE",
    createdAt: fmt_(r.createdAt), lastLogin: fmt_(r.lastLogin),
  }));
  return json_({ ok: true, users: users });
}

function addUser_(admin, d) {
  if (!d.username || !d.hash || !d.role) return json_({ ok: false, error: "MISSING_FIELDS" });
  const sh = sheet_(SHEETS.USERS);
  const exists = readAll_(SHEETS.USERS).some(r => String(r.username).toLowerCase() === String(d.username).toLowerCase());
  if (exists) return json_({ ok: false, error: "USER_EXISTS" });
  sh.appendRow([d.username, d.hash, d.displayName || d.username, d.role, "TRUE", new Date(), ""]);
  log_(admin.username, "addUser", d.username + " (" + d.role + ")");
  return json_({ ok: true });
}

function setActive_(admin, d) {
  const row = findUserRow_(d.username);
  if (!row) return json_({ ok: false, error: "NOT_FOUND" });
  sheet_(SHEETS.USERS).getRange(row, 5).setValue(d.active ? "TRUE" : "FALSE");
  log_(admin.username, d.active ? "enableUser" : "disableUser", d.username);
  return json_({ ok: true });
}

function resetPassword_(admin, d) {
  const row = findUserRow_(d.username);
  if (!row) return json_({ ok: false, error: "NOT_FOUND" });
  sheet_(SHEETS.USERS).getRange(row, 2).setValue(d.hash);
  log_(admin.username, "resetPassword", d.username);
  return json_({ ok: true });
}

function deleteUser_(admin, d) {
  if (String(d.username).toLowerCase() === String(admin.username).toLowerCase())
    return json_({ ok: false, error: "CANNOT_DELETE_SELF" });
  const row = findUserRow_(d.username);
  if (!row) return json_({ ok: false, error: "NOT_FOUND" });
  sheet_(SHEETS.USERS).deleteRow(row);
  log_(admin.username, "deleteUser", d.username);
  return json_({ ok: true });
}

function findUserRow_(username) {
  const rows = sheet_(SHEETS.USERS).getDataRange().getValues();
  for (let i = 1; i < rows.length; i++)
    if (String(rows[i][0]).toLowerCase() === String(username || "").toLowerCase()) return i + 1;
  return 0;
}

/* ---------------- Announcement / Log / Stats ---------------- */
function setAnnouncement_(admin, d) {
  const sh = sheet_(SHEETS.ANNOUNCE);
  const n = sh.getLastRow();
  if (n > 1) sh.getRange(2, 3, n - 1, 1).setValue("FALSE"); // ปิดของเก่า
  if (d.text) sh.appendRow([d.text, d.level || "info", "TRUE", new Date()]);
  log_(admin.username, "setAnnouncement", d.text || "(ลบประกาศ)");
  return json_({ ok: true });
}

function logOpen_(user, d) {
  log_(user.username, "open", d.dash || "");
  return json_({ ok: true });
}

function log_(username, action, detail) {
  try { sheet_(SHEETS.LOG).appendRow([new Date(), username, action, detail]); } catch (e) {}
}

function stats_() {
  const rows = readAll_(SHEETS.LOG);
  const opens = rows.filter(r => r.action === "open");
  const byDash = {};
  opens.forEach(r => { byDash[r.detail] = (byDash[r.detail] || 0) + 1; });
  const top = Object.keys(byDash).map(k => ({ id: k, count: byDash[k] }))
    .sort((a, b) => b.count - a.count).slice(0, 8);
  const recent = rows.slice(-25).reverse().map(r => ({
    time: fmt_(r.timestamp), user: r.username, action: r.action, detail: r.detail,
  }));
  const userCount = readAll_(SHEETS.USERS).filter(r => r.username).length;
  return json_({ ok: true, topDashboards: top, recent: recent, userCount: userCount, openCount: opens.length });
}

/* ---------------- helpers ---------------- */
function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function readAll_(name) {
  const values = sheet_(name).getDataRange().getValues();
  if (values.length < 2) return [];
  const head = values[0].map(h => String(h).trim());
  return values.slice(1).map(row => {
    const o = {};
    head.forEach((h, i) => { o[h] = row[i]; });
    return o;
  });
}

function fmt_(v) {
  if (!v) return "";
  try { return Utilities.formatDate(new Date(v), "Asia/Bangkok", "d MMM yyyy HH:mm"); }
  catch (e) { return String(v); }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================
   SETUP — รันครั้งเดียว: สร้างทุกแท็บ + ข้อมูลเริ่มต้นครบชุด
   ============================================================ */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  init_(ss, SHEETS.USERS,
    ["username", "passwordHash", "displayName", "role", "active", "createdAt", "lastLogin"],
    [
      ["admin",     "ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270", "Administrator",  "admin",     "TRUE", new Date(), ""],
      ["marketing", "c8c13b5091814bfa11c4cb4e6c388302e7fcd947d73ed57c0f523bf0ee4775dd", "Marketing Team", "marketing", "TRUE", new Date(), ""],
      ["area",      "09cba1217a060a1b487fd2a246c502a24e7d4600785758637bd0b1a90c126a6e", "Area Manager",   "area",      "TRUE", new Date(), ""],
    ]);

  init_(ss, SHEETS.CATEGORIES,
    ["id", "label", "icon", "order"],
    [
      ["sales",     "Sales & Revenue",   "◆", 1],
      ["ads",       "Ads & Performance", "◇", 2],
      ["crm",       "CRM ติดตามลูกค้า",   "▣", 3],
      ["inventory", "Inventory & คลัง",   "▤", 4],
    ]);

  init_(ss, SHEETS.DASHBOARDS,
    ["id", "title", "desc", "category", "icon", "url", "embed", "roles", "tags", "order", "active"],
    [
      ["sale", "Sales Dashboard — Group", "ภาพรวมยอดขาย 15 สาขา Real-time จาก MASTER_DATA อัปเดตทุก 5 นาที", "sales", "◆", "https://mersiclinicthailand.github.io/Sale/", "TRUE", "marketing,area", "real-time,15 สาขา", 1, "TRUE"],
      ["allsalenew", "Branch Revenue Monitoring", "Monitoring ยอดขายรายสาขา + Online Booking + Total Customer", "sales", "◈", "https://mersiclinicthailand.github.io/AllSaleNew/", "TRUE", "marketing,area", "monitoring,area", 2, "TRUE"],
      ["sale-off-on", "Sales Intelligence — Offline × Online", "ยอดขายหน้าสาขา 14 สาขา เทียบออนไลน์ 15 เพจ ปี 2569", "sales", "❖", "https://mersiclinicthailand.github.io/SaleOfflineSaleOnline/", "TRUE", "marketing,area", "offline,online", 3, "TRUE"],
      ["market-intel", "Market & Sales Intelligence", "วิเคราะห์ตลาด ลูกค้า กลยุทธ์รายสาขา จากรายงานประจำเดือน", "sales", "✦", "https://mersiclinicthailand.github.io/MersiSaleBranch/", "TRUE", "marketing", "กลยุทธ์,รายเดือน", 4, "TRUE"],
      ["sheets-dashboard", "Mersi Dashboard (Apps Script)", "ยอดขาย/ลูกค้า 14 สาขา จาก DATA_ENTRY ผ่าน Apps Script", "sales", "▦", "https://script.google.com/macros/s/AKfycbz6grHmYmr8jjgLWMAEkRhwyL7B64x59mwqNoBsoRlnKI8SvbthG35NkdZfE696x9lf/exec", "FALSE", "marketing,area", "apps script", 5, "TRUE"],
      ["ads-performance", "Ads Daily Performance", "FB/IG Ads × ยอดขาย 15 เพจ · ROAS CPL Conversion เทรนด์รายวัน", "ads", "◇", "https://mersiclinicthailand.github.io/AdsPerformance/", "TRUE", "marketing", "ROAS,CPL", 6, "TRUE"],
      ["ads-creative", "Ads Creative Performance", "รีวิวครีเอทีฟ PICO · HIFU · Diode · G5 พร้อม ROAS รายชิ้น", "ads", "◎", "https://mersiclinicthailand.github.io/AdsCreative/", "TRUE", "marketing", "creative", 7, "TRUE"],
      ["customer-insight", "Customer Insight & FB Ads", "วิเคราะห์กลุ่มลูกค้า + แนวทางผลิตสื่อ รายเพจ/รายสาขา", "ads", "✧", "https://mersiclinicthailand.github.io/Adminform/", "TRUE", "marketing", "insight", 8, "TRUE"],
      ["crm-overview", "CRM ติดตามลูกค้า — Overview", "ภาพรวมติดตามลูกค้า ทำนัดสำเร็จ + Ranking พนักงาน", "crm", "▣", "https://mersiclinicthailand.github.io/Mersi_Dashboard/", "TRUE", "marketing,area", "follow-up", 9, "TRUE"],
      ["crm-branch", "CRM เปรียบเทียบสาขา", "Branch Performance Comparison รายสาขา Stacked Bar", "crm", "▥", "https://mersiclinicthailand.github.io/Mersi_Branchs/", "TRUE", "marketing,area", "สาขา", 10, "TRUE"],
      ["crm-ranking", "CRM Ranking พนักงาน", "Staff Performance Ranking ตามยอดติดตาม/ทำนัด", "crm", "♕", "https://mersiclinicthailand.github.io/Mersi_Ranking/", "TRUE", "marketing,area", "ranking", 11, "TRUE"],
      ["inventory-loss", "รายงานสินค้าสูญหาย", "Inventory Loss ผู้บริหาร — มูลค่าเสียหาย สาเหตุ แนวโน้ม + CSV", "inventory", "▤", "https://mersiclinicthailand.github.io/MersiInventory/", "TRUE", "marketing", "loss", 12, "TRUE"],
      ["inventory-ranking", "อันดับคลังที่สูญเสียสูงสุด", "Warehouse Loss Ranking ตามมูลค่าความเสียหาย", "inventory", "▧", "https://mersiclinicthailand.github.io/MersiInventoryRanking/", "TRUE", "marketing", "ranking,คลัง", 13, "TRUE"],
    ]);

  init_(ss, SHEETS.LOG, ["timestamp", "username", "action", "detail"], []);

  init_(ss, SHEETS.ANNOUNCE,
    ["text", "level", "active", "updatedAt"],
    [["ยินดีต้อนรับสู่ Mersi Marketing Hub — ระบบเชื่อม Google Sheet เรียบร้อย ✓", "info", "TRUE", new Date()]]);

  // ลบ Sheet1 เปล่าถ้ามี
  const s1 = ss.getSheetByName("Sheet1") || ss.getSheetByName("ชีต1");
  if (s1 && ss.getSheets().length > 1 && s1.getLastRow() === 0) ss.deleteSheet(s1);
}

function init_(ss, name, headers, rows) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() > 0) return; // มีข้อมูลแล้ว ไม่เขียนทับ
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold").setBackground("#1B231D").setFontColor("#E7D9BB");
  if (rows.length) sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}
