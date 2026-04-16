import { useState, useMemo, useEffect } from "react";
import { listenCol, saveDoc, deleteDocById, COL } from "./firebase.js";

const PC={high:"#ef4444",medium:"#f59e0b",low:"#6b7280"};
const PL={he:{high:"דחוף",medium:"בינוני",low:"נמוך"},en:{high:"High",medium:"Medium",low:"Low"}};
const PERSON_COLORS={Raz:"#6366f1",Olga:"#06b6d4",Both:"#10b981"};
const CATS=[{id:"bills",he:"חשבונות",en:"Bills",icon:"💡"},{id:"home",he:"בית",en:"Home",icon:"🏠"},{id:"car",he:"רכב",en:"Car",icon:"🚗"},{id:"kids",he:"ילדים",en:"Kids",icon:"👶"},{id:"finance",he:"כספים",en:"Finance",icon:"💰"},{id:"work",he:"עבודה",en:"Work",icon:"💼"},{id:"personal",he:"אישי",en:"Personal",icon:"🙋"},{id:"other",he:"אחר",en:"Other",icon:"📋"}];
const RECUR=[{id:"none",he:"חד פעמי",en:"One-time"},{id:"daily",he:"יומי",en:"Daily"},{id:"weekly",he:"שבועי",en:"Weekly"},{id:"biweekly",he:"כל שבועיים",en:"Biweekly"},{id:"monthly",he:"חודשי",en:"Monthly"},{id:"quarterly",he:"רבעוני",en:"Quarterly"},{id:"yearly",he:"שנתי",en:"Yearly"}];
let UID=200;const newId=()=>"t"+String(++UID)+Date.now();
const tod=()=>new Date().toISOString().slice(0,10);
const du=(d)=>d?Math.ceil((new Date(d)-new Date(tod()))/86400000):null;
const ci=(id)=>CATS.find(c=>c.id===id)||CATS[CATS.length-1];
const nd=(last,rec)=>{if(!last||rec==="none")return null;const d=new Date(last);({daily:1,weekly:7,biweekly:14,monthly:30,quarterly:90,yearly:365}[rec]||0);d.setDate(d.getDate()+({daily:1,weekly:7,biweekly:14,monthly:30,quarterly:90,yearly:365}[rec]||0));return d.toISOString().slice(0,10);};

