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
const ICONS=["🥛","🍞","🥚","☕","🍌"];
const FULL=["kelly","shopping","tasks","documents","expenses"];

// ── Theme definitions ─────────────────────────────────────
const THEMES={
  dark:{
    bg:"#0f1117",card:"rgba(255,255,255,0.02)",cardBorder:"rgba(255,255,255,0.07)",
    text:"#e8eaf0",subText:"#6b7280",mutedText:"#4b5563",
    header:"rgba(15,17,23,0.9)",sidebar:"rgba(17,19,30,0.97)",
    sidebarBorder:"rgba(255,255,255,0.06)",navActive:"rgba(99,102,241,0.15)",
    navText:"#6b7280",navActiveText:"#a5b4fc",
    input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.12)",
  },
  light:{
    bg:"#f1f5f9",card:"#ffffff",cardBorder:"rgba(0,0,0,0.08)",
    text:"#1e293b",subText:"#64748b",mutedText:"#94a3b8",
    header:"rgba(255,255,255,0.95)",sidebar:"#ffffff",
    sidebarBorder:"rgba(0,0,0,0.08)",navActive:"rgba(99,102,241,0.1)",
    navText:"#64748b",navActiveText:"#6366f1",
    input:"rgba(0,0,0,0.05)",inputBorder:"rgba(0,0,0,0.12)",
  },
};

// ── Google Calendar helpers ───────────────────────────────
const toGCalDate=(dateStr)=>dateStr?dateStr.replace(/-/g,""):"";
const addToGCal=(task)=>{
  const start=toGCalDate(task.dueDate);
  if(!start) return;
  const end=start; // same day
  const title=encodeURIComponent(task.he||(task.en||"משימה"));
  const details=encodeURIComponent((task.note||"")+" | HomeBase");
  const url=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
  window.open(url,"_blank");
};

