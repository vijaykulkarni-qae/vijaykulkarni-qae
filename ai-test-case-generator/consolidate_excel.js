const ExcelJS = require("exceljs");
const {
  COLORS, THIN_BORDER, SYSTEM_MAP_BLOCKS, SECURITY_MATRIX, FLAG_COMBOS, RISK_REGISTER,
  getExamModeForReg,
} = require("./rebuild_config");

// ─── HELPERS ────────────────────────────────────────────────────────────────

function copySheet(srcWs, destWb, name, tabColor) {
  const dst = destWb.addWorksheet(name, tabColor ? { tabColor: { argb: tabColor } } : {});
  srcWs.columns.forEach((col, i) => { if (col.width) dst.getColumn(i + 1).width = col.width; });
  for (let r = 1; r <= srcWs.rowCount; r++) {
    const srcRow = srcWs.getRow(r);
    const dstRow = dst.getRow(r);
    if (srcRow.height) dstRow.height = srcRow.height;
    srcRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const dc = dstRow.getCell(colNum);
      dc.value = cell.value;
      if (cell.style) {
        try { dc.style = JSON.parse(JSON.stringify(cell.style)); } catch (e) {}
      }
    });
  }
  const merges = srcWs.model.merges || [];
  merges.forEach(m => { try { dst.mergeCells(m); } catch (e) {} });
  if (srcWs.autoFilter) dst.autoFilter = srcWs.autoFilter;
  if (srcWs.views && srcWs.views.length) dst.views = srcWs.views;
  const cfModel = srcWs.conditionalFormattings && srcWs.conditionalFormattings.model;
  if (cfModel) cfModel.forEach(cf => { try { dst.addConditionalFormatting(cf); } catch (e) {} });
  const dvModel = srcWs.dataValidations && srcWs.dataValidations.model;
  if (dvModel) {
    for (const ref of Object.keys(dvModel)) {
      try { dst.getCell(ref).dataValidation = dvModel[ref]; } catch (e) {}
    }
  }
  return dst;
}

function headerStyle(ws, colCount) {
  const row = ws.getRow(1);
  row.font = { bold: true, size: 11, name: "Calibri", color: { argb: "FF" + COLORS.white } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.navyBg } };
  row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  row.height = 30;
  for (let c = 1; c <= colCount; c++) row.getCell(c).border = THIN_BORDER;
}

function dataRow(ws, data) {
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
  if (v.includes("critical")) { row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.critRed } }; row.getCell(col).font = { bold: true, size: 10, name: "Calibri", color: { argb: "FFFFFFFF" } }; }
  else if (v.includes("high")) { row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.highOrange } }; row.getCell(col).font = { bold: true, size: 10, name: "Calibri", color: { argb: "FFFFFFFF" } }; }
  else if (v.includes("medium")) { row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.medYellow } }; }
  else if (v.includes("low")) { row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lowGreen } }; row.getCell(col).font = { bold: true, size: 10, name: "Calibri", color: { argb: "FFFFFFFF" } }; }
}

function colorStatus(row, col) {
  const v = String(row.getCell(col).value || "").toLowerCase();
  if (v.includes("fail") || v.includes("blocked")) row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.failBg } };
  else if (v.includes("verify") || v.includes("to test") || v.includes("pending")) row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.verifyBg } };
  else if (v.includes("pass") || v.includes("tested") || v.includes("confirmed")) row.getCell(col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.passBg } };
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

function readDataRows(ws) {
  const rows = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const vals = [];
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      while (vals.length < colNum - 1) vals.push("");
      if (cell.formula || cell.sharedFormula) vals.push("");
      else vals.push(cell.value != null ? String(cell.value) : "");
    });
    if (vals.some(v => v !== "")) rows.push(vals);
  }
  return rows;
}

// ─── SHEET 1: SECURITY ANALYSIS (merge SYSTEM MAP + SECURITY LEVELS) ────────

