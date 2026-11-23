/* Dorfbengel Setlist-Planer – Oberfläche. Wird von der Google-Web-App geladen. Enthält keine Daten. */
(function(){
var css="\n:root{\n  /* Layout: drei Spalten – Vorschläge | Setlist (Sets) | Wartebereich; Karten werden zwischen allen Bereichen gezogen */\n  --bg:#f3f1ee; --panel:#ffffff; --ink:#1d2430; --muted:#6a7080; --line:#e2ded8;\n  --accent:#8b1e3f; --accent-soft:#f6e9ee;\n  --ok:#1e6b34; --ok-bg:#dcefe0; --warn:#8a6100; --warn-bg:#fbf0cf; --bad:#9b1c1c; --bad-bg:#f7dcdc;\n  --prosit:#a8661a; --prosit-bg:#fbf1e3; --wait:#2f5d8a; --wait-bg:#e4edf6;\n  --f-display:\"Barlow Condensed\",\"Arial Narrow\",sans-serif;\n  --f-body:\"Source Sans 3\",\"Segoe UI\",system-ui,sans-serif;\n  color-scheme:light;\n}\n@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){\n  --bg:#15181e; --panel:#1e232b; --ink:#e9e6e1; --muted:#9aa0ab; --line:#2f3540;\n  --accent:#e0698e; --accent-soft:#3a2129;\n  --ok:#8fd6a0; --ok-bg:#1f3a27; --warn:#f0c860; --warn-bg:#3d3216; --bad:#f09a9a; --bad-bg:#432121;\n  --prosit:#f0b46a; --prosit-bg:#3a2a16; --wait:#8fb8e3; --wait-bg:#1d2e40; color-scheme:dark;}}\n:root[data-theme=\"dark\"]{\n  --bg:#15181e; --panel:#1e232b; --ink:#e9e6e1; --muted:#9aa0ab; --line:#2f3540;\n  --accent:#e0698e; --accent-soft:#3a2129;\n  --ok:#8fd6a0; --ok-bg:#1f3a27; --warn:#f0c860; --warn-bg:#3d3216; --bad:#f09a9a; --bad-bg:#432121;\n  --prosit:#f0b46a; --prosit-bg:#3a2a16; --wait:#8fb8e3; --wait-bg:#1d2e40; color-scheme:dark;}\n*{box-sizing:border-box}\nhtml,body{height:100%;margin:0}\nbody{background:var(--bg);color:var(--ink);font:15px/1.4 var(--f-body);display:flex;flex-direction:column}\nheader{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;padding:14px 20px;border-bottom:1px solid var(--line);background:var(--panel)}\nh1{font:700 26px/1 var(--f-display);letter-spacing:.02em;margin:0;color:var(--accent);text-transform:uppercase}\n.stats{display:flex;gap:14px;flex-wrap:wrap;font-variant-numeric:tabular-nums;color:var(--muted);font-size:14px}\n.stats b{color:var(--ink)}\n.spacer{flex:1}\n.status{font-size:13px;color:var(--muted)}\n.status.err{color:var(--bad)}\nbutton{font:600 14px var(--f-body);border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:6px;padding:7px 12px;cursor:pointer}\nbutton:hover{border-color:var(--accent)}\nbutton.primary{background:var(--accent);border-color:var(--accent);color:#fff}\nbutton:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\nmain{flex:1;min-height:0;display:grid;grid-template-columns:minmax(260px,1fr) minmax(360px,1.6fr) minmax(240px,.9fr);gap:14px;padding:14px 20px}\n.col{background:var(--panel);border:1px solid var(--line);border-radius:10px;display:flex;flex-direction:column;min-height:0}\n.col>h2{font:700 19px/1 var(--f-display);text-transform:uppercase;letter-spacing:.03em;margin:0;padding:12px 14px 8px;display:flex;align-items:baseline;gap:8px}\n.col>h2 small{font:600 13px var(--f-body);color:var(--muted);text-transform:none;letter-spacing:0}\n.hint{font-size:13px;color:var(--muted);padding:0 14px 8px}\n.tools{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 10px}\n.tools input{flex:1;min-width:120px;font:14px var(--f-body);padding:6px 9px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--ink)}\n.chip{font:600 12px var(--f-body);padding:4px 9px;border-radius:999px}\n.chip[aria-pressed=\"true\"]{background:var(--accent);color:#fff;border-color:var(--accent)}\n.scroll{overflow:auto;flex:1;min-height:0;padding:0 10px 14px}\n.list{display:flex;flex-direction:column;gap:5px;min-height:44px;padding:6px;border-radius:8px;border:1.5px dashed transparent}\n.list.empty{border-color:var(--line)}\n.list.empty::after{content:\"Hierher ziehen\";color:var(--muted);font-size:13px;text-align:center;padding:8px}\n.setbox{border:1px solid var(--line);border-radius:8px;margin-bottom:12px;background:var(--bg)}\n.sethead{display:flex;align-items:center;gap:8px;padding:8px 10px 2px}\n.sethead input{font:700 18px var(--f-display);text-transform:uppercase;border:none;background:transparent;color:var(--ink);width:140px;padding:2px}\n.sethead .meta{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}\n.sethead .spacer{flex:1}\n.sethead button{padding:4px 8px;font-size:12px}\n.card{display:grid;grid-template-columns:22px 1fr auto;gap:4px 8px;align-items:center;background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--line);border-radius:6px;padding:6px 8px;cursor:grab;user-select:none;touch-action:none}\n.card:active{cursor:grabbing}\n.card .no{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums;text-align:right}\n.card .tt{font-weight:600;min-width:0;overflow-wrap:anywhere}\n.card .sub{grid-column:2/4;font-size:12.5px;color:var(--muted);display:flex;gap:8px;flex-wrap:wrap}\n.card .right{display:flex;gap:5px;align-items:center}\n.bpm{font:600 12px var(--f-body);font-variant-numeric:tabular-nums;color:var(--ink);background:var(--bg);border-radius:4px;padding:1px 5px}\n.pill{font:700 11px var(--f-body);border-radius:999px;padding:1px 7px;text-transform:uppercase;letter-spacing:.03em}\n.pill.passt{background:var(--ok-bg);color:var(--ok)} .card.passt{border-left-color:var(--ok)}\n.pill.prüfen{background:var(--warn-bg);color:var(--warn)} .card.prüfen{border-left-color:var(--warn)}\n.pill.fraglich{background:var(--bad-bg);color:var(--bad)} .card.fraglich{border-left-color:var(--bad)}\n.card.setlist{border-left-color:var(--accent)}\n.card.prosit{background:var(--prosit-bg);border-left-color:var(--prosit);padding:4px 8px}\n.card.prosit .tt{color:var(--prosit);font-family:var(--f-display);font-size:16px;letter-spacing:.04em;text-transform:uppercase}\n.lead{font-weight:700;color:var(--accent)}\n.medley{grid-column:2/4;font-size:12.5px;color:var(--muted);margin:2px 0 0;padding-left:14px}\n.medley li{margin:0}\ndetails.mdl summary{cursor:pointer;font-size:12.5px;color:var(--muted);grid-column:2/4;list-style:none}\ndetails.mdl summary::before{content:\"▸ \"} details.mdl[open] summary::before{content:\"▾ \"}\n.tag{font-size:11.5px;font-weight:700;color:var(--muted);border:1px solid var(--line);border-radius:4px;padding:0 4px}\n.col.wait{background:var(--wait-bg);border-color:transparent}\n.col.wait>h2{color:var(--wait)}\n.sortable-ghost{opacity:.35}\n.sortable-chosen{box-shadow:0 4px 14px rgba(0,0,0,.18)}\ndialog{border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--ink);padding:18px;width:min(440px,92vw)}\ndialog::backdrop{background:rgba(0,0,0,.35)}\ndialog h3{font:700 22px var(--f-display);margin:0 0 10px;text-transform:uppercase}\ndialog label{display:block;font-size:13px;color:var(--muted);margin:10px 0 3px}\ndialog input,dialog textarea,dialog select{width:100%;font:15px var(--f-body);padding:7px 9px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--ink)}\ndialog .row{display:flex;gap:8px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}\ndialog .row .spacer{flex:1}\n.ro .card{cursor:default}\nbutton.mini{font:600 11.5px var(--f-body);padding:2px 6px;border-radius:4px;color:var(--prosit);border-color:var(--line);background:transparent;white-space:nowrap}\nbutton.mini:hover{background:var(--prosit-bg);border-color:var(--prosit)}\n.card.prosit button.mini{background:var(--panel)}\n.fmt{display:inline-flex;gap:4px;margin-left:auto}\n.tog{font:700 10.5px var(--f-body);letter-spacing:.04em;padding:1px 6px;border-radius:4px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer}\n.tog.mp3.on{background:var(--wait);border-color:var(--wait);color:#fff}\n.tog.midi.on{background:var(--accent);border-color:var(--accent);color:#fff}\nspan.tog{cursor:default}\n.card .sub{align-items:center}\n.fmtset{border:1px solid var(--line);border-radius:6px;margin:12px 0 0;padding:6px 10px;display:flex;gap:16px;flex-wrap:wrap}\n.fmtset legend{font-size:13px;color:var(--muted);padding:0 4px}\ndialog label.chk{display:flex;align-items:center;gap:6px;margin:4px 0;color:var(--ink);font-size:14px}\ndialog label.chk input{width:auto}\n.card.flash{outline:3px solid var(--prosit);outline-offset:1px}\n.banner{padding:8px 20px;background:var(--warn-bg);color:var(--warn);font-size:14px;display:none}\n.banner.show{display:block}\ndialog.wide{width:min(1180px,96vw)}\n.dlgnote{font-size:13px;color:var(--muted);margin:0 0 10px}\n.previewWrap{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:10px;display:flex;justify-content:center}\n#sheet{width:100%;max-width:1120px;height:auto;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.15)}\na.btnlink{font:600 14px var(--f-body);border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:6px;padding:7px 12px;text-decoration:none}\na.btnlink:hover{border-color:var(--accent)}\n.card.sugg{border-left-color:var(--wait)}\n.card.neu{background:var(--accent-soft);border-color:var(--accent);border-left-color:var(--accent);box-shadow:0 0 0 1px var(--accent) inset}\n.badge-neu{font:700 10.5px var(--f-body);letter-spacing:.05em;background:var(--accent);color:#fff;border-radius:4px;padding:1px 6px}\n.card .foot{grid-column:2/4;display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12.5px;color:var(--muted)}\n.card .why{grid-column:2/4;font-size:13px;color:var(--ink);background:var(--bg);border-radius:5px;padding:4px 7px;white-space:pre-wrap;overflow-wrap:anywhere}\n.votes{display:inline-flex;gap:4px;margin-left:auto}\n.vote{font:600 12px var(--f-body);padding:2px 8px;border-radius:999px;background:transparent;font-variant-numeric:tabular-nums}\n.vote[aria-pressed=\"true\"].up{background:var(--ok-bg);border-color:var(--ok);color:var(--ok)}\n.vote[aria-pressed=\"true\"].down{background:var(--bad-bg);border-color:var(--bad);color:var(--bad)}\n.vote:disabled{opacity:.5;cursor:default}\n.bpm.ki::after{content:\" ≈\";color:var(--muted)}\n.newcount{font:700 13px var(--f-body);background:var(--accent);color:#fff;border-radius:999px;padding:3px 10px;display:none}\n.newcount.show{display:inline-block}\n.rolehint{font-size:13px;color:var(--muted)}\n.sethead input[readonly]{pointer-events:none}\n.req{color:var(--accent)}\n@media (max-width:980px){main{grid-template-columns:1fr;overflow:auto}.col{min-height:320px}}\n@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}\n.inl{display:flex;gap:6px}.inl input{flex:1}\n.muted{color:var(--muted);font:600 13px var(--f-body);text-transform:none}\n.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}\n#mailRow input{flex:1;min-width:200px;width:auto}\n.tabs{display:flex;gap:6px;margin:0 0 10px;border-bottom:1px solid var(--line)}\n.tabs button{border:none;border-bottom:3px solid transparent;border-radius:0;background:transparent}\n.tabs button[aria-selected=\"true\"]{border-bottom-color:var(--accent);color:var(--accent)}\n.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n.tblwrap{max-height:42vh;overflow:auto;border:1px solid var(--line);border-radius:6px}\n.imtbl{width:100%;border-collapse:collapse;font-size:14px}\n.imtbl th{position:sticky;top:0;background:var(--panel);text-align:left;padding:6px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)}\n.imtbl td{padding:3px 6px;border-bottom:1px solid var(--line)}\n.imtbl td input[type=text]{width:100%;padding:4px 6px}\n.imtbl td.c{width:30px;text-align:center}\n.imtbl tr.taken td{color:var(--muted)}\ndialog .row.left{justify-content:flex-start;align-items:center}\n.arch{border:1px solid var(--line);border-radius:8px;margin-bottom:10px}\n.arch summary{padding:8px 10px;cursor:pointer;font-weight:700;display:flex;gap:10px;align-items:baseline}\n.arch summary small{font-weight:400;color:var(--muted)}\n.arch .body{padding:0 10px 10px}\n.origin{font-size:12px;color:var(--wait);font-weight:600}\n.credit{font-size:11px;color:var(--muted);text-align:center;margin:0 0 6px}\n.tagdone{font-size:11px;color:var(--ok);font-weight:700}\n", html="\n<header>\n  <h1>Dorfbengel · Setlist 2027</h1>\n  <div class=\"stats\" id=\"stats\"><span>Lade Daten …</span></div>\n  <span class=\"spacer\"></span>\n  <span class=\"status\" id=\"status\" aria-live=\"polite\"></span>\n  <span class=\"newcount\" id=\"newCount\" role=\"status\"></span>\n  <button id=\"suggBtn\" type=\"button\" hidden>+ Vorschlag einreichen</button>\n  <button id=\"addSong\" type=\"button\" hidden>+ Song</button>\n  <button id=\"addSet\" type=\"button\" hidden>+ Set</button>\n  <button id=\"bpmBtn\" type=\"button\" hidden title=\"Fehlende BPM bei Vorschlägen automatisch suchen\"></button>\n  <button id=\"archBtn\" type=\"button\" hidden>Fremdsetlisten</button>\n  <button id=\"meBtn\" type=\"button\" hidden title=\"Namen ändern\"></button>\n  <button id=\"exportBtn\" class=\"primary\" type=\"button\">Setlist erstellen</button>\n</header>\n<div class=\"banner\" id=\"banner\"></div>\n<main id=\"main\">\n  <section class=\"col\" aria-labelledby=\"hPool\">\n    <h2 id=\"hPool\">Vorschläge <small id=\"poolCount\"></small></h2>\n    <div class=\"hint\" id=\"poolHint\">Karten in ein Set ziehen. Medleys bewegen sich immer als Ganzes. Mit 👍 / 👎 abstimmen.</div>\n    <div class=\"tools\">\n      <input id=\"q\" type=\"search\" placeholder=\"Titel oder Interpret suchen\" aria-label=\"Vorschläge durchsuchen\">\n    </div>\n    <div class=\"tools\" role=\"group\" aria-label=\"Nach Einschätzung filtern\">\n      <button class=\"chip\" data-f=\"\" aria-pressed=\"true\" type=\"button\">Alle</button>\n      <button class=\"chip\" data-f=\"passt\" aria-pressed=\"false\" type=\"button\">passt</button>\n      <button class=\"chip\" data-f=\"prüfen\" aria-pressed=\"false\" type=\"button\">prüfen</button>\n      <button class=\"chip\" data-f=\"fraglich\" aria-pressed=\"false\" type=\"button\">fraglich</button>\n      <button class=\"chip\" data-f=\"medley\" aria-pressed=\"false\" type=\"button\">Medleys</button>\n      <button class=\"chip\" data-f=\"neu\" aria-pressed=\"false\" type=\"button\">Neu (14 Tage)</button>\n    </div>\n    <div class=\"scroll\"><div class=\"list\" id=\"pool\" data-zone=\"pool\"></div></div>\n  </section>\n  <section class=\"col\" aria-labelledby=\"hSets\">\n    <h2 id=\"hSets\">Setlist <small id=\"setCount\"></small></h2>\n    <div class=\"hint\" id=\"setHint\">Reihenfolge per Ziehen ändern. „+ Prosit“ an einem Titel setzt einen Prosit direkt dahinter, beliebig oft. Karte antippen, um Lead-Gesang oder Notiz zu bearbeiten.</div>\n    <div class=\"scroll\" id=\"sets\"></div>\n  </section>\n  <section class=\"col wait\" aria-labelledby=\"hWait\">\n    <h2 id=\"hWait\">Wartebereich <small id=\"waitCount\"></small></h2>\n    <div class=\"hint\">Geprobte Songs, die gerade nicht im Programm sind. Bleiben abrufbar.</div>\n    <div class=\"scroll\"><div class=\"list\" id=\"wait\" data-zone=\"wait\"></div></div>\n  </section>\n</main>\n\n<dialog id=\"edit\">\n  <form method=\"dialog\" id=\"editForm\">\n    <h3 id=\"editTitle\">Song bearbeiten</h3>\n    <label for=\"fT\">Titel</label><input id=\"fT\" required>\n    <label for=\"fA\">Interpret</label><input id=\"fA\">\n    <label for=\"fL\">Lead-Gesang / Rolle</label><input id=\"fL\" placeholder=\"z. B. Lead w, Lead m 1, ALLE\">\n    <label for=\"fB\">BPM</label><div class=\"inl\"><input id=\"fB\"><button type=\"button\" id=\"fBpm\">BPM ermitteln</button></div>\n    <label for=\"fS\">Einschätzung</label>\n    <select id=\"fS\"><option value=\"\">–</option><option>passt</option><option>prüfen</option><option>fraglich</option></select>\n    <fieldset class=\"fmtset\"><legend>Format für später</legend>\n      <label class=\"chk\" for=\"fMp3\"><input type=\"checkbox\" id=\"fMp3\"> MP3 / Playback</label>\n      <label class=\"chk\" for=\"fMidi\"><input type=\"checkbox\" id=\"fMidi\"> MIDI</label>\n    </fieldset>\n    <label for=\"fN\">Notiz</label><textarea id=\"fN\" rows=\"3\"></textarea>\n    <label for=\"fC\">Kommentar des Einreichers</label><textarea id=\"fC\" rows=\"2\"></textarea>\n    <p class=\"dlgnote\" id=\"fInfo\"></p>\n    <div class=\"row\">\n      <button type=\"button\" id=\"delBtn\">Löschen</button>\n      <span class=\"spacer\"></span>\n      <button type=\"button\" id=\"cancelBtn\">Abbrechen</button>\n      <button type=\"submit\" class=\"primary\" id=\"saveBtn\">Speichern</button>\n    </div>\n  </form>\n</dialog>\n<dialog id=\"sugg\">\n  <form method=\"dialog\" id=\"suggForm\">\n    <h3 id=\"suggTitle\">Song vorschlagen</h3>\n    <label for=\"sT\">Titel <span class=\"req\">*</span></label><input id=\"sT\" required autocomplete=\"off\" maxlength=\"200\">\n    <label for=\"sA\">Interpret <span class=\"req\">*</span></label><input id=\"sA\" required autocomplete=\"off\">\n    <label for=\"sL\">Wer soll singen?</label><input id=\"sL\" placeholder=\"z. B. Nici, Heimi, Olli, Ralf (Rap)\" autocomplete=\"off\">\n    <label for=\"sC\">Kommentar: Warum dieser Song, und wo soll er rein? <span class=\"req\">*</span></label>\n    <textarea id=\"sC\" rows=\"4\" required placeholder=\"z. B. Mitsing-Hymne, passt in Set 2 nach Major Tom als Gänsehaut-Moment\"></textarea>\n    <label for=\"sB\">BPM</label><input id=\"sB\" inputmode=\"numeric\" placeholder=\"leer lassen – wird automatisch gesucht\">\n    <div class=\"row\">\n      <button type=\"button\" id=\"sDel\" hidden>Löschen</button>\n      <span class=\"spacer\"></span>\n      <button type=\"button\" id=\"sCancel\">Abbrechen</button>\n      <button type=\"submit\" class=\"primary\" id=\"sSave\">Einreichen</button>\n    </div>\n    <p class=\"status\" id=\"sMsg\" aria-live=\"polite\"></p>\n  </form>\n</dialog>\n<dialog id=\"exportDlg\" class=\"wide\">\n  <h3>Setlist erstellen</h3>\n  <p class=\"dlgnote\">Vorschau: DIN A4 quer, ein Set pro Spalte. Zum Drucken die PDF herunterladen und öffnen.</p>\n  <div class=\"previewWrap\"><canvas id=\"sheet\" aria-label=\"Vorschau der Setlist als A4-Blatt\"></canvas></div>\n  <div class=\"row\">\n    <span class=\"status\" id=\"copyMsg\" aria-live=\"polite\"></span><span class=\"spacer\"></span>\n    <button type=\"button\" id=\"closeExport\">Schließen</button>\n    <button type=\"button\" id=\"mailBtn\">Per E-Mail (PDF)</button>\n    <button type=\"button\" id=\"waBtn\">Per WhatsApp (PDF)</button>\n    <button type=\"button\" class=\"primary\" id=\"pdfBtn\">PDF herunterladen / Drucken</button>\n  </div>\n  <div class=\"row\" id=\"sendNext\" hidden><span class=\"status\" id=\"sendHint\"></span><span class=\"spacer\"></span><a class=\"btnlink primary\" id=\"sendLink\" href=\"#\" target=\"_blank\" rel=\"noopener\"></a></div>\n</dialog>\n<dialog id=\"nameDlg\">\n  <form method=\"dialog\" id=\"nameForm\">\n    <h3>Wer bist du?</h3>\n    <p class=\"dlgnote\">Dein Name steht bei deinen Vorschlägen und Stimmen. Er wird nur auf diesem Gerät gemerkt.</p>\n    <label for=\"nmIn\">Vorname</label><input id=\"nmIn\" required maxlength=\"40\" autocomplete=\"given-name\">\n    <div class=\"row\"><span class=\"spacer\"></span><button type=\"button\" id=\"nmCancel\">Später</button><button type=\"submit\" class=\"primary\">Weiter</button></div>\n  </form>\n</dialog>\n<dialog id=\"archDlg\" class=\"wide\">\n  <h3>Fremdsetlisten <small class=\"muted\">nur für dich sichtbar</small></h3>\n  <div class=\"tabs\" role=\"tablist\">\n    <button type=\"button\" role=\"tab\" id=\"tabNew\" aria-selected=\"true\">Neu einlesen</button>\n    <button type=\"button\" role=\"tab\" id=\"tabArch\" aria-selected=\"false\">Archiv</button>\n  </div>\n  <section id=\"paneNew\">\n    <div class=\"grid2\">\n      <div><label for=\"imBand\">Band <span class=\"req\">*</span></label><input id=\"imBand\" placeholder=\"z. B. Partyband XY\"></div>\n      <div><label for=\"imAnlass\">Anlass / Datum</label><input id=\"imAnlass\" placeholder=\"z. B. Kerwa Kitzingen 2026\"></div>\n    </div>\n    <label for=\"imFile\">Datei (PDF, Foto JPG/PNG, Word .docx, TXT, CSV) – wird nur in deinem Browser gelesen</label><input id=\"imFile\" type=\"file\" accept=\".pdf,.png,.jpg,.jpeg,.webp,.docx,.txt,.csv,image/png,image/jpeg,image/webp,application/pdf\">\n    <label for=\"imText\">… oder Text einfügen (eine Zeile pro Song, z. B. „Titel – Interpret“)</label>\n    <textarea id=\"imText\" rows=\"6\" placeholder=\"01 Atemlos - Helene Fischer&#10;02 Major Tom - Peter Schilling\"></textarea>\n    <div class=\"row\"><span class=\"status\" id=\"imMsg\" aria-live=\"polite\"></span><span class=\"spacer\"></span><button type=\"button\" id=\"imParse\">Erkennen</button></div>\n    <div id=\"imReview\" hidden>\n      <div class=\"row left\"><label class=\"chk\"><input type=\"checkbox\" id=\"imAll\" checked> alle</label><button type=\"button\" id=\"imSwap\" title=\"Titel und Interpret in allen Zeilen tauschen\">Titel ⇄ Interpret</button><button type=\"button\" id=\"imAdd\">+ Zeile</button><span class=\"spacer\"></span><span class=\"status\" id=\"imCount\"></span></div>\n      <div class=\"tblwrap\"><table class=\"imtbl\"><thead><tr><th></th><th>Titel</th><th>Interpret</th><th></th></tr></thead><tbody id=\"imRows\"></tbody></table></div>\n      <div class=\"row\"><label class=\"chk\"><input type=\"checkbox\" id=\"imToPool\"> markierte Titel gleich in die Vorschläge übernehmen</label><span class=\"spacer\"></span><button type=\"button\" class=\"primary\" id=\"imSave\">Im Archiv speichern</button></div>\n    </div>\n  </section>\n  <section id=\"paneArch\" hidden><div id=\"archList\"></div></section>\n  <div class=\"row\"><span class=\"spacer\"></span><button type=\"button\" id=\"archClose\">Schließen</button></div>\n</dialog>\n\n<p class=\"credit\">BPM-Daten: Deezer</p>";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
var fl=document.createElement("link");fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap";document.head.appendChild(fl);
var b=document.getElementById("boot");if(b)b.remove();
document.body.insertAdjacentHTML("beforeend",html);
function ld(src){return new Promise(function(r){var s=document.createElement("script");s.src=src;s.onload=r;s.onerror=r;document.head.appendChild(s);});}
Promise.all([ld("https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js"),ld("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")]).then(function(){
(function(){
const ADMIN_KEY = window.__ADMIN_KEY__ || "";
const $=s=>document.querySelector(s);
let isAdmin=false,canWrite=false,me={name:"",token:""};
let songs={},layout=null,votes={},myVotes={},archive=[],mailTo="",filter="",query="";
let sortables=[],dragging=false,editId=null,suggId=null,busy=0,lastLoad=0;
const NEW_MS=14*24*3600*1000;

// ---------- Server-Aufrufe ----------
function api(fn,...args){
  return new Promise((res,rej)=>{
    if(!(window.google&&google.script&&google.script.run)){rej(new Error("Nur in der Google-Web-App verfügbar"));return;}
    google.script.run.withSuccessHandler(res).withFailureHandler(e=>rej(e instanceof Error?e:new Error(String(e&&e.message||e))))[fn](...args);
  });
}
function setStatus(t,err){const s=$("#status");s.textContent=t||"";s.classList.toggle("err",!!err);}
function banner(t){const b=$("#banner");b.textContent=t||"";b.classList.toggle("show",!!t);}
function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function isProsit(id){return id.startsWith("prosit-");}
function uid(p){return p+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function isNew(s){return !!(s&&s.at&&Date.now()-Number(s.at)<NEW_MS);}
function ago(ts){const d=Math.floor((Date.now()-ts)/864e5);return d<=0?"heute":d===1?"gestern":`vor ${d} Tagen`;}
function isSugg(s){return s&&s.src!=="setlist";}

// ---------- Identität (nur auf diesem Gerät) ----------
function loadMe(){
  try{me.token=localStorage.getItem("db_token")||"";me.name=localStorage.getItem("db_name")||"";}catch(e){}
  if(!me.token){me.token=uid("t")+Math.random().toString(36).slice(2,10);try{localStorage.setItem("db_token",me.token);}catch(e){}}
  if(isAdmin&&!me.name) me.name="Ralf";
}
function setName(n){me.name=n;try{localStorage.setItem("db_name",n);}catch(e){} $("#meBtn").textContent="Ich: "+n;}
function askName(){return new Promise(res=>{$("#nmIn").value=me.name||"";$("#nameDlg").showModal();
  $("#nameForm").onsubmit=e=>{e.preventDefault();const v=$("#nmIn").value.trim();if(!v)return;setName(v);$("#nameDlg").close();res(true);};
  $("#nmCancel").onclick=()=>{$("#nameDlg").close();res(!!me.name);};});}
async function needName(){if(me.name) return true; return askName();}

// ---------- Karten ----------
function voteHTML(id){
  const t=votes[id]||{u:0,d:0,up:[],down:[]},m=myVotes[id]||0;
  return `<span class="votes"><button type="button" class="vote up" data-vote="1" data-id="${id}" aria-pressed="${m===1}" title="${esc(t.up.join(", ")||"Daumen hoch")}">👍 ${t.u}</button><button type="button" class="vote down" data-vote="-1" data-id="${id}" aria-pressed="${m===-1}" title="${esc(t.down.join(", ")||"Daumen runter")}">👎 ${t.d}</button></span>`;
}
function cardHTML(id,no,inSet,inPool){
  const addBtn=inSet&&canWrite?`<button type="button" class="mini" data-prosit-after="${id}" title="Prosit direkt nach diesem Titel einfügen">+ Prosit</button>`:"";
  if(isProsit(id)) return `<div class="card prosit" data-id="${id}"><span class="no">${no??""}</span><span class="tt">Ein Prosit</span><span class="right"><span class="tag">ALLE</span>${addBtn}${canWrite?`<button type="button" class="mini" data-prosit-del="${id}" title="Diesen Prosit entfernen" aria-label="Prosit entfernen">✕</button>`:""}</span></div>`;
  const s=songs[id]; if(!s) return "";
  const neu=isNew(s);
  const cls=(s.src==="setlist"&&!s.st?"setlist":(s.st||""))+(s.src==="einreichung"?" sugg":"")+(neu?" neu":"");
  const bpmT=s.bpm?`<span class="bpm${s.bpmSrc?" ki":""}" title="${s.bpmSrc?"BPM automatisch ("+esc(s.bpmSrc)+") – bitte prüfen":"BPM"}">${esc(s.bpm)}</span>`:(s.src==="einreichung"?'<span class="bpm" title="BPM noch offen">?</span>':"");
  const right=[neu?'<span class="badge-neu">NEU</span>':"",s.act?`<span class="tag" title="Aktion">${esc(s.act)}</span>`:"",bpmT,s.st?`<span class="pill ${esc(s.st)}">${esc(s.st)}</span>`:"",addBtn].join("");
  const tog=k=>canWrite?`<button type="button" class="tog ${k}${s[k]?" on":""}" data-tog="${k}" data-id="${id}" aria-pressed="${!!s[k]}" title="${k==="mp3"?"Als MP3/Playback markieren":"Als MIDI markieren"}">${k==="mp3"?"MP3":"MIDI"}</button>`:(s[k]?`<span class="tog ${k} on">${k==="mp3"?"MP3":"MIDI"}</span>`:"");
  const fmt=`<span class="fmt">${tog("mp3")}${tog("midi")}</span>`;
  const sub=[s.lead?`<span class="lead">${esc(s.lead)}</span>`:"",s.a?`<span>${esc(s.a)}</span>`:"",s.note?`<span>${esc(s.note)}</span>`:"",isAdmin&&s.origin?`<span class="origin">aus: ${esc(s.origin)}</span>`:"",fmt].filter(Boolean).join("");
  const med=s.medley&&s.medley.length?`<details class="mdl" style="grid-column:2/4"><summary>Medley · ${s.medley.length} Titel</summary><ul class="medley">${s.medley.map(m=>`<li>${esc(m)}</li>`).join("")}</ul></details>`:"";
  const why=inPool&&s.comment?`<div class="why">${esc(s.comment)}</div>`:"";
  const foot=inPool&&isSugg(s)?`<div class="foot"><span>${s.byName?"Vorschlag von "+esc(s.byName)+(s.at?" · "+ago(Number(s.at)):""):""}</span>${voteHTML(id)}</div>`:"";
  return `<div class="card ${esc(cls)}" data-id="${id}" tabindex="0"><span class="no">${no??""}</span><span class="tt">${esc(s.t)}</span><span class="right">${right}</span>${sub?`<div class="sub">${sub}</div>`:""}${med}${why}${foot}</div>`;
}
function matches(id){
  if(isProsit(id)) return !query&&filter==="";
  const s=songs[id]; if(!s) return false;
  if(filter==="neu"){if(!isNew(s))return false;}
  else if(filter==="medley"){if(!(s.medley&&s.medley.length))return false;}
  else if(filter&&s.st!==filter) return false;
  if(query){const h=(s.t+" "+(s.a||"")+" "+(s.comment||"")+" "+(s.byName||"")+" "+(s.medley||[]).join(" ")).toLowerCase();if(!h.includes(query))return false;}
  return true;
}
function songCount(ids){return ids.filter(i=>!isProsit(i)).length;}
function poolIds(){
  const placed=new Set([...layout.pool,...layout.wait,...layout.sets.flatMap(s=>s.ids)]);
  const extra=Object.keys(songs).filter(id=>!placed.has(id)).sort((a,b)=>(Number(songs[b].at)||0)-(Number(songs[a].at)||0));
  return [...extra,...layout.pool.filter(id=>songs[id]||isProsit(id))];
}
function render(){
  if(!layout) return;
  sortables.forEach(s=>s.destroy()); sortables=[];
  const pids=poolIds();
  $("#pool").innerHTML=pids.map(id=>{const h=cardHTML(id,undefined,false,true);return matches(id)?h:h.replace('class="card','hidden class="card');}).join("");
  $("#pool").classList.toggle("empty",pids.length===0);
  $("#poolCount").textContent=songCount(pids)+" Songs";
  const nNew=pids.filter(id=>isNew(songs[id])).length;
  $("#newCount").textContent=nNew===1?"1 neuer Vorschlag":nNew+" neue Vorschläge";$("#newCount").classList.toggle("show",nNew>0);
  let total=0,proz=0;
  $("#sets").innerHTML=layout.sets.map((st,i)=>{
    let n=0;const cards=st.ids.map(id=>{if(!isProsit(id))n++;return cardHTML(id,isProsit(id)?"":String(n).padStart(2,"0"),true);}).join("");
    total+=n;proz+=st.ids.length-n;
    return `<div class="setbox"><div class="sethead"><input aria-label="Name von ${esc(st.name)}" data-set="${i}" value="${esc(st.name)}"${canWrite?"":" readonly"}><span class="meta">${n} Songs · ${st.ids.length-n} Prosit</span><span class="spacer"></span>${canWrite?`<button type="button" data-prosit-start="${i}">+ Prosit Anfang</button><button type="button" data-prosit-end="${i}">+ Prosit Ende</button>`:""}${canWrite&&layout.sets.length>1?`<button type="button" data-delset="${i}" title="Set entfernen – Songs wandern in den Wartebereich">Set entfernen</button>`:""}</div><div class="list ${st.ids.length?"":"empty"}" data-zone="set" data-set="${i}">${cards}</div></div>`;
  }).join("");
  $("#setCount").textContent=`${total} Songs in ${layout.sets.length} Sets`;
  $("#wait").innerHTML=layout.wait.map(id=>cardHTML(id)).join("");$("#wait").classList.toggle("empty",layout.wait.length===0);
  $("#waitCount").textContent=songCount(layout.wait)+" Songs";
  const inSet=layout.sets.flatMap(s=>s.ids).filter(id=>songs[id]);
  const neu=inSet.filter(id=>songs[id].src!=="setlist").length;
  const nMp3=inSet.filter(id=>songs[id].mp3).length,nMidi=inSet.filter(id=>songs[id].midi).length,nNone=inSet.filter(id=>!songs[id].mp3&&!songs[id].midi).length;
  $("#stats").innerHTML=`<span>Setlist <b>${total}</b> Songs</span><span>davon neu <b>${neu}</b></span><span>MP3 <b>${nMp3}</b></span><span>MIDI <b>${nMidi}</b></span><span>ohne Format <b>${nNone}</b></span><span>Prosit <b>${proz}</b></span><span>Warten <b>${songCount(layout.wait)}</b></span><span>Vorschläge <b>${songCount(pids)}</b></span>`;
  document.body.classList.toggle("ro",!canWrite);
  if(canWrite&&window.Sortable) wireSortable();
}
function wireSortable(){
  document.querySelectorAll(".list").forEach(el=>{
    sortables.push(Sortable.create(el,{group:"songs",animation:140,filter:"summary,input,button",preventOnFilter:false,
      onStart(){dragging=true;},onEnd(){setTimeout(()=>{dragging=false;},80);collect();}}));
  });
}
function collect(){
  const ids=el=>[...el.querySelectorAll(":scope > .card")].map(c=>c.dataset.id);
  layout={sets:layout.sets.map((s,i)=>({name:s.name,ids:ids(document.querySelector(`.list[data-set="${i}"]`))})),pool:ids($("#pool")),wait:ids($("#wait"))};
  render(); saveLayout();
}
let layoutChain=Promise.resolve();
function saveLayout(){
  const snap=JSON.parse(JSON.stringify(layout)); setStatus("Speichere …"); busy++;
  layoutChain=layoutChain.then(()=>api("saveLayout",ADMIN_KEY,snap)).then(()=>setStatus("Gespeichert")).catch(e=>setStatus("Nicht gespeichert: "+e.message,true)).finally(()=>busy--);
}
async function saveSongPatch(id,patch){
  busy++; setStatus("Speichere …");
  try{await api("saveSong",ADMIN_KEY,id,patch);setStatus("Gespeichert");}
  catch(e){setStatus("Nicht gespeichert: "+e.message,true);}
  finally{busy--;}
}

// ---------- Laden / Aktualisieren ----------
async function load(silent){
  if(!silent) setStatus("Lade …");
  try{
    const raw=await api("getData",ADMIN_KEY,me.token);
    if(raw==null) throw new Error("Keine Antwort vom Server");
    const d=typeof raw==="string"?JSON.parse(raw):raw;
    lastLoad=Date.now();
    if(dragging||busy||document.querySelector("dialog[open]")){pendingData=d;return;}
    apply(d);
  }catch(e){setStatus("Laden fehlgeschlagen: "+e.message,true);}
}
let pendingData=null,applied=false;
function apply(d){
  isAdmin=!!d.admin; canWrite=isAdmin;
  songs=d.songs||{}; layout=d.layout; votes=d.votes||{}; myVotes=d.myVotes||{}; archive=d.archive||[]; mailTo=d.mailTo||""; 
  $("#addSong").hidden=!canWrite;$("#addSet").hidden=!canWrite;$("#archBtn").hidden=!isAdmin;$("#suggBtn").hidden=false;updBpmBtn();
  $("#meBtn").hidden=false; $("#meBtn").textContent=me.name?"Ich: "+me.name:"Namen eintragen";
  if(!isAdmin){
    $("#setHint").textContent="Aktuelle Setlist – nur Ansicht. Änderungen macht Ralf.";
    $("#poolHint").textContent="Neue Songs über „+ Vorschlag einreichen“. Mit 👍 / 👎 abstimmen. Die Setlist selbst ändert nur Ralf.";
  }
  render(); if(!applied){applied=true;setStatus(isAdmin?"Admin-Modus":"");}
  if($("#archDlg").open) renderArchive();
}
setInterval(()=>{if(document.hidden)return;if(pendingData&&!dragging&&!busy&&!document.querySelector("dialog[open]")){const d=pendingData;pendingData=null;apply(d);return;}
  if(Date.now()-lastLoad>30000&&!dragging&&!busy) load(true);},3000);

// ---------- Admin: Song bearbeiten ----------
function openEdit(id){
  if(!canWrite||isProsit(id)) return;
  editId=id; const s=songs[id]||{};
  $("#editTitle").textContent=!songs[id]?"Neuer Song":"Song bearbeiten";
  $("#fT").value=s.t||"";$("#fA").value=s.a||"";$("#fL").value=s.lead||"";$("#fB").value=s.bpm||"";$("#fS").value=s.st||"";$("#fN").value=s.note||"";$("#fC").value=s.comment||"";$("#fMp3").checked=!!s.mp3;$("#fMidi").checked=!!s.midi;
  $("#fInfo").textContent=[s.byName?"Vorschlag von "+s.byName+(s.at?" ("+new Date(Number(s.at)).toLocaleDateString("de-DE")+")":""):"",s.origin?"Herkunft: "+s.origin:"",s.bpmSrc?"BPM-Quelle: "+s.bpmSrc:""].filter(Boolean).join(" · ");
  $("#delBtn").hidden=!songs[id]; $("#fB").dataset.src="";
  $("#edit").showModal();
}
$("#editForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const t=$("#fT").value.trim(); if(!t) return;
  const old=songs[editId]||{}; const bpm=$("#fB").value.trim();
  const patch={t,a:$("#fA").value.trim(),lead:$("#fL").value.trim(),bpm,bpmSrc:bpm===String(old.bpm||"")?(old.bpmSrc||""):($("#fB").dataset.src&&bpm?$("#fB").dataset.src:""),st:$("#fS").value,note:$("#fN").value.trim(),comment:$("#fC").value.trim(),mp3:$("#fMp3").checked,midi:$("#fMidi").checked};
  if(!songs[editId]){patch.src="vorschlag";patch.byName=me.name||"Ralf";patch.at=Date.now();}
  songs={...songs,[editId]:Object.assign({},old,patch)};
  if(!old.t&&!layout.pool.includes(editId)) layout.pool.unshift(editId);
  $("#edit").close(); render(); await saveSongPatch(editId,patch);
});
$("#cancelBtn").onclick=()=>$("#edit").close();
$("#delBtn").onclick=async()=>{
  const b=$("#delBtn"); if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Wirklich löschen?";setTimeout(()=>{b.dataset.c="";b.textContent="Löschen";},4000);return;}
  b.dataset.c="";b.textContent="Löschen";
  const id=editId; $("#edit").close();
  layout.pool=layout.pool.filter(x=>x!==id);layout.wait=layout.wait.filter(x=>x!==id);layout.sets.forEach(s=>s.ids=s.ids.filter(x=>x!==id));
  const n={...songs};delete n[id];songs=n;render();
  busy++;try{await api("deleteSong",ADMIN_KEY,id);setStatus("Gelöscht");}catch(e){setStatus("Löschen fehlgeschlagen: "+e.message,true);}finally{busy--;}
};
$("#fBpm").onclick=async()=>{const t=$("#fT").value.trim(),a=$("#fA").value.trim();if(!t)return;$("#fInfo").textContent="Suche BPM …";
  const b=await clientBpm(t,a);
  if(b){$("#fB").value=b;$("#fInfo").textContent="Gefunden: "+b+" BPM (Deezer) – bitte prüfen";$("#fB").dataset.src="Deezer";}
  else{$("#fInfo").innerHTML="Nicht gefunden. "+`<a href="${googleBpm(t,a)}" target="_blank" rel="noopener">Im Web nachsehen</a>`;}};

// ---------- BPM: freie Deezer-Musikdatenbank, Abfrage direkt im Browser (kein Schlüssel nötig) ----------
function googleBpm(t,a){return "https:\/\/www.google.com/search?q="+encodeURIComponent(`${t} ${a||""} bpm`);}
let jsonpN=0;
function jsonp(url,ms){return new Promise((res,rej)=>{
  const cb="__dz"+(++jsonpN)+Date.now().toString(36); const sc=document.createElement("script");
  const done=v=>{clearTimeout(tm);try{delete window[cb];}catch(e){window[cb]=undefined;}sc.remove();};
  const tm=setTimeout(()=>{done();rej(new Error("Zeitüberschreitung"));},ms||8000);
  window[cb]=d=>{done();res(d);};
  sc.onerror=()=>{done();rej(new Error("nicht erreichbar"));};
  sc.src=url+(url.includes("?")?"&":"?")+"output=jsonp&callback="+cb; document.head.appendChild(sc);
});}
function norm(x){return String(x||"").toLowerCase().replace(/\(.*?\)|\[.*?\]|feat\..*$|ft\..*$/g,"").replace(/[^a-z0-9äöüß]+/g," ").trim();}
async function clientBpm(t,a){
  const base="https:\/\/api.deezer.com";
  const q=a?`artist:"${a}" track:"${t}"`:t;
  try{
    let r=await jsonp(`${base}/search?limit=10&q=${encodeURIComponent(q)}`);
    let list=(r&&r.data)||[];
    if(!list.length&&a){r=await jsonp(`${base}/search?limit=10&q=${encodeURIComponent(t+" "+a)}`);list=(r&&r.data)||[];}
    const nt=norm(t);
    list.sort((x,y)=>(norm(y.title)===nt)-(norm(x.title)===nt));
    for(const hit of list.slice(0,4)){
      const d=await jsonp(`${base}/track/${hit.id}`);
      const n=Math.round(Number(d&&d.bpm)); if(n>40&&n<260) return n;
    }
  }catch(e){}
  return null;
}
function openBpmIds(){return Object.keys(songs).filter(id=>songs[id].src!=="setlist"&&!songs[id].bpm&&!(songs[id].medley&&songs[id].medley.length));}
function updBpmBtn(){const n=isAdmin?openBpmIds().length:0;$("#bpmBtn").hidden=!n;$("#bpmBtn").textContent=`BPM ergänzen (${n})`;}
async function fillOpenBpms(){
  const ids=openBpmIds(); if(!ids.length) return;
  const map={}; let i=0;
  for(const id of ids){i++;setStatus(`Suche BPM ${i}/${ids.length}: ${songs[id].t}`);const b=await clientBpm(songs[id].t,songs[id].a);if(b)map[id]=b;await new Promise(r=>setTimeout(r,250));}
  if(!Object.keys(map).length){setStatus("Keine BPM gefunden – bitte im Song über „Im Web nachsehen“ eintragen",true);return;}
  busy++;try{const n=await api("saveBpms",ADMIN_KEY,map,"Deezer");setStatus(`${n} von ${ids.length} BPM-Werten gefunden und gespeichert`);}catch(e){setStatus("BPM nicht gespeichert: "+e.message,true);}finally{busy--;}
  await load(true);
}

// ---------- Bandmitglieder: Vorschlag ----------
function openSugg(id){
  suggId=id||null; const s=id?songs[id]:{};
  $("#suggTitle").textContent=id?"Vorschlag bearbeiten":"Song vorschlagen";
  $("#sT").value=s.t||"";$("#sA").value=s.a||"";$("#sL").value=s.lead||"";$("#sC").value=s.comment||"";$("#sB").value=s.bpm||"";
  $("#sDel").hidden=!id; $("#sSave").textContent=id?"Speichern":"Einreichen"; $("#sMsg").textContent="";
  $("#sugg").showModal();
}
$("#suggBtn").onclick=async()=>{if(await needName()) openSugg(null);};
$("#suggForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const data={t:$("#sT").value.trim(),a:$("#sA").value.trim(),lead:$("#sL").value.trim(),comment:$("#sC").value.trim(),bpm:$("#sB").value.trim()};
  if(!data.t||!data.a||!data.comment) return;
  $("#sSave").disabled=true; $("#sMsg").textContent="Speichere …";
  try{
    if(suggId) await api("editOwnSuggestion",me.token,suggId,data);
    else{
      if(!data.bpm){$("#sMsg").textContent="Suche BPM …";const b=await clientBpm(data.t,data.a);if(b){data.bpm=String(b);data.bpmSrc="Deezer";}}
      $("#sMsg").textContent="Speichere …";
      await api("submitSuggestion",me.token,me.name,data);setStatus(data.bpmSrc?`Danke – eingereicht (BPM ${data.bpm} automatisch ermittelt)`:"Danke – Vorschlag eingereicht");
    }
    $("#sugg").close(); await load(true);
  }catch(err){$("#sMsg").textContent=err.message;}
  finally{$("#sSave").disabled=false;}
});
$("#sCancel").onclick=()=>$("#sugg").close();
$("#sDel").onclick=async()=>{
  const b=$("#sDel"); if(b.dataset.c!=="1"){b.dataset.c="1";b.textContent="Wirklich löschen?";setTimeout(()=>{b.dataset.c="";b.textContent="Löschen";},4000);return;}
  b.dataset.c="";b.textContent="Löschen";
  try{await api("deleteOwnSuggestion",me.token,suggId);$("#sugg").close();await load(true);setStatus("Vorschlag gelöscht");}catch(err){$("#sMsg").textContent=err.message;}
};
$("#meBtn").onclick=()=>askName();

// Abstimmen
document.addEventListener("click",async e=>{
  const b=e.target.closest("[data-vote]"); if(!b) return;
  e.stopPropagation(); if(!(await needName())) return;
  const id=b.dataset.id,v=+b.dataset.vote,old=myVotes[id]||0,nv=old===v?0:v;
  const t=votes[id]||(votes[id]={u:0,d:0,up:[],down:[]});
  if(old===1){t.u--;t.up=t.up.filter(x=>x!==me.name);} if(old===-1){t.d--;t.down=t.down.filter(x=>x!==me.name);}
  if(nv===1){t.u++;t.up.push(me.name);} if(nv===-1){t.d++;t.down.push(me.name);}
  myVotes={...myVotes,[id]:nv}; render();
  busy++;try{await api("vote",me.token,me.name,id,nv);}catch(err){setStatus("Stimme nicht gespeichert: "+err.message,true);}finally{busy--;}
},true);

// Klick auf Karte
document.addEventListener("click",e=>{
  if(dragging) return;
  if(e.target.closest("summary,input,button,select,textarea,a")) return;
  const c=e.target.closest(".card"); if(!c) return; openCard(c.dataset.id);
});
document.addEventListener("keydown",e=>{const c=e.target.closest&&e.target.closest(".card");if(c&&e.key==="Enter"&&e.target===c)openCard(c.dataset.id);});
function openCard(id){
  if(canWrite) return openEdit(id);
  const s=songs[id]; const placed=layout.wait.includes(id)||layout.sets.some(x=>x.ids.includes(id));
  if(s&&s.mine&&!placed) openSugg(id);
}

// Set-Namen, Sets
document.addEventListener("change",e=>{
  if(!canWrite) return;
  const i=e.target.dataset&&e.target.dataset.set; if(i!==undefined&&e.target.tagName==="INPUT"){layout.sets[+i].name=e.target.value.trim()||"Set";saveLayout();}
});
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-delset]"); if(!b||!canWrite) return;
  const i=+b.dataset.delset,s=layout.sets[i];
  layout.wait=[...layout.wait,...s.ids.filter(x=>!isProsit(x))];layout.sets.splice(i,1);render();saveLayout();
});
$("#bpmBtn").onclick=()=>{if(isAdmin)fillOpenBpms();};
$("#addSet").onclick=()=>{if(!canWrite||!layout)return;layout.sets.push({name:"Set "+(layout.sets.length+1),ids:[]});render();saveLayout();};
$("#addSong").onclick=()=>{if(canWrite&&layout)openEdit(uid("n"));};
["pointerdown","mousedown","touchstart"].forEach(t=>document.addEventListener(t,e=>{if(e.target.closest&&e.target.closest(".card button, .card summary"))e.stopPropagation();},{capture:true,passive:true}));
// MP3/MIDI + Prosit
document.addEventListener("click",e=>{
  if(!canWrite||!layout) return;
  try{
    const tg=e.target.closest("[data-tog]");
    if(tg){e.stopPropagation();const id=tg.dataset.id,k=tg.dataset.tog;const cur=Object.assign({},songs[id]);const val=!cur[k];if(val)cur[k]=true;else delete cur[k];songs={...songs,[id]:cur};render();saveSongPatch(id,{[k]:val});return;}
    const after=e.target.closest("[data-prosit-after]"),del=e.target.closest("[data-prosit-del]"),st=e.target.closest("[data-prosit-start]"),en=e.target.closest("[data-prosit-end]");
    if(!(after||del||st||en)) return;
    e.stopPropagation(); let np=null;
    if(after){const id=after.dataset.prositAfter;for(const s of layout.sets){const k=s.ids.indexOf(id);if(k>-1){np=uid("prosit");s.ids.splice(k+1,0,np);break;}}}
    if(del){const id=del.dataset.prositDel;layout.sets.forEach(s=>s.ids=s.ids.filter(x=>x!==id));}
    if(st){np=uid("prosit");layout.sets[+st.dataset.prositStart].ids.unshift(np);}
    if(en){np=uid("prosit");layout.sets[+en.dataset.prositEnd].ids.push(np);}
    render();saveLayout();
    if(np){const c=document.querySelector(`.card[data-id="${np}"]`);if(c){c.classList.add("flash");c.scrollIntoView({block:"nearest"});setTimeout(()=>c.classList.remove("flash"),1600);}}
  }catch(err){setStatus("Aktion fehlgeschlagen: "+err.message,true);}
},true);
document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{filter=b.dataset.f;document.querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===b));render();});
$("#q").addEventListener("input",e=>{query=e.target.value.trim().toLowerCase();render();});