export default function App(){
  const [lang,setLang]=useState("he");
  const [nav,setNav]=useState("dashboard");
  const [sb,setSb]=useState(false);
  const [added,setAdded]=useState({});
  const [now,setNow]=useState(new Date());
  const [tasks,setTasks]=useState([]);
  const [themeMode,setThemeMode]=useState(()=>localStorage.getItem("hb_theme")||"dark");

  const TH=THEMES[themeMode];

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const u=listenCol(COL.tasks,d=>setTasks(d));return()=>u();},[]);
  useEffect(()=>{localStorage.setItem("hb_theme",themeMode);},[themeMode]);

  const isRTL=lang==="he";
  const today=new Date().toISOString().slice(0,10);
  const openTasks=tasks.filter(t=>!t.done);
  const doneTasks=tasks.filter(t=>t.done);
  const overdue=tasks.filter(t=>!t.done&&t.dueDate&&new Date(t.dueDate)<new Date(today));
  const dashTasks=openTasks.sort((a,b)=>{const p={high:0,medium:1,low:2};if(p[a.priority]!==p[b.priority])return p[a.priority]-p[b.priority];return(a.dueDate||"9")>(b.dueDate||"9")?1:-1;}).slice(0,5);
  const dateStr=now.toLocaleDateString(lang==="he"?"he-IL":"en-GB",{weekday:"long",day:"numeric",month:"long"});
  const greeting=isRTL?(now.getHours()<12?"בוקר טוב":now.getHours()<17?"צהריים טובים":"ערב טוב"):(now.getHours()<12?"Good morning":now.getHours()<17?"Good afternoon":"Good evening");
  const isFS=FULL.includes(nav);

  const card={background:TH.card,border:"1px solid "+TH.cardBorder,borderRadius:16,padding:"16px"};

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",background:TH.bg,minHeight:"100vh",color:TH.text,direction:isRTL?"rtl":"ltr",position:"relative",transition:"background 0.3s,color 0.3s"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{margin:0;overflow-x:hidden;}
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .sidebar{position:fixed;top:0;bottom:0;width:220px;background:${TH.sidebar};z-index:50;transition:transform .3s ease,background .3s;}
        .sidebar.rtl{right:0;left:auto;border-left:1px solid ${TH.sidebarBorder};}
        .sidebar.ltr{left:0;right:auto;border-right:1px solid ${TH.sidebarBorder};}
        @media(min-width:769px){
          .sidebar.rtl{transform:translateX(0)!important;}
          .sidebar.ltr{transform:translateX(0)!important;}
          .main-wrap.rtl{margin-right:220px;}
          .main-wrap.ltr{margin-left:220px;}
          .hamburger{display:none!important;}
        }
        @media(max-width:768px){
          .sidebar.rtl.closed{transform:translateX(100%);}
          .sidebar.ltr.closed{transform:translateX(-100%);}
          .sidebar.open{transform:translateX(0)!important;}
          .main-wrap{margin:0!important;}
          .hamburger{display:flex!important;}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;}
          .widgets-grid{grid-template-columns:1fr!important;}
        }
        .bottom-nav{display:none;}
        @media(max-width:768px){
          .bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:60;background:${TH.sidebar};border-top:1px solid ${TH.sidebarBorder};padding:6px 0 max(6px,env(safe-area-inset-bottom));justify-content:space-around;}
          .main-wrap{padding-bottom:70px!important;}
        }
        select option{background:${themeMode==="dark"?"#1f2937":"#ffffff"}!important;color:${TH.text}!important;}
        select{color:${TH.text}!important;}
      `}</style>

      {sb&&<div onClick={()=>setSb(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:40}}/>}

      {/* Sidebar */}
      <aside className={"sidebar "+(isRTL?"rtl":"ltr")+" "+(sb?"open":"closed")} style={{display:"flex",flexDirection:"column",padding:"20px 0"}}>
        <div style={{padding:"0 16px 20px",borderBottom:"1px solid "+TH.sidebarBorder}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏠</div>
            <div><div style={{fontWeight:700,fontSize:14,color:TH.text}}>{isRTL?"הבית שלנו":"HomeBase"}</div><div style={{fontSize:10,color:TH.subText}}>{isRTL?"לוח משפחתי":"Family Dashboard"}</div></div>
          </div>
        </div>
        <nav style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {NAV.map(item=>{const active=nav===item.id;return(
            <button key={item.id} onClick={()=>{setNav(item.id);setSb(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,border:"none",background:active?TH.navActive:"transparent",color:active?TH.navActiveText:TH.navText,cursor:"pointer",width:"100%",fontSize:13,fontWeight:active?600:400,[isRTL?"borderRight":"borderLeft"]:active?"2px solid #6366f1":"2px solid transparent",flexDirection:isRTL?"row-reverse":"row",textAlign:isRTL?"right":"left"}}>
              <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
              <span style={{flex:1}}>{isRTL?item.he:item.en}</span>
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
      <main className={"main-wrap "+(isRTL?"rtl":"ltr")} style={{minHeight:"100vh"}}>
        {nav==="kelly"&&<Kelly lang={lang} onAddTask={async t=>await saveDoc(COL.tasks,t.id,t)}/>}
        {nav==="shopping"&&<Shopping lang={lang}/>}
        {nav==="tasks"&&<Tasks lang={lang} onNavigate={setNav} onAddToCalendar={addToGCal}/>}
        {nav==="documents"&&<Documents lang={lang}/>}
        {nav==="expenses"&&<Expenses/>}

        {!isFS&&(
          <div>
            {/* Header */}
            <header style={{padding:"14px 16px",background:TH.header,backdropFilter:"blur(10px)",borderBottom:"1px solid "+TH.cardBorder,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20,gap:10}}>
              <button className="hamburger" onClick={()=>setSb(!sb)} style={{background:"none",border:"none",color:TH.subText,fontSize:22,cursor:"pointer",padding:0,flexShrink:0,display:"none"}}>☰</button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:16,fontWeight:700,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{greeting}, {isRTL?"רז ואולגה 👋":"Raz & Olga 👋"}</div>
                <div style={{fontSize:11,color:TH.subText}}>{dateStr}</div>
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
                {/* Theme toggle */}
                <button onClick={()=>setThemeMode(m=>m==="dark"?"light":"dark")} title={themeMode==="dark"?"מצב יום":"מצב לילה"} style={{background:themeMode==="dark"?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",border:"1px solid "+TH.cardBorder,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",gap:4,color:TH.text}}>
                  {themeMode==="dark"?"☀️":"🌙"}
                </button>
                {overdue.length>0&&<div style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:20,padding:"4px 10px",fontSize:11,color:"#fca5a5"}}>⚠ {overdue.length}</div>}
                <button onClick={()=>setLang(lang==="he"?"en":"he")} style={{background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:8,padding:"5px 10px",color:"#a5b4fc",fontSize:12,fontWeight:700,cursor:"pointer"}}>{isRTL?"EN":"עב"}</button>
              </div>
            </header>

            {/* Dashboard */}
            <div style={{padding:"16px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}} className="stats-grid">
                {[
                  {l:isRTL?"משימות":"Tasks",v:openTasks.length+"/"+tasks.length,sub:doneTasks.length+" "+(isRTL?"הושלמו":"done"),c:"#6366f1",icon:"✓"},
                  {l:isRTL?"קניות":"Shopping",v:"12",sub:isRTL?"ברשימה":"in list",c:"#06b6d4",icon:"🛒"},
                  {l:isRTL?"תקציב":"Budget",v:"₪4,200",sub:isRTL?"נותר":"left",c:"#10b981",icon:"₪"},
                  {l:isRTL?"באיחור":"Overdue",v:String(overdue.length),sub:isRTL?"משימות":"tasks",c:"#ef4444",icon:"⚠️"},
                ].map(s=>(
                  <div key={s.l} style={{...card,textAlign:"center",borderTop:"2px solid "+s.c+"44"}}>
                    <div style={{fontSize:18,marginBottom:2}}>{s.icon}</div>
                    <div style={{fontSize:9,color:TH.subText}}>{s.l}</div>
                    <div style={{fontSize:18,fontWeight:800,color:s.c,margin:"2px 0"}}>{s.v}</div>
                    <div style={{fontSize:9,color:TH.mutedText}}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="widgets-grid">
                {/* Tasks */}
                <div style={card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div><div style={{fontSize:15,fontWeight:700,color:TH.text}}>{isRTL?"משימות דחופות":"Urgent Tasks"}</div><div style={{fontSize:11,color:TH.subText}}>{isRTL?"לפי עדיפות":"By priority"}</div></div>
                    <button onClick={()=>setNav("tasks")} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"4px 10px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>{isRTL?"הכל →":"All →"}</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {dashTasks.length===0?(<div style={{textAlign:"center",padding:16,color:TH.subText,fontSize:13}}>🎉 {isRTL?"אין משימות פתוחות":"No open tasks"}</div>):
                    dashTasks.map(task=>{
                      const dl=task.dueDate?Math.ceil((new Date(task.dueDate)-new Date(today))/86400000):null;
                      const isOv=dl!==null&&dl<0,isT=dl===0;
                      return(
                        <div key={task.id} style={{display:"flex",alignItems:"center",flexDirection:isRTL?"row-reverse":"row",gap:10,padding:"9px 12px",borderRadius:10,background:isOv?"rgba(239,68,68,0.06)":isT?"rgba(245,158,11,0.06)":TH.input,border:isOv?"1px solid rgba(239,68,68,0.2)":isT?"1px solid rgba(245,158,11,0.2)":"1px solid "+TH.cardBorder}}>
                          <div style={{width:18,height:18,borderRadius:5,flexShrink:0,border:"2px solid "+TH.mutedText}}/>
                          <div style={{flex:1,fontSize:13,fontWeight:500,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isRTL?task.he:(task.en||task.he)}</div>
                          <div style={{display:"flex",gap:4,flexShrink:0,alignItems:"center"}}>
                            {task.priority==="high"&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"rgba(239,68,68,0.15)",color:"#fca5a5"}}>{isRTL?"דחוף":"High"}</span>}
                            {isOv&&<span style={{fontSize:9,color:"#ef4444",fontWeight:700}}>{Math.abs(dl)}d</span>}
                            {isT&&<span style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>{isRTL?"היום":"Today"}</span>}
                            {task.dueDate&&<button onClick={()=>addToGCal(task)} title={isRTL?"הוסף ליומן":"Add to Calendar"} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,padding:"1px 3px",opacity:0.6}}>📅</button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={()=>setNav("tasks")} style={{width:"100%",marginTop:12,padding:"8px",background:"rgba(99,102,241,0.08)",border:"1px dashed rgba(99,102,241,0.3)",borderRadius:10,color:"#a5b4fc",fontSize:12,cursor:"pointer"}}>+ {isRTL?"הוסף משימה":"Add task"}</button>
                </div>

                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  {/* Quick add */}
                  <div style={card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{fontSize:15,fontWeight:700,color:TH.text}}>{isRTL?"הוספה מהירה":"Quick Add"}</div>
                      <button onClick={()=>setNav("shopping")} style={{background:"rgba(6,182,212,0.1)",border:"1px solid rgba(6,182,212,0.2)",borderRadius:8,padding:"4px 10px",color:"#67e8f9",fontSize:11,cursor:"pointer"}}>{isRTL?"לרשימה":"List"}</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
                      {(isRTL?["חלב","לחם","ביצים","קפה","בננות"]:["Milk","Bread","Eggs","Coffee","Bananas"]).map((name,i)=>(<button key={i} onClick={()=>{setAdded(p=>({...p,[i]:true}));setTimeout(()=>setAdded(p=>({...p,[i]:false})),1500);}} style={{background:added[i]?"rgba(16,185,129,0.15)":TH.input,border:added[i]?"1px solid rgba(16,185,129,0.3)":"1px solid "+TH.cardBorder,borderRadius:10,padding:"10px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:18}}>{added[i]?"✓":ICONS[i]}</span><span style={{fontSize:9,color:added[i]?"#6ee7b7":TH.subText}}>{name}</span></button>))}
                    </div>
                  </div>
                  {/* Recent tasks for calendar */}
                  <div style={card}>
                    <div style={{fontSize:15,fontWeight:700,color:TH.text,marginBottom:12}}>🗓️ {isRTL?"הוסף ליומן":"Add to Calendar"}</div>
                    <div style={{fontSize:12,color:TH.subText,marginBottom:10}}>{isRTL?"לחץ 📅 ליד משימה להוסיף ל-Google Calendar":"Click 📅 next to a task to add to Google Calendar"}</div>
                    {dashTasks.filter(t=>t.dueDate).slice(0,3).map(t=>(
                      <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,marginBottom:6,background:TH.input,border:"1px solid "+TH.cardBorder}}>
                        <div style={{flex:1,overflow:"hidden"}}>
                          <div style={{fontSize:12,fontWeight:600,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isRTL?t.he:(t.en||t.he)}</div>
                          <div style={{fontSize:10,color:TH.subText}}>{t.dueDate}</div>
                        </div>
                        <button onClick={()=>addToGCal(t)} style={{background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:7,padding:"4px 8px",color:"#a5b4fc",fontSize:11,cursor:"pointer",flexShrink:0,marginRight:isRTL?8:0,marginLeft:isRTL?0:8}}>📅 {isRTL?"ליומן":"Calendar"}</button>
                      </div>
                    ))}
                    {dashTasks.filter(t=>t.dueDate).length===0&&<div style={{fontSize:12,color:TH.mutedText,textAlign:"center",padding:12}}>{isRTL?"הוסף תאריך למשימות כדי לראות כאן":"Add dates to tasks to see them here"}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hamburger */}
        <button className="hamburger" onClick={()=>setSb(!sb)} style={{position:"fixed",top:14,[isRTL?"left":"right"]:14,zIndex:60,background:TH.header,border:"1px solid "+TH.cardBorder,borderRadius:10,width:40,height:40,display:"none",alignItems:"center",justifyContent:"center",color:TH.text,fontSize:20,cursor:"pointer"}}>☰</button>
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav" style={{background:TH.sidebar,borderTop:"1px solid "+TH.sidebarBorder}}>
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
