const ExcelJS = require("exceljs");
const {
  COLORS, THIN_BORDER, SYSTEM_MAP_BLOCKS, SECURITY_MATRIX, FLAG_COMBOS, RISK_REGISTER,
  getExamModeForReg, getExamModeForCD, getExamModeForCS,
} = require("./rebuild_config");

// ─── HELPERS ────────────────────────────────────────────────────────────────
function headerStyle(ws, colCount) {
  const row = ws.getRow(1);
  row.font = { bold: true, size: 11, name: "Calibri", color: { argb: "FF" + COLORS.white } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.navyBg } };
  row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  row.height = 30;
  for (let c = 1; c <= colCount; c++) row.getCell(c).border = THIN_BORDER;
}

function dataRow(ws, data, rowNum) {
  const row = ws.addRow(data);
  row.font = { size: 10, name: "Calibri" };
  row.alignment = { vertical: "top", wrapText: true };
  const rn = row.number;
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rn % 2 === 0 ? "FFFFFFFF" : "FFF2F2F2" } };
  for (let c = 1; c <= ws.columns.length; c++) row.getCell(c).border = THIN_BORDER;
  return row;
}

function applyDropdown(ws, col, startRow, endRow, list) {
  for (let r = startRow; r <= endRow; r++) {
    ws.getCell(r, col).dataValidation = {
      type: "list", allowBlank: true,
      formulae: ['"' + list.join(",") + '"'],
    };
  }
}

function colorSeverity(row, col) {
  const v = String(row.getCell(col).value || "").toLowerCase();
  if (v.includes("critical")) { row.getCell(col).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.critRed} }; row.getCell(col).font = { bold:true,size:10,name:"Calibri",color:{argb:"FFFFFFFF"} }; }
  else if (v.includes("high")) { row.getCell(col).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.highOrange} }; row.getCell(col).font = { bold:true,size:10,name:"Calibri",color:{argb:"FFFFFFFF"} }; }
  else if (v.includes("medium")) { row.getCell(col).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.medYellow} }; }
  else if (v.includes("low")) { row.getCell(col).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.lowGreen} }; row.getCell(col).font = { bold:true,size:10,name:"Calibri",color:{argb:"FFFFFFFF"} }; }
}

function colorStatus(row, col) {
  const v = String(row.getCell(col).value || "").toLowerCase();
  if (v.includes("fail") || v.includes("blocked")) row.getCell(col).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.failBg.replace("#","")} };
  else if (v.includes("verify") || v.includes("to test") || v.includes("pending")) row.getCell(col).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.verifyBg.replace("#","")} };
  else if (v.includes("pass") || v.includes("tested") || v.includes("confirmed")) row.getCell(col).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.passBg.replace("#","")} };
}

function mergedHeader(ws, range, text, bgColor, fontSize) {
  ws.mergeCells(range);
  const cell = ws.getCell(range.split(":")[0]);
  cell.value = text;
  cell.font = { bold: true, size: fontSize || 14, name: "Calibri", color: { argb: "FFFFFFFF" } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + (bgColor || COLORS.navyBg) } };
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  cell.border = THIN_BORDER;
}

function sectionHeader(ws, row, colSpan, text, bgColor) {
  ws.mergeCells(row, 1, row, colSpan);
  const cell = ws.getCell(row, 1);
  cell.value = text;
  cell.font = { bold: true, size: 12, name: "Calibri", color: { argb: "FFFFFFFF" } };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + (bgColor || COLORS.sectionBg) } };
  cell.alignment = { horizontal: "left", vertical: "middle" };
  cell.border = THIN_BORDER;
}

// ─── READ EXISTING DATA ─────────────────────────────────────────────────────
async function readExisting() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile("EMS_Exam_Security_TestPlan.xlsx");
  const data = {};
  for (const ws of wb.worksheets) {
    const rows = [];
    for (let r = 2; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const vals = [];
      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        while (vals.length < colNum - 1) vals.push("");
        vals.push(cell.value != null ? String(cell.value) : "");
      });
      if (vals.some(v => v !== "")) rows.push(vals);
    }
    data[ws.name] = rows;
  }
  return data;
}

