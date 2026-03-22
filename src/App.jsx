import { useState } from "react";

const T = {
  he: {
    dir:"rtl", appName:"הבית שלנו", lang:"EN",
    nav:{ dashboard:"בית", shopping:"קניות", tasks:"משימות", expenses:"הוצאות", health:"בריאות", more:"עוד" },
    dashboard:{ greeting:(h)=>h<12?"בוקר טוב":h<17?"צהריים טובים":"ערב טוב", names:"רז ואולגה 👋",
      tasksWidget:"משימות היום", healthWidget:"בריאות והתראות",
      completed:(d,t)=>`${d} מתוך ${t} הושלמו` },
    shopping:{ title:"רשימת קניות", add:"הוסף פריט", placeholder:"שם המוצר...",
      empty:"הרשימה ריקה! הוסף פריטים 🛒", bought:"נקנה", clearBought:"נקה שנקנה" },
    tasks:{ title:"משימות", add:"משימה חדשה", placeholder:"תיאור המשימה...",
      priorities:{ high:"דחוף", medium:"בינוני", low:"נמוך" },
      done:"הושלם", empty:"אין משימות! 🎉", add_btn:"הוסף" },
    expenses:{ title:"הוצאות", add:"הוצאה חדשה", amount:"סכום (₪)", desc:"תיאור",
      total:"סה״כ החודש", empty:"אין הוצאות החודש 💰",
      cats:["מזון","תחבורה","בריאות","בית","בילויים","ביגוד","אחר"] },
    health:{ title:"בריאות", medications:"תרופות", addMed:"הוסף תרופה",
      name:"שם התרופה", daysLeft:"ימים שנשארו", refillNeeded:"🔴 צריך לחדש!",
      daysLeftText:(d)=>`נשארו ${d} ימים`, people:["Raz","Olga","Kelly"] },
    more:{ title:"עוד", documents:"מסמכים 📄", kelly:"קלי 🐕", settings:"הגדרות ⚙️", language:"שפה" },
  },
  en: {
    dir:"ltr", appName:"HomeBase", lang:"עב",
    nav:{ dashboard:"Home", shopping:"Shop", tasks:"Tasks", expenses:"Money", health:"Health", more:"More" },
    dashboard:{ greeting:(h)=>h<12?"Good morning":h<17?"Good afternoon":"Good evening", names:"Raz & Olga 👋",
      tasksWidget:"Today's Tasks", healthWidget:"Health Alerts",
      completed:(d,t)=>`${d} of ${t} done` },
    shopping:{ title:"Shopping List", add:"Add Item", placeholder:"Product name...",
      empty:"List is empty! Add items 🛒", bought:"Bought", clearBought:"Clear bought" },
    tasks:{ title:"Tasks", add:"New Task", placeholder:"Task description...",
      priorities:{ high:"Urgent", medium:"Medium", low:"Low" },
      done:"Done", empty:"No tasks! 🎉", add_btn:"Add" },
    expenses:{ title:"Expenses", add:"New Expense", amount:"Amount (₪)", desc:"Description",
      total:"Total this month", empty:"No expenses this month 💰",
      cats:["Food","Transport","Health","Home","Entertainment","Clothing","Other"] },
    health:{ title:"Health", medications:"Medications", addMed:"Add Medication",
      name:"Medication Name", daysLeft:"Days Left", refillNeeded:"🔴 Refill Needed!",
      daysLeftText:(d)=>`${d} days left`, people:["Raz","Olga","Kelly"] },
    more:{ title:"More", documents:"Documents 📄", kelly:"Kelly 🐕", settings:"Settings ⚙️", language:"Language" },
  },
};

