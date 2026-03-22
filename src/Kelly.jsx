import { useState } from "react";

const SECTIONS = ["weight","tasks","vet","vaccines","medical","insurance","food","register"];

const LABELS = {
  he: {
    title: "קלי 🐕",
    nav: { weight:"משקל", tasks:"משימות טיפול", vet:"הנחיות וטרינר", vaccines:"חיסונים", medical:"תיק רפואי", insurance:"ביטוח", food:"אוכל", register:"רישום" },
    weight: { title:"מעקב משקל", add:"הוסף שקילה", date:"תאריך", kg:"משקל (ק"ג)", note:"הערה", save:"שמור", history:"היסטוריה", trend:"מגמה", noData:"אין נתונים עדיין" },
    tasks: { title:"משימות טיפול מחזוריות", addVet:"הוסף הנחיית וטרינר", instruction:"הנחיה", freq:"תדירות", days:"ימים בשבוע", duration:"משך (שבועות)", selectDays:"בחר ימים", active:"פעיל", done:"בוצע היום", upcoming:"קרוב", daysLeft:"ימים נותרו" },
    vet: { title:"הנחיות וטרינר", add:"הוסף הנחיה", instruction:"הנחיה", startDate:"תאריך התחלה", endDate:"תאריך סיום", freq:"פעמים בשבוע", days:"ימים לרחצה" },
    vaccines: { title:"חיסונים", add:"הוסף חיסון", name:"שם חיסון", lastDate:"תאריך אחרון", nextDate:"תאריך הבא", notes:"הערות", overdue:"באיחור!", soon:"בקרוב", ok:"תקין" },
    medical: { title:"תיק רפואי", add:"הוסף רשומה", date:"תאריך", type:"סוג", description:"תיאור", vet:"וטרינר", types:["בדיקה","ניתוח","טיפול","תרופה","אחר"] },
    insurance: { title:"ביטוח", provider:"חברת ביטוח", policyNum:"מספר פוליסה", expiry:"תאריך פקיעה", add:"הוסף תביעה", claimDate:"תאריך", amount:"סכום (₪)", reason:"סיבה", status:"סטטוס", statuses:["הוגש","בטיפול","אושר","שולם"], refundDue:"ממתין להחזר" },
    food: { title:"מעקב אוכל", brand:"מותג", type:"סוג", dailyAmount:"כמות יומית (גרם)", bagWeight:"משקל שקית (ק"ג)", openDate:"תאריך פתיחה", daysLeft:"ימים נותרים", running:"נגמר בקרוב!" },
    register: { title:"פרטי רישום", chip:"מספר מיקרוצ'יפ", license:"רישיון עירייה", licenseExp:"תוקף רישיון", breed:"גזע", birthDate:"תאריך לידה", color:"צבע", vet:"וטרינר קבוע", vetPhone:"טלפון וטרינר" },
    days: ["א","ב","ג","ד","ה","ו","ש"],
    daysFull: ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"],
  },
  en: {
    title: "Kelly 🐕",
    nav: { weight:"Weight", tasks:"Care Tasks", vet:"Vet Instructions", vaccines:"Vaccines", medical:"Medical File", insurance:"Insurance", food:"Food", register:"Registration" },
    weight: { title:"Weight Tracker", add:"Add Weighing", date:"Date", kg:"Weight (kg)", note:"Note", save:"Save", history:"History", trend:"Trend", noData:"No data yet" },
    tasks: { title:"Recurring Care Tasks", addVet:"Add Vet Instruction", instruction:"Instruction", freq:"Frequency", days:"Days per week", duration:"Duration (weeks)", selectDays:"Select days", active:"Active", done:"Done today", upcoming:"Upcoming", daysLeft:"days left" },
    vet: { title:"Vet Instructions", add:"Add Instruction", instruction:"Instruction", startDate:"Start Date", endDate:"End Date", freq:"Times per week", days:"Bath days" },
    vaccines: { title:"Vaccines", add:"Add Vaccine", name:"Vaccine Name", lastDate:"Last Date", nextDate:"Next Date", notes:"Notes", overdue:"Overdue!", soon:"Soon", ok:"OK" },
    medical: { title:"Medical File", add:"Add Record", date:"Date", type:"Type", description:"Description", vet:"Vet", types:["Checkup","Surgery","Treatment","Medication","Other"] },
    insurance: { title:"Insurance", provider:"Provider", policyNum:"Policy Number", expiry:"Expiry Date", add:"Add Claim", claimDate:"Date", amount:"Amount (₪)", reason:"Reason", status:"Status", statuses:["Submitted","In Review","Approved","Paid"], refundDue:"Awaiting Refund" },
    food: { title:"Food Tracker", brand:"Brand", type:"Type", dailyAmount:"Daily Amount (g)", bagWeight:"Bag Weight (kg)", openDate:"Open Date", daysLeft:"Days Left", running:"Running low!" },
    register: { title:"Registration Info", chip:"Microchip Number", license:"City License", licenseExp:"License Expiry", breed:"Breed", birthDate:"Birth Date", color:"Color", vet:"Regular Vet", vetPhone:"Vet Phone" },
    days: ["Su","Mo","Tu","We","Th","Fr","Sa"],
    daysFull: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  }
};