// ─── SHEET 0: SYSTEM MAP ────────────────────────────────────────────────────
function buildSystemMap(wb) {
  const ws = wb.addWorksheet("SYSTEM MAP", { tabColor: { argb: "FF" + COLORS.navyBg } });
  ws.properties.defaultColWidth = 22;
  for (let c = 1; c <= 8; c++) ws.getColumn(c).width = 22;

  let r = 1;
  // Title
  mergedHeader(ws, `A${r}:H${r}`, SYSTEM_MAP_BLOCKS.title, COLORS.navyBg, 18);
  r += 2;

  // Legend
  mergedHeader(ws, `A${r}:H${r}`, "COLOR LEGEND", COLORS.sectionBg2, 11);
  r++;
  const legends = SYSTEM_MAP_BLOCKS.legend;
  legends.forEach((l, i) => {
    const col = i * 2 + 1;
    const cell = ws.getCell(r, col);
    cell.value = "  ██  "; cell.font = { size: 12, color: { argb: "FF" + l.color } };
    ws.getCell(r, col + 1).value = l.text;
    ws.getCell(r, col + 1).font = { bold: true, size: 10 };
  });
  r += 2;

  // Block 1: Exam Modes
  mergedHeader(ws, `A${r}:H${r}`, "BLOCK 1: EXAM MODES & SECURITY GRADES", COLORS.sectionBg, 12);
  r++;
  const modes = SYSTEM_MAP_BLOCKS.examModes;
  // Header row for modes
  ws.getCell(r, 1).value = ""; // spacer
  for (let i = 0; i < modes.length; i++) {
    const col = i + 2;
    ws.getColumn(col).width = 28;
    const cell = ws.getCell(r, col);
    cell.value = modes[i].mode;
    cell.font = { bold: true, size: 11, name: "Calibri", color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.sectionBg2 } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = THIN_BORDER;
  }
  r++;
  // Description row
  ws.getCell(r, 1).value = "Description";
  ws.getCell(r, 1).font = { bold: true, size: 10 };
  for (let i = 0; i < modes.length; i++) {
    const cell = ws.getCell(r, i + 2);
    cell.value = modes[i].desc;
    cell.alignment = { wrapText: true, vertical: "top" };
    cell.font = { size: 9 };
    cell.border = THIN_BORDER;
  }
  ws.getRow(r).height = 70;
  r++;
  // Grade row
  ws.getCell(r, 1).value = "Security Grade";
  ws.getCell(r, 1).font = { bold: true, size: 10 };
  for (let i = 0; i < modes.length; i++) {
    const cell = ws.getCell(r, i + 2);
    cell.value = "Grade: " + modes[i].grade;
    cell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + modes[i].color } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER;
  }
  r += 2;

  // Block 2: Configuration Variables
  mergedHeader(ws, `A${r}:H${r}`, "BLOCK 2: CONFIGURATION VARIABLES", COLORS.sectionBg, 12);
  r++;
  // Layer 1: Feature Flags
  mergedHeader(ws, `A${r}:H${r}`, "Layer 1: Feature Flags (3 Toggles)", COLORS.sectionBg2, 10);
  r++;
  ["Flag", "When ON", "When OFF", "Known Bug"].forEach((h, i) => {
    const cell = ws.getCell(r, i + 1);
    cell.value = h; cell.font = { bold: true, size: 10 }; cell.border = THIN_BORDER;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lightBlue.replace("#","") } };
  });
  r++;
  SYSTEM_MAP_BLOCKS.configVars.featureFlags.forEach(f => {
    ws.getCell(r, 1).value = f.flag; ws.getCell(r, 1).font = { bold: true, size: 9 };
    ws.getCell(r, 2).value = f.on;
    ws.getCell(r, 3).value = f.off;
    if (f.off.includes("BUG")) ws.getCell(r, 3).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.lightRed.replace("#","")} };
    ws.getCell(r, 4).value = f.bug || "";
    if (f.bug) ws.getCell(r, 4).font = { bold: true, color: { argb: "FFFF0000" } };
    for (let c = 1; c <= 4; c++) { ws.getCell(r, c).border = THIN_BORDER; ws.getCell(r, c).alignment = { wrapText: true, vertical: "top" }; }
    r++;
  });
  r++;

  // Layer 2: SEB Config
  mergedHeader(ws, `A${r}:H${r}`, "Layer 2: SEB Configuration", COLORS.sectionBg2, 10);
  r++;
  SYSTEM_MAP_BLOCKS.configVars.sebConfig.forEach(s => {
    ws.getCell(r, 1).value = s.setting; ws.getCell(r, 1).font = { bold: true, size: 9 };
    ws.mergeCells(r, 2, r, 4);
    ws.getCell(r, 2).value = s.desc;
    if (s.desc.includes("DANGER")) ws.getCell(r, 2).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.lightRed.replace("#","")} };
    for (let c = 1; c <= 4; c++) { ws.getCell(r, c).border = THIN_BORDER; ws.getCell(r, c).alignment = { wrapText: true }; }
    r++;
  });
  r++;

  // Layer 3: Server-Side Checks
  mergedHeader(ws, `A${r}:H${r}`, "Layer 3: What Server Actually Checks", COLORS.sectionBg2, 10);
  r++;
  ["HTTP Header", "Validated?", "Risk"].forEach((h, i) => {
    ws.getCell(r, i + 1).value = h; ws.getCell(r, i + 1).font = { bold: true, size: 10 }; ws.getCell(r, i + 1).border = THIN_BORDER;
  });
  r++;
  SYSTEM_MAP_BLOCKS.configVars.serverChecks.forEach(s => {
    ws.getCell(r, 1).value = s.header; ws.getCell(r, 1).font = { bold: true, size: 9 };
    ws.getCell(r, 2).value = s.validated;
    if (s.validated.includes("NO")) {
      ws.getCell(r, 2).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.critRed} };
      ws.getCell(r, 2).font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    } else if (s.validated === "YES") {
      ws.getCell(r, 2).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.safeBg} };
      ws.getCell(r, 2).font = { bold: true, color: { argb: "FFFFFFFF" } };
    } else {
      ws.getCell(r, 2).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.warnBg} };
    }
    ws.getCell(r, 3).value = s.risk;
    for (let c = 1; c <= 3; c++) { ws.getCell(r, c).border = THIN_BORDER; ws.getCell(r, c).alignment = { wrapText: true }; }
    r++;
  });
  r += 2;

  // Block 3: Threat Landscape
  mergedHeader(ws, `A${r}:H${r}`, "BLOCK 3: THREAT LANDSCAPE — 7 ATTACK VECTORS", COLORS.dangerBg, 12);
  r++;
  ["Vector", "Attack", "Skill Required", "Detectable?", "Blocked By", "Status"].forEach((h, i) => {
    const cell = ws.getCell(r, i + 1);
    cell.value = h; cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.sectionBg2 } };
    cell.border = THIN_BORDER;
  });
  r++;
  SYSTEM_MAP_BLOCKS.threatVectors.forEach(v => {
    [v.id, v.name, v.skill, v.detectable, v.blockedBy, v.status].forEach((val, i) => {
      ws.getCell(r, i + 1).value = val;
      ws.getCell(r, i + 1).border = THIN_BORDER;
      ws.getCell(r, i + 1).font = { size: 9 };
      ws.getCell(r, i + 1).alignment = { wrapText: true };
    });
    if (v.detectable === "No") ws.getCell(r, 4).fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.lightRed.replace("#","")} };
    r++;
  });
  r += 2;

  // Block 4: Admin Exploit Surface
  mergedHeader(ws, `A${r}:H${r}`, "BLOCK 4: ADMIN EXPLOIT SURFACE", COLORS.warnBg, 12);
  r++;
  const adminExploits = [
    ["/admin/seb-config URL", "Student accesses admin config page", "Returns 400 not 403 — info leakage", "REG-148"],
    ["Auth Token Hijacking", "Student uses captured token for admin APIs", "RBAC enforcement unknown", "REG-149"],
    ["Config File Download", "Student downloads .seb file", "Could extract Config Key", "REG-150"],
    ["curl/Postman Spoof", "Exam via raw HTTP with spoofed headers", "Header-only security = no security", "REG-155"],
  ];
  ["Exploit", "Description", "Risk", "Test Case"].forEach((h, i) => {
    ws.getCell(r, i + 1).value = h; ws.getCell(r, i + 1).font = { bold: true, size: 10 }; ws.getCell(r, i + 1).border = THIN_BORDER;
  });
  r++;
  adminExploits.forEach(e => {
    e.forEach((v, i) => { ws.getCell(r, i + 1).value = v; ws.getCell(r, i + 1).border = THIN_BORDER; ws.getCell(r, i + 1).font = { size: 9 }; });
    r++;
  });
  r += 2;

  // Block 5: Key Blockers
  mergedHeader(ws, `A${r}:H${r}`, "BLOCK 5: KEY BUGS BLOCKING TESTING", COLORS.critRed, 12);
  r++;
  const blockers = [
    ["BUG-006", "Proctoring enforces even when flag OFF", "BLOCKS all non-proctored testing", "Critical"],
    ["BUG-020", "No BEK validation implemented", "ALL DLL patching attacks succeed", "Critical"],
    ["BUG-021", "No SEB version enforcement", "Old/bypassed versions may be accepted", "Critical"],
  ];
  ["Bug ID", "Description", "Impact", "Severity"].forEach((h, i) => {
    ws.getCell(r, i + 1).value = h; ws.getCell(r, i + 1).font = { bold: true, size: 10 }; ws.getCell(r, i + 1).border = THIN_BORDER;
  });
  r++;
  blockers.forEach(b => {
    b.forEach((v, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = v; cell.border = THIN_BORDER; cell.font = { size: 9 };
      if (i === 3 && v === "Critical") { cell.fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FFFF0000"} }; cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } }; }
    });
    r++;
  });

  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 0: SYSTEM MAP — " + r + " rows");
}