function Confetti({show}){
  if(!show)return null;
  const p=Array.from({length:50},(_,i)=>({id:i,x:Math.random()*100,color:["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#a855f7"][i%6],size:6+Math.random()*7,delay:Math.random()*0.4,dur:1.4+Math.random()*1}));
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>{p.map(x=>(<div key={x.id} style={{position:"absolute",top:"-20px",left:x.x+"%",width:x.size,height:x.size,background:x.color,borderRadius:x.size>10?"50%":"2px",animation:"cf "+x.dur+"s "+x.delay+"s ease-in forwards"}}/>))}<style>{`@keyframes cf{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style></div>);
}

export default function Tasks({lang,onNavigate,onAddToCalendar,theme}){
  const isRTL=lang==="he";
  const TH=theme||{bg:"#0f1117",card:"rgba(255,255,255,0.03)",cardBorder:"rgba(255,255,255,0.08)",text:"#e8eaf0",subText:"#6b7280",mutedText:"#4b5563",input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.12)",rowBg:"rgba(255,255,255,0.03)"};
  const INP={background:TH.input,border:"1px solid "+TH.inputBorder,borderRadius:10,padding:"9px 12px",color:TH.text,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"};
  const BTN={background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"};
  const CARD={background:TH.card,border:"1px solid "+TH.cardBorder,borderRadius:14,padding:14};

  const [tasks,setTasks]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [showDone,setShowDone]=useState(false);
  const [confetti,setConfetti]=useState(false);
  // Dropdown filters
  const [filterView,setFilterView]=useState("pending"); // pending/overdue/recurring/done
  const [filterPerson,setFilterPerson]=useState("all");
  const [filterCat,setFilterCat]=useState("all");
  const [openDrop,setOpenDrop]=useState(null); // which dropdown is open
  const ef={he:"",cat:"bills",priority:"medium",person:"Both",recur:"none",dueDate:"",note:""};
  const [form,setForm]=useState(ef);

  useEffect(()=>{const u=listenCol(COL.tasks,d=>{setTasks(d);setLoading(false);});return()=>u();},[]);

  const overdueTasks=useMemo(()=>tasks.filter(t=>!t.done&&du(t.dueDate)!==null&&du(t.dueDate)<0),[tasks]);
  const dc=tasks.filter(t=>t.done).length;

  const filtered=useMemo(()=>tasks.filter(t=>{
    if(!showDone&&t.done)return false;
    if(filterView==="pending"&&t.done)return false;
    if(filterView==="overdue"&&(t.done||du(t.dueDate)===null||du(t.dueDate)>=0))return false;
    if(filterView==="recurring"&&t.recur==="none")return false;
    if(filterView==="done"&&!t.done)return false;
    if(filterPerson!=="all"&&t.person!==filterPerson&&t.person!=="Both")return false;
    if(filterCat!=="all"&&t.cat!==filterCat)return false;
    return true;
  }).sort((a,b)=>{
    const p={high:0,medium:1,low:2};
    if(p[a.priority]!==p[b.priority])return p[a.priority]-p[b.priority];
    return(a.dueDate||"9")>(b.dueDate||"9")?1:-1;
  }),[tasks,filterView,filterPerson,filterCat,showDone]);

  const markDone=async(t)=>{
    const n=t.recur!=="none"?nd(tod(),t.recur):t.dueDate;
    await saveDoc(COL.tasks,t.id,{done:t.recur==="none",lastDone:tod(),dueDate:t.recur!=="none"?n:t.dueDate});
    if(t.recur==="none"){setConfetti(true);setTimeout(()=>setConfetti(false),2400);}
  };
  const del=async(id)=>deleteDocById(COL.tasks,id);
  const save=async()=>{
    if(!form.he.trim())return;
    const id=editId||newId();
    await saveDoc(COL.tasks,id,{...form,id,en:form.he,done:false,lastDone:editId?(tasks.find(t=>t.id===editId)?.lastDone||""):""});
    setShowForm(false);setEditId(null);setForm(ef);
  };
  const openEdit=(t)=>{setForm({...t});setEditId(t.id);setShowForm(true);setOpenDrop(null);};

  // Dropdown helper
  const Dropdown=({id,label,value,options,onChange})=>{
    const isOpen=openDrop===id;
    const cur=options.find(o=>o.v===value)||options[0];
    return(
      <div style={{position:"relative"}}>
        <button onClick={()=>setOpenDrop(isOpen?null:id)} style={{background:TH.input,border:"1px solid "+TH.cardBorder,borderRadius:20,padding:"5px 12px",color:TH.text,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
          {cur.l} <span style={{fontSize:9,color:TH.subText}}>▼</span>
        </button>
        {isOpen&&(
          <div style={{position:"absolute",top:"110%",[isRTL?"right":"left"]:0,background:TH.bg==="dark"||TH.bg==="#0f1117"?"#1e2130":TH.sidebar,border:"1px solid "+TH.cardBorder,borderRadius:10,padding:"4px",zIndex:100,minWidth:130,boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>
            {options.map(o=>(
              <button key={o.v} onClick={()=>{onChange(o.v);setOpenDrop(null);}} style={{display:"block",width:"100%",padding:"7px 12px",background:value===o.v?"rgba(99,102,241,0.15)":"transparent",border:"none",borderRadius:7,color:value===o.v?"#a5b4fc":TH.text,fontSize:12,cursor:"pointer",textAlign:isRTL?"right":"left"}}>
                {o.l}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if(loading)return(<div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,background:TH.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}><div style={{width:28,height:28,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"s 1s linear infinite"}}/>{isRTL?"טוען...":"Loading..."}<style>{"@keyframes s{to{transform:rotate(360deg)}}"}</style></div>);

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,direction:isRTL?"rtl":"ltr",minHeight:"100vh",background:TH.bg,transition:"background .3s,color .3s"}} onClick={()=>openDrop&&setOpenDrop(null)}>
      <Confetti show={confetti}/>

      {/* Header נקי */}
      <div style={{background:TH.bg==="#f1f5f9"?"rgba(255,255,255,0.95)":"rgba(17,19,30,0.95)",borderBottom:"1px solid "+TH.cardBorder,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,position:"sticky",top:0,zIndex:30}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✓</div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:TH.text}}>{isRTL?"משימות":"Tasks"}</div>
            {overdueTasks.length>0
              ?<div style={{fontSize:11,color:"#ef4444",fontWeight:700}}>⚠ {overdueTasks.length} {isRTL?"באיחור":"overdue"}</div>
              :<div style={{fontSize:11,color:"#10b981"}}>🔥 {isRTL?"מסונכרן":"Synced"}</div>
            }
          </div>
        </div>
        {/* כפתור הוספה בולט בצד ימין */}
        <button onClick={e=>{e.stopPropagation();setForm(ef);setEditId(null);setShowForm(!showForm);}} style={{...BTN,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:18,fontWeight:300}}>+</span> {isRTL?"משימה":"Task"}
        </button>
      </div>

      <div style={{padding:"12px 14px",maxWidth:700,margin:"0 auto"}}>

        {/* טופס הוספה — נפתח מהכפתור */}
        {showForm&&(
          <div style={{...CARD,marginBottom:14,borderColor:"rgba(99,102,241,0.35)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",marginBottom:12}}>{editId?(isRTL?"✏️ עריכה":"✏️ Edit"):(isRTL?"+ משימה חדשה":"+ New Task")}</div>
            <div style={{marginBottom:10}}>
              <input value={form.he} onChange={e=>setForm(f=>({...f,he:e.target.value}))} placeholder={isRTL?"שם המשימה...":"Task name..."} style={{...INP,fontSize:15,fontWeight:500}} autoFocus/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"קטגוריה":"Category"}</div>
                <select value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} style={{...INP,appearance:"none"}}>
                  {CATS.map(c=><option key={c.id} value={c.id} style={{background:TH.bg,color:TH.text}}>{c.icon} {isRTL?c.he:c.en}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"עדיפות":"Priority"}</div>
                <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={{...INP,appearance:"none"}}>
                  {["high","medium","low"].map(p=><option key={p} value={p} style={{background:TH.bg,color:TH.text}}>{PL[lang][p]}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"תאריך יעד":"Due date"}</div>
                <input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} style={INP}/>
              </div>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"אחראי":"Assignee"}</div>
                <select value={form.person} onChange={e=>setForm(f=>({...f,person:e.target.value}))} style={{...INP,appearance:"none"}}>
                  {["Raz","Olga",isRTL?"שניהם":"Both"].map(p=><option key={p} style={{background:TH.bg,color:TH.text}}>{p}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"תדירות":"Frequency"}</div>
                <select value={form.recur} onChange={e=>setForm(f=>({...f,recur:e.target.value}))} style={{...INP,appearance:"none"}}>
                  {RECUR.map(r=><option key={r.id} value={r.id} style={{background:TH.bg,color:TH.text}}>{isRTL?r.he:r.en}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{isRTL?"הערה":"Note"}</div>
                <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} onKeyDown={e=>e.stopPropagation()} placeholder={isRTL?"אופציונלי":"Optional"} style={INP}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexDirection:isRTL?"row-reverse":"row"}}>
              <button onClick={save} style={BTN}>{isRTL?"שמור":"Save"}</button>
              <button onClick={()=>{setShowForm(false);setEditId(null);}} style={{...BTN,background:TH.input,color:TH.subText}}>{isRTL?"ביטול":"Cancel"}</button>
            </div>
            <style>{`select option{background:${TH.bg}!important;color:${TH.text}!important;}`}</style>
          </div>
        )}

        {/* פילטרים — תפריטים נפתחים קומפקטיים */}
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}} onClick={e=>e.stopPropagation()}>
          <Dropdown
            id="view"
            value={filterView}
            options={[
              {v:"pending",l:isRTL?"ממתינות":"Pending"},
              {v:"overdue",l:(isRTL?"באיחור":"Overdue")+(overdueTasks.length>0?" ("+overdueTasks.length+")":"")},
              {v:"recurring",l:isRTL?"מחזוריות":"Recurring"},
              {v:"done",l:isRTL?"הושלמו":"Done"},
            ]}
            onChange={setFilterView}
          />
          <Dropdown
            id="person"
            value={filterPerson}
            options={[{v:"all",l:isRTL?"כולם":"All"},{v:"Raz",l:"Raz"},{v:"Olga",l:"Olga"}]}
            onChange={setFilterPerson}
          />
          <Dropdown
            id="cat"
            value={filterCat}
            options={[{v:"all",l:isRTL?"כל סוגים":"All types"},...CATS.map(c=>({v:c.id,l:c.icon+" "+(isRTL?c.he:c.en)}))]}
            onChange={setFilterCat}
          />
          {dc>0&&(
            <button onClick={()=>setShowDone(!showDone)} style={{background:showDone?"rgba(16,185,129,0.15)":TH.input,border:showDone?"1px solid rgba(16,185,129,0.3)":"1px solid "+TH.cardBorder,borderRadius:20,padding:"5px 12px",color:showDone?"#6ee7b7":TH.subText,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
              {showDone?(isRTL?"הסתר":"Hide"):(isRTL?"הושלמו":"Done")} ({dc})
            </button>
          )}
        </div>

        {/* רשימת משימות — נקייה */}
        {filtered.length===0
          ?<div style={{...CARD,textAlign:"center",padding:40,color:TH.subText}}><div style={{fontSize:32,marginBottom:8}}>🎉</div>{isRTL?"אין משימות":"No tasks"}</div>
          :filtered.map(t=>{
            const d=du(t.dueDate),cat=ci(t.cat),ov=d!==null&&d<0;
            const pcolor=PERSON_COLORS[t.person]||"#10b981";
            const pl=isRTL?(t.person==="Both"?"שניהם":t.person):t.person;
            return(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:12,marginBottom:8,background:t.done?"rgba(16,185,129,0.04)":ov?"rgba(239,68,68,0.05)":TH.rowBg,border:t.done?"1px solid rgba(16,185,129,0.12)":ov?"1px solid rgba(239,68,68,0.2)":"1px solid "+TH.cardBorder,[isRTL?"borderRight":"borderLeft"]:"3px solid "+(t.done?"transparent":PC[t.priority]||"#6b7280"),flexDirection:isRTL?"row-reverse":"row"}}>
                {/* Checkbox */}
                <div onClick={()=>!t.done&&markDone(t)} style={{width:22,height:22,borderRadius:7,flexShrink:0,background:t.done?"#10b981":"transparent",border:t.done?"2px solid #10b981":"2px solid "+TH.mutedText,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",cursor:t.done?"default":"pointer"}}>{t.done?"✓":""}</div>
                {/* Content */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexDirection:isRTL?"row-reverse":"row"}}>
                    <span style={{fontSize:15}}>{cat.icon}</span>
                    <span style={{fontSize:14,fontWeight:600,textDecoration:t.done?"line-through":"none",color:t.done?TH.mutedText:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.he}</span>
                    {t.recur!=="none"&&<span style={{fontSize:10,color:"#f59e0b"}}>🔄</span>}
                  </div>
                  <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap",flexDirection:isRTL?"row-reverse":"row",alignItems:"center"}}>
                    <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:PC[t.priority]+"22",color:PC[t.priority],border:"1px solid "+PC[t.priority]+"33"}}>{PL[lang][t.priority]}</span>
                    <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:pcolor+"22",color:pcolor,border:"1px solid "+pcolor+"33"}}>{pl}</span>
                    {d!==null&&!t.done&&<span style={{fontSize:10,fontWeight:700,color:ov?"#ef4444":d===0?"#f59e0b":TH.subText}}>{ov?Math.abs(d)+"d ⚠":d===0?(isRTL?"היום":"Today"):d+"d"}</span>}
                    {t.note&&<span style={{fontSize:10,color:TH.mutedText,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>📝 {t.note}</span>}
                  </div>
                </div>
                {/* Actions */}
                {!t.done&&(
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    <button onClick={()=>markDone(t)} style={{background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:8,padding:"5px 10px",color:"#6ee7b7",fontSize:12,cursor:"pointer"}}>✓</button>
                    <button onClick={()=>openEdit(t)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"5px 8px",color:"#a5b4fc",fontSize:12,cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>del(t.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:8,padding:"5px 8px",color:"#fca5a5",fontSize:12,cursor:"pointer"}}>🗑</button>
                    {t.dueDate&&onAddToCalendar&&<button onClick={()=>onAddToCalendar(t)} style={{background:"rgba(66,133,244,0.12)",border:"1px solid rgba(66,133,244,0.25)",borderRadius:8,padding:"5px 8px",color:"#93c5fd",fontSize:12,cursor:"pointer"}}>📅</button>}
                  </div>
                )}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