const C = {
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 },
  input: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"8px 12px", color:"#e8eaf0", fontSize:14, width:"100%", outline:"none" },
  btn: { background:"linear-gradient(135deg,#6366f1,#06b6d4)", border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" },
  btnSm: { background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, padding:"5px 12px", color:"#a5b4fc", fontSize:12, fontWeight:600, cursor:"pointer" },
  tag: (color) => ({ fontSize:11, padding:"2px 8px", borderRadius:20, background:color+"22", color:color, border:"1px solid "+color+"44", fontWeight:600 }),
};

export default function Kelly({ lang="he" }) {
  const t = LABELS[lang];
  const isRTL = lang === "he";
  const [section, setSection] = useState("weight");

  // Weight state
  const [weights, setWeights] = useState([
    { date:"2024-01-15", kg:28.5, note:"בדיקה שגרתית" },
    { date:"2024-02-20", kg:29.1, note:"" },
    { date:"2024-03-10", kg:28.8, note:"אחרי דיאטה" },
    { date:"2024-04-05", kg:29.3, note:"" },
  ]);
  const [wForm, setWForm] = useState({ date: new Date().toISOString().slice(0,10), kg:"", note:"" });

  // Vet tasks state
  const [vetTasks, setVetTasks] = useState([
    { id:1, instruction:"שמפו מיוחד להגנה על העור", freqPerWeek:2, durationWeeks:2, startDate:"2024-03-18", selectedDays:[0,3], active:true, doneDates:[] },
  ]);
  const [vtForm, setVtForm] = useState({ instruction:"", freqPerWeek:2, durationWeeks:2, startDate:new Date().toISOString().slice(0,10), selectedDays:[] });
  const [showVtForm, setShowVtForm] = useState(false);

  // Vaccines state
  const [vaccines, setVaccines] = useState([
    { id:1, name:"כלבת", lastDate:"2023-06-10", nextDate:"2024-06-10", notes:"" },
    { id:2, name:"פרוו + דיסטמפר", lastDate:"2023-06-10", nextDate:"2024-06-10", notes:"" },
    { id:3, name:"לפטוספירוזיס", lastDate:"2023-09-01", nextDate:"2024-09-01", notes:"" },
  ]);
  const [vacForm, setVacForm] = useState({ name:"", lastDate:"", nextDate:"", notes:"" });
  const [showVacForm, setShowVacForm] = useState(false);

  // Medical state
  const [medRecords, setMedRecords] = useState([
    { id:1, date:"2024-01-15", type:"בדיקה", description:"בדיקה שנתית - הכל תקין", vet:"ד"ר כהן" },
    { id:2, date:"2023-11-20", type:"ניתוח", description:"עיקור", vet:"ד"ר לוי" },
  ]);
  const [medForm, setMedForm] = useState({ date:"", type:"בדיקה", description:"", vet:"" });
  const [showMedForm, setShowMedForm] = useState(false);

  // Insurance state
  const [insurance, setInsurance] = useState({ provider:"כלל ביטוח", policyNum:"123456789", expiry:"2025-01-01" });
  const [claims, setClaims] = useState([
    { id:1, date:"2023-11-25", amount:2800, reason:"ניתוח עיקור", status:"אושר" },
    { id:2, date:"2024-01-20", amount:450, reason:"בדיקה שנתית", status:"הוגש" },
  ]);
  const [claimForm, setClaimForm] = useState({ date:"", amount:"", reason:"", status:"הוגש" });
  const [showClaimForm, setShowClaimForm] = useState(false);

  // Food state
  const [food, setFood] = useState({ brand:"Royal Canin", type:"Medium Adult", dailyAmount:280, bagWeight:15, openDate:"2024-03-01" });

  // Register state
  const [reg, setReg] = useState({ chip:"972000012345678", license:"TLV-2024-8821", licenseExp:"2025-01-01", breed:"לברדור", birthDate:"2019-05-12", color:"שמנת/זהב", vet:"ד"ר כהן", vetPhone:"03-1234567" });

  // Helper: days left for food
  const foodDaysLeft = () => {
    if (!food.openDate) return null;
    const grams = food.bagWeight * 1000;
    const total = Math.floor(grams / food.dailyAmount);
    const used = Math.floor((Date.now() - new Date(food.openDate)) / 86400000);
    return Math.max(0, total - used);
  };

  // Helper: vaccine status
  const vacStatus = (nextDate) => {
    const diff = (new Date(nextDate) - Date.now()) / 86400000;
    if (diff < 0) return "overdue";
    if (diff < 30) return "soon";
    return "ok";
  };

  // Helper: task end date & days left
  const taskEndDate = (t) => {
    const d = new Date(t.startDate);
    d.setDate(d.getDate() + t.durationWeeks * 7);
    return d;
  };
  const taskDaysLeft = (t) => Math.max(0, Math.ceil((taskEndDate(t) - Date.now()) / 86400000));

  // Add weight
  const addWeight = () => {
    if (!wForm.kg) return;
    setWeights(prev => [...prev, { ...wForm, kg: parseFloat(wForm.kg) }].sort((a,b) => a.date > b.date ? 1 : -1));
    setWForm({ date: new Date().toISOString().slice(0,10), kg:"", note:"" });
  };

  // Add vet task
  const addVetTask = () => {
    if (!vtForm.instruction) return;
    setVetTasks(prev => [...prev, { ...vtForm, id: Date.now(), active:true, doneDates:[] }]);
    setVtForm({ instruction:"", freqPerWeek:2, durationWeeks:2, startDate:new Date().toISOString().slice(0,10), selectedDays:[] });
    setShowVtForm(false);
  };

  // Toggle day selection
  const toggleDay = (d) => {
    setVtForm(prev => ({ ...prev, selectedDays: prev.selectedDays.includes(d) ? prev.selectedDays.filter(x=>x!==d) : [...prev.selectedDays, d] }));
  };

  // Weight trend
  const weightTrend = () => {
    if (weights.length < 2) return null;
    const diff = weights[weights.length-1].kg - weights[0].kg;
    return diff > 0 ? "↑ +" + diff.toFixed(1) + " ק"ג" : "↓ " + diff.toFixed(1) + " ק"ג";
  };

  const s = { fontFamily:"'Outfit',sans-serif", background:"#0f1117", minHeight:"100vh", color:"#e8eaf0", direction: isRTL ? "rtl":"ltr" };

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ background:"rgba(17,19,30,0.95)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"20px 28px", display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#10b981,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>🐕</div>
        <div>
          <div style={{ fontSize:22, fontWeight:800 }}>{t.title}</div>
          <div style={{ fontSize:12, color:"#6b7280" }}>לברדור • נולדה מאי 2019</div>
        </div>
      </div>

      {/* Sub-nav */}
      <div style={{ background:"rgba(17,19,30,0.6)", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"0 20px", display:"flex", gap:4, overflowX:"auto" }}>
        {SECTIONS.map(sec => (
          <button key={sec} onClick={() => setSection(sec)} style={{ background:"none", border:"none", borderBottom: section===sec ? "2px solid #6366f1":"2px solid transparent", padding:"12px 14px", color: section===sec ? "#a5b4fc":"#6b7280", fontSize:13, fontWeight: section===sec ? 700:400, cursor:"pointer", whiteSpace:"nowrap", transition:"all .15s" }}>
            {t.nav[sec]}
          </button>
        ))}
      </div>

      <div style={{ padding:"24px 28px", maxWidth:900, margin:"0 auto" }}>

        {/* WEIGHT */}
        {section === "weight" && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>{t.weight.title}</h2>
            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
              <div style={{ ...C.card, textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#6b7280", textTransform:"uppercase", letterSpacing:1 }}>משקל נוכחי</div>
                <div style={{ fontSize:32, fontWeight:800, color:"#10b981", margin:"6px 0" }}>{weights.length ? weights[weights.length-1].kg : "--"}</div>
                <div style={{ fontSize:12, color:"#6b7280" }}>ק"ג</div>
              </div>
              <div style={{ ...C.card, textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#6b7280", textTransform:"uppercase", letterSpacing:1 }}>מגמה</div>
                <div style={{ fontSize:22, fontWeight:700, color:"#a5b4fc", margin:"6px 0" }}>{weightTrend() || "--"}</div>
                <div style={{ fontSize:12, color:"#6b7280" }}>מאז ינואר</div>
              </div>
              <div style={{ ...C.card, textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#6b7280", textTransform:"uppercase", letterSpacing:1 }}>שקילות</div>
                <div style={{ fontSize:32, fontWeight:800, color:"#06b6d4", margin:"6px 0" }}>{weights.length}</div>
                <div style={{ fontSize:12, color:"#6b7280" }}>סה"כ</div>
              </div>
            </div>
            {/* Weight graph */}
            <div style={{ ...C.card, marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:16, color:"#a5b4fc" }}>גרף משקל</div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:100 }}>
                {weights.map((w,i) => {
                  const min = Math.min(...weights.map(x=>x.kg));
                  const max = Math.max(...weights.map(x=>x.kg));
                  const h = max===min ? 60 : 20 + ((w.kg-min)/(max-min))*80;
                  return (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                      <div style={{ fontSize:10, color:"#6b7280" }}>{w.kg}</div>
                      <div style={{ width:"100%", height:h, background:"linear-gradient(to top,#6366f1,#06b6d4)", borderRadius:"6px 6px 0 0", transition:"height .3s" }} title={w.note}/>
                      <div style={{ fontSize:9, color:"#4b5563" }}>{w.date.slice(5)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Add weight form */}
            <div style={{ ...C.card }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:14, color:"#a5b4fc" }}>+ {t.weight.add}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr auto", gap:10, alignItems:"end" }}>
                <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.weight.date}</div><input type="date" value={wForm.date} onChange={e=>setWForm({...wForm,date:e.target.value})} style={C.input}/></div>
                <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.weight.kg}</div><input type="number" step="0.1" placeholder="28.5" value={wForm.kg} onChange={e=>setWForm({...wForm,kg:e.target.value})} style={C.input}/></div>
                <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.weight.note}</div><input placeholder="הערה..." value={wForm.note} onChange={e=>setWForm({...wForm,note:e.target.value})} style={C.input}/></div>
                <button onClick={addWeight} style={C.btn}>{t.weight.save}</button>
              </div>
            </div>
            {/* History */}
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:"#6b7280" }}>{t.weight.history}</div>
              {[...weights].reverse().map((w,i) => (
                <div key={i} style={{ ...C.card, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:13, color:"#9ca3af" }}>{w.date}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#10b981" }}>{w.kg} ק"ג</div>
                  {w.note && <div style={{ fontSize:12, color:"#6b7280" }}>{w.note}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VET TASKS */}
        {section === "tasks" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>{t.tasks.title}</h2>
              <button onClick={()=>setShowVtForm(!showVtForm)} style={C.btn}>+ {t.tasks.addVet}</button>
            </div>
            {showVtForm && (
              <div style={{ ...C.card, marginBottom:20, borderColor:"rgba(99,102,241,0.3)" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.tasks.instruction}</div><input placeholder="לדוגמה: שמפו מיוחד..." value={vtForm.instruction} onChange={e=>setVtForm({...vtForm,instruction:e.target.value})} style={C.input}/></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                    <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.tasks.freq} / שבוע</div><input type="number" min="1" max="7" value={vtForm.freqPerWeek} onChange={e=>setVtForm({...vtForm,freqPerWeek:parseInt(e.target.value)})} style={C.input}/></div>
                    <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.tasks.duration}</div><input type="number" min="1" value={vtForm.durationWeeks} onChange={e=>setVtForm({...vtForm,durationWeeks:parseInt(e.target.value)})} style={C.input}/></div>
                    <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>תאריך התחלה</div><input type="date" value={vtForm.startDate} onChange={e=>setVtForm({...vtForm,startDate:e.target.value})} style={C.input}/></div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:"#6b7280", marginBottom:8 }}>{t.tasks.selectDays}</div>
                    <div style={{ display:"flex", gap:8 }}>
                      {t.days.map((d,i) => (
                        <button key={i} onClick={()=>toggleDay(i)} style={{ width:36, height:36, borderRadius:"50%", border:"none", background: vtForm.selectedDays.includes(i) ? "#6366f1":"rgba(255,255,255,0.06)", color: vtForm.selectedDays.includes(i) ? "#fff":"#6b7280", fontWeight:700, fontSize:12, cursor:"pointer" }}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={addVetTask} style={{ ...C.btn, alignSelf:"flex-start" }}>שמור משימה</button>
                </div>
              </div>
            )}
            {vetTasks.map(task => {
              const dl = taskDaysLeft(task);
              const end = taskEndDate(task).toISOString().slice(0,10);
              const isActive = dl > 0;
              return (
                <div key={task.id} style={{ ...C.card, marginBottom:14, borderColor: isActive ? "rgba(99,102,241,0.3)":"rgba(255,255,255,0.05)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{task.instruction}</div>
                      <div style={{ fontSize:12, color:"#6b7280" }}>{task.startDate} → {end}</div>
                    </div>
                    <div style={C.tag(isActive ? "#6366f1":"#4b5563")}>{isActive ? `${dl} ימים נותרו`:"הסתיים"}</div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={C.tag("#10b981")}>{task.freqPerWeek}x שבוע</span>
                    <span style={C.tag("#06b6d4")}>{task.durationWeeks} שבועות</span>
                    <div style={{ display:"flex", gap:6, marginRight:"auto" }}>
                      {t.days.map((d,i) => (
                        <div key={i} style={{ width:28, height:28, borderRadius:"50%", background: task.selectedDays.includes(i) ? "#6366f1":"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color: task.selectedDays.includes(i) ? "#fff":"#4b5563" }}>{d}</div>
                      ))}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                        <div style={{ height:"100%", background:"linear-gradient(to right,#6366f1,#06b6d4)", borderRadius:2, width:`${100 - (dl / (task.durationWeeks*7))*100}%` }}/>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* VACCINES */}
        {section === "vaccines" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>{t.vaccines.title}</h2>
              <button onClick={()=>setShowVacForm(!showVacForm)} style={C.btn}>+ {t.vaccines.add}</button>
            </div>
            {showVacForm && (
              <div style={{ ...C.card, marginBottom:20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.vaccines.name}</div><input value={vacForm.name} onChange={e=>setVacForm({...vacForm,name:e.target.value})} style={C.input}/></div>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.vaccines.lastDate}</div><input type="date" value={vacForm.lastDate} onChange={e=>setVacForm({...vacForm,lastDate:e.target.value})} style={C.input}/></div>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.vaccines.nextDate}</div><input type="date" value={vacForm.nextDate} onChange={e=>setVacForm({...vacForm,nextDate:e.target.value})} style={C.input}/></div>
                </div>
                <input placeholder={t.vaccines.notes} value={vacForm.notes} onChange={e=>setVacForm({...vacForm,notes:e.target.value})} style={{ ...C.input, marginBottom:10 }}/>
                <button onClick={()=>{ if(!vacForm.name) return; setVaccines(p=>[...p,{...vacForm,id:Date.now()}]); setVacForm({name:"",lastDate:"",nextDate:"",notes:""}); setShowVacForm(false); }} style={C.btn}>שמור</button>
              </div>
            )}
            {vaccines.map(v => {
              const st = vacStatus(v.nextDate);
              const colors = { overdue:"#ef4444", soon:"#f59e0b", ok:"#10b981" };
              const labels = { overdue:t.vaccines.overdue, soon:t.vaccines.soon, ok:t.vaccines.ok };
              const daysTo = Math.ceil((new Date(v.nextDate) - Date.now()) / 86400000);
              return (
                <div key={v.id} style={{ ...C.card, marginBottom:12, borderColor: st==="overdue" ? "rgba(239,68,68,0.3)":st==="soon"?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.07)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>💉 {v.name}</div>
                      <div style={{ fontSize:12, color:"#6b7280" }}>אחרון: {v.lastDate} | הבא: {v.nextDate}</div>
                      {v.notes && <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>{v.notes}</div>}
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={C.tag(colors[st])}>{labels[st]}</div>
                      <div style={{ fontSize:12, color:colors[st], marginTop:6, fontWeight:700 }}>{st==="overdue" ? `${Math.abs(daysTo)} ימי איחור` : `עוד ${daysTo} ימים`}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MEDICAL */}
        {section === "medical" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>{t.medical.title}</h2>
              <button onClick={()=>setShowMedForm(!showMedForm)} style={C.btn}>+ {t.medical.add}</button>
            </div>
            {showMedForm && (
              <div style={{ ...C.card, marginBottom:20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.medical.date}</div><input type="date" value={medForm.date} onChange={e=>setMedForm({...medForm,date:e.target.value})} style={C.input}/></div>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.medical.type}</div>
                    <select value={medForm.type} onChange={e=>setMedForm({...medForm,type:e.target.value})} style={{ ...C.input, appearance:"none" }}>
                      {t.medical.types.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                    </select>
                  </div>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.medical.vet}</div><input value={medForm.vet} onChange={e=>setMedForm({...medForm,vet:e.target.value})} style={C.input}/></div>
                </div>
                <input placeholder={t.medical.description} value={medForm.description} onChange={e=>setMedForm({...medForm,description:e.target.value})} style={{ ...C.input, marginBottom:10 }}/>
                <button onClick={()=>{ if(!medForm.description) return; setMedRecords(p=>[{...medForm,id:Date.now()},...p]); setMedForm({date:"",type:"בדיקה",description:"",vet:""}); setShowMedForm(false); }} style={C.btn}>שמור</button>
              </div>
            )}
            {medRecords.map(r => {
              const typeColors = { "בדיקה":"#6366f1","ניתוח":"#ef4444","טיפול":"#10b981","תרופה":"#f59e0b","אחר":"#6b7280","Checkup":"#6366f1","Surgery":"#ef4444","Treatment":"#10b981","Medication":"#f59e0b","Other":"#6b7280" };
              return (
                <div key={r.id} style={{ ...C.card, marginBottom:10, display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ fontSize:24 }}>{ r.type==="ניתוח"||r.type==="Surgery"?"🔪":r.type==="תרופה"||r.type==="Medication"?"💊":r.type==="טיפול"||r.type==="Treatment"?"💉":"🩺" }</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                      <div style={C.tag(typeColors[r.type]||"#6b7280")}>{r.type}</div>
                      <div style={{ fontSize:12, color:"#6b7280" }}>{r.date}</div>
                      {r.vet && <div style={{ fontSize:12, color:"#9ca3af" }}>| {r.vet}</div>}
                    </div>
                    <div style={{ fontSize:14, color:"#e8eaf0" }}>{r.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INSURANCE */}
        {section === "insurance" && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>{t.insurance.title}</h2>
            <div style={{ ...C.card, marginBottom:20, borderColor:"rgba(99,102,241,0.2)" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                {[["🏢",t.insurance.provider,insurance.provider],["📋",t.insurance.policyNum,insurance.policyNum],["📅",t.insurance.expiry,insurance.expiry]].map(([icon,label,val])=>(
                  <div key={label} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:24, marginBottom:4 }}>{icon}</div>
                    <div style={{ fontSize:11, color:"#6b7280", marginBottom:2 }}>{label}</div>
                    <div style={{ fontSize:14, fontWeight:600 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:15, fontWeight:700 }}>תביעות</div>
              <button onClick={()=>setShowClaimForm(!showClaimForm)} style={C.btn}>+ {t.insurance.add}</button>
            </div>
            {showClaimForm && (
              <div style={{ ...C.card, marginBottom:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.insurance.claimDate}</div><input type="date" value={claimForm.date} onChange={e=>setClaimForm({...claimForm,date:e.target.value})} style={C.input}/></div>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.insurance.amount}</div><input type="number" value={claimForm.amount} onChange={e=>setClaimForm({...claimForm,amount:e.target.value})} style={C.input}/></div>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.insurance.reason}</div><input value={claimForm.reason} onChange={e=>setClaimForm({...claimForm,reason:e.target.value})} style={C.input}/></div>
                  <div><div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{t.insurance.status}</div>
                    <select value={claimForm.status} onChange={e=>setClaimForm({...claimForm,status:e.target.value})} style={{ ...C.input, appearance:"none" }}>
                      {t.insurance.statuses.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={()=>{ if(!claimForm.reason) return; setClaims(p=>[{...claimForm,id:Date.now(),amount:parseFloat(claimForm.amount)},...p]); setClaimForm({date:"",amount:"",reason:"",status:"הוגש"}); setShowClaimForm(false); }} style={C.btn}>שמור</button>
              </div>
            )}
            {claims.map(c => {
              const stColors = { "הוגש":"#6b7280","בטיפול":"#f59e0b","אושר":"#06b6d4","שולם":"#10b981","Submitted":"#6b7280","In Review":"#f59e0b","Approved":"#06b6d4","Paid":"#10b981" };
              const pending = c.status==="הוגש"||c.status==="בטיפול"||c.status==="אושר"||c.status==="Submitted"||c.status==="In Review"||c.status==="Approved";
              return (
                <div key={c.id} style={{ ...C.card, marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center", borderColor: pending?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.07)" }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{c.reason}</div>
                    <div style={{ fontSize:12, color:"#6b7280" }}>{c.date}</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:800, color:"#10b981", marginBottom:4 }}>₪{c.amount?.toLocaleString()}</div>
                    <div style={C.tag(stColors[c.status]||"#6b7280")}>{c.status}</div>
                    {pending && <div style={{ fontSize:10, color:"#f59e0b", marginTop:4 }}>⏳ {t.insurance.refundDue}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOD */}
        {section === "food" && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>{t.food.title}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              {[["🥣",t.food.brand,food.brand,"brand"],["🏷️",t.food.type,food.type,"type"],["⚖️",t.food.dailyAmount,food.dailyAmount+" גרם","dailyAmount"],["🛍️",t.food.bagWeight,food.bagWeight+" ק"ג","bagWeight"],["📅",t.food.openDate,food.openDate,"openDate"]].map(([icon,label,val,key])=>(
                <div key={key} style={C.card}>
                  <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>{icon} {label}</div>
                  <input value={val} onChange={e=>setFood({...food,[key]:e.target.value})} style={{ ...C.input, fontWeight:600 }}/>
                </div>
              ))}
              <div style={{ ...C.card, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderColor: foodDaysLeft() < 7 ? "rgba(239,68,68,0.4)":"rgba(16,185,129,0.2)" }}>
                <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>⏳ {t.food.daysLeft}</div>
                <div style={{ fontSize:36, fontWeight:800, color: foodDaysLeft() < 7 ? "#ef4444":"#10b981" }}>{foodDaysLeft()}</div>
                {foodDaysLeft() < 7 && <div style={{ fontSize:11, color:"#ef4444", marginTop:4 }}>🚨 {t.food.running}</div>}
              </div>
            </div>
          </div>
        )}

        {/* REGISTER */}
        {section === "register" && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>{t.register.title}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[["🔬",t.register.chip,"chip"],["🪪",t.register.license,"license"],["📅",t.register.licenseExp,"licenseExp"],["🐕",t.register.breed,"breed"],["🎂",t.register.birthDate,"birthDate"],["🎨",t.register.color,"color"],["👨‍⚕️",t.register.vet,"vet"],["📞",t.register.vetPhone,"vetPhone"]].map(([icon,label,key])=>(
                <div key={key} style={C.card}>
                  <div style={{ fontSize:11, color:"#6b7280", marginBottom:6 }}>{icon} {label}</div>
                  <input value={reg[key]} onChange={e=>setReg({...reg,[key]:e.target.value})} style={{ ...C.input, fontWeight:600 }}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VET INSTRUCTIONS */}
        {section === "vet" && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>{t.vet.title}</h2>
            <div style={{ ...C.card, borderColor:"rgba(16,185,129,0.2)", padding:24, textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>🩺</div>
              <div style={{ color:"#6b7280" }}>הנחיות וטרינר נוספות ייווספו כאן</div>
              <button onClick={()=>setSection("tasks")} style={{ ...C.btn, marginTop:14 }}>עבור למשימות טיפול ←</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
     }
