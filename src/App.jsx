import { useState, useEffect } from "react";
import Kelly     from "./Kelly.jsx";
import Shopping  from "./Shopping.jsx";
import Tasks     from "./Tasks.jsx";
import Documents from "./Documents.jsx";
import Expenses  from "./Expenses.jsx";
import { saveDoc, listenCol, COL } from "./firebase.js";

const NAV=[
  {id:"dashboard",icon:"⊞",he:"לוח בקרה",en:"Dashboard"},
  {id:"shopping",icon:"🛒",he:"קניות",en:"Shopping"},
  {id:"tasks",icon:"✓",he:"משימות",en:"Tasks"},
  {id:"expenses",icon:"₪",he:"הוצאות",en:"Expenses"},
  {id:"car",icon:"🚗",he:"רכב",en:"Car"},
  {id:"documents",icon:"📁",he:"מסמכים",en:"Documents"},
  {id:"kelly",icon:"🐕",he:"קלי",en:"Kelly"},
];
const FULL=["kelly","shopping","tasks","documents","expenses"];

const THEMES={
  dark:{bg:"#0f1117",card:"rgba(255,255,255,0.02)",cardBorder:"rgba(255,255,255,0.07)",text:"#e8eaf0",subText:"#6b7280",mutedText:"#4b5563",header:"rgba(15,17,23,0.92)",sidebar:"rgba(17,19,30,0.97)",sidebarBorder:"rgba(255,255,255,0.06)",navActive:"rgba(99,102,241,0.15)",navText:"#6b7280",navActiveText:"#a5b4fc",input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.12)",rowBg:"rgba(255,255,255,0.03)"},
  light:{bg:"#f1f5f9",card:"#ffffff",cardBorder:"rgba(0,0,0,0.08)",text:"#1e293b",subText:"#64748b",mutedText:"#94a3b8",header:"rgba(255,255,255,0.95)",sidebar:"#ffffff",sidebarBorder:"rgba(0,0,0,0.08)",navActive:"rgba(99,102,241,0.1)",navText:"#64748b",navActiveText:"#6366f1",input:"rgba(0,0,0,0.04)",inputBorder:"rgba(0,0,0,0.1)",rowBg:"rgba(0,0,0,0.02)"},
};

