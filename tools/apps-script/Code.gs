/**
 * Unmute — landing page relay (Google Apps Script)
 * =================================================
 *
 * Why this exists
 * ---------------
 * The landing page is a static site. A browser cannot write to Google Drive on
 * its own without shipping credentials in the HTML, which is never acceptable.
 * This script is the bridge: it runs inside your own Google account, receives
 * the two forms by POST, and writes to Drive with your permissions.
 *
 * What it does
 * ------------
 *   waitlist  ->  appends a row to a Sheet in  "09 Waitlist"
 *                 (silent: no email is sent, by design)
 *   loi       ->  creates a Google Doc in     "10 Letters of Intent"
 *                 and emails the link to INBOX  (the only automatic email)
 *
 * Setup  (about five minutes, once)
 * ---------------------------------
 *   1. Open https://script.google.com  ->  New project
 *   2. Replace the contents of Code.gs with this file, then Save
 *   3. Deploy  ->  New deployment  ->  gear icon  ->  Web app
 *        Description:      Unmute relay
 *        Execute as:       Me
 *        Who has access:   Anyone
 *      -> Deploy, then Authorise. Approve the Drive and Gmail permissions.
 *   4. Copy the "Web app" URL (ends in /exec)
 *   5. Paste it into  landing/assets/js/config.js  ->  relayUrl
 *
 * If you change this file later, redeploy: Deploy -> Manage deployments ->
 * edit -> Version: New version -> Deploy. Editing the code without a new
 * version leaves the old one serving.
 *
 * Check it is alive
 * -----------------
 * Open the /exec URL in a browser. You should see
 *   {"ok":true,"service":"unmute-relay",...}
 * A GET does nothing else: it writes no file and sends no email.
 *
 * Changing the destinations
 * -------------------------
 * Both folder IDs point inside "01 Unmute" in the owner's Drive. Replace them
 * if the folders are ever moved — the IDs travel with the folder.
 */

var INBOX = 'contact@liveunmute.com';

var WAITLIST_FOLDER_ID = '1YQEvfz3DDsB4frSZ7NJCP9zrPNg9wGl1'; // 09 Waitlist
var LOI_FOLDER_ID = '1zGcjM_sX61sGqkkveifYudVZJfDC1s0P';      // 10 Letters of Intent

var WAITLIST_SHEET_NAME = 'Unmute — Waitlist';

/* ---------------------------------------------------------------- routing */

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '{}';
    var body = JSON.parse(raw);
    var kind = String(body.kind || 'waitlist').toLowerCase();

    if (kind === 'loi') return json(handleLoi(body));
    return json(handleWaitlist(body));
  } catch (err) {
    return json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

// A GET is a health check only. It must never write a file or send mail.
function doGet() {
  return json({ ok: true, service: 'unmute-relay', version: 1 });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* --------------------------------------------------------------- waitlist */

var WAITLIST_COLUMNS = [
  'Received',
  'First name',
  'Last name',
  'Email address',
  'Phone number',
  'Which best describes you?',
  'Communication needs',
  'Primarily used with',
  'Most like to use Unmute for',
  'Interest',
];

function handleWaitlist(body) {
  var folder = folderOrThrow(WAITLIST_FOLDER_ID, '09 Waitlist');
  var sheet = findOrCreateSheet(folder);

  sheet.appendRow([
    new Date(),
    clean(body.firstName),
    clean(body.lastName),
    clean(body.email),
    clean(body.phone),
    clean(body.role),
    clean(body.needs),
    clean(body.audience),
    clean(body.purpose),
    clean(body.interest),
  ]);

  // No email here: the brief asks for only the LOI to notify.
  return { ok: true, kind: 'waitlist' };
}

function findOrCreateSheet(folder) {
  var files = folder.getFilesByName(WAITLIST_SHEET_NAME);
  var file = files.hasNext() ? files.next() : null;

  if (!file) {
    // Temporary name, then converted to a real Sheet after the header row.
    file = SpreadsheetApp.create(WAITLIST_SHEET_NAME);
    var id = file.getId();
    DriveApp.getFileById(id).moveTo(folder);

    var created = SpreadsheetApp.openById(id).getSheets()[0];
    created.appendRow(WAITLIST_COLUMNS);
    created.getRange(1, 1, 1, WAITLIST_COLUMNS.length).setFontWeight('bold');
    created.setFrozenRows(1);
    created.getRange(2, 1, 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    return created;
  }

  return SpreadsheetApp.openById(file.getId()).getSheets()[0];
}

/* -------------------------------------------------------------------- LOI */

function handleLoi(body) {
  var folder = folderOrThrow(LOI_FOLDER_ID, '10 Letters of Intent');

  var org = clean(body['Organisation']) || 'Untitled organisation';
  var stamp = Utilities.formatDate(
    new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm'
  );

  var doc = DocumentApp.create('LOI — ' + org + ' — ' + stamp);
  var docId = doc.getId();
  DriveApp.getFileById(docId).moveTo(folder);

  writeLoiDocument(doc, body);

  var url = 'https://docs.google.com/document/d/' + docId + '/edit';

  // The only automatic email in this system.
  MailApp.sendEmail({
    to: INBOX,
    subject: 'Letter of Intent — ' + org,
    body: [
      'A letter of intent was submitted through the Unmute website.',
      '',
      'Organisation: ' + org,
      'Signatory:    ' + (clean(body['Signatory name']) || '—'),
      'Title:        ' + (clean(body['Title']) || '—'),
      'Email:        ' + (clean(body['Email']) || '—'),
      'Phone:        ' + (clean(body['Phone']) || '—'),
      '',
      'Open the letter:',
      url,
      '',
      'Saved in Drive: 10 Letters of Intent',
    ].join('\n'),
  });

  return { ok: true, kind: 'loi', url: url };
}

function writeLoiDocument(doc, body) {
  var docBody = doc.getBody();
  docBody.clear();

  docBody.appendParagraph('LETTER OF INTENT')
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);
  docBody.appendParagraph('Non-binding statement of intent to evaluate and deploy Unmute.')
    .setItalic(true);

  var sections = {
    'Organisation': ['Organisation', 'Registered address'],
    'Intended Scope of Engagement': ['Use case', 'Indicative deployment scale', 'Estimated annual usage'],
    'Authorised Signatory': ['Signatory name', 'Title', 'Email', 'Phone', 'Country', 'Date', 'Signature'],
  };

  Object.keys(sections).forEach(function (heading) {
    docBody.appendParagraph(heading)
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);

    sections[heading].forEach(function (label) {
      var value = clean(body[label]) || '—';
      var p = docBody.appendParagraph('');
      p.appendText(label + ': ').setBold(true);
      p.appendText(value);
    });
  });

  docBody.appendParagraph('');
  docBody.appendParagraph(
    'Submitted through loi.html. This letter is non-binding and creates no ' +
    'obligation on either party.'
  ).setItalic(true);

  doc.saveAndClose();
}

/* ---------------------------------------------------------------- helpers */

function folderOrThrow(id, label) {
  try {
    return DriveApp.getFolderById(id);
  } catch (err) {
    throw new Error(
      'Cannot open folder "' + label + '" (' + id + '). It may have been ' +
      'deleted, or this script is running in a different Google account.'
    );
  }
}

// Anything that arrives from a web form is text until proven otherwise.
function clean(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, 2000);
}
