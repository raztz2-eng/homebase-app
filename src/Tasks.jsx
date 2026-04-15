import { useState, useMemo, useEffect, useRef } from "react";
import { listenCol, saveDoc, deleteDocById, COL } from "./firebase.js";

const PERSON_COLORS={Raz:"#6366f1",Olga:"#06b6d4",Both:"#10b981"};
const RECUR=[
  {id:"none",he:"חד פעמי",en:"One-time"},{id:"daily",he:"כל יום",en:"Daily"},
  {id:"weekly",he:"שבועי",en:"Weekly"},{id:"biweekly",he:"כל שבועיים",en:"Biweekly"},
  {id:"monthly",he:"חודשי",en:"Monthly"},{id:"bimonthly",he:"כל חודשיים",en:"Bimonthly"},
  {id:"quarterly",he:"רבעוני",en:"Quarterly"},{id:"yearly",he:"שנתי",en:"Yearly"},
];
const CATS=[
  {id:"bills",he:"חשבונות",en:"Bills",icon:"💡"},
  {id:"home",he:"בית",en:"Home",icon:"🏠"},
  {id:"car",he:"רכב",en:"Car",icon:"🚗"},
  {id:"kids",he:"ילדים",en:"Kids",icon:"👶"},
  {id:"finance",he:"כספים",en:"Finance",icon:"💰"},
  {id:"work",he:"עבודה",en:"Work",icon:"💼"},
  {id:"personal",he:"אישי",en:"Personal",icon:"🙋"},
  {id:"other",he:"אחר",en:"Other",icon:"📋"},
];
const PC={high:"#ef4444",medium:"#f59e0b",low:"#6b7280"};
const PL={he:{high:"דחוף",medium:"בינוני",low:"נמוך"},en:{high:"High",medium:"Medium",low:"Low"}};
let UID=200;const nid=()=>"t"+String(++UID)+Date.now();
const tod=()=>new Date().toISOString().slice(0,10);
const du=(d)=>d?Math.ceil((new Date(d)-new Date(tod()))/86400000):null;
const uc=(d)=>d===null?null:d<=0?"#ef4444":d<=3?"#f59e0b":d<=7?"#06b6d4":"#6b7280";
const rl=(id,l)=>RECUR.find(r=>r.id===id)?.[l]||id;
const ci=(id)=>CATS.find(c=>c.id===id)||CATS[CATS.length-1];
const nd=(last,rec)=>{if(!last||rec==="none")return null;const d=new Date(last);const a={daily:1,weekly:7,biweekly:14,monthly:30,bimonthly:60,quarterly:90,yearly:365};d.setDate(d.getDate()+(a[rec]||0));return d.toISOString().slice(0,10);};
const toGCal=(t)=>{if(!t.dueDate)return;const d=t.dueDate.replace(/-/g,"");const url="https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(t.he||t.en||"משימה")+"&dates="+d+"/"+d+"&details="+encodeURIComponent((t.note||"")+" | HomeBase");window.open(url,"_blank");};

function Confetti({show}){
  if(!show)return null;
  const p=Array.from({length:60},(_,i)=>({id:i,x:Math.random()*100,color:["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#a855f7","#ec4899"][i%7],sz:6+Math.random()*8,dl:Math.random()*0.5,dr:1.5+Math.random()}));
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>{p.map(x=>(<div key={x.id} style={{position:"absolute",top:"-20px",left:x.x+"%",width:x.sz,height:x.sz,background:x.color,borderRadius:x.sz>10?"50%":"2px",animation:"cf "+x.dr+"s "+x.dl+"s ease-in forwards"}}/>))}<style>{"@keyframes cf{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}"}</style></div>);
}

