import { useState, useMemo } from "react";

const PERSON_COLORS = { Raz:"#6366f1", Olga:"#06b6d4", Both:"#10b981" };

const RECUR_OPTIONS = [
  { id:"none",      he:"חד פעמי",     en:"One-time"       },
  { id:"daily",     he:"כל יום",       en:"Daily"          },
  { id:"weekly",    he:"שבועי",        en:"Weekly"         },
  { id:"biweekly",  he:"כל שבועיים",   en:"Every 2 weeks"  },
  { id:"monthly",   he:"חודשי",        en:"Monthly"        },
  { id:"bimonthly", he:"כל חודשיים",   en:"Every 2 months" },
  { id:"quarterly", he:"רבעוני",       en:"Quarterly"      },
  { id:"yearly",    he:"שנתי",         en:"Yearly"         },
];

const CATS = [
  { id:"bills",    he:"חשבונות",  en:"Bills",    icon:"💡" },
  { id:"home",     he:"בית",      en:"Home",     icon:"🏠" },
  { id:"health",   he:"בריאות",   en:"Health",   icon:"❤️" },
  { id:"car",      he:"רכב",      en:"Car",      icon:"🚗" },
  { id:"kids",     he:"ילדים",    en:"Kids",     icon:"👶" },
  { id:"finance",  he:"כספים",    en:"Finance",  icon:"💰" },
  { id:"work",     he:"עבודה",    en:"Work",     icon:"💼" },
  { id:"personal", he:"אישי",     en:"Personal", icon:"🙋" },
  { id:"other",    he:"אחר",      en:"Other",    icon:"📋" },
];

const PRIORITY_COLORS  = { high:"#ef4444", medium:"#f59e0b", low:"#6b7280" };
const PRIORITY_LABELS  = {
  he: { high:"דחוף", medium:"בינוני", low:"נמוך" },
  en: { high:"High", medium:"Medium", low:"Low"  },
};

let UID = 200;
const newId = () => String(++UID);
const today = () => new Date().toISOString().slice(0,10);

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date(today())) / 86400000);
};

const urgencyColor = (days) => {
  if (days === null) return null;
  if (days <= 0)  return "#ef4444";
  if (days <= 3)  return "#f59e0b";
  if (days <= 7)  return "#06b6d4";
  return "#6b7280";
};

const recurLabel = (id, lang) => RECUR_OPTIONS.find(r=>r.id===id)?.[lang] || id;
const catInfo    = (id) => CATS.find(c=>c.id===id) || CATS[CATS.length-1];

const nextDueDate = (lastDone, recurId) => {
  if (!lastDone || recurId==="none") return null;
  const d = new Date(lastDone);
  const add = { daily:1, weekly:7, biweekly:14, monthly:30, bimonthly:60, quarterly:90, yearly:365 };
  d.setDate(d.getDate() + (add[recurId]||0));
  return d.toISOString().slice(0,10);
};

