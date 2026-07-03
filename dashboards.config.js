/* ============================================================
   MERSI MARKETING HUB — CONFIG
   ไฟล์เดียวที่ต้องแก้เมื่อเพิ่ม dashboard / ผู้ใช้ / หมวดหมู่
   ============================================================ */

window.HUB_CONFIG = {

  brand: {
    name: "Mersi",
    sub: "Clinic · Marketing Hub",
    tagline: "ศูนย์รวมทุก Dashboard — Real-time จาก Google Sheets",
    // logo: "assets/logo.png",   // ← มีไฟล์โลโก้จริงเมื่อไร วางไฟล์แล้วเปิดบรรทัดนี้
  },

  /* ---------- Google Sheet Backend (ตัวเลือก แนะนำ) ----------
     ติดตั้งตามขั้นตอนใน apps-script/Code.gs แล้ววาง Web App URL ที่นี่
     (หรือวางในแท็บ "ผู้ดูแลระบบ" ในเว็บก็ได้ — ค่าในเว็บจะชนะค่านี้)
     เมื่อเชื่อมแล้ว: ผู้ใช้/dashboard/ประกาศ อ่านจาก Google Sheet ทั้งหมด
     และแท็บ admin จะสร้าง-ปิด-ลบผู้ใช้ได้จริงข้ามทุกเครื่อง              */
  api: {
    url: "",   // ← วาง https://script.google.com/macros/s/…/exec
  },

  /* ---------- ผู้ใช้ + สิทธิ์ ----------
     role "admin" เห็นทุก dashboard · role อื่นเห็นเฉพาะที่ระบุไว้
     passwordHash = SHA-256 → สร้างจาก hash-tool.html
     ค่าเริ่มต้น: admin/admin1234, marketing/mkt1234, area/area1234
     ⚠️ เปลี่ยนรหัสก่อนใช้งานจริง                                    */
  users: [
    { username: "admin",     displayName: "Administrator", role: "admin",
      passwordHash: "ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270" },
    { username: "marketing", displayName: "Marketing Team", role: "marketing",
      passwordHash: "c8c13b5091814bfa11c4cb4e6c388302e7fcd947d73ed57c0f523bf0ee4775dd" },
    { username: "area",      displayName: "Area Manager", role: "area",
      passwordHash: "09cba1217a060a1b487fd2a246c502a24e7d4600785758637bd0b1a90c126a6e" },
  ],

  /* ---------- หมวดหมู่ ---------- */
  categories: [
    { id: "sales",     label: "Sales & Revenue",      icon: "◆" },
    { id: "ads",       label: "Ads & Performance",    icon: "◇" },
    { id: "crm",       label: "CRM ติดตามลูกค้า",      icon: "▣" },
    { id: "inventory", label: "Inventory & คลัง",      icon: "▤" },
  ],

  /* ---------- DASHBOARDS (ตรวจสถานะออนไลน์แล้ว 2 ก.ค. 2569) ----------
     embed: true = เปิดใน Hub (iframe) / false = เปิดแท็บใหม่           */
  dashboards: [

    /* ===== SALES & REVENUE ===== */
    {
      id: "sale",
      title: "Sales Dashboard — Group",
      desc: "ภาพรวมยอดขาย 15 สาขา Real-time จาก MASTER_DATA อัปเดตทุก 5 นาที · ยอดรายสาขา พนักงาน บริการ ช่องทางชำระเงิน",
      category: "sales", icon: "◆",
      url: "https://mersiclinicthailand.github.io/Sale/",
      embed: true, roles: ["marketing", "area"],
      tags: ["real-time", "15 สาขา", "MASTER_DATA"],
    },
    {
      id: "allsalenew",
      title: "Branch Revenue Monitoring",
      desc: "Monitoring ยอดขายรายสาขา + Online Booking + Total Customer · กรองตามเดือน/สาขา/Area · Real-time Google Sheets",
      category: "sales", icon: "◈",
      url: "https://mersiclinicthailand.github.io/AllSaleNew/",
      embed: true, roles: ["marketing", "area"],
      tags: ["monitoring", "area", "booking"],
    },
    {
      id: "sale-off-on",
      title: "Sales Intelligence — Offline × Online",
      desc: "ยอดขายหน้าสาขา 14 สาขา เทียบยอดออนไลน์ 15 เพจ ปี 2569 · Monthly Report + สรุปแยกโปร",
      category: "sales", icon: "❖",
      url: "https://mersiclinicthailand.github.io/SaleOfflineSaleOnline/",
      embed: true, roles: ["marketing", "area"],
      tags: ["offline", "online", "รายเดือน"],
    },
    {
      id: "market-intel",
      title: "Market & Sales Intelligence",
      desc: "วิเคราะห์ตลาด ลูกค้า และกลยุทธ์รายสาขา จากรายงานประจำเดือน + แบบสอบถามผู้จัดการ 11 สาขา",
      category: "sales", icon: "✦",
      url: "https://mersiclinicthailand.github.io/MersiSaleBranch/",
      embed: true, roles: ["marketing"],
      tags: ["กลยุทธ์", "รายเดือน"],
    },
    {
      id: "sheets-dashboard",
      title: "Mersi Dashboard (Apps Script)",
      desc: "Dashboard ยอดขาย/ลูกค้า 14 สาขา ดึงจาก DATA_ENTRY ผ่าน Apps Script Web App · เปิดแท็บใหม่ (เพิ่ม ALLOWALL ใน .gs แล้วเปลี่ยน embed เป็น true ได้)",
      category: "sales", icon: "▦",
      url: "https://script.google.com/macros/s/AKfycbz6grHmYmr8jjgLWMAEkRhwyL7B64x59mwqNoBsoRlnKI8SvbthG35NkdZfE696x9lf/exec",
      embed: false, roles: ["marketing", "area"],
      tags: ["apps script", "14 สาขา"],
    },

    /* ===== ADS & PERFORMANCE ===== */
    {
      id: "new-ads-performance",
      title: "Ads Daily Performance — มิ.ย. เต็มเดือน",
      desc: "FB/IG Ads × ยอดขาย 15 เพจ 1–30 มิ.ย. · ROAS กำไรหลังแอด CPL + Demographics เพศ/อายุ ช่วงเวลาแชต ยอดขายรายสัปดาห์ Top Seller",
      category: "ads", icon: "◉",
      url: "https://mersiclinicthailand.github.io/NewAdsPerformance/",
      embed: true, roles: ["marketing"],
      tags: ["ROAS", "demographics", "รายสัปดาห์"],
    },
    {
      id: "ads-performance",
      title: "Ads Daily Performance",
      desc: "Facebook/IG Ads × ยอดขาย 15 เพจ · ROAS กำไรหลังแอด CPL Conversion เทรนด์รายวัน + สัญญาณ Scale/Cut",
      category: "ads", icon: "◇",
      url: "https://mersiclinicthailand.github.io/AdsPerformance/",
      embed: true, roles: ["marketing"],
      tags: ["ROAS", "CPL", "รายวัน"],
    },
    {
      id: "ads-creative",
      title: "Ads Creative Performance",
      desc: "รีวิวครีเอทีฟรายโปรแกรม PICO · HIFU · Diode · G5 — Top ขายดี/แชตเยอะ พร้อมภาพและ ROAS รายชิ้น",
      category: "ads", icon: "◎",
      url: "https://mersiclinicthailand.github.io/AdsCreative/",
      embed: true, roles: ["marketing"],
      tags: ["creative", "presentation"],
    },
    {
      id: "customer-insight",
      title: "Customer Insight & FB Ads",
      desc: "วิเคราะห์กลุ่มลูกค้า + แนวทางผลิตสื่อโฆษณา รายเพจ/รายสาขา จากแบบสอบถาม Online Sales Admin 14 สาขา",
      category: "ads", icon: "✧",
      url: "https://mersiclinicthailand.github.io/Adminform/",
      embed: true, roles: ["marketing"],
      tags: ["insight", "สื่อโฆษณา"],
    },

    /* ===== CRM ===== */
    {
      id: "crm-overview",
      title: "CRM ติดตามลูกค้า — Overview",
      desc: "ภาพรวมการติดตามลูกค้า ทำนัดสำเร็จ Performance Trend รายวัน + Ranking พนักงาน",
      category: "crm", icon: "▣",
      url: "https://mersiclinicthailand.github.io/Mersi_Dashboard/",
      embed: true, roles: ["marketing", "area"],
      tags: ["follow-up", "ทำนัด"],
    },
    {
      id: "crm-branch",
      title: "CRM เปรียบเทียบสาขา",
      desc: "Branch Performance Comparison — ติดตาม/ทำนัดสำเร็จ/Conv% รายสาขา แบบ Stacked Bar",
      category: "crm", icon: "▥",
      url: "https://mersiclinicthailand.github.io/Mersi_Branchs/",
      embed: true, roles: ["marketing", "area"],
      tags: ["เปรียบเทียบ", "สาขา"],
    },
    {
      id: "crm-ranking",
      title: "CRM Ranking พนักงาน",
      desc: "Staff Performance Ranking — จัดอันดับพนักงานตามยอดติดตามและทำนัดสำเร็จ",
      category: "crm", icon: "♕",
      url: "https://mersiclinicthailand.github.io/Mersi_Ranking/",
      embed: true, roles: ["marketing", "area"],
      tags: ["ranking", "พนักงาน"],
    },

    /* ===== INVENTORY ===== */
    {
      id: "inventory-loss",
      title: "รายงานสินค้าสูญหาย",
      desc: "Inventory Loss ผู้บริหาร — มูลค่าความเสียหาย สาเหตุ แนวโน้มรายเดือน + Export CSV",
      category: "inventory", icon: "▤",
      url: "https://mersiclinicthailand.github.io/MersiInventory/",
      embed: true, roles: ["marketing"],
      tags: ["loss", "ผู้บริหาร"],
    },
    {
      id: "inventory-ranking",
      title: "อันดับคลังที่สูญเสียสูงสุด",
      desc: "Warehouse Loss Ranking — จัดอันดับคลัง/สาขาตามมูลค่าความเสียหาย",
      category: "inventory", icon: "▧",
      url: "https://mersiclinicthailand.github.io/MersiInventoryRanking/",
      embed: true, roles: ["marketing"],
      tags: ["ranking", "คลัง"],
    },

    /* ===== ตัวที่ยังไม่ยืนยันสถานะ — เปิดใช้โดยลบ // ออก =====
    { id:"marketingteams", title:"Marketing Teams Tracker", desc:"ระบบบันทึกงานทีม Marketing",
      category:"crm", icon:"✎", url:"https://mersiclinicthailand.github.io/Marketingteams/",
      embed:true, roles:["marketing"], tags:[] },
    { id:"allsale-old", title:"All Sale (เวอร์ชันเก่า)", desc:"",
      category:"sales", icon:"◆", url:"https://mersiclinicthailand.github.io/AllSale/",
      embed:true, roles:["marketing"], tags:[] },
    ============================================== */
  ],
};
