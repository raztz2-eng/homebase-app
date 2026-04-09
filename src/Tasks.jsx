import { useState, useMemo, useEffect, useCallback } from "react";
import { listenCol, saveDoc, deleteDocById, COL } from "./firebase.js";

const PERSON_COLORS = { Raz:"#6366f1", Olga:"#06b6d4", Both:"#10b981" };
const RECUR = [
  {id:"none",he:"חד פעמי",en:"One-time"},{id:"daily",he:"כל יום",en:"Daily"},
  {id:"weekly",he:"שבועי",en:"Weekly"},{id:"biweekly",he:"כל שבועיים",en:"Every 2 weeks"},
  {id:"monthly",he:"חודשי",en:"Monthly"},{id:"bimonthly",he:"כל חודשיים",en:"Every 2 months"},
  {id:"quarterly",he:"רבעוני",en:"Quarterly"},{id:"yearly",he:"שנתי",en:"Yearly"},
];
const CATS = [
  {id:"bills",he:"חשבונות",en:"Bills",icon:"💡"},{id:"home",he:"בית",en:"Home",icon:"🏠"},
  {id:"health",he:"בריאות",en:"Health",icon:"❤️"},{id:"car",he:"רכב",en:"Car",icon:"🚗"},
  {id:"kids",he:"ילדים",en:"Kids",icon:"👶"},{id:"finance",he:"כספים",en:"Finance",icon:"💰"},
  {id:"work",he:"עבודה",en:"Work",icon:"💼"},{id:"personal",he:"אישי",en:"Personal",icon:"🙋"},
  {id:"other",he:"אחר",en:"Other",icon:"📋"},
];
const PC = {high:"#ef4444",medium:"#f59e0b",low:"#6b7280"};
const PL = {he:{high:"דחוף",medium:"בינוני",low:"נמוך"},en:{high:"High",medium:"Medium",low:"Low"}};
let UID=200; const newId=()=>"t"+String(++UID)+Date.now();
const today=()=>new Date().toISOString().slice(0,10);
const du=(d)=>d?Math.ceil((new Date(d)-new Date(today()))/86400000):null;
const uc=(d)=>d===null?null:d<=0?"#ef4444":d<=3?"#f59e0b":d<=7?"#06b6d4":"#6b7280";
const rl=(id,l)=>RECUR.find(r=>r.id===id)?.[l]||id;
const ci=(id)=>CATS.find(c=>c.id===id)||CATS[CATS.length-1];
const nd=(last,rec)=>{if(!last||rec==="none")return null;const d=new Date(last);const a={daily:1,weekly:7,biweekly:14,monthly:30,bimonthly:60,quarterly:90,yearly:365};d.setDate(d.getDate()+(a[rec]||0));return d.toISOString().slice(0,10);};

const S={
  card:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20},
  inp:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"9px 12px",color:"#e8eaf0",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"},
  btn:{background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"},
  pill:(a)=>({background:a?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)",border:a?"1px solid rgba(99,102,241,0.4)":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 13px",color:a?"#a5b4fc":"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}),
  tag:(c)=>({fontSize:11,padding:"2px 8px",borderRadius:20,background:c+"22",color:c,border:"1px solid "+c+"44",fontWeight:600,whiteSpace:"nowrap"}),
};

// ── Confetti ────────────────────────────────────────────────
function Confetti({show}){
  if(!show) return null;
  const pieces=Array.from({length:60},(_,i)=>({
    id:i,
    x:Math.random()*100,
    color:["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#a855f7","#ec4899"][Math.floor(Math.random()*7)],
    size:6+Math.random()*8,
    delay:Math.random()*0.5,
    dur:1.5+Math.random()*1,
  }));
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:"absolute",top:"-20px",left:p.x+"%",
          width:p.size,height:p.size,
          background:p.color,borderRadius:p.size>10?"50%":"2px",
          animation:"confettiFall "+p.dur+"s "+p.delay+"s ease-in forwards",
        }}/>
      ))}
      <style>{`@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}`}</style>
    </div>
  );
}

