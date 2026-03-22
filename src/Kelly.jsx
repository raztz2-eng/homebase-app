import { useState } from "react";

const SECTIONS = ["weight","tasks","vaccines","medical","insurance","food","register"];

const HE = {
  title: "קלי",
  nav: { weight:"משקל", tasks:"משימות טיפול", vaccines:"חיסונים", medical:"תיק רפואי", insurance:"ביטוח", food:"אוכל", register:"רישום" },
  days: ["א","ב","ג","ד","ה","ו","ש"],
  weight: { title:"מעקב משקל", add:"הוסף שקילה", date:"תאריך", kg:"משקל בקג", note:"הערה", save:"שמור", history:"היסטוריה" },
  tasks: { title:"משימות טיפול מחזוריות", addBtn:"+ הוסף הנחיית וטרינר", instruction:"הנחיה", freq:"פעמים בשבוע", duration:"משך בשבועות", selectDays:"בחר ימים", daysLeft:"ימים נותרו" },
  vaccines: { title:"חיסונים", add:"+ הוסף חיסון", name:"שם חיסון", lastDate:"תאריך אחרון", nextDate:"תאריך הבא", notes:"הערות", overdue:"באיחור", soon:"בקרוב", ok:"תקין" },
  medical: { title:"תיק רפואי", add:"+ הוסף רשומה", date:"תאריך", type:"סוג", description:"תיאור", vet:"וטרינר", types:["בדיקה","ניתוח","טיפול","תרופה","אחר"] },
  insurance: { title:"ביטוח", provider:"חברת ביטוח", policyNum:"מספר פוליסה", expiry:"תוקף", add:"+ הוסף תביעה", claimDate:"תאריך", amount:"סכום", reason:"סיבה", status:"סטטוס", statuses:["הוגש","בטיפול","אושר","שולם"], refundDue:"ממתין להחזר" },
  food: { title:"מעקב אוכל", brand:"מותג", type:"סוג", daily:"כמות יומית גרם", bagKg:"משקל שקית קג", openDate:"תאריך פתיחה", daysLeft:"ימים נותרים", low:"נגמר בקרוב" },
  register: { title:"פרטי רישום", chip:"מספר מיקרוצ'יפ", license:"רישיון עירייה", licenseExp:"תוקף רישיון", breed:"גזע", birthDate:"תאריך לידה", color:"צבע", vet:"וטרינר קבוע", vetPhone:"טלפון וטרינר" },
};

const EN = {
  title: "Kelly",
  nav: { weight:"Weight", tasks:"Care Tasks", vaccines:"Vaccines", medical:"Medical File", insurance:"Insurance", food:"Food", register:"Registration" },
  days: ["Su","Mo","Tu","We","Th","Fr","Sa"],
  weight: { title:"Weight Tracker", add:"Add Weighing", date:"Date", kg:"Weight kg", note:"Note", save:"Save", history:"History" },
  tasks: { title:"Recurring Care Tasks", addBtn:"+ Add Vet Instruction", instruction:"Instruction", freq:"Times per week", duration:"Duration weeks", selectDays:"Select days", daysLeft:"days left" },
  vaccines: { title:"Vaccines", add:"+ Add Vaccine", name:"Vaccine Name", lastDate:"Last Date", nextDate:"Next Date", notes:"Notes", overdue:"Overdue", soon:"Soon", ok:"OK" },
  medical: { title:"Medical File", add:"+ Add Record", date:"Date", type:"Type", description:"Description", vet:"Vet", types:["Checkup","Surgery","Treatment","Medication","Other"] },
  insurance: { title:"Insurance", provider:"Provider", policyNum:"Policy Number", expiry:"Expiry", add:"+ Add Claim", claimDate:"Date", amount:"Amount", reason:"Reason", status:"Status", statuses:["Submitted","In Review","Approved","Paid"], refundDue:"Awaiting Refund" },
  food: { title:"Food Tracker", brand:"Brand", type:"Type", daily:"Daily Amount g", bagKg:"Bag Weight kg", openDate:"Open Date", daysLeft:"Days Left", low:"Running low" },
  register: { title:"Registration", chip:"Microchip Number", license:"City License", licenseExp:"License Expiry", breed:"Breed", birthDate:"Birth Date", color:"Color", vet:"Regular Vet", vetPhone:"Vet Phone" },
};