const SAMPLE_TASKS = [
  { id:"t1",  he:"תשלום ארנונה",      en:"Pay Arnona",       cat:"bills",   priority:"high",   person:"Raz",  recur:"monthly",   dueDate:"2026-04-01", lastDone:"2026-03-01", done:false, note:"לשלם דרך האינטרנט" },
  { id:"t2",  he:"תשלום חשבון חשמל",  en:"Pay Electric Bill",cat:"bills",   priority:"high",   person:"Raz",  recur:"monthly",   dueDate:"2026-04-05", lastDone:"2026-03-05", done:false, note:"" },
  { id:"t3",  he:"ועד בית",            en:"Building Fee",     cat:"bills",   priority:"medium", person:"Olga", recur:"monthly",   dueDate:"2026-04-10", lastDone:"2026-03-10", done:false, note:"350 שח" },
  { id:"t4",  he:"תשלום ביטוח רכב",   en:"Car Insurance",    cat:"car",     priority:"high",   person:"Raz",  recur:"yearly",    dueDate:"2026-08-15", lastDone:"2025-08-15", done:false, note:"" },
  { id:"t5",  he:"טיפול רכב",          en:"Car Service",      cat:"car",     priority:"medium", person:"Raz",  recur:"quarterly", dueDate:"2026-04-20", lastDone:"2026-01-20", done:false, note:"כל 10000 קמ" },
  { id:"t6",  he:"ביקור רופא שיניים",  en:"Dentist Checkup",  cat:"health",  priority:"medium", person:"Both", recur:"bimonthly", dueDate:"2026-04-15", lastDone:"2026-02-15", done:false, note:"" },
  { id:"t7",  he:"תשלום אינטרנט",     en:"Internet Bill",    cat:"bills",   priority:"low",    person:"Olga", recur:"monthly",   dueDate:"2026-04-08", lastDone:"2026-03-08", done:false, note:"" },
  { id:"t8",  he:"ניקיון כללי לבית",  en:"House Deep Clean", cat:"home",    priority:"low",    person:"Both", recur:"biweekly",  dueDate:"2026-03-25", lastDone:"2026-03-11", done:false, note:"" },
  { id:"t9",  he:"קנייה לבית",         en:"Grocery Shopping", cat:"home",    priority:"medium", person:"Olga", recur:"weekly",    dueDate:"2026-03-28", lastDone:"2026-03-21", done:false, note:"" },
  { id:"t10", he:"הגשת דוח שנתי",     en:"Annual Tax Report", cat:"finance", priority:"high",   person:"Raz",  recur:"yearly",    dueDate:"2026-04-30", lastDone:"2025-04-30", done:false, note:"דרך רואה חשבון" },
];

const S = {
  card:  { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 },
  inp:   { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"9px 12px", color:"#e8eaf0", fontSize:14, width:"100%", outline:"none", boxSizing:"border-box" },
  btn:   { background:"linear-gradient(135deg,#6366f1,#06b6d4)", border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" },
  pill:  (a) => ({ background:a?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)", border:a?"1px solid rgba(99,102,241,0.4)":"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"5px 13px", color:a?"#a5b4fc":"#6b7280", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }),
  tag:   (c) => ({ fontSize:11, padding:"2px 8px", borderRadius:20, background:c+"22", color:c, border:"1px solid "+c+"44", fontWeight:600, whiteSpace:"nowrap" }),
};

