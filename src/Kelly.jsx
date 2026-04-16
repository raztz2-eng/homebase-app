import { useState, useEffect } from "react";
import { listenCol, saveDoc, deleteDocById } from "./firebase.js";

const GEMINI_KEY="AIzaSyCl9eRbYNj8d5IGhCUkimDeCfSPbQwPVNs";
const SECTIONS=["weight","tasks","vaccines","medical","insurance","food","register"];
const DAYS=["א","ב","ג","ד","ה","ו","ש"];
let UID=300; const nid=()=>"k"+String(++UID)+Date.now();
const mf0={date:"",type:"בדיקה",visitDesc:"",treatment:"",treatFreq:1,treatWeeks:1,treatDays:[],treatNote:"",vet:""};

export default function Kelly({lang,onAddTask,theme}){
  const TH=theme||{bg:"#0f1117",card:"rgba(255,255,255,0.03)",cardBorder:"rgba(255,255,255,0.08)",text:"#e8eaf0",subText:"#6b7280",mutedText:"#4b5563",input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.12)",header:"rgba(17,19,30,0.95)"};
  const S={
    card:{background:TH.card,border:"1px solid "+TH.cardBorder,borderRadius:16,padding:20},
    inp:{background:TH.input,border:"1px solid "+TH.inputBorder,borderRadius:10,padding:"9px 12px",color:TH.text,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"},
    btn:{background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"},
    tag:(c)=>({fontSize:11,padding:"2px 8px",borderRadius:20,background:c+"22",color:c,border:"1px solid "+c+"44",fontWeight:600}),
    eBtn:{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 9px",color:"#a5b4fc",fontSize:11,cursor:"pointer"},
    dBtn:{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 9px",color:"#fca5a5",fontSize:11,cursor:"pointer"},
  };

  const [sec,setSec]=useState("weight");
  const [loading,setLoading]=useState(true);
  const [weights,setWeights]=useState([]);
  const [vetTasks,setVetTasks]=useState([]);
  const [vaccines,setVaccines]=useState([]);
  const [medRecs,setMedRecs]=useState([]);
  const [claims,setClaims]=useState([]);
  const [ins,setIns]=useState({provider:"כלל ביטוח",policyNum:"123456789",expiry:"2025-01-01"});
  const [food,setFood]=useState({brand:"Royal Canin",type:"Medium Adult",daily:280,bagKg:15,openDate:"2024-03-01"});
  const [reg,setReg]=useState({chip:"",license:"",licenseExp:"",breed:"לברדור",birthDate:"2019-05-12",color:"שמנת זהב",vet:"",vetPhone:""});
  const [wf,setWf]=useState({date:new Date().toISOString().slice(0,10),kg:"",note:""});
  const [editWId,setEditWId]=useState(null);
  const [vf,setVf]=useState({instruction:"",freq:2,weeks:2,start:new Date().toISOString().slice(0,10),days:[],note:""});
  const [showVf,setShowVf]=useState(false);
  const [addedMain,setAddedMain]=useState({});
  const [vacF,setVacF]=useState({name:"",last:"",next:"",notes:""});
  const [showVacF,setShowVacF]=useState(false);
  const [editVacId,setEditVacId]=useState(null);
  const [mf,setMf]=useState(mf0);
  const [showMf,setShowMf]=useState(false);
  const [editMId,setEditMId]=useState(null);
  const [analyzing,setAnalyzing]=useState(false);
  const [aiResult,setAiResult]=useState("");
  const [treatConfirm,setTreatConfirm]=useState(false);
  const [pendingTreat,setPendingTreat]=useState(null);
  const [editIns,setEditIns]=useState(false);
  const [insForm,setInsForm]=useState({provider:"כלל ביטוח",policyNum:"123456789",expiry:"2025-01-01"});
  const [cf,setCf]=useState({date:"",amount:"",reason:"",status:"הוגש"});
  const [showCf,setShowCf]=useState(false);
  const [editCId,setEditCId]=useState(null);
  const [foodDone,setFoodDone]=useState(false);

  useEffect(()=>{
    const subs=[
      listenCol("kelly_weights",(d)=>{setWeights(d.sort((a,b)=>a.date>b.date?1:-1));setLoading(false);}),
      listenCol("kelly_tasks",(d)=>setVetTasks(d)),
      listenCol("kelly_vaccines",(d)=>setVaccines(d)),
      listenCol("kelly_medical",(d)=>setMedRecs(d.sort((a,b)=>a.date<b.date?1:-1))),
      listenCol("kelly_claims",(d)=>setClaims(d)),
      listenCol("kelly_settings",(d)=>{
        const i=d.find(x=>x.id==="insurance");if(i)setIns(i);
        const f=d.find(x=>x.id==="food");if(f)setFood(f);
        const r=d.find(x=>x.id==="register");if(r)setReg(r);
        setLoading(false);
      }),
    ];
    return()=>subs.forEach(u=>u());
  },[]);

  const taskEnd=(t)=>{const d=new Date(t.start);d.setDate(d.getDate()+t.weeks*7);return d;};
  const taskDL=(t)=>Math.max(0,Math.ceil((taskEnd(t)-Date.now())/86400000));
  const foodDays=()=>{if(!food.openDate)return null;const tot=Math.floor((food.bagKg*1000)/food.daily);const used=Math.floor((Date.now()-new Date(food.openDate))/86400000);return Math.max(0,tot-used);};
  const vacSt=(n)=>{const d=(new Date(n)-Date.now())/86400000;return d<0?"overdue":d<30?"soon":"ok";};
  const SC={overdue:"#ef4444",soon:"#f59e0b",ok:"#10b981"};
  const SL={overdue:"באיחור",soon:"בקרוב",ok:"תקין"};

  const saveW=async()=>{if(!wf.kg)return;const id=editWId||nid();await saveDoc("kelly_weights",id,{...wf,id,kg:parseFloat(wf.kg)});setEditWId(null);setWf({date:new Date().toISOString().slice(0,10),kg:"",note:""}); };
  const toggleDay=(d)=>setVf(p=>({...p,days:p.days.includes(d)?p.days.filter(x=>x!==d):[...p.days,d]}));
  const toggleTD=(d)=>setMf(p=>({...p,treatDays:p.treatDays.includes(d)?p.treatDays.filter(x=>x!==d):[...p.treatDays,d]}));
  const addVT=async()=>{if(!vf.instruction)return;const id=nid();await saveDoc("kelly_tasks",id,{...vf,id});setVf({instruction:"",freq:2,weeks:2,start:new Date().toISOString().slice(0,10),days:[],note:""});setShowVf(false);};
  const delVT=async(id)=>deleteDocById("kelly_tasks",id);
  const addMain=(t)=>{if(onAddTask)onAddTask({id:nid(),he:t.instruction,en:t.instruction,cat:"other",priority:"medium",person:"Both",recur:"weekly",dueDate:taskEnd(t).toISOString().slice(0,10),note:t.note||"",done:false,lastDone:""});setAddedMain(p=>({...p,[t.id]:true}));setTimeout(()=>setAddedMain(p=>({...p,[t.id]:false})),2000);};
  const saveVac=async()=>{if(!vacF.name)return;const id=editVacId||nid();await saveDoc("kelly_vaccines",id,{...vacF,id});setEditVacId(null);setShowVacF(false);setVacF({name:"",last:"",next:"",notes:""});};
  const editVac=(v)=>{setEditVacId(v.id);setVacF({name:v.name,last:v.last,next:v.next,notes:v.notes||""});setShowVacF(true);};
  const delVac=async(id)=>deleteDocById("kelly_vaccines",id);
  const saveMed=async()=>{
    if(!mf.visitDesc&&!mf.treatment)return;
    const id=editMId||nid();await saveDoc("kelly_medical",id,{...mf,id});
    if(mf.treatment&&!editMId){setPendingTreat({id:nid(),instruction:mf.treatment,freq:mf.treatFreq||1,weeks:mf.treatWeeks||1,start:mf.date||new Date().toISOString().slice(0,10),days:mf.treatDays||[],note:mf.treatNote||""});setTreatConfirm(true);}
    setEditMId(null);setShowMf(false);setMf(mf0);
  };
  const editMed=(r)=>{setEditMId(r.id);setMf({date:r.date||"",type:r.type||"בדיקה",visitDesc:r.visitDesc||"",treatment:r.treatment||"",treatFreq:r.treatFreq||1,treatWeeks:r.treatWeeks||1,treatDays:r.treatDays||[],treatNote:r.treatNote||"",vet:r.vet||""});setShowMf(true);};
  const delMed=async(id)=>deleteDocById("kelly_medical",id);
  const confirmTreat=async(yes)=>{if(yes&&pendingTreat)await saveDoc("kelly_tasks",pendingTreat.id,pendingTreat);setTreatConfirm(false);setPendingTreat(null);};
  const analyzeDoc=async(file)=>{
    setAnalyzing(true);setAiResult("");
    try{const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
    const resp=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+GEMINI_KEY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"אתה וטרינר. נתח את המסמך הרפואי ותן סיכום בעברית."},{inline_data:{mime_type:file.type||"application/pdf",data:b64}}]}]})});
    const data=await resp.json();const text=data.candidates?.[0]?.content?.parts?.[0]?.text||"לא ניתן לנתח";setAiResult(text);
    const id=nid();await saveDoc("kelly_medical",id,{id,date:new Date().toISOString().slice(0,10),type:"בדיקה",visitDesc:"ניתוח AI",treatment:"",treatFreq:0,treatWeeks:0,treatDays:[],treatNote:text,vet:"Gemini AI"});
    }catch(e){setAiResult("שגיאה: "+e.message);}setAnalyzing(false);
  };
  const saveIns=async()=>{await saveDoc("kelly_settings","insurance",{...insForm,id:"insurance"});setIns(insForm);setEditIns(false);};
  const saveClm=async()=>{if(!cf.reason)return;const id=editCId||nid();await saveDoc("kelly_claims",id,{...cf,id,amount:parseFloat(cf.amount)||0});setEditCId(null);setShowCf(false);setCf({date:"",amount:"",reason:"",status:"הוגש"});};
  const editClm=(c)=>{setEditCId(c.id);setCf({date:c.date,amount:String(c.amount),reason:c.reason,status:c.status});setShowCf(true);};
  const delClm=async(id)=>deleteDocById("kelly_claims",id);
  const updSt=async(c,s)=>saveDoc("kelly_claims",c.id,{...c,status:s});
  const saveFood=async(k,v)=>{const u={...food,[k]:v,id:"food"};setFood(u);await saveDoc("kelly_settings","food",u);};
  const addFT=()=>{if(onAddTask)onAddTask({id:nid(),he:"לקנות אוכל לקלי",en:"Buy Kelly food",cat:"other",priority:"high",person:"Raz",recur:"none",dueDate:new Date().toISOString().slice(0,10),note:food.brand+" "+food.type,done:false,lastDone:""});setFoodDone(true);setTimeout(()=>setFoodDone(false),3000);};
  const saveReg=async(k,v)=>{const u={...reg,[k]:v,id:"register"};setReg(u);await saveDoc("kelly_settings","register",u);};
  const fd=foodDays();

  if(loading)return(<div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,background:TH.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}><div style={{width:28,height:28,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>מסנכרן...<style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>);

  return(<div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,direction:"rtl",minHeight:"100vh",background:TH.bg,transition:"background .3s,color .3s"}}>
    {/* Treat confirm */}
    {treatConfirm&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{...S.card,maxWidth:380,width:"90%",borderColor:"rgba(99,102,241,0.4)"}}><div style={{fontSize:15,fontWeight:700,color:TH.text,marginBottom:10}}>📋 הוסף לטיפולים?</div><div style={{fontSize:13,color:TH.subText,marginBottom:14}}>האם להוסיף <strong style={{color:"#a5b4fc"}}>"{pendingTreat?.instruction}"</strong> לרשימת הטיפולים?</div><div style={{display:"flex",gap:8}}><button onClick={()=>confirmTreat(true)} style={S.btn}>✅ כן</button><button onClick={()=>confirmTreat(false)} style={{...S.btn,background:TH.input,color:TH.subText}}>לא</button></div></div></div>)}
    {/* Header */}
    <div style={{background:TH.header,borderBottom:"1px solid "+TH.cardBorder,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#10b981,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🐕</div>
      <div><div style={{fontSize:18,fontWeight:800,color:TH.text}}>קלי 🐾</div><div style={{fontSize:11,color:TH.subText}}>לברדור · <span style={{color:"#10b981"}}>🔥 מסונכרן</span></div></div>
      {fd!==null&&fd<7&&(<div style={{marginRight:"auto",background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"6px 12px",display:"flex",alignItems:"center",gap:8}}><span style={{color:"#fca5a5",fontSize:12}}>🚨 נותרו {fd} ימי אוכל!</span><button onClick={addFT} style={{...S.btn,padding:"4px 10px",fontSize:11,background:foodDone?"linear-gradient(135deg,#10b981,#059669)":"linear-gradient(135deg,#ef4444,#dc2626)"}}>{foodDone?"✓ נוסף!":"הוסף משימה"}</button></div>)}
    </div>
    {/* Sub nav */}
    <div style={{background:TH.header,borderBottom:"1px solid "+TH.cardBorder,padding:"0 14px",display:"flex",gap:2,overflowX:"auto"}}>
      {SECTIONS.map(s=>{const labels={weight:"משקל",tasks:"משימות טיפול",vaccines:"חיסונים",medical:"תיק רפואי",insurance:"ביטוח",food:"אוכל",register:"רישום"};return <button key={s} onClick={()=>setSec(s)} style={{background:"none",border:"none",borderBottom:sec===s?"2px solid #6366f1":"2px solid transparent",padding:"10px 12px",color:sec===s?"#a5b4fc":TH.subText,fontSize:13,fontWeight:sec===s?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>{labels[s]}</button>;})}
    </div>
    <div style={{padding:"18px 20px",maxWidth:860,margin:"0 auto"}}>

    {/* WEIGHT */}
    {sec==="weight"&&(<div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:16,color:TH.text}}>מעקב משקל</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
        {[["משקל נוכחי",weights.length?weights[weights.length-1].kg+" kg":"--","#10b981"],["מגמה",weights.length>=2?((weights[weights.length-1].kg-weights[0].kg)>0?"+":"")+(weights[weights.length-1].kg-weights[0].kg).toFixed(1)+" kg":"--","#a5b4fc"],["שקילות",weights.length,"#06b6d4"]].map(([l,v,c])=>(<div key={l} style={{...S.card,textAlign:"center"}}><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{l}</div><div style={{fontSize:24,fontWeight:800,color:c}}>{v}</div></div>))}
      </div>
      {weights.length>0&&(<div style={{...S.card,marginBottom:16}}><div style={{fontSize:12,fontWeight:600,marginBottom:12,color:"#a5b4fc"}}>גרף</div><div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>{weights.map((w,i)=>{const mn=Math.min(...weights.map(x=>x.kg)),mx=Math.max(...weights.map(x=>x.kg));const h=mx===mn?60:20+((w.kg-mn)/(mx-mn))*60;return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{fontSize:9,color:TH.subText}}>{w.kg}</div><div style={{width:"100%",height:h,background:"linear-gradient(to top,#6366f1,#06b6d4)",borderRadius:"4px 4px 0 0"}}/><div style={{fontSize:9,color:TH.mutedText}}>{w.date.slice(5)}</div></div>);})}</div></div>)}
      <div style={S.card}><div style={{fontSize:12,fontWeight:600,marginBottom:10,color:"#a5b4fc"}}>{editWId?"✏️ עריכה":"+ הוסף"}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:8,alignItems:"end"}}>
          <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>תאריך</div><input type="date" value={wf.date} onChange={e=>setWf({...wf,date:e.target.value})} style={S.inp}/></div>
          <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>קג</div><input type="number" step="0.1" value={wf.kg} onChange={e=>setWf({...wf,kg:e.target.value})} style={S.inp}/></div>
          <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>הערה</div><input value={wf.note} onChange={e=>setWf({...wf,note:e.target.value})} style={S.inp}/></div>
          <button onClick={saveW} style={S.btn}>שמור</button>
        </div>
      </div>
      <div style={{marginTop:14}}>{[...weights].reverse().map(w=>(<div key={w.id} style={{...S.card,marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,color:TH.subText}}>{w.date}</span><span style={{fontSize:16,fontWeight:700,color:"#10b981"}}>{w.kg} kg</span>{w.note&&<span style={{fontSize:11,color:TH.subText}}>{w.note}</span>}<div style={{display:"flex",gap:5}}><button onClick={()=>{setEditWId(w.id);setWf({date:w.date,kg:String(w.kg),note:w.note||""});}} style={S.eBtn}>✏️</button><button onClick={()=>deleteDocById("kelly_weights",w.id)} style={S.dBtn}>🗑</button></div></div>))}</div>
    </div>)}

    {/* VET TASKS */}
    {sec==="tasks"&&(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{fontSize:16,fontWeight:700,margin:0,color:TH.text}}>משימות טיפול</h2><button onClick={()=>setShowVf(!showVf)} style={S.btn}>+ הוסף</button></div>
      {showVf&&(<div style={{...S.card,marginBottom:16,borderColor:"rgba(99,102,241,0.3)"}}><div style={{display:"flex",flexDirection:"column",gap:8}}>
        <input value={vf.instruction} onChange={e=>setVf({...vf,instruction:e.target.value})} placeholder="הנחיה..." style={S.inp}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>פעמים/שבוע</div><input type="number" min="1" max="7" value={vf.freq} onChange={e=>setVf({...vf,freq:parseInt(e.target.value)||1})} style={S.inp}/></div>
          <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>שבועות</div><input type="number" min="1" value={vf.weeks} onChange={e=>setVf({...vf,weeks:parseInt(e.target.value)||1})} style={S.inp}/></div>
          <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>התחלה</div><input type="date" value={vf.start} onChange={e=>setVf({...vf,start:e.target.value})} style={S.inp}/></div>
        </div>
        <div style={{display:"flex",gap:6}}>{DAYS.map((d,i)=><button key={i} onClick={()=>toggleDay(i)} style={{width:32,height:32,borderRadius:"50%",border:"none",background:vf.days.includes(i)?"#6366f1":TH.input,color:vf.days.includes(i)?"#fff":TH.subText,fontSize:11,cursor:"pointer",fontWeight:700}}>{d}</button>)}</div>
        <button onClick={addVT} style={{...S.btn,alignSelf:"flex-start"}}>שמור</button>
      </div></div>)}
      {vetTasks.map(t=>{const dl=taskDL(t),pct=Math.min(100,Math.round(100-(dl/(t.weeks*7))*100));return(<div key={t.id} style={{...S.card,marginBottom:12,borderColor:dl>0?"rgba(99,102,241,0.3)":TH.cardBorder}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div><div style={{fontSize:13,fontWeight:700,color:TH.text}}>🛁 {t.instruction}</div>{t.note&&<div style={{fontSize:11,color:TH.subText}}>📝 {t.note}</div>}</div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
            <div style={S.tag(dl>0?"#6366f1":"#4b5563")}>{dl>0?dl+" ימים":"הסתיים"}</div>
            <button onClick={()=>addMain(t)} style={{background:addedMain[t.id]?"rgba(16,185,129,0.15)":"rgba(99,102,241,0.1)",border:"1px solid "+(addedMain[t.id]?"rgba(16,185,129,0.3)":"rgba(99,102,241,0.25)"),borderRadius:7,padding:"3px 9px",color:addedMain[t.id]?"#6ee7b7":"#a5b4fc",fontSize:11,cursor:"pointer"}}>{addedMain[t.id]?"✓ נוסף!":"📋 למשימות"}</button>
          </div>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}><span style={S.tag("#10b981")}>{t.freq}x/שבוע</span><span style={S.tag("#06b6d4")}>{t.weeks} שבועות</span><div style={{display:"flex",gap:3,marginRight:"auto"}}>{DAYS.map((d,i)=><div key={i} style={{width:24,height:24,borderRadius:"50%",background:(t.days||[]).includes(i)?"#6366f1":TH.input,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:(t.days||[]).includes(i)?"#fff":TH.mutedText}}>{d}</div>)}</div></div>
        {dl>0&&<div style={{height:4,background:TH.input,borderRadius:2}}><div style={{height:"100%",background:"linear-gradient(to right,#6366f1,#06b6d4)",borderRadius:2,width:pct+"%"}}/></div>}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:6}}><button onClick={()=>delVT(t.id)} style={S.dBtn}>🗑</button></div>
      </div>);})}
    </div>)}

    {/* VACCINES */}
    {sec==="vaccines"&&(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{fontSize:16,fontWeight:700,margin:0,color:TH.text}}>חיסונים</h2><button onClick={()=>{setShowVacF(!showVacF);setEditVacId(null);setVacF({name:"",last:"",next:"",notes:""}); }} style={S.btn}>+ הוסף</button></div>
      {showVacF&&(<div style={{...S.card,marginBottom:14}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
        <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>שם</div><input value={vacF.name} onChange={e=>setVacF({...vacF,name:e.target.value})} style={S.inp}/></div>
        <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>אחרון</div><input type="date" value={vacF.last} onChange={e=>setVacF({...vacF,last:e.target.value})} style={S.inp}/></div>
        <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>הבא</div><input type="date" value={vacF.next} onChange={e=>setVacF({...vacF,next:e.target.value})} style={S.inp}/></div>
      </div><input placeholder="הערות" value={vacF.notes} onChange={e=>setVacF({...vacF,notes:e.target.value})} style={{...S.inp,marginBottom:8}}/><div style={{display:"flex",gap:7}}><button onClick={saveVac} style={S.btn}>{editVacId?"עדכן":"שמור"}</button>{editVacId&&<button onClick={()=>{setEditVacId(null);setShowVacF(false);}} style={{...S.btn,background:TH.input,color:TH.subText}}>ביטול</button>}</div></div>)}
      {vaccines.map(v=>{const s=vacSt(v.next),c=SC[s],dt=Math.ceil((new Date(v.next)-Date.now())/86400000);return(<div key={v.id} style={{...S.card,marginBottom:10,borderColor:s==="overdue"?"rgba(239,68,68,0.3)":s==="soon"?"rgba(245,158,11,0.3)":TH.cardBorder}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700,color:TH.text}}>💉 {v.name}</div><div style={{fontSize:11,color:TH.subText}}>אחרון: {v.last} | הבא: {v.next}</div>{v.notes&&<div style={{fontSize:11,color:TH.mutedText}}>{v.notes}</div>}</div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}><div style={S.tag(c)}>{SL[s]}</div><div style={{fontSize:11,color:c,fontWeight:700}}>{s==="overdue"?Math.abs(dt)+" ימי איחור":"עוד "+dt+" ימים"}</div><div style={{display:"flex",gap:4}}><button onClick={()=>editVac(v)} style={S.eBtn}>✏️</button><button onClick={()=>delVac(v.id)} style={S.dBtn}>🗑</button></div></div></div>
      </div>);})}
      {vaccines.length===0&&<div style={{...S.card,textAlign:"center",padding:30,color:TH.subText}}>אין חיסונים עדיין 💉</div>}
    </div>)}

    {/* MEDICAL */}
    {sec==="medical"&&(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h2 style={{fontSize:16,fontWeight:700,margin:0,color:TH.text}}>תיק רפואי</h2><button onClick={()=>{setShowMf(!showMf);setEditMId(null);setMf(mf0);}} style={S.btn}>+ הוסף</button></div>
      <div style={{...S.card,marginBottom:14,borderColor:"rgba(16,185,129,0.2)"}}><div style={{fontSize:12,fontWeight:600,color:"#10b981",marginBottom:8}}>🤖 ניתוח מסמך AI</div>
        <label style={{...S.btn,display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer"}}>📄 העלה מסמך<input type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&analyzeDoc(e.target.files[0])}/></label>
        {analyzing&&<span style={{marginRight:10,color:"#a5b4fc",fontSize:12}}>🤖 מנתח...</span>}
        {aiResult&&<div style={{marginTop:10,padding:10,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,fontSize:12,color:TH.text,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{aiResult}</div>}
      </div>
      {showMf&&(<div style={{...S.card,marginBottom:14,borderColor:"rgba(99,102,241,0.3)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
          <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>תאריך</div><input type="date" value={mf.date} onChange={e=>setMf({...mf,date:e.target.value})} style={S.inp}/></div>
          <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>סוג</div><select value={mf.type} onChange={e=>setMf({...mf,type:e.target.value})} style={{...S.inp,appearance:"none"}}>{["בדיקה","ניתוח","טיפול","תרופה","אחר"].map(t=><option key={t} style={{background:TH.bg,color:TH.text}}>{t}</option>)}</select></div>
          <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>וטרינר</div><input value={mf.vet} onChange={e=>setMf({...mf,vet:e.target.value})} style={S.inp}/></div>
        </div>
        <div style={{marginBottom:8}}><div style={{fontSize:11,color:"#a5b4fc",marginBottom:4}}>📋 תיאור הביקור</div><textarea value={mf.visitDesc} onChange={e=>setMf({...mf,visitDesc:e.target.value})} placeholder="תאר את הביקור..." style={{...S.inp,minHeight:70,resize:"vertical"}}/></div>
        <div style={{...S.card,marginBottom:8,borderColor:"rgba(99,102,241,0.2)",background:"rgba(99,102,241,0.02)"}}><div style={{fontSize:11,color:"#a5b4fc",marginBottom:6}}>💊 טיפול שנקבע</div>
          <textarea value={mf.treatment} onChange={e=>setMf({...mf,treatment:e.target.value})} placeholder="פרט את הטיפול..." style={{...S.inp,minHeight:55,resize:"vertical"}}/>
          {mf.treatment&&(<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
            <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>פעמים/שבוע</div><input type="number" min="1" max="7" value={mf.treatFreq} onChange={e=>setMf({...mf,treatFreq:parseInt(e.target.value)||1})} style={S.inp}/></div>
            <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>שבועות</div><input type="number" min="1" value={mf.treatWeeks} onChange={e=>setMf({...mf,treatWeeks:parseInt(e.target.value)||1})} style={S.inp}/></div>
          </div><div style={{display:"flex",gap:5,marginTop:8}}>{DAYS.map((d,i)=><button key={i} onClick={()=>toggleTD(i)} style={{width:30,height:30,borderRadius:"50%",border:"none",background:mf.treatDays.includes(i)?"#6366f1":TH.input,color:mf.treatDays.includes(i)?"#fff":TH.subText,fontSize:10,cursor:"pointer",fontWeight:700}}>{d}</button>)}</div></>)}
        </div>
        <div style={{display:"flex",gap:8}}><button onClick={saveMed} style={S.btn}>{editMId?"עדכן":"שמור"}</button>{editMId&&<button onClick={()=>{setEditMId(null);setShowMf(false);}} style={{...S.btn,background:TH.input,color:TH.subText}}>ביטול</button>}</div>
      </div>)}
      {medRecs.map(r=>{const tc={בדיקה:"#6366f1",ניתוח:"#ef4444",טיפול:"#10b981",תרופה:"#f59e0b",אחר:"#6b7280"};return(<div key={r.id} style={{...S.card,marginBottom:8}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{fontSize:18}}>{r.type==="ניתוח"?"🔪":r.type==="תרופה"?"💊":r.type==="טיפול"?"💉":"🩺"}</div>
          <div style={{flex:1}}><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:5}}><span style={S.tag(tc[r.type]||"#6b7280")}>{r.type}</span><span style={{fontSize:11,color:TH.subText}}>{r.date}</span>{r.vet&&<span style={{fontSize:11,color:TH.mutedText}}>| {r.vet}</span>}</div>
            {r.visitDesc&&<div style={{fontSize:12,marginBottom:4,color:TH.text}}><span style={{fontSize:10,color:TH.subText}}>📋 </span>{r.visitDesc}</div>}
            {r.treatment&&<div style={{padding:"6px 8px",background:"rgba(99,102,241,0.06)",borderRadius:7,fontSize:12,color:TH.text}}><span style={{color:"#a5b4fc",fontSize:10}}>💊 </span>{r.treatment}{(r.treatFreq||r.treatWeeks)&&<span style={{fontSize:10,color:TH.subText}}> · {r.treatFreq}x/{r.treatWeeks}שב'</span>}</div>}
          </div>
          <div style={{display:"flex",gap:4}}><button onClick={()=>editMed(r)} style={S.eBtn}>✏️</button><button onClick={()=>delMed(r.id)} style={S.dBtn}>🗑</button></div>
        </div>
      </div>);})}
      {medRecs.length===0&&<div style={{...S.card,textAlign:"center",padding:30,color:TH.subText}}>אין רשומות 🩺</div>}
    </div>)}

    {/* INSURANCE */}
    {sec==="insurance"&&(<div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:14,color:TH.text}}>ביטוח</h2>
      <div style={{...S.card,marginBottom:16,borderColor:"rgba(99,102,241,0.2)"}}>
        {editIns?(<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>{[["provider","חברת ביטוח"],["policyNum","מספר פוליסה"],["expiry","תוקף"]].map(([k,l])=>(<div key={k}><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>{l}</div><input value={insForm[k]||""} onChange={e=>setInsForm({...insForm,[k]:e.target.value})} style={S.inp}/></div>))}</div><div style={{display:"flex",gap:8}}><button onClick={saveIns} style={S.btn}>שמור</button><button onClick={()=>setEditIns(false)} style={{...S.btn,background:TH.input,color:TH.subText}}>ביטול</button></div></div>)
        :(<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>{[["🏢","חברת ביטוח",ins.provider],["📋","פוליסה",ins.policyNum],["📅","תוקף",ins.expiry]].map(([icon,label,val])=>(<div key={label} style={{textAlign:"center"}}><div style={{fontSize:20,marginBottom:3}}>{icon}</div><div style={{fontSize:10,color:TH.subText}}>{label}</div><div style={{fontSize:13,fontWeight:600,color:TH.text}}>{val||"—"}</div></div>))}</div><button onClick={()=>{setInsForm({...ins});setEditIns(true);}} style={S.eBtn}>✏️ ערוך</button></div>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:13,fontWeight:700,color:TH.text}}>תביעות</div><button onClick={()=>{setShowCf(!showCf);setEditCId(null);setCf({date:"",amount:"",reason:"",status:"הוגש"});}} style={S.btn}>+ הוסף</button></div>
      {showCf&&(<div style={{...S.card,marginBottom:12}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
        <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>תאריך</div><input type="date" value={cf.date} onChange={e=>setCf({...cf,date:e.target.value})} style={S.inp}/></div>
        <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>סכום</div><input type="number" value={cf.amount} onChange={e=>setCf({...cf,amount:e.target.value})} style={S.inp}/></div>
        <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>סיבה</div><input value={cf.reason} onChange={e=>setCf({...cf,reason:e.target.value})} style={S.inp}/></div>
        <div><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>סטטוס</div><select value={cf.status} onChange={e=>setCf({...cf,status:e.target.value})} style={{...S.inp,appearance:"none"}}>{["הוגש","בתהליך","אושר","דרושים מסמכים","שולם"].map(s=><option key={s} style={{background:TH.bg,color:TH.text}}>{s}</option>)}</select></div>
      </div><div style={{display:"flex",gap:8}}><button onClick={saveClm} style={S.btn}>{editCId?"עדכן":"שמור"}</button>{editCId&&<button onClick={()=>{setEditCId(null);setShowCf(false);}} style={{...S.btn,background:TH.input,color:TH.subText}}>ביטול</button>}</div></div>)}
      {claims.map(c=>{const sc={"הוגש":"#6b7280","בתהליך":"#f59e0b","אושר":"#06b6d4","דרושים מסמכים":"#ef4444","שולם":"#10b981"};return(<div key={c.id} style={{...S.card,marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontSize:13,fontWeight:600,color:TH.text}}>{c.reason}</div><div style={{fontSize:11,color:TH.subText}}>{c.date}</div></div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}><div style={{fontSize:16,fontWeight:800,color:"#10b981"}}>₪{(c.amount||0).toLocaleString()}</div>
          <select value={c.status} onChange={e=>updSt(c,e.target.value)} style={{background:TH.input,border:"1px solid "+(sc[c.status]||"#6b7280")+"44",borderRadius:7,padding:"3px 8px",color:sc[c.status]||"#6b7280",fontSize:11,cursor:"pointer",outline:"none"}}>{["הוגש","בתהליך","אושר","דרושים מסמכים","שולם"].map(s=><option key={s} style={{background:TH.bg,color:TH.text}}>{s}</option>)}</select>
          <div style={{display:"flex",gap:4}}><button onClick={()=>editClm(c)} style={S.eBtn}>✏️</button><button onClick={()=>delClm(c.id)} style={S.dBtn}>🗑</button></div>
        </div></div>
      </div>);})}
      {claims.length===0&&<div style={{...S.card,textAlign:"center",padding:30,color:TH.subText}}>אין תביעות 📋</div>}
    </div>)}

    {/* FOOD */}
    {sec==="food"&&(<div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:14,color:TH.text}}>מעקב אוכל</h2>
      {fd!==null&&fd<7&&(<div style={{...S.card,marginBottom:12,borderColor:"rgba(239,68,68,0.4)",background:"rgba(239,68,68,0.05)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{color:"#fca5a5",fontWeight:700}}>🚨 נותרו {fd} ימים!</div><button onClick={addFT} style={{...S.btn,background:foodDone?"linear-gradient(135deg,#10b981,#059669)":"linear-gradient(135deg,#ef4444,#dc2626)"}}>{foodDone?"✓ נוסף!":"הוסף משימה"}</button></div></div>)}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[["🥣","מותג","brand"],["🏷","סוג","type"],["⚖️","כמות יומית גרם","daily"],["🛍","משקל שקית קג","bagKg"],["📅","תאריך פתיחה","openDate"]].map(([icon,label,key])=>(<div key={key} style={S.card}><div style={{fontSize:10,color:TH.subText,marginBottom:5}}>{icon} {label}</div><input value={food[key]||""} onChange={e=>saveFood(key,e.target.value)} style={{...S.inp,fontWeight:600}}/></div>))}
        <div style={{...S.card,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderColor:fd!==null&&fd<7?"rgba(239,68,68,0.4)":"rgba(16,185,129,0.2)"}}><div style={{fontSize:10,color:TH.subText,marginBottom:3}}>ימים נותרים</div><div style={{fontSize:32,fontWeight:800,color:fd!==null&&fd<7?"#ef4444":"#10b981"}}>{fd??"-"}</div></div>
      </div>
    </div>)}

    {/* REGISTER */}
    {sec==="register"&&(<div>
      <h2 style={{fontSize:16,fontWeight:700,marginBottom:14,color:TH.text}}>פרטי רישום</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[["🔬","מיקרוצ'יפ","chip"],["🪪","רישיון","license"],["📅","תוקף רישיון","licenseExp"],["🐕","גזע","breed"],["🎂","תאריך לידה","birthDate"],["🎨","צבע","color"],["👨‍⚕️","וטרינר","vet"],["📞","טלפון וטרינר","vetPhone"]].map(([icon,label,key])=>(<div key={key} style={S.card}><div style={{fontSize:10,color:TH.subText,marginBottom:5}}>{icon} {label}</div><input value={reg[key]||""} onChange={e=>saveReg(key,e.target.value)} style={{...S.inp,fontWeight:600}}/></div>))}
      </div>
    </div>)}

    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}select option{background:${TH.bg}!important;color:${TH.text}!important;}`}</style>
  </div>);
      }
