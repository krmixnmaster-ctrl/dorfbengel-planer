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
/*PDFCODE*/
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