function buildSecurityAnalysis(wb) {
  const ws = wb.addWorksheet("SECURITY ANALYSIS", { tabColor: { argb: "FF" + COLORS.navyBg } });
  ws.properties.defaultColWidth = 22;
  for (let c = 1; c <= 8; c++) ws.getColumn(c).width = 22;

  let r = 1;

  // ═══ PART A: ARCHITECTURE MAP (from SYSTEM MAP) ═══

  mergedHeader(ws, `A${r}:H${r}`, "SECURITY ANALYSIS — ARCHITECTURE, LEVELS & RISK", COLORS.navyBg, 18);
  r += 2;

  // Legend
  mergedHeader(ws, `A${r}:H${r}`, "COLOR LEGEND", COLORS.sectionBg2, 11);
  r++;
  SYSTEM_MAP_BLOCKS.legend.forEach((l, i) => {
    const col = i * 2 + 1;
    ws.getCell(r, col).value = "  \u2588\u2588  ";
    ws.getCell(r, col).font = { size: 12, color: { argb: "FF" + l.color } };
    ws.getCell(r, col + 1).value = l.text;
    ws.getCell(r, col + 1).font = { bold: true, size: 10 };
  });
  r += 2;

  // Block 1: Exam Modes & Security Grades
  mergedHeader(ws, `A${r}:H${r}`, "BLOCK 1: MODULE MODES & SECURITY GRADES", COLORS.sectionBg, 12);
  r++;
  const modes = SYSTEM_MAP_BLOCKS.examModes;
  ws.getCell(r, 1).value = "";
  for (let i = 0; i < modes.length; i++) {
    ws.getColumn(i + 2).width = 28;
    const cell = ws.getCell(r, i + 2);
    cell.value = modes[i].mode;
    cell.font = { bold: true, size: 11, name: "Calibri", color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.sectionBg2 } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = THIN_BORDER;
  }
  r++;
  ws.getCell(r, 1).value = "Description"; ws.getCell(r, 1).font = { bold: true, size: 10 };
  for (let i = 0; i < modes.length; i++) {
    const cell = ws.getCell(r, i + 2);
    cell.value = modes[i].desc;
    cell.alignment = { wrapText: true, vertical: "top" }; cell.font = { size: 9 }; cell.border = THIN_BORDER;
  }
  ws.getRow(r).height = 70;
  r++;
  ws.getCell(r, 1).value = "Security Grade"; ws.getCell(r, 1).font = { bold: true, size: 10 };
  for (let i = 0; i < modes.length; i++) {
    const cell = ws.getCell(r, i + 2);
    cell.value = "Grade: " + modes[i].grade;
    cell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + modes[i].color } };
    cell.alignment = { horizontal: "center", vertical: "middle" }; cell.border = THIN_BORDER;
  }
  r += 2;

  // Block 2: Configuration Variables
  mergedHeader(ws, `A${r}:H${r}`, "BLOCK 2: CONFIGURATION VARIABLES", COLORS.sectionBg, 12);
  r++;
  mergedHeader(ws, `A${r}:H${r}`, "Layer 1: Feature Flags (3 Toggles)", COLORS.sectionBg2, 10);
  r++;
  ["Flag", "When ON", "When OFF", "Known Bug"].forEach((h, i) => {
    const cell = ws.getCell(r, i + 1);
    cell.value = h; cell.font = { bold: true, size: 10 }; cell.border = THIN_BORDER;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lightBlue } };
  });
  r++;
  SYSTEM_MAP_BLOCKS.configVars.featureFlags.forEach(f => {
    ws.getCell(r, 1).value = f.flag; ws.getCell(r, 1).font = { bold: true, size: 9 };
    ws.getCell(r, 2).value = f.on;
    ws.getCell(r, 3).value = f.off;
    if (f.off.includes("BUG")) ws.getCell(r, 3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lightRed } };
    ws.getCell(r, 4).value = f.bug || "";
    if (f.bug) ws.getCell(r, 4).font = { bold: true, color: { argb: "FFFF0000" } };
    for (let c = 1; c <= 4; c++) { ws.getCell(r, c).border = THIN_BORDER; ws.getCell(r, c).alignment = { wrapText: true, vertical: "top" }; }
    r++;
  });
  r++;

  mergedHeader(ws, `A${r}:H${r}`, "Layer 2: SEB Configuration", COLORS.sectionBg2, 10);
  r++;
  SYSTEM_MAP_BLOCKS.configVars.sebConfig.forEach(s => {
    ws.getCell(r, 1).value = s.setting; ws.getCell(r, 1).font = { bold: true, size: 9 };
    ws.mergeCells(r, 2, r, 4);
    ws.getCell(r, 2).value = s.desc;
    if (s.desc.includes("DANGER")) ws.getCell(r, 2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lightRed } };
    for (let c = 1; c <= 4; c++) { ws.getCell(r, c).border = THIN_BORDER; ws.getCell(r, c).alignment = { wrapText: true }; }
    r++;
  });
  r++;

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
      ws.getCell(r, 2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.critRed } };
      ws.getCell(r, 2).font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    } else if (s.validated === "YES") {
      ws.getCell(r, 2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.safeBg } };
      ws.getCell(r, 2).font = { bold: true, color: { argb: "FFFFFFFF" } };
    } else {
      ws.getCell(r, 2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.warnBg } };
    }
    ws.getCell(r, 3).value = s.risk;
    for (let c = 1; c <= 3; c++) { ws.getCell(r, c).border = THIN_BORDER; ws.getCell(r, c).alignment = { wrapText: true }; }
    r++;
  });
  r += 2;

  // Block 3: Threat Landscape
  mergedHeader(ws, `A${r}:H${r}`, "BLOCK 3: THREAT LANDSCAPE \u2014 7 ATTACK VECTORS", COLORS.dangerBg, 12);
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
      ws.getCell(r, i + 1).value = val; ws.getCell(r, i + 1).border = THIN_BORDER;
      ws.getCell(r, i + 1).font = { size: 9 }; ws.getCell(r, i + 1).alignment = { wrapText: true };
    });
    if (v.detectable === "No") ws.getCell(r, 4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lightRed } };
    r++;
  });
  r += 2;

  // Block 4: Admin Exploit Surface
  mergedHeader(ws, `A${r}:H${r}`, "BLOCK 4: ADMIN EXPLOIT SURFACE", COLORS.warnBg, 12);
  r++;
  const adminExploits = [
    ["/admin/seb-config URL", "Student accesses admin config page", "Returns 400 not 403 \u2014 info leakage", "REG-148"],
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
      if (i === 3 && v === "Critical") { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } }; cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } }; }
    });
    r++;
  });
  r += 2;

  // ═══ PART B: MODE VS FEATURE MATRIX (from SECURITY LEVELS) ═══

  const modeCols = ["Feature", "Offline", "Non-Proctored", "Proctored (No SEB)", "Proctored + SEB", "Proctored + SEB + BEK"];
  sectionHeader(ws, r, 8, "MODE vs SECURITY FEATURE MATRIX", COLORS.navyBg);
  r++;
  modeCols.forEach((h, i) => {
    const cell = ws.getCell(r, i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.sectionBg2 } };
    cell.border = THIN_BORDER; cell.alignment = { horizontal: "center", wrapText: true };
  });
  r++;

  SECURITY_MATRIX.forEach(row => {
    const cells = [row.feature, row.offline, row.nonProc, row.proctored, row.seb, row.sebBek];
    cells.forEach((v, i) => {
      const cell = ws.getCell(r, i + 1);
      cell.value = v; cell.border = THIN_BORDER; cell.alignment = { wrapText: true, vertical: "middle" };
      cell.font = { size: 9 };
      if (i === 0) cell.font = { bold: true, size: 9 };
      if (v === "\u2014") { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.naBg } }; cell.alignment = { horizontal: "center" }; }
      else if (v.includes("No") || v.includes("N/A") || v.includes("NOT")) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lightRed } };
      else if (v.includes("bypassable") || v.includes("JS") || v.includes("only") || v.includes("If")) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lightYellow } };
      else if (v.includes("Yes") || v.includes("Kernel") || v.includes("SEB") || v.includes("Token") || v.includes("13 types")) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lightGreen } };
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
    cell.alignment = { horizontal: "center", vertical: "middle" }; cell.border = THIN_BORDER;
  });
  r += 2;

  // ═══ PART C: FEATURE FLAG COMBINATIONS (from SECURITY LEVELS) ═══

  sectionHeader(ws, r, 8, "FEATURE FLAG COMBINATIONS (8 Permutations)", COLORS.navyBg);
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
      if (String(v).includes("BUG")) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.lightRed } };
    });
    r++;
  });
  r += 2;

  // ═══ PART D: RISK REGISTER (from SECURITY LEVELS) ═══

  sectionHeader(ws, r, 8, "RISK REGISTER \u2014 7 ATTACK VECTORS (Likelihood x Impact)", COLORS.navyBg);
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
        if (v === "CRITICAL") { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } }; cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } }; }
        else if (v === "HIGH") { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF6600" } }; cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } }; }
      }
    });
    r++;
  });

  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 1: SECURITY ANALYSIS \u2014 " + r + " rows (merged SYSTEM MAP + SECURITY LEVELS)");
}

