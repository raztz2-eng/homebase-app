import { useState, useEffect, useRef } from "react";
import { listenCol, saveDoc, deleteDocById } from "./firebase.js";

const GEMINI_KEY = "AIzaSyCl9eRbYNj8d5IGhCUkimDeCfSPbQwPVNs";

const CATS = [
  {id:"id",       he:"תעודות זהות",  icon:"🪪", color:"#6366f1"},
  {id:"passport", he:"דרכונים",      icon:"📘", color:"#06b6d4"},
  {id:"car",      he:"ביטוח רכב",    icon:"🚗", color:"#f59e0b"},
  {id:"health",   he:"ביטוח בריאות", icon:"❤️", color:"#ef4444"},
  {id:"property", he:"ביטוח דירה",   icon:"🏠", color:"#10b981"},
  {id:"pet",      he:"מסמכי קלי",    icon:"🐕", color:"#a855f7"},
  {id:"finance",  he:"פיננסי",       icon:"💰", color:"#f59e0b"},
  {id:"medical",  he:"רפואי",        icon:"🏥", color:"#ef4444"},
  {id:"work",     he:"עבודה",        icon:"💼", color:"#6366f1"},
  {id:"other",    he:"אחר",          icon:"📄", color:"#6b7280"},
];

let UID=500; const nid=()=>"doc"+String(++UID)+Date.now();

