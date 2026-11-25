import fs from "fs";
import path from "path";

/**
 * Custom Playwright Reporter that outputs:
 * 1. reports/Test_Report.xls (Styled Native Excel XML Spreadsheet with colors, KPIs & full wrapping)
 * 2. reports/Test_Report.csv (Clean CSV file for rapid data ingestion)
 *
 * Runs automatically alongside Playwright's built-in HTML reporter.
 */
class ExcelReporter {
  constructor(options = {}) {
    this.options = options;
    this.outputDir = options.outputDir || "reports";
    this.results = [];
    this.startTime = 0;
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    this.results = [];
  }

  onTestEnd(test, result) {
    const title = test.title;
    const testIdMatch = title.match(/TC-[A-Z0-9_-]+/);
    const testId = testIdMatch ? testIdMatch[0] : "TC-AUTO";
    const suiteName = test.parent?.title || "Default Suite";

    // Clean relative file path
    const fullPath = test.location?.file || "";
    const relPath = fullPath.includes("tests")
      ? "tests/" + fullPath.split(/tests[\\/]/).pop()
      : path.basename(fullPath);

    // Status mapping
    let status = "PASSED";
    if (result.status === "failed") status = "FAILED";
    else if (result.status === "timedOut") status = "TIMED OUT";
    else if (result.status === "skipped") status = "SKIPPED";
    else if (result.status === "interrupted") status = "INTERRUPTED";

    const durationSec = (result.duration / 1000).toFixed(2);

    // Format error message if failed (strip ANSI color codes)
    let errorDetails = "";
    if (result.errors && result.errors.length > 0) {
      errorDetails = result.errors
        .map((e) => (e.message || String(e)).replace(/\x1b\[[0-9;]*m/g, ""))
        .join("\n")
        .trim();
    }

    this.results.push({
      testId,
      suiteName,
      specFile: relPath,
      title: title.replace(/^TC-[A-Z0-9_-]+:\s*/, ""),
      status,
      duration: durationSec + "s",
      durationNum: parseFloat(durationSec),
      error: errorDetails
    });
  }

  async onEnd(result) {
    const totalDurationSec = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const total = this.results.length;
    const passed = this.results.filter((r) => r.status === "PASSED").length;
    const failed = this.results.filter((r) => r.status === "FAILED" || r.status === "TIMED OUT").length;
    const skipped = this.results.filter((r) => r.status === "SKIPPED").length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) + "%" : "0%";
    const executionDate = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "medium"
    });

    const targetDir = path.resolve(process.cwd(), this.outputDir);
    const archiveDir = path.join(targetDir, "archive");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    // Generate ISO timestamp string for filename (e.g. 2026-11-25_10-30-15)
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    // 1. Generate Styled Excel Spreadsheet (.xls - Microsoft SpreadsheetML format)
    const xmlContent = this.generateSpreadsheetML({
      summary: {
        total,
        passed,
        failed,
        skipped,
        passRate,
        totalDuration: totalDurationSec + "s",
        executionDate
      },
      results: this.results
    });

    // Write latest report and timestamped archive
    const xlsLatestPath = path.join(targetDir, "Test_Report.xls");
    const xlsHistoryPath = path.join(archiveDir, `Test_Report_${timestampStr}.xls`);
    
    try {
      fs.writeFileSync(xlsLatestPath, xmlContent, "utf8");
    } catch (err) {
      if (err.code === "EBUSY" || err.code === "EPERM") {
        console.warn(`\x1b[33m⚠ Notice: Test_Report.xls is currently open in Excel. Saving to Test_Report_${timestampStr}.xls\x1b[0m`);
      } else {
        throw err;
      }
    }
    fs.writeFileSync(xlsHistoryPath, xmlContent, "utf8");

    console.log(`\n\x1b[32m✔ [Excel Reporter] Excel reports successfully generated:\x1b[0m`);
    console.log(`  📊 Latest Excel Report:    \x1b[36m${xlsLatestPath}\x1b[0m`);
    console.log(`  📁 Historical Archive:     \x1b[36m${xlsHistoryPath}\x1b[0m`);
    console.log(`  🌐 Interactive HTML:       \x1b[36mplaywright-report/index.html\x1b[0m\n`);
  }

  escapeXml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  generateSpreadsheetML({ summary, results }) {
    const e = this.escapeXml;

    let rowsXml = "";
    results.forEach((r) => {
      const statusStyle = r.status === "PASSED" ? "CellPass" : r.status === "SKIPPED" ? "CellSkipped" : "CellFail";
      rowsXml += `
   <Row ss:AutoFitHeight="1">
    <Cell ss:StyleID="CellBoldCenter"><Data ss:Type="String">${e(r.testId)}</Data></Cell>
    <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${e(r.suiteName)}</Data></Cell>
    <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${e(r.specFile)}</Data></Cell>
    <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${e(r.title)}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${e(r.status)}</Data></Cell>
    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${e(r.duration)}</Data></Cell>
    <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${e(r.error || "None")}</Data></Cell>
   </Row>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Title">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="16" ss:Color="#0F172A" ss:Bold="1"/>
  </Style>
  <Style ss:ID="SubTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#64748B" ss:Italic="1"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellNormal">
   <Alignment ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="CellBoldCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#2563EB" ss:Bold="1"/>
  </Style>
  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#475569"/>
  </Style>
  <Style ss:ID="CellPass">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#166534" ss:Bold="1"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellFail">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#991B1B" ss:Bold="1"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CellSkipped">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Color="#854D0E" ss:Bold="1"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="MetricLabel">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#334155" ss:Bold="1"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="MetricVal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A" ss:Bold="1"/>
  </Style>
  <Style ss:ID="MetricPassVal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#86EFAC"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#166534" ss:Bold="1"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="MetricFailVal">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCA5A5"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#991B1B" ss:Bold="1"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
 </Styles>

 <!-- Worksheet 1: Summary Dashboard -->
 <Worksheet ss:Name="Executive Summary">
  <Table ss:DefaultColumnWidth="60" ss:DefaultRowHeight="20">
   <Column ss:Index="1" ss:Width="200"/>
   <Column ss:Index="2" ss:Width="160"/>
   <Row ss:Height="28">
    <Cell ss:StyleID="Title"><Data ss:Type="String">Playwright E2E Automation Executive Summary</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:StyleID="SubTitle"><Data ss:Type="String">Automated Test Execution Metrics for M-Demo Application</Data></Cell>
   </Row>
   <Row ss:Index="4">
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Execution Timestamp</Data></Cell>
    <Cell ss:StyleID="MetricVal"><Data ss:Type="String">${e(summary.executionDate)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Total Tests Executed</Data></Cell>
    <Cell ss:StyleID="MetricVal"><Data ss:Type="Number">${summary.total}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Passed Tests</Data></Cell>
    <Cell ss:StyleID="MetricPassVal"><Data ss:Type="Number">${summary.passed}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Failed Tests</Data></Cell>
    <Cell ss:StyleID="${summary.failed > 0 ? "MetricFailVal" : "MetricVal"}"><Data ss:Type="Number">${summary.failed}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Skipped Tests</Data></Cell>
    <Cell ss:StyleID="MetricVal"><Data ss:Type="Number">${summary.skipped}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Pass Rate</Data></Cell>
    <Cell ss:StyleID="${summary.failed === 0 ? "MetricPassVal" : "MetricVal"}"><Data ss:Type="String">${e(summary.passRate)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Total Execution Duration</Data></Cell>
    <Cell ss:StyleID="MetricVal"><Data ss:Type="String">${e(summary.totalDuration)}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- Worksheet 2: Detailed Results -->
 <Worksheet ss:Name="Test Details">
  <Table ss:DefaultColumnWidth="60" ss:DefaultRowHeight="20">
   <Column ss:Index="1" ss:Width="110"/>
   <Column ss:Index="2" ss:Width="180"/>
   <Column ss:Index="3" ss:Width="160"/>
   <Column ss:Index="4" ss:Width="340"/>
   <Column ss:Index="5" ss:Width="90"/>
   <Column ss:Index="6" ss:Width="90"/>
   <Column ss:Index="7" ss:Width="300"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Case ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Suite / Module</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Spec File</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Test Case Description</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Duration</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Failure Details</Data></Cell>
   </Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;
  }
}

export default ExcelReporter;
