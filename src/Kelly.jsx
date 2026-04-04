import { useState } from "react";
import { saveDoc, deleteDocById, COL } from "./firebase.js";

const GEMINI_KEY = "AIzaSyCl9eRbYNj8d5IGhCUkimDeCfSPbQwPVNs";

const SECTIONS = ["weight","tasks","vaccines","medical","insurance","food","register"];

const HE = {
  title:"קלי", nav:{weight:"משקל",tasks:"משימות טיפול",vaccines:"חיסונים",medical:"תיק רפואי",insurance:"ביטוח",food:"אוכל",register:"רישום"},
  days:["א","ב","ג","ד","ה","ו","ש"],
  weight:{title:"מעקב משקל",add:"הוסף שקילה",date:"תאריך",kg:"משקל בקג",note:"הערה",save:"שמור",history:"היסטוריה",edit:"ערוך",delete:"מחק"},
  tasks:{title:"משימות טיפול",addBtn:"+ הוסף הנחיית וטרינר",instruction:"הנחיה",freq:"פעמים בשבוע",duration:"משך בשבועות",selectDays:"בחר ימים",daysLeft:"ימים נותרו",note:"הערה",addToMain:"הוסף למשימות הכלליות",addedToMain:"נוסף!"},
  vaccines:{title:"חיסונים",add:"+ הוסף חיסון",name:"שם חיסון",lastDate:"תאריך אחרון",nextDate:"תאריך הבא",notes:"הערות",overdue:"באיחור",soon:"בקרוב",ok:"תקין",edit:"ערוך",delete:"מחק"},
  medical:{title:"תיק רפואי",add:"+ הוסף רשומה",date:"תאריך",type:"סוג",description:"תיאור",vet:"וטרינר",types:["בדיקה","ניתוח","טיפול","תרופה","אחר"],upload:"העלה מסמך רפואי",analyzing:"מנתח מסמך...",analyzed:"הניתוח הושלם",edit:"ערוך",delete:"מחק"},
  insurance:{title:"ביטוח",provider:"חברת ביטוח",policyNum:"מספר פוליסה",expiry:"תוקף",add:"+ הוסף תביעה",claimDate:"תאריך",amount:"סכום",reason:"סיבה",status:"סטטוס",statuses:["הוגש","בתהליך","אושר","דרושים מסמכים","שולם"],refundDue:"ממתין להחזר",edit:"ערוך",save:"שמור"},
  food:{title:"מעקב אוכל",brand:"מותג",type:"סוג",daily:"כמות יומית גרם",bagKg:"משקל שקית קג",openDate:"תאריך פתיחה",daysLeft:"ימים נותרים",low:"נגמר בקרוב",taskAdded:"נוספה משימה לרז!"},
  register:{title:"פרטי רישום",chip:"מיקרוצ'יפ",license:"רישיון עירייה",licenseExp:"תוקף רישיון",breed:"גזע",birthDate:"תאריך לידה",color:"צבע",vet:"וטרינר",vetPhone:"טלפון וטרינר"},
};

const ST = {
  card:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20},
  inp:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"9px 12px",color:"#e8eaf0",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"},
  btn:{background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"},
  btnSm:(c="#6366f1")=>({background:`rgba(${c},0.12)`,border:`1px solid rgba(${c},0.3)`,borderRadius:8,padding:"4px 10px",color:`#a5b4fc`,fontSize:11,cursor:"pointer"}),
  tag:(c)=>({fontSize:11,padding:"2px 8px",borderRadius:20,background:c+"22",color:c,border:"1px solid "+c+"44",fontWeight:600}),
};

let UID=300; const nid=()=>"k"+String(++UID)+Date.now();