// ---------- Setlist erstellen (PDF) ----------
const pdfSafe=t=>String(t||"").replace(/[–—]/g,"-").replace(/[„“”]/g,'"').replace(/[‚‘’]/g,"'").replace(/×/g,"x");
function sheetRows(){return layout.sets.map(st=>({name:st.name,rows:st.ids.map(id=>isProsit(id)?{prosit:true}:{t:(songs[id]||{}).t||"",lead:(songs[id]||{}).lead||""})}));}
function sheetLayout(measure){
  // Tabelle: Spalten = Runden, alle Zeilen und Spalten mit Linien
  const W=297,H=210,M=5,PAD=1.5,sets=sheetRows(),n=Math.max(1,sets.length);
  const colW=(W-2*M)/n, inner=colW-2*PAD, headPt=11, headH=7;
  const maxRows=Math.max(1,...sets.map(s=>s.rows.length));
  const lineH=(H-2*M-headH)/maxRows, PT=0.3528;
  const fs=Math.min(30,lineH/PT/1.3);
  const items=[],lines=[];
  // Gitter
  lines.push({x1:M,y1:M,x2:W-M,y2:M},{x1:M,y1:H-M,x2:W-M,y2:H-M},{x1:M,y1:M+headH,x2:W-M,y2:M+headH,bold:true});
  for(let k=1;k<maxRows;k++){const y=M+headH+k*lineH;lines.push({x1:M,y1:y,x2:W-M,y2:y});}
  for(let i=0;i<=n;i++){const x=M+i*colW;lines.push({x1:x,y1:M,x2:x,y2:H-M,bold:i>0&&i<n});}
  sets.forEach((st,i)=>{
    const x0=M+i*colW+PAD;
    items.push({text:st.name.toUpperCase(),x:x0,y:M+headH/2+headPt*PT*0.35,size:headPt,bold:true,align:"left",color:"#444444"});
    st.rows.forEach((r,k)=>{
      const yBase=M+headH+k*lineH+lineH*0.5+fs*PT*0.35;
      if(r.prosit){let sz=fs;const w=measure("EIN PROSIT",sz,true);if(w>inner)sz*=inner/w;
        items.push({text:"EIN PROSIT",x:x0+inner/2,y:yBase,size:sz,bold:true,align:"center",color:"#c00000"});return;}
      const ss=Math.max(8,fs*0.5), sw=r.lead?measure(r.lead,ss,false)+1.5:0;
      let sz=fs; const tw=measure(r.t,sz,true); if(tw>inner-sw) sz=sz*(inner-sw)/tw;
      items.push({text:r.t,x:x0,y:yBase,size:sz,bold:true,align:"left",color:"#000000"});
      if(r.lead) items.push({text:r.lead,x:x0+inner,y:yBase,size:ss,bold:false,align:"right",color:"#555555"});
    });
  });
  return {W,H,items,lines};
}
let measureDoc=null;
function pdfMeasure(){
  if(!window.jspdf) return null;
  if(!measureDoc) measureDoc=new window.jspdf.jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
  return (t,pt,bold)=>{measureDoc.setFont("helvetica",bold?"bold":"normal");measureDoc.setFontSize(pt);return measureDoc.getTextWidth(pdfSafe(t));};
}
function canvasMeasure(ctx,scale){return (t,pt,bold)=>{ctx.font=`${bold?"bold ":""}${pt*0.3528*scale}px Helvetica, Arial, sans-serif`;return ctx.measureText(t).width/scale;};}
function drawPreview(){
  const cv=$("#sheet"),scale=4,ctx=cv.getContext("2d");
  cv.width=297*scale;cv.height=210*scale;
  const L=sheetLayout(pdfMeasure()||canvasMeasure(ctx,scale));
  ctx.fillStyle="#fff";ctx.fillRect(0,0,cv.width,cv.height);
  L.lines.forEach(l=>{ctx.strokeStyle=l.bold?"#333":"#999";ctx.lineWidth=l.bold?2:1;ctx.beginPath();ctx.moveTo(l.x1*scale,l.y1*scale);ctx.lineTo(l.x2*scale,l.y2*scale);ctx.stroke();});
  L.items.forEach(it=>{ctx.fillStyle=it.color;ctx.font=`${it.bold?"bold ":""}${it.size*0.3528*scale}px Helvetica, Arial, sans-serif`;ctx.textAlign=it.align;ctx.textBaseline="alphabetic";ctx.fillText(it.text,it.x*scale,it.y*scale);});
}
function hexRgb(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));}
function buildPdf(){
  const doc=new window.jspdf.jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
  const L=sheetLayout(pdfMeasure());
  L.lines.forEach(l=>{doc.setDrawColor(l.bold?50:150);doc.setLineWidth(l.bold?0.45:0.2);doc.line(l.x1,l.y1,l.x2,l.y2);});
  L.items.forEach(it=>{doc.setFont("helvetica",it.bold?"bold":"normal");doc.setFontSize(it.size);doc.setTextColor(...hexRgb(it.color));doc.text(pdfSafe(it.text),it.x,it.y,{align:it.align});});
  doc.setProperties({title:"Dorfbengel Setlist"});
  return doc.output("blob");
}