export default function Tasks({ lang }) {
  const isRTL = lang === "he";

  const T = {
    title:    isRTL?"משימות":"Tasks",
    add:      isRTL?"+ משימה חדשה":"+ New Task",
    all:      isRTL?"הכל":"All",
    everyone: isRTL?"כולם":"Everyone",
    save:     isRTL?"שמור":"Save",
    cancel:   isRTL?"ביטול":"Cancel",
    markDone: isRTL?"בוצע":"Mark Done",
    taskName: isRTL?"שם המשימה":"Task name",
    dueDate:  isRTL?"תאריך יעד":"Due date",
    priority: isRTL?"עדיפות":"Priority",
    person:   isRTL?"אחראי":"Assignee",
    category: isRTL?"קטגוריה":"Category",
    recurType:isRTL?"תדירות":"Frequency",
    note:     isRTL?"הערה":"Note",
    noTasks:  isRTL?"אין משימות 🎉":"No tasks 🎉",
    nextDue:  isRTL?"הבא:":"Next:",
    both:     isRTL?"שניהם":"Both",
    daysLeft: (d) => d===0?(isRTL?"היום!":"Today!"):d<0?(isRTL?Math.abs(d)+" ימי איחור":Math.abs(d)+" days overdue"):(isRTL?"עוד "+d+" ימים":"in "+d+" days"),
  };

  const [tasks,    setTasks]    = useState(SAMPLE_TASKS);
  const [view,     setView]     = useState("pending");
  const [filterP,  setFilterP]  = useState("all");
  const [filterC,  setFilterC]  = useState("all");
  const [search,   setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);

  const emptyForm = { he:"", en:"", cat:"bills", priority:"medium", person:"Both", recur:"none", dueDate:"", note:"" };
  const [form, setForm] = useState(emptyForm);

  const overdueCount = useMemo(()=>tasks.filter(t=>!t.done&&daysUntil(t.dueDate)!==null&&daysUntil(t.dueDate)<0).length,[tasks]);
  const todayCount   = useMemo(()=>tasks.filter(t=>!t.done&&daysUntil(t.dueDate)===0).length,[tasks]);
  const weekCount    = useMemo(()=>tasks.filter(t=>!t.done&&daysUntil(t.dueDate)!==null&&daysUntil(t.dueDate)>=0&&daysUntil(t.dueDate)<=7).length,[tasks]);
  const recurCount   = useMemo(()=>tasks.filter(t=>t.recur!=="none").length,[tasks]);
  const doneCount    = useMemo(()=>tasks.filter(t=>t.done).length,[tasks]);

  const filtered = useMemo(()=>{
    return tasks.filter(t=>{
      const d=daysUntil(t.dueDate);
      if(view==="pending"   && t.done) return false;
      if(view==="done"      && !t.done) return false;
      if(view==="overdue"   && (t.done||d===null||d>=0)) return false;
      if(view==="recurring" && t.recur==="none") return false;
      if(filterP!=="all"&&t.person!==filterP&&t.person!=="Both") return false;
      if(filterC!=="all"&&t.cat!==filterC) return false;
      const q=search.toLowerCase();
      if(q&&!t.he.toLowerCase().includes(q)&&!t.en.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a,b)=>(daysUntil(a.dueDate)??9999)-(daysUntil(b.dueDate)??9999));
  },[tasks,view,filterP,filterC,search]);

  const markDone = (id) => setTasks(p=>p.map(t=>{
    if(t.id!==id) return t;
    const next = t.recur!=="none" ? nextDueDate(today(),t.recur) : t.dueDate;
    return {...t, done:t.recur==="none", lastDone:today(), dueDate:t.recur!=="none"?next:t.dueDate};
  }));
  const deleteTask = (id)=>setTasks(p=>p.filter(t=>t.id!==id));
  const openAdd  = ()=>{setForm(emptyForm);setEditId(null);setShowForm(true);};
  const openEdit = (t)=>{setForm({...t});setEditId(t.id);setShowForm(true);};
  const saveTask = ()=>{
    if(!form.he.trim()) return;
    if(editId){setTasks(p=>p.map(t=>t.id===editId?{...form,id:editId,done:t.done,lastDone:t.lastDone}:t));}
    else{setTasks(p=>[...p,{...form,id:newId(),he:form.he.trim(),en:form.en||form.he.trim(),done:false,lastDone:""}]);}
    setShowForm(false);setEditId(null);
  };
  const pLabel=(p)=>isRTL?(p==="Both"?"שניהם":p):(p==="שניהם"?"Both":p);

  const TaskCard=({t})=>{
    const d=daysUntil(t.dueDate),uc=urgencyColor(d),cat=catInfo(t.cat),pc=PERSON_COLORS[t.person]||PERSON_COLORS["Both"];
    const isOverdue=d!==null&&d<0;
    return(
      <div style={{background:t.done?"rgba(16,185,129,0.04)":isOverdue?"rgba(239,68,68,0.05)":"rgba(255,255,255,0.03)",border:t.done?"1px solid rgba(16,185,129,0.15)":isOverdue?"1px solid rgba(239,68,68,0.2)":"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 16px",marginBottom:10,borderRight:isRTL&&!t.done?"3px solid "+(PRIORITY_COLORS[t.priority]||"#6b7280"):undefined,borderLeft:!isRTL&&!t.done?"3px solid "+(PRIORITY_COLORS[t.priority]||"#6b7280"):undefined}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10,flexDirection:isRTL?"row-reverse":"row"}}>
          <div onClick={()=>!t.done&&markDone(t.id)} style={{width:22,height:22,borderRadius:7,flexShrink:0,marginTop:1,background:t.done?"#10b981":"transparent",border:t.done?"2px solid #10b981":"2px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",cursor:t.done?"default":"pointer"}}>{t.done?"✓":""}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:isRTL?"row-reverse":"row",flexWrap:"wrap"}}>
              <span style={{fontSize:16}}>{cat.icon}</span>
              <span style={{fontSize:15,fontWeight:700,textDecoration:t.done?"line-through":"none",color:t.done?"#4b5563":"#e8eaf0"}}>{isRTL?t.he:t.en}</span>
              {t.recur!=="none"&&<span style={S.tag("#f59e0b")}>🔄 {recurLabel(t.recur,lang)}</span>}
            </div>
            <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap",flexDirection:isRTL?"row-reverse":"row"}}>
              <span style={S.tag(PRIORITY_COLORS[t.priority]||"#6b7280")}>{PRIORITY_LABELS[lang][t.priority]}</span>
              <span style={S.tag(pc)}>{pLabel(t.person)}</span>
              <span style={S.tag("#6b7280")}>{isRTL?cat.he:cat.en}</span>
              {t.note&&<span style={{fontSize:11,color:"#6b7280",fontStyle:"italic"}}>📝 {t.note}</span>}
            </div>
          </div>
          {t.dueDate&&!t.done&&(
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:12,fontWeight:700,color:uc||"#6b7280"}}>{T.daysLeft(d)}</div>
              <div style={{fontSize:10,color:"#6b7280"}}>{t.dueDate}</div>
            </div>
          )}
          {t.done&&t.recur!=="none"&&t.dueDate&&(
            <div style={{textAlign:"center",flexShrink:0,fontSize:11,color:"#6b7280"}}>
              <div>{T.nextDue}</div>
              <div style={{fontWeight:700,color:"#06b6d4"}}>{t.dueDate}</div>
            </div>
          )}
        </div>
        {!t.done&&(
          <div style={{display:"flex",gap:6,marginTop:10,flexDirection:isRTL?"row-reverse":"row"}}>
            <button onClick={()=>markDone(t.id)} style={{background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:8,padding:"5px 12px",color:"#6ee7b7",fontSize:12,fontWeight:600,cursor:"pointer"}}>✓ {T.markDone}</button>
            <button onClick={()=>openEdit(t)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"5px 12px",color:"#a5b4fc",fontSize:12,cursor:"pointer"}}>✏️</button>
            <button onClick={()=>deleteTask(t.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:8,padding:"5px 10px",color:"#fca5a5",fontSize:12,cursor:"pointer"}}>🗑</button>
          </div>
        )}
      </div>
    );
  };

  const TaskForm=()=>(
    <div style={{...S.card,marginBottom:20,borderColor:"rgba(99,102,241,0.3)"}}>
      <div style={{fontSize:14,fontWeight:700,color:"#a5b4fc",marginBottom:14}}>{editId?(isRTL?"עריכת משימה":"Edit Task"):(isRTL?"משימה חדשה":"New Task")}</div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.taskName}</div><input value={form.he} onChange={e=>setForm({...form,he:e.target.value})} placeholder={isRTL?"לדוגמה: תשלום ארנונה":"e.g. Pay Arnona"} style={S.inp} autoFocus onKeyDown={e=>e.key==="Enter"&&saveTask()}/></div>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.category}</div><select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={{...S.inp,appearance:"none"}}>{CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {isRTL?c.he:c.en}</option>)}</select></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.recurType}</div><select value={form.recur} onChange={e=>setForm({...form,recur:e.target.value})} style={{...S.inp,appearance:"none"}}>{RECUR_OPTIONS.map(r=><option key={r.id} value={r.id}>{isRTL?r.he:r.en}</option>)}</select></div>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.dueDate}</div><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} style={S.inp}/></div>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.person}</div><select value={form.person} onChange={e=>setForm({...form,person:e.target.value})} style={{...S.inp,appearance:"none"}}>{["Raz","Olga",T.both].map(p=><option key={p}>{p}</option>)}</select></div>
        <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.priority}</div><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={{...S.inp,appearance:"none"}}>{["high","medium","low"].map(p=><option key={p} value={p}>{PRIORITY_LABELS[lang][p]}</option>)}</select></div>
      </div>
      <div style={{marginBottom:12}}><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.note}</div><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder={isRTL?"הערה אופציונלית...":"Optional note..."} style={S.inp}/></div>
      <div style={{display:"flex",gap:8,flexDirection:isRTL?"row-reverse":"row"}}>
        <button onClick={saveTask} style={S.btn}>{T.save}</button>
        <button onClick={()=>setShowForm(false)} style={{...S.btn,background:"rgba(255,255,255,0.08)"}}>{T.cancel}</button>
      </div>
    </div>
  );

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",direction:isRTL?"rtl":"ltr",minHeight:"100vh",background:"#0f1117"}}>
      <div style={{background:"rgba(17,19,30,0.95)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✓</div>
          <div>
            <div style={{fontSize:19,fontWeight:800}}>{T.title}</div>
            <div style={{fontSize:11,color:"#6b7280"}}>
              {overdueCount>0&&<span style={{color:"#ef4444",fontWeight:700}}>{overdueCount} {isRTL?"באיחור":"overdue"} · </span>}
              {todayCount>0&&<span style={{color:"#f59e0b",fontWeight:700}}>{todayCount} {isRTL?"היום":"today"} · </span>}
              {tasks.filter(t=>!t.done).length} {isRTL?"פתוחות":"open"}
            </div>
          </div>
        </div>
        <button onClick={openAdd} style={S.btn}>{T.add}</button>
      </div>
      <div style={{padding:"18px 22px",maxWidth:860,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}} className="tasks-stats">
          {[{label:isRTL?"באיחור":"Overdue",val:overdueCount,color:"#ef4444",v:"overdue"},{label:isRTL?"היום":"Today",val:todayCount,color:"#f59e0b",v:"pending"},{label:isRTL?"השבוע":"This Week",val:weekCount,color:"#06b6d4",v:"pending"},{label:isRTL?"מחזוריות":"Recurring",val:recurCount,color:"#a855f7",v:"recurring"},{label:isRTL?"הושלמו":"Done",val:doneCount,color:"#10b981",v:"done"}].map(s=>(
            <div key={s.label} onClick={()=>setView(s.v)} style={{...S.card,textAlign:"center",cursor:"pointer",borderTop:"2px solid "+s.color+"55",background:view===s.v?"rgba(99,102,241,0.08)":"rgba(255,255,255,0.03)"}}>
              <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.val}</div>
              <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
        {showForm&&<TaskForm/>}
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 150px"}}>
            <span style={{position:"absolute",[isRTL?"right":"left"]:10,top:"50%",transform:"translateY(-50%)",color:"#6b7280",fontSize:13}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={isRTL?"חיפוש משימה...":"Search task..."} style={{...S.inp,[isRTL?"paddingRight":"paddingLeft"]:32}}/>
          </div>
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3}}>
            {[{v:"pending",l:isRTL?"ממתינות":"Pending"},{v:"overdue",l:isRTL?"באיחור":"Overdue"},{v:"recurring",l:isRTL?"מחזוריות":"Recurring"},{v:"done",l:isRTL?"הושלמו":"Done"}].map(({v,l})=>(
              <button key={v} onClick={()=>setView(v)} style={{background:view===v?"rgba(99,102,241,0.3)":"transparent",border:"none",borderRadius:8,padding:"5px 11px",color:view===v?"#a5b4fc":"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                {l}{v==="overdue"&&overdueCount>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:9,fontWeight:700,borderRadius:20,padding:"1px 5px",marginRight:4}}>{overdueCount}</span>}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:5}}>
            {[{k:"all",l:T.everyone},{k:"Raz",l:"Raz"},{k:"Olga",l:"Olga"}].map(({k,l})=>(
              <button key={k} onClick={()=>setFilterP(k)} style={S.pill(filterP===k)}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:16,overflowX:"auto",paddingBottom:3}}>
          <button onClick={()=>setFilterC("all")} style={S.pill(filterC==="all")}>{T.all}</button>
          {CATS.map(c=><button key={c.id} onClick={()=>setFilterC(c.id)} style={S.pill(filterC===c.id)}>{c.icon} {isRTL?c.he:c.en}</button>)}
        </div>
        {filtered.length===0?(
          <div style={{...S.card,textAlign:"center",padding:40,color:"#6b7280"}}><div style={{fontSize:36,marginBottom:10}}>🎉</div>{T.noTasks}</div>
        ):(
          filtered.map(t=><TaskCard key={t.id} t={t}/>)
        )}
      </div>
      <style>{"@media(max-width:600px){.tasks-stats{grid-template-columns:repeat(3,1fr)!important;}}"}</style>
    </div>
  );
   }