export default function Documents({ lang, theme }){
  const TH=theme||{bg:"#0f1117",card:"rgba(255,255,255,0.03)",cardBorder:"rgba(255,255,255,0.08)",text:"#e8eaf0",subText:"#6b7280",mutedText:"#4b5563",input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.12)",rowBg:"rgba(255,255,255,0.03)",header:"rgba(17,19,30,0.95)"};
  const CARD={background:TH.card,border:"1px solid "+TH.cardBorder,borderRadius:16,padding:20};
  const INP={background:TH.input,border:"1px solid "+TH.inputBorder,borderRadius:10,padding:"9px 12px",color:TH.text,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"};
  const BTN={background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"};
  const PILL=(a)=>({background:a?"rgba(99,102,241,0.2)":TH.input,border:a?"1px solid rgba(99,102,241,0.4)":"1px solid "+TH.cardBorder,borderRadius:20,padding:"5px 14px",color:a?"#a5b4fc":TH.subText,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"});

  const [docs,setDocs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filterC,setFilterC]=useState("all");
  const [search,setSearch]=useState("");
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [analyzing,setAnalyzing]=useState(false);
  const [aiResult,setAiResult]=useState("");
  const f0={name:"",cat:"id",owner:"",expiry:"",note:"",fileData:"",fileName:"",analyzed:""};
  const [form,setForm]=useState(f0);

  useEffect(()=>{
    const u=listenCol("documents",(data)=>{setDocs(data.sort((a,b)=>a.cat>b.cat?1:-1));setLoading(false);});
    return()=>u();
  },[]);

  const saveDoc2=async()=>{
    if(!form.name.trim())return;
    const id=editId||nid();
    await saveDoc("documents",id,{...form,id,name:form.name.trim()});
    setEditId(null);setShowForm(false);setForm(f0);setAiResult("");
  };
  const startEdit=(doc)=>{setEditId(doc.id);setForm({...doc});setAiResult(doc.analyzed||"");setShowForm(true);};
  const delDoc=async(id)=>deleteDocById("documents",id);
  const catInfo=(id)=>CATS.find(c=>c.id===id)||CATS[CATS.length-1];

  const filtered=docs.filter(d=>{
    if(filterC!=="all"&&d.cat!==filterC)return false;
    if(search&&!d.name.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const fileToB64=(file)=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});

  const handleFile=async(file)=>{const b64=await fileToB64(file);setForm(f=>({...f,fileData:b64,fileName:file.name}));};

  const analyzeAI=async()=>{
    if(!form.fileData)return;
    setAnalyzing(true);setAiResult("");
    try{
      const b64=form.fileData.split(",")[1],mime=form.fileData.split(";")[0].split(":")[1];
      const res=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+GEMINI_KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"נתח את המסמך הזה בעברית: 1) סוג המסמך 2) שם הבעלים 3) תאריך פקיעה 4) נקודות חשובות. תשובה קצרה."},{inline_data:{mime_type:mime,data:b64}}]}]})});
      const data=await res.json();
      const text=data.candidates?.[0]?.content?.parts?.[0]?.text||"לא ניתן לנתח";
      setAiResult(text);setForm(f=>({...f,analyzed:text}));
    }catch(e){setAiResult("שגיאה: "+e.message);}
    setAnalyzing(false);
  };

  const daysToExp=(exp)=>exp?Math.ceil((new Date(exp)-Date.now())/86400000):null;
  const expColor=(d)=>d===null?null:d<0?"#ef4444":d<30?"#ef4444":d<90?"#f59e0b":"#10b981";
  const expiring=docs.filter(d=>{const d2=daysToExp(d.expiry);return d2!==null&&d2<90;});

  if(loading)return(<div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,background:TH.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}><div style={{width:28,height:28,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>טוען...<style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>);

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,direction:"rtl",minHeight:"100vh",background:TH.bg,transition:"background .3s,color .3s"}}>
      {/* Header */}
      <div style={{background:TH.header,borderBottom:"1px solid "+TH.cardBorder,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📁</div>
          <div><div style={{fontSize:17,fontWeight:800,color:TH.text}}>מסמכים</div><div style={{fontSize:11,color:TH.subText}}>{docs.length} מסמכים · <span style={{color:"#10b981"}}>🔥 מסונכרן</span></div></div>
        </div>
        <button onClick={()=>{setShowForm(!showForm);setEditId(null);setForm(f0);setAiResult("");}} style={BTN}>+ הוסף מסמך</button>
      </div>

      <div style={{padding:"16px 20px",maxWidth:920,margin:"0 auto"}}>
        {/* Expiry alerts */}
        {expiring.length>0&&(
          <div style={{...CARD,marginBottom:16,borderColor:"rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.04)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#fca5a5",marginBottom:8}}>⚠️ מסמכים שפג/עומד לפוג תוקפם:</div>
            {expiring.map(d=>{const days=daysToExp(d.expiry);return(<div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{fontSize:12,color:TH.text}}>{catInfo(d.cat).icon} {d.name}</span><span style={{fontSize:11,fontWeight:700,color:days<0?"#ef4444":"#f59e0b"}}>{days<0?"פג תוקף!":"עוד "+days+" ימים"}</span></div>);})}
          </div>
        )}

        {/* Add/Edit form */}
        {showForm&&(
          <div style={{...CARD,marginBottom:18,borderColor:"rgba(99,102,241,0.3)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",marginBottom:12}}>{editId?"✏️ עריכה":"📄 מסמך חדש"}</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:11,color:TH.subText,marginBottom:3}}>שם המסמך</div><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="לדוגמה: תעודת זהות - רז" style={INP} autoFocus/></div>
              <div><div style={{fontSize:11,color:TH.subText,marginBottom:3}}>קטגוריה</div><select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={{...INP,appearance:"none"}}>{CATS.map(c=><option key={c.id} value={c.id} style={{background:TH.bg,color:TH.text}}>{c.icon} {c.he}</option>)}</select></div>
              <div><div style={{fontSize:11,color:TH.subText,marginBottom:3}}>בעל המסמך</div><input value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})} placeholder="Raz / Olga" style={INP}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:11,color:TH.subText,marginBottom:3}}>תאריך פקיעה</div><input type="date" value={form.expiry} onChange={e=>setForm({...form,expiry:e.target.value})} style={INP}/></div>
              <div><div style={{fontSize:11,color:TH.subText,marginBottom:3}}>הערות / מספר מסמך</div><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="מספר ת.ז, מספר פוליסה..." style={INP}/></div>
            </div>
            {/* File upload */}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:TH.subText,marginBottom:6}}>📎 העלאת קובץ</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <label style={{...BTN,display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",color:"#a5b4fc"}}>
                  📄 {form.fileName||"בחר קובץ"}
                  <input type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
                </label>
                {form.fileData&&<button onClick={analyzeAI} disabled={analyzing} style={{...BTN,padding:"7px 14px",fontSize:12,background:"linear-gradient(135deg,#10b981,#059669)"}}>{analyzing?"🤖 מנתח...":"🤖 נתח AI"}</button>}
              </div>
            </div>
            {aiResult&&<div style={{marginBottom:10,padding:10,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,fontSize:12,color:TH.text,lineHeight:1.6}}><span style={{color:"#10b981",fontWeight:700}}>✅ AI: </span>{aiResult}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveDoc2} style={BTN}>{editId?"עדכן":"שמור"}</button>
              <button onClick={()=>{setShowForm(false);setEditId(null);setAiResult("");}} style={{...BTN,background:TH.input,color:TH.subText}}>ביטול</button>
            </div>
          </div>
        )}

        {/* Search + filter */}
        <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
          <div style={{position:"relative",flex:1}}><span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:TH.subText,fontSize:13}}>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חיפוש מסמך..." style={{...INP,paddingRight:32}}/></div>
        </div>

        {/* Category pills */}
        <div style={{display:"flex",gap:5,marginBottom:16,overflowX:"auto",paddingBottom:3}}>
          <button onClick={()=>setFilterC("all")} style={PILL(filterC==="all")}>כל המסמכים</button>
          {CATS.map(c=><button key={c.id} onClick={()=>setFilterC(c.id)} style={PILL(filterC===c.id)}>{c.icon} {c.he}</button>)}
        </div>

        {/* Documents grid */}
        {filtered.length===0?(
          <div style={{...CARD,textAlign:"center",padding:50,color:TH.subText}}><div style={{fontSize:44,marginBottom:12}}>📁</div><div style={{fontSize:15,marginBottom:6}}>אין מסמכים עדיין</div><div style={{fontSize:12}}>לחץ "+ הוסף מסמך"</div></div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
            {filtered.map(doc=>{
              const cat=catInfo(doc.cat),days=daysToExp(doc.expiry),ec=expColor(days);
              return(
                <div key={doc.id} style={{...CARD,borderTop:"3px solid "+cat.color+"66"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:20}}>{cat.icon}</span>
                    <div style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:cat.color+"22",color:cat.color,border:"1px solid "+cat.color+"44",fontWeight:600}}>{cat.he}</div>
                    {doc.owner&&<div style={{fontSize:11,color:TH.subText,marginRight:"auto"}}>{doc.owner}</div>}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:5,color:TH.text}}>{doc.name}</div>
                  {doc.note&&<div style={{fontSize:11,color:TH.subText,marginBottom:6}}>📝 {doc.note}</div>}
                  {doc.analyzed&&<div style={{fontSize:10,color:TH.subText,marginBottom:6,padding:"5px 8px",background:"rgba(16,185,129,0.06)",borderRadius:7,lineHeight:1.4}}>🤖 {doc.analyzed.slice(0,90)}...</div>}
                  {doc.fileData&&<a href={doc.fileData} download={doc.fileName} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color:"#6366f1",textDecoration:"none",marginBottom:6}}>📎 {doc.fileName||"הורד"}</a>}
                  {doc.expiry&&<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}><span style={{fontSize:10,color:TH.subText}}>תוקף:</span><span style={{fontSize:11,fontWeight:700,color:ec||TH.subText}}>{doc.expiry} {days!==null&&<span style={{fontSize:10}}>({days<0?"פג!":days<30?"בקרוב":"עוד "+days+"י"})</span>}</span></div>}
                  <div style={{display:"flex",gap:5,justifyContent:"flex-end"}}>
                    <button onClick={()=>startEdit(doc)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"4px 10px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>delDoc(doc.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"4px 10px",color:"#fca5a5",fontSize:11,cursor:"pointer"}}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}select option{background:${TH.bg}!important;color:${TH.text}!important;}`}</style>
    </div>
  );
             }
