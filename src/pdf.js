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