// ─── SHEET 1: SECURITY LEVELS ───────────────────────────────────────────────
function buildSecurityLevels(wb) {
  const ws = wb.addWorksheet("SECURITY LEVELS", { tabColor: { argb: "FF4D96FF" } });
  const modeCols = ["Feature", "Offline", "Non-Proctored", "Proctored (No SEB)", "Proctored + SEB", "Proctored + SEB + BEK"];
  ws.columns = modeCols.map((h, i) => ({ header: h, width: i === 0 ? 28 : 24 }));

  let r = 1;
  // Section A header
  sectionHeader(ws, r, 6, "SECTION A: EXAM MODE vs SECURITY FEATURE MATRIX", COLORS.navyBg);
  r++;
  // Column headers
  modeCols.forEach((h, i) => {
    const cell = ws.getCell(r, i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.sectionBg2 } };
    cell.border = THIN_BORDER;
    cell.alignment = { horizontal: "center", wrapText: true };
  });
  r++;

  SECURITY_MATRIX.forEach(row => {
    const cells = [row.feature, row.offline, row.nonProc, row.proctored, row.seb, row.sebBek];
    cells.forEach((v, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = v;
      cell.border = THIN_BORDER;
      cell.alignment = { wrapText: true, vertical: "middle" };
      cell.font = { size: 9 };
      if (i === 0) cell.font = { bold: true, size: 9 };
      if (v === "—") { cell.fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.naBg} }; cell.alignment = { horizontal: "center" }; }
      else if (v.includes("No") || v.includes("N/A") || v.includes("NOT")) cell.fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.lightRed.replace("#","")} };
      else if (v.includes("bypassable") || v.includes("JS") || v.includes("only") || v.includes("If")) cell.fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.lightYellow.replace("#","")} };
      else if (v.includes("Yes") || v.includes("Kernel") || v.includes("SEB") || v.includes("Token") || v.includes("13 types")) cell.fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.lightGreen.replace("#","")} };
    });
    r++;
  });

  // Grade row
  const grades = ["SECURITY GRADE", "F", "F (BUG-006)", "C+", "B", "A-"];
  const gradeColors = [COLORS.sectionBg2, COLORS.gradeF, COLORS.gradeF, COLORS.gradeC, COLORS.gradeB, COLORS.gradeA];
  grades.forEach((g, i) => {
    const cell = ws.getCell(r, i + 1);
    cell.value = g;
    cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + gradeColors[i] } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER;
  });
  r += 2;

  // Section B: Feature Flag Combinations
  sectionHeader(ws, r, 6, "SECTION B: FEATURE FLAG COMBINATIONS (8 Permutations)", COLORS.navyBg);
  r++;
  ["#", "PROCTORING", "SCREENSHOT", "WEBCAM", "Expected Result", "Actual / Bug"].forEach((h, i) => {
    const cell = ws.getCell(r, i + 1);
    cell.value = h; cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.sectionBg2 } };
    cell.border = THIN_BORDER;
  });
  r++;
  FLAG_COMBOS.forEach(fc => {
    [fc.n, fc.proc, fc.screen, fc.webcam, fc.result, fc.actual].forEach((v, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = v; cell.border = THIN_BORDER; cell.font = { size: 9 }; cell.alignment = { wrapText: true };
      if (String(v).includes("BUG")) cell.fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FF"+COLORS.lightRed.replace("#","")} };
    });
    r++;
  });
  r += 2;

  // Section C: Risk Register
  sectionHeader(ws, r, 6, "SECTION C: RISK REGISTER — 7 ATTACK VECTORS (Likelihood x Impact)", COLORS.navyBg);
  r++;
  ["Vector", "Likelihood (1-5)", "Impact (1-5)", "Risk Score", "Risk Level", ""].forEach((h, i) => {
    const cell = ws.getCell(r, i + 1);
    cell.value = h; cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.sectionBg2 } };
    cell.border = THIN_BORDER;
  });
  r++;
  RISK_REGISTER.forEach(rr => {
    [rr.vector, rr.likelihood, rr.impact, rr.score, rr.level, ""].forEach((v, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = v; cell.border = THIN_BORDER; cell.font = { size: 9 }; cell.alignment = { wrapText: true };
      if (i === 4) {
        if (v === "CRITICAL") { cell.fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FFFF0000"} }; cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } }; }
        else if (v === "HIGH") { cell.fill = { type:"pattern",pattern:"solid",fgColor:{argb:"FFFF6600"} }; cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } }; }
      }
    });
    r++;
  });

  ws.views = [{ state: "frozen", ySplit: 2 }];
  console.log("  Sheet 1: SECURITY LEVELS — " + r + " rows");
}

