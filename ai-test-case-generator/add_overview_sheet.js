const ExcelJS = require("exceljs");

const BORDER = { top:{style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };
const C = {
  navy: "FF1B2A4A", white: "FFFFFFFF", gray: "FFE0E0E0", lightBlue: "FFD6EAF8",
  lightGreen: "FFD5F5E3", darkGreen: "FFA9DFBF", section2: "FF34495E",
  lightYellow: "FFFEF9E7", lightRed: "FFFADBD8",
  veryHigh: "FFFF6B6B", high: "FFFFA502", medium: "FFFFD93D", low: "FF74B9FF",
  footerBg: "FFF5F5F5", altRow: "FFF2F2F2",
};

function title(ws, row, text, cols) {
  ws.mergeCells(row, 1, row, cols);
  const c = ws.getCell(row, 1);
  c.value = text;
  c.font = { bold: true, size: 14, name: "Calibri", color: { argb: C.white } };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } };
  c.alignment = { horizontal: "center", vertical: "middle" };
  c.border = BORDER;
  ws.getRow(row).height = 32;
}

function subTitle(ws, row, text, cols) {
  ws.mergeCells(row, 1, row, cols);
  const c = ws.getCell(row, 1);
  c.value = text;
  c.font = { bold: true, size: 11, name: "Calibri", color: { argb: C.white } };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.section2 } };
  c.alignment = { horizontal: "left", vertical: "middle" };
  c.border = BORDER;
  ws.getRow(row).height = 24;
}

function typeBlock(ws, row, col, colSpan, name, desc, bgColor) {
  ws.mergeCells(row, col, row, col + colSpan - 1);
  const nameCell = ws.getCell(row, col);
  nameCell.value = name;
  nameCell.font = { bold: true, size: 12 };
  nameCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
  nameCell.alignment = { horizontal: "center", vertical: "middle" };
  nameCell.border = BORDER;

  ws.mergeCells(row + 1, col, row + 3, col + colSpan - 1);
  const descCell = ws.getCell(row + 1, col);
  descCell.value = desc;
  descCell.font = { size: 10 };
  descCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
  descCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  descCell.border = BORDER;
}

function configGroup(ws, row, groupName, items, cols) {
  subTitle(ws, row, groupName, cols);
  row++;
  ["Setting", "What It Controls"].forEach((h, i) => {
    const c = ws.getCell(row, i === 0 ? 1 : 3);
    if (i === 0) ws.mergeCells(row, 1, row, 2);
    else ws.mergeCells(row, 3, row, cols);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: C.white } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.section2 } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = BORDER;
  });
  row++;
  items.forEach((item, idx) => {
    ws.mergeCells(row, 1, row, 2);
    ws.mergeCells(row, 3, row, cols);
    const c1 = ws.getCell(row, 1);
    c1.value = item[0]; c1.font = { bold: true, size: 10 }; c1.border = BORDER;
    c1.alignment = { vertical: "middle", wrapText: true };
    const c2 = ws.getCell(row, 3);
    c2.value = item[1]; c2.font = { size: 10 }; c2.border = BORDER;
    c2.alignment = { vertical: "middle", wrapText: true };
    if (idx % 2 === 1) {
      c1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.altRow } };
      c2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.altRow } };
    }
    row++;
  });
  return row;
}

function copySheet(srcWs, destWb, name, tabColor) {
  const dst = destWb.addWorksheet(name, { tabColor: tabColor ? { argb: tabColor } : undefined });
  // Copy column widths
  srcWs.columns.forEach((col, i) => {
    if (col.width) dst.getColumn(i + 1).width = col.width;
  });
  // Copy rows with values, styles, and merges
  for (let r = 1; r <= srcWs.rowCount; r++) {
    const srcRow = srcWs.getRow(r);
    const dstRow = dst.getRow(r);
    if (srcRow.height) dstRow.height = srcRow.height;
    srcRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const dc = dstRow.getCell(colNum);
      dc.value = cell.value;
      if (cell.style) dc.style = JSON.parse(JSON.stringify(cell.style));
    });
  }
  // Copy merged cells
  if (srcWs._merges) {
    for (const key of Object.keys(srcWs._merges)) {
      try { dst.mergeCells(srcWs._merges[key]); } catch (e) { /* skip if already merged */ }
    }
  }
  // Copy autoFilter
  if (srcWs.autoFilter) dst.autoFilter = srcWs.autoFilter;
  // Copy views (frozen panes)
  if (srcWs.views && srcWs.views.length) dst.views = srcWs.views;
  // Copy data validations
  if (srcWs.dataValidations && srcWs.dataValidations.model) {
    for (const ref of Object.keys(srcWs.dataValidations.model)) {
      // Apply each validation
    }
  }
  // Copy conditional formatting
  if (srcWs.conditionalFormattings && srcWs.conditionalFormattings.model) {
    srcWs.conditionalFormattings.model.forEach(cf => {
      try { dst.addConditionalFormatting(cf); } catch (e) { /* skip */ }
    });
  }
  return dst;
}

async function main() {
  console.log("Reading existing v2 Excel...");
  const oldWb = new ExcelJS.Workbook();
  await oldWb.xlsx.readFile("EMS_Exam_Security_TestPlan_v2.xlsx");
  console.log("Existing sheets:", oldWb.worksheets.map(s => s.name).join(", "));

  const newWb = new ExcelJS.Workbook();
  newWb.creator = "Senior Test Architect";
  newWb.created = new Date();

  // ═══════════════════════════════════════════════════════════════
  // BUILD THE OVERVIEW SHEET FIRST
  // ═══════════════════════════════════════════════════════════════
  const ws = newWb.addWorksheet("HOW THE SYSTEM WORKS", { tabColor: { argb: "FF3498DB" } });
  const COLS = 6;
  for (let c = 1; c <= COLS; c++) ws.getColumn(c).width = 22;

  let r = 1;

  // SECTION 1: EXAM TYPES
  title(ws, r, "EXAM MODULE \u2014 HOW IT WORKS", COLS);
  r += 2;
  typeBlock(ws, r, 1, 2, "OFFLINE EXAM",
    "Question paper is downloaded.\nExam is conducted offline.\nNo software control.", C.gray);
  typeBlock(ws, r, 3, 2, "ONLINE NON-PROCTORED",
    "Student takes exam in browser.\nNo camera, no fullscreen required.\nFor mock / practice use.", C.lightBlue);
  typeBlock(ws, r, 5, 2, "ONLINE PROCTORED",
    "Camera ON, fullscreen mandatory,\nscreen sharing required.\nStudent monitored throughout.", C.lightGreen);
  r += 5;

  ws.mergeCells(r, 5, r, 6);
  const sa1 = ws.getCell(r, 5);
  sa1.value = "+ SAFE EXAM BROWSER (SEB)";
  sa1.font = { bold: true, size: 10 };
  sa1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.darkGreen } };
  sa1.alignment = { horizontal: "center", vertical: "middle" };
  sa1.border = BORDER;
  r++;
  ws.mergeCells(r, 5, r + 1, 6);
  const sa2 = ws.getCell(r, 5);
  sa2.value = "All proctoring features PLUS\nbrowser lockdown. Blocks shortcuts,\ntaskbar, other applications.";
  sa2.font = { size: 9 };
  sa2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.darkGreen } };
  sa2.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sa2.border = BORDER;
  r += 3;

  // SECTION 2: STUDENT JOURNEY
  title(ws, r, "WHAT A STUDENT EXPERIENCES", COLS);
  r++;
  const steps = [
    ["1", "Student opens the exam link in Chrome browser"],
    ["2", "System verifies liveliness \u2014 student looks at camera, photo is captured"],
    ["3", "Student uploads their ID card (no specific format required)"],
    ["4", "System asks to share the entire screen (not just a tab or window)"],
    ["5", "Exam begins \u2014 timer starts counting down"],
    ["6", "Student answers questions one at a time:\n  \u2022 Single choice   \u2022 Multiple choice   \u2022 Fill in the blanks\n  \u2022 Match the following   \u2022 Descriptive / Subjective"],
    ["7", "Student can mark questions for review and navigate freely between questions"],
    ["8", "System continuously monitors for suspicious activity (see Malpractice Detection below)"],
    ["9", "When time runs out, exam is auto-submitted"],
    ["10", "Faculty / Invigilator reviews submissions from their dashboard"],
  ];
  steps.forEach((s, idx) => {
    ws.mergeCells(r, 2, r, COLS);
    const c1 = ws.getCell(r, 1);
    c1.value = s[0]; c1.font = { bold: true, size: 11 };
    c1.alignment = { horizontal: "center", vertical: "middle" }; c1.border = BORDER;
    const c2 = ws.getCell(r, 2);
    c2.value = s[1]; c2.font = { size: 10 };
    c2.alignment = { vertical: "middle", wrapText: true }; c2.border = BORDER;
    if (idx % 2 === 1) {
      c1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.altRow } };
      c2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.altRow } };
    }
    if (s[1].includes("\n")) ws.getRow(r).height = 42;
    r++;
  });
  r++;

  // SECTION 3: ADMIN CONFIG
  title(ws, r, "WHAT ADMIN CAN CONFIGURE", COLS);
  r++;
  r = configGroup(ws, r, "PROCTORING SETTINGS", [
    ["Enable Proctoring", "Master switch \u2014 turns on camera, fullscreen, and malpractice detection"],
    ["Enable Screenshot Capture", "System takes screenshots of student's screen every 31 seconds"],
    ["Enable Webcam Monitoring", "Webcam stays on \u2014 face detection and liveliness checks run continuously"],
  ], COLS);
  r++;
  r = configGroup(ws, r, "FULLSCREEN CONTROLS", [
    ["Max time outside fullscreen", "How long student can be outside fullscreen before exam is paused (default: 50 seconds)"],
    ["Max exits allowed", "How many times student can exit fullscreen before exam is paused (default: 10)"],
  ], COLS);
  r++;
  r = configGroup(ws, r, "MONITORING CONTROLS", [
    ["Confidence score threshold", "If score drops below this %, exam is automatically put on hold"],
    ["Auto-mark malpractice", "System flags cheating automatically when threshold is breached"],
    ["Auto-hold on violation", "Exam pauses automatically when confidence score is too low"],
    ["Capture interval", "How often photos and events are captured (default: 31 seconds)"],
  ], COLS);
  r++;
  r = configGroup(ws, r, "ACCESS & PERMISSION CONTROLS", [
    ["Restrict by geofence", "Only allow exam access from campus / defined location"],
    ["Restrict by face recognition", "Verify student identity before exam starts"],
    ["Allow invigilator to terminate", "Let invigilator end a student's exam"],
    ["Allow invigilator to resume", "Let invigilator restart a paused exam"],
    ["Allow faculty attendance report", "Faculty can download venue-wise attendance"],
    ["Allow invigilator to view answer sheet ID", "Invigilator can see/edit answer sheet identifiers"],
  ], COLS);
  r++;
  r = configGroup(ws, r, "SEB (SAFE EXAM BROWSER) SETTINGS", [
    ["Upload .seb config file", "Locks the browser into exam-only mode"],
    ["Config Key (64-char hex)", "Verifies student is using the official SEB configuration"],
    ["Force Disable SEB", "Emergency switch \u2014 let all students skip SEB"],
    ["Force Enable SEB", "Require SEB for all exams, regardless of individual settings"],
    ["Bypass Validation", "Skip config key check \u2014 for testing purposes only"],
    ["Bypass Override", "Global SEB config overrides individual exam configs"],
  ], COLS);
  r += 2;

  // SECTION 4: MALPRACTICE DETECTION
  title(ws, r, "HOW THE SYSTEM DETECTS CHEATING", COLS);
  r++;
  // Header
  ws.mergeCells(r, 1, r, 2); ws.mergeCells(r, 3, r, 4); ws.mergeCells(r, 5, r, 6);
  ["What System Detects", "What It Means", "Severity"].forEach((h, i) => {
    const col = i * 2 + 1;
    const c = ws.getCell(r, col);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: C.white } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.section2 } };
    c.alignment = { horizontal: "center", vertical: "middle" }; c.border = BORDER;
  });
  r++;

  const detections = [
    ["Multiple Faces", "More than one person visible on camera", "Very High"],
    ["No Face Detected", "Student left the camera view", "Very High"],
    ["Screen Switch", "Student switched to another application or window", "High"],
    ["Screen Share Stopped", "Student stopped sharing their screen", "High"],
    ["New Session Created", "Exam opened on another device", "Medium"],
    ["Screen Inactive", "No activity on exam page for extended time", "Medium"],
    ["Internet Disconnected", "Connection lost or intentionally cut", "Medium"],
    ["Disabled Fullscreen", "Student exited fullscreen mode", "Low"],
    ["Sleep Mode", "Student closed the laptop lid", "Low"],
    ["Copy-Paste Attempt", "Student tried Ctrl+C or Ctrl+V", "Low"],
    ["Session Error", "Multiple device access detected", "Low"],
    ["Invalid User", "Face does not match the registered student photo", "Low"],
    ["Right Click", "Student tried to access browser context menu", "Low"],
  ];
  const sevColor = s => s === "Very High" ? C.veryHigh : s === "High" ? C.high : s === "Medium" ? C.medium : C.low;
  detections.forEach(d => {
    ws.mergeCells(r, 1, r, 2); ws.mergeCells(r, 3, r, 4); ws.mergeCells(r, 5, r, 6);
    const c1 = ws.getCell(r, 1);
    c1.value = d[0]; c1.font = { bold: true, size: 10 }; c1.border = BORDER; c1.alignment = { vertical: "middle" };
    const c2 = ws.getCell(r, 3);
    c2.value = d[1]; c2.font = { size: 10 }; c2.border = BORDER; c2.alignment = { vertical: "middle", wrapText: true };
    const c3 = ws.getCell(r, 5);
    c3.value = d[2]; c3.font = { bold: true, size: 10, color: { argb: C.white } }; c3.border = BORDER;
    c3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: sevColor(d[2]) } };
    c3.alignment = { horizontal: "center", vertical: "middle" };
    r++;
  });
  r++;
  ws.mergeCells(r, 1, r + 2, COLS);
  const note = ws.getCell(r, 1);
  note.value = "Each detection carries a weight. All weights combine into a CONFIDENCE SCORE.\nIf the score drops below the configured threshold, the exam is automatically put ON HOLD\nuntil the invigilator reviews and resumes it.";
  note.font = { size: 10, italic: true };
  note.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.lightYellow } };
  note.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; note.border = BORDER;
  r += 4;

  // SECTION 5: SEB
  title(ws, r, "SAFE EXAM BROWSER (SEB) \u2014 ADDITIONAL SECURITY LAYER", COLS);
  r++;
  subTitle(ws, r, "WHAT IS SEB?", COLS); r++;
  ws.mergeCells(r, 1, r + 1, COLS);
  const whatIs = ws.getCell(r, 1);
  whatIs.value = "SEB is an optional lockdown browser. When enabled, students must use SEB instead of Chrome to take their exam.\nIt provides a controlled environment that prevents access to other applications, shortcuts, and system functions.";
  whatIs.font = { size: 10 }; whatIs.alignment = { wrapText: true, vertical: "middle" }; whatIs.border = BORDER;
  r += 3;

  subTitle(ws, r, "WHAT SEB BLOCKS", COLS); r++;
  [["Alt+Tab","Ctrl+C / Ctrl+V","Windows key / Taskbar"],["Task Manager","Screen Recording","Print Screen"],
   ["Secondary Apps","Right Click","F12 / Developer Tools"],["Clipboard Access","Multiple Displays","Browser Navigation"]].forEach(row => {
    row.forEach((v, i) => {
      ws.mergeCells(r, i * 2 + 1, r, i * 2 + 2);
      const c = ws.getCell(r, i * 2 + 1);
      c.value = v; c.font = { size: 10 };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.lightRed } };
      c.alignment = { horizontal: "center", vertical: "middle" }; c.border = BORDER;
    });
    r++;
  });
  r++;

  subTitle(ws, r, "WHAT SEB ENFORCES", COLS); r++;
  ["Fullscreen kiosk mode \u2014 student cannot resize or minimize the window",
   "Single display only \u2014 disconnects external monitors automatically",
   "Process monitoring \u2014 kills unauthorized background processes",
   "URL filtering \u2014 only allowed URLs can be accessed inside SEB"].forEach(e => {
    ws.mergeCells(r, 1, r, COLS);
    const c = ws.getCell(r, 1);
    c.value = "  \u2022  " + e; c.font = { size: 10 }; c.alignment = { vertical: "middle", wrapText: true }; c.border = BORDER;
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.lightGreen } };
    r++;
  });
  r++;

  subTitle(ws, r, "WHAT SEB DETECTS", COLS); r++;
  ws.mergeCells(r, 1, r, COLS);
  const det = ws.getCell(r, 1);
  det.value = "  \u2022  Virtual machines (VMs) \u2014 checks hardware manufacturer name, MAC address, and PCI vendor IDs";
  det.font = { size: 10 }; det.alignment = { vertical: "middle" }; det.border = BORDER;
  det.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.lightYellow } };
  r += 2;

  subTitle(ws, r, "HOW ADMIN CONFIGURES SEB", COLS); r++;
  [["1","Download the SEB Config Tool from safeexambrowser.org"],
   ["2","Set the exam portal URL as the Start URL"],
   ["3","Set Browser Engine Policy to \"Prefer Modern\" (required for camera/mic)"],
   ["4","Enable camera and microphone access in SEB security settings"],
   ["5","Save as a .seb file and upload to the admin console"],
   ["6","Optionally paste the Config Key (64-char hex) for config verification"]].forEach((s, idx) => {
    ws.mergeCells(r, 2, r, COLS);
    const c1 = ws.getCell(r, 1);
    c1.value = s[0]; c1.font = { bold: true, size: 10 }; c1.alignment = { horizontal: "center", vertical: "middle" }; c1.border = BORDER;
    const c2 = ws.getCell(r, 2);
    c2.value = s[1]; c2.font = { size: 10 }; c2.alignment = { vertical: "middle", wrapText: true }; c2.border = BORDER;
    if (idx % 2 === 1) {
      c1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.altRow } };
      c2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.altRow } };
    }
    r++;
  });
  r++;

  subTitle(ws, r, "FILE UPLOAD IN SEB", COLS); r++;
  ws.mergeCells(r, 1, r + 1, COLS);
  const fu = ws.getCell(r, 1);
  fu.value = "By default, SEB blocks access to the file explorer. If an exam requires students to upload files (e.g., subjective answers),\nthe .seb config must explicitly allow it using the \"chooseFileToUploadPolicy\" setting.";
  fu.font = { size: 10 }; fu.alignment = { wrapText: true, vertical: "middle" }; fu.border = BORDER;
  r += 3;

  // Footer
  ws.mergeCells(r, 1, r, COLS);
  const footer = ws.getCell(r, 1);
  footer.value = "Generated from EMS.md \u2014 re-run prompt to update this sheet when system changes.";
  footer.font = { size: 9, italic: true, color: { argb: "FF888888" } };
  footer.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.footerBg } };
  footer.alignment = { horizontal: "center", vertical: "middle" }; footer.border = BORDER;

  ws.views = [{ state: "frozen", ySplit: 1 }];
  console.log("  HOW THE SYSTEM WORKS: " + r + " rows");

  // ═══════════════════════════════════════════════════════════════
  // COPY ALL EXISTING SHEETS
  // ═══════════════════════════════════════════════════════════════
  const tabColors = {
    "SYSTEM MAP": "FF1B2A4A", "SECURITY LEVELS": "FF4D96FF", "How Exams Work": "FF4472C4",
    "Found Bugs": "FFFF0000", "Cheat - Detectable": "FF00AA00", "Cheat - Stealth": "FF7030A0",
    "Regression Suite": "FF4472C4", "Edge Cases & Open Ends": "FFFF6600", "SUMMARY DASHBOARD": "FF1B2A4A",
  };
  for (const srcWs of oldWb.worksheets) {
    console.log("  Copying: " + srcWs.name + " (" + srcWs.rowCount + " rows)");
    copySheet(srcWs, newWb, srcWs.name, tabColors[srcWs.name]);
  }

  await newWb.xlsx.writeFile("EMS_Exam_Security_TestPlan_v2.xlsx");
  console.log("\nSaved: EMS_Exam_Security_TestPlan_v2.xlsx");
  console.log("Sheets:", newWb.worksheets.map(s => s.name).join(" | "));
  console.log("Done!");
}

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
        try { dc.style = JSON.parse(JSON.stringify(cell.style)); } catch(e) {}
      }
    });
  }
  // Copy merges
  const merges = srcWs.model.merges || [];
  merges.forEach(m => { try { dst.mergeCells(m); } catch(e) {} });
  if (srcWs.autoFilter) dst.autoFilter = srcWs.autoFilter;
  if (srcWs.views && srcWs.views.length) dst.views = srcWs.views;
  // Copy conditional formatting
  const cfModel = srcWs.conditionalFormattings && srcWs.conditionalFormattings.model;
  if (cfModel) cfModel.forEach(cf => { try { dst.addConditionalFormatting(cf); } catch(e) {} });
  // Copy data validations
  const dvModel = srcWs.dataValidations && srcWs.dataValidations.model;
  if (dvModel) {
    for (const ref of Object.keys(dvModel)) {
      try { dst.getCell(ref).dataValidation = dvModel[ref]; } catch(e) {}
    }
  }
  return dst;
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