// ─── SHEET 2: FOUND BUGS (keep as-is with all 22 columns) ──────────────────

function buildFoundBugs(wb, existingRows) {
  const ws = wb.addWorksheet("FOUND BUGS", { tabColor: { argb: "FFFF0000" } });
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

  existingRows.forEach(r => {
    const rowData = r.slice(0, 22);
    while (rowData.length < 22) rowData.push("");
    const row = dataRow(ws, rowData);
    colorSeverity(row, 7);
    colorStatus(row, 11);
  });

  for (let r = 2; r <= ws.rowCount; r++) {
    ws.getCell(r, 22).value = { formula: `IF(AND(N${r}="Fixed",Q${r}="Fail"),"DEV FAILURE",IF(AND(N${r}="Fixed",Q${r}="Pass"),"VERIFIED",IF(AND(N${r}="Fixed",Q${r}="Not Retested"),"AWAITING QA",IF(OR(N${r}="Open",N${r}="In Progress"),"OPEN",""))))` };
  }

  const lastRow = ws.rowCount;
  applyDropdown(ws, 13, 2, lastRow + 50, ["Frontend", "Backend API", "Database", "SEB Config", "Server", "Infrastructure"]);
  applyDropdown(ws, 14, 2, lastRow + 50, ["Open", "In Progress", "Fixed", "Won't Fix", "Deferred"]);
  applyDropdown(ws, 17, 2, lastRow + 50, ["Not Retested", "Pass", "Fail", "Blocked", "Partial"]);
  applyDropdown(ws, 20, 2, lastRow + 50, ["Logic Error", "Missing Validation", "Race Condition", "Config Mistake", "UI Bug", "Integration", "Security Gap"]);

  ws.addConditionalFormatting({ ref: `V2:V${lastRow + 50}`, rules: [
    { type: "containsText", operator: "containsText", text: "DEV FAILURE", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFF4444" } }, font: { bold: true, color: { argb: "FFFFFFFF" } } }, priority: 1 },
    { type: "containsText", operator: "containsText", text: "VERIFIED", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FF4CAF50" } }, font: { bold: true, color: { argb: "FFFFFFFF" } } }, priority: 2 },
    { type: "containsText", operator: "containsText", text: "AWAITING QA", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFFC107" } }, font: { bold: true } }, priority: 3 },
  ]});

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws.rowCount, column: 22 } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 2: FOUND BUGS \u2014 " + (ws.rowCount - 1) + " rows");
}

// ─── SHEET 3: SECURITY VECTORS (merge Detectable + Stealth) ─────────────────

function buildSecurityVectors(wb, detectableRows, stealthRows) {
  const ws = wb.addWorksheet("SECURITY VECTORS", { tabColor: { argb: "FF7030A0" } });
  ws.columns = [
    { header: "Vector ID", width: 10 }, { header: "Module Mode", width: 16 },
    { header: "Category", width: 18 }, { header: "Method", width: 35 },
    { header: "How It Works", width: 50 }, { header: "Detectable?", width: 13 },
    { header: "Detection Mechanism", width: 30 }, { header: "Risk Level", width: 14 },
    { header: "Difficulty", width: 12 }, { header: "Stealth Rating", width: 14 },
    { header: "Recommendation for Dev", width: 35 }, { header: "Status", width: 12 },
  ];
  headerStyle(ws, 12);

  // Add detectable rows (Detectable? = Yes)
  detectableRows.forEach(r => {
    const rowData = [
      r[0] || "",     // Vector ID (was Cheat ID)
      r[1] || "",     // Module Mode (was Exam Mode)
      r[2] || "",     // Category
      r[3] || "",     // Method
      r[4] || "",     // How It Works
      "Yes",          // Detectable? = Yes
      r[6] || "",     // Detection Mechanism
      r[7] || "",     // Risk Level
      r[8] || "",     // Difficulty
      r[9] || "",     // Stealth Rating
      r[10] || "",    // Recommendation
      r[11] || "",    // Status
    ];
    const row = dataRow(ws, rowData);
    colorStatus(row, 12);
    // Green highlight for "Yes" in Detectable column
    row.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.passBg } };
    row.getCell(6).font = { bold: true, size: 10 };
  });

  // Add stealth rows (Detectable? = No)
  stealthRows.forEach(r => {
    const rowData = [
      r[0] || "",     // Vector ID (was Cheat ID)
      r[1] || "",     // Module Mode (was Exam Mode)
      r[2] || "",     // Category
      r[3] || "",     // Method
      r[4] || "",     // How It Works
      "No",           // Detectable? = No
      r[6] || "",     // Detection Mechanism
      r[7] || "",     // Risk Level
      r[8] || "",     // Difficulty
      r[9] || "",     // Stealth Rating
      r[10] || "",    // Recommendation
      r[11] || "",    // Status
    ];
    const row = dataRow(ws, rowData);
    colorStatus(row, 12);
    // Red highlight for "No" in Detectable column
    row.getCell(6).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.failBg } };
    row.getCell(6).font = { bold: true, size: 10 };
  });

  applyDropdown(ws, 2, 2, ws.rowCount + 50, ["All Modes", "Proctored", "Proctored + SEB", "SEB Bypass"]);
  applyDropdown(ws, 6, 2, ws.rowCount + 50, ["Yes", "No", "Partial"]);

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws.rowCount, column: 12 } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 3: SECURITY VECTORS \u2014 " + (ws.rowCount - 1) + " rows (merged Detectable + Stealth)");
}

