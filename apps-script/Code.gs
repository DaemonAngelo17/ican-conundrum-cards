/**
 * ICAN Conundrum Cards Database — Google Apps Script Read & Write Endpoint
 *
 * Setup (Zero Google Cloud Console required):
 * 1. Open your Google Sheet -> Extensions -> Apps Script
 * 2. Replace Code.gs with this script and click Save
 * 3. Click Deploy -> New deployment -> Select type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL into `.env.local` as GOOGLE_APPS_SCRIPT_URL
 */

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function findRowByCardId_(sheet, targetId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  var normalized = String(targetId || "").trim().toUpperCase();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0] || "").trim().toUpperCase() === normalized) {
      return i + 2; // 1-based row number
    }
  }
  return -1;
}

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var conundrumSheet = ss.getSheetByName("Conundrum Database");
  var worksheetSheet = ss.getSheetByName("Worksheet Content Database");

  if (!conundrumSheet || !worksheetSheet) {
    return jsonResponse_({
      error:
        'Expected tabs "Conundrum Database" and "Worksheet Content Database" were not found.',
    });
  }

  return jsonResponse_({
    spreadsheetId: ss.getId(),
    spreadsheetTitle: ss.getName(),
    fetchedAt: new Date().toISOString(),
    conundrumRows: conundrumSheet.getDataRange().getDisplayValues(),
    worksheetRows: worksheetSheet.getDataRange().getDisplayValues(),
  });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action; // 'create' | 'update'
    var cardId = String(body.cardId || "").trim().toUpperCase();
    var originalCardId = String(body.originalCardId || cardId)
      .trim()
      .toUpperCase();
    var conundrumRow = body.conundrumRow;
    var worksheetRow = body.worksheetRow;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var conundrumSheet = ss.getSheetByName("Conundrum Database");
    var worksheetSheet = ss.getSheetByName("Worksheet Content Database");

    if (!conundrumSheet || !worksheetSheet) {
      return jsonResponse_({
        ok: false,
        error: "Required tabs not found in spreadsheet.",
      });
    }

    if (action === "create") {
      if (findRowByCardId_(conundrumSheet, cardId) !== -1) {
        return jsonResponse_({
          ok: false,
          error: 'Card ID "' + cardId + '" already exists.',
        });
      }
      conundrumSheet.appendRow(conundrumRow);
      worksheetSheet.appendRow(worksheetRow);
      return jsonResponse_({ ok: true, action: "create", cardId: cardId });
    }

    if (action === "update") {
      var cRow = findRowByCardId_(conundrumSheet, originalCardId);
      if (cRow === -1) {
        return jsonResponse_({
          ok: false,
          error: 'Card ID "' + originalCardId + '" not found.',
        });
      }
      conundrumSheet
        .getRange(cRow, 1, 1, conundrumRow.length)
        .setValues([conundrumRow]);

      var wRow = findRowByCardId_(worksheetSheet, originalCardId);
      if (wRow !== -1) {
        worksheetSheet
          .getRange(wRow, 1, 1, worksheetRow.length)
          .setValues([worksheetRow]);
      } else {
        worksheetSheet.appendRow(worksheetRow);
      }

      return jsonResponse_({ ok: true, action: "update", cardId: cardId });
    }

    return jsonResponse_({ ok: false, error: "Unsupported action: " + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}
