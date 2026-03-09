const ExcelJS = require("exceljs");

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile("EMS_Exam_Security_TestPlan.xlsx");

  const thinBorder = { top:{style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };

  function addRow(ws, data) {
    const row = ws.addRow(data);
    row.font = { size: 10, name: "Calibri" };
    row.alignment = { vertical: "top", wrapText: true };
    const rn = row.number;
    row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rn % 2 === 0 ? "FFFFFFFF" : "FFF2F2F2" } };
    const colCount = ws.columns.length;
    for (let c = 1; c <= colCount; c++) row.getCell(c).border = thinBorder;
    return row;
  }

  const ws5 = wb.getWorksheet("5. Regression Suite");

  // Update REG-131 with confirmed finding (v3.6.0 patch ALSO fails)
  for (let r = 2; r <= ws5.rowCount; r++) {
    const row = ws5.getRow(r);
    const id = String(row.getCell(1).value);
    if (id === "REG-131") {
      row.getCell(5).value = "Both v3.5.0.544 AND v3.6.0.633 patches crash on SEB v3.6.0.633 with same RemoteSessionDetector error";
      row.getCell(9).value = "CONFIRMED: Both patch versions crash with identical Fatal Error. GitHub Issue #55 reports same problem. The nxvvvv bypass project is BROKEN for v3.6.0. The patch has not been updated since Jan 2024 and SEB has evolved. Issue #60 and #62 confirm others have same Fatal Error in Dec 2025 and Feb 2026.";
      row.getCell(12).value = "Tested";
      row.getCell(12).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } };
      row.getCell(13).value = "nxvvvv bypass BROKEN. BUT alternative project SEBPatch (school-cheating) covers v3.8.0, v3.9.0, v3.10.0, v3.10.1. Student path: install matching SEB version + matching patch.";
    }
    if (id === "REG-132") {
      row.getCell(9).value = "";
      row.getCell(13).value = "Downgrade path: Install SEB v3.5.0 (on SourceForge) + v3.5.0.544 patch. OR install SEB v3.9.0 + SEBPatch v1.6.0.1. OR install SEB v3.10.1 + SEBPatch v1.8.1. Multiple viable paths exist.";
    }
    if (id === "REG-133") {
      row.getCell(5).value = "Student uses alternative bypass project (SEBPatch by school-cheating) which covers v3.8.0 to v3.10.1";
      row.getCell(7).value = "1. Student finds that nxvvvv bypass is broken for their SEB version\n2. Searches further and finds SEBPatch project (school-cheating on SourceForge/GitHub)\n3. SEBPatch covers: v3.8.0.742, v3.9.0.787, v3.10.0.826, v3.10.1.864\n4. Student installs matching SEB version from SourceForge (all versions available)\n5. Downloads matching SEBPatch (patch-seb.exe, 8.2 MB)\n6. Runs the patch\n7. Launches SEB -- bypass works";
      row.getCell(9).value = "";
      row.getCell(13).value = "SEBPatch is actively maintained (latest: Jan 2026 for SEB v3.10.1.864). 194+ weekly downloads. Has wiki with instructions. More sophisticated than nxvvvv project.";
    }
  }

  // Add new test cases for the SEBPatch approach and downgrade matrix
  const newCases = [
    ["REG-135", "SEB Bypass Matrix", "Scenario B - SEBPatch Approach", "Negative", "Use SEBPatch (school-cheating project) with matching SEB version to bypass on real PC", "Download matching SEB version + matching SEBPatch from SourceForge", "1. Uninstall current SEB\n2. Download SEB v3.10.1.864 from SourceForge: sourceforge.net/projects/seb/files/seb/SEB_3.10.1/\n3. Install SEB v3.10.1\n4. Download SEBPatch v1.8.1 from sourceforge.net/projects/sebpatch/files/v1.8.1%20(SEB%20v3.10.1.864)/\n5. Run patch-seb.exe\n6. Launch SEB\n7. Test if bypass works\n8. Test if exam portal accepts this SEB version\n9. Test all lockdown features (Alt+Tab, Ctrl+C, Task Manager, etc.)", "If server doesn't enforce specific SEB version: bypass likely works. SEBPatch is actively maintained and tested. The latest version (v1.8.1, Jan 2026) targets the latest SEB (v3.10.1.864).", "", "Critical", "N/A", "To Verify", "SEBPatch is the MORE viable bypass tool -- actively maintained, covers latest SEB versions, has wiki documentation."],
    ["REG-136", "SEB Bypass Matrix", "Scenario B - Version Compatibility Matrix", "Edge Case", "Complete matrix of which SEB versions your server accepts", "Server running, SEB config active", "1. Install SEB v3.5.0 -- try exam. Accepted?\n2. Install SEB v3.6.0 -- try exam. Accepted?\n3. Install SEB v3.9.0 -- try exam. Accepted?\n4. Install SEB v3.10.1 -- try exam. Accepted?\n5. Install SEB v2.4.1 (NO VM detection) -- try exam. Accepted?\n6. For each accepted version: does a bypass patch exist?\n7. Document: which versions work + which have bypass patches", "This determines the ACTUAL attack surface. If server accepts ANY version for which a patch exists, bypass is possible. If server enforces only latest version, attack surface is smaller (but SEBPatch covers latest too).", "", "Critical", "N/A", "To Verify", "KEY: Does your server validate SEB version AT ALL? Check X-SafeExamBrowser-ConfigKeyHash header or user-agent for version info."],
    ["REG-137", "SEB Bypass Matrix", "Scenario B - nxvvvv vs SEBPatch Comparison", "Negative", "Document both bypass projects and their current viability", "Research completed", "nxvvvv/safe-exam-browser-bypass:\n- Last updated: Jan 2024\n- Covers: v3.2.2, v3.5.0, v3.6.0\n- Status: BROKEN on current SEB versions (confirmed via Issue #55, #60, #62)\n- Method: Raw DLL replacement\n\nschool-cheating/SEBPatch:\n- Last updated: Jan 2026 (ACTIVE)\n- Covers: v3.8.0, v3.9.0, v3.10.0, v3.10.1\n- Status: ACTIVE and maintained\n- Method: patch-seb.exe automated patcher\n- 194+ weekly downloads\n- Has wiki with installation guide", "nxvvvv project is dead/broken. SEBPatch is the active threat. Any security testing should use SEBPatch for realistic assessment.", "nxvvvv: BROKEN (tested). SEBPatch: ACTIVE threat (to test).", "Critical", "N/A", "Tested / To Verify", "Report to developers: The active bypass tool is SEBPatch, not the nxvvvv one. Covers LATEST SEB version."],
  ];

  newCases.forEach(d => {
    const row = addRow(ws5, d);
    const sev = String(row.getCell(10).value || "").toLowerCase();
    if (sev.includes("critical")) {
      row.getCell(10).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } };
      row.getCell(10).font = { bold: true, size: 10, name: "Calibri", color: { argb: "FFFFFFFF" } };
    }
    const st = String(row.getCell(12).value || "").toLowerCase();
    if (st.includes("to verify")) {
      row.getCell(12).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF3CD" } };
    } else if (st.includes("tested")) {
      row.getCell(12).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } };
    }
  });

  ws5.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws5.rowCount, column: 13 } };

  // Add edge case note
  const ws6 = wb.getWorksheet("6. Edge Cases & Open Ends");
  addRow(ws6, [
    "NOTE-009",
    "Note",
    "Two separate SEB bypass projects exist -- nxvvvv is dead, SEBPatch is ACTIVE",
    "Note",
    "nxvvvv/safe-exam-browser-bypass: Last release Jan 2024, BROKEN on current SEB (confirmed by us + GitHub Issues #55, #60, #62). school-cheating/SEBPatch: Last release Jan 2026 for SEB v3.10.1.864, ACTIVELY maintained, 194+ weekly downloads, automated patcher (patch-seb.exe), covers v3.8.0 through v3.10.1. SEBPatch is the real threat vector.",
    "The active bypass tool covers the LATEST SEB version. Version-specific DLL patching is no longer the only approach -- automated patchers exist.",
    "Critical",
    "Stealth",
    "Developers must account for SEBPatch, not just the older nxvvvv project"
  ]);

  // Update summary
  const ws7 = wb.getWorksheet("SUMMARY DASHBOARD");
  for (let r = 1; r <= ws7.rowCount; r++) {
    const cell = ws7.getRow(r).getCell(1);
    if (String(cell.value || "").includes("Total Regression")) {
      ws7.getRow(r).getCell(2).value = ws5.rowCount - 1;
    }
    if (String(cell.value || "").includes("Total Edge Cases")) {
      ws7.getRow(r).getCell(2).value = ws6.rowCount - 1;
    }
    if (String(cell.value || "").includes("GRAND TOTAL")) {
      const det = wb.getWorksheet("3. Cheat - Detectable").rowCount - 1;
      const stealth = wb.getWorksheet("4. Cheat - Stealth").rowCount - 1;
      ws7.getRow(r).getCell(2).value = 18 + det + stealth + (ws5.rowCount - 1) + (ws6.rowCount - 1);
    }
  }

  await wb.xlsx.writeFile("EMS_Exam_Security_TestPlan.xlsx");

  console.log("Excel updated with v3.6.0 patch failure + SEBPatch findings!");
  console.log("  Updated: REG-131, REG-132, REG-133 with test results");
  console.log("  Added: REG-135 (SEBPatch approach), REG-136 (version matrix), REG-137 (comparison)");
  console.log("  Added: NOTE-009 (active bypass project)");
  console.log("  Total regression: " + (ws5.rowCount - 1));
}

main().catch(e => console.error(e));