function pdfName(){const d=new Date();return `Dorfbengel Setlist ${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}.pdf`;}
function blobB64(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(",")[1]);r.onerror=rej;r.readAsDataURL(blob);});}
const isPhone=/iPhone|iPad|Android/i.test(navigator.userAgent);
function download(){
  const blob=buildPdf(),url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=pdfName();a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function showNext(hint,label,href){$("#sendHint").textContent=hint;$("#sendLink").textContent=label;$("#sendLink").href=href;$("#sendNext").hidden=false;}
$("#exportBtn").onclick=()=>{
  if(!layout) return;
  $("#copyMsg").textContent="";$("#sendNext").hidden=true;
  $("#exportDlg").showModal(); drawPreview();
  if(!window.jspdf){["#pdfBtn","#mailBtn","#waBtn"].forEach(x=>$(x).disabled=true);$("#copyMsg").textContent="PDF-Erzeugung nicht geladen – bitte Seite neu laden";}
};
$("#pdfBtn").onclick=()=>{try{download();$("#copyMsg").textContent="PDF heruntergeladen – öffnen und drucken";}catch(e){$("#copyMsg").textContent="Download nicht möglich: "+e.message;}};
$("#waBtn").onclick=()=>{
  try{download();}catch(e){$("#copyMsg").textContent="Download nicht möglich: "+e.message;return;}
  $("#copyMsg").textContent="PDF „"+pdfName()+"“ heruntergeladen";
  showNext(isPhone?"In WhatsApp den Chat öffnen → Büroklammer → Dokument → die PDF aus „Downloads“ wählen.":"WhatsApp öffnen, Chat wählen, Büroklammer → Dokument → die PDF aus „Downloads“ wählen.","WhatsApp öffnen",isPhone?"https:\/\/wa.me/":"https:\/\/web.whatsapp.com/");
};
$("#mailBtn").onclick=()=>{
  try{download();}catch(e){$("#copyMsg").textContent="Download nicht möglich: "+e.message;return;}
  $("#copyMsg").textContent="PDF „"+pdfName()+"“ heruntergeladen";
  showNext("Mail öffnen und die PDF aus „Downloads“ anhängen (Büroklammer oder per Ziehen).","Mail öffnen","mailto:"+encodeURIComponent(mailTo).replace(/%2C/gi,",").replace(/%40/g,"@")+"?subject="+encodeURIComponent("Dorfbengel Setlist")+"&body="+encodeURIComponent("Hallo zusammen,\n\nanbei die aktuelle Setlist als PDF.\n\nGruß"));
};
$("#closeExport").onclick=()=>$("#exportDlg").close();

// ---------- Admin: Fremdsetlisten ----------
let imRows=[];
function tab(which){$("#tabNew").setAttribute("aria-selected",which==="new");$("#tabArch").setAttribute("aria-selected",which==="arch");$("#paneNew").hidden=which!=="new";$("#paneArch").hidden=which!=="arch";if(which==="arch")renderArchive();}
$("#tabNew").onclick=()=>tab("new"); $("#tabArch").onclick=()=>tab("arch");
$("#archBtn").onclick=()=>{if(!isAdmin)return;$("#archDlg").showModal();tab(archive.length?"arch":"new");};
$("#archClose").onclick=()=>{$("#archDlg").close();};
const SKIP=/^(set|runde|block|pause|zugabe|prosit|ein prosit|encore|break|intro|outro|ende|setlist)\b[\s\d:.\-–]*$/i;
function parseLines(text){
  const out=[];
  String(text||"").split(/\r?\n/).forEach(raw=>{
    let l=raw.replace(/ /g," ").trim(); if(!l) return;
    l=l.replace(/^(\d{1,3}\s*[\.\):\-–]?|[-•*·▪●]+)\s+/,"").trim();
    l=l.replace(/\s+\(?\d{2,3}\s*(bpm)?\)?$/i,"").replace(/\s+\d{1,2}:\d{2}$/,"").trim();
    if(!l||l.length<2||SKIP.test(l)||/^\d+$/.test(l)) return;
    let t=l,a="";
    const m=l.split(/\s+[-–—]\s+|\t+|\s*;\s*|\s*\|\s*|\s{3,}/).map(x=>x.trim()).filter(Boolean);
    if(m.length>=2){t=m[0];a=m.slice(1).join(" ");}
    else{const p=l.match(/^(.+?)\s*\(([^)]+)\)\s*$/);if(p){t=p[1];a=p[2];}}
    out.push({on:true,t,a});
  });
  return out;
}
// Dateien werden komplett im Browser gelesen – nichts verlässt dein Gerät außer dem erkannten Text
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`)){res();return;}const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=()=>rej(new Error("Bibliothek nicht ladbar"));document.head.appendChild(s);});}
async function extractLocal(f,msg){
  const n=f.name.toLowerCase();
  if(/\.(txt|csv)$/.test(n)||String(f.type).startsWith("text/")) return await f.text();
  if(/\.docx$/.test(n)){
    await loadScript("https:\/\/cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");
    const r=await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()}); return r.value;
  }
  if(/\.pdf$/.test(n)||f.type==="application/pdf"){
    await loadScript("https:\/\/cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
    pdfjsLib.GlobalWorkerOptions.workerSrc="https:\/\/cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise; let out=[];
    for(let p=1;p<=pdf.numPages;p++){
      const page=await pdf.getPage(p); const tc=await page.getTextContent();
      // Zeilen anhand der Y-Position zusammensetzen
      const rows={}; tc.items.forEach(it=>{const y=Math.round(it.transform[5]);(rows[y]=rows[y]||[]).push(it);});
      Object.keys(rows).map(Number).sort((a,b)=>b-a).forEach(y=>out.push(rows[y].sort((a,b)=>a.transform[4]-b.transform[4]).map(i=>i.str).join("  ").replace(/\s{2,}/g,"   ").trim()));
    }
    const txt=out.filter(Boolean).join("\n");
    if(txt.replace(/\s/g,"").length>20) return txt;
    msg("PDF enthält keinen Text (Scan) – starte Texterkennung …");
    // Scan: Seiten als Bild rendern und erkennen
    const imgs=[];for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p);const vp=page.getViewport({scale:2});const cv=document.createElement("canvas");cv.width=vp.width;cv.height=vp.height;await page.render({canvasContext:cv.getContext("2d"),viewport:vp}).promise;imgs.push(cv);}
    return await ocr(imgs,msg);
  }
  if(String(f.type).startsWith("image/")||/\.(png|jpe?g|webp)$/.test(n)) return await ocr([f],msg);
  throw new Error("Dateityp nicht unterstützt – bitte PDF, Foto (JPG/PNG), Word (.docx), TXT oder CSV");
}
async function ocr(images,msg){
  await loadScript("https:\/\/cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
  msg("Texterkennung läuft … (beim ersten Mal 20–60 Sekunden)");
  const w=await Tesseract.createWorker("deu+eng"); let out=[];
  try{for(let i=0;i<images.length;i++){msg(`Texterkennung Seite ${i+1} von ${images.length} …`);const r=await w.recognize(images[i]);out.push(r.data.text);}}
  finally{await w.terminate();}
  return out.join("\n");
}
function renderImRows(){
  $("#imRows").innerHTML=imRows.map((r,i)=>`<tr><td class="c"><input type="checkbox" data-im-on="${i}" ${r.on?"checked":""} aria-label="Zeile ${i+1} übernehmen"></td><td><input type="text" data-im-t="${i}" value="${esc(r.t)}" aria-label="Titel"></td><td><input type="text" data-im-a="${i}" value="${esc(r.a)}" aria-label="Interpret"></td><td class="c"><button type="button" class="mini" data-im-del="${i}" aria-label="Zeile entfernen">✕</button></td></tr>`).join("");
  $("#imCount").textContent=imRows.filter(r=>r.on).length+" von "+imRows.length+" markiert";
  $("#imReview").hidden=imRows.length===0;
}
$("#imRows").addEventListener("input",e=>{const d=e.target.dataset;if(d.imT!==undefined)imRows[+d.imT].t=e.target.value;if(d.imA!==undefined)imRows[+d.imA].a=e.target.value;if(d.imOn!==undefined){imRows[+d.imOn].on=e.target.checked;$("#imCount").textContent=imRows.filter(r=>r.on).length+" von "+imRows.length+" markiert";}});
$("#imRows").addEventListener("click",e=>{const b=e.target.closest("[data-im-del]");if(b){imRows.splice(+b.dataset.imDel,1);renderImRows();}});
$("#imAll").onchange=e=>{imRows.forEach(r=>r.on=e.target.checked);renderImRows();};
$("#imSwap").onclick=()=>{imRows.forEach(r=>{const x=r.t;r.t=r.a;r.a=x;});renderImRows();};
$("#imAdd").onclick=()=>{imRows.push({on:true,t:"",a:""});renderImRows();};
$("#imParse").onclick=async()=>{
  const f=$("#imFile").files[0]; let text=$("#imText").value;
  $("#imMsg").textContent="";
  if(f){
    if(f.size>15*1024*1024){$("#imMsg").textContent="Datei zu groß (max. 15 MB)";return;}
    $("#imMsg").textContent="Lese Datei …";
    try{text=await extractLocal(f,m=>$("#imMsg").textContent=m);$("#imText").value=text;}
    catch(e){$("#imMsg").textContent="Datei konnte nicht gelesen werden: "+e.message;return;}
  }
  imRows=parseLines(text);
  $("#imMsg").textContent=imRows.length?imRows.length+" Zeilen erkannt – bitte prüfen und korrigieren":"Keine Songs erkannt";
  renderImRows();
};
$("#imSave").onclick=async()=>{
  const band=$("#imBand").value.trim(); if(!band){$("#imMsg").textContent="Bitte den Bandnamen eintragen";$("#imBand").focus();return;}
  const rows=imRows.filter(r=>r.t.trim()); if(!rows.length) return;
  const b=$("#imSave");b.disabled=true;$("#imMsg").textContent="Speichere im Archiv …";
  try{
    const id=await api("saveArchive",ADMIN_KEY,band,$("#imAnlass").value.trim(),rows.map(r=>({t:r.t,a:r.a})));
    let msg="Archiviert: "+band+" ("+rows.length+" Titel)";
    if($("#imToPool").checked){
      const pos=[];rows.forEach((r,i)=>{if(r.on)pos.push(i+1);});
      $("#imMsg").textContent="Übernehme in Vorschläge …";
      const r=await api("importFromArchive",ADMIN_KEY,id,pos);msg+=` · ${r.added} neu in den Vorschlägen`+(r.dup?`, ${r.dup} schon vorhanden`:"");
    }
    imRows=[];renderImRows();$("#imText").value="";$("#imFile").value="";$("#imBand").value="";$("#imAnlass").value="";
    await reloadKeepDialog(); $("#imMsg").textContent=msg; tab("arch");
    if($("#imToPool").checked) fillOpenBpms();
  }catch(e){$("#imMsg").textContent="Fehler: "+e.message;}
  finally{b.disabled=false;}
};
async function reloadKeepDialog(){const raw=await api("getData",ADMIN_KEY,me.token);const d=typeof raw==="string"?JSON.parse(raw):raw;lastLoad=Date.now();apply(d);}
function renderArchive(){
  const el=$("#archList");
  if(!archive.length){el.innerHTML='<p class="dlgnote">Noch keine Fremdsetlisten archiviert.</p>';return;}
  el.innerHTML=archive.map(a=>`<details class="arch" data-arch="${esc(a.id)}"><summary>${esc(a.band)} <small>${esc(a.anlass||"")} · ${a.rows.length} Titel · eingelesen ${a.at?new Date(a.at).toLocaleDateString("de-DE"):""}</small></summary><div class="body">
    <div class="tblwrap"><table class="imtbl"><thead><tr><th></th><th>#</th><th>Titel</th><th>Interpret</th><th></th></tr></thead><tbody>${a.rows.map(r=>`<tr class="${r.taken?"taken":""}"><td class="c">${r.taken?"":`<input type="checkbox" data-pick="${r.pos}" aria-label="${esc(r.t)} auswählen">`}</td><td>${r.pos}</td><td>${esc(r.t)}</td><td>${esc(r.a)}</td><td>${r.taken?'<span class="tagdone">übernommen</span>':""}</td></tr>`).join("")}</tbody></table></div>
    <div class="row"><button type="button" data-arch-del="${esc(a.id)}">Archiv löschen</button><span class="spacer"></span><button type="button" data-arch-all="${esc(a.id)}">Alle markieren</button><button type="button" class="primary" data-arch-imp="${esc(a.id)}">Markierte in Vorschläge übernehmen</button></div></div></details>`).join("");
}
$("#archList").addEventListener("click",async e=>{
  const all=e.target.closest("[data-arch-all]"),imp=e.target.closest("[data-arch-imp]"),del=e.target.closest("[data-arch-del]");
  if(all){all.closest(".arch").querySelectorAll("[data-pick]").forEach(c=>c.checked=true);return;}
  if(imp){
    const box=imp.closest(".arch"),pos=[...box.querySelectorAll("[data-pick]:checked")].map(c=>+c.dataset.pick);
    if(!pos.length){setStatus("Bitte zuerst Titel markieren");return;}
    imp.disabled=true;imp.textContent="Übernehme …";
    try{const r=await api("importFromArchive",ADMIN_KEY,imp.dataset.archImp,pos);await reloadKeepDialog();setStatus(`${r.added} Titel in die Vorschläge übernommen`+(r.dup?`, ${r.dup} waren schon vorhanden`:""));if(r.added)fillOpenBpms();}
    catch(err){setStatus("Übernahme fehlgeschlagen: "+err.message,true);imp.disabled=false;}
    return;
  }
  if(del){
    if(del.dataset.c!=="1"){del.dataset.c="1";del.textContent="Wirklich löschen?";setTimeout(()=>{del.dataset.c="";del.textContent="Archiv löschen";},4000);return;}
    try{await api("deleteArchive",ADMIN_KEY,del.dataset.archDel);await reloadKeepDialog();setStatus("Archiv gelöscht");}catch(err){setStatus("Löschen fehlgeschlagen: "+err.message,true);}
  }
});

// ---------- Start ----------
window.addEventListener("error",e=>setStatus("Fehler: "+(e.message||e),true));
window.addEventListener("unhandledrejection",e=>setStatus("Fehler: "+((e.reason&&e.reason.message)||e.reason),true));
isAdmin=!!ADMIN_KEY; loadMe();
load(false).then(()=>{ if(!isAdmin&&!me.name) askName(); });
})();

});
})();
