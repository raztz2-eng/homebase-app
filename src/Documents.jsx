import { useState, useEffect, useRef } from "react";
import { listenCol, saveDoc, deleteDocById } from "./firebase.js";

const GEMINI_KEY = "AIzaSyCl9eRbYNj8d5IGhCUkimDeCfSPbQwPVNs";

const CATS = [
  {id:"id",       he:"תעודות זהות",      icon:"🪪", color:"#6366f1"},
  {id:"passport", he:"דרכונים",          icon:"📘", color:"#06b6d4"},
  {id:"car",      he:"ביטוח רכב",        icon:"🚗", color:"#f59e0b"},
  {id:"health",   he:"ביטוח בריאות",     icon:"❤️", color:"#ef4444"},
  {id:"property", he:"ביטוח דירה",       icon:"🏠", color:"#10b981"},
  {id:"pet",      he:"מסמכי קלי",        icon:"🐕", color:"#a855f7"},
  {id:"finance",  he:"פיננסי",           icon:"💰", color:"#f59e0b"},
  {id:"medical",  he:"רפואי",            icon:"🏥", color:"#ef4444"},
  {id:"work",     he:"עבודה",            icon:"💼", color:"#6366f1"},
  {id:"other",    he:"אחר",              icon:"📄", color:"#6b7280"},
];