const INIT_TASKS=[{id:1,he:"לקבוע תור לרופא שיניים",en:"Book dentist",person:"Raz",priority:"high",done:false},{id:2,he:"לקנות מצרכים",en:"Buy groceries",person:"Olga",priority:"medium",done:true},{id:3,he:"לשלם חשבון חשמל",en:"Pay electricity",person:"Raz",priority:"high",done:false},{id:4,he:"וטרינר לקלי",en:"Vet for Kelly",person:"Olga",priority:"medium",done:false}];
const INIT_SHOPPING=[{id:1,he:"חלב",en:"Milk",done:false},{id:2,he:"לחם",en:"Bread",done:false},{id:3,he:"ביצים",en:"Eggs",done:true},{id:4,he:"קפה",en:"Coffee",done:false},{id:5,he:"בננות",en:"Bananas",done:false}];
const INIT_MEDS=[{id:1,he:"ויטמין D",en:"Vitamin D",person:"Raz",daysLeft:5},{id:2,he:"אומגה 3",en:"Omega-3",person:"Olga",daysLeft:14},{id:3,he:"מטפורמין",en:"Metformin",person:"Olga",daysLeft:6}];
const INIT_EXPENSES=[{id:1,desc:"סופרמרקט",amount:320,cat:"מזון",date:"20/3"},{id:2,desc:"דלק",amount:180,cat:"תחבורה",date:"19/3"},{id:3,desc:"פארם",amount:95,cat:"בריאות",date:"18/3"}];

