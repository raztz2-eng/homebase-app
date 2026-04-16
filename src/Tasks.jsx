import { useState, useMemo, useEffect } from "react";
import { listenCol, saveDoc, deleteDocById, COL } from "./firebase.js";

const PC={high:"#ef4444",medium:"#f59e0b",low:"#6b7280"};
const PL={he:{high:"דחוף",medium:"בינוני",low:"נמוך"},en:{high:"High",medium:"Medium",low:"Low"}};
const PCOL={Raz:"#6366f1",Olga:"#06b6d4",Both:"#10b981"};
const RECUR=[{id:"none",he:"חד פעמי",en:"One-time"},{id:"daily",he:"כל יום",en:"Daily"},{id:"weekly",he:"שבועי",en:"Weekly"},{id:"biweekly",he:"כל שבועיים",en:"Biweekly"},{id:"monthly",he:"חודשי",en:"Monthly"},{id:"quarterly",he:"רבעוני",en:"Quarterly"},{id:"yearly",he:"שנתי",en:"Yearly"}];
const CATS=[{id:"bills",he:"חשבונות",en:"Bills",icon:"💡"},{id:"home",he:"בית",en:"Home",icon:"🏠"},{id:"car",he:"רכב",en:"Car",icon:"🚗"},{id:"kids",he:"ילדים",en:"Kids",icon:"👶"},{id:"finance",he:"כספים",en:"Finance",icon:"💰"},{id:"work",he:"עבודה",en:"Work",icon:"💼"},{id:"personal",he:"אישי",en:"Personal",icon:"🙋"},{id:"other",he:"אחר",en:"Other",icon:"📋"}];
let UID=200;const nid=()=>"t"+String(++UID)+Date.now();
const tod=()=>new Date().toISOString().slice(0,10);
const du=(d)=>d?Math.ceil((new Date(d)-new Date(tod()))/86400000):null;
const ci=(id)=>CATS.find(c=>c.id===id)||CATS[CATS.length-1];
const nd=(last,rec)=>{if(!last||rec==="none")return null;const d=new Date(last);const a={daily:1,weekly:7,biweekly:14,monthly:30,quarterly:90,yearly:365};d.setDate(d.getDate()+(a[rec]||0));return d.toISOString().slice(0,10);};