// ─── SHEET 4: REGRESSION SUITE (keep as-is, rename Exam Mode -> Module Mode) ─

function buildRegressionSuite(wb, existingRows) {
  const ws = wb.addWorksheet("REGRESSION SUITE", { tabColor: { argb: "FF4472C4" } });
  ws.columns = [
    { header: "Test ID", width: 10 }, { header: "Module Mode", width: 14 },
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
    const rowData = r.slice(0, 19);
    while (rowData.length < 19) rowData.push("");
    const row = dataRow(ws, rowData);
    colorSeverity(row, 11);
    colorStatus(row, 13);
  });

  for (let r = 2; r <= ws.rowCount; r++) {
    ws.getCell(r, 18).value = { formula: `IF(AND(P${r}="Fixed",Q${r}="Fail"),"DEV FAILURE",IF(AND(P${r}="Fixed",Q${r}="Pass"),"VERIFIED",IF(AND(P${r}="Fixed",Q${r}="Not Retested"),"AWAITING QA",IF(OR(P${r}="Open",P${r}="In Progress"),"OPEN",""))))` };
  }

  const lr = ws.rowCount + 50;
  applyDropdown(ws, 2, 2, lr, ["General", "Non-Proctored", "Proctored", "SEB", "SEB Bypass", "Admin", "Server"]);
  applyDropdown(ws, 16, 2, lr, ["", "Open", "In Progress", "Fixed", "Won't Fix", "Deferred"]);
  applyDropdown(ws, 17, 2, lr, ["", "Not Retested", "Pass", "Fail", "Blocked", "Partial"]);
  applyDropdown(ws, 19, 2, lr, ["", "Staging", "UAT", "Local", "Production"]);

  ws.addConditionalFormatting({ ref: `R2:R${lr}`, rules: [
    { type: "containsText", operator: "containsText", text: "DEV FAILURE", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFF4444" } }, font: { bold: true, color: { argb: "FFFFFFFF" } } }, priority: 1 },
    { type: "containsText", operator: "containsText", text: "VERIFIED", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FF4CAF50" } }, font: { bold: true, color: { argb: "FFFFFFFF" } } }, priority: 2 },
    { type: "containsText", operator: "containsText", text: "AWAITING QA", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFFC107" } }, font: { bold: true } }, priority: 3 },
  ]});
  ws.addConditionalFormatting({ ref: `M2:M${lr}`, rules: [
    { type: "containsText", operator: "containsText", text: "Blocked", style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFFD9B3" } }, font: { bold: true } }, priority: 4 },
  ]});

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws.rowCount, column: 19 } };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 4: REGRESSION SUITE \u2014 " + (ws.rowCount - 1) + " rows (Module Mode)");
}

// ─── SHEET 5: NOTES & OPEN ITEMS (renamed Edge Cases) ───────────────────────

function buildNotesOpenItems(wb, existingRows) {
  const ws = wb.addWorksheet("NOTES & OPEN ITEMS", { tabColor: { argb: "FFFF6600" } });
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
  console.log("  Sheet 5: NOTES & OPEN ITEMS \u2014 " + (ws.rowCount - 1) + " rows");
}

// ─── SHEET 6: DASHBOARD (updated formula references) ────────────────────────

function buildDashboard(wb) {
  const ws = wb.addWorksheet("DASHBOARD", { tabColor: { argb: "FF" + COLORS.navyBg } });
  ws.getColumn(1).width = 35;
  ws.getColumn(2).width = 18;
  ws.getColumn(3).width = 50;

  let r = 1;

  mergedHeader(ws, `A${r}:C${r}`, "TEST PLAN \u2014 SUMMARY DASHBOARD", COLORS.navyBg, 16);
  r += 2;

  // Section 1: Release Readiness
  mergedHeader(ws, `A${r}:C${r}`, "RELEASE READINESS", COLORS.dangerBg, 14);
  r++;
  ws.getCell(r, 1).value = "Production Ready?";
  ws.getCell(r, 1).font = { bold: true, size: 12 };
  ws.mergeCells(`B${r}:C${r}`);
  ws.getCell(r, 2).value = { formula: `IF(COUNTIF('FOUND BUGS'!G:G,"Critical")>0,"RED \u2014 NOT READY (Critical bugs open)",IF(COUNTIF('FOUND BUGS'!N:N,"Open")>5,"YELLOW \u2014 RISKS EXIST","GREEN \u2014 READY"))` };
  ws.getCell(r, 2).font = { bold: true, size: 14 };
  r += 2;

  // Section 2: Total Counts
  sectionHeader(ws, r, 3, "TOTAL COUNTS (Auto-updating)", COLORS.navyBg);
  r++;
  const counts = [
    ["Total Found Bugs", { formula: `COUNTA('FOUND BUGS'!A:A)-1` }, "Sheet: FOUND BUGS"],
    ["Total Security Vectors", { formula: `COUNTA('SECURITY VECTORS'!A:A)-1` }, "Sheet: SECURITY VECTORS"],
    ["  \u2514 Detectable (Yes)", { formula: `COUNTIF('SECURITY VECTORS'!F:F,"Yes")` }, "Filtered: Detectable? = Yes"],
    ["  \u2514 Stealth (No)", { formula: `COUNTIF('SECURITY VECTORS'!F:F,"No")` }, "Filtered: Detectable? = No"],
    ["Total Regression Test Cases", { formula: `COUNTA('REGRESSION SUITE'!A:A)-1` }, "Sheet: REGRESSION SUITE"],
    ["Total Notes & Open Items", { formula: `COUNTA('NOTES & OPEN ITEMS'!A:A)-1` }, "Sheet: NOTES & OPEN ITEMS"],
  ];
  const countStartRow = r;
  counts.forEach(c => {
    ws.getCell(r, 1).value = c[0]; ws.getCell(r, 1).font = { bold: true, size: 10 }; ws.getCell(r, 1).border = THIN_BORDER;
    ws.getCell(r, 2).value = c[1]; ws.getCell(r, 2).font = { bold: true, size: 12 }; ws.getCell(r, 2).border = THIN_BORDER;
    ws.getCell(r, 2).alignment = { horizontal: "center" };
    ws.getCell(r, 3).value = c[2]; ws.getCell(r, 3).font = { size: 9, color: { argb: "FF888888" } }; ws.getCell(r, 3).border = THIN_BORDER;
    r++;
  });
  // Grand total
  ws.getCell(r, 1).value = "GRAND TOTAL";
  ws.getCell(r, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.navyBg } };
  ws.getCell(r, 1).font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } }; ws.getCell(r, 1).border = THIN_BORDER;
  ws.getCell(r, 2).value = { formula: `B${countStartRow}+B${countStartRow + 1}+B${countStartRow + 4}+B${countStartRow + 5}` };
  ws.getCell(r, 2).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  ws.getCell(r, 2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.navyBg } };
  ws.getCell(r, 2).border = THIN_BORDER; ws.getCell(r, 2).alignment = { horizontal: "center" };
  r += 2;

  // Section 3: Bug Resolution Tracker
  sectionHeader(ws, r, 3, "BUG RESOLUTION TRACKER (Auto-updating)", COLORS.navyBg);
  r++;
  const bugTracker = [
    ["Bugs \u2014 Open", { formula: `COUNTIF('FOUND BUGS'!N:N,"Open")` }],
    ["Bugs \u2014 In Progress", { formula: `COUNTIF('FOUND BUGS'!N:N,"In Progress")` }],
    ["Bugs \u2014 Fixed by Dev", { formula: `COUNTIF('FOUND BUGS'!N:N,"Fixed")` }],
    ["Bugs \u2014 Verified by QA", { formula: `COUNTIF('FOUND BUGS'!V:V,"VERIFIED")` }],
    ["Bugs \u2014 DEV FAILURES", { formula: `COUNTIF('FOUND BUGS'!V:V,"DEV FAILURE")` }],
    ["Bugs \u2014 Awaiting QA Retest", { formula: `COUNTIF('FOUND BUGS'!V:V,"AWAITING QA")` }],
    ["Bugs \u2014 Won't Fix / Deferred", { formula: `COUNTIF('FOUND BUGS'!N:N,"Won't Fix")+COUNTIF('FOUND BUGS'!N:N,"Deferred")` }],
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
  const testedRow = r;
  const testProgress = [
    ["Tests \u2014 Tested / Pass", { formula: `COUNTIF('REGRESSION SUITE'!M:M,"*Tested*")+COUNTIF('REGRESSION SUITE'!M:M,"*Pass*")` }],
    ["Tests \u2014 To Test", { formula: `COUNTIF('REGRESSION SUITE'!M:M,"*To Test*")+COUNTIF('REGRESSION SUITE'!M:M,"*To Verify*")+COUNTIF('REGRESSION SUITE'!M:M,"*N/A*")` }],
    ["Tests \u2014 Blocked", { formula: `COUNTIF('REGRESSION SUITE'!M:M,"*Blocked*")` }],
    ["Tests \u2014 Failed", { formula: `COUNTIF('REGRESSION SUITE'!M:M,"*Fail*")` }],
  ];
  testProgress.forEach(t => {
    ws.getCell(r, 1).value = t[0]; ws.getCell(r, 1).font = { bold: true, size: 10 }; ws.getCell(r, 1).border = THIN_BORDER;
    ws.getCell(r, 2).value = t[1]; ws.getCell(r, 2).font = { bold: true, size: 11 }; ws.getCell(r, 2).border = THIN_BORDER;
    ws.getCell(r, 2).alignment = { horizontal: "center" };
    r++;
  });
  // Progress bar
  ws.getCell(r, 1).value = "% Complete"; ws.getCell(r, 1).font = { bold: true, size: 10 }; ws.getCell(r, 1).border = THIN_BORDER;
  const totalRef = `COUNTA('REGRESSION SUITE'!A:A)-1`;
  ws.mergeCells(`B${r}:C${r}`);
  ws.getCell(r, 2).value = { formula: `IF(${totalRef}>0,REPT("\u2588",ROUND(B${testedRow}/(${totalRef})*20,0))&REPT("\u2591",20-ROUND(B${testedRow}/(${totalRef})*20,0))&" "&ROUND(B${testedRow}/(${totalRef})*100,1)&"%","N/A")` };
  ws.getCell(r, 2).font = { size: 12, name: "Consolas" }; ws.getCell(r, 2).border = THIN_BORDER;
  r += 2;

  // Section 5: Progress by Module Mode
  sectionHeader(ws, r, 3, "PROGRESS BY MODULE MODE (Auto-updating)", COLORS.navyBg);
  r++;
  const modesList = ["General", "Non-Proctored", "Proctored", "SEB", "SEB Bypass", "Admin", "Server"];
  modesList.forEach(m => {
    ws.getCell(r, 1).value = m; ws.getCell(r, 1).font = { bold: true, size: 10 }; ws.getCell(r, 1).border = THIN_BORDER;
    ws.getCell(r, 2).value = { formula: `COUNTIF('REGRESSION SUITE'!B:B,"${m}")` };
    ws.getCell(r, 2).font = { bold: true, size: 11 }; ws.getCell(r, 2).border = THIN_BORDER;
    ws.getCell(r, 2).alignment = { horizontal: "center" };
    ws.getCell(r, 3).value = { formula: `COUNTIFS('REGRESSION SUITE'!B:B,"${m}",'REGRESSION SUITE'!M:M,"*Tested*")+COUNTIFS('REGRESSION SUITE'!B:B,"${m}",'REGRESSION SUITE'!M:M,"*Pass*")&" tested / "&COUNTIFS('REGRESSION SUITE'!B:B,"${m}",'REGRESSION SUITE'!M:M,"*To Test*")&" remaining"` };
    ws.getCell(r, 3).font = { size: 9 }; ws.getCell(r, 3).border = THIN_BORDER;
    r++;
  });
  r++;

  // Section 6: Severity Distribution
  sectionHeader(ws, r, 3, "BUG SEVERITY DISTRIBUTION (Auto-updating)", COLORS.navyBg);
  r++;
  [["Critical", "FF" + COLORS.critRed], ["High", "FF" + COLORS.highOrange], ["Medium", "FF" + COLORS.medYellow], ["Low", "FF" + COLORS.lowGreen]].forEach(([sev, color]) => {
    ws.getCell(r, 1).value = sev;
    ws.getCell(r, 1).font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    ws.getCell(r, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    ws.getCell(r, 1).border = THIN_BORDER;
    ws.getCell(r, 2).value = { formula: `COUNTIF('FOUND BUGS'!G:G,"${sev}")` };
    ws.getCell(r, 2).font = { bold: true, size: 12 }; ws.getCell(r, 2).border = THIN_BORDER;
    ws.getCell(r, 2).alignment = { horizontal: "center" };
    r++;
  });
  r++;

  // Section 7: Stakeholder Summary
  sectionHeader(ws, r, 3, "STAKEHOLDER SUMMARY", COLORS.navyBg);
  r++;
  const stakeholderNotes = [
    "CURRENT RISK: HIGH \u2014 BEK not implemented, 4 critical bypass vectors unblocked, 3 critical bugs open.",
    "SEB STATUS: Bypass PoC created (AI-generated DLLs). SEBPatch actively maintained (194+ weekly downloads). Config Key validation is insufficient without BEK.",
    "BLOCKER: BUG-006 prevents all non-proctored exam testing. Feature flag OFF still enforces proctoring.",
    "RECOMMENDATION: Implement BEK validation and SEB version enforcement before production deployment.",
  ];
  stakeholderNotes.forEach(n => {
    ws.mergeCells(`A${r}:C${r}`);
    ws.getCell(r, 1).value = n; ws.getCell(r, 1).font = { size: 10, italic: true };
    ws.getCell(r, 1).alignment = { wrapText: true }; ws.getCell(r, 1).border = THIN_BORDER;
    ws.getRow(r).height = 30;
    r++;
  });

  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  Sheet 6: DASHBOARD \u2014 " + r + " rows (100% formula-driven, updated references)");
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("Reading existing EMS_Exam_Security_TestPlan_v2.xlsx...");
  const oldWb = new ExcelJS.Workbook();
  await oldWb.xlsx.readFile("EMS_Exam_Security_TestPlan_v2.xlsx");
  console.log("Existing sheets:", oldWb.worksheets.map(s => `${s.name} (${s.rowCount}r)`).join(", "));

  // Read data from sheets we need
  const bugsData = readDataRows(oldWb.getWorksheet("Found Bugs"));
  const detectableData = readDataRows(oldWb.getWorksheet("Cheat - Detectable"));
  const stealthData = readDataRows(oldWb.getWorksheet("Cheat - Stealth"));
  const regressionData = readDataRows(oldWb.getWorksheet("Regression Suite"));
  const edgeCasesData = readDataRows(oldWb.getWorksheet("Edge Cases & Open Ends"));

  console.log(`\nData extracted:`);
  console.log(`  Found Bugs: ${bugsData.length} rows`);
  console.log(`  Cheat - Detectable: ${detectableData.length} rows`);
  console.log(`  Cheat - Stealth: ${stealthData.length} rows`);
  console.log(`  Regression Suite: ${regressionData.length} rows`);
  console.log(`  Edge Cases: ${edgeCasesData.length} rows`);

  console.log(`\nBuilding new workbook (7 sheets)...\n`);
  const newWb = new ExcelJS.Workbook();
  newWb.creator = "Senior Test Architect";
  newWb.created = new Date();

  // Sheet 0: HOW IT WORKS (copy from existing HOW THE SYSTEM WORKS)
  const howItWorksSrc = oldWb.getWorksheet("HOW THE SYSTEM WORKS");
  copySheet(howItWorksSrc, newWb, "HOW IT WORKS", "FF3498DB");
  console.log("  Sheet 0: HOW IT WORKS \u2014 " + howItWorksSrc.rowCount + " rows (copied)");

  // Sheet 1: SECURITY ANALYSIS (merge SYSTEM MAP + SECURITY LEVELS)
  buildSecurityAnalysis(newWb);

  // Sheet 2: FOUND BUGS
  buildFoundBugs(newWb, bugsData);

  // Sheet 3: SECURITY VECTORS (merge Detectable + Stealth)
  buildSecurityVectors(newWb, detectableData, stealthData);

  // Sheet 4: REGRESSION SUITE
  buildRegressionSuite(newWb, regressionData);

  // Sheet 5: NOTES & OPEN ITEMS
  buildNotesOpenItems(newWb, edgeCasesData);

  // Sheet 6: DASHBOARD
  buildDashboard(newWb);

  // Save
  const outFile = "EMS_Exam_Security_TestPlan_v2.xlsx";
  await newWb.xlsx.writeFile(outFile);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`CONSOLIDATED WORKBOOK SAVED: ${outFile}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`\nSheets: ${newWb.worksheets.length}`);
  newWb.worksheets.forEach((ws, i) => console.log(`  ${i}. ${ws.name} (${ws.rowCount} rows)`));
  console.log(`\nChanges from 11-sheet to 7-sheet:`);
  console.log(`  REMOVED: knowledge base, How Exams Work, SYSTEM MAP, SECURITY LEVELS, Cheat-Detectable, Cheat-Stealth`);
  console.log(`  MERGED: SYSTEM MAP + SECURITY LEVELS -> SECURITY ANALYSIS`);
  console.log(`  MERGED: Cheat-Detectable + Cheat-Stealth -> SECURITY VECTORS (with "Detectable?" column)`);
  console.log(`  RENAMED: Edge Cases & Open Ends -> NOTES & OPEN ITEMS`);
  console.log(`  RENAMED: Exam Mode -> Module Mode (Regression Suite)`);
  console.log(`  RENAMED: Cheat ID -> Vector ID (Security Vectors)`);
  console.log(`  UPDATED: All DASHBOARD formulas reference new sheet names`);
  console.log(`\nData preserved:`);
  console.log(`  Bugs: ${bugsData.length} | Vectors: ${detectableData.length + stealthData.length} | Regression: ${regressionData.length} | Notes: ${edgeCasesData.length}`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