const C={bg:"#0f1117",card:"rgba(255,255,255,0.04)",border:"rgba(255,255,255,0.08)",purple:"#6366f1",cyan:"#06b6d4",green:"#10b981",red:"#ef4444",yellow:"#f59e0b",text:"#e8eaf0",muted:"#6b7280",dim:"#1f2937"};
const card={background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:10};
const Btn=({onClick,color=C.purple,children,style={}})=>(<button onClick={onClick} style={{background:color,border:"none",borderRadius:10,color:"#fff",padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",...style}}>{children}</button>);
const Input=({value,onChange,placeholder,type="text",style={}})=>(<input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit",...style}}/>);
const Sel=({value,onChange,options,style={}})=>(<select value={value} onChange={onChange} style={{background:"rgba(255,255,255,0.08)",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 12px",color:C.text,fontSize:14,fontFamily:"inherit",...style}}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>);
const Pill=({color,label})=>(<span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:color+"22",border:`1px solid ${color}44`,color}}>{label}</span>);
const prioColor={high:C.red,medium:C.yellow,low:C.muted};
const catEmoji={מזון:"🛒",תחבורה:"🚗",בריאות:"💊",בית:"🏠",בילויים:"🎬"};

export default function App(){
  const [lang,setLang]=useState("he");
  const [page,setPage]=useState("dashboard");
  const [tasks,setTasks]=useState(INIT_TASKS);
  const [shopping,setShopping]=useState(INIT_SHOPPING);
  const [meds,setMeds]=useState(INIT_MEDS);
  const [expenses,setExpenses]=useState(INIT_EXPENSES);
  const t=T[lang],isRTL=lang==="he",now=new Date();

  const Wrap=({children})=>(<div style={{padding:"16px 16px 90px",maxWidth:600,margin:"0 auto"}}>{children}</div>);
  const PageHead=({title,action})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h1 style={{fontSize:22,fontWeight:800,margin:0}}>{title}</h1>{action}</div>);

  const Dashboard=()=>{
    const done=tasks.filter(x=>x.done).length;
    const alerts=meds.filter(m=>m.daysLeft<=7);
    const dateStr=now.toLocaleDateString(lang==="he"?"he-IL":"en-GB",{weekday:"long",day:"numeric",month:"long"});
    return(<Wrap>
      <div style={{marginBottom:22}}>
        <div style={{fontSize:13,color:C.muted}}>{dateStr}</div>
        <div style={{fontSize:22,fontWeight:800,marginTop:4}}>{t.dashboard.greeting(now.getHours())}, {t.dashboard.names}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[{label:t.nav.tasks,value:`${done}/${tasks.length}`,color:C.purple,icon:"✓",go:"tasks"},{label:t.nav.shopping,value:shopping.filter(x=>!x.done).length,color:C.cyan,icon:"🛒",go:"shopping"},{label:t.nav.expenses,value:`₪${expenses.reduce((a,b)=>a+b.amount,0)}`,color:C.green,icon:"₪",go:"expenses"},{label:t.nav.health,value:alerts.length,color:C.red,icon:"♥",go:"health"}].map(s=>(
          <div key={s.label} onClick={()=>setPage(s.go)} style={{...card,cursor:"pointer",borderTop:`2px solid ${s.color}66`,display:"flex",alignItems:"center",gap:12,marginBottom:0}}>
            <div style={{fontSize:24}}>{s.icon}</div>
            <div><div style={{fontSize:11,color:C.muted}}>{s.label}</div><div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div></div>
          </div>
        ))}
      </div>
      <div style={{...card,marginBottom:10}}>
        <div style={{fontWeight:700,marginBottom:12,display:"flex",justifyContent:"space-between"}}>
          <span>{t.dashboard.tasksWidget}</span>
          <span style={{fontSize:12,color:C.muted}}>{t.dashboard.completed(done,tasks.length)}</span>
        </div>
        {tasks.slice(0,4).map(task=>(
          <div key={task.id} onClick={()=>setTasks(p=>p.map(x=>x.id===task.id?{...x,done:!x.done}:x))}
            style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
            <div style={{width:20,height:20,borderRadius:6,flexShrink:0,background:task.done?C.green:"transparent",border:`2px solid ${task.done?C.green:C.dim}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff"}}>{task.done?"✓":""}</div>
            <div style={{flex:1,fontSize:14,textDecoration:task.done?"line-through":"none",color:task.done?C.muted:C.text}}>{task[lang]}</div>
            <Pill color={task.person==="Raz"?C.purple:C.cyan} label={task.person}/>
          </div>
        ))}
        <button onClick={()=>setPage("tasks")} style={{marginTop:10,width:"100%",padding:"9px",background:"transparent",border:`1px dashed ${C.purple}55`,borderRadius:10,color:C.purple,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>→ {t.nav.tasks}</button>
      </div>
      {alerts.length>0&&(<div style={{...card,borderTop:`2px solid ${C.red}66`}}>
        <div style={{fontWeight:700,marginBottom:10,color:C.red}}>⚠ {t.dashboard.healthWidget}</div>
        {alerts.map(m=>(<div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
          <span style={{fontSize:14}}>💊 {m[lang]} <span style={{color:C.muted,fontSize:12}}>({m.person})</span></span>
          <span style={{fontSize:12,color:m.daysLeft<=3?C.red:C.yellow,fontWeight:700}}>{t.health.daysLeftText(m.daysLeft)}</span>
        </div>))}
      </div>)}
    </Wrap>);
  };

  const Shopping=()=>{
    const [showAdd,setShowAdd]=useState(false);
    const [newItem,setNewItem]=useState("");
    const pending=shopping.filter(x=>!x.done),bought=shopping.filter(x=>x.done);
    const add=()=>{if(!newItem.trim())return;setShopping(p=>[{id:Date.now(),he:newItem,en:newItem,done:false},...p]);setNewItem("");setShowAdd(false);};
    return(<Wrap>
      <PageHead title={`${t.shopping.title} (${pending.length})`} action={<Btn onClick={()=>setShowAdd(!showAdd)}>+ {t.shopping.add}</Btn>}/>
      {showAdd&&(<div style={card}><Input value={newItem} onChange={e=>setNewItem(e.target.value)} placeholder={t.shopping.placeholder} style={{marginBottom:10}}/><div style={{display:"flex",gap:8}}><Btn onClick={add} color={C.green} style={{flex:1}}>✓</Btn><Btn onClick={()=>setShowAdd(false)} color={C.dim} style={{flex:1}}>✕</Btn></div></div>)}
      {pending.length===0&&bought.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:C.muted,fontSize:16}}>{t.shopping.empty}</div>}
      {pending.map(item=>(<div key={item.id} style={{...card,display:"flex",alignItems:"center",gap:12}}>
        <div onClick={()=>setShopping(p=>p.map(x=>x.id===item.id?{...x,done:true}:x))} style={{width:26,height:26,borderRadius:8,border:`2px solid ${C.border}`,flexShrink:0,cursor:"pointer"}}/>
        <div style={{flex:1,fontSize:16}}>{item[lang]}</div>
        <button onClick={()=>setShopping(p=>p.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",color:C.red,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
      </div>))}
      {bought.length>0&&(<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,color:C.muted,margin:"16px 0 8px"}}>
          <span>✓ {t.shopping.bought} ({bought.length})</span>
          <button onClick={()=>setShopping(p=>p.filter(x=>!x.done))} style={{background:"none",border:"none",color:C.red,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>🗑 {t.shopping.clearBought}</button>
        </div>
        {bought.map(item=>(<div key={item.id} style={{...card,display:"flex",alignItems:"center",gap:12,opacity:0.45}}>
          <div onClick={()=>setShopping(p=>p.map(x=>x.id===item.id?{...x,done:false}:x))} style={{width:26,height:26,borderRadius:8,background:C.green,flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff"}}>✓</div>
          <div style={{flex:1,fontSize:15,textDecoration:"line-through",color:C.muted}}>{item[lang]}</div>
          <button onClick={()=>setShopping(p=>p.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",color:C.red,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
        </div>))}
      </>)}
    </Wrap>);
  };

  const Tasks=()=>{
    const [showAdd,setShowAdd]=useState(false);
    const [form,setForm]=useState({text:"",person:"Raz",priority:"medium"});
    const add=()=>{if(!form.text.trim())return;setTasks(p=>[{id:Date.now(),he:form.text,en:form.text,person:form.person,priority:form.priority,done:false},...p]);setForm({text:"",person:"Raz",priority:"medium"});setShowAdd(false);};
    const pending=tasks.filter(x=>!x.done),done=tasks.filter(x=>x.done);
    return(<Wrap>
      <PageHead title={`${t.tasks.title} (${pending.length})`} action={<Btn onClick={()=>setShowAdd(!showAdd)}>+ {t.tasks.add}</Btn>}/>
      {showAdd&&(<div style={card}>
        <Input value={form.text} onChange={e=>setForm(p=>({...p,text:e.target.value}))} placeholder={t.tasks.placeholder} style={{marginBottom:8}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <Sel value={form.person} onChange={e=>setForm(p=>({...p,person:e.target.value}))} options={["Raz","Olga","Both"]} style={{width:"100%"}}/>
          <Sel value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} options={["high","medium","low"]} style={{width:"100%"}}/>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={add} color={C.green} style={{flex:1}}>✓ {t.tasks.add_btn}</Btn><Btn onClick={()=>setShowAdd(false)} color={C.dim} style={{flex:1}}>✕</Btn></div>
      </div>)}
      {pending.length===0&&done.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:C.muted,fontSize:16}}>{t.tasks.empty}</div>}
      {pending.map(task=>(<div key={task.id} style={card}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
          <div onClick={()=>setTasks(p=>p.map(x=>x.id===task.id?{...x,done:true}:x))} style={{width:22,height:22,borderRadius:7,border:`2px solid ${C.dim}`,flexShrink:0,cursor:"pointer",marginTop:2}}/>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:500,marginBottom:6}}>{task[lang]}</div><div style={{display:"flex",gap:6}}><Pill color={task.person==="Raz"?C.purple:C.cyan} label={task.person}/><Pill color={prioColor[task.priority]} label={t.tasks.priorities[task.priority]}/></div></div>
          <button onClick={()=>setTasks(p=>p.filter(x=>x.id!==task.id))} style={{background:"none",border:"none",color:C.red,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
      </div>))}
      {done.length>0&&(<>
        <div style={{fontSize:12,color:C.muted,margin:"16px 0 8px",textTransform:"uppercase",letterSpacing:1}}>✓ {t.tasks.done} ({done.length})</div>
        {done.map(task=>(<div key={task.id} style={{...card,opacity:0.45}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div onClick={()=>setTasks(p=>p.map(x=>x.id===task.id?{...x,done:false}:x))} style={{width:22,height:22,borderRadius:7,background:C.green,flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff"}}>✓</div>
            <div style={{flex:1,fontSize:14,textDecoration:"line-through",color:C.muted}}>{task[lang]}</div>
            <button onClick={()=>setTasks(p=>p.filter(x=>x.id!==task.id))} style={{background:"none",border:"none",color:C.red,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
          </div>
        </div>))}
      </>)}
    </Wrap>);
  };

  const Expenses=()=>{
    const [showAdd,setShowAdd]=useState(false);
    const [form,setForm]=useState({desc:"",amount:"",cat:t.expenses.cats[0]});
    const total=expenses.reduce((a,b)=>a+b.amount,0);
    const add=()=>{if(!form.desc||!form.amount)return;setExpenses(p=>[{id:Date.now(),desc:form.desc,amount:Number(form.amount),cat:form.cat,date:`${now.getDate()}/${now.getMonth()+1}`},...p]);setForm({desc:"",amount:"",cat:t.expenses.cats[0]});setShowAdd(false);};
    return(<Wrap>
      <PageHead title={t.expenses.title} action={<Btn onClick={()=>setShowAdd(!showAdd)} color={C.green}>+ {t.expenses.add}</Btn>}/>
      <div style={{...card,borderTop:`2px solid ${C.green}66`,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:12,color:C.muted}}>{t.expenses.total}</div><div style={{fontSize:30,fontWeight:800,color:C.green}}>₪{total.toLocaleString()}</div></div>
        <div style={{fontSize:42}}>💰</div>
      </div>
      {showAdd&&(<div style={card}>
        <Input value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder={t.expenses.desc} style={{marginBottom:8}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <Input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder={t.expenses.amount}/>
          <Sel value={form.cat} onChange={e=>setForm(p=>({...p,cat:e.target.value}))} options={t.expenses.cats} style={{width:"100%"}}/>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={add} color={C.green} style={{flex:1}}>✓</Btn><Btn onClick={()=>setShowAdd(false)} color={C.dim} style={{flex:1}}>✕</Btn></div>
      </div>)}
      {expenses.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:C.muted}}>{t.expenses.empty}</div>}
      {expenses.map(exp=>(<div key={exp.id} style={{...card,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:42,height:42,borderRadius:12,flexShrink:0,background:C.purple+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{catEmoji[exp.cat]||"💳"}</div>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:500}}>{exp.desc}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{exp.cat} · {exp.date}</div></div>
        <div style={{fontWeight:800,fontSize:17}}>₪{exp.amount}</div>
        <button onClick={()=>setExpenses(p=>p.filter(x=>x.id!==exp.id))} style={{background:"none",border:"none",color:C.red,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
      </div>))}
    </Wrap>);
  };

  const Health=()=>{
    const [showAdd,setShowAdd]=useState(false);
    const [form,setForm]=useState({name:"",person:"Raz",daysLeft:"30"});
    const add=()=>{if(!form.name.trim())return;setMeds(p=>[...p,{id:Date.now(),he:form.name,en:form.name,person:form.person,daysLeft:Number(form.daysLeft)}]);setForm({name:"",person:"Raz",daysLeft:"30"});setShowAdd(false);};
    return(<Wrap>
      <PageHead title={t.health.title} action={<Btn onClick={()=>setShowAdd(!showAdd)} color={C.red}>+ {t.health.addMed}</Btn>}/>
      {showAdd&&(<div style={card}>
        <Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder={t.health.name} style={{marginBottom:8}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <Sel value={form.person} onChange={e=>setForm(p=>({...p,person:e.target.value}))} options={t.health.people} style={{width:"100%"}}/>
          <Input type="number" value={form.daysLeft} onChange={e=>setForm(p=>({...p,daysLeft:e.target.value}))} placeholder={t.health.daysLeft}/>
        </div>
        <div style={{display:"flex",gap:8}}><Btn onClick={add} color={C.green} style={{flex:1}}>✓</Btn><Btn onClick={()=>setShowAdd(false)} color={C.dim} style={{flex:1}}>✕</Btn></div>
      </div>)}
      <div style={{fontSize:12,color:C.muted,margin:"4px 0 10px",textTransform:"uppercase",letterSpacing:1}}>💊 {t.health.medications}</div>
      {meds.map(med=>{
        const urgent=med.daysLeft<=7,pct=Math.max(0,Math.min(100,(med.daysLeft/30)*100));
        const color=urgent?C.red:med.daysLeft<=14?C.yellow:C.green;
        return(<div key={med.id} style={{...card,borderLeft:`3px solid ${color}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:26}}>💊</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:15,fontWeight:600}}>{med[lang]}</div>
                <div style={{fontSize:13,fontWeight:700,color}}>{urgent?t.health.refillNeeded:t.health.daysLeftText(med.daysLeft)}</div>
              </div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{med.person}</div>
              <div style={{marginTop:8,height:5,background:C.dim,borderRadius:4}}><div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:4}}/></div>
            </div>
            <button onClick={()=>setMeds(p=>p.filter(x=>x.id!==med.id))} style={{background:"none",border:"none",color:C.red,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
          </div>
        </div>);
      })}
    </Wrap>);
  };

  const More=()=>(<Wrap>
    <PageHead title={t.more.title}/>
    {[{label:t.more.documents,icon:"📄"},{label:t.more.kelly,icon:"🐕"},{label:t.more.settings,icon:"⚙️"}].map(item=>(
      <div key={item.label} style={{...card,display:"flex",alignItems:"center",gap:14,cursor:"pointer",padding:"18px 16px"}}>
        <div style={{fontSize:28}}>{item.icon}</div>
        <div style={{flex:1,fontSize:16,fontWeight:600}}>{item.label}</div>
        <div style={{color:C.muted,fontSize:22}}>{isRTL?"‹":"›"}</div>
      </div>
    ))}
    <div style={{...card,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 16px",marginTop:4}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{fontSize:28}}>🌐</div><div style={{fontSize:16,fontWeight:600}}>{t.more.language}</div></div>
      <button onClick={()=>setLang(lang==="he"?"en":"he")} style={{background:C.purple+"22",border:`1px solid ${C.purple}55`,borderRadius:20,padding:"8px 22px",color:C.purple,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t.lang}</button>
    </div>
  </Wrap>);

  const NAV=[{id:"dashboard",icon:"🏠",label:t.nav.dashboard},{id:"shopping",icon:"🛒",label:t.nav.shopping},{id:"tasks",icon:"✓",label:t.nav.tasks},{id:"expenses",icon:"₪",label:t.nav.expenses},{id:"health",icon:"♥",label:t.nav.health},{id:"more",icon:"···",label:t.nav.more}];
  const PAGES={dashboard:<Dashboard/>,shopping:<Shopping/>,tasks:<Tasks/>,expenses:<Expenses/>,health:<Health/>,more:<More/>};
  const badges={tasks:tasks.filter(x=>!x.done).length,health:meds.filter(m=>m.daysLeft<=7).length};

  return(
    <div style={{fontFamily:"'Outfit','Segoe UI',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,direction:t.dir}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 80% 40% at 50% 0%,rgba(99,102,241,0.07) 0%,transparent 60%)"}}/>
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(15,17,23,0.95)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"13px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:18,fontWeight:800}}>{NAV.find(n=>n.id===page)?.icon} {NAV.find(n=>n.id===page)?.label||t.appName}</div>
        <div style={{fontSize:12,color:C.muted}}>{now.toLocaleDateString(lang==="he"?"he-IL":"en-GB",{day:"numeric",month:"short"})}</div>
      </div>
      <div style={{paddingTop:58,position:"relative",zIndex:1}}>{PAGES[page]}</div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(13,15,21,0.98)",backdropFilter:"blur(20px)",borderTop:`1px solid ${C.border}`,display:"flex",paddingBottom:"env(safe-area-inset-bottom,4px)"}}>
        {NAV.map(n=>{
          const active=page===n.id,badge=badges[n.id]||0;
          return(<button key={n.id} onClick={()=>setPage(n.id)} style={{flex:1,background:"none",border:"none",padding:"10px 4px",cursor:"pointer",position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            {active&&<div style={{position:"absolute",top:0,left:"20%",right:"20%",height:2,background:C.purple,borderRadius:"0 0 4px 4px"}}/>}
            {badge>0&&!active&&<div style={{position:"absolute",top:7,right:"22%",minWidth:16,height:16,borderRadius:8,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",padding:"0 3px"}}>{badge}</div>}
            <div style={{fontSize:active?20:17,lineHeight:1}}>{n.icon}</div>
            <div style={{fontSize:10,fontWeight:active?700:400,color:active?C.purple:C.muted}}>{n.label}</div>
          </button>);
        })}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;}body{margin:0;background:#0f1117;}input,select,button{font-family:inherit;}select option{background:#1a1d2e;color:#e8eaf0;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}`}</style>
    </div>
  );
                     }
