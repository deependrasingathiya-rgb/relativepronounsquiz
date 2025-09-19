/**
 * Code.gs - Google Apps Script Web App
 * - doPost: accepts JSON POST from index.html, appends as new row
 * - doGet: returns sheet contents as JSON for teacher dashboard
 *
 * Setup:
 *  - Create Google Sheet with a header row (see README).
 *  - In Apps Script, replace SHEET_NAME if you use a different sheet name.
 *  - Deploy > New deployment > Web App. Set "Who has access" according to your preference.
 */

const SHEET_NAME = "Submissions"; // change if your sheet uses another name

function doPost(e){
  try{
    // Parse JSON body
    const payload = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;
    if(!payload) return ContentService.createTextOutput(JSON.stringify({status:"error","message":"invalid payload"})).setMimeType(ContentService.MimeType.JSON);

    // Open sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if(!sheet){
      // create sheet and header if not exists
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = ["Timestamp","Name","Class"];
      // determine max question columns from payload.answers keys sorted
      const answerKeys = payload.answers ? Object.keys(payload.answers).sort() : [];
      headers.push(...answerKeys);
      headers.push("TotalScore","Percent");
      sheet.appendRow(headers);
    }

    // Build row: Timestamp | Name | Class | Q1..Qn | TotalScore | Percent
    const timestamp = payload.timestamp || new Date().toISOString();
    const name = payload.name || "";
    const klass = payload.class || "";
    const answerKeys = payload.answers ? Object.keys(payload.answers).sort() : [];
    const row = [timestamp, name, klass];
    answerKeys.forEach(k=> row.push(String(payload.answers[k] || "")));
    const total = payload.score_total != null ? payload.score_total : "";
    const percent = (payload.score_total != null && payload.score_per_section) ? Math.round((payload.score_total / (10*1 + 5*2 + 5*2)) * 100) : "";
    row.push(total, percent+"%");
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({status:"ok", message:"Saved"})).setMimeType(ContentService.MimeType.JSON);
  } catch(err){
    return ContentService.createTextOutput(JSON.stringify({status:"error", message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e){
  // Return sheet as JSON for teacher dashboard
  try{
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if(!sheet) return ContentService.createTextOutput(JSON.stringify({status:"error", message:"No sheet found"})).setMimeType(ContentService.MimeType.JSON);
    const vals = sheet.getDataRange().getValues();
    const headers = vals[0];
    const rows = [];
    for(let r=1;r<vals.length;r++){
      const obj = {};
      for(let c=0;c<headers.length;c++){
        obj[headers[c]] = vals[r][c];
      }
      rows.push(obj);
    }
    return ContentService.createTextOutput(JSON.stringify({status:"ok", rows: rows})).setMimeType(ContentService.MimeType.JSON);
  } catch(err){
    return ContentService.createTextOutput(JSON.stringify({status:"error", message:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}