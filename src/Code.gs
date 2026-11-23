/**
 * Dorfbengel Setlist-Planer – Google Apps Script Web-App
 * Alle Daten liegen ausschließlich in dieser Google-Tabelle (Ralfs Google Drive).
 *
 * Tabellenblätter:
 *   Songs           – alle Songs und Vorschläge (eine Zeile pro Song)
 *   Ablauf          – Reihenfolge: Sets, Vorschlagsliste, Wartebereich
 *   Stimmen         – Daumen hoch / runter je Vorschlag
 *   Fremdsetlisten  – eingelesene Setlisten anderer Bands (nur Admin)
 *   Einstellungen   – Mail-Verteiler (für den Mail-Button)
 *
 * Admin = wer die Web-App mit ?k=<Admin-Schlüssel> öffnet (Schlüssel in den Skript-Eigenschaften).
 *
 * Berechtigungen bewusst minimal (verträglich mit Googles Erweitertem Sicherheitsprogramm):
 * ausschließlich diese eine Tabelle. Kein Zugriff auf Drive, Gmail oder externe Dienste.
 */

const SH = { SONGS: 'Songs', ABLAUF: 'Ablauf', STIMMEN: 'Stimmen', FREMD: 'Fremdsetlisten', EINST: 'Einstellungen' };
const SONG_COLS = ['ID', 'Titel', 'Interpret', 'Lead', 'BPM', 'BPM_Quelle', 'Einschaetzung', 'Notiz', 'MP3', 'MIDI', 'Aktion', 'Medley',
  'Quelle', 'Eingereicht_von', 'Eingereicht_am', 'Kommentar', 'Token', 'Herkunft'];
const KEYMAP = { ID: 'id', Titel: 't', Interpret: 'a', Lead: 'lead', BPM: 'bpm', BPM_Quelle: 'bpmSrc', Einschaetzung: 'st', Notiz: 'note',
  MP3: 'mp3', MIDI: 'midi', Aktion: 'act', Medley: 'medley', Quelle: 'src', Eingereicht_von: 'byName', Eingereicht_am: 'at',
  Kommentar: 'comment', Token: 'token', Herkunft: 'origin' };
const ABLAUF_COLS = ['Bereich', 'Set', 'Pos', 'ID', 'Titel'];
const STIMMEN_COLS = ['ID', 'Token', 'Name', 'Wert', 'Zeit'];
const FREMD_COLS = ['ArchivID', 'Band', 'Anlass', 'Eingelesen_am', 'Pos', 'Titel', 'Interpret', 'Notiz', 'Uebernommen_als'];

// ---------------- Web-App ----------------
/** Schnelltest im Editor: zeigt, ob die Tabelle gelesen werden kann. */
function testLesen() {
  const d = JSON.parse(getData('', ''));
  Logger.log('Songs: ' + Object.keys(d.songs).length + ', Sets: ' + d.layout.sets.length);
}