function TaskForm({form,setForm,editId,save,cancel,lang,th}){
  const isRTL=lang==="he";
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const SI={background:th?th.input:"rgba(255,255,255,0.05)",border:"1px solid "+(th?th.inputBorder:"rgba(255,255,255,0.12)"),borderRadius:10,padding:"9px 12px",color:th?th.text:"#e8eaf0",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"};
  const SS={...SI,appearance:"none"};
  return(
    <div style={{background:th?th.card:"rgba(255,255,255,0.03)",border:"1px solid "+(th?th.cardBorder:"rgba(99,102,241,0.3)"),borderRadius:16,padding:20,marginBottom:20}}>
      <div style={{fontSize:14,fontWeight:700,color:"#a5b4fc",marginBottom:14}}>{editId?(isRTL?"עריכה":"Edit"):(isRTL?"משימה חדשה":"New Task")}</div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,color:th?th.subText:"#6b7280",marginBottom:4}}>{isRTL?"שם המשימה":"Task name"}</div>
          <input value={form.he} onChange={e=>upd("he",e.target.value)} placeholder={isRTL?"לדוגמה: תשלום ארנונה":"e.g. Pay bill"} style={SI} autoFocus/>
        </div>
        <div><div style={{fontSize:11,color:th?th.subText:"#6b7280",marginBottom:4}}>{isRTL?"קטגוריה":"Category"}</div>
          <select value={form.cat} onChange={e=>upd("cat",e.target.value)} style={SS}>
            {CATS.map(c=><option key={c.id} value={c.id} style={{background:"#1f2937",color:"#e8eaf0"}}>{c.icon} {isRTL?c.he:c.en}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,color:th?th.subText:"#6b7280",marginBottom:4}}>{isRTL?"תדירות":"Frequency"}</div>
          <select value={form.recur} onChange={e=>upd("recur",e.target.value)} style={SS}>
            {RECUR.map(r=><option key={r.id} value={r.id} style={{background:"#1f2937",color:"#e8eaf0"}}>{isRTL?r.he:r.en}</option>)}
          </select>
        </div>
        <div><div style={{fontSize:11,color:th?th.subText:"#6b7280",marginBottom:4}}>{isRTL?"תאריך יעד":"Due date"}</div>
          <input type="date" value={form.dueDate} onChange={e=>upd("dueDate",e.target.value)} style={SI}/>
        </div>
        <div><div style={{fontSize:11,color:th?th.subText:"#6b7280",marginBottom:4}}>{isRTL?"אחראי":"Assignee"}</div>
          <select value={form.person} onChange={e=>upd("person",e.target.value)} style={SS}>
            {["Raz","Olga",isRTL?"שניהם":"Both"].map(p=><option key={p} style={{background:"#1f2937",color:"#e8eaf0"}}>{p}</option>)}
          </select>
        </div>
        <div><div style={{fontSize:11,color:th?th.subText:"#6b7280",marginBottom:4}}>{isRTL?"עדיפות":"Priority"}</div>
          <select value={form.priority} onChange={e=>upd("priority",e.target.value)} style={SS}>
            {["high","medium","low"].map(p=><option key={p} value={p} style={{background:"#1f2937",color:"#e8eaf0"}}>{PL[lang][p]}</option>)}
          </select>
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:th?th.subText:"#6b7280",marginBottom:4}}>{isRTL?"הערה":"Note"}</div>
        <input value={form.note} onChange={e=>upd("note",e.target.value)} onKeyDown={e=>e.stopPropagation()} placeholder={isRTL?"הערה אופציונלית...":"Optional note..."} style={SI}/>
      </div>
      <div style={{display:"flex",gap:8,flexDirection:isRTL?"row-reverse":"row"}}>
        <button onClick={save} style={{background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>{isRTL?"שמור":"Save"}</button>
        <button onClick={cancel} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:10,padding:"9px 18px",color:"#9ca3af",fontSize:13,cursor:"pointer"}}>{isRTL?"ביטול":"Cancel"}</button>
      </div>
      <style>{"select option{background:#1f2937!important;color:#e8eaf0!important;}select{color:#e8eaf0!important;}"}</style>
    </div>
  );
}