const S = {
  card:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20},
  inp:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"9px 12px",color:"#e8eaf0",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"},
  btn:{background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"},
  pill:(a)=>({background:a?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)",border:a?"1px solid rgba(99,102,241,0.4)":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 14px",color:a?"#a5b4fc":"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}),
};

let UID=500; const nid=()=>"doc"+String(++UID)+Date.now();

export default function Documents({ lang }) {
  const [docs,     setDocs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filterC,  setFilterC]  = useState("all");
  const [search,   setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [analyzing,setAnalyzing]= useState(false);
  const [aiResult, setAiResult] = useState("");
  const f0 = {name:"",cat:"id",owner:"",expiry:"",note:"",fileData:"",fileName:"",analyzed:""};
  const [form, setForm] = useState(f0);

  useEffect(()=>{
    const unsub = listenCol("documents",(data)=>{ setDocs(data.sort((a,b)=>a.cat>b.cat?1:-1)); setLoading(false); });
    return ()=>unsub();
  },[]);

  const saveDocument = async () => {
    if (!form.name.trim()) return;
    const id = editId || nid();
    await saveDoc("documents", id, {...form, id, name:form.name.trim()});
    setEditId(null); setShowForm(false); setForm(f0); setAiResult("");
  };

  const startEdit = (doc) => { setEditId(doc.id); setForm({...doc}); setAiResult(doc.analyzed||""); setShowForm(true); };
  const delDoc    = async (id) => deleteDocById("documents", id);
  const catInfo   = (id) => CATS.find(c=>c.id===id) || CATS[CATS.length-1];

  const filtered = docs.filter(d => {
    if (filterC!=="all" && d.cat!==filterC) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const fileToB64 = (file) => new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });

  const handleFile = async (file) => {
    const b64 = await fileToB64(file);
    setForm(f=>({...f, fileData:b64, fileName:file.name}));
  };

  const analyzeAI = async () => {
    if (!form.fileData) return;
    setAnalyzing(true); setAiResult("");
    try {
      const b64 = form.fileData.split(",")[1];
      const mime = form.fileData.split(";")[0].split(":")[1];
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+GEMINI_KEY,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({contents:[{parts:[
          {text:"נתח את המסמך הזה בעברית: 1) סוג המסמך 2) שם הבעלים 3) תאריך פקיעה (אם יש) 4) נקודות חשובות. תשובה קצרה."},
          {inline_data:{mime_type:mime,data:b64}}
        ]}]}),
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא ניתן לנתח";
      setAiResult(text);
      setForm(f=>({...f, analyzed:text}));
    } catch(e) { setAiResult("שגיאה: "+e.message); }
    setAnalyzing(false);
  };

  const daysToExp = (exp) => exp ? Math.ceil((new Date(exp)-Date.now())/86400000) : null;
  const expColor  = (d) => d===null?null:d<0?"#ef4444":d<30?"#ef4444":d<90?"#f59e0b":"#10b981";

  if (loading) return (
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",background:"#0f1117",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:14,fontSize:16}}>
      <div style={{width:32,height:32,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      טוען מסמכים...
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  const expiring = docs.filter(d=>{ const days=daysToExp(d.expiry); return days!==null && days<90; });

  return (
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",direction:"rtl",minHeight:"100vh",background:"#0f1117"}}>
      {/* Header */}
      <div style={{background:"rgba(17,19,30,0.95)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📁</div>
          <div>
            <div style={{fontSize:19,fontWeight:800}}>מסמכים</div>
            <div style={{fontSize:11,color:"#6b7280"}}>{docs.length} מסמכים · <span style={{color:"#10b981"}}>🔥 מסונכרן</span></div>
          </div>
        </div>
        <button onClick={()=>{ setShowForm(!showForm); setEditId(null); setForm(f0); setAiResult(""); }} style={S.btn}>+ הוסף מסמך</button>
      </div>

      <div style={{padding:"18px 22px",maxWidth:920,margin:"0 auto"}}>

        {/* Expiry alerts */}
        {expiring.length>0 && (
          <div style={{...S.card,marginBottom:18,borderColor:"rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.04)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fca5a5",marginBottom:10}}>⚠️ מסמכים שפג/עומד לפוג תוקפם:</div>
            {expiring.map(d=>{
              const days=daysToExp(d.expiry);
              return(
                <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize:13}}>{catInfo(d.cat).icon} {d.name}</span>
                  <span style={{fontSize:12,fontWeight:700,color:days<0?"#ef4444":"#f59e0b"}}>{days<0?"פג תוקף!":"עוד "+days+" ימים"}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div style={{...S.card,marginBottom:20,borderColor:"rgba(99,102,241,0.3)"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#a5b4fc",marginBottom:14}}>{editId?"✏️ עריכת מסמך":"📄 מסמך חדש"}</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>שם המסמך</div><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="לדוגמה: תעודת זהות - רז" style={S.inp} autoFocus/></div>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>קטגוריה</div><select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={{...S.inp,appearance:"none"}}>{CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.he}</option>)}</select></div>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>בעל המסמך</div><input value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})} placeholder="Raz / Olga / כולם" style={S.inp}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך פקיעה</div><input type="date" value={form.expiry} onChange={e=>setForm({...form,expiry:e.target.value})} style={S.inp}/></div>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>הערות / מספר מסמך</div><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="מספר ת.ז, מספר פוליסה..." style={S.inp}/></div>
            </div>
            {/* File upload + AI */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>📎 העלאת קובץ</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                <label style={{...S.btn,display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",color:"#a5b4fc"}}>
                  📄 {form.fileName||"בחר קובץ"}
                  <input type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
                </label>
                {form.fileData && (
                  <button onClick={analyzeAI} disabled={analyzing} style={{...S.btn,padding:"7px 14px",fontSize:12,background:"linear-gradient(135deg,#10b981,#059669)"}}>
                    {analyzing?"🤖 מנתח...":"🤖 נתח עם AI"}
                  </button>
                )}
              </div>
            </div>
            {aiResult && (
              <div style={{marginBottom:12,padding:12,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,fontSize:12,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                <div style={{fontSize:11,color:"#10b981",fontWeight:700,marginBottom:6}}>✅ סיכום AI:</div>
                {aiResult}
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveDocument} style={S.btn}>{editId?"עדכן":"שמור"}</button>
              <button onClick={()=>{setShowForm(false);setEditId(null);setAiResult("");}} style={{...S.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
          <div style={{position:"relative",flex:1}}>
            <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:"#6b7280",fontSize:13}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="חיפוש מסמך..." style={{...S.inp,paddingRight:32}}/>
          </div>
        </div>

        {/* Category pills */}
        <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
          <button onClick={()=>setFilterC("all")} style={S.pill(filterC==="all")}>כל המסמכים</button>
          {CATS.map(c=><button key={c.id} onClick={()=>setFilterC(c.id)} style={S.pill(filterC===c.id)}>{c.icon} {c.he}</button>)}
        </div>

        {/* Grid */}
        {filtered.length===0 ? (
          <div style={{...S.card,textAlign:"center",padding:50,color:"#6b7280"}}>
            <div style={{fontSize:48,marginBottom:14}}>📁</div>
            <div style={{fontSize:16,marginBottom:8}}>אין מסמכים עדיין</div>
            <div style={{fontSize:13}}>לחץ "+ הוסף מסמך"</div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
            {filtered.map(doc=>{
              const cat=catInfo(doc.cat), days=daysToExp(doc.expiry), ec=expColor(days);
              return(
                <div key={doc.id} style={{...S.card,borderTop:"3px solid "+cat.color+"66"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <span style={{fontSize:22}}>{cat.icon}</span>
                    <div style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:cat.color+"22",color:cat.color,border:"1px solid "+cat.color+"44",fontWeight:600}}>{cat.he}</div>
                    {doc.owner&&<div style={{fontSize:11,color:"#6b7280",marginRight:"auto"}}>{doc.owner}</div>}
                  </div>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{doc.name}</div>
                  {doc.note&&<div style={{fontSize:12,color:"#9ca3af",marginBottom:8}}>📝 {doc.note}</div>}
                  {doc.analyzed&&<div style={{fontSize:11,color:"#6b7280",marginBottom:8,padding:"6px 10px",background:"rgba(16,185,129,0.06)",borderRadius:8,lineHeight:1.5}}>🤖 {doc.analyzed.slice(0,100)}...</div>}
                  {doc.fileData&&<a href={doc.fileData} download={doc.fileName} style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,color:"#6366f1",textDecoration:"none",marginBottom:8}}>📎 {doc.fileName||"הורד"}</a>}
                  {doc.expiry&&(
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                      <span style={{fontSize:11,color:"#6b7280"}}>תוקף:</span>
                      <span style={{fontSize:12,fontWeight:700,color:ec||"#6b7280"}}>{doc.expiry} {days!==null&&<span style={{fontSize:10}}>({days<0?"פג!":days<30?"בקרוב":"עוד "+days+" י"})</span>}</span>
                    </div>
                  )}
                  <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                    <button onClick={()=>startEdit(doc)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"4px 10px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>✏️ ערוך</button>
                    <button onClick={()=>delDoc(doc.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:8,padding:"4px 10px",color:"#fca5a5",fontSize:11,cursor:"pointer"}}>🗑 מחק</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
   }