function doGet(e) {
  const t = HtmlService.createTemplateFromFile('Index');
  t.adminKey = String((e && e.parameter && e.parameter.k) || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 64);
  return t.evaluate()
    .setTitle('Dorfbengel Setlist-Planer')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

// ---------------- Hilfen ----------------
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name, cols) {
  let sh = ss_().getSheetByName(name);
  if (!sh) {
    sh = ss_().insertSheet(name);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}
function rows_(name, cols) {
  const sh = sheet_(name, cols);
  const n = sh.getLastRow();
  if (n < 2) return [];
  const vals = sh.getRange(2, 1, n - 1, cols.length).getValues();
  return vals.map(r => { const o = {}; cols.forEach((c, i) => o[c] = r[i]); return o; });
}
function writeAll_(name, cols, objs) {
  const sh = sheet_(name, cols);
  const n = sh.getLastRow();
  if (n > 1) sh.getRange(2, 1, n - 1, cols.length).clearContent();
  if (!objs.length) return;
  const rg = sh.getRange(2, 1, objs.length, cols.length);
  // Alles als Text speichern, damit Google Tabellen z. B. „1/2“ oder „2025“ nicht umdeutet – Datumsspalten ausgenommen
  rg.setNumberFormat('@');
  cols.forEach((c, i) => { if (/_am$|^Zeit$/.test(c)) sh.getRange(2, i + 1, objs.length, 1).setNumberFormat('dd.MM.yyyy HH:mm'); });
  rg.setValues(objs.map(o => cols.map(c => o[c] === undefined || o[c] === null ? '' : o[c])));
}
function isAdmin_(key) {
  const k = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  return !!k && key === k;
}
function needAdmin_(key) { if (!isAdmin_(key)) throw new Error('Nur für den Admin erlaubt.'); }
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function setting_(name) {
  const r = rows_(SH.EINST, ['Einstellung', 'Wert']).find(x => x.Einstellung === name);
  return r ? String(r.Wert || '').trim() : '';
}
function songFromRow_(r) {
  const s = {};
  SONG_COLS.forEach(c => {
    let v = r[c];
    if (v === '' || v === null || v === undefined) return;
    if (c === 'MP3' || c === 'MIDI') { if (v === true || String(v).toLowerCase() === 'ja' || String(v).toLowerCase() === 'true') s[KEYMAP[c]] = true; return; }
    if (c === 'Medley') { s.medley = String(v).split('\n').map(x => x.trim()).filter(String); return; }
    if (c === 'Eingereicht_am') { s.at = v instanceof Date ? v.getTime() : Number(v) || Date.parse(v) || ''; return; }
    s[KEYMAP[c]] = v instanceof Date ? v.toISOString() : String(v);
  });
  return s;
}
function rowFromSong_(id, s) {
  return {
    ID: id, Titel: s.t || '', Interpret: s.a || '', Lead: s.lead || '', BPM: s.bpm || '', BPM_Quelle: s.bpmSrc || '',
    Einschaetzung: s.st || '', Notiz: s.note || '', MP3: s.mp3 ? 'ja' : '', MIDI: s.midi ? 'ja' : '', Aktion: s.act || '',
    Medley: (s.medley || []).join('\n'), Quelle: s.src || '', Eingereicht_von: s.byName || '', Eingereicht_am: s.at ? new Date(Number(s.at)) : '',
    Kommentar: s.comment || '', Token: s.token || '', Herkunft: s.origin || ''
  };
}
function readSongs_() {
  const out = {};
  rows_(SH.SONGS, SONG_COLS).forEach(r => { if (r.ID) out[String(r.ID)] = songFromRow_(r); });
  return out;
}
function writeSongs_(songs) {
  writeAll_(SH.SONGS, SONG_COLS, Object.keys(songs).map(id => rowFromSong_(id, songs[id])));
}
function readLayout_(songs) {
  const rows = rows_(SH.ABLAUF, ABLAUF_COLS);
  const sets = [], setIdx = {}, pool = [], wait = [];
  rows.forEach(r => {
    const id = String(r.ID || ''); if (!id) return;
    if (r.Bereich === 'Set') {
      const nm = String(r.Set || 'Set');
      if (!(nm in setIdx)) { setIdx[nm] = sets.length; sets.push({ name: nm, ids: [] }); }
      sets[setIdx[nm]].ids.push(id);
    } else if (r.Bereich === 'Warten') wait.push(id);
    else pool.push(id);
  });
  // leere Sets merken
  const leer = setting_('Leere Sets');
  if (leer) leer.split('|').forEach(x => { const nm = x.trim(); if (nm && !(nm in setIdx)) { setIdx[nm] = sets.length; sets.push({ name: nm, ids: [] }); } });
  if (!sets.length) sets.push({ name: 'Set 1', ids: [] });
  return { sets, pool, wait };
}
function writeLayout_(layout, songs) {
  const out = [];
  const title = id => id.indexOf('prosit-') === 0 ? 'EIN PROSIT' : ((songs[id] || {}).t || '');
  layout.sets.forEach(st => st.ids.forEach((id, i) => out.push({ Bereich: 'Set', Set: st.name, Pos: i + 1, ID: id, Titel: title(id) })));
  (layout.pool || []).forEach((id, i) => out.push({ Bereich: 'Vorschläge', Set: '', Pos: i + 1, ID: id, Titel: title(id) }));
  (layout.wait || []).forEach((id, i) => out.push({ Bereich: 'Warten', Set: '', Pos: i + 1, ID: id, Titel: title(id) }));
  writeAll_(SH.ABLAUF, ABLAUF_COLS, out);
  const empty = layout.sets.filter(s => !s.ids.length).map(s => s.name).join('|');
  setSetting_('Leere Sets', empty);
}
function setSetting_(name, value) {
  const sh = sheet_(SH.EINST, ['Einstellung', 'Wert']);
  const rows = rows_(SH.EINST, ['Einstellung', 'Wert']);
  const i = rows.findIndex(r => r.Einstellung === name);
  if (i > -1) sh.getRange(i + 2, 2).setValue(value);
  else sh.appendRow([name, value]);
}
function newId_(p) { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function clean_(s, max) { return String(s || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max || 200); }

// ---------------- Lesen ----------------
function getData(key, token) {
  const admin = isAdmin_(key);
  const songs = readSongs_();
  const layout = readLayout_(songs);
  const votes = {}, mine = {};
  rows_(SH.STIMMEN, STIMMEN_COLS).forEach(r => {
    const id = String(r.ID), v = Number(r.Wert);
    if (!votes[id]) votes[id] = { u: 0, d: 0, up: [], down: [] };
    if (v === 1) { votes[id].u++; votes[id].up.push(String(r.Name || '')); }
    if (v === -1) { votes[id].d++; votes[id].down.push(String(r.Name || '')); }
    if (token && String(r.Token) === token) mine[id] = v;
  });
  // Felder, die nur der Admin sieht, entfernen
  Object.keys(songs).forEach(id => {
    const s = songs[id];
    if (token && s.token === token) s.mine = true;
    delete s.token;
    if (!admin) delete s.origin;
  });
  const res = { admin, songs, layout, votes, myVotes: mine, now: Date.now() };
  if (admin) { res.archive = readArchive_(); res.mailTo = setting_('Mail-Verteiler Band'); }
  // Als Text übertragen – google.script.run verträgt keine Datumswerte o. Ä. in Objekten
  return JSON.stringify(res);
}

// ---------------- Admin: Setlist ----------------
function saveLayout(key, layout) {
  needAdmin_(key);
  return withLock_(() => { writeLayout_(layout, readSongs_()); return true; });
}
function saveSong(key, id, song) {
  needAdmin_(key);
  return withLock_(() => {
    const songs = readSongs_();
    const old = songs[id] || {};
    const s = Object.assign({}, old, song);
    Object.keys(s).forEach(k => { if (s[k] === '' || s[k] === null || s[k] === false) delete s[k]; });
    if (old.token) s.token = old.token;
    if (!s.src) s.src = 'vorschlag';
    songs[id] = s;
    writeSongs_(songs);
    if (!old.t) { // neuer Song: oben in die Vorschläge
      const layout = readLayout_(songs);
      if (layout.pool.indexOf(id) < 0) { layout.pool.unshift(id); writeLayout_(layout, songs); }
    }
    return true;
  });
}
function deleteSong(key, id) {
  needAdmin_(key);
  return withLock_(() => {
    const songs = readSongs_(); delete songs[id]; writeSongs_(songs);
    const l = readLayout_(songs);
    l.pool = l.pool.filter(x => x !== id); l.wait = l.wait.filter(x => x !== id); l.sets.forEach(s => s.ids = s.ids.filter(x => x !== id));
    writeLayout_(l, songs);
    return true;
  });
}

// ---------------- Bandmitglieder: Vorschläge & Stimmen ----------------
function submitSuggestion(token, name, data) {
  token = clean_(token, 64); name = clean_(name, 40);
  if (!token || !name) throw new Error('Bitte zuerst deinen Namen eintragen.');
  const t = clean_(data.t), a = clean_(data.a), c = clean_(data.comment, 1000);
  if (!t || !a || !c) throw new Error('Titel, Interpret und Kommentar sind Pflicht.');
  const bpm = clean_(data.bpm, 20).replace(/[^0-9]/g, '');
  const bpmSrc = bpm && data.bpmSrc === 'Deezer' ? 'Deezer' : '';
  return withLock_(() => {
    const songs = readSongs_();
    const id = newId_('e');
    songs[id] = { t, a, lead: clean_(data.lead, 60), comment: c, bpm, bpmSrc, src: 'einreichung', byName: name, at: Date.now(), token };
    writeSongs_(songs);
    return { id, bpm, bpmSrc };
  });
}
function editOwnSuggestion(token, id, data) {
  return withLock_(() => {
    const songs = readSongs_(); const s = songs[id];
    if (!s || !token || s.token !== token) throw new Error('Nur eigene Vorschläge können geändert werden.');
    if (inSetlist_(id, songs)) throw new Error('Der Song ist schon in der Setlist – Änderungen bitte über Ralf.');
    s.t = clean_(data.t) || s.t; s.a = clean_(data.a) || s.a; s.lead = clean_(data.lead, 60); s.comment = clean_(data.comment, 1000) || s.comment;
    const b = clean_(data.bpm, 20).replace(/[^0-9]/g, '');
    if (b !== String(s.bpm || '')) { s.bpm = b; s.bpmSrc = ''; }
    writeSongs_(songs); return true;
  });
}
function deleteOwnSuggestion(token, id) {
  return withLock_(() => {
    const songs = readSongs_(); const s = songs[id];
    if (!s || !token || s.token !== token) throw new Error('Nur eigene Vorschläge können gelöscht werden.');
    if (inSetlist_(id, songs)) throw new Error('Der Song ist schon in der Setlist.');
    delete songs[id]; writeSongs_(songs); return true;
  });
}
function inSetlist_(id, songs) {
  const l = readLayout_(songs);
  return l.sets.some(s => s.ids.indexOf(id) > -1) || l.wait.indexOf(id) > -1;
}
function vote(token, name, id, value) {
  token = clean_(token, 64); name = clean_(name, 40);
  if (!token || !name) throw new Error('Bitte zuerst deinen Namen eintragen.');
  value = Number(value);
  return withLock_(() => {
    const sh = sheet_(SH.STIMMEN, STIMMEN_COLS);
    const rows = rows_(SH.STIMMEN, STIMMEN_COLS);
    const i = rows.findIndex(r => String(r.ID) === id && String(r.Token) === token);
    if (i > -1) {
      if (value === 0 || Number(rows[i].Wert) === value) sh.deleteRow(i + 2);
      else sh.getRange(i + 2, 3, 1, 3).setValues([[name, value, new Date()]]);
    } else if (value === 1 || value === -1) sh.appendRow([id, token, name, value, new Date()]);
    return true;
  });
}

// ---------------- BPM ----------------
// Die BPM-Suche läuft im Browser des Admins (Googles Sicherheitsprogramm erlaubt dem Skript keine externen Abrufe).
function saveBpms(key, map, src) {
  needAdmin_(key);
  return withLock_(() => {
    const songs = readSongs_(); let n = 0;
    Object.keys(map || {}).forEach(id => { if (songs[id] && map[id]) { songs[id].bpm = String(map[id]); songs[id].bpmSrc = clean_(src, 30) || 'automatisch'; n++; } });
    if (n) writeSongs_(songs);
    return n;
  });
}

// ---------------- Admin: Fremdsetlisten ----------------
function readArchive_() {
  const out = {};
  rows_(SH.FREMD, FREMD_COLS).forEach(r => {
    const id = String(r.ArchivID || ''); if (!id) return;
    if (!out[id]) out[id] = { id, band: String(r.Band || ''), anlass: String(r.Anlass || ''), at: r.Eingelesen_am instanceof Date ? r.Eingelesen_am.getTime() : 0, rows: [] };
    out[id].rows.push({ pos: Number(r.Pos) || out[id].rows.length + 1, t: String(r.Titel || ''), a: String(r.Interpret || ''), note: String(r.Notiz || ''), taken: String(r.Uebernommen_als || '') });
  });
  return Object.keys(out).map(k => out[k]).sort((x, y) => y.at - x.at);
}
function saveArchive(key, band, anlass, rows) {
  needAdmin_(key);
  band = clean_(band, 80); if (!band) throw new Error('Bandname fehlt.');
  return withLock_(() => {
    const sh = sheet_(SH.FREMD, FREMD_COLS);
    const id = newId_('f'); const now = new Date();
    const out = rows.filter(r => clean_(r.t)).map((r, i) => [id, band, clean_(anlass, 120), now, i + 1, clean_(r.t), clean_(r.a), clean_(r.note, 200), '']);
    if (out.length) sh.getRange(sh.getLastRow() + 1, 1, out.length, FREMD_COLS.length).setValues(out);
    return id;
  });
}
function deleteArchive(key, archivId) {
  needAdmin_(key);
  return withLock_(() => {
    const rows = rows_(SH.FREMD, FREMD_COLS).filter(r => String(r.ArchivID) !== archivId);
    writeAll_(SH.FREMD, FREMD_COLS, rows); return true;
  });
}
/** Ausgewählte Titel einer Fremdsetliste in die Vorschlagsliste übernehmen. */
function importFromArchive(key, archivId, positions) {
  needAdmin_(key);
  const arch = readArchive_().find(x => x.id === archivId);
  if (!arch) throw new Error('Archiv nicht gefunden.');
  const pick = arch.rows.filter(r => positions.indexOf(r.pos) > -1 && !r.taken);
  return withLock_(() => {
    const songs = readSongs_(); const layout = readLayout_(songs);
    const exists = {}; Object.keys(songs).forEach(id => exists[(songs[id].t + '|' + (songs[id].a || '')).toLowerCase()] = id);
    const taken = {}; let added = 0, dup = 0;
    pick.forEach((r, i) => {
      const k = (r.t + '|' + (r.a || '')).toLowerCase();
      if (exists[k]) { taken[r.pos] = exists[k]; dup++; return; }
      const id = newId_('x');
      songs[id] = { t: r.t, a: r.a, src: 'vorschlag', byName: 'Ralf', at: Date.now(),
        comment: r.note || '', origin: arch.band + (arch.anlass ? ' – ' + arch.anlass : '') };
      layout.pool.unshift(id); taken[r.pos] = id; exists[k] = id; added++;
    });
    writeSongs_(songs); writeLayout_(layout, songs);
    // Übernahme im Archiv vermerken
    const all = rows_(SH.FREMD, FREMD_COLS).map(r => { if (String(r.ArchivID) === archivId && taken[Number(r.Pos)]) r.Uebernommen_als = taken[Number(r.Pos)]; return r; });
    writeAll_(SH.FREMD, FREMD_COLS, all);
    return { added, dup };
  });
}

// ---------------- Einrichtung (einmalig im Editor ausführen) ----------------
function einrichten() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_KEY')) props.setProperty('ADMIN_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 20));
  sheet_(SH.SONGS, SONG_COLS); sheet_(SH.ABLAUF, ABLAUF_COLS); sheet_(SH.STIMMEN, STIMMEN_COLS); sheet_(SH.FREMD, FREMD_COLS);
  const e = sheet_(SH.EINST, ['Einstellung', 'Wert']);
  if (!setting_('Mail-Verteiler Band') && e.getLastRow() < 2) {
    e.appendRow(['Mail-Verteiler Band', '']);
    e.appendRow(['Leere Sets', '']);
  }
  if (rows_(SH.SONGS, SONG_COLS).length === 0 && typeof SEED !== 'undefined') {
    writeSongs_(SEED.songs);
    writeLayout_(SEED.layout, SEED.songs);
  }
  const d = ss_().getSheetByName('Tabellenblatt1') || ss_().getSheetByName('Sheet1');
  if (d && d.getLastRow() === 0 && ss_().getSheets().length > 1) ss_().deleteSheet(d);
  Logger.log('Einrichtung fertig. Admin-Schlüssel: ' + props.getProperty('ADMIN_KEY'));
}
/** Nach dem Bereitstellen ausführen: zeigt Band-Link und Admin-Link im Protokoll. */
function linksAnzeigen() {
  const url = ScriptApp.getService().getUrl();
  const k = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  Logger.log('Link für die Band:  ' + url);
  Logger.log('Dein Admin-Link (NICHT weitergeben):  ' + url + '?k=' + k);
}
/** Falls der Admin-Link versehentlich weitergegeben wurde: neuen Schlüssel erzeugen. */
function adminSchluesselErneuern() {
  PropertiesService.getScriptProperties().setProperty('ADMIN_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 20));
  linksAnzeigen();
}
