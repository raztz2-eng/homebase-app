import { useState, useEffect } from "react";
import Kelly     from "./Kelly.jsx";
import Shopping  from "./Shopping.jsx";
import Tasks     from "./Tasks.jsx";
import Documents from "./Documents.jsx";
import Expenses  from "./Expenses.jsx";
import { saveDoc, listenCol, COL } from "./firebase.js";

const NAV_ITEMS = [
  {id:"dashboard",icon:"⊞"},{id:"shopping",icon:"🛒"},{id:"tasks",icon:"✓"},
  {id:"expenses",icon:"₪"},{id:"car",icon:"🚗"},{id:"documents",icon:"📁"},
  {id:"kelly",icon:"🐕"},{id:"health",icon:"♥"},
];
const ICONS = ["🥛","🍞","🥚","☕","🍌"];
const FULL_SCREEN = ["kelly","shopping","tasks","documents","expenses"];

const T = {
  he:{dir:"rtl",appName:"הבית שלנו",appSub:"לוח משפחתי",
    greeting:(h)=>h<12?"בוקר טוב":h<17?"צהריים טובים":"ערב טוב",
    greetingName:"רז ואולגה 👋",members:"חברי משפחה",
    nav:{dashboard:"לוח בקרה",shopping:"קניות",tasks:"משימות",expenses:"הוצאות",car:"רכב",documents:"מסמכים",kelly:"קלי",health:"בריאות"},
    addTask:"+ הוסף משימה",viewAll:"כל המשימות",quickAdd:"הוספה מהירה",frequent:"פריטים נפוצים",viewList:"לרשימה",
    items:["חלב","לחם","ביצים","קפה","בננות"],
    health:"בריאות והתראות",meds:"תרופות וטיפולים",refill:"צריך חידוש",daysLeft:(d)=>d+" ימים",soon:"לחדש!",due:"מועד",
    lang:"EN",urgent:"דחוף",today2:"היום",overdue:"באיחור",
  },
  en:{dir:"ltr",appName:"HomeBase",appSub:"Family Dashboard",
    greeting:(h)=>h<12?"Good morning":h<17?"Good afternoon":"Good evening",
    greetingName:"Raz & Olga 👋",members:"Members",
    nav:{dashboard:"Dashboard",shopping:"Shopping",tasks:"Tasks",expenses:"Expenses",car:"Car",documents:"Documents",kelly:"Kelly",health:"Health"},
    addTask:"+ Add task",viewAll:"View all",quickAdd:"Quick Add",frequent:"Most frequent",viewList:"View list",
    items:["Milk","Bread","Eggs","Coffee","Bananas"],
    health:"Health & Alerts",meds:"Medications",refill:"refill needed",daysLeft:(d)=>d+"d left",soon:"Refill soon!",due:"Due",
    lang:"עב",urgent:"Urgent",today2:"Today",overdue:"Overdue",
  },
};

const HEALTH = [
  {id:1,he:"ויטמין D",en:"Vitamin D",person:"Raz",daysLeft:5,type:"medication",alert:true},
  {id:2,he:"אומגה 3",en:"Omega-3",person:"Olga",daysLeft:14,type:"medication",alert:false},
  {id:3,he:"פרעושים קלי",en:"Kelly Flea Treatment",person:"Kelly",dueDate:"28/3",type:"treatment",alert:false},
  {id:4,he:"בדיקת דם",en:"Blood Test",person:"Raz",dueDate:"5/4",type:"appointment",alert:false},
  {id:5,he:"מטפורמין",en:"Metformin",person:"Olga",daysLeft:6,type:"medication",alert:true},
];

