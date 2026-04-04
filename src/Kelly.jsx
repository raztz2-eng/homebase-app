import { useState, useEffect } from "react";
import { listenCol, saveDoc, deleteDocById, COL } from "./firebase.js";

const GEMINI_KEY = "AIzaSyCl9eRbYNj8d5IGhCUkimDeCfSPbQwPVNs";
const SECTIONS = ["weight","tasks","vaccines","medical","insurance","food","register"];
const DAYS_HE = ["א","ב","ג","ד","ה","ו","ש"];

const ST = {
  card:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20},
  inp:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"9px 12px",color:"#e8eaf0",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"},
  btn:{background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"},
  tag:(c)=>({fontSize:11,padding:"2px 8px",borderRadius:20,background:c+"22",color:c,border:"1px solid "+c+"44",fontWeight:600}),
  editBtn:{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 9px",color:"#a5b4fc",fontSize:11,cursor:"pointer"},
  delBtn:{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 9px",color:"#fca5a5",fontSize:11,cursor:"pointer"},
};

let UID=300; const nid=()=>"k"+String(++UID)+Date.now();

export default function Kelly({ lang, onAddTask }) {
  const [sec, setSec] = useState("weight");
  const [loading, setLoading] = useState(true);

  // Firebase state
  const [weights,  setWeights]  = useState([]);
  const [vetTasks, setVetTasks] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [medRecs,  setMedRecs]  = useState([]);
  const [claims,   setClaims]   = useState([]);
  const [ins,      setIns]      = useState({provider:"כלל ביטוח",policyNum:"123456789",expiry:"2025-01-01"});
  const [food,     setFood]     = useState({brand:"Royal Canin",type:"Medium Adult",daily:280,bagKg:15,openDate:"2024-03-01"});
  const [reg,      setReg]      = useState({chip:"",license:"",licenseExp:"",breed:"לברדור",birthDate:"2019-05-12",color:"שמנת זהב",vet:"",vetPhone:""});

  // Form state
  const [wf, setWf] = useState({date:new Date().toISOString().slice(0,10),kg:"",note:""});
  const [editWId, setEditWId] = useState(null);
  const [vf, setVf] = useState({instruction:"",freq:2,weeks:2,start:new Date().toISOString().slice(0,10),days:[],note:""});
  const [showVf, setShowVf] = useState(false);
  const [addedMain, setAddedMain] = useState({});
  const [vacF, setVacF] = useState({name:"",last:"",next:"",notes:""});
  const [showVacF, setShowVacF] = useState(false);
  const [editVacId, setEditVacId] = useState(null);
  const [mf, setMf] = useState({date:"",type:"בדיקה",desc:"",vet:""});
  const [showMf, setShowMf] = useState(false);
  const [editMId, setEditMId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [editIns, setEditIns] = useState(false);
  const [insForm, setInsForm] = useState({...ins});
  const [cf, setCf] = useState({date:"",amount:"",reason:"",status:"הוגש"});
  const [showCf, setShowCf] = useState(false);
  const [editCId, setEditCId] = useState(null);
  const [foodTaskAdded, setFoodTaskAdded] = useState(false);

  // ── Firebase listeners ─────────────────────────────────
  useEffect(() => {
    const subs = [
      listenCol("kelly_weights",  (d) => { setWeights(d.sort((a,b)=>a.date>b.date?1:-1)); setLoading(false); }),
      listenCol("kelly_tasks",    (d) => setVetTasks(d)),
      listenCol("kelly_vaccines", (d) => setVaccines(d)),
      listenCol("kelly_medical",  (d) => setMedRecs(d.sort((a,b)=>a.date<b.date?1:-1))),
      listenCol("kelly_claims",   (d) => setClaims(d)),
      listenCol("kelly_settings", (d) => {
        const insDoc = d.find(x=>x.id==="insurance");
        if (insDoc) setIns(insDoc);
        const foodDoc = d.find(x=>x.id==="food");
        if (foodDoc) setFood(foodDoc);
        const regDoc = d.find(x=>x.id==="register");
        if (regDoc) setReg(regDoc);
        setLoading(false);
      }),
    ];
    return () => subs.forEach(u => u());
  }, []);

  // ── Helpers ─────────────────────────────────────────────
  const taskEnd = (t) => { const d=new Date(t.start); d.setDate(d.getDate()+t.weeks*7); return d; };
  const taskDL  = (t) => Math.max(0, Math.ceil((taskEnd(t)-Date.now())/86400000));
  const foodDays = () => {
    if (!food.openDate) return null;
    const total = Math.floor((food.bagKg*1000)/food.daily);
    const used  = Math.floor((Date.now()-new Date(food.openDate))/86400000);
    return Math.max(0, total-used);
  };
  const vacSt = (next) => { const d=(new Date(next)-Date.now())/86400000; return d<0?"overdue":d<30?"soon":"ok"; };
  const stColors = {overdue:"#ef4444",soon:"#f59e0b",ok:"#10b981"};
  const stLabels = {overdue:"באיחור",soon:"בקרוב",ok:"תקין"};

  // ── Weight ───────────────────────────────────────────────
  const saveWeight = async () => {
    if (!wf.kg) return;
    const id = editWId || nid();
    await saveDoc("kelly_weights", id, {...wf, id, kg:parseFloat(wf.kg)});
    setEditWId(null);
    setWf({date:new Date().toISOString().slice(0,10),kg:"",note:""});
  };
  const startEditW = (w) => { setEditWId(w.id); setWf({date:w.date,kg:String(w.kg),note:w.note||""}); };
  const deleteW    = async (id) => deleteDocById("kelly_weights", id);

  // ── Vet Tasks ────────────────────────────────────────────
  const toggleDay = (d) => setVf(p=>({...p,days:p.days.includes(d)?p.days.filter(x=>x!==d):[...p.days,d]}));
  const addVetTask = async () => {
    if (!vf.instruction) return;
    const id = nid();
    await saveDoc("kelly_tasks", id, {...vf, id});
    setVf({instruction:"",freq:2,weeks:2,start:new Date().toISOString().slice(0,10),days:[],note:""});
    setShowVf(false);
  };
  const deleteVetTask = async (id) => deleteDocById("kelly_tasks", id);
  const addToMain = (task) => {
    if (onAddTask) onAddTask({id:nid(),he:task.instruction,en:task.instruction,cat:"other",priority:"medium",person:"Both",recur:"weekly",dueDate:taskEnd(task).toISOString().slice(0,10),note:task.note||"",done:false,lastDone:""});
    setAddedMain(p=>({...p,[task.id]:true}));
    setTimeout(()=>setAddedMain(p=>({...p,[task.id]:false})),2000);
  };

  // ── Vaccines ─────────────────────────────────────────────
  const saveVac = async () => {
    if (!vacF.name) return;
    const id = editVacId || nid();
    await saveDoc("kelly_vaccines", id, {...vacF, id});
    setEditVacId(null); setShowVacF(false);
    setVacF({name:"",last:"",next:"",notes:""});
  };
  const startEditVac = (v) => { setEditVacId(v.id); setVacF({name:v.name,last:v.last,next:v.next,notes:v.notes||""}); setShowVacF(true); };
  const deleteVac    = async (id) => deleteDocById("kelly_vaccines", id);

  // ── Medical ──────────────────────────────────────────────
  const saveMed = async () => {
    if (!mf.desc) return;
    const id = editMId || nid();
    await saveDoc("kelly_medical", id, {...mf, id});
    setEditMId(null); setShowMf(false);
    setMf({date:"",type:"בדיקה",desc:"",vet:""});
  };
  const startEditMed = (r) => { setEditMId(r.id); setMf({date:r.date,type:r.type,desc:r.desc,vet:r.vet||""}); setShowMf(true); };
  const deleteMed    = async (id) => deleteDocById("kelly_medical", id);

  const analyzeDoc = async (file) => {
    setAnalyzing(true); setAnalysisResult("");
    try {
      const b64 = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+GEMINI_KEY,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[{text:"אתה וטרינר מומחה. נתח את המסמך הרפואי הזה של כלב ותן סיכום בעברית עם: 1) ממצאים עיקריים 2) תרופות שנרשמו 3) המלצות להמשך 4) תאריכי מעקב. פורמט ברור."},{inline_data:{mime_type:file.type||"application/pdf",data:b64}}]}]}),
      });
      const data = await resp.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא ניתן לנתח";
      setAnalysisResult(text);
      const id = nid();
      await saveDoc("kelly_medical", id, {id,date:new Date().toISOString().slice(0,10),type:"בדיקה",desc:"ניתוח AI: "+text.slice(0,300),vet:"Gemini AI"});
    } catch(e) { setAnalysisResult("שגיאה: "+e.message); }
    setAnalyzing(false);
  };

  // ── Insurance ────────────────────────────────────────────
  const saveIns = async () => {
    await saveDoc("kelly_settings","insurance",{...insForm,id:"insurance"});
    setIns(insForm); setEditIns(false);
  };
  const saveClaim = async () => {
    if (!cf.reason) return;
    const id = editCId || nid();
    await saveDoc("kelly_claims", id, {...cf, id, amount:parseFloat(cf.amount)||0});
    setEditCId(null); setShowCf(false);
    setCf({date:"",amount:"",reason:"",status:"הוגש"});
  };
  const startEditClaim = (c) => { setEditCId(c.id); setCf({date:c.date,amount:String(c.amount),reason:c.reason,status:c.status}); setShowCf(true); };
  const deleteClaim = async (id) => deleteDocById("kelly_claims", id);
  const updateStatus = async (c, status) => saveDoc("kelly_claims", c.id, {...c, status});

  // ── Food ─────────────────────────────────────────────────
  const saveFood = async (key, val) => {
    const updated = {...food, [key]:val, id:"food"};
    setFood(updated);
    await saveDoc("kelly_settings","food",updated);
  };
  const addFoodTask = () => {
    if (onAddTask) onAddTask({id:nid(),he:"לקנות אוכל לקלי",en:"Buy Kelly food",cat:"other",priority:"high",person:"Raz",recur:"none",dueDate:new Date().toISOString().slice(0,10),note:food.brand+" "+food.type,done:false,lastDone:""});
    setFoodTaskAdded(true);
    setTimeout(()=>setFoodTaskAdded(false),3000);
  };

  // ── Register ─────────────────────────────────────────────
  const saveReg = async (key, val) => {
    const updated = {...reg, [key]:val, id:"register"};
    setReg(updated);
    await saveDoc("kelly_settings","register",updated);
  };

  const fd = foodDays();

  if (loading) return (
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",background:"#0f1117",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:14,fontSize:16}}>
      <div style={{width:32,height:32,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      מסנכרן נתונים...
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return (
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",direction:"rtl",minHeight:"100vh",background:"#0f1117"}}>
      {/* Header */}
      <div style={{background:"rgba(17,19,30,0.95)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"16px 22px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{width:46,height:46,borderRadius:14,background:"linear-gradient(135deg,#10b981,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🐕</div>
        <div><div style={{fontSize:20,fontWeight:800}}>קלי 🐾</div><div style={{fontSize:12,color:"#6b7280"}}>לברדור · נולדה מאי 2019 · <span style={{color:"#10b981"}}>🔥 מסונכרן</span></div></div>
        {fd !== null && fd < 7 && (
          <div style={{marginRight:"auto",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"6px 14px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#fca5a5",fontSize:12}}>🚨 נותרו {fd} ימי אוכל!</span>
            <button onClick={addFoodTask} style={{...ST.btn,padding:"4px 10px",fontSize:11,background:foodTaskAdded?"linear-gradient(135deg,#10b981,#059669)":"linear-gradient(135deg,#ef4444,#dc2626)"}}>
              {foodTaskAdded?"✓ נוסף!":"הוסף משימה לרז"}
            </button>
          </div>
        )}
      </div>

      {/* Sub-nav */}
      <div style={{background:"rgba(17,19,30,0.5)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"0 16px",display:"flex",gap:2,overflowX:"auto"}}>
        {SECTIONS.map(s => {
          const labels = {weight:"משקל",tasks:"משימות טיפול",vaccines:"חיסונים",medical:"תיק רפואי",insurance:"ביטוח",food:"אוכל",register:"רישום"};
          return <button key={s} onClick={()=>setSec(s)} style={{background:"none",border:"none",borderBottom:sec===s?"2px solid #6366f1":"2px solid transparent",padding:"11px 14px",color:sec===s?"#a5b4fc":"#6b7280",fontSize:13,fontWeight:sec===s?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>{labels[s]}</button>;
        })}
      </div>

      <div style={{padding:"20px 22px",maxWidth:860,margin:"0 auto"}}>

        {/* ══ WEIGHT ══ */}
        {sec==="weight" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>מעקב משקל</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
              {[["משקל נוכחי",weights.length?weights[weights.length-1].kg+" kg":"--","#10b981"],
                ["מגמה",weights.length>=2?((weights[weights.length-1].kg-weights[0].kg)>0?"+":"")+(weights[weights.length-1].kg-weights[0].kg).toFixed(1)+" kg":"--","#a5b4fc"],
                ["שקילות",weights.length,"#06b6d4"]].map(([l,v,c])=>(
                <div key={l} style={{...ST.card,textAlign:"center"}}><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{l}</div><div style={{fontSize:26,fontWeight:800,color:c}}>{v}</div></div>
              ))}
            </div>
            {weights.length>0 && (
              <div style={{...ST.card,marginBottom:18}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:"#a5b4fc"}}>גרף משקל</div>
                <div style={{display:"flex",alignItems:"flex-end",gap:8,height:90}}>
                  {weights.map((w,i)=>{const mn=Math.min(...weights.map(x=>x.kg)),mx=Math.max(...weights.map(x=>x.kg));const h=mx===mn?60:20+((w.kg-mn)/(mx-mn))*70;return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{fontSize:9,color:"#6b7280"}}>{w.kg}</div><div style={{width:"100%",height:h,background:"linear-gradient(to top,#6366f1,#06b6d4)",borderRadius:"5px 5px 0 0"}}/><div style={{fontSize:9,color:"#4b5563"}}>{w.date.slice(5)}</div></div>);})}
                </div>
              </div>
            )}
            <div style={ST.card}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:12,color:"#a5b4fc"}}>{editWId?"✏️ עריכת שקילה":"+ הוסף שקילה"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:10,alignItems:"end"}}>
                <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך</div><input type="date" value={wf.date} onChange={e=>setWf({...wf,date:e.target.value})} style={ST.inp}/></div>
                <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>משקל בקג</div><input type="number" step="0.1" value={wf.kg} onChange={e=>setWf({...wf,kg:e.target.value})} style={ST.inp}/></div>
                <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>הערה</div><input value={wf.note} onChange={e=>setWf({...wf,note:e.target.value})} style={ST.inp}/></div>
                <button onClick={saveWeight} style={ST.btn}>שמור</button>
              </div>
              {editWId && <button onClick={()=>{setEditWId(null);setWf({date:new Date().toISOString().slice(0,10),kg:"",note:""}); }} style={{marginTop:8,background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:12}}>ביטול</button>}
            </div>
            <div style={{marginTop:18}}>
              <div style={{fontSize:13,color:"#6b7280",marginBottom:10}}>היסטוריה</div>
              {[...weights].reverse().map(w=>(
                <div key={w.id} style={{...ST.card,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,color:"#9ca3af"}}>{w.date}</div>
                  <div style={{fontSize:17,fontWeight:700,color:"#10b981"}}>{w.kg} kg</div>
                  {w.note && <div style={{fontSize:12,color:"#6b7280",flex:1,textAlign:"center"}}>{w.note}</div>}
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>startEditW(w)} style={ST.editBtn}>✏️</button>
                    <button onClick={()=>deleteW(w.id)} style={ST.delBtn}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ VET TASKS ══ */}
        {sec==="tasks" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{fontSize:17,fontWeight:700,margin:0}}>משימות טיפול</h2>
              <button onClick={()=>setShowVf(!showVf)} style={ST.btn}>+ הוסף הנחיית וטרינר</button>
            </div>
            {showVf && (
              <div style={{...ST.card,marginBottom:18,borderColor:"rgba(99,102,241,0.3)"}}>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>הנחיה</div><input value={vf.instruction} onChange={e=>setVf({...vf,instruction:e.target.value})} placeholder="לדוגמה: שמפו מיוחד..." style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>הערה</div><input value={vf.note} onChange={e=>setVf({...vf,note:e.target.value})} placeholder="הערה אופציונלית..." style={ST.inp}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>פעמים בשבוע</div><input type="number" min="1" max="7" value={vf.freq} onChange={e=>setVf({...vf,freq:parseInt(e.target.value)||1})} style={ST.inp}/></div>
                    <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>משך בשבועות</div><input type="number" min="1" value={vf.weeks} onChange={e=>setVf({...vf,weeks:parseInt(e.target.value)||1})} style={ST.inp}/></div>
                    <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך התחלה</div><input type="date" value={vf.start} onChange={e=>setVf({...vf,start:e.target.value})} style={ST.inp}/></div>
                  </div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>בחר ימים</div>
                    <div style={{display:"flex",gap:8}}>
                      {DAYS_HE.map((d,i)=><button key={i} onClick={()=>toggleDay(i)} style={{width:34,height:34,borderRadius:"50%",border:"none",background:vf.days.includes(i)?"#6366f1":"rgba(255,255,255,0.06)",color:vf.days.includes(i)?"#fff":"#6b7280",fontWeight:700,fontSize:11,cursor:"pointer"}}>{d}</button>)}
                    </div>
                  </div>
                  <button onClick={addVetTask} style={{...ST.btn,alignSelf:"flex-start"}}>שמור</button>
                </div>
              </div>
            )}
            {vetTasks.map(task=>{
              const dl=taskDL(task), end=taskEnd(task).toISOString().slice(0,10);
              const pct=Math.min(100,Math.round(100-(dl/(task.weeks*7))*100));
              return(
                <div key={task.id} style={{...ST.card,marginBottom:14,borderColor:dl>0?"rgba(99,102,241,0.3)":"rgba(255,255,255,0.05)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>🛁 {task.instruction}</div>
                      {task.note && <div style={{fontSize:12,color:"#6b7280",marginBottom:4}}>📝 {task.note}</div>}
                      <div style={{fontSize:11,color:"#6b7280"}}>{task.start} — {end}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <div style={ST.tag(dl>0?"#6366f1":"#4b5563")}>{dl>0?dl+" ימים נותרו":"הסתיים"}</div>
                      <button onClick={()=>addToMain(task)} style={{background:addedMain[task.id]?"rgba(16,185,129,0.15)":"rgba(99,102,241,0.12)",border:"1px solid "+(addedMain[task.id]?"rgba(16,185,129,0.3)":"rgba(99,102,241,0.25)"),borderRadius:8,padding:"4px 10px",color:addedMain[task.id]?"#6ee7b7":"#a5b4fc",fontSize:11,cursor:"pointer",fontWeight:600}}>
                        {addedMain[task.id]?"✓ נוסף!":"📋 הוסף למשימות הכלליות"}
                      </button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                    <span style={ST.tag("#10b981")}>{task.freq}x / שבוע</span>
                    <span style={ST.tag("#06b6d4")}>{task.weeks} שבועות</span>
                    <div style={{display:"flex",gap:4,marginRight:"auto"}}>
                      {DAYS_HE.map((d,i)=><div key={i} style={{width:26,height:26,borderRadius:"50%",background:(task.days||[]).includes(i)?"#6366f1":"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:(task.days||[]).includes(i)?"#fff":"#4b5563"}}>{d}</div>)}
                    </div>
                  </div>
                  {dl>0 && <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}><div style={{height:"100%",background:"linear-gradient(to right,#6366f1,#06b6d4)",borderRadius:2,width:pct+"%"}}/></div>}
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                    <button onClick={()=>deleteVetTask(task.id)} style={ST.delBtn}>🗑 מחק</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ VACCINES ══ */}
        {sec==="vaccines" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{fontSize:17,fontWeight:700,margin:0}}>חיסונים</h2>
              <button onClick={()=>{setShowVacF(!showVacF);setEditVacId(null);setVacF({name:"",last:"",next:"",notes:""});}} style={ST.btn}>+ הוסף חיסון</button>
            </div>
            {showVacF && (
              <div style={{...ST.card,marginBottom:18}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>שם חיסון</div><input value={vacF.name} onChange={e=>setVacF({...vacF,name:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך אחרון</div><input type="date" value={vacF.last} onChange={e=>setVacF({...vacF,last:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך הבא</div><input type="date" value={vacF.next} onChange={e=>setVacF({...vacF,next:e.target.value})} style={ST.inp}/></div>
                </div>
                <input placeholder="הערות" value={vacF.notes} onChange={e=>setVacF({...vacF,notes:e.target.value})} style={{...ST.inp,marginBottom:10}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveVac} style={ST.btn}>{editVacId?"עדכן":"שמור"}</button>
                  {editVacId && <button onClick={()=>{setEditVacId(null);setShowVacF(false);}} style={{...ST.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>}
                </div>
              </div>
            )}
            {vaccines.map(v=>{
              const s=vacSt(v.next), c=stColors[s];
              const daysTo=Math.ceil((new Date(v.next)-Date.now())/86400000);
              return(
                <div key={v.id} style={{...ST.card,marginBottom:12,borderColor:s==="overdue"?"rgba(239,68,68,0.3)":s==="soon"?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.07)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>💉 {v.name}</div>
                      <div style={{fontSize:12,color:"#6b7280"}}>אחרון: {v.last} | הבא: {v.next}</div>
                      {v.notes && <div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>{v.notes}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <div style={ST.tag(c)}>{stLabels[s]}</div>
                      <div style={{fontSize:11,color:c,fontWeight:700}}>{s==="overdue"?Math.abs(daysTo)+" ימי איחור":"עוד "+daysTo+" ימים"}</div>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>startEditVac(v)} style={ST.editBtn}>✏️</button>
                        <button onClick={()=>deleteVac(v.id)} style={ST.delBtn}>🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {vaccines.length===0 && <div style={{...ST.card,textAlign:"center",padding:30,color:"#6b7280"}}>אין חיסונים — הוסף את הראשון! 💉</div>}
          </div>
        )}

        {/* ══ MEDICAL ══ */}
        {sec==="medical" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{fontSize:17,fontWeight:700,margin:0}}>תיק רפואי</h2>
              <button onClick={()=>{setShowMf(!showMf);setEditMId(null);setMf({date:"",type:"בדיקה",desc:"",vet:""}); }} style={ST.btn}>+ הוסף רשומה</button>
            </div>
            <div style={{...ST.card,marginBottom:18,borderColor:"rgba(16,185,129,0.2)"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#10b981",marginBottom:10}}>🤖 ניתוח מסמך רפואי עם AI</div>
              <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                <label style={{...ST.btn,display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                  📄 העלה מסמך (PDF / תמונה)
                  <input type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&analyzeDoc(e.target.files[0])}/>
                </label>
                {analyzing && <div style={{display:"flex",alignItems:"center",gap:8,color:"#a5b4fc",fontSize:13}}><div style={{width:16,height:16,border:"2px solid rgba(99,102,241,0.3)",borderTop:"2px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>מנתח...</div>}
              </div>
              {analysisResult && (
                <div style={{marginTop:14,padding:14,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                  <div style={{fontSize:11,color:"#10b981",fontWeight:700,marginBottom:8}}>✅ הניתוח הושלם — נוסף לתיק הרפואי</div>
                  {analysisResult}
                </div>
              )}
            </div>
            {showMf && (
              <div style={{...ST.card,marginBottom:18}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך</div><input type="date" value={mf.date} onChange={e=>setMf({...mf,date:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>סוג</div>
                    <select value={mf.type} onChange={e=>setMf({...mf,type:e.target.value})} style={{...ST.inp,appearance:"none"}}>
                      {["בדיקה","ניתוח","טיפול","תרופה","אחר"].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>וטרינר</div><input value={mf.vet} onChange={e=>setMf({...mf,vet:e.target.value})} style={ST.inp}/></div>
                </div>
                <input placeholder="תיאור" value={mf.desc} onChange={e=>setMf({...mf,desc:e.target.value})} style={{...ST.inp,marginBottom:10}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveMed} style={ST.btn}>{editMId?"עדכן":"שמור"}</button>
                  {editMId && <button onClick={()=>{setEditMId(null);setShowMf(false);}} style={{...ST.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>}
                </div>
              </div>
            )}
            {medRecs.map(r=>{
              const tc={בדיקה:"#6366f1",ניתוח:"#ef4444",טיפול:"#10b981",תרופה:"#f59e0b",אחר:"#6b7280"};
              return(
                <div key={r.id} style={{...ST.card,marginBottom:10,display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{fontSize:20}}>{r.type==="ניתוח"?"🔪":r.type==="תרופה"?"💊":r.type==="טיפול"?"💉":"🩺"}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                      <div style={ST.tag(tc[r.type]||"#6b7280")}>{r.type}</div>
                      <div style={{fontSize:12,color:"#6b7280"}}>{r.date}</div>
                      {r.vet && <div style={{fontSize:12,color:"#9ca3af"}}>| {r.vet}</div>}
                    </div>
                    <div style={{fontSize:13}}>{r.desc}</div>
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    <button onClick={()=>startEditMed(r)} style={ST.editBtn}>✏️</button>
                    <button onClick={()=>deleteMed(r.id)} style={ST.delBtn}>🗑</button>
                  </div>
                </div>
              );
            })}
            {medRecs.length===0 && <div style={{...ST.card,textAlign:"center",padding:30,color:"#6b7280"}}>אין רשומות רפואיות עדיין 🩺</div>}
            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          </div>
        )}

        {/* ══ INSURANCE ══ */}
        {sec==="insurance" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>ביטוח</h2>
            <div style={{...ST.card,marginBottom:20,borderColor:"rgba(99,102,241,0.2)"}}>
              {editIns ? (
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                    {[["provider","חברת ביטוח"],["policyNum","מספר פוליסה"],["expiry","תוקף"]].map(([k,l])=>(
                      <div key={k}><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{l}</div><input value={insForm[k]||""} onChange={e=>setInsForm({...insForm,[k]:e.target.value})} style={ST.inp}/></div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={saveIns} style={ST.btn}>שמור</button>
                    <button onClick={()=>setEditIns(false)} style={{...ST.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
                    {[["🏢","חברת ביטוח",ins.provider],["📋","מספר פוליסה",ins.policyNum],["📅","תוקף",ins.expiry]].map(([icon,label,val])=>(
                      <div key={label} style={{textAlign:"center"}}><div style={{fontSize:22,marginBottom:4}}>{icon}</div><div style={{fontSize:11,color:"#6b7280",marginBottom:2}}>{label}</div><div style={{fontSize:14,fontWeight:600}}>{val||"—"}</div></div>
                    ))}
                  </div>
                  <button onClick={()=>{setInsForm({...ins});setEditIns(true);}} style={ST.editBtn}>✏️ ערוך פרטי ביטוח</button>
                </div>
              )}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700}}>תביעות</div>
              <button onClick={()=>{setShowCf(!showCf);setEditCId(null);setCf({date:"",amount:"",reason:"",status:"הוגש"});}} style={ST.btn}>+ הוסף תביעה</button>
            </div>
            {showCf && (
              <div style={{...ST.card,marginBottom:16}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך</div><input type="date" value={cf.date} onChange={e=>setCf({...cf,date:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>סכום</div><input type="number" value={cf.amount} onChange={e=>setCf({...cf,amount:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>סיבה</div><input value={cf.reason} onChange={e=>setCf({...cf,reason:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>סטטוס</div>
                    <select value={cf.status} onChange={e=>setCf({...cf,status:e.target.value})} style={{...ST.inp,appearance:"none"}}>
                      {["הוגש","בתהליך","אושר","דרושים מסמכים","שולם"].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveClaim} style={ST.btn}>{editCId?"עדכן":"שמור"}</button>
                  {editCId && <button onClick={()=>{setEditCId(null);setShowCf(false);}} style={{...ST.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>}
                </div>
              </div>
            )}
            {claims.map(c=>{
              const sc={"הוגש":"#6b7280","בתהליך":"#f59e0b","אושר":"#06b6d4","דרושים מסמכים":"#ef4444","שולם":"#10b981"};
              return(
                <div key={c.id} style={{...ST.card,marginBottom:10,borderColor:c.status==="דרושים מסמכים"?"rgba(239,68,68,0.3)":"rgba(255,255,255,0.07)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{c.reason}</div><div style={{fontSize:12,color:"#6b7280"}}>{c.date}</div></div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <div style={{fontSize:18,fontWeight:800,color:"#10b981"}}>₪{(c.amount||0).toLocaleString()}</div>
                      <select value={c.status} onChange={e=>updateStatus(c,e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+(sc[c.status]||"#6b7280")+"44",borderRadius:8,padding:"3px 8px",color:sc[c.status]||"#6b7280",fontSize:11,cursor:"pointer",outline:"none"}}>
                        {["הוגש","בתהליך","אושר","דרושים מסמכים","שולם"].map(s=><option key={s}>{s}</option>)}
                      </select>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>startEditClaim(c)} style={ST.editBtn}>✏️</button>
                        <button onClick={()=>deleteClaim(c.id)} style={ST.delBtn}>🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {claims.length===0 && <div style={{...ST.card,textAlign:"center",padding:30,color:"#6b7280"}}>אין תביעות עדיין 📋</div>}
          </div>
        )}

        {/* ══ FOOD ══ */}
        {sec==="food" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>מעקב אוכל</h2>
            {fd!==null && fd<7 && (
              <div style={{...ST.card,marginBottom:16,borderColor:"rgba(239,68,68,0.4)",background:"rgba(239,68,68,0.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{color:"#fca5a5",fontWeight:700}}>🚨 נותרו רק {fd} ימים!</div>
                  <button onClick={addFoodTask} style={{...ST.btn,background:foodTaskAdded?"linear-gradient(135deg,#10b981,#059669)":"linear-gradient(135deg,#ef4444,#dc2626)"}}>
                    {foodTaskAdded?"✓ נוסף!":"הוסף משימה לרז"}
                  </button>
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[["🥣","מותג","brand"],["🏷","סוג","type"],["⚖️","כמות יומית גרם","daily"],["🛍","משקל שקית קג","bagKg"],["📅","תאריך פתיחה","openDate"]].map(([icon,label,key])=>(
                <div key={key} style={ST.card}>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>{icon} {label}</div>
                  <input value={food[key]||""} onChange={e=>saveFood(key,e.target.value)} style={{...ST.inp,fontWeight:600}}/>
                </div>
              ))}
              <div style={{...ST.card,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderColor:fd!==null&&fd<7?"rgba(239,68,68,0.4)":"rgba(16,185,129,0.2)"}}>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>ימים נותרים</div>
                <div style={{fontSize:34,fontWeight:800,color:fd!==null&&fd<7?"#ef4444":"#10b981"}}>{fd??"-"}</div>
              </div>
            </div>
          </div>
        )}

        {/* ══ REGISTER ══ */}
        {sec==="register" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>פרטי רישום</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[["🔬","מיקרוצ'יפ","chip"],["🪪","רישיון עירייה","license"],["📅","תוקף רישיון","licenseExp"],["🐕","גזע","breed"],["🎂","תאריך לידה","birthDate"],["🎨","צבע","color"],["👨‍⚕️","וטרינר","vet"],["📞","טלפון וטרינר","vetPhone"]].map(([icon,label,key])=>(
                <div key={key} style={ST.card}>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>{icon} {label}</div>
                  <input value={reg[key]||""} onChange={e=>saveReg(key,e.target.value)} style={{...ST.inp,fontWeight:600}}/>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
         }