const st = {
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 },
  inp: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"8px 12px", color:"#e8eaf0", fontSize:14, width:"100%", outline:"none", boxSizing:"border-box" },
  btn: { background:"linear-gradient(135deg,#6366f1,#06b6d4)", border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" },
  tag: (c) => ({ fontSize:11, padding:"2px 8px", borderRadius:20, background:c+"22", color:c, border:"1px solid "+c+"44", fontWeight:600, whiteSpace:"nowrap" }),
};

export default function Kelly({ lang }) {
  const t = lang === "he" ? HE : EN;
  const isRTL = lang === "he";
  const [sec, setSec] = useState("weight");

  const [weights, setWeights] = useState([
    { date:"2024-01-15", kg:28.5, note:"בדיקה שגרתית" },
    { date:"2024-02-20", kg:29.1, note:"" },
    { date:"2024-03-10", kg:28.8, note:"אחרי דיאטה" },
    { date:"2024-04-05", kg:29.3, note:"" },
  ]);
  const [wf, setWf] = useState({ date:new Date().toISOString().slice(0,10), kg:"", note:"" });

  const [vetTasks, setVetTasks] = useState([
    { id:1, instruction:"שמפו מיוחד להגנה על העור", freq:2, weeks:2, start:"2024-03-18", days:[0,3] },
  ]);
  const [vf, setVf] = useState({ instruction:"", freq:2, weeks:2, start:new Date().toISOString().slice(0,10), days:[] });
  const [showVf, setShowVf] = useState(false);

  const [vaccines, setVaccines] = useState([
    { id:1, name:"כלבת", last:"2023-06-10", next:"2024-06-10", notes:"" },
    { id:2, name:"פרוו + דיסטמפר", last:"2023-06-10", next:"2024-06-10", notes:"" },
    { id:3, name:"לפטוספירוזיס", last:"2023-09-01", next:"2024-09-01", notes:"" },
  ]);
  const [vacF, setVacF] = useState({ name:"", last:"", next:"", notes:"" });
  const [showVacF, setShowVacF] = useState(false);

  const [medRecs, setMedRecs] = useState([
    { id:1, date:"2024-01-15", type:"בדיקה", desc:"בדיקה שנתית - הכל תקין", vet:"ד.ר כהן" },
    { id:2, date:"2023-11-20", type:"ניתוח", desc:"עיקור", vet:"ד.ר לוי" },
  ]);
  const [mf, setMf] = useState({ date:"", type:"בדיקה", desc:"", vet:"" });
  const [showMf, setShowMf] = useState(false);

  const [ins, setIns] = useState({ provider:"כלל ביטוח", policyNum:"123456789", expiry:"2025-01-01" });
  const [claims, setClaims] = useState([
    { id:1, date:"2023-11-25", amount:2800, reason:"ניתוח עיקור", status:"אושר" },
    { id:2, date:"2024-01-20", amount:450, reason:"בדיקה שנתית", status:"הוגש" },
  ]);
  const [cf, setCf] = useState({ date:"", amount:"", reason:"", status:"הוגש" });
  const [showCf, setShowCf] = useState(false);

  const [food, setFood] = useState({ brand:"Royal Canin", type:"Medium Adult", daily:280, bagKg:15, openDate:"2024-03-01" });
  const [reg, setReg] = useState({ chip:"972000012345678", license:"TLV-2024-8821", licenseExp:"2025-01-01", breed:"לברדור", birthDate:"2019-05-12", color:"שמנת זהב", vet:"ד.ר כהן", vetPhone:"03-1234567" });

  const taskEnd = (task) => { const d = new Date(task.start); d.setDate(d.getDate() + task.weeks * 7); return d; };
  const taskDaysLeft = (task) => Math.max(0, Math.ceil((taskEnd(task) - Date.now()) / 86400000));
  const foodDays = () => { if (!food.openDate) return null; const total = Math.floor((food.bagKg * 1000) / food.daily); const used = Math.floor((Date.now() - new Date(food.openDate)) / 86400000); return Math.max(0, total - used); };
  const vacSt = (next) => { const d = (new Date(next) - Date.now()) / 86400000; return d < 0 ? "overdue" : d < 30 ? "soon" : "ok"; };

  const addWeight = () => { if (!wf.kg) return; setWeights(p => [...p, {...wf, kg:parseFloat(wf.kg)}].sort((a,b)=>a.date>b.date?1:-1)); setWf({date:new Date().toISOString().slice(0,10),kg:"",note:""}); };
  const toggleDay = (d) => setVf(p => ({...p, days: p.days.includes(d) ? p.days.filter(x=>x!==d) : [...p.days, d]}));
  const addTask = () => { if (!vf.instruction) return; setVetTasks(p=>[...p,{...vf,id:Date.now()}]); setVf({instruction:"",freq:2,weeks:2,start:new Date().toISOString().slice(0,10),days:[]}); setShowVf(false); };

  const trend = () => { if (weights.length < 2) return null; const d = weights[weights.length-1].kg - weights[0].kg; return (d > 0 ? "+" : "") + d.toFixed(1) + " kg"; };

  return (
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",direction:isRTL?"rtl":"ltr",minHeight:"100vh",background:"#0f1117"}}>
      {/* Header */}
      <div style={{background:"rgba(17,19,30,0.95)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"18px 24px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:46,height:46,borderRadius:14,background:"linear-gradient(135deg,#10b981,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🐕</div>
        <div><div style={{fontSize:20,fontWeight:800}}>{t.title} 🐾</div><div style={{fontSize:12,color:"#6b7280"}}>לברדור • נולדה מאי 2019</div></div>
      </div>

      {/* Sub-nav */}
      <div style={{background:"rgba(17,19,30,0.5)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"0 16px",display:"flex",gap:2,overflowX:"auto"}}>
        {SECTIONS.map(s => (
          <button key={s} onClick={()=>setSec(s)} style={{background:"none",border:"none",borderBottom:sec===s?"2px solid #6366f1":"2px solid transparent",padding:"11px 14px",color:sec===s?"#a5b4fc":"#6b7280",fontSize:13,fontWeight:sec===s?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>
            {t.nav[s]}
          </button>
        ))}
      </div>

      <div style={{padding:"22px 24px",maxWidth:860,margin:"0 auto"}}>

        {/* WEIGHT */}
        {sec==="weight" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{t.weight.title}</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
              {[["משקל נוכחי",weights.length?weights[weights.length-1].kg+"":"--","#10b981"],["מגמה",trend()||"--","#a5b4fc"],["שקילות",weights.length,"#06b6d4"]].map(([label,val,color])=>(
                <div key={label} style={{...st.card,textAlign:"center"}}>
                  <div style={{fontSize:11,color:"#6b7280",textTransform:"uppercase",marginBottom:4}}>{label}</div>
                  <div style={{fontSize:26,fontWeight:800,color}}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{...st.card,marginBottom:18}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:"#a5b4fc"}}>גרף משקל</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:90}}>
                {weights.map((w,i)=>{
                  const mn=Math.min(...weights.map(x=>x.kg)),mx=Math.max(...weights.map(x=>x.kg));
                  const h=mx===mn?60:20+((w.kg-mn)/(mx-mn))*70;
                  return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontSize:9,color:"#6b7280"}}>{w.kg}</div>
                    <div style={{width:"100%",height:h,background:"linear-gradient(to top,#6366f1,#06b6d4)",borderRadius:"5px 5px 0 0"}}/>
                    <div style={{fontSize:9,color:"#4b5563"}}>{w.date.slice(5)}</div>
                  </div>);
                })}
              </div>
            </div>
            <div style={st.card}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:12,color:"#a5b4fc"}}>+ {t.weight.add}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:10,alignItems:"end"}}>
                <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.weight.date}</div><input type="date" value={wf.date} onChange={e=>setWf({...wf,date:e.target.value})} style={st.inp}/></div>
                <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.weight.kg}</div><input type="number" step="0.1" placeholder="28.5" value={wf.kg} onChange={e=>setWf({...wf,kg:e.target.value})} style={st.inp}/></div>
                <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.weight.note}</div><input placeholder="..." value={wf.note} onChange={e=>setWf({...wf,note:e.target.value})} style={st.inp}/></div>
                <button onClick={addWeight} style={st.btn}>{t.weight.save}</button>
              </div>
            </div>
            <div style={{marginTop:18}}>
              <div style={{fontSize:13,color:"#6b7280",marginBottom:10}}>{t.weight.history}</div>
              {[...weights].reverse().map((w,i)=>(
                <div key={i} style={{...st.card,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,color:"#9ca3af"}}>{w.date}</div>
                  <div style={{fontSize:17,fontWeight:700,color:"#10b981"}}>{w.kg} kg</div>
                  {w.note&&<div style={{fontSize:12,color:"#6b7280"}}>{w.note}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VET TASKS */}
        {sec==="tasks" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{fontSize:17,fontWeight:700,margin:0}}>{t.tasks.title}</h2>
              <button onClick={()=>setShowVf(!showVf)} style={st.btn}>{t.tasks.addBtn}</button>
            </div>
            {showVf && (
              <div style={{...st.card,marginBottom:18,borderColor:"rgba(99,102,241,0.3)"}}>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.tasks.instruction}</div><input placeholder="לדוגמה: שמפו מיוחד..." value={vf.instruction} onChange={e=>setVf({...vf,instruction:e.target.value})} style={st.inp}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.tasks.freq}</div><input type="number" min="1" max="7" value={vf.freq} onChange={e=>setVf({...vf,freq:parseInt(e.target.value)||1})} style={st.inp}/></div>
                    <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.tasks.duration}</div><input type="number" min="1" value={vf.weeks} onChange={e=>setVf({...vf,weeks:parseInt(e.target.value)||1})} style={st.inp}/></div>
                    <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך התחלה</div><input type="date" value={vf.start} onChange={e=>setVf({...vf,start:e.target.value})} style={st.inp}/></div>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>{t.tasks.selectDays}</div>
                    <div style={{display:"flex",gap:8}}>
                      {t.days.map((d,i)=>(
                        <button key={i} onClick={()=>toggleDay(i)} style={{width:34,height:34,borderRadius:"50%",border:"none",background:vf.days.includes(i)?"#6366f1":"rgba(255,255,255,0.06)",color:vf.days.includes(i)?"#fff":"#6b7280",fontWeight:700,fontSize:11,cursor:"pointer"}}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={addTask} style={{...st.btn,alignSelf:"flex-start"}}>שמור</button>
                </div>
              </div>
            )}
            {vetTasks.map(task=>{
              const dl=taskDaysLeft(task), end=taskEnd(task).toISOString().slice(0,10);
              const pct = Math.min(100, Math.round(100 - (dl/(task.weeks*7))*100));
              return(
                <div key={task.id} style={{...st.card,marginBottom:14,borderColor:dl>0?"rgba(99,102,241,0.3)":"rgba(255,255,255,0.05)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div><div style={{fontSize:14,fontWeight:700,marginBottom:4}}>🛁 {task.instruction}</div><div style={{fontSize:12,color:"#6b7280"}}>{task.start} — {end}</div></div>
                    <div style={st.tag(dl>0?"#6366f1":"#4b5563")}>{dl>0?dl+" "+t.tasks.daysLeft:"הסתיים"}</div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                    <span style={st.tag("#10b981")}>{task.freq}x / שבוע</span>
                    <span style={st.tag("#06b6d4")}>{task.weeks} שבועות</span>
                    <div style={{display:"flex",gap:5,marginRight:"auto"}}>
                      {t.days.map((d,i)=>(
                        <div key={i} style={{width:26,height:26,borderRadius:"50%",background:task.days.includes(i)?"#6366f1":"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:task.days.includes(i)?"#fff":"#4b5563"}}>{d}</div>
                      ))}
                    </div>
                  </div>
                  {dl>0&&<div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}><div style={{height:"100%",background:"linear-gradient(to right,#6366f1,#06b6d4)",borderRadius:2,width:pct+"%"}}/></div>}
                </div>
              );
            })}
          </div>
        )}

        {/* VACCINES */}
        {sec==="vaccines" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{fontSize:17,fontWeight:700,margin:0}}>{t.vaccines.title}</h2>
              <button onClick={()=>setShowVacF(!showVacF)} style={st.btn}>{t.vaccines.add}</button>
            </div>
            {showVacF&&(
              <div style={{...st.card,marginBottom:18}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.vaccines.name}</div><input value={vacF.name} onChange={e=>setVacF({...vacF,name:e.target.value})} style={st.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.vaccines.lastDate}</div><input type="date" value={vacF.last} onChange={e=>setVacF({...vacF,last:e.target.value})} style={st.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.vaccines.nextDate}</div><input type="date" value={vacF.next} onChange={e=>setVacF({...vacF,next:e.target.value})} style={st.inp}/></div>
                </div>
                <input placeholder={t.vaccines.notes} value={vacF.notes} onChange={e=>setVacF({...vacF,notes:e.target.value})} style={{...st.inp,marginBottom:10}}/>
                <button onClick={()=>{if(!vacF.name)return;setVaccines(p=>[...p,{...vacF,id:Date.now()}]);setVacF({name:"",last:"",next:"",notes:""});setShowVacF(false);}} style={st.btn}>שמור</button>
              </div>
            )}
            {vaccines.map(v=>{
              const s=vacSt(v.next), colors={overdue:"#ef4444",soon:"#f59e0b",ok:"#10b981"};
              const daysTo=Math.ceil((new Date(v.next)-Date.now())/86400000);
              return(
                <div key={v.id} style={{...st.card,marginBottom:12,borderColor:s==="overdue"?"rgba(239,68,68,0.3)":s==="soon"?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.07)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:14,fontWeight:700,marginBottom:4}}>💉 {v.name}</div><div style={{fontSize:12,color:"#6b7280"}}>{t.vaccines.lastDate}: {v.last} | {t.vaccines.nextDate}: {v.next}</div>{v.notes&&<div style={{fontSize:12,color:"#9ca3af",marginTop:4}}>{v.notes}</div>}</div>
                    <div style={{textAlign:"center"}}>
                      <div style={st.tag(colors[s])}>{t.vaccines[s]}</div>
                      <div style={{fontSize:11,color:colors[s],marginTop:6,fontWeight:700}}>{s==="overdue"?Math.abs(daysTo)+" ימי איחור":"עוד "+daysTo+" ימים"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MEDICAL */}
        {sec==="medical" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h2 style={{fontSize:17,fontWeight:700,margin:0}}>{t.medical.title}</h2>
              <button onClick={()=>setShowMf(!showMf)} style={st.btn}>{t.medical.add}</button>
            </div>
            {showMf&&(
              <div style={{...st.card,marginBottom:18}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.medical.date}</div><input type="date" value={mf.date} onChange={e=>setMf({...mf,date:e.target.value})} style={st.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.medical.type}</div>
                    <select value={mf.type} onChange={e=>setMf({...mf,type:e.target.value})} style={{...st.inp,appearance:"none"}}>
                      {t.medical.types.map(tp=><option key={tp}>{tp}</option>)}
                    </select>
                  </div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.medical.vet}</div><input value={mf.vet} onChange={e=>setMf({...mf,vet:e.target.value})} style={st.inp}/></div>
                </div>
                <input placeholder={t.medical.description} value={mf.desc} onChange={e=>setMf({...mf,desc:e.target.value})} style={{...st.inp,marginBottom:10}}/>
                <button onClick={()=>{if(!mf.desc)return;setMedRecs(p=>[{...mf,id:Date.now()},...p]);setMf({date:"",type:"בדיקה",desc:"",vet:""});setShowMf(false);}} style={st.btn}>שמור</button>
              </div>
            )}
            {medRecs.map(r=>{
              const tc={בדיקה:"#6366f1",ניתוח:"#ef4444",טיפול:"#10b981",תרופה:"#f59e0b",אחר:"#6b7280",Checkup:"#6366f1",Surgery:"#ef4444",Treatment:"#10b981",Medication:"#f59e0b",Other:"#6b7280"};
              const em={ניתוח:"🔪",תרופה:"💊",טיפול:"💉",Surgery:"🔪",Medication:"💊",Treatment:"💉"};
              return(
                <div key={r.id} style={{...st.card,marginBottom:10,display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{fontSize:22}}>{em[r.type]||"🩺"}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                      <div style={st.tag(tc[r.type]||"#6b7280")}>{r.type}</div>
                      <div style={{fontSize:12,color:"#6b7280"}}>{r.date}</div>
                      {r.vet&&<div style={{fontSize:12,color:"#9ca3af"}}>| {r.vet}</div>}
                    </div>
                    <div style={{fontSize:14}}>{r.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INSURANCE */}
        {sec==="insurance" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{t.insurance.title}</h2>
            <div style={{...st.card,marginBottom:20,borderColor:"rgba(99,102,241,0.2)"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
                {[["🏢",t.insurance.provider,ins.provider],["📋",t.insurance.policyNum,ins.policyNum],["📅",t.insurance.expiry,ins.expiry]].map(([icon,label,val])=>(
                  <div key={label} style={{textAlign:"center"}}>
                    <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
                    <div style={{fontSize:11,color:"#6b7280",marginBottom:2}}>{label}</div>
                    <div style={{fontSize:14,fontWeight:600}}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700}}>תביעות</div>
              <button onClick={()=>setShowCf(!showCf)} style={st.btn}>{t.insurance.add}</button>
            </div>
            {showCf&&(
              <div style={{...st.card,marginBottom:16}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.insurance.claimDate}</div><input type="date" value={cf.date} onChange={e=>setCf({...cf,date:e.target.value})} style={st.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.insurance.amount}</div><input type="number" value={cf.amount} onChange={e=>setCf({...cf,amount:e.target.value})} style={st.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.insurance.reason}</div><input value={cf.reason} onChange={e=>setCf({...cf,reason:e.target.value})} style={st.inp}/></div>
                  <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.insurance.status}</div>
                    <select value={cf.status} onChange={e=>setCf({...cf,status:e.target.value})} style={{...st.inp,appearance:"none"}}>
                      {t.insurance.statuses.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={()=>{if(!cf.reason)return;setClaims(p=>[{...cf,id:Date.now(),amount:parseFloat(cf.amount)||0},...p]);setCf({date:"",amount:"",reason:"",status:"הוגש"});setShowCf(false);}} style={st.btn}>שמור</button>
              </div>
            )}
            {claims.map(c=>{
              const sc={הוגש:"#6b7280",בטיפול:"#f59e0b",אושר:"#06b6d4",שולם:"#10b981",Submitted:"#6b7280","In Review":"#f59e0b",Approved:"#06b6d4",Paid:"#10b981"};
              const pending=["הוגש","בטיפול","אושר","Submitted","In Review","Approved"].includes(c.status);
              return(
                <div key={c.id} style={{...st.card,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",borderColor:pending?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.07)"}}>
                  <div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{c.reason}</div><div style={{fontSize:12,color:"#6b7280"}}>{c.date}</div></div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:19,fontWeight:800,color:"#10b981",marginBottom:4}}>&#8362;{c.amount?.toLocaleString()}</div>
                    <div style={st.tag(sc[c.status]||"#6b7280")}>{c.status}</div>
                    {pending&&<div style={{fontSize:10,color:"#f59e0b",marginTop:4}}>&#9203; {t.insurance.refundDue}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOD */}
        {sec==="food" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{t.food.title}</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
              {[["🥣",t.food.brand,"brand",food.brand],["🏷",t.food.type,"type",food.type],["⚖️",t.food.daily,"daily",food.daily],["🛍",t.food.bagKg,"bagKg",food.bagKg],["📅",t.food.openDate,"openDate",food.openDate]].map(([icon,label,key,val])=>(
                <div key={key} style={st.card}>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>{icon} {label}</div>
                  <input value={val} onChange={e=>setFood({...food,[key]:e.target.value})} style={{...st.inp,fontWeight:600}}/>
                </div>
              ))}
              <div style={{...st.card,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderColor:foodDays()<7?"rgba(239,68,68,0.4)":"rgba(16,185,129,0.2)"}}>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{t.food.daysLeft}</div>
                <div style={{fontSize:34,fontWeight:800,color:foodDays()<7?"#ef4444":"#10b981"}}>{foodDays()}</div>
                {foodDays()<7&&<div style={{fontSize:11,color:"#ef4444",marginTop:4}}>🚨 {t.food.low}</div>}
              </div>
            </div>
          </div>
        )}

        {/* REGISTER */}
        {sec==="register" && (
          <div>
            <h2 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{t.register.title}</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[["🔬",t.register.chip,"chip"],["🪪",t.register.license,"license"],["📅",t.register.licenseExp,"licenseExp"],["🐕",t.register.breed,"breed"],["🎂",t.register.birthDate,"birthDate"],["🎨",t.register.color,"color"],["👨‍⚕️",t.register.vet,"vet"],["📞",t.register.vetPhone,"vetPhone"]].map(([icon,label,key])=>(
                <div key={key} style={st.card}>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:6}}>{icon} {label}</div>
                  <input value={reg[key]} onChange={e=>setReg({...reg,[key]:e.target.value})} style={{...st.inp,fontWeight:600}}/>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
    }