const toGCalDate=(d)=>d?d.replace(/-/g,""):"";
const addToGCal=(task)=>{
  const s=toGCalDate(task.dueDate);if(!s)return;
  window.open("https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent("🏠 "+(task.he||"משימה"))+"&dates="+s+"/"+s+"&details="+encodeURIComponent("HomeBase\n"+(task.note||""))+"&sf=true","_blank");
};

export default function App(){
  const [lang,setLang]=useState("he");
  const [nav,setNav]=useState("dashboard");
  const [sb,setSb]=useState(false);
  const [now,setNow]=useState(new Date());
  const [tasks,setTasks]=useState([]);
  const [mode,setMode]=useState(()=>localStorage.getItem("hb_theme")||"dark");
  const TH=THEMES[mode];
  const isDark=mode==="dark";

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const u=listenCol(COL.tasks,d=>setTasks(d));return()=>u();},[]);
  useEffect(()=>{localStorage.setItem("hb_theme",mode);},[mode]);

  const isRTL=lang==="he";
  const today=new Date().toISOString().slice(0,10);
  const openTasks=tasks.filter(t=>!t.done);
  const doneTasks=tasks.filter(t=>t.done);
  const overdue=tasks.filter(t=>!t.done&&t.dueDate&&new Date(t.dueDate)<new Date(today));
  const dashTasks=[...openTasks].sort((a,b)=>{
    const p={high:0,medium:1,low:2};
    if(p[a.priority]!==p[b.priority])return p[a.priority]-p[b.priority];
    return(a.dueDate||"9")>(b.dueDate||"9")?1:-1;
  }).slice(0,6);
  const greeting=isRTL?(now.getHours()<12?"בוקר טוב":now.getHours()<17?"צהריים טובים":"ערב טוב"):(now.getHours()<12?"Good morning":now.getHours()<17?"Good afternoon":"Good evening");
  const dateStr=now.toLocaleDateString(isRTL?"he-IL":"en-GB",{weekday:"long",day:"numeric",month:"long"});
  const isFS=FULL.includes(nav);
  const card={background:TH.card,border:"1px solid "+TH.cardBorder,borderRadius:16,padding:16};

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",background:TH.bg,minHeight:"100vh",color:TH.text,direction:isRTL?"rtl":"ltr",transition:"background .3s,color .3s"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{margin:0;overflow-x:hidden;}
        .sb{position:fixed;top:0;bottom:0;width:220px;z-index:50;transition:transform .3s,background .3s;background:${TH.sidebar};}
        .sb.rtl{right:0;left:auto;border-left:1px solid ${TH.sidebarBorder};}
        .sb.ltr{left:0;right:auto;border-right:1px solid ${TH.sidebarBorder};}
        @media(min-width:769px){.sb{transform:translateX(0)!important;}.mw.rtl{margin-right:220px;}.mw.ltr{margin-left:220px;}.hbg{display:none!important;}}
        @media(max-width:768px){.sb.rtl.cl{transform:translateX(100%);}.sb.ltr.cl{transform:translateX(-100%);}.sb.op{transform:translateX(0)!important;}.mw{margin:0!important;}.hbg{display:flex!important;}.sg{grid-template-columns:repeat(2,1fr)!important;}.wg{grid-template-columns:1fr!important;}}
        .bn{display:none;}
        @media(max-width:768px){.bn{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:60;background:${TH.sidebar};border-top:1px solid ${TH.sidebarBorder};padding:6px 0 max(6px,env(safe-area-inset-bottom));}.mw{padding-bottom:70px!important;}}
        select option{background:${isDark?"#1f2937":"#fff"}!important;color:${TH.text}!important;}
      `}</style>

      {sb&&<div onClick={()=>setSb(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:40}}/>}

      {/* Sidebar */}
      <aside className={"sb "+(isRTL?"rtl":"ltr")+" "+(sb?"op":"cl")} style={{display:"flex",flexDirection:"column",padding:"20px 0"}}>
        <div style={{padding:"0 16px 18px",borderBottom:"1px solid "+TH.sidebarBorder}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏠</div>
            <div><div style={{fontWeight:700,fontSize:14,color:TH.text}}>{isRTL?"הבית שלנו":"HomeBase"}</div><div style={{fontSize:10,color:TH.subText}}>{isRTL?"לוח משפחתי":"Family"}</div></div>
          </div>
        </div>
        <nav style={{flex:1,padding:"10px 8px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {NAV.map(item=>{const active=nav===item.id;return(
            <button key={item.id} onClick={()=>{setNav(item.id);setSb(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,border:"none",background:active?TH.navActive:"transparent",color:active?TH.navActiveText:TH.navText,cursor:"pointer",width:"100%",fontSize:13,fontWeight:active?600:400,[isRTL?"borderRight":"borderLeft"]:active?"2px solid #6366f1":"2px solid transparent",flexDirection:isRTL?"row-reverse":"row"}}>
              <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
              <span style={{flex:1,textAlign:isRTL?"right":"left"}}>{isRTL?item.he:item.en}</span>
              {item.id==="tasks"&&overdue.length>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,borderRadius:20,padding:"1px 6px"}}>{overdue.length}</span>}
            </button>
          );})}
        </nav>
        <div style={{padding:"12px 16px",borderTop:"1px solid "+TH.sidebarBorder}}>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            {[{n:"Raz",c:"#6366f1"},{n:"Olga",c:"#06b6d4"},{n:"K",c:"#10b981"}].map(m=>(
              <div key={m.n} style={{textAlign:"center"}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:m.c+"33",border:"2px solid "+m.c+"66",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:m.c}}>{m.n[0]}</div>
                <div style={{fontSize:9,color:TH.mutedText,marginTop:2}}>{m.n}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={"mw "+(isRTL?"rtl":"ltr")} style={{minHeight:"100vh"}}>
        {nav==="kelly"    &&<Kelly     lang={lang} theme={TH} onAddTask={async t=>await saveDoc(COL.tasks,t.id,t)}/>}
        {nav==="shopping" &&<Shopping  lang={lang} theme={TH}/>}
        {nav==="tasks"    &&<Tasks     lang={lang} theme={TH} onNavigate={setNav} onAddToCalendar={addToGCal}/>}
        {nav==="documents"&&<Documents lang={lang} theme={TH}/>}
        {nav==="expenses" &&<Expenses  theme={TH}/>}

        {!isFS&&(
          <div>
            {/* Header */}
            <header style={{padding:"14px 16px",background:TH.header,backdropFilter:"blur(12px)",borderBottom:"1px solid "+TH.cardBorder,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20,gap:10}}>
              <button className="hbg" onClick={()=>setSb(!sb)} style={{background:"none",border:"none",color:TH.subText,fontSize:22,cursor:"pointer",padding:0,flexShrink:0,display:"none"}}>☰</button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:16,fontWeight:700,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{greeting}, {isRTL?"רז ואולגה 👋":"Raz & Olga 👋"}</div>
                <div style={{fontSize:11,color:TH.subText}}>{dateStr}</div>
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
                <button onClick={()=>setMode(m=>m==="dark"?"light":"dark")} style={{background:TH.input,border:"1px solid "+TH.cardBorder,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:16,color:TH.text}}>{mode==="dark"?"☀️":"🌙"}</button>
                <button onClick={()=>setLang(lang==="he"?"en":"he")} style={{background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:8,padding:"5px 10px",color:"#a5b4fc",fontSize:12,fontWeight:700,cursor:"pointer"}}>{isRTL?"EN":"עב"}</button>
              </div>
            </header>

            {/* ── Dashboard — clean & minimal ── */}
            <div style={{padding:"16px"}}>

              {/* Overdue alert banner */}
              {overdue.length>0&&(
                <div onClick={()=>setNav("tasks")} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:20}}>⚠️</span>
                    <div><div style={{fontSize:14,fontWeight:700,color:"#fca5a5"}}>{overdue.length} {isRTL?"משימות באיחור!":"Tasks overdue!"}</div><div style={{fontSize:11,color:"#f87171"}}>{isRTL?"לחץ לצפייה":"Tap to view"}</div></div>
                  </div>
                  <span style={{color:"#fca5a5",fontSize:18}}>{isRTL?"←":"→"}</span>
                </div>
              )}

              {/* Stats — compact */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}} className="sg">
                {[
                  {l:isRTL?"פתוחות":"Open",v:openTasks.length,sub:doneTasks.length+" "+(isRTL?"הושלמו":"done"),c:"#6366f1",icon:"✓",action:"tasks"},
                  {l:isRTL?"קניות":"Shopping",v:"🛒",sub:isRTL?"לחץ לפתיחה":"Tap to open",c:"#06b6d4",icon:"🛒",action:"shopping"},
                  {l:isRTL?"הוצאות":"Expenses",v:"₪",sub:isRTL?"לחץ לפתיחה":"Tap to open",c:"#10b981",icon:"₪",action:"expenses"},
                ].map(s=>(
                  <div key={s.l} onClick={()=>setNav(s.action)} style={{...card,textAlign:"center",borderTop:"2px solid "+s.c+"44",cursor:"pointer",transition:"opacity .2s"}} onMouseOver={e=>e.currentTarget.style.opacity="0.8"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>
                    <div style={{fontSize:22,marginBottom:2}}>{s.icon}</div>
                    <div style={{fontSize:9,color:TH.subText}}>{s.l}</div>
                    <div style={{fontSize:20,fontWeight:800,color:s.c,margin:"2px 0"}}>{s.v}</div>
                    <div style={{fontSize:9,color:TH.mutedText}}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* ── Tasks list — main focus ── */}
              <div style={card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:16,fontWeight:700,color:TH.text}}>{isRTL?"משימות קרובות":"Upcoming Tasks"}</div>
                    <div style={{fontSize:11,color:TH.subText,marginTop:2}}>{isRTL?"ממוינות לפי עדיפות ותאריך":"Sorted by priority & date"}</div>
                  </div>
                  <button onClick={()=>setNav("tasks")} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"6px 12px",color:"#a5b4fc",fontSize:12,fontWeight:600,cursor:"pointer"}}>{isRTL?"כל המשימות →":"All Tasks →"}</button>
                </div>

                {dashTasks.length===0
                  ?<div style={{textAlign:"center",padding:24,color:TH.subText}}>🎉 {isRTL?"אין משימות פתוחות":"No open tasks"}</div>
                  :dashTasks.map(task=>{
                    const dl=task.dueDate?Math.ceil((new Date(task.dueDate)-new Date(today))/86400000):null;
                    const isOv=dl!==null&&dl<0, isT=dl===0;
                    return(
                      <div key={task.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:12,marginBottom:7,background:isOv?"rgba(239,68,68,0.05)":isT?"rgba(245,158,11,0.05)":TH.rowBg||TH.input,border:isOv?"1px solid rgba(239,68,68,0.18)":isT?"1px solid rgba(245,158,11,0.18)":"1px solid "+TH.cardBorder,flexDirection:isRTL?"row-reverse":"row",cursor:"pointer"}} onClick={()=>setNav("tasks")}>
                        <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:task.priority==="high"?"#ef4444":task.priority==="medium"?"#f59e0b":"#6b7280"}}/>
                        <div style={{flex:1,fontSize:14,fontWeight:500,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{task.he}</div>
                        <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}>
                          {isOv&&<span style={{fontSize:10,color:"#ef4444",fontWeight:700}}>{Math.abs(dl)}d</span>}
                          {isT&&<span style={{fontSize:10,color:"#f59e0b",fontWeight:700}}>{isRTL?"היום":"Today"}</span>}
                          {dl!==null&&!isOv&&!isT&&<span style={{fontSize:10,color:TH.subText}}>+{dl}d</span>}
                          {task.dueDate&&<button onClick={e=>{e.stopPropagation();addToGCal(task);}} style={{background:"rgba(66,133,244,0.12)",border:"1px solid rgba(66,133,244,0.25)",borderRadius:6,padding:"2px 6px",color:"#93c5fd",fontSize:11,cursor:"pointer"}}>📅</button>}
                        </div>
                      </div>
                    );
                  })
                }

                <button onClick={()=>setNav("tasks")} style={{width:"100%",marginTop:10,padding:"9px",background:"rgba(99,102,241,0.07)",border:"1px dashed rgba(99,102,241,0.3)",borderRadius:10,color:TH.navActiveText,fontSize:12,cursor:"pointer"}}>
                  + {isRTL?"הוסף משימה":"Add task"}
                </button>
              </div>

              {/* ── Google Calendar widget ── */}
              {dashTasks.filter(t=>t.dueDate).length>0&&(
                <div style={{...card,marginTop:14}}>
                  <div style={{fontSize:14,fontWeight:700,color:TH.text,marginBottom:10}}>🗓️ Google Calendar</div>
                  {dashTasks.filter(t=>t.dueDate).slice(0,3).map(t=>{
                    const dl=Math.ceil((new Date(t.dueDate)-new Date(today))/86400000);
                    return(
                      <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,marginBottom:6,background:TH.rowBg||TH.input,border:"1px solid "+TH.cardBorder}}>
                        <div style={{flex:1,overflow:"hidden"}}>
                          <div style={{fontSize:13,fontWeight:600,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.he}</div>
                          <div style={{fontSize:10,color:dl<0?"#ef4444":dl===0?"#f59e0b":TH.subText,fontWeight:dl<=0?700:400}}>{dl<0?Math.abs(dl)+(isRTL?"d איחור":"d late"):dl===0?(isRTL?"היום!":"Today!"):t.dueDate}</div>
                        </div>
                        <button onClick={()=>addToGCal(t)} style={{background:"rgba(66,133,244,0.12)",border:"1px solid rgba(66,133,244,0.3)",borderRadius:8,padding:"5px 10px",color:"#93c5fd",fontSize:11,cursor:"pointer",[isRTL?"marginRight":"marginLeft"]:8,display:"flex",alignItems:"center",gap:4,fontWeight:600,whiteSpace:"nowrap"}}>
                          📅 {isRTL?"ליומן":"Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <button className="hbg" onClick={()=>setSb(!sb)} style={{position:"fixed",top:14,[isRTL?"left":"right"]:14,zIndex:60,background:TH.header,border:"1px solid "+TH.cardBorder,borderRadius:10,width:40,height:40,display:"none",alignItems:"center",justifyContent:"center",color:TH.text,fontSize:20,cursor:"pointer"}}>☰</button>
      </main>

      {/* Bottom nav */}
      <nav className="bn" style={{background:TH.sidebar,borderTop:"1px solid "+TH.sidebarBorder,justifyContent:"space-around"}}>
        {NAV.slice(0,5).map(item=>(
          <button key={item.id} onClick={()=>setNav(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 8px",background:"none",border:"none",color:nav===item.id?"#a5b4fc":TH.navText,cursor:"pointer",flex:1,fontSize:10,fontWeight:nav===item.id?700:400,position:"relative"}}>
            <span style={{fontSize:20}}>{item.icon}</span>
            <span>{isRTL?item.he:item.en}</span>
            {nav===item.id&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:24,height:2,background:"#6366f1",borderRadius:2}}/>}
            {item.id==="tasks"&&overdue.length>0&&<div style={{position:"absolute",top:2,right:6,width:8,height:8,background:"#ef4444",borderRadius:"50%"}}/>}
          </button>
        ))}
        <button onClick={()=>setSb(!sb)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 8px",background:"none",border:"none",color:TH.navText,cursor:"pointer",flex:1,fontSize:10}}>
          <span style={{fontSize:20}}>☰</span>
          <span>{isRTL?"עוד":"More"}</span>
        </button>
      </nav>
    </div>
  );
    }
