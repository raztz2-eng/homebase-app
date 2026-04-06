import { useState, useEffect } from "react";
import Kelly     from "./Kelly.jsx";
import Shopping  from "./Shopping.jsx";
import Tasks     from "./Tasks.jsx";
import Documents from "./Documents.jsx";
import Expenses  from "./Expenses.jsx";
import { saveDoc, COL } from "./firebase.js";

const T = {
  he: {
    dir:"rtl", appName:"הבית שלנו", appSub:"לוח משפחתי",
    greeting:(h)=>h<12?"בוקר טוב":h<17?"צהריים טובים":"ערב טוב",
    greetingName:"רז ואולגה 👋", members:"חברי משפחה",
    nav:{dashboard:"לוח בקרה",shopping:"קניות",tasks:"משימות",expenses:"הוצאות",car:"רכב",documents:"מסמכים",kelly:"קלי",health:"בריאות"},
    stats:{tasksToday:"משימות היום",completed:"הושלמו",shoppingItems:"פריטי קניות",inList:"ברשימה",monthlyBudget:"תקציב חודשי",remaining:"נותר",healthAlerts:"התראות בריאות",needAttention:"דורשות תשומת לב"},
    tasks:{title:"משימות היום",subtitle:(d,t)=>d+" מתוך "+t+" הושלמו",addTask:"+ הוסף משימה",priority:{high:"דחוף",medium:"בינוני",low:"נמוך"}},
    shopping:{title:"הוספה מהירה",subtitle:"פריטים נפוצים",viewList:"לרשימה המלאה",items:["חלב","לחם","ביצים","קפה","בננות"]},
    health:{title:"בריאות והתראות",subtitle:"תרופות וטיפולים",refillAlert:(n)=>"⚠ "+n+" צריך חידוש",daysLeft:(d)=>d+" ימים",refillSoon:"לחדש בקרוב!",due:"מועד",healthAlerts:(n)=>"⚠ "+n+" התראות"},
    lang:"EN",
  },
  en: {
    dir:"ltr", appName:"HomeBase", appSub:"Family Dashboard",
    greeting:(h)=>h<12?"Good morning":h<17?"Good afternoon":"Good evening",
    greetingName:"Raz & Olga 👋", members:"Members",
    nav:{dashboard:"Dashboard",shopping:"Shopping",tasks:"Tasks",expenses:"Expenses",car:"Car",documents:"Documents",kelly:"Kelly",health:"Health"},
    stats:{tasksToday:"Tasks Today",completed:"completed",shoppingItems:"Shopping Items",inList:"in list",monthlyBudget:"Monthly Budget",remaining:"remaining",healthAlerts:"Health Alerts",needAttention:"need attention"},
    tasks:{title:"Today Tasks",subtitle:(d,t)=>d+" of "+t+" done",addTask:"+ Add task",priority:{high:"High",medium:"Medium",low:"Low"}},
    shopping:{title:"Quick Add",subtitle:"Most frequent",viewList:"View list",items:["Milk","Bread","Eggs","Coffee","Bananas"]},
    health:{title:"Health & Alerts",subtitle:"Medications & treatments",refillAlert:(n)=>"⚠ "+n+" refill needed",daysLeft:(d)=>d+"d left",refillSoon:"Refill soon!",due:"Due",healthAlerts:(n)=>"⚠ "+n+" alerts"},
    lang:"עב",
  },
};

const NAV_ITEMS = [
  {id:"dashboard",icon:"⊞"},{id:"shopping",icon:"🛒"},{id:"tasks",icon:"✓"},
  {id:"expenses",icon:"₪"},{id:"car",icon:"🚗"},{id:"documents",icon:"📁"},
  {id:"kelly",icon:"🐕"},{id:"health",icon:"♥"},
];

const ICONS = ["🥛","🍞","🥚","☕","🍌"];
const HEALTH_ITEMS = [
  {id:1,he:"ויטמין D",en:"Vitamin D",person:"Raz",daysLeft:5,type:"medication",refillAlert:true},
  {id:2,he:"אומגה 3",en:"Omega-3",person:"Olga",daysLeft:14,type:"medication",refillAlert:false},
  {id:3,he:"טיפול פרעושים לקלי",en:"Kelly Flea Treatment",person:"Kelly",dueDate:"28/3",type:"treatment",refillAlert:false},
  {id:4,he:"בדיקת דם שנתית",en:"Annual Blood Test",person:"Raz",dueDate:"5/4",type:"appointment",refillAlert:false},
  {id:5,he:"מטפורמין",en:"Metformin",person:"Olga",daysLeft:6,type:"medication",refillAlert:true},
];