export default function Tasks({lang,onNavigate,th}){
  const isRTL=lang==="he";
  const [tasks,setTasks]=useState([]);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("pending");
  const [fp,setFp]=useState("all");
  const [fc,setFc]=useState("all");
  const [q,setQ]=useState("");
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [showDone,setShowDone]=useState(false);
  const [confetti,setConfetti]=useState(false);
  const ef={he:"",en:"",cat:"bills",priority:"medium",person:"Both",recur:"none",dueDate:"",note:""};
  const [form,setForm]=useState(ef);

  const BG=th?th.bg:"#0f1117";
  const TEXT=th?th.text:"#e8eaf0";
  const SUB=th?th.subText:"#6b7280";
  const CARD_BG=th?th.card:"rgba(255,255,255,0.03)";
  const CARD_BR=th?th.cardBorder:"rgba(255,255,255,0.08)";
  const HEADER=th?th.header:"rgba(17,19,30,0.95)";

  useEffect(()=>{const u=listenCol(COL.tasks,d=>{setTasks(d);setLoading(false);});return()=>u();},[]);
  const oc=useMemo(()=>tasks.filter(t=>!t.done&&du(t.dueDate)!==null&&du(t.dueDate)<0).length,[tasks]);
  const tc=useMemo(()=>tasks.filter(t=>!t.done&&du(t.dueDate)===0).length,[tasks]);
  const wc=useMemo(()=>tasks.filter(t=>!t.done&&du(t.dueDate)!==null&&du(t.dueDate)>=0&&du(t.dueDate)<=7).length,[tasks]);
  const rc=useMemo(()=>tasks.filter(t=>t.recur!=="none").length,[tasks]);
  const dc=useMemo(()=>tasks.filter(t=>t.done).length,[tasks]);

  const filtered=useMemo(()=>tasks.filter(t=>{
    if(!showDone&&t.done)return false;
    if(view==="pending"&&t.done)return false;
    if(view==="done"&&!t.done)return false;
    if(view==="overdue"&&(t.done||du(t.dueDate)===null||du(t.dueDate)>=0))return false;
    if(view==="recurring"&&t.recur==="none")return false;
    if(fp!=="all"&&t.person!==fp&&t.person!=="Both")return false;
    if(fc!=="all"&&t.cat!==fc)return false;
    const sq=q.toLowerCase();
    if(sq&&!t.he.toLowerCase().includes(sq)&&!(t.en||"").toLowerCase().includes(sq))return false;
    return true;
  }).sort((a,b)=>(du(a.dueDate)??9999)-(du(b.dueDate)??9999)),[tasks,view,fp,fc,q,showDone]);

  const markDone=async(t)=>{
    const n=t.recur!=="none"?nd(tod(),t.recur):t.dueDate;
    await saveDoc(COL.tasks,t.id,{done:t.recur==="none",lastDone:tod(),dueDate:t.recur!=="none"?n:t.dueDate});
    if(t.recur==="none"){setConfetti(true);setTimeout(()=>setConfetti(false),2500);}
  };
  const del=async(id)=>deleteDocById(COL.tasks,id);
  const openAdd=()=>{setForm(ef);setEditId(null);setShowForm(true);};
  const openEdit=(t)=>{setForm({...t});setEditId(t.id);setShowForm(true);};
  const save=async()=>{
    if(!form.he.trim())return;
    const id=editId||nid();
    await saveDoc(COL.tasks,id,{...form,id,he:form.he.trim(),en:form.en||form.he.trim(),done:false,lastDone:editId?(tasks.find(t=>t.id===editId)?.lastDone||""):""});
    setShowForm(false);setEditId(null);
  };
  const pl=(p)=>isRTL?(p==="Both"?"שניהם":p):(p==="שניהם"?"Both":p);
  const PILL=(a)=>({background:a?"rgba(99,102,241,0.2)":th?th.input:"rgba(255,255,255,0.04)",border:a?"1px solid rgba(99,102,241,0.4)":"1px solid "+(th?th.cardBorder:"rgba(255,255,255,0.08)"),borderRadius:20,padding:"5px 13px",color:a?"#a5b4fc":SUB,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"});
  const TAG=(c)=>({fontSize:11,padding:"2px 8px",borderRadius:20,background:c+"22",color:c,border:"1px solid "+c+"44",fontWeight:600,whiteSpace:"nowrap"});

  const Card=({t})=>{
    const d=du(t.dueDate),u=uc(d),cat=ci(t.cat),pc=PERSON_COLORS[t.person]||PERSON_COLORS["Both"];
    const ov=d!==null&&d<0;
    return(
      <div style={{background:t.done?"rgba(16,185,129,0.04)":ov?"rgba(239,68,68,0.05)":CARD_BG,border:t.done?"1px solid rgba(16,185,129,0.15)":ov?"1px solid rgba(239,68,68,0.2)":"1px solid "+CARD_BR,borderRadius:14,padding:"14px 16px",marginBottom:10,[isRTL?"borderRight":"borderLeft"]:"3px solid "+(t.done?"transparent":(PC[t.priority]||"#6b7280"))}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10,flexDirection:isRTL?"row-reverse":"row"}}>
          <div onClick={()=>!t.done&&markDone(t)} style={{width:22,height:22,borderRadius:7,flexShrink:0,marginTop:1,background:t.done?"#10b981":"transparent",border:t.done?"2px solid #10b981":"2px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",cursor:t.done?"default":"pointer"}}>{t.done?"✓":""}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:isRTL?"row-reverse":"row",flexWrap:"wrap"}}>
              <span style={{fontSize:16}}>{cat.icon}</span>
              <span style={{fontSize:15,fontWeight:700,textDecoration:t.done?"line-through":"none",color:t.done?"#4b5563":TEXT}}>{isRTL?t.he:(t.en||t.he)}</span>
              {t.recur!=="none"&&<span style={TAG("#f59e0b")}>🔄 {rl(t.recur,lang)}</span>}
            </div>
            <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap",flexDirection:isRTL?"row-reverse":"row"}}>
              <span style={TAG(PC[t.priority]||"#6b7280")}>{PL[lang][t.priority]}</span>
              <span style={TAG(pc)}>{pl(t.person)}</span>
              <span style={TAG("#6b7280")}>{isRTL?cat.he:cat.en}</span>
              {t.note&&<span style={{fontSize:11,color:SUB,fontStyle:"italic"}}>📝 {t.note}</span>}
            </div>
          </div>
          {t.dueDate&&!t.done&&<div style={{textAlign:"center",flexShrink:0}}><div style={{fontSize:12,fontWeight:700,color:u||SUB}}>{d===0?(isRTL?"היום!":"Today!"):d<0?(isRTL?Math.abs(d)+" ימי איחור":Math.abs(d)+" overdue"):(isRTL?"עוד "+d+" ימים":"in "+d+" days")}</div><div style={{fontSize:10,color:SUB}}>{t.dueDate}</div></div>}
        </div>
        {!t.done&&(
          <div style={{display:"flex",gap:6,marginTop:10,flexDirection:isRTL?"row-reverse":"row",flexWrap:"wrap"}}>
            <button onClick={()=>markDone(t)} style={{background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:8,padding:"5px 12px",color:"#6ee7b7",fontSize:12,fontWeight:600,cursor:"pointer"}}>✓ {isRTL?"בוצע":"Done"}</button>
            <button onClick={()=>openEdit(t)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"5px 12px",color:"#a5b4fc",fontSize:12,cursor:"pointer"}}>✏️</button>
            <button onClick={()=>del(t.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:8,padding:"5px 10px",color:"#fca5a5",fontSize:12,cursor:"pointer"}}>🗑</button>
            {t.dueDate&&<button onClick={()=>toGCal(t)} title={isRTL?"הוסף ל-Google Calendar":"Add to Google Calendar"} style={{background:"rgba(66,133,244,0.1)",border:"1px solid rgba(66,133,244,0.25)",borderRadius:8,padding:"5px 10px",color:"#93c5fd",fontSize:12,cursor:"pointer"}}>📅 {isRTL?"ליומן":"Calendar"}</button>}
          </div>
        )}
      </div>
    );
  };

  if(loading)return(<div style={{fontFamily:"'Outfit',sans-serif",color:TEXT,background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:14,fontSize:16}}><div style={{width:32,height:32,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>{isRTL?"מסנכרן...":"Syncing..."}<style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>);

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:TEXT,direction:isRTL?"rtl":"ltr",minHeight:"100vh",background:BG,transition:"background 0.3s,color 0.3s"}}>
      <Confetti show={confetti}/>
      <div style={{background:HEADER,borderBottom:"1px solid "+CARD_BR,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>✓</div>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:TEXT}}>{isRTL?"משימות":"Tasks"}</div>
            <div style={{fontSize:11,color:SUB}}>
              {oc>0&&<span style={{color:"#ef4444",fontWeight:700}}>{oc} {isRTL?"באיחור":"overdue"} · </span>}
              {tasks.filter(t=>!t.done).length} {isRTL?"פתוחות":"open"} · <span style={{color:"#10b981"}}>🔥 {isRTL?"מסונכרן":"Synced"}</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>onNavigate&&onNavigate("dashboard")} style={{background:th?th.input:"rgba(255,255,255,0.06)",border:"1px solid "+CARD_BR,borderRadius:10,padding:"6px 12px",color:SUB,fontSize:12,cursor:"pointer"}}>⬅ {isRTL?"לוח בקרה":"Dashboard"}</button>
          <button onClick={openAdd} style={{background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"8px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ {isRTL?"משימה":"Task"}</button>
        </div>
      </div>
      <div style={{padding:"14px 16px",maxWidth:860,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}} className="tasks-stats">
          {[{l:isRTL?"באיחור":"Overdue",v:oc,c:"#ef4444",k:"overdue"},{l:isRTL?"היום":"Today",v:tc,c:"#f59e0b",k:"pending"},{l:isRTL?"השבוע":"Week",v:wc,c:"#06b6d4",k:"pending"},{l:isRTL?"מחזוריות":"Recur",v:rc,c:"#a855f7",k:"recurring"},{l:isRTL?"הושלמו":"Done",v:dc,c:"#10b981",k:"done"}].map(s=>(
            <div key={s.l} onClick={()=>setView(s.k)} style={{background:view===s.k?"rgba(99,102,241,0.08)":CARD_BG,border:"1px solid "+(view===s.k?"rgba(99,102,241,0.3)":CARD_BR),borderRadius:14,padding:"12px 8px",textAlign:"center",cursor:"pointer",borderTop:"2px solid "+s.c+"55"}}>
              <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:10,color:SUB,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        {showForm&&<TaskForm form={form} setForm={setForm} editId={editId} save={save} cancel={()=>{setShowForm(false);setEditId(null);}} lang={lang} th={th}/>}
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 140px",minWidth:140}}>
            <span style={{position:"absolute",[isRTL?"right":"left"]:10,top:"50%",transform:"translateY(-50%)",color:SUB,fontSize:13}}>🔍</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder={isRTL?"חיפוש...":"Search..."} style={{background:th?th.input:"rgba(255,255,255,0.05)",border:"1px solid "+CARD_BR,borderRadius:10,padding:"9px 12px",color:TEXT,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box",[isRTL?"paddingRight":"paddingLeft"]:32}}/>
          </div>
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3}}>
            {[{v:"pending",l:isRTL?"ממתינות":"Pending"},{v:"overdue",l:isRTL?"באיחור":"Overdue"},{v:"recurring",l:isRTL?"מחזוריות":"Recur"}].map(({v,l})=>(
              <button key={v} onClick={()=>setView(v)} style={{background:view===v?"rgba(99,102,241,0.3)":"transparent",border:"none",borderRadius:8,padding:"5px 10px",color:view===v?"#a5b4fc":SUB,fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}{v==="overdue"&&oc>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:9,borderRadius:20,padding:"1px 5px",marginRight:4}}>{oc}</span>}</button>
            ))}
          </div>
          <button onClick={()=>setShowDone(!showDone)} style={{background:showDone?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.04)",border:showDone?"1px solid rgba(16,185,129,0.3)":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 12px",color:showDone?"#6ee7b7":SUB,fontSize:12,fontWeight:600,cursor:"pointer"}}>
            {showDone?(isRTL?"הסתר":"Hide"):(isRTL?"הצג שהושלמו":"Show done")} ({dc})
          </button>
          <div style={{display:"flex",gap:4}}>
            {[{k:"all",l:isRTL?"כולם":"All"},{k:"Raz",l:"Raz"},{k:"Olga",l:"Olga"}].map(({k,l})=>(
              <button key={k} onClick={()=>setFp(k)} style={PILL(fp===k)}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto",paddingBottom:3}}>
          <button onClick={()=>setFc("all")} style={PILL(fc==="all")}>{isRTL?"הכל":"All"}</button>
          {CATS.map(c=><button key={c.id} onClick={()=>setFc(c.id)} style={PILL(fc===c.id)}>{c.icon} {isRTL?c.he:c.en}</button>)}
        </div>
        {filtered.length===0?(<div style={{background:CARD_BG,border:"1px solid "+CARD_BR,borderRadius:16,padding:40,textAlign:"center",color:SUB}}><div style={{fontSize:36,marginBottom:10}}>🎉</div>{isRTL?"אין משימות":"No tasks"}</div>):(filtered.map(t=><Card key={t.id} t={t}/>))}
      </div>
      <style>{"@media(max-width:600px){.tasks-stats{grid-template-columns:repeat(3,1fr)!important;}}select option{background:#1f2937!important;color:#e8eaf0!important;}"}</style>
    </div>
  );
  }