export default function Kelly({ lang, onAddTask }) {
  const t = HE;
  const [sec, setSec] = useState("weight");

  // Weight
  const [weights, setWeights] = useState([
    {id:"w1",date:"2024-01-15",kg:28.5,note:"בדיקה שגרתית"},
    {id:"w2",date:"2024-02-20",kg:29.1,note:""},
    {id:"w3",date:"2024-03-10",kg:28.8,note:"אחרי דיאטה"},
  ]);
  const [wf, setWf] = useState({date:new Date().toISOString().slice(0,10),kg:"",note:""});
  const [editWId, setEditWId] = useState(null);

  // Vet Tasks
  const [vetTasks, setVetTasks] = useState([
    {id:"vt1",instruction:"שמפו מיוחד להגנה על העור",freq:2,weeks:2,start:"2024-03-18",days:[0,3],note:"להשתמש בשמפו היפואלרגני",addedToMain:false},
  ]);
  const [vf, setVf] = useState({instruction:"",freq:2,weeks:2,start:new Date().toISOString().slice(0,10),days:[],note:""});
  const [showVf, setShowVf] = useState(false);
  const [addedMain, setAddedMain] = useState({});

  // Vaccines
  const [vaccines, setVaccines] = useState([
    {id:"v1",name:"כלבת",last:"2023-06-10",next:"2024-06-10",notes:""},
    {id:"v2",name:"פרוו + דיסטמפר",last:"2023-06-10",next:"2024-06-10",notes:""},
    {id:"v3",name:"לפטוספירוזיס",last:"2023-09-01",next:"2024-09-01",notes:""},
  ]);
  const [vacF, setVacF] = useState({name:"",last:"",next:"",notes:""});
  const [showVacF, setShowVacF] = useState(false);
  const [editVacId, setEditVacId] = useState(null);

  // Medical
  const [medRecs, setMedRecs] = useState([
    {id:"m1",date:"2024-01-15",type:"בדיקה",desc:"בדיקה שנתית - הכל תקין",vet:"ד.ר כהן"},
    {id:"m2",date:"2023-11-20",type:"ניתוח",desc:"עיקור",vet:"ד.ר לוי"},
  ]);
  const [mf, setMf] = useState({date:"",type:"בדיקה",desc:"",vet:""});
  const [showMf, setShowMf] = useState(false);
  const [editMId, setEditMId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");

  // Insurance
  const [ins, setIns] = useState({provider:"כלל ביטוח",policyNum:"123456789",expiry:"2025-01-01"});
  const [editIns, setEditIns] = useState(false);
  const [insForm, setInsForm] = useState({...ins});
  const [claims, setClaims] = useState([
    {id:"c1",date:"2023-11-25",amount:2800,reason:"ניתוח עיקור",status:"אושר"},
    {id:"c2",date:"2024-01-20",amount:450,reason:"בדיקה שנתית",status:"הוגש"},
  ]);
  const [cf, setCf] = useState({date:"",amount:"",reason:"",status:"הוגש"});
  const [showCf, setShowCf] = useState(false);
  const [editCId, setEditCId] = useState(null);

  // Food
  const [food, setFood] = useState({brand:"Royal Canin",type:"Medium Adult",daily:280,bagKg:15,openDate:"2024-03-01"});
  const [foodTaskAdded, setFoodTaskAdded] = useState(false);

  // Register
  const [reg, setReg] = useState({chip:"972000012345678",license:"TLV-2024-8821",licenseExp:"2025-01-01",breed:"לברדור",birthDate:"2019-05-12",color:"שמנת זהב",vet:"ד.ר כהן",vetPhone:"03-1234567"});

  // ── Helpers ────────────────────────────────────────────
  const taskEnd=(task)=>{const d=new Date(task.start);d.setDate(d.getDate()+task.weeks*7);return d;};
  const taskDL=(task)=>Math.max(0,Math.ceil((taskEnd(task)-Date.now())/86400000));
  const foodDays=()=>{if(!food.openDate)return null;const total=Math.floor((food.bagKg*1000)/food.daily);const used=Math.floor((Date.now()-new Date(food.openDate))/86400000);return Math.max(0,total-used);};
  const vacSt=(next)=>{const d=(new Date(next)-Date.now())/86400000;return d<0?"overdue":d<30?"soon":"ok";};

  // ── Weight actions ─────────────────────────────────────
  const saveWeight=()=>{
    if(!wf.kg) return;
    if(editWId){
      setWeights(p=>p.map(w=>w.id===editWId?{...w,...wf,kg:parseFloat(wf.kg)}:w));
      setEditWId(null);
    } else {
      setWeights(p=>[...p,{id:nid(),...wf,kg:parseFloat(wf.kg)}].sort((a,b)=>a.date>b.date?1:-1));
    }
    setWf({date:new Date().toISOString().slice(0,10),kg:"",note:""});
  };
  const startEditWeight=(w)=>{setEditWId(w.id);setWf({date:w.date,kg:String(w.kg),note:w.note});};
  const deleteWeight=(id)=>setWeights(p=>p.filter(w=>w.id!==id));

  // ── Vet task actions ───────────────────────────────────
  const toggleDay=(d)=>setVf(p=>({...p,days:p.days.includes(d)?p.days.filter(x=>x!==d):[...p.days,d]}));
  const addTask=()=>{if(!vf.instruction)return;setVetTasks(p=>[...p,{id:nid(),...vf,addedToMain:false}]);setVf({instruction:"",freq:2,weeks:2,start:new Date().toISOString().slice(0,10),days:[],note:""});setShowVf(false);};
  const deleteVetTask=(id)=>setVetTasks(p=>p.filter(t=>t.id!==id));

  const addToMainTasks=(task)=>{
    if(onAddTask){
      onAddTask({
        id:nid(),he:task.instruction,en:task.instruction,
        cat:"other",priority:"medium",person:"Both",
        recur:"weekly",dueDate:taskEnd(task).toISOString().slice(0,10),
        note:task.note||"",done:false,lastDone:"",
      });
    }
    setAddedMain(p=>({...p,[task.id]:true}));
    setTimeout(()=>setAddedMain(p=>({...p,[task.id]:false})),2000);
  };

  // ── Vaccine actions ────────────────────────────────────
  const saveVac=()=>{
    if(!vacF.name)return;
    if(editVacId){
      setVaccines(p=>p.map(v=>v.id===editVacId?{...v,...vacF}:v));
      setEditVacId(null);
    } else {
      setVaccines(p=>[...p,{id:nid(),...vacF}]);
    }
    setVacF({name:"",last:"",next:"",notes:""});setShowVacF(false);
  };
  const startEditVac=(v)=>{setEditVacId(v.id);setVacF({name:v.name,last:v.last,next:v.next,notes:v.notes});setShowVacF(true);};
  const deleteVac=(id)=>setVaccines(p=>p.filter(v=>v.id!==id));

  // ── Medical actions ────────────────────────────────────
  const saveMed=()=>{
    if(!mf.desc)return;
    if(editMId){
      setMedRecs(p=>p.map(r=>r.id===editMId?{...r,...mf}:r));
      setEditMId(null);
    } else {
      setMedRecs(p=>[{id:nid(),...mf},...p]);
    }
    setMf({date:"",type:"בדיקה",desc:"",vet:""});setShowMf(false);
  };
  const startEditMed=(r)=>{setEditMId(r.id);setMf({date:r.date,type:r.type,desc:r.desc,vet:r.vet});setShowMf(true);};
  const deleteMed=(id)=>setMedRecs(p=>p.filter(r=>r.id!==id));

  // ── Gemini document analysis ───────────────────────────
  const analyzeDoc = async (file) => {
    setAnalyzing(true);
    setAnalysisResult("");
    try {
      const toB64=(file)=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const b64 = await toB64(file);
      const mime = file.type || "application/pdf";
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[
          {text:"אתה וטרינר מומחה. נתח את המסמך הרפואי הזה של כלב ותן סיכום בעברית עם: 1) ממצאים עיקריים 2) תרופות/טיפולים שנרשמו 3) המלצות המשך 4) תאריכי מעקב חשובים. פורמט ברור ומסודר."},
          {inline_data:{mime_type:mime,data:b64}}
        ]}]}),
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא ניתן לנתח את המסמך";
      setAnalysisResult(text);
      // Auto-add to medical records
      setMedRecs(p=>[{id:nid(),date:new Date().toISOString().slice(0,10),type:"בדיקה",desc:"ניתוח מסמך: "+text.slice(0,200)+"...",vet:"AI Analysis"},...p]);
    } catch(e) {
      setAnalysisResult("שגיאה בניתוח המסמך: "+e.message);
    }
    setAnalyzing(false);
  };

  // ── Insurance actions ──────────────────────────────────
  const saveIns=()=>{setIns(insForm);setEditIns(false);};
  const saveClaim=()=>{
    if(!cf.reason)return;
    if(editCId){
      setClaims(p=>p.map(c=>c.id===editCId?{...c,...cf,amount:parseFloat(cf.amount)||0}:c));
      setEditCId(null);
    } else {
      setClaims(p=>[{id:nid(),...cf,amount:parseFloat(cf.amount)||0},...p]);
    }
    setCf({date:"",amount:"",reason:"",status:"הוגש"});setShowCf(false);
  };
  const startEditClaim=(c)=>{setEditCId(c.id);setCf({date:c.date,amount:String(c.amount),reason:c.reason,status:c.status});setShowCf(true);};
  const deleteClaim=(id)=>setClaims(p=>p.filter(c=>c.id!==id));
  const updateClaimStatus=(id,status)=>setClaims(p=>p.map(c=>c.id===id?{...c,status}:c));

  // ── Food alert ─────────────────────────────────────────
  const addFoodTask=()=>{
    if(onAddTask){
      onAddTask({id:nid(),he:"לקנות אוכל לקלי",en:"Buy food for Kelly",cat:"other",priority:"high",person:"Raz",recur:"none",dueDate:new Date().toISOString().slice(0,10),note:"אוכל: "+food.brand+" "+food.type,done:false,lastDone:""});
    }
    setFoodTaskAdded(true);
    setTimeout(()=>setFoodTaskAdded(false),3000);
  };

  const fd = foodDays();
  const stColors={overdue:"#ef4444",soon:"#f59e0b",ok:"#10b981"};

  return (
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",direction:"rtl",minHeight:"100vh",background:"#0f1117"}}>
      {/* Header */}
      <div style={{background:"rgba(17,19,30,0.95)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"16px 22px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:46,height:46,borderRadius:14,background:"linear-gradient(135deg,#10b981,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🐕</div>
        <div><div style={{fontSize:20,fontWeight:800}}>קלי 🐾</div><div style={{fontSize:12,color:"#6b7280"}}>לברדור · נולדה מאי 2019</div></div>
        {fd !== null && fd < 7 && (
          <div style={{marginRight:"auto",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"6px 14px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#fca5a5",fontSize:12}}>🚨 נותרו {fd} ימי אוכל!</span>
            <button onClick={addFoodTask} style={{...ST.btn,padding:"4px 10px",fontSize:11}}>
              {foodTaskAdded?"✓ נוסף!":"הוסף משימה לרז"}
            </button>
          </div>
        )}
      </div>

      {/* Sub-nav */}
      <div style={{background:"rgba(17,19,30,0.5)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"0 16px",display:"flex",gap:2,overflowX:"auto"}}>
        {SECTIONS.map(s=>(
          <button key={s} onClick={()=>setSec(s)} style={{background:"none",border:"none",borderBottom:sec===s?"2px solid #6366f1":"2px solid transparent",padding:"11px 14px",color:sec===s?"#a5b4fc":"#6b7280",fontSize:13,fontWeight:sec===s?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>
            {t.nav[s]}
          </button>
        ))}
      </div>

      <div style={{padding:"20px 22px",maxWidth:860,margin:"0 auto"}}>

        {/* ── WEIGHT ── */}
        {sec==="weight" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{t.weight.title}</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
              {[["משקל נוכחי",weights.length?weights[weights.length-1].kg+"":"--","#10b981"],["מגמה",weights.length>=2?((weights[weights.length-1].kg-weights[0].kg)>0?"+":"")+( weights[weights.length-1].kg-weights[0].kg).toFixed(1)+" kg":"--","#a5b4fc"],["שקילות",weights.length,"#06b6d4"]].map(([l,v,c])=>(
                <div key={l} style={{...ST.card,textAlign:"center"}}>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{l}</div>
                  <div style={{fontSize:26,fontWeight:800,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            {/* Bar chart */}
            <div style={{...ST.card,marginBottom:18}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:"#a5b4fc"}}>גרף משקל</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:90}}>
                {weights.map((w,i)=>{const mn=Math.min(...weights.map(x=>x.kg)),mx=Math.max(...weights.map(x=>x.kg));const h=mx===mn?60:20+((w.kg-mn)/(mx-mn))*70;return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{fontSize:9,color:"#6b7280"}}>{w.kg}</div><div style={{width:"100%",height:h,background:"linear-gradient(to top,#6366f1,#06b6d4)",borderRadius:"5px 5px 0 0"}}/><div style={{fontSize:9,color:"#4b5563"}}>{w.date.slice(5)}</div></div>);})}
              </div>
            </div>
            {/* Form */}
            <div style={ST.card}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:12,color:"#a5b4fc"}}>{editWId?"✏️ עריכת שקילה":"+ "+t.weight.add}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:10,alignItems:"end"}}>
                <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.weight.date}</div><input type="date" value={wf.date} onChange={e=>setWf({...wf,date:e.target.value})} style={ST.inp}/></div>
                <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.weight.kg}</div><input type="number" step="0.1" value={wf.kg} onChange={e=>setWf({...wf,kg:e.target.value})} style={ST.inp}/></div>
                <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.weight.note}</div><input value={wf.note} onChange={e=>setWf({...wf,note:e.target.value})} style={ST.inp}/></div>
                <button onClick={saveWeight} style={ST.btn}>{t.weight.save}</button>
              </div>
              {editWId&&<button onClick={()=>{setEditWId(null);setWf({date:new Date().toISOString().slice(0,10),kg:"",note:""});}} style={{marginTop:8,background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:12}}>ביטול</button>}
            </div>
            {/* History */}
            <div style={{marginTop:18}}>
              <div style={{fontSize:13,color:"#6b7280",marginBottom:10}}>היסטוריה</div>
              {[...weights].reverse().map(w=>(
                <div key={w.id} style={{...ST.card,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,color:"#9ca3af"}}>{w.date}</div>
                  <div style={{fontSize:17,fontWeight:700,color:"#10b981"}}>{w.kg} kg</div>
                  {w.note&&<div style={{fontSize:12,color:"#6b7280"}}>{w.note}</div>}
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>startEditWeight(w)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 9px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>deleteWeight(w.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 9px",color:"#fca5a5",fontSize:11,cursor:"pointer"}}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VET TASKS ── */}
        {sec==="tasks" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{fontSize:17,fontWeight:700,margin:0}}>{t.tasks.title}</h2>
              <button onClick={()=>setShowVf(!showVf)} style={ST.btn}>{t.tasks.addBtn}</button>
            </div>
            {showVf&&(
              <div style={{...ST.card,marginBottom:18,borderColor:"rgba(99,102,241,0.3)"}}>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.tasks.instruction}</div><input value={vf.instruction} onChange={e=>setVf({...vf,instruction:e.target.value})} placeholder="לדוגמה: שמפו מיוחד..." style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.tasks.note}</div><input value={vf.note} onChange={e=>setVf({...vf,note:e.target.value})} placeholder="הערה אופציונלית..." style={ST.inp}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.tasks.freq}</div><input type="number" min="1" max="7" value={vf.freq} onChange={e=>setVf({...vf,freq:parseInt(e.target.value)||1})} style={ST.inp}/></div>
                    <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.tasks.duration}</div><input type="number" min="1" value={vf.weeks} onChange={e=>setVf({...vf,weeks:parseInt(e.target.value)||1})} style={ST.inp}/></div>
                    <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך התחלה</div><input type="date" value={vf.start} onChange={e=>setVf({...vf,start:e.target.value})} style={ST.inp}/></div>
                  </div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>{t.tasks.selectDays}</div>
                    <div style={{display:"flex",gap:8}}>
                      {t.days.map((d,i)=><button key={i} onClick={()=>toggleDay(i)} style={{width:34,height:34,borderRadius:"50%",border:"none",background:vf.days.includes(i)?"#6366f1":"rgba(255,255,255,0.06)",color:vf.days.includes(i)?"#fff":"#6b7280",fontWeight:700,fontSize:11,cursor:"pointer"}}>{d}</button>)}
                    </div>
                  </div>
                  <button onClick={addTask} style={{...ST.btn,alignSelf:"flex-start"}}>שמור</button>
                </div>
              </div>
            )}
            {vetTasks.map(task=>{
              const dl=taskDL(task),end=taskEnd(task).toISOString().slice(0,10);
              const pct=Math.min(100,Math.round(100-(dl/(task.weeks*7))*100));
              return(
                <div key={task.id} style={{...ST.card,marginBottom:14,borderColor:dl>0?"rgba(99,102,241,0.3)":"rgba(255,255,255,0.05)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>🛁 {task.instruction}</div>
                      {task.note&&<div style={{fontSize:12,color:"#6b7280",marginBottom:4}}>📝 {task.note}</div>}
                      <div style={{fontSize:11,color:"#6b7280"}}>{task.start} — {end}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <div style={ST.tag(dl>0?"#6366f1":"#4b5563")}>{dl>0?dl+" "+t.tasks.daysLeft:"הסתיים"}</div>
                      <button
                        onClick={()=>addToMainTasks(task)}
                        style={{background:addedMain[task.id]?"rgba(16,185,129,0.15)":"rgba(99,102,241,0.12)",border:addedMain[task.id]?"1px solid rgba(16,185,129,0.3)":"1px solid rgba(99,102,241,0.25)",borderRadius:8,padding:"4px 10px",color:addedMain[task.id]?"#6ee7b7":"#a5b4fc",fontSize:11,cursor:"pointer",fontWeight:600}}
                      >
                        {addedMain[task.id]?"✓ "+t.tasks.addedToMain:"📋 "+t.tasks.addToMain}
                      </button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                    <span style={ST.tag("#10b981")}>{task.freq}x / שבוע</span>
                    <span style={ST.tag("#06b6d4")}>{task.weeks} שבועות</span>
                    <div style={{display:"flex",gap:4,marginRight:"auto"}}>
                      {t.days.map((d,i)=><div key={i} style={{width:26,height:26,borderRadius:"50%",background:task.days.includes(i)?"#6366f1":"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:task.days.includes(i)?"#fff":"#4b5563"}}>{d}</div>)}
                    </div>
                  </div>
                  {dl>0&&<div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}><div style={{height:"100%",background:"linear-gradient(to right,#6366f1,#06b6d4)",borderRadius:2,width:pct+"%"}}/></div>}
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                    <button onClick={()=>deleteVetTask(task.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 9px",color:"#fca5a5",fontSize:11,cursor:"pointer"}}>🗑 מחק</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── VACCINES ── */}
        {sec==="vaccines" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{fontSize:17,fontWeight:700,margin:0}}>{t.vaccines.title}</h2>
              <button onClick={()=>{setShowVacF(!showVacF);setEditVacId(null);setVacF({name:"",last:"",next:"",notes:""});}} style={ST.btn}>{t.vaccines.add}</button>
            </div>
            {showVacF&&(
              <div style={{...ST.card,marginBottom:18}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.vaccines.name}</div><input value={vacF.name} onChange={e=>setVacF({...vacF,name:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.vaccines.lastDate}</div><input type="date" value={vacF.last} onChange={e=>setVacF({...vacF,last:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.vaccines.nextDate}</div><input type="date" value={vacF.next} onChange={e=>setVacF({...vacF,next:e.target.value})} style={ST.inp}/></div>
                </div>
                <input placeholder={t.vaccines.notes} value={vacF.notes} onChange={e=>setVacF({...vacF,notes:e.target.value})} style={{...ST.inp,marginBottom:10}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveVac} style={ST.btn}>{editVacId?"עדכן":"שמור"}</button>
                  {editVacId&&<button onClick={()=>{setEditVacId(null);setShowVacF(false);setVacF({name:"",last:"",next:"",notes:""}); }} style={{...ST.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>}
                </div>
              </div>
            )}
            {vaccines.map(v=>{
              const s=vacSt(v.next),c=stColors[s];
              const daysTo=Math.ceil((new Date(v.next)-Date.now())/86400000);
              return(
                <div key={v.id} style={{...ST.card,marginBottom:12,borderColor:s==="overdue"?"rgba(239,68,68,0.3)":s==="soon"?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.07)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>💉 {v.name}</div>
                      <div style={{fontSize:12,color:"#6b7280"}}>{t.vaccines.lastDate}: {v.last} | {t.vaccines.nextDate}: {v.next}</div>
                      {v.notes&&<div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>{v.notes}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <div style={ST.tag(c)}>{t.vaccines[s]}</div>
                      <div style={{fontSize:11,color:c,fontWeight:700}}>{s==="overdue"?Math.abs(daysTo)+" ימי איחור":"עוד "+daysTo+" ימים"}</div>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>startEditVac(v)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 9px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>✏️</button>
                        <button onClick={()=>deleteVac(v.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 9px",color:"#fca5a5",fontSize:11,cursor:"pointer"}}>🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MEDICAL ── */}
        {sec==="medical" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{fontSize:17,fontWeight:700,margin:0}}>{t.medical.title}</h2>
              <button onClick={()=>{setShowMf(!showMf);setEditMId(null);setMf({date:"",type:"בדיקה",desc:"",vet:""}); }} style={ST.btn}>{t.medical.add}</button>
            </div>
            {/* Gemini document upload */}
            <div style={{...ST.card,marginBottom:18,borderColor:"rgba(16,185,129,0.2)"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#10b981",marginBottom:10}}>🤖 {t.medical.upload}</div>
              <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                <label style={{...ST.btn,display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                  📄 בחר קובץ (PDF / תמונה)
                  <input type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&analyzeDoc(e.target.files[0])}/>
                </label>
                {analyzing&&<div style={{display:"flex",alignItems:"center",gap:8,color:"#a5b4fc",fontSize:13}}><div style={{width:16,height:16,border:"2px solid rgba(99,102,241,0.3)",borderTop:"2px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>מנתח...</div>}
              </div>
              {analysisResult&&(
                <div style={{marginTop:14,padding:14,background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",color:"#e8eaf0"}}>
                  <div style={{fontSize:11,color:"#10b981",fontWeight:700,marginBottom:8}}>✅ {t.medical.analyzed}</div>
                  {analysisResult}
                </div>
              )}
            </div>
            {showMf&&(
              <div style={{...ST.card,marginBottom:18}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.medical.date}</div><input type="date" value={mf.date} onChange={e=>setMf({...mf,date:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.medical.type}</div><select value={mf.type} onChange={e=>setMf({...mf,type:e.target.value})} style={{...ST.inp,appearance:"none"}}>{t.medical.types.map(tp=><option key={tp}>{tp}</option>)}</select></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.medical.vet}</div><input value={mf.vet} onChange={e=>setMf({...mf,vet:e.target.value})} style={ST.inp}/></div>
                </div>
                <input placeholder={t.medical.description} value={mf.desc} onChange={e=>setMf({...mf,desc:e.target.value})} style={{...ST.inp,marginBottom:10}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveMed} style={ST.btn}>{editMId?"עדכן":"שמור"}</button>
                  {editMId&&<button onClick={()=>{setEditMId(null);setShowMf(false);}} style={{...ST.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>}
                </div>
              </div>
            )}
            {medRecs.map(r=>{
              const tc={בדיקה:"#6366f1",ניתוח:"#ef4444",טיפול:"#10b981",תרופה:"#f59e0b",אחר:"#6b7280"};
              const em={ניתוח:"🔪",תרופה:"💊",טיפול:"💉"};
              return(
                <div key={r.id} style={{...ST.card,marginBottom:10,display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{fontSize:20}}>{em[r.type]||"🩺"}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                      <div style={ST.tag(tc[r.type]||"#6b7280")}>{r.type}</div>
                      <div style={{fontSize:12,color:"#6b7280"}}>{r.date}</div>
                      {r.vet&&<div style={{fontSize:12,color:"#9ca3af"}}>| {r.vet}</div>}
                    </div>
                    <div style={{fontSize:13}}>{r.desc}</div>
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    <button onClick={()=>startEditMed(r)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 9px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>deleteMed(r.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 9px",color:"#fca5a5",fontSize:11,cursor:"pointer"}}>🗑</button>
                  </div>
                </div>
              );
            })}
            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          </div>
        )}

        {/* ── INSURANCE ── */}
        {sec==="insurance" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{t.insurance.title}</h2>
            {/* Policy details */}
            <div style={{...ST.card,marginBottom:20,borderColor:"rgba(99,102,241,0.2)"}}>
              {editIns?(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                    {[["provider","חברת ביטוח"],["policyNum","מספר פוליסה"],["expiry","תוקף"]].map(([k,l])=>(
                      <div key={k}><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{l}</div><input value={insForm[k]} onChange={e=>setInsForm({...insForm,[k]:e.target.value})} style={ST.inp}/></div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={saveIns} style={ST.btn}>שמור</button>
                    <button onClick={()=>setEditIns(false)} style={{...ST.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>
                  </div>
                </div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                  {[["🏢","חברת ביטוח",ins.provider],["📋","מספר פוליסה",ins.policyNum],["📅","תוקף",ins.expiry]].map(([icon,label,val])=>(
                    <div key={label} style={{textAlign:"center"}}>
                      <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
                      <div style={{fontSize:11,color:"#6b7280",marginBottom:2}}>{label}</div>
                      <div style={{fontSize:14,fontWeight:600}}>{val}</div>
                    </div>
                  ))}
                  <div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end"}}>
                    <button onClick={()=>{setInsForm({...ins});setEditIns(true);}} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"5px 12px",color:"#a5b4fc",fontSize:12,cursor:"pointer"}}>✏️ ערוך פרטי ביטוח</button>
                  </div>
                </div>
              )}
            </div>
            {/* Claims */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700}}>תביעות</div>
              <button onClick={()=>{setShowCf(!showCf);setEditCId(null);setCf({date:"",amount:"",reason:"",status:"הוגש"});}} style={ST.btn}>{t.insurance.add}</button>
            </div>
            {showCf&&(
              <div style={{...ST.card,marginBottom:16}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.insurance.claimDate}</div><input type="date" value={cf.date} onChange={e=>setCf({...cf,date:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.insurance.amount}</div><input type="number" value={cf.amount} onChange={e=>setCf({...cf,amount:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.insurance.reason}</div><input value={cf.reason} onChange={e=>setCf({...cf,reason:e.target.value})} style={ST.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.insurance.status}</div>
                    <select value={cf.status} onChange={e=>setCf({...cf,status:e.target.value})} style={{...ST.inp,appearance:"none"}}>
                      {t.insurance.statuses.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveClaim} style={ST.btn}>{editCId?"עדכן":"שמור"}</button>
                  {editCId&&<button onClick={()=>{setEditCId(null);setShowCf(false);}} style={{...ST.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>}
                </div>
              </div>
            )}
            {claims.map(c=>{
              const sc={"הוגש":"#6b7280","בתהליך":"#f59e0b","אושר":"#06b6d4","דרושים מסמכים":"#ef4444","שולם":"#10b981"};
              return(
                <div key={c.id} style={{...ST.card,marginBottom:10,borderColor:c.status==="דרושים מסמכים"?"rgba(239,68,68,0.3)":"rgba(255,255,255,0.07)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{c.reason}</div>
                      <div style={{fontSize:12,color:"#6b7280"}}>{c.date}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                      <div style={{fontSize:18,fontWeight:800,color:"#10b981"}}>₪{c.amount?.toLocaleString()}</div>
                      {/* Status selector */}
                      <select value={c.status} onChange={e=>updateClaimStatus(c.id,e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+(sc[c.status]||"#6b7280")+"44",borderRadius:8,padding:"3px 8px",color:sc[c.status]||"#6b7280",fontSize:11,cursor:"pointer",outline:"none"}}>
                        {t.insurance.statuses.map(s=><option key={s}>{s}</option>)}
                      </select>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>startEditClaim(c)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 9px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>✏️</button>
                        <button onClick={()=>deleteClaim(c.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 9px",color:"#fca5a5",fontSize:11,cursor:"pointer"}}>🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FOOD ── */}
        {sec==="food" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{t.food.title}</h2>
            {fd!==null&&fd<7&&(
              <div style={{...ST.card,marginBottom:16,borderColor:"rgba(239,68,68,0.4)",background:"rgba(239,68,68,0.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{color:"#fca5a5",fontWeight:700}}>🚨 נותרו רק {fd} ימים!</div>
                  <button onClick={addFoodTask} style={{...ST.btn,background:foodTaskAdded?"linear-gradient(135deg,#10b981,#059669)":"linear-gradient(135deg,#ef4444,#dc2626)"}}>
                    {foodTaskAdded?"✓ "+t.food.taskAdded:"הוסף משימה לרז"}
                  </button>
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
              {[["🥣","מותג","brand",food.brand],["🏷","סוג","type",food.type],["⚖️","כמות יומית גרם","daily",food.daily],["🛍","משקל שקית קג","bagKg",food.bagKg],["📅","תאריך פתיחה","openDate",food.openDate]].map(([icon,label,key,val])=>(
                <div key={key} style={ST.card}>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>{icon} {label}</div>
                  <input value={val} onChange={e=>setFood({...food,[key]:e.target.value})} style={{...ST.inp,fontWeight:600}}/>
                </div>
              ))}
              <div style={{...ST.card,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderColor:fd!==null&&fd<7?"rgba(239,68,68,0.4)":"rgba(16,185,129,0.2)"}}>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>ימים נותרים</div>
                <div style={{fontSize:34,fontWeight:800,color:fd!==null&&fd<7?"#ef4444":"#10b981"}}>{fd??"-"}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── REGISTER ── */}
        {sec==="register" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{t.register.title}</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[["🔬",t.register.chip,"chip"],["🪪",t.register.license,"license"],["📅",t.register.licenseExp,"licenseExp"],["🐕",t.register.breed,"breed"],["🎂",t.register.birthDate,"birthDate"],["🎨",t.register.color,"color"],["👨‍⚕️",t.register.vet,"vet"],["📞",t.register.vetPhone,"vetPhone"]].map(([icon,label,key])=>(
                <div key={key} style={ST.card}>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>{icon} {label}</div>
                  <input value={reg[key]} onChange={e=>setReg({...reg,[key]:e.target.value})} style={{...ST.inp,fontWeight:600}}/>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