// Confetti
function Confetti({show}){
  if(!show)return null;
  const p=Array.from({length:50},(_,i)=>({id:i,x:Math.random()*100,c:["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#a855f7"][i%6],s:5+Math.random()*7,dl:Math.random()*0.4,dr:1.4+Math.random()*0.8}));
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>{p.map(x=><div key={x.id} style={{position:"absolute",top:"-20px",left:x.x+"%",width:x.s,height:x.s,background:x.c,borderRadius:x.s>9?"50%":"2px",animation:`cf ${x.dr}s ${x.dl}s ease-in forwards`}}/>)}<style>{`@keyframes cf{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style></div>);
}

export default function Tasks({lang,onNavigate,onAddToCalendar,theme}){
  const isRTL=lang==="he";
  const TH=theme||{bg:"#0f1117",card:"rgba(255,255,255,0.03)",cardBorder:"rgba(255,255,255,0.08)",text:"#e8eaf0",subText:"#6b7280",mutedText:"#4b5563",input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.12)",rowBg:"rgba(255,255,255,0.03)",header:"rgba(17,19,30,0.95)"};
  const isDark=TH.bg==="#0f1117";

  const [tasks,setTasks]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [showDone,setShowDone]=useState(false);
  const [confetti,setConfetti]=useState(false);

  // Dropdown filters
  const [viewSel,setViewSel]=useState("pending");   // pending/overdue/recurring/done
  const [personSel,setPersonSel]=useState("all");
  const [catSel,setCatSel]=useState("all");

  const ef={he:"",cat:"bills",priority:"medium",person:"Both",recur:"none",dueDate:"",note:""};
  const [form,setForm]=useState(ef);
  const fld=(f)=>setForm(p=>({...p,...f}));

  useEffect(()=>{const u=listenCol(COL.tasks,d=>{setTasks(d);setLoading(false);});return()=>u();},[]);

  const overdueCnt=useMemo(()=>tasks.filter(t=>!t.done&&du(t.dueDate)!==null&&du(t.dueDate)<0).length,[tasks]);
  const doneCnt=useMemo(()=>tasks.filter(t=>t.done).length,[tasks]);

  const filtered=useMemo(()=>tasks.filter(t=>{
    if(!showDone&&t.done)return false;
    if(viewSel==="pending"&&t.done)return false;
    if(viewSel==="overdue"&&(t.done||du(t.dueDate)===null||du(t.dueDate)>=0))return false;
    if(viewSel==="recurring"&&t.recur==="none")return false;
    if(viewSel==="done"&&!t.done)return false;
    if(personSel!=="all"&&t.person!==personSel&&t.person!=="Both")return false;
    if(catSel!=="all"&&t.cat!==catSel)return false;
    return true;
  }).sort((a,b)=>{
    const p={high:0,medium:1,low:2};
    if(p[a.priority]!==p[b.priority])return p[a.priority]-p[b.priority];
    return(du(a.dueDate)??999)-(du(b.dueDate)??999);
  }),[tasks,viewSel,personSel,catSel,showDone]);

  const markDone=async(t)=>{
    const n=t.recur!=="none"?nd(tod(),t.recur):t.dueDate;
    await saveDoc(COL.tasks,t.id,{done:t.recur==="none",lastDone:tod(),dueDate:t.recur!=="none"?n:t.dueDate});
    if(t.recur==="none"){setConfetti(true);setTimeout(()=>setConfetti(false),2200);}
  };
  const del=async(id)=>deleteDocById(COL.tasks,id);
  const save=async()=>{
    if(!form.he.trim())return;
    const id=editId||nid();
    await saveDoc(COL.tasks,id,{...form,id,he:form.he.trim(),en:form.he.trim(),done:false,lastDone:""});
    setShowForm(false);setEditId(null);setForm(ef);
  };
  const startEdit=(t)=>{setForm({he:t.he,cat:t.cat||"bills",priority:t.priority||"medium",person:t.person||"Both",recur:t.recur||"none",dueDate:t.dueDate||"",note:t.note||""});setEditId(t.id);setShowForm(true);};

  // Styles
  const INP={background:TH.input,border:"1px solid "+TH.inputBorder,borderRadius:10,padding:"10px 12px",color:TH.text,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"};
  const SEL={...INP,appearance:"none",cursor:"pointer"};
  const BTN=(bg,col="#fff")=>({background:bg,border:"none",borderRadius:10,padding:"10px 18px",color:col,fontSize:13,fontWeight:700,cursor:"pointer"});
  const CHIP=(c)=>({fontSize:11,padding:"2px 8px",borderRadius:20,background:c+"22",color:c,border:"1px solid "+c+"44",fontWeight:600,whiteSpace:"nowrap",flexShrink:0});
  const DDSEL={...SEL,padding:"7px 10px",fontSize:12,borderRadius:8,width:"auto",minWidth:90};

  if(loading)return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,background:TH.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
      <div style={{width:28,height:28,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      {isRTL?"טוען...":"Loading..."}
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,direction:isRTL?"rtl":"ltr",minHeight:"100vh",background:TH.bg,transition:"background .3s"}}>
      <Confetti show={confetti}/>

      {/* ── Header ── */}
      <div style={{background:isDark?"rgba(17,19,30,0.97)":TH.header,borderBottom:"1px solid "+TH.cardBorder,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,position:"sticky",top:0,zIndex:30}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>✓</div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:TH.text}}>{isRTL?"משימות":"Tasks"}</div>
            {/* Show overdue alert ONLY if there are overdue tasks */}
            {overdueCnt>0
              ?<div style={{fontSize:11,color:"#ef4444",fontWeight:700}}>⚠ {overdueCnt} {isRTL?"באיחור":"overdue"}</div>
              :<div style={{fontSize:11,color:"#10b981"}}>✓ {isRTL?"הכל תקין":"All good"}</div>
            }
          </div>
        </div>
        {/* + Add button prominent on right */}
        <button onClick={()=>{setForm(ef);setEditId(null);setShowForm(!showForm);}} style={{...BTN("linear-gradient(135deg,#6366f1,#06b6d4)"),borderRadius:12,padding:"9px 16px",display:"flex",alignItems:"center",gap:6,fontSize:14}}>
          <span style={{fontSize:18,lineHeight:1}}>{showForm?"✕":"+"}</span>
          {isRTL?(showForm?"סגור":"משימה"):(showForm?"Close":"Task")}
        </button>
      </div>

      <div style={{padding:"12px 14px",maxWidth:700,margin:"0 auto"}}>

        {/* ── Add / Edit Form ── */}
        {showForm&&(
          <div style={{background:TH.card,border:"1px solid rgba(99,102,241,0.35)",borderRadius:16,padding:16,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",marginBottom:12}}>{editId?(isRTL?"✏️ עריכה":"✏️ Edit"):(isRTL?"➕ משימה חדשה":"➕ New Task")}</div>
            {/* Task name */}
            <input value={form.he} onChange={e=>fld({he:e.target.value})} placeholder={isRTL?"שם המשימה...":"Task name..."} style={{...INP,marginBottom:10,fontSize:15}} autoFocus/>
            {/* Row 1 */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"עדיפות":"Priority"}</div>
                <select value={form.priority} onChange={e=>fld({priority:e.target.value})} style={{...SEL,color:TH.text}}>
                  {["high","medium","low"].map(p=><option key={p} value={p} style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{PL[lang][p]}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"תאריך יעד":"Due date"}</div>
                <input type="date" value={form.dueDate} onChange={e=>fld({dueDate:e.target.value})} style={{...INP,color:TH.text}}/>
              </div>
            </div>
            {/* Row 2 */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"קטגוריה":"Category"}</div>
                <select value={form.cat} onChange={e=>fld({cat:e.target.value})} style={{...SEL,color:TH.text}}>
                  {CATS.map(c=><option key={c.id} value={c.id} style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{c.icon} {isRTL?c.he:c.en}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"אחראי":"Who"}</div>
                <select value={form.person} onChange={e=>fld({person:e.target.value})} style={{...SEL,color:TH.text}}>
                  {["Raz","Olga",isRTL?"שניהם":"Both"].map(p=><option key={p} style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{p}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"תדירות":"Repeat"}</div>
                <select value={form.recur} onChange={e=>fld({recur:e.target.value})} style={{...SEL,color:TH.text}}>
                  {RECUR.map(r=><option key={r.id} value={r.id} style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{isRTL?r.he:r.en}</option>)}
                </select>
              </div>
            </div>
            {/* Note */}
            <input value={form.note} onChange={e=>fld({note:e.target.value})} onKeyDown={e=>e.stopPropagation()} placeholder={isRTL?"הערה קצרה (אופציונלי)":"Short note (optional)"} style={{...INP,marginBottom:10,fontSize:13}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={save} style={BTN("linear-gradient(135deg,#6366f1,#06b6d4)")}>{isRTL?"שמור":"Save"}</button>
              <button onClick={()=>{setShowForm(false);setEditId(null);}} style={BTN(TH.input,TH.subText)}>{isRTL?"ביטול":"Cancel"}</button>
            </div>
          </div>
        )}

        {/* ── Compact filter bar ── */}
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          {/* View dropdown */}
          <select value={viewSel} onChange={e=>setViewSel(e.target.value)} style={{...DDSEL,color:TH.text,background:TH.input,borderColor:viewSel!=="pending"?"#6366f1":TH.inputBorder}}>
            <option value="pending" style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{isRTL?"⏳ ממתינות":"⏳ Pending"}</option>
            <option value="overdue" style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{isRTL?"🔴 באיחור":"🔴 Overdue"}{overdueCnt>0?" ("+overdueCnt+")":""}</option>
            <option value="recurring" style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{isRTL?"🔄 מחזוריות":"🔄 Recurring"}</option>
            <option value="done" style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{isRTL?"✅ הושלמו":"✅ Done"}</option>
          </select>

          {/* Person dropdown */}
          <select value={personSel} onChange={e=>setPersonSel(e.target.value)} style={{...DDSEL,color:TH.text,background:TH.input,borderColor:personSel!=="all"?"#06b6d4":TH.inputBorder}}>
            <option value="all" style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{isRTL?"👥 כולם":"👥 Everyone"}</option>
            <option value="Raz" style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>👤 Raz</option>
            <option value="Olga" style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>👤 Olga</option>
          </select>

          {/* Category dropdown */}
          <select value={catSel} onChange={e=>setCatSel(e.target.value)} style={{...DDSEL,color:TH.text,background:TH.input,borderColor:catSel!=="all"?"#a855f7":TH.inputBorder}}>
            <option value="all" style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{isRTL?"📋 כל הקטגוריות":"📋 All"}</option>
            {CATS.map(c=><option key={c.id} value={c.id} style={{background:isDark?"#1f2937":"#fff",color:TH.text}}>{c.icon} {isRTL?c.he:c.en}</option>)}
          </select>

          {/* Show done toggle */}
          {doneCnt>0&&viewSel!=="done"&&(
            <button onClick={()=>setShowDone(!showDone)} style={{background:showDone?"rgba(16,185,129,0.15)":TH.input,border:"1px solid "+(showDone?"rgba(16,185,129,0.4)":TH.inputBorder),borderRadius:8,padding:"6px 10px",color:showDone?"#6ee7b7":TH.subText,fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>
              ✅ {doneCnt}
            </button>
          )}

          {/* Count */}
          <div style={{marginRight:"auto",fontSize:12,color:TH.subText}}>{filtered.length} {isRTL?"משימות":"tasks"}</div>
        </div>

        {/* ── Task list ── */}
        {filtered.length===0
          ?<div style={{background:TH.card,border:"1px solid "+TH.cardBorder,borderRadius:16,padding:40,textAlign:"center",color:TH.subText}}>
            <div style={{fontSize:32,marginBottom:8}}>🎉</div>
            <div style={{fontSize:15}}>{isRTL?"אין משימות!":"No tasks!"}</div>
          </div>
          :filtered.map(t=>{
            const d=du(t.dueDate);
            const ov=d!==null&&d<0;
            const cat=ci(t.cat);
            const pCol=PCOL[t.person]||PCOL.Both;
            return(
              <div key={t.id} style={{background:t.done?"rgba(16,185,129,0.04)":ov?"rgba(239,68,68,0.04)":TH.rowBg||TH.card,border:"1px solid "+(t.done?"rgba(16,185,129,0.15)":ov?"rgba(239,68,68,0.2)":TH.cardBorder),borderRadius:14,padding:"12px 14px",marginBottom:8,[isRTL?"borderRight":"borderLeft"]:"3px solid "+(t.done?"#10b981":PC[t.priority]||"#6b7280")}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flexDirection:isRTL?"row-reverse":"row"}}>
                  {/* Checkbox */}
                  <div onClick={()=>!t.done&&markDone(t)} style={{width:22,height:22,borderRadius:7,flexShrink:0,background:t.done?"#10b981":"transparent",border:t.done?"2px solid #10b981":"2px solid "+(TH.mutedText||"#4b5563"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",cursor:t.done?"default":"pointer"}}>{t.done?"✓":""}</div>

                  {/* Task name + info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:t.done?(TH.mutedText||"#4b5563"):TH.text,textDecoration:t.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {cat.icon} {t.he}
                    </div>
                    {/* Compact meta row */}
                    <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"nowrap",overflow:"hidden",flexDirection:isRTL?"row-reverse":"row",alignItems:"center"}}>
                      <span style={CHIP(PC[t.priority]||"#6b7280")}>{PL[lang][t.priority]}</span>
                      <span style={CHIP(pCol)}>{t.person==="Both"?(isRTL?"שניהם":"Both"):t.person}</span>
                      {t.recur&&t.recur!=="none"&&<span style={CHIP("#f59e0b")}>🔄</span>}
                      {t.note&&<span style={{fontSize:11,color:TH.subText,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>📝 {t.note}</span>}
                    </div>
                  </div>

                  {/* Right side: date + actions */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    {t.dueDate&&!t.done&&(
                      <div style={{fontSize:11,fontWeight:700,color:ov?"#ef4444":d===0?"#f59e0b":d<=3?"#06b6d4":(TH.subText||"#6b7280")}}>
                        {ov?"-"+Math.abs(d)+"d":d===0?(isRTL?"היום":"Today"):"+"+d+"d"}
                      </div>
                    )}
                    {!t.done&&(
                      <div style={{display:"flex",gap:4}}>
                        {t.dueDate&&onAddToCalendar&&(
                          <button onClick={()=>onAddToCalendar(t)} title="Google Calendar" style={{background:"rgba(66,133,244,0.12)",border:"1px solid rgba(66,133,244,0.3)",borderRadius:7,padding:"3px 7px",color:"#93c5fd",fontSize:12,cursor:"pointer"}}>📅</button>
                        )}
                        <button onClick={()=>startEdit(t)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 7px",color:"#a5b4fc",fontSize:12,cursor:"pointer"}}>✏️</button>
                        <button onClick={()=>del(t.id)} style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 7px",color:"#fca5a5",fontSize:12,cursor:"pointer"}}>🗑</button>
                        <button onClick={()=>markDone(t)} style={{background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:7,padding:"3px 9px",color:"#6ee7b7",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
      <style>{"select option{background:inherit;}"}</style>
    </div>
  );
  }
