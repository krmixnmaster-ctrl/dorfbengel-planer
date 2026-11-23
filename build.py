# Baut planer.js (alles für die Oberfläche) + die schlanke Index.html für Apps Script
import re, json
css=open('src/styles.css.html').read().replace('<style>','').replace('</style>','')
css=css.replace('.tagdone{','.credit{font-size:11px;color:var(--muted);text-align:center;margin:0 0 6px}\n.tagdone{')
body=open('src/body.html').read().replace('<body>','',1)+'<p class="credit">BPM-Daten: Deezer</p>'
pdf=open('src/pdf.js').read()
app=open('src/app.js').read().replace('/*PDFCODE*/',pdf)
boot='''/* Dorfbengel Setlist-Planer – Oberfläche. Wird von der Google-Web-App geladen. Enthält keine Daten. */
(function(){
var css=%s, html=%s;
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
var fl=document.createElement("link");fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap";document.head.appendChild(fl);
var b=document.getElementById("boot");if(b)b.remove();
document.body.insertAdjacentHTML("beforeend",html);
function ld(src){return new Promise(function(r){var s=document.createElement("script");s.src=src;s.onload=r;s.onerror=r;document.head.appendChild(s);});}
Promise.all([ld("https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js"),ld("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")]).then(function(){
%s
});
})();
'''%(json.dumps(css,ensure_ascii=False),json.dumps(body,ensure_ascii=False),app)
open('planer.js','w').write(boot)
shell='''<!DOCTYPE html>
<html lang="de">
<head>
<base target="_top">
<meta charset="utf-8">
<title>Dorfbengel Setlist-Planer</title>
</head>
<body style="margin:0;font-family:sans-serif">
<p id="boot" style="padding:20px;color:#666">Lade Setlist-Planer …</p>
<script>
window.__ADMIN_KEY__ = <?!= JSON.stringify(adminKey) ?>;
(function(){
  var s=document.createElement("script");
  s.src="https:\\/\\/krmixnmaster-ctrl.github.io/dorfbengel-planer/planer.js?v="+Date.now();
  s.onerror=function(){document.getElementById("boot").textContent="Programm konnte nicht geladen werden. Bitte Seite neu laden.";};
  document.body.appendChild(s);
})();
</script>
</body>
</html>
'''
open('src/Index.html','w').write(shell)
assert '//' not in shell[shell.index('<script>'):].replace('https:\\/\\/','')
print(len(boot))