const FULL_SCREEN = ["kelly","shopping","tasks","documents","expenses"];

export default function App() {
  const [lang,setLang]     = useState("he");
  const [activeNav,setNav] = useState("dashboard");
  const [tasks,setTasks]   = useState([
    {id:1,he:"לקבוע תור לרופא שיניים",en:"Book dentist",person:"Raz",done:false,priority:"high"},
    {id:2,he:"לקנות מצרכים",en:"Buy groceries",person:"Olga",done:true,priority:"medium"},
    {id:3,he:"לשלם חשבון חשמל",en:"Pay electricity",person:"Raz",done:false,priority:"high"},
    {id:4,he:"לקבוע וטרינר לקלי",en:"Vet for Kelly",person:"Olga",done:false,priority:"medium"},
    {id:5,he:"תזכורת טיפול ברכב",en:"Car service",person:"Raz",done:false,priority:"low"},
  ]);
  const [sidebarOpen,setSB] = useState(false);
  const [added,setAdded]   = useState({});
  const [now,setNow]       = useState(new Date());

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t); },[]);

  const tr=T[lang], isRTL=lang==="he";
  const done=tasks.filter(x=>x.done).length;
  const alerts=HEALTH_ITEMS.filter(h=>h.refillAlert);
  const toggleTask=id=>setTasks(p=>p.map(x=>x.id===id?{...x,done:!x.done}:x));
  const addCart=id=>{setAdded(p=>({...p,[id]:true}));setTimeout(()=>setAdded(p=>({...p,[id]:false})),1500);};
  const dateStr=now.toLocaleDateString(lang==="he"?"he-IL":"en-GB",{weekday:"long",day:"numeric",month:"long"});
  const card={background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:24};
  const sidebarSide=isRTL?"right":"left";
  const mainMargin=isRTL?{marginRight:220}:{marginLeft:220};
  const isFullScreen=FULL_SCREEN.includes(activeNav);

  const handleAddTask = async (task) => {
    await saveDoc(COL.tasks, task.id, task);
  };

  return (
    <div style={{fontFamily:"'Outfit',sans-serif",background:"#0f1117",minHeight:"100vh",display:"flex",color:"#e8eaf0",direction:tr.dir}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 60% 40% at 20% 10%,rgba(99,102,241,.12) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 80% 80%,rgba(16,185,129,.08) 0%,transparent 60%)"}}/>
      {sidebarOpen&&<div onClick={()=>setSB(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:40}}/>}

      {/* Sidebar */}
      <aside className={"sidebar"+(sidebarOpen?" open":"")} style={{width:220,background:"rgba(17,19,30,.97)",borderLeft:isRTL?"none":"1px solid rgba(255,255,255,.06)",borderRight:isRTL?"1px solid rgba(255,255,255,.06)":"none",display:"flex",flexDirection:"column",padding:"24px 0",position:"fixed",top:0,bottom:0,[sidebarSide]:0,zIndex:50,transition:"transform .3s ease"}}>
        <div style={{padding:"0 20px 28px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏠</div>
            <div><div style={{fontWeight:700,fontSize:15}}>{tr.appName}</div><div style={{fontSize:11,color:"#6b7280"}}>{tr.appSub}</div></div>
          </div>
        </div>
        <nav style={{flex:1,padding:"16px 12px",display:"flex",flexDirection:"column",gap:2}}>
          {NAV_ITEMS.map(item=>{const active=activeNav===item.id;return(
            <button key={item.id} onClick={()=>{setNav(item.id);setSB(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,border:"none",background:active?"rgba(99,102,241,.15)":"transparent",color:active?"#a5b4fc":"#6b7280",cursor:"pointer",textAlign:isRTL?"right":"left",width:"100%",fontSize:14,fontWeight:active?600:400,borderRight:isRTL?(active?"2px solid #6366f1":"2px solid transparent"):"none",borderLeft:isRTL?"none":(active?"2px solid #6366f1":"2px solid transparent"),flexDirection:isRTL?"row-reverse":"row"}}>
              <span style={{fontSize:16}}>{item.icon}</span>
              <span style={{flex:1}}>{tr.nav[item.id]}</span>
              {item.id==="health"&&alerts.length>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,borderRadius:20,padding:"1px 6px"}}>{alerts.length}</span>}
            </button>
          );})}
        </nav>
        <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{fontSize:11,color:"#4b5563",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>{tr.members}</div>
          <div style={{display:"flex",gap:8}}>
            {[{name:"Raz",color:"#6366f1"},{name:"Olga",color:"#06b6d4"},{name:"Kelly",color:"#10b981"}].map(m=>(
              <div key={m.name} style={{textAlign:"center"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:m.color+"33",border:"2px solid "+m.color+"66",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:m.color}}>{m.name[0]}</div>
                <div style={{fontSize:9,color:"#4b5563",marginTop:3}}>{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content" style={{flex:1,...mainMargin,position:"relative",zIndex:1,minHeight:"100vh"}}>
        {activeNav==="kelly"     && <Kelly     lang={lang} onAddTask={handleAddTask}/>}
        {activeNav==="shopping"  && <Shopping  lang={lang}/>}
        {activeNav==="tasks"     && <Tasks     lang={lang}/>}
        {activeNav==="documents" && <Documents lang={lang}/>}
        {activeNav==="expenses"  && <Expenses/>}

        {!isFullScreen && (
          <>
            <header style={{padding:"20px 32px",background:"rgba(15,17,23,.85)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20,gap:12}}>
              <button className="hamburger" onClick={()=>setSB(!sidebarOpen)} style={{display:"none",background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer",padding:0,flexShrink:0}}>☰</button>
              <div style={{flex:1}}>
                <div style={{fontSize:20,fontWeight:700}}>{tr.greeting(now.getHours())}, {tr.greetingName}</div>
                <div style={{fontSize:13,color:"#6b7280",marginTop:2}}>{dateStr}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                {alerts.length>0&&<div style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",borderRadius:20,padding:"6px 12px",fontSize:12,color:"#fca5a5"}}>{tr.health.healthAlerts(alerts.length)}</div>}
                <button onClick={()=>setLang(lang==="he"?"en":"he")} style={{background:"rgba(99,102,241,.12)",border:"1px solid rgba(99,102,241,.3)",borderRadius:10,padding:"7px 14px",color:"#a5b4fc",fontSize:13,fontWeight:700,cursor:"pointer"}}>{tr.lang}</button>
              </div>
            </header>
            <div style={{padding:"28px 32px"}}>
              <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
                {[{label:tr.stats.tasksToday,value:done+"/"+tasks.length,sub:tr.stats.completed,color:"#6366f1",icon:"✓"},{label:tr.stats.shoppingItems,value:"12",sub:tr.stats.inList,color:"#06b6d4",icon:"🛒"},{label:tr.stats.monthlyBudget,value:"₪4,200",sub:tr.stats.remaining,color:"#10b981",icon:"₪"},{label:tr.stats.healthAlerts,value:String(alerts.length),sub:tr.stats.needAttention,color:"#ef4444",icon:"♥"}].map(s=>(
                  <div key={s.label} style={{...card,borderTop:"2px solid "+s.color+"44"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div><div style={{fontSize:11,color:"#6b7280",textTransform:"uppercase",letterSpacing:1}}>{s.label}</div><div style={{fontSize:26,fontWeight:800,color:s.color,marginTop:4}}>{s.value}</div><div style={{fontSize:12,color:"#4b5563",marginTop:2}}>{s.sub}</div></div>
                      <div style={{width:36,height:36,borderRadius:10,background:s.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="widgets-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                <div style={card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                    <div><h2 style={{margin:0,fontSize:17,fontWeight:700}}>{tr.tasks.title}</h2><div style={{fontSize:12,color:"#6b7280",marginTop:3}}>{tr.tasks.subtitle(done,tasks.length)}</div></div>
                    <button onClick={()=>setNav("tasks")} style={{background:"rgba(99,102,241,.1)",border:"1px solid rgba(99,102,241,.2)",borderRadius:8,padding:"5px 10px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>{isRTL?"כל המשימות ←":"All tasks →"}</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {tasks.map(task=>(<div key={task.id} onClick={()=>toggleTask(task.id)} style={{display:"flex",alignItems:"center",flexDirection:isRTL?"row-reverse":"row",gap:12,padding:"11px 14px",borderRadius:12,cursor:"pointer",background:task.done?"rgba(16,185,129,.06)":"rgba(255,255,255,.03)",border:task.done?"1px solid rgba(16,185,129,.15)":"1px solid rgba(255,255,255,.05)"}}>
                      <div style={{width:20,height:20,borderRadius:6,flexShrink:0,background:task.done?"#10b981":"transparent",border:task.done?"2px solid #10b981":"2px solid rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff"}}>{task.done?"✓":""}</div>
                      <div style={{flex:1,fontSize:14,fontWeight:500,textDecoration:task.done?"line-through":"none",color:task.done?"#4b5563":"#e8eaf0",textAlign:isRTL?"right":"left"}}>{task[lang]||task.he}</div>
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:task.priority==="high"?"rgba(239,68,68,.15)":task.priority==="medium"?"rgba(245,158,11,.15)":"rgba(107,114,128,.15)",color:task.priority==="high"?"#fca5a5":task.priority==="medium"?"#fcd34d":"#9ca3af"}}>{tr.tasks.priority[task.priority]}</span>
                    </div>))}
                  </div>
                  <button onClick={()=>setNav("tasks")} style={{width:"100%",marginTop:14,padding:"10px",background:"rgba(99,102,241,.08)",border:"1px dashed rgba(99,102,241,.3)",borderRadius:10,color:"#a5b4fc",fontSize:13,cursor:"pointer"}}>{tr.tasks.addTask}</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:20}}>
                  <div style={card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                      <div><h2 style={{margin:0,fontSize:17,fontWeight:700}}>{tr.shopping.title}</h2><div style={{fontSize:12,color:"#6b7280",marginTop:3}}>{tr.shopping.subtitle}</div></div>
                      <button onClick={()=>setNav("shopping")} style={{background:"rgba(6,182,212,.1)",border:"1px solid rgba(6,182,212,.2)",borderRadius:8,padding:"6px 12px",color:"#67e8f9",fontSize:12,cursor:"pointer"}}>{tr.shopping.viewList}</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                      {tr.shopping.items.map((name,i)=>(<button key={i} onClick={()=>addCart(i)} style={{background:added[i]?"rgba(16,185,129,.15)":"rgba(255,255,255,.04)",border:added[i]?"1px solid rgba(16,185,129,.3)":"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"12px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}><span style={{fontSize:22}}>{added[i]?"✓":ICONS[i]}</span><span style={{fontSize:10,color:added[i]?"#6ee7b7":"#9ca3af"}}>{name}</span></button>))}
                    </div>
                  </div>
                  <div style={{...card,flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                      <div><h2 style={{margin:0,fontSize:17,fontWeight:700}}>{tr.health.title}</h2><div style={{fontSize:12,color:"#6b7280",marginTop:3}}>{tr.health.subtitle}</div></div>
                      {alerts.length>0&&<div style={{background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"5px 10px",fontSize:11,color:"#fca5a5"}}>{tr.health.refillAlert(alerts.length)}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {HEALTH_ITEMS.map(item=>{const urgent=item.daysLeft!==undefined&&item.daysLeft<=7;return(
                        <div key={item.id} style={{display:"flex",alignItems:"center",flexDirection:isRTL?"row-reverse":"row",gap:12,padding:"11px 14px",borderRadius:12,background:urgent?"rgba(239,68,68,.06)":"rgba(255,255,255,.03)",border:urgent?"1px solid rgba(239,68,68,.2)":"1px solid rgba(255,255,255,.05)"}}>
                          <div style={{width:34,height:34,borderRadius:10,flexShrink:0,background:item.type==="medication"?(urgent?"rgba(239,68,68,.15)":"rgba(99,102,241,.12)"):"rgba(16,185,129,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{item.type==="medication"?"💊":item.type==="treatment"?"🩺":"📅"}</div>
                          <div style={{flex:1,textAlign:isRTL?"right":"left"}}><div style={{fontSize:13,fontWeight:600}}>{item[lang]||item.he}</div><div style={{fontSize:11,color:"#6b7280"}}>{item.person}</div></div>
                          <div style={{textAlign:isRTL?"left":"right",flexShrink:0}}>{item.daysLeft!==undefined?(<><div style={{fontSize:13,fontWeight:700,color:urgent?"#ef4444":"#9ca3af"}}>{tr.health.daysLeft(item.daysLeft)}</div>{urgent&&<div style={{fontSize:10,color:"#ef4444"}}>{tr.health.refillSoon}</div>}</>):(<div style={{fontSize:12,color:"#9ca3af"}}>{tr.health.due} {item.dueDate}</div>)}</div>
                        </div>
                      );})}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;}body{margin:0;}@media(max-width:900px){.widgets-grid{grid-template-columns:1fr!important;}}@media(max-width:768px){.sidebar{transform:translateX(100%);}[dir=ltr] .sidebar{transform:translateX(-100%);}.sidebar.open{transform:translateX(0)!important;}.main-content{margin-left:0!important;margin-right:0!important;}.hamburger{display:flex!important;}.stats-grid{grid-template-columns:repeat(2,1fr)!important;}}"}</style>
    </div>
  );
    }