// ─── SHEET 2: HOW EXAMS WORK (migrate) ──────────────────────────────────────
function buildHowExamsWork(wb, existingRows) {
  const ws = wb.addWorksheet("How Exams Work", { tabColor: { argb: "FF4472C4" } });
  ws.columns = [
    { header: "Section", width: 18 }, { header: "Feature / Setting", width: 25 },
    { header: "Description", width: 55 }, { header: "Applicable To", width: 18 },
    { header: "Notes", width: 30 },
  ];
  headerStyle(ws, 5);
  existingRows.forEach(r => { const row = dataRow(ws, r.slice(0, 5)); });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws.rowCount, column: 5 } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 2: How Exams Work — " + (ws.rowCount - 1) + " rows");
}

// ─── SHEET 3: FOUND BUGS (migrate + new columns) ───────────────────────────
function buildFoundBugs(wb, existingRows) {
  const ws = wb.addWorksheet("Found Bugs", { tabColor: { argb: "FFFF0000" } });
  ws.columns = [
    { header: "Bug ID", width: 10 }, { header: "Category", width: 18 }, { header: "Bug Title", width: 40 },
    { header: "Steps to Reproduce", width: 45 }, { header: "Expected Behavior", width: 35 },
    { header: "Actual Behavior", width: 35 }, { header: "Severity", width: 12 },
    { header: "Priority", width: 10 }, { header: "Environment", width: 14 },
    { header: "Screenshot / Evidence", width: 20 }, { header: "Status", width: 12 },
    { header: "Remarks", width: 25 },
    { header: "Component", width: 14 }, { header: "Dev Status", width: 13 },
    { header: "Dev Notes", width: 25 }, { header: "Dev Fix Date", width: 13 },
    { header: "QA Retest", width: 13 }, { header: "QA Date", width: 13 },
    { header: "QA Notes", width: 25 }, { header: "Root Cause", width: 16 },
    { header: "Business Impact", width: 30 }, { header: "Discrepancy", width: 14 },
  ];
  headerStyle(ws, 22);

  existingRows.forEach((r, idx) => {
    const rowData = r.slice(0, 12);
    while (rowData.length < 12) rowData.push("");
    rowData.push(""); // Component
    rowData.push("Open"); // Dev Status default
    rowData.push(""); // Dev Notes
    rowData.push(""); // Dev Fix Date
    rowData.push("Not Retested"); // QA Retest default
    rowData.push(""); // QA Date
    rowData.push(""); // QA Notes
    rowData.push(""); // Root Cause
    rowData.push(""); // Business Impact
    rowData.push(""); // Discrepancy (will be formula)
    const row = dataRow(ws, rowData);
    colorSeverity(row, 7);
    colorStatus(row, 11);
  });

  // Add discrepancy formulas
  for (let r = 2; r <= ws.rowCount; r++) {
    ws.getCell(r, 22).value = { formula: `IF(AND(N${r}="Fixed",Q${r}="Fail"),"DEV FAILURE",IF(AND(N${r}="Fixed",Q${r}="Pass"),"VERIFIED",IF(AND(N${r}="Fixed",Q${r}="Not Retested"),"AWAITING QA",IF(OR(N${r}="Open",N${r}="In Progress"),"OPEN",""))))` };
  }

  // Data validation dropdowns
  const lastRow = ws.rowCount;
  applyDropdown(ws, 13, 2, lastRow + 50, ["Frontend", "Backend API", "Database", "SEB Config", "Server", "Infrastructure"]);
  applyDropdown(ws, 14, 2, lastRow + 50, ["Open", "In Progress", "Fixed", "Won't Fix", "Deferred"]);
  applyDropdown(ws, 17, 2, lastRow + 50, ["Not Retested", "Pass", "Fail", "Blocked", "Partial"]);
  applyDropdown(ws, 20, 2, lastRow + 50, ["Logic Error", "Missing Validation", "Race Condition", "Config Mistake", "UI Bug", "Integration", "Security Gap"]);

  // Conditional formatting for Discrepancy column
  ws.addConditionalFormatting({ ref: `V2:V${lastRow + 50}`, rules: [
    { type: "containsText", operator: "containsText", text: "DEV FAILURE", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFF4444" } }, font: { bold: true, color: { argb: "FFFFFFFF" } } }, priority: 1 },
    { type: "containsText", operator: "containsText", text: "VERIFIED", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FF4CAF50" } }, font: { bold: true, color: { argb: "FFFFFFFF" } } }, priority: 2 },
    { type: "containsText", operator: "containsText", text: "AWAITING QA", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFFC107" } }, font: { bold: true } }, priority: 3 },
  ]});

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws.rowCount, column: 22 } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 3: Found Bugs — " + (ws.rowCount - 1) + " rows (+ Dev/QA tracking columns)");
}

// ─── SHEETS 4 & 5: CHEAT DETECTABLE / STEALTH (migrate + Exam Mode) ────────
function buildCheatSheet(wb, name, existingRows, modeFn, tabColor) {
  const ws = wb.addWorksheet(name, { tabColor: { argb: tabColor } });
  ws.columns = [
    { header: "Cheat ID", width: 10 }, { header: "Exam Mode", width: 16 },
    { header: "Category", width: 18 }, { header: "Method", width: 35 },
    { header: "How It Works", width: 50 }, { header: "Detectable by System?", width: 14 },
    { header: "Detection Mechanism", width: 30 }, { header: "Risk Level for Student", width: 14 },
    { header: "Difficulty", width: 12 }, { header: "Stealth Rating", width: 14 },
    { header: "Recommendation for Dev", width: 35 }, { header: "Status", width: 12 },
  ];
  headerStyle(ws, 12);

  existingRows.forEach(r => {
    const id = r[0] || "";
    const examMode = modeFn(id);
    const rowData = [r[0], examMode, ...r.slice(1)];
    while (rowData.length < 12) rowData.push("");
    const row = dataRow(ws, rowData.slice(0, 12));
    colorStatus(row, 12);
  });

  applyDropdown(ws, 2, 2, ws.rowCount + 50, ["All Modes", "Proctored", "Proctored + SEB", "SEB Bypass"]);
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws.rowCount, column: 12 } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  " + name + " — " + (ws.rowCount - 1) + " rows (+ Exam Mode column)");
}

// ─── SHEET 6: REGRESSION SUITE (migrate + new columns) ─────────────────────
function buildRegressionSuite(wb, existingRows) {
  const ws = wb.addWorksheet("Regression Suite", { tabColor: { argb: "FF4472C4" } });
  ws.columns = [
    { header: "Test ID", width: 10 }, { header: "Exam Mode", width: 14 },
    { header: "Category", width: 18 }, { header: "Subcategory", width: 22 },
    { header: "Scenario Type", width: 12 }, { header: "Test Scenario", width: 45 },
    { header: "Preconditions", width: 25 }, { header: "Steps to Reproduce", width: 50 },
    { header: "Expected Behavior", width: 40 }, { header: "Actual Behavior", width: 30 },
    { header: "Severity", width: 12 }, { header: "Difficulty Level", width: 12 },
    { header: "Status", width: 12 }, { header: "Remarks / Notes", width: 30 },
    { header: "Linked Bug", width: 12 }, { header: "Dev Status", width: 13 },
    { header: "QA Retest", width: 13 }, { header: "Discrepancy", width: 14 },
    { header: "Environment", width: 12 },
  ];
  headerStyle(ws, 19);

  existingRows.forEach(r => {
    const id = r[0] || "";
    const examMode = getExamModeForReg(id);
    const rowData = [r[0], examMode, ...r.slice(1)];
    while (rowData.length < 14) rowData.push("");
    rowData.push(""); // Linked Bug
    rowData.push(""); // Dev Status
    rowData.push(""); // QA Retest
    rowData.push(""); // Discrepancy (formula)
    rowData.push(""); // Environment
    const row = dataRow(ws, rowData.slice(0, 19));
    colorSeverity(row, 11);
    colorStatus(row, 13);
  });

  // Discrepancy formulas
  for (let r = 2; r <= ws.rowCount; r++) {
    ws.getCell(r, 18).value = { formula: `IF(AND(P${r}="Fixed",Q${r}="Fail"),"DEV FAILURE",IF(AND(P${r}="Fixed",Q${r}="Pass"),"VERIFIED",IF(AND(P${r}="Fixed",Q${r}="Not Retested"),"AWAITING QA",IF(OR(P${r}="Open",P${r}="In Progress"),"OPEN",""))))` };
  }

  // Dropdowns
  const lr = ws.rowCount + 50;
  applyDropdown(ws, 2, 2, lr, ["General", "Non-Proctored", "Proctored", "SEB", "SEB Bypass", "Admin", "Server"]);
  applyDropdown(ws, 16, 2, lr, ["", "Open", "In Progress", "Fixed", "Won't Fix", "Deferred"]);
  applyDropdown(ws, 17, 2, lr, ["", "Not Retested", "Pass", "Fail", "Blocked", "Partial"]);
  applyDropdown(ws, 19, 2, lr, ["", "Staging", "UAT", "Local", "Production"]);

  // Conditional formatting for Discrepancy
  ws.addConditionalFormatting({ ref: `R2:R${lr}`, rules: [
    { type: "containsText", operator: "containsText", text: "DEV FAILURE", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFF4444" } }, font: { bold: true, color: { argb: "FFFFFFFF" } } }, priority: 1 },
    { type: "containsText", operator: "containsText", text: "VERIFIED", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FF4CAF50" } }, font: { bold: true, color: { argb: "FFFFFFFF" } } }, priority: 2 },
    { type: "containsText", operator: "containsText", text: "AWAITING QA", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFFC107" } }, font: { bold: true } }, priority: 3 },
  ]});
  // Conditional formatting for Blocked status
  ws.addConditionalFormatting({ ref: `M2:M${lr}`, rules: [
    { type: "containsText", operator: "containsText", text: "Blocked", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFFD9B3" } }, font: { bold: true } }, priority: 4 },
  ]});

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws.rowCount, column: 19 } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 6: Regression Suite — " + (ws.rowCount - 1) + " rows (+ Exam Mode, Dev/QA, Discrepancy)");
}

// ─── SHEET 7: EDGE CASES (migrate as-is) ────────────────────────────────────
function buildEdgeCases(wb, existingRows) {
  const ws = wb.addWorksheet("Edge Cases & Open Ends", { tabColor: { argb: "FFFF6600" } });
  ws.columns = [
    { header: "ID", width: 12 }, { header: "Category", width: 14 }, { header: "Scenario", width: 40 },
    { header: "Type", width: 14 }, { header: "Details", width: 50 }, { header: "Risk / Impact", width: 30 },
    { header: "Severity", width: 12 }, { header: "Status", width: 12 }, { header: "Remarks", width: 30 },
  ];
  headerStyle(ws, 9);
  existingRows.forEach(r => {
    const row = dataRow(ws, r.slice(0, 9));
    colorSeverity(row, 7);
    colorStatus(row, 8);
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws.rowCount, column: 9 } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 7: Edge Cases — " + (ws.rowCount - 1) + " rows");
}

// ─── SHEET 8: SUMMARY DASHBOARD (formula-driven) ───────────────────────────
function buildSummaryDashboard(wb) {
  const ws = wb.addWorksheet("SUMMARY DASHBOARD", { tabColor: { argb: "FF" + COLORS.navyBg } });
  ws.getColumn(1).width = 35;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 50;

  let r = 1;

  // Title
  mergedHeader(ws, `A${r}:C${r}`, "EMS EXAM — TEST PLAN SUMMARY DASHBOARD", COLORS.navyBg, 16);
  r += 2;

  // Section 1: Release Readiness
  mergedHeader(ws, `A${r}:C${r}`, "RELEASE READINESS", COLORS.dangerBg, 14);
  r++;
  ws.getCell(r, 1).value = "Production Ready?";
  ws.getCell(r, 1).font = { bold: true, size: 12 };
  ws.mergeCells(`B${r}:C${r}`);
  ws.getCell(r, 2).value = { formula: `IF(COUNTIF('Found Bugs'!G:G,"Critical")>0,"RED — NOT READY (Critical bugs open)",IF(COUNTIF('Found Bugs'!N:N,"Open")>5,"YELLOW — RISKS EXIST","GREEN — READY"))` };
  ws.getCell(r, 2).font = { bold: true, size: 14 };
  r += 2;

  // Section 2: Total Counts
  sectionHeader(ws, r, 3, "TOTAL COUNTS (Auto-updating)", COLORS.navyBg);
  r++;
  const counts = [
    ["Total Found Bugs", { formula: `COUNTA('Found Bugs'!A:A)-1` }, "Sheet: Found Bugs"],
    ["Total Detectable Cheat Methods", { formula: `COUNTA('Cheat - Detectable'!A:A)-1` }, "Sheet: Cheat - Detectable"],
    ["Total Stealth Cheat Methods", { formula: `COUNTA('Cheat - Stealth'!A:A)-1` }, "Sheet: Cheat - Stealth"],
    ["Total Regression Test Cases", { formula: `COUNTA('Regression Suite'!A:A)-1` }, "Sheet: Regression Suite"],
    ["Total Edge Cases & Notes", { formula: `COUNTA('Edge Cases & Open Ends'!A:A)-1` }, "Sheet: Edge Cases & Open Ends"],
  ];
  counts.forEach(c => {
    ws.getCell(r, 1).value = c[0]; ws.getCell(r, 1).font = { bold: true, size: 10 }; ws.getCell(r, 1).border = THIN_BORDER;
    ws.getCell(r, 2).value = c[1]; ws.getCell(r, 2).font = { bold: true, size: 12 }; ws.getCell(r, 2).border = THIN_BORDER;
    ws.getCell(r, 2).alignment = { horizontal: "center" };
    ws.getCell(r, 3).value = c[2]; ws.getCell(r, 3).font = { size: 9, color: { argb: "FF888888" } }; ws.getCell(r, 3).border = THIN_BORDER;
    r++;
  });
  // Grand total
  ws.getCell(r, 1).value = "GRAND TOTAL"; ws.getCell(r, 1).font = { bold: true, size: 11 }; ws.getCell(r, 1).border = THIN_BORDER;
  ws.getCell(r, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.navyBg } };
  ws.getCell(r, 1).font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
  ws.getCell(r, 2).value = { formula: `SUM(B${r-5}:B${r-1})` };
  ws.getCell(r, 2).font = { bold: true, size: 14 };
  ws.getCell(r, 2).border = THIN_BORDER;
  ws.getCell(r, 2).alignment = { horizontal: "center" };
  ws.getCell(r, 2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.navyBg } };
  ws.getCell(r, 2).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  r += 2;

  // Section 3: Bug Resolution Tracker
  sectionHeader(ws, r, 3, "BUG RESOLUTION TRACKER (Auto-updating)", COLORS.navyBg);
  r++;
  const bugTracker = [
    ["Bugs — Open", { formula: `COUNTIF('Found Bugs'!N:N,"Open")` }],
    ["Bugs — In Progress", { formula: `COUNTIF('Found Bugs'!N:N,"In Progress")` }],
    ["Bugs — Fixed by Dev", { formula: `COUNTIF('Found Bugs'!N:N,"Fixed")` }],
    ["Bugs — Verified by QA", { formula: `COUNTIF('Found Bugs'!V:V,"VERIFIED")` }],
    ["Bugs — DEV FAILURES", { formula: `COUNTIF('Found Bugs'!V:V,"DEV FAILURE")` }],
    ["Bugs — Awaiting QA Retest", { formula: `COUNTIF('Found Bugs'!V:V,"AWAITING QA")` }],
    ["Bugs — Won't Fix / Deferred", { formula: `COUNTIF('Found Bugs'!N:N,"Won't Fix")+COUNTIF('Found Bugs'!N:N,"Deferred")` }],
  ];
  bugTracker.forEach(b => {
    ws.getCell(r, 1).value = b[0]; ws.getCell(r, 1).font = { bold: true, size: 10 }; ws.getCell(r, 1).border = THIN_BORDER;
    ws.getCell(r, 2).value = b[1]; ws.getCell(r, 2).font = { bold: true, size: 11 }; ws.getCell(r, 2).border = THIN_BORDER;
    ws.getCell(r, 2).alignment = { horizontal: "center" };
    if (b[0].includes("DEV FAILURE")) {
      ws.getCell(r, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF4444" } };
      ws.getCell(r, 1).font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    }
    r++;
  });
  r++;

  // Section 4: Test Execution Progress
  sectionHeader(ws, r, 3, "TEST EXECUTION PROGRESS (Auto-updating)", COLORS.navyBg);
  r++;
  const testProgress = [
    ["Tests — Tested / Pass", { formula: `COUNTIF('Regression Suite'!M:M,"*Tested*")+COUNTIF('Regression Suite'!M:M,"*Pass*")` }],
    ["Tests — To Test", { formula: `COUNTIF('Regression Suite'!M:M,"*To Test*")+COUNTIF('Regression Suite'!M:M,"*To Verify*")+COUNTIF('Regression Suite'!M:M,"*N/A*")` }],
    ["Tests — Blocked", { formula: `COUNTIF('Regression Suite'!M:M,"*Blocked*")` }],
    ["Tests — Failed", { formula: `COUNTIF('Regression Suite'!M:M,"*Fail*")` }],
  ];
  testProgress.forEach(t => {
    ws.getCell(r, 1).value = t[0]; ws.getCell(r, 1).font = { bold: true, size: 10 }; ws.getCell(r, 1).border = THIN_BORDER;
    ws.getCell(r, 2).value = t[1]; ws.getCell(r, 2).font = { bold: true, size: 11 }; ws.getCell(r, 2).border = THIN_BORDER;
    ws.getCell(r, 2).alignment = { horizontal: "center" };
    r++;
  });
  // Progress bar
  ws.getCell(r, 1).value = "% Complete";
  ws.getCell(r, 1).font = { bold: true, size: 10 };
  ws.getCell(r, 1).border = THIN_BORDER;
  const testedRef = `B${r-4}`;
  const totalRef = `COUNTA('Regression Suite'!A:A)-1`;
  ws.mergeCells(`B${r}:C${r}`);
  ws.getCell(r, 2).value = { formula: `IF(${totalRef}>0,REPT("█",ROUND(${testedRef}/(${totalRef})*20,0))&REPT("░",20-ROUND(${testedRef}/(${totalRef})*20,0))&" "&ROUND(${testedRef}/(${totalRef})*100,1)&"%","N/A")` };
  ws.getCell(r, 2).font = { size: 12, name: "Consolas" };
  ws.getCell(r, 2).border = THIN_BORDER;
  r += 2;

  // Section 5: Progress by Exam Mode
  sectionHeader(ws, r, 3, "PROGRESS BY EXAM MODE (Auto-updating)", COLORS.navyBg);
  r++;
  const modes = ["General", "Non-Proctored", "Proctored", "SEB", "SEB Bypass", "Admin", "Server"];
  modes.forEach(m => {
    ws.getCell(r, 1).value = m;
    ws.getCell(r, 1).font = { bold: true, size: 10 };
    ws.getCell(r, 1).border = THIN_BORDER;
    ws.getCell(r, 2).value = { formula: `COUNTIF('Regression Suite'!B:B,"${m}")` };
    ws.getCell(r, 2).font = { bold: true, size: 11 };
    ws.getCell(r, 2).border = THIN_BORDER;
    ws.getCell(r, 2).alignment = { horizontal: "center" };
    ws.getCell(r, 3).value = { formula: `COUNTIFS('Regression Suite'!B:B,"${m}",'Regression Suite'!M:M,"*Tested*")+COUNTIFS('Regression Suite'!B:B,"${m}",'Regression Suite'!M:M,"*Pass*")&" tested / "&COUNTIFS('Regression Suite'!B:B,"${m}",'Regression Suite'!M:M,"*To Test*")&" remaining"` };
    ws.getCell(r, 3).font = { size: 9 };
    ws.getCell(r, 3).border = THIN_BORDER;
    r++;
  });
  r++;

  // Section 6: Severity Distribution
  sectionHeader(ws, r, 3, "BUG SEVERITY DISTRIBUTION (Auto-updating)", COLORS.navyBg);
  r++;
  [["Critical","FF"+COLORS.critRed], ["High","FF"+COLORS.highOrange], ["Medium","FF"+COLORS.medYellow], ["Low","FF"+COLORS.lowGreen]].forEach(([sev, color]) => {
    ws.getCell(r, 1).value = sev;
    ws.getCell(r, 1).font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    ws.getCell(r, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    ws.getCell(r, 1).border = THIN_BORDER;
    ws.getCell(r, 2).value = { formula: `COUNTIF('Found Bugs'!G:G,"${sev}")` };
    ws.getCell(r, 2).font = { bold: true, size: 12 };
    ws.getCell(r, 2).border = THIN_BORDER;
    ws.getCell(r, 2).alignment = { horizontal: "center" };
    r++;
  });
  r++;

  // Section 7: Stakeholder Summary
  sectionHeader(ws, r, 3, "STAKEHOLDER SUMMARY", COLORS.navyBg);
  r++;
  const stakeholderNotes = [
    "CURRENT RISK: HIGH — BEK not implemented, 4 critical bypass vectors unblocked, 3 critical bugs open.",
    "SEB STATUS: Bypass PoC created (AI-generated DLLs). SEBPatch actively maintained (194+ weekly downloads). Config Key validation is insufficient without BEK.",
    "BLOCKER: BUG-006 prevents all non-proctored exam testing. Feature flag OFF still enforces proctoring.",
    "RECOMMENDATION: Implement BEK validation and SEB version enforcement before production deployment.",
  ];
  stakeholderNotes.forEach(n => {
    ws.mergeCells(`A${r}:C${r}`);
    ws.getCell(r, 1).value = n;
    ws.getCell(r, 1).font = { size: 10, italic: true };
    ws.getCell(r, 1).alignment = { wrapText: true };
    ws.getCell(r, 1).border = THIN_BORDER;
    ws.getRow(r).height = 30;
    r++;
  });

  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 8: SUMMARY DASHBOARD — " + r + " rows (100% formula-driven)");
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("Reading existing Excel...");
  const existing = await readExisting();

  console.log("\nExisting data loaded:");
  for (const [name, rows] of Object.entries(existing)) {
    console.log(`  ${name}: ${rows.length} rows`);
  }

  console.log("\nBuilding new workbook (9 sheets)...\n");
  const wb = new ExcelJS.Workbook();
  wb.creator = "Senior Test Architect";
  wb.created = new Date();

  buildSystemMap(wb);
  buildSecurityLevels(wb);
  buildHowExamsWork(wb, existing["1. How Exams Work"] || []);
  buildFoundBugs(wb, existing["2. Found Bugs"] || []);
  buildCheatSheet(wb, "Cheat - Detectable", existing["3. Cheat - Detectable"] || [], getExamModeForCD, "FF00AA00");
  buildCheatSheet(wb, "Cheat - Stealth", existing["4. Cheat - Stealth"] || [], getExamModeForCS, "FF7030A0");
  buildRegressionSuite(wb, existing["5. Regression Suite"] || []);
  buildEdgeCases(wb, existing["6. Edge Cases & Open Ends"] || []);
  buildSummaryDashboard(wb);

  const outFile = "EMS_Exam_Security_TestPlan_v2.xlsx";
  await wb.xlsx.writeFile(outFile);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`NEW WORKBOOK SAVED: ${outFile}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`\nSheets created: ${wb.worksheets.length}`);
  wb.worksheets.forEach((ws, i) => console.log(`  ${i}. ${ws.name} (${ws.rowCount} rows)`));
  console.log(`\nNew features:`);
  console.log(`  - Sheet 0: SYSTEM MAP (visual architecture)`);
  console.log(`  - Sheet 1: SECURITY LEVELS (comparison matrix + risk register)`);
  console.log(`  - Found Bugs: +10 columns (Component, Dev Status, QA Retest, Root Cause, Business Impact, Discrepancy formula)`);
  console.log(`  - Cheat sheets: +Exam Mode column`);
  console.log(`  - Regression Suite: +Exam Mode, Linked Bug, Dev Status, QA Retest, Discrepancy formula, Environment`);
  console.log(`  - SUMMARY DASHBOARD: 100% formula-driven (COUNTIF/COUNTA), progress bars, release readiness`);
  console.log(`  - Data validation dropdowns on all status/mode columns`);
  console.log(`  - Conditional formatting: DEV FAILURE (red), VERIFIED (green), AWAITING QA (yellow), Blocked (orange)`);
  console.log(`\nNext: Upload ${outFile} to Google Drive > Open with Google Sheets. All formulas transfer.`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