export default function Tasks({lang,onNavigate}){
  const isRTL=lang==="he";
  const T={
    title:isRTL?"משימות":"Tasks",add:isRTL?"+ משימה חדשה":"+ New Task",
    all:isRTL?"הכל":"All",everyone:isRTL?"כולם":"Everyone",
    save:isRTL?"שמור":"Save",cancel:isRTL?"ביטול":"Cancel",
    done:isRTL?"בוצע":"Done",name:isRTL?"שם המשימה":"Task name",
    due:isRTL?"תאריך יעד":"Due date",pri:isRTL?"עדיפות":"Priority",
    who:isRTL?"אחראי":"Assignee",cat:isRTL?"קטגוריה":"Category",
    freq:isRTL?"תדירות":"Frequency",note:isRTL?"הערה":"Note",
    empty:isRTL?"אין משימות 🎉":"No tasks 🎉",next:isRTL?"הבא:":"Next:",
    both:isRTL?"שניהם":"Both",sync:isRTL?"מסנכרן...":"Syncing...",
    synced:isRTL?"מסונכרן 🔥":"Synced 🔥",
    showDone:isRTL?"הצג משימות שהושלמו":"Show completed",
    hideDone:isRTL?"הסתר שהושלמו":"Hide completed",
    dashboard:isRTL?"לוח בקרה":"Dashboard",
    dl:(d)=>d===0?(isRTL?"היום!":"Today!"):d<0?(isRTL?Math.abs(d)+" ימי איחור":Math.abs(d)+" overdue"):(isRTL?"עוד "+d+" ימים":"in "+d+" days"),
  };

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

  useEffect(()=>{
    const unsub=listenCol(COL.tasks,(data)=>{setTasks(data);setLoading(false);});
    return()=>unsub();
  },[]);

  const oc=useMemo(()=>tasks.filter(t=>!t.done&&du(t.dueDate)!==null&&du(t.dueDate)<0).length,[tasks]);
  const tc=useMemo(()=>tasks.filter(t=>!t.done&&du(t.dueDate)===0).length,[tasks]);
  const wc=useMemo(()=>tasks.filter(t=>!t.done&&du(t.dueDate)!==null&&du(t.dueDate)>=0&&du(t.dueDate)<=7).length,[tasks]);
  const rc=useMemo(()=>tasks.filter(t=>t.recur!=="none").length,[tasks]);
  const dc=useMemo(()=>tasks.filter(t=>t.done).length,[tasks]);

  const filtered=useMemo(()=>tasks.filter(t=>{
    if(!showDone&&t.done) return false;
    if(view==="pending"&&t.done) return false;
    if(view==="done"&&!t.done) return false;
    if(view==="overdue"&&(t.done||du(t.dueDate)===null||du(t.dueDate)>=0)) return false;
    if(view==="recurring"&&t.recur==="none") return false;
    if(fp!=="all"&&t.person!==fp&&t.person!=="Both") return false;
    if(fc!=="all"&&t.cat!==fc) return false;
    const sq=q.toLowerCase();
    if(sq&&!t.he.toLowerCase().includes(sq)&&!(t.en||"").toLowerCase().includes(sq)) return false;
    return true;
  }).sort((a,b)=>(du(a.dueDate)??9999)-(du(b.dueDate)??9999)),[tasks,view,fp,fc,q,showDone]);

  const markDone=async(t)=>{
    const n=t.recur!=="none"?nd(today(),t.recur):t.dueDate;
    await saveDoc(COL.tasks,t.id,{done:t.recur==="none",lastDone:today(),dueDate:t.recur!=="none"?n:t.dueDate});
    if(t.recur==="none"){
      setConfetti(true);
      setTimeout(()=>setConfetti(false),2500);
    }
  };
  const del=async(id)=>deleteDocById(COL.tasks,id);
  const openAdd=()=>{setForm(ef);setEditId(null);setShowForm(true);};
  const openEdit=(t)=>{setForm({...t});setEditId(t.id);setShowForm(true);};
  const save=async()=>{
    if(!form.he.trim()) return;
    const id=editId||newId();
    await saveDoc(COL.tasks,id,{...form,id,he:form.he.trim(),en:form.en||form.he.trim(),done:false,lastDone:editId?(tasks.find(t=>t.id===editId)?.lastDone||""):""});
    setShowForm(false);setEditId(null);
  };
  const pl=(p)=>isRTL?(p==="Both"?"שניהם":p):(p==="שניהם"?"Both":p);

  // Fix note field - use useCallback to prevent re-render focus loss
  const setNote=useCallback((val)=>setForm(f=>({...f,note:val})),[]);

  const Card=({t})=>{
    const d=du(t.dueDate),u=uc(d),cat=ci(t.cat),pcolor=PERSON_COLORS[t.person]||PERSON_COLORS["Both"];
    const ov=d!==null&&d<0;
    return(
      <div style={{background:t.done?"rgba(16,185,129,0.04)":ov?"rgba(239,68,68,0.05)":"rgba(255,255,255,0.03)",border:t.done?"1px solid rgba(16,185,129,0.15)":ov?"1px solid rgba(239,68,68,0.2)":"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 16px",marginBottom:10,[isRTL?"borderRight":"borderLeft"]:"3px solid "+(t.done?"transparent":(PC[t.priority]||"#6b7280"))}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10,flexDirection:isRTL?"row-reverse":"row"}}>
          <div onClick={()=>!t.done&&markDone(t)} style={{width:22,height:22,borderRadius:7,flexShrink:0,marginTop:1,background:t.done?"#10b981":"transparent",border:t.done?"2px solid #10b981":"2px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",cursor:t.done?"default":"pointer"}}>{t.done?"✓":""}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:isRTL?"row-reverse":"row",flexWrap:"wrap"}}>
              <span style={{fontSize:16}}>{cat.icon}</span>
              <span style={{fontSize:15,fontWeight:700,textDecoration:t.done?"line-through":"none",color:t.done?"#4b5563":"#e8eaf0"}}>{isRTL?t.he:t.en}</span>
              {t.recur!=="none"&&<span style={S.tag("#f59e0b")}>🔄 {rl(t.recur,lang)}</span>}
            </div>
            <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap",flexDirection:isRTL?"row-reverse":"row"}}>
              <span style={S.tag(PC[t.priority]||"#6b7280")}>{PL[lang][t.priority]}</span>
              <span style={S.tag(pcolor)}>{pl(t.person)}</span>
              <span style={S.tag("#6b7280")}>{isRTL?cat.he:cat.en}</span>
              {t.note&&<span style={{fontSize:11,color:"#6b7280",fontStyle:"italic"}}>📝 {t.note}</span>}
            </div>
          </div>
          {t.dueDate&&!t.done&&<div style={{textAlign:"center",flexShrink:0}}><div style={{fontSize:12,fontWeight:700,color:u||"#6b7280"}}>{T.dl(d)}</div><div style={{fontSize:10,color:"#6b7280"}}>{t.dueDate}</div></div>}
          {t.done&&t.recur!=="none"&&t.dueDate&&<div style={{textAlign:"center",flexShrink:0,fontSize:11,color:"#6b7280"}}><div>{T.next}</div><div style={{fontWeight:700,color:"#06b6d4"}}>{t.dueDate}</div></div>}
        </div>
        {!t.done&&(
          <div style={{display:"flex",gap:6,marginTop:10,flexDirection:isRTL?"row-reverse":"row"}}>
            <button onClick={()=>markDone(t)} style={{background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:8,padding:"5px 12px",color:"#6ee7b7",fontSize:12,fontWeight:600,cursor:"pointer"}}>✓ {T.done}</button>
            <button onClick={()=>openEdit(t)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"5px 12px",color:"#a5b4fc",fontSize:12,cursor:"pointer"}}>✏️</button>
            <button onClick={()=>del(t.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:8,padding:"5px 10px",color:"#fca5a5",fontSize:12,cursor:"pointer"}}>🗑</button>
          </div>
        )}
      </div>
    );
  };

  const Form=()=>(
    <div style={{...S.card,marginBottom:20,borderColor:"rgba(99,102,241,0.3)"}}>
      <div style={{fontSize:14,fontWeight:700,color:"#a5b4fc",marginBottom:14}}>{editId?(isRTL?"עריכה":"Edit"):(isRTL?"משימה חדשה":"New Task")}</div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.name}</div>
          <input value={form.he} onChange={e=>setForm(f=>({...f,he:e.target.value}))} placeholder={isRTL?"לדוגמה: תשלום ארנונה":"e.g. Pay Arnona"} style={S.inp} autoFocus/>
        </div>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.cat}</div>
          <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} style={{...S.inp,appearance:"none",color:"#1f2937"}}>
            {CATS.map(c=><option key={c.id} value={c.id} style={{color:"#1f2937",background:"#fff"}}>{c.icon} {isRTL?c.he:c.en}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.freq}</div>
          <select value={form.recur} onChange={e=>setForm(f=>({...f,recur:e.target.value}))} style={{...S.inp,appearance:"none",color:"#1f2937"}}>
            {RECUR.map(r=><option key={r.id} value={r.id} style={{color:"#1f2937",background:"#fff"}}>{isRTL?r.he:r.en}</option>)}
          </select>
        </div>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.due}</div><input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} style={S.inp}/></div>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.who}</div>
          <select value={form.person} onChange={e=>setForm(f=>({...f,person:e.target.value}))} style={{...S.inp,appearance:"none",color:"#1f2937"}}>
            {["Raz","Olga",T.both].map(p=><option key={p} style={{color:"#1f2937",background:"#fff"}}>{p}</option>)}
          </select>
        </div>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.pri}</div>
          <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={{...S.inp,appearance:"none",color:"#1f2937"}}>
            {["high","medium","low"].map(p=><option key={p} value={p} style={{color:"#1f2937",background:"#fff"}}>{PL[lang][p]}</option>)}
          </select>
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.note}</div>
        <input
          value={form.note}
          onChange={e=>setNote(e.target.value)}
          placeholder={isRTL?"הערה אופציונלית...":"Optional note..."}
          style={S.inp}
        />
      </div>
      <div style={{display:"flex",gap:8,flexDirection:isRTL?"row-reverse":"row"}}>
        <button onClick={save} style={S.btn}>{T.save}</button>
        <button onClick={()=>setShowForm(false)} style={{...S.btn,background:"rgba(255,255,255,0.08)"}}>{T.cancel}</button>
      </div>
    </div>
  );

  if(loading)return(<div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",background:"#0f1117",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:14,fontSize:16}}><div style={{width:32,height:32,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>{T.sync}<style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>);

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",direction:isRTL?"rtl":"ltr",minHeight:"100vh",background:"#0f1117"}}>
      <Confetti show={confetti}/>
      <div style={{background:"rgba(17,19,30,0.95)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✓</div>
          <div>
            <div style={{fontSize:19,fontWeight:800}}>{T.title}</div>
            <div style={{fontSize:11,color:"#6b7280"}}>
              {oc>0&&<span style={{color:"#ef4444",fontWeight:700}}>{oc} {isRTL?"באיחור":"overdue"} · </span>}
              {tc>0&&<span style={{color:"#f59e0b",fontWeight:700}}>{tc} {isRTL?"היום":"today"} · </span>}
              {tasks.filter(t=>!t.done).length} {isRTL?"פתוחות":"open"} · <span style={{color:"#10b981"}}>{T.synced}</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>onNavigate&&onNavigate("dashboard")} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"7px 14px",color:"#9ca3af",fontSize:12,cursor:"pointer"}}>⬅ {T.dashboard}</button>
          <button onClick={openAdd} style={S.btn}>{T.add}</button>
        </div>
      </div>
      <div style={{padding:"18px 22px",maxWidth:860,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}} className="tasks-stats">
          {[{l:isRTL?"באיחור":"Overdue",v:oc,c:"#ef4444",k:"overdue"},{l:isRTL?"היום":"Today",v:tc,c:"#f59e0b",k:"pending"},{l:isRTL?"השבוע":"This Week",v:wc,c:"#06b6d4",k:"pending"},{l:isRTL?"מחזוריות":"Recurring",v:rc,c:"#a855f7",k:"recurring"},{l:isRTL?"הושלמו":"Done",v:dc,c:"#10b981",k:"done"}].map(s=>(
            <div key={s.l} onClick={()=>setView(s.k)} style={{...S.card,textAlign:"center",cursor:"pointer",borderTop:"2px solid "+s.c+"55",background:view===s.k?"rgba(99,102,241,0.08)":"rgba(255,255,255,0.03)"}}>
              <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        {showForm&&<Form/>}
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 150px"}}>
            <span style={{position:"absolute",[isRTL?"right":"left"]:10,top:"50%",transform:"translateY(-50%)",color:"#6b7280",fontSize:13}}>🔍</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder={isRTL?"חיפוש...":"Search..."} style={{...S.inp,[isRTL?"paddingRight":"paddingLeft"]:32}}/>
          </div>
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3}}>
            {[{v:"pending",l:isRTL?"ממתינות":"Pending"},{v:"overdue",l:isRTL?"באיחור":"Overdue"},{v:"recurring",l:isRTL?"מחזוריות":"Recurring"}].map(({v,l})=>(
              <button key={v} onClick={()=>setView(v)} style={{background:view===v?"rgba(99,102,241,0.3)":"transparent",border:"none",borderRadius:8,padding:"5px 11px",color:view===v?"#a5b4fc":"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                {l}{v==="overdue"&&oc>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:9,borderRadius:20,padding:"1px 5px",marginRight:4}}>{oc}</span>}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowDone(!showDone)} style={{background:showDone?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.04)",border:showDone?"1px solid rgba(16,185,129,0.3)":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 13px",color:showDone?"#6ee7b7":"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer"}}>
            {showDone?T.hideDone:T.showDone} ({dc})
          </button>
          <div style={{display:"flex",gap:5}}>
            {[{k:"all",l:T.everyone},{k:"Raz",l:"Raz"},{k:"Olga",l:"Olga"}].map(({k,l})=>(
              <button key={k} onClick={()=>setFp(k)} style={S.pill(fp===k)}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:16,overflowX:"auto",paddingBottom:3}}>
          <button onClick={()=>setFc("all")} style={S.pill(fc==="all")}>{T.all}</button>
          {CATS.map(c=><button key={c.id} onClick={()=>setFc(c.id)} style={S.pill(fc===c.id)}>{c.icon} {isRTL?c.he:c.en}</button>)}
        </div>
        {filtered.length===0?(<div style={{...S.card,textAlign:"center",padding:40,color:"#6b7280"}}><div style={{fontSize:36,marginBottom:10}}>🎉</div>{T.empty}</div>):(filtered.map(t=><Card key={t.id} t={t}/>))}
      </div>
      <style>{"@media(max-width:600px){.tasks-stats{grid-template-columns:repeat(3,1fr)!important;}}"}</style>
    </div>
  );
}
