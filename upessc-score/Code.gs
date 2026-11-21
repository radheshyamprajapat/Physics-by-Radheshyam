
/**
 * UPESSC Assistant Professor Physics Score Portal
 * Bind this Apps Script project to the Google Sheet that will store responses.
 */

const SHEET_NAME = "Student Responses";
const TOTAL_QUESTIONS = 120;
const MAX_MARKS = 360;

// Change this to a long, private password before deploying.
// Keep it private: only use it in the Admin Dashboard URL.
const INITIAL_ADMIN_KEY = "Radhe@807900";

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Open Apps Script from the target Google Sheet (Extensions > Apps Script).");
  }

  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Student Name",
      "Shift",
      "Correct",
      "Wrong",
      "Unattempted",
      "Total Marks",
      "Request ID"
    ]);

    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 8)
      .setFontWeight("bold")
      .setBackground("#102b46")
      .setFontColor("#ffffff");

    sheet.setColumnWidths(1, 8, 145);
    sheet.getRange("A:A").setNumberFormat("dd-mmm-yyyy hh:mm:ss");
    sheet.getRange("G:G").setNumberFormat("0.00");
  }

  const props = PropertiesService.getScriptProperties();

  if (!props.getProperty("ADMIN_KEY") ||
      props.getProperty("ADMIN_KEY") === INITIAL_ADMIN_KEY) {
    props.setProperty("ADMIN_KEY", INITIAL_ADMIN_KEY);
  }

  Logger.log("Setup complete. Spreadsheet: " + ss.getUrl());
}

function doPost(e) {
  let requestId = "";

  try {
    const p = (e && e.parameter) ? e.parameter : {};

    requestId = String(p.requestId || "");

    const name = String(p.studentName || "").trim().slice(0, 60);
    const shift = String(p.shift || "").trim();

    const correct = Number(p.correct);
    const wrong = Number(p.wrong);
    const unattempted = Number(p.unattempted);
    const marks = Number(p.marks);

    if (!["Morning Shift", "Evening Shift", "Not Sure"].includes(shift)) {
      throw new Error("Invalid exam shift.");
    }

    if (
      !Number.isInteger(correct) ||
      !Number.isInteger(wrong) ||
      !Number.isInteger(unattempted)
    ) {
      throw new Error("Question counts must be whole numbers.");
    }

    if (
      correct < 0 ||
      wrong < 0 ||
      unattempted < 0 ||
      correct + wrong + unattempted !== TOTAL_QUESTIONS
    ) {
      throw new Error("Question counts must add up to 120.");
    }

    // Maximum score is 360 (120 questions × 3 marks).
    if (!Number.isFinite(marks) || marks < 0 || marks > MAX_MARKS) {
      throw new Error("Total marks must be between 0 and 360.");
    }

    if (!requestId || requestId.length > 100) {
      throw new Error("Invalid submission reference.");
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME);

      if (!sheet) {
        throw new Error("Response sheet not found. Run setup() first.");
      }

      // Prevent duplicate submissions on browser retry.
      const lastRow = sheet.getLastRow();

      if (lastRow >= 2) {
        const ids = sheet
          .getRange(2, 8, lastRow - 1, 1)
          .getValues()
          .flat();

        if (ids.indexOf(requestId) !== -1) {
          return responseHtml_(requestId, true, "Already received.");
        }
      }

      sheet.appendRow([
        new Date(),
        safeCell_(name),
        shift,
        correct,
        wrong,
        unattempted,
        marks,
        requestId
      ]);

    } finally {
      lock.releaseLock();
    }

    return responseHtml_(requestId, true, "");

  } catch (err) {
    return responseHtml_(requestId, false, String(err.message || err));
  }
}

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};

  if (params.action !== "stats") {
    return ContentService.createTextOutput(
      "UPESSC Physics Score Portal is running."
    );
  }

  const callback = String(params.callback || "");

  if (!/^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput("Invalid callback.");
  }

  const suppliedKey = String(params.key || "");

  const actualKey =
    PropertiesService.getScriptProperties().getProperty("ADMIN_KEY") || "";

  if (!actualKey || suppliedKey !== actualKey) {
    return ContentService.createTextOutput(
      callback + "(" + JSON.stringify({
        ok: false,
        message: "Unauthorized"
      }) + ");"
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  const payload = getDashboardData_();

  return ContentService.createTextOutput(
    callback + "(" + JSON.stringify(payload) + ");"
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getDashboardData_() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet || sheet.getLastRow() < 2) {
    return {
      ok: true,
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      shifts: {},
      buckets: {},
      entries: []
    };
  }

  const values = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, 8)
    .getValues();

  const entries = values
    .filter(r => r[7])
    .map(r => ({
      timestamp: r[0] instanceof Date
        ? r[0].toISOString()
        : String(r[0]),
      name: String(r[1] || ""),
      shift: String(r[2] || ""),
      correct: Number(r[3]) || 0,
      wrong: Number(r[4]) || 0,
      unattempted: Number(r[5]) || 0,
      marks: Number(r[6]) || 0
    }))
    .reverse();

  const scores = entries.map(x => x.marks);
  const total = scores.length;
  const sum = scores.reduce((a, b) => a + b, 0);

  const shifts = {};

  // Updated score distribution for maximum 360 marks.
  const buckets = {
    "Below 120": 0,
    "120–179.99": 0,
    "180–239.99": 0,
    "240–299.99": 0,
    "300–360": 0
  };

  entries.forEach(x => {
    shifts[x.shift] = (shifts[x.shift] || 0) + 1;

    if (x.marks < 120) {
      buckets["Below 120"]++;
    } else if (x.marks < 180) {
      buckets["120–179.99"]++;
    } else if (x.marks < 240) {
      buckets["180–239.99"]++;
    } else if (x.marks < 300) {
      buckets["240–299.99"]++;
    } else {
      buckets["300–360"]++;
    }
  });

  return {
    ok: true,
    total: total,
    average: total
      ? Math.round((sum / total) * 100) / 100
      : 0,
    highest: total ? Math.max.apply(null, scores) : 0,
    lowest: total ? Math.min.apply(null, scores) : 0,
    shifts: shifts,
    buckets: buckets,
    entries: entries.slice(0, 500)
  };
}

function responseHtml_(requestId, ok, message) {
  const safeId = JSON.stringify(String(requestId || ""));
  const safeMessage = JSON.stringify(String(message || ""));

  const html =
    '<!doctype html><html><body><script>' +
    'window.parent.postMessage({type:"UPESSC_SCORE_SUBMIT",requestId:' +
    safeId +
    ',ok:' + (ok ? 'true' : 'false') +
    ',message:' + safeMessage +
    '},"*");' +
    '</script></body></html>';

  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function safeCell_(value) {
  const s = String(value || "");
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}  
function resetAdminKey() {
  PropertiesService.getScriptProperties()
    .setProperty("ADMIN_KEY", INITIAL_ADMIN_KEY);

  Logger.log("Admin key updated successfully.");
}