export default function App(){
  const [lang,setLang]=useState("he");
  const [activeNav,setNav]=useState("dashboard");
  const [sidebarOpen,setSB]=useState(false);
  const [added,setAdded]=useState({});
  const [now,setNow]=useState(new Date());
  const [fbTasks,setFbTasks]=useState([]);

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(t);},[]);
  useEffect(()=>{
    const u=listenCol(COL.tasks,(d)=>setFbTasks(d));
    return()=>u();
  },[]);

  const tr=T[lang],isRTL=lang==="he";
  const today=new Date().toISOString().slice(0,10);
  const card={background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:24};
  const sidebarSide=isRTL?"right":"left";
  const mainMargin=isRTL?{marginRight:220}:{marginLeft:220};
  const isFS=FULL_SCREEN.includes(activeNav);
  const alerts=HEALTH.filter(h=>h.alert);

  const handleAddTask=async(task)=>{await saveDoc(COL.tasks,task.id,task);};
  const toggleTask=async(t)=>{await saveDoc(COL.tasks,t.id,{done:!t.done});};
  const addCart=(i)=>{setAdded(p=>({...p,[i]:true}));setTimeout(()=>setAdded(p=>({...p,[i]:false})),1500);};

  // Dashboard tasks: open, sorted by urgency/date
  const dashTasks = fbTasks
    .filter(t=>!t.done)
    .sort((a,b)=>{
      const priOrder={high:0,medium:1,low:2};
      if(priOrder[a.priority]!==priOrder[b.priority]) return priOrder[a.priority]-priOrder[b.priority];
      const da=a.dueDate?new Date(a.dueDate):new Date("2099-01-01");
      const db=b.dueDate?new Date(b.dueDate):new Date("2099-01-01");
      return da-db;
    })
    .slice(0,5);

  const doneCount=fbTasks.filter(t=>t.done).length;
  const openCount=fbTasks.filter(t=>!t.done).length;
  const overdueCount=fbTasks.filter(t=>!t.done&&t.dueDate&&new Date(t.dueDate)<new Date(today)).length;
  const dateStr=now.toLocaleDateString(lang==="he"?"he-IL":"en-GB",{weekday:"long",day:"numeric",month:"long"});

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",background:"#0f1117",minHeight:"100vh",display:"flex",color:"#e8eaf0",direction:tr.dir}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 60% 40% at 20% 10%,rgba(99,102,241,.12) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 80% 80%,rgba(16,185,129,.08) 0%,transparent 60%)"}}/>
      {sidebarOpen&&<div onClick={()=>setSB(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:40}}/>}

      {/* Sidebar */}
      <aside style={{width:220,background:"rgba(17,19,30,.97)",borderLeft:isRTL?"none":"1px solid rgba(255,255,255,.06)",borderRight:isRTL?"1px solid rgba(255,255,255,.06)":"none",display:"flex",flexDirection:"column",padding:"24px 0",position:"fixed",top:0,bottom:0,[sidebarSide]:0,zIndex:50,transition:"transform .3s ease",transform:sidebarOpen||window.innerWidth>768?"translateX(0)":(isRTL?"translateX(100%)":"translateX(-100%)")}}>
        <div style={{padding:"0 20px 28px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏠</div>
            <div><div style={{fontWeight:700,fontSize:15}}>{tr.appName}</div><div style={{fontSize:11,color:"#6b7280"}}>{tr.appSub}</div></div>
          </div>
        </div>
        <nav style={{flex:1,padding:"16px 12px",display:"flex",flexDirection:"column",gap:2}}>
          {NAV_ITEMS.map(item=>{const active=activeNav===item.id;return(
            <button key={item.id} onClick={()=>{setNav(item.id);setSB(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,border:"none",background:active?"rgba(99,102,241,.15)":"transparent",color:active?"#a5b4fc":"#6b7280",cursor:"pointer",textAlign:isRTL?"right":"left",width:"100%",fontSize:14,fontWeight:active?600:400,[isRTL?"borderRight":"borderLeft"]:active?"2px solid #6366f1":"2px solid transparent",flexDirection:isRTL?"row-reverse":"row"}}>
              <span style={{fontSize:16}}>{item.icon}</span>
              <span style={{flex:1}}>{tr.nav[item.id]}</span>
              {item.id==="health"&&alerts.length>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,borderRadius:20,padding:"1px 6px"}}>{alerts.length}</span>}
              {item.id==="tasks"&&overdueCount>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,borderRadius:20,padding:"1px 6px"}}>{overdueCount}</span>}
            </button>
          );})}
        </nav>
        <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{fontSize:11,color:"#4b5563",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>{tr.members}</div>
          <div style={{display:"flex",gap:8}}>
            {[{name:"Raz",c:"#6366f1"},{name:"Olga",c:"#06b6d4"},{name:"Kelly",c:"#10b981"}].map(m=>(
              <div key={m.name} style={{textAlign:"center"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:m.c+"33",border:"2px solid "+m.c+"66",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:m.c}}>{m.name[0]}</div>
                <div style={{fontSize:9,color:"#4b5563",marginTop:3}}>{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,...mainMargin,position:"relative",zIndex:1,minHeight:"100vh"}}>
        {activeNav==="kelly"     &&<Kelly     lang={lang} onAddTask={handleAddTask}/>}
        {activeNav==="shopping"  &&<Shopping  lang={lang}/>}
        {activeNav==="tasks"     &&<Tasks     lang={lang} onNavigate={setNav}/>}
        {activeNav==="documents" &&<Documents lang={lang}/>}
        {activeNav==="expenses"  &&<Expenses/>}

        {!isFS&&(
          <>
            <header style={{padding:"20px 32px",background:"rgba(15,17,23,.85)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20,gap:12}}>
              <button onClick={()=>setSB(!sidebarOpen)} style={{background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer",padding:0,flexShrink:0}}>☰</button>
              <div style={{flex:1}}>
                <div style={{fontSize:20,fontWeight:700}}>{tr.greeting(now.getHours())}, {tr.greetingName}</div>
                <div style={{fontSize:13,color:"#6b7280",marginTop:2}}>{dateStr}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                {overdueCount>0&&<div style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:20,padding:"6px 12px",fontSize:12,color:"#fca5a5"}}>⚠ {overdueCount} {tr.overdue}</div>}
                <button onClick={()=>setLang(lang==="he"?"en":"he")} style={{background:"rgba(99,102,241,.12)",border:"1px solid rgba(99,102,241,.3)",borderRadius:10,padding:"7px 14px",color:"#a5b4fc",fontSize:13,fontWeight:700,cursor:"pointer"}}>{tr.lang}</button>
              </div>
            </header>
            <div style={{padding:"28px 32px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}} className="stats-grid">
                {[{l:isRTL?"משימות פתוחות":"Open Tasks",v:openCount+"/"+fbTasks.length,sub:doneCount+" "+( isRTL?"הושלמו":"done"),c:"#6366f1",icon:"✓"},
                  {l:isRTL?"פריטי קניות":"Shopping Items",v:"12",sub:isRTL?"ברשימה":"in list",c:"#06b6d4",icon:"🛒"},
                  {l:isRTL?"תקציב חודשי":"Monthly Budget",v:"₪4,200",sub:isRTL?"נותר":"remaining",c:"#10b981",icon:"₪"},
                  {l:isRTL?"התראות בריאות":"Health Alerts",v:String(alerts.length),sub:isRTL?"דורשות תשומת לב":"need attention",c:"#ef4444",icon:"♥"}
                ].map(s=>(
                  <div key={s.l} style={{...card,borderTop:"2px solid "+s.c+"44"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div><div style={{fontSize:11,color:"#6b7280",textTransform:"uppercase",letterSpacing:1}}>{s.l}</div><div style={{fontSize:26,fontWeight:800,color:s.c,marginTop:4}}>{s.v}</div><div style={{fontSize:12,color:"#4b5563",marginTop:2}}>{s.sub}</div></div>
                      <div style={{width:36,height:36,borderRadius:10,background:s.c+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}} className="widgets-grid">
                {/* Tasks widget - synced with Firebase */}
                <div style={card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                    <div><h2 style={{margin:0,fontSize:17,fontWeight:700}}>{isRTL?"משימות דחופות":"Urgent Tasks"}</h2><div style={{fontSize:12,color:"#6b7280",marginTop:3}}>{isRTL?"לפי עדיפות ותאריך":"By priority & date"}</div></div>
                    <button onClick={()=>setNav("tasks")} style={{background:"rgba(99,102,241,.1)",border:"1px solid rgba(99,102,241,.2)",borderRadius:8,padding:"5px 10px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>{tr.viewAll} →</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {dashTasks.length===0?(<div style={{textAlign:"center",padding:20,color:"#6b7280",fontSize:14}}>🎉 {isRTL?"אין משימות פתוחות":"No open tasks"}</div>):
                    dashTasks.map(task=>{
                      const daysLeft=task.dueDate?Math.ceil((new Date(task.dueDate)-new Date(today))/86400000):null;
                      const isOverdue=daysLeft!==null&&daysLeft<0;
                      const isToday=daysLeft===0;
                      return(
                        <div key={task.id} onClick={()=>toggleTask(task)} style={{display:"flex",alignItems:"center",flexDirection:isRTL?"row-reverse":"row",gap:12,padding:"11px 14px",borderRadius:12,cursor:"pointer",background:isOverdue?"rgba(239,68,68,0.06)":isToday?"rgba(245,158,11,0.06)":"rgba(255,255,255,.03)",border:isOverdue?"1px solid rgba(239,68,68,0.2)":isToday?"1px solid rgba(245,158,11,0.2)":"1px solid rgba(255,255,255,.05)"}}>
                          <div style={{width:20,height:20,borderRadius:6,flexShrink:0,background:"transparent",border:"2px solid rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff"}}></div>
                          <div style={{flex:1,fontSize:14,fontWeight:500,color:"#e8eaf0",textAlign:isRTL?"right":"left"}}>{isRTL?task.he:(task.en||task.he)}</div>
                          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                            {task.priority==="high"&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:"rgba(239,68,68,0.15)",color:"#fca5a5"}}>{tr.urgent}</span>}
                            {isOverdue&&<span style={{fontSize:10,color:"#ef4444",fontWeight:700}}>{Math.abs(daysLeft)}d {tr.overdue}</span>}
                            {isToday&&<span style={{fontSize:10,color:"#f59e0b",fontWeight:700}}>{tr.today2}!</span>}
                            {daysLeft!==null&&!isOverdue&&!isToday&&<span style={{fontSize:10,color:"#6b7280"}}>{daysLeft}d</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={()=>setNav("tasks")} style={{width:"100%",marginTop:14,padding:"10px",background:"rgba(99,102,241,.08)",border:"1px dashed rgba(99,102,241,.3)",borderRadius:10,color:"#a5b4fc",fontSize:13,cursor:"pointer"}}>{tr.addTask}</button>
                </div>

                <div style={{display:"flex",flexDirection:"column",gap:20}}>
                  {/* Shopping widget */}
                  <div style={card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                      <div><h2 style={{margin:0,fontSize:17,fontWeight:700}}>{tr.quickAdd}</h2><div style={{fontSize:12,color:"#6b7280",marginTop:3}}>{tr.frequent}</div></div>
                      <button onClick={()=>setNav("shopping")} style={{background:"rgba(6,182,212,.1)",border:"1px solid rgba(6,182,212,.2)",borderRadius:8,padding:"6px 12px",color:"#67e8f9",fontSize:12,cursor:"pointer"}}>{tr.viewList}</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                      {tr.items.map((name,i)=>(<button key={i} onClick={()=>addCart(i)} style={{background:added[i]?"rgba(16,185,129,.15)":"rgba(255,255,255,.04)",border:added[i]?"1px solid rgba(16,185,129,.3)":"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"12px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}><span style={{fontSize:22}}>{added[i]?"✓":ICONS[i]}</span><span style={{fontSize:10,color:added[i]?"#6ee7b7":"#9ca3af"}}>{name}</span></button>))}
                    </div>
                  </div>
                  {/* Health widget */}
                  <div style={{...card,flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                      <div><h2 style={{margin:0,fontSize:17,fontWeight:700}}>{tr.health}</h2><div style={{fontSize:12,color:"#6b7280",marginTop:3}}>{tr.meds}</div></div>
                      {alerts.length>0&&<div style={{background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"5px 10px",fontSize:11,color:"#fca5a5"}}>⚠ {alerts.length} {tr.refill}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {HEALTH.map(item=>{const urgent=item.daysLeft!==undefined&&item.daysLeft<=7;return(
                        <div key={item.id} style={{display:"flex",alignItems:"center",flexDirection:isRTL?"row-reverse":"row",gap:12,padding:"11px 14px",borderRadius:12,background:urgent?"rgba(239,68,68,.06)":"rgba(255,255,255,.03)",border:urgent?"1px solid rgba(239,68,68,.2)":"1px solid rgba(255,255,255,.05)"}}>
                          <div style={{width:34,height:34,borderRadius:10,flexShrink:0,background:item.type==="medication"?(urgent?"rgba(239,68,68,.15)":"rgba(99,102,241,.12)"):"rgba(16,185,129,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{item.type==="medication"?"💊":item.type==="treatment"?"🩺":"📅"}</div>
                          <div style={{flex:1,textAlign:isRTL?"right":"left"}}><div style={{fontSize:13,fontWeight:600}}>{item[lang]||item.he}</div><div style={{fontSize:11,color:"#6b7280"}}>{item.person}</div></div>
                          <div style={{textAlign:isRTL?"left":"right",flexShrink:0}}>{item.daysLeft!==undefined?(<><div style={{fontSize:13,fontWeight:700,color:urgent?"#ef4444":"#9ca3af"}}>{tr.daysLeft(item.daysLeft)}</div>{urgent&&<div style={{fontSize:10,color:"#ef4444"}}>{tr.soon}</div>}</>):(<div style={{fontSize:12,color:"#9ca3af"}}>{tr.due} {item.dueDate}</div>)}</div>
                        </div>
                      );})}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hamburger button - always visible on full screen pages */}
        {isFS&&(
          <button onClick={()=>setSB(!sidebarOpen)} style={{position:"fixed",top:16,[isRTL?"left":"right"]:16,zIndex:60,background:"rgba(17,19,30,0.9)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",color:"#e8eaf0",fontSize:20,cursor:"pointer"}}>☰</button>
        )}
      </main>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;}body{margin:0;}@media(max-width:900px){.widgets-grid{grid-template-columns:1fr!important;}}@media(max-width:768px){.main-content{margin-left:0!important;margin-right:0!important;}.stats-grid{grid-template-columns:repeat(2,1fr)!important;}}"}</style>
    </div>
  );
  }
