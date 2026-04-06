import { useState, useEffect, useMemo } from "react";
import { listenCol, saveDoc, deleteDocById } from "./firebase.js";

// ── קטגוריות כמו בחברות אשראי ──────────────────────────────
const CATS = [
  {id:"food_rest",  he:"מסעדות ואוכל",       icon:"🍽️", color:"#f59e0b"},
  {id:"grocery",   he:"סופרמרקט",            icon:"🛒", color:"#10b981"},
  {id:"fuel",      he:"דלק ורכב",            icon:"⛽", color:"#6366f1"},
  {id:"health",    he:"בריאות ורפואה",        icon:"🏥", color:"#ef4444"},
  {id:"fashion",   he:"ביגוד והנעלה",         icon:"👗", color:"#a855f7"},
  {id:"home",      he:"בית וריהוט",           icon:"🏠", color:"#06b6d4"},
  {id:"entertain", he:"בידור ופנאי",          icon:"🎬", color:"#f59e0b"},
  {id:"travel",    he:"תיירות ונסיעות",       icon:"✈️", color:"#10b981"},
  {id:"education", he:"חינוך",               icon:"📚", color:"#6366f1"},
  {id:"insurance", he:"ביטוח",               icon:"🛡️", color:"#6b7280"},
  {id:"utilities", he:"חשבונות ושירותים",    icon:"💡", color:"#f59e0b"},
  {id:"online",    he:"קניות אונליין",        icon:"🛍️", color:"#a855f7"},
  {id:"finance",   he:"בנק ופיננסים",         icon:"🏦", color:"#06b6d4"},
  {id:"pets",      he:"חיות מחמד",           icon:"🐕", color:"#10b981"},
  {id:"other",     he:"אחר",                 icon:"📦", color:"#6b7280"},
];

const PAY_METHODS = [
  {id:"credit",   he:"אשראי",            icon:"💳"},
  {id:"cash",     he:"מזומן",             icon:"💵"},
  {id:"check",    he:"שיק",              icon:"📄"},
  {id:"transfer", he:"העברה בנקאית",     icon:"🏦"},
  {id:"bit",      he:"ביט / פייבוקס",   icon:"📱"},
];

const S = {
  card:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20},
  inp:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"9px 12px",color:"#e8eaf0",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"},
  btn:{background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"},
  pill:(a,c="#6366f1")=>({background:a?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)",border:a?"1px solid rgba(99,102,241,0.4)":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 14px",color:a?"#a5b4fc":"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}),
};

let UID=600; const nid=()=>"exp"+String(++UID)+Date.now();
const monthKey=(y,m)=>y+"-"+String(m+1).padStart(2,"0");
const monthLabel=(k)=>{const[y,m]=k.split("-");const months=["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];return months[parseInt(m)-1]+" "+y;};

export default function Expenses(){
  const [expenses,  setExpenses]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selMonth,  setSelMonth]  = useState(monthKey(new Date().getFullYear(),new Date().getMonth()));
  const [filterCat, setFilterCat] = useState("all");
  const [filterPay, setFilterPay] = useState("all");
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [budget,    setBudget]    = useState({});
  const [showBudget,setShowBudget]= useState(false);

  const f0={desc:"",amount:"",cat:"food_rest",payMethod:"credit",date:new Date().toISOString().slice(0,10),note:"",person:"Both"};
  const [form,setForm]=useState(f0);

  useEffect(()=>{
    const u=listenCol("expenses",(d)=>{setExpenses(d);setLoading(false);});
    const u2=listenCol("expense_budget",(d)=>{const b={};d.forEach(x=>{b[x.id]=x;});setBudget(b);});
    return()=>{u();u2();};
  },[]);

  // ── חודשים זמינים ────────────────────────────────────────
  const months=useMemo(()=>{
    const s=new Set(expenses.map(e=>e.month).filter(Boolean));
    if(!s.has(selMonth)) s.add(selMonth);
    return [...s].sort().reverse();
  },[expenses,selMonth]);

  // ── הוצאות לחודש הנוכחי ──────────────────────────────────
  const monthExp=useMemo(()=>expenses.filter(e=>{
    if(e.month!==selMonth) return false;
    if(filterCat!=="all"&&e.cat!==filterCat) return false;
    if(filterPay!=="all"&&e.payMethod!==filterPay) return false;
    return true;
  }),[expenses,selMonth,filterCat,filterPay]);

  const totalMonth=useMemo(()=>expenses.filter(e=>e.month===selMonth).reduce((s,e)=>s+(parseFloat(e.amount)||0),0),[expenses,selMonth]);

  // ── התפלגות לפי קטגוריה ──────────────────────────────────
  const byCat=useMemo(()=>{
    const m={};
    expenses.filter(e=>e.month===selMonth).forEach(e=>{
      if(!m[e.cat]) m[e.cat]=0;
      m[e.cat]+=parseFloat(e.amount)||0;
    });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  },[expenses,selMonth]);

  // ── השוואה חודשית ────────────────────────────────────────
  const monthlyTotals=useMemo(()=>{
    const m={};
    expenses.forEach(e=>{if(!m[e.month])m[e.month]=0;m[e.month]+=parseFloat(e.amount)||0;});
    return m;
  },[expenses]);

  // ── פעולות ───────────────────────────────────────────────
  const saveExp=async()=>{
    if(!form.desc||!form.amount) return;
    const id=editId||nid();
    const month=form.date.slice(0,7);
    await saveDoc("expenses",id,{...form,id,amount:parseFloat(form.amount),month});
    setEditId(null);setShowForm(false);setForm(f0);
  };

  const startEdit=(exp)=>{setEditId(exp.id);setForm({...exp,amount:String(exp.amount)});setShowForm(true);};
  const delExp=async(id)=>deleteDocById("expenses",id);

  const saveBudget=async(catId,val)=>{
    await saveDoc("expense_budget",catId,{id:catId,amount:parseFloat(val)||0});
    setBudget(p=>({...p,[catId]:{id:catId,amount:parseFloat(val)||0}}));
  };

  // ── ייבוא קובץ אשראי (CSV) ───────────────────────────────
  const importCSV=async(file)=>{
    setImporting(true);setImportMsg("");
    try{
      const text=await file.text();
      const lines=text.split("\n").filter(l=>l.trim());
      // תמיכה בפורמטים של ישראכרט, כאל, מקס, ויזה כ.א.ל
      let added=0;
      const headers=lines[0].split(",").map(h=>h.trim().replace(/"/g,""));
      for(let i=1;i<lines.length;i++){
        const cols=lines[i].split(",").map(c=>c.trim().replace(/"/g,""));
        if(cols.length<3) continue;
        // זיהוי עמודות אוטומטי
        const dateIdx=headers.findIndex(h=>/תאריך|date/i.test(h));
        const descIdx=headers.findIndex(h=>/עסקה|תיאור|שם|desc|name|merchant/i.test(h));
        const amountIdx=headers.findIndex(h=>/סכום|חיוב|amount|charge/i.test(h));
        const catIdx=headers.findIndex(h=>/קטגוריה|ענף|category/i.test(h));
        if(dateIdx<0||descIdx<0||amountIdx<0) continue;
        const rawDate=cols[dateIdx]||"";
        const desc=cols[descIdx]||"";
        const rawAmount=cols[amountIdx]||"0";
        const amount=parseFloat(rawAmount.replace(/[^0-9.]/g,""))||0;
        if(!desc||!amount) continue;
        // המרת תאריך לפורמט ISO
        let date=new Date().toISOString().slice(0,10);
        const dm=rawDate.match(/(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})/);
        if(dm) date=`${dm[3].length===2?"20"+dm[3]:dm[3]}-${dm[2].padStart(2,"0")}-${dm[1].padStart(2,"0")}`;
        const month=date.slice(0,7);
        // ניחוש קטגוריה אוטומטי
        const rawCat=catIdx>=0?cols[catIdx]:"";
        let cat="other";
        if(/מסעדה|אוכל|קפה|pizza|resto|cafe|שוק/i.test(desc+rawCat)) cat="food_rest";
        else if(/סופר|שופרסל|רמי לוי|מגה|victory|קרפור|grocery/i.test(desc+rawCat)) cat="grocery";
        else if(/דלק|סונול|פז|דור|oil|fuel|אבנר/i.test(desc+rawCat)) cat="fuel";
        else if(/רופא|רפואה|קופת חולים|בית חולים|תרופה|health|pharmacy/i.test(desc+rawCat)) cat="health";
        else if(/בגד|נעל|זארה|H&M|fashion|castro|renaissance/i.test(desc+rawCat)) cat="fashion";
        else if(/ביטוח|insurance|הראל|מגדל|כלל/i.test(desc+rawCat)) cat="insurance";
        else if(/חשמל|מים|ארנונה|בזק|HOT|YES|utilities/i.test(desc+rawCat)) cat="utilities";
        else if(/אמזון|aliex|online|ebay|paypal/i.test(desc+rawCat)) cat="online";
        else if(/בנק|bank|atm|משיכה|finance/i.test(desc+rawCat)) cat="finance";
        else if(/חיות|vet|קלי|pet/i.test(desc+rawCat)) cat="pets";
        else if(/מלון|טיסה|hotel|flight|travel|booking/i.test(desc+rawCat)) cat="travel";
        const id=nid();
        await saveDoc("expenses",id,{id,desc,amount,cat,payMethod:"credit",date,month,note:"ייבוא CSV",person:"Both"});
        added++;
      }
      setImportMsg("✅ יובאו "+added+" הוצאות בהצלחה!");
    }catch(err){setImportMsg("❌ שגיאה: "+err.message);}
    setImporting(false);
  };

  const catInfo=(id)=>CATS.find(c=>c.id===id)||CATS[CATS.length-1];
  const payInfo=(id)=>PAY_METHODS.find(p=>p.id===id)||PAY_METHODS[0];

  if(loading) return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",background:"#0f1117",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:14,fontSize:16}}>
      <div style={{width:32,height:32,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      טוען הוצאות...<style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  const monthBudgetTotal=Object.values(budget).reduce((s,b)=>s+(b.amount||0),0);
  const budgetLeft=monthBudgetTotal-totalMonth;

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",direction:"rtl",minHeight:"100vh",background:"#0f1117"}}>
      {/* Header */}
      <div style={{background:"rgba(17,19,30,0.95)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>₪</div>
          <div>
            <div style={{fontSize:19,fontWeight:800}}>הוצאות</div>
            <div style={{fontSize:11,color:"#6b7280"}}>{monthLabel(selMonth)} · <span style={{color:"#10b981"}}>🔥 מסונכרן</span></div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>{setShowBudget(!showBudget);}} style={{...S.btn,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",color:"#a5b4fc",fontSize:12}}>🎯 תקציב</button>
          <button onClick={()=>{setShowForm(!showForm);setEditId(null);setForm(f0);}} style={S.btn}>+ הוסף הוצאה</button>
        </div>
      </div>

      <div style={{padding:"18px 22px",maxWidth:1000,margin:"0 auto"}}>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}} className="exp-stats">
          {[
            {l:"סה"+"כ החודש",v:"₪"+totalMonth.toLocaleString(),c:"#ef4444",icon:"💸"},
            {l:"מספר עסקאות",v:expenses.filter(e=>e.month===selMonth).length,c:"#6366f1",icon:"🧾"},
            {l:"תקציב שנקבע",v:monthBudgetTotal>0?"₪"+monthBudgetTotal.toLocaleString():"לא נקבע",c:"#10b981",icon:"🎯"},
            {l:budgetLeft>=0?"נותר בתקציב":"חריגה מתקציב",v:monthBudgetTotal>0?"₪"+Math.abs(budgetLeft).toLocaleString():"—",c:budgetLeft>=0?"#10b981":"#ef4444",icon:budgetLeft>=0?"✅":"⚠️"},
          ].map(s=>(
            <div key={s.l} style={{...S.card,textAlign:"center",borderTop:"2px solid "+s.c+"44"}}>
              <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{s.l}</div>
              <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Budget progress bar */}
        {monthBudgetTotal>0&&(
          <div style={{...S.card,marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8}}>
              <span style={{color:"#6b7280"}}>ניצול תקציב</span>
              <span style={{color:budgetLeft>=0?"#10b981":"#ef4444",fontWeight:700}}>{Math.round((totalMonth/monthBudgetTotal)*100)}%</span>
            </div>
            <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4}}>
              <div style={{height:"100%",background:budgetLeft>=0?"linear-gradient(to right,#10b981,#06b6d4)":"linear-gradient(to right,#f59e0b,#ef4444)",borderRadius:4,width:Math.min(100,Math.round((totalMonth/monthBudgetTotal)*100))+"%",transition:"width .4s"}}/>
            </div>
          </div>
        )}

        {/* Budget settings */}
        {showBudget&&(
          <div style={{...S.card,marginBottom:18,borderColor:"rgba(99,102,241,0.3)"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#a5b4fc",marginBottom:14}}>🎯 הגדרת תקציב חודשי לפי קטגוריה</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {CATS.map(c=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18,flexShrink:0}}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:"#6b7280",marginBottom:2}}>{c.he}</div>
                    <input type="number" placeholder="₪ תקציב" defaultValue={budget[c.id]?.amount||""} onBlur={e=>saveBudget(c.id,e.target.value)} style={{...S.inp,padding:"5px 8px",fontSize:12}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import CSV */}
        <div style={{...S.card,marginBottom:18,borderColor:"rgba(6,182,212,0.2)"}}>
          <div style={{fontSize:13,fontWeight:600,color:"#06b6d4",marginBottom:10}}>📥 ייבוא פירוט אשראי (CSV)</div>
          <div style={{fontSize:12,color:"#6b7280",marginBottom:10}}>תמיכה בפורמטים של ישראכרט, כאל, מקס, ויזה כ.א.ל — הורד פירוט מאתר חברת האשראי ועלה כאן</div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <label style={{...S.btn,display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer",background:"rgba(6,182,212,0.15)",border:"1px solid rgba(6,182,212,0.3)",color:"#67e8f9"}}>
              📄 {importing?"מייבא...":"בחר קובץ CSV"}
              <input type="file" accept=".csv,.xls,.xlsx" style={{display:"none"}} disabled={importing} onChange={e=>e.target.files[0]&&importCSV(e.target.files[0])}/>
            </label>
            {importMsg&&<div style={{fontSize:13,color:importMsg.startsWith("✅")?"#10b981":"#ef4444",fontWeight:600}}>{importMsg}</div>}
          </div>
        </div>

        {/* Month selector */}
        <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {months.map(m=>(
            <button key={m} onClick={()=>{setSelMonth(m);setFilterCat("all");setFilterPay("all");}} style={S.pill(m===selMonth)}>
              {monthLabel(m)} {monthlyTotals[m]?<span style={{fontSize:10,color:"#6b7280",marginRight:4}}>₪{Math.round(monthlyTotals[m]).toLocaleString()}</span>:null}
            </button>
          ))}
        </div>

        {/* Add/Edit form */}
        {showForm&&(
          <div style={{...S.card,marginBottom:18,borderColor:"rgba(99,102,241,0.3)"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#a5b4fc",marginBottom:14}}>{editId?"✏️ עריכת הוצאה":"+ הוצאה חדשה"}</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תיאור</div><input value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="לדוגמה: מסעדה, סופר..." style={S.inp} autoFocus/></div>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>סכום ₪</div><input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0" style={S.inp}/></div>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>תאריך</div><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={S.inp}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>קטגוריה</div><select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={{...S.inp,appearance:"none"}}>{CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.he}</option>)}</select></div>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>אמצעי תשלום</div><select value={form.payMethod} onChange={e=>setForm({...form,payMethod:e.target.value})} style={{...S.inp,appearance:"none"}}>{PAY_METHODS.map(p=><option key={p.id} value={p.id}>{p.icon} {p.he}</option>)}</select></div>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>של מי</div><select value={form.person} onChange={e=>setForm({...form,person:e.target.value})} style={{...S.inp,appearance:"none"}}>{["Raz","Olga","Both"].map(p=><option key={p}>{p}</option>)}</select></div>
              <div><div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>הערה</div><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="אופציונלי" style={S.inp}/></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveExp} style={S.btn}>{editId?"עדכן":"שמור"}</button>
              <button onClick={()=>{setShowForm(false);setEditId(null);}} style={{...S.btn,background:"rgba(255,255,255,0.08)"}}>ביטול</button>
            </div>
          </div>
        )}

        {/* Category filters */}
        <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
          <button onClick={()=>setFilterCat("all")} style={S.pill(filterCat==="all")}>הכל</button>
          {CATS.map(c=><button key={c.id} onClick={()=>setFilterCat(c.id)} style={S.pill(filterCat===c.id)}>{c.icon} {c.he}</button>)}
        </div>

        {/* Payment method filters */}
        <div style={{display:"flex",gap:6,marginBottom:18}}>
          <button onClick={()=>setFilterPay("all")} style={S.pill(filterPay==="all")}>כל שיטות תשלום</button>
          {PAY_METHODS.map(p=><button key={p.id} onClick={()=>setFilterPay(p.id)} style={S.pill(filterPay===p.id)}>{p.icon} {p.he}</button>)}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}} className="exp-grid">

          {/* Expenses list */}
          <div>
            <div style={{fontSize:13,color:"#6b7280",marginBottom:10,display:"flex",justifyContent:"space-between"}}>
              <span>{monthExp.length} הוצאות</span>
              <span style={{fontWeight:700,color:"#e8eaf0"}}>₪{monthExp.reduce((s,e)=>s+(parseFloat(e.amount)||0),0).toLocaleString()}</span>
            </div>
            {monthExp.length===0?(
              <div style={{...S.card,textAlign:"center",padding:40,color:"#6b7280"}}>
                <div style={{fontSize:36,marginBottom:10}}>💸</div>
                <div>אין הוצאות ל{monthLabel(selMonth)}</div>
                <div style={{fontSize:12,marginTop:6}}>הוסף ידנית או ייבא CSV</div>
              </div>
            ):(
              monthExp.sort((a,b)=>b.date>a.date?1:-1).map(exp=>{
                const cat=catInfo(exp.cat), pay=payInfo(exp.payMethod);
                return(
                  <div key={exp.id} style={{...S.card,marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:38,height:38,borderRadius:10,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{cat.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:600,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{exp.desc}</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:"#6b7280"}}>{exp.date}</span>
                        <span style={{fontSize:11,padding:"1px 7px",borderRadius:20,background:cat.color+"22",color:cat.color,border:"1px solid "+cat.color+"44"}}>{cat.he}</span>
                        <span style={{fontSize:11,color:"#6b7280"}}>{pay.icon} {pay.he}</span>
                        {exp.note&&<span style={{fontSize:11,color:"#4b5563"}}>📝 {exp.note}</span>}
                      </div>
                    </div>
                    <div style={{textAlign:"left",flexShrink:0}}>
                      <div style={{fontSize:16,fontWeight:800,color:"#ef4444"}}>₪{parseFloat(exp.amount).toLocaleString()}</div>
                      <div style={{fontSize:10,color:"#6b7280",textAlign:"center"}}>{exp.person}</div>
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>startEdit(exp)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 9px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>✏️</button>
                      <button onClick={()=>delExp(exp.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 9px",color:"#fca5a5",fontSize:11,cursor:"pointer"}}>🗑</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Category breakdown */}
          <div style={{position:"sticky",top:20}}>
            <div style={{...S.card,marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>📊 פילוח לפי קטגוריה</div>
              {byCat.length===0?<div style={{fontSize:13,color:"#6b7280",textAlign:"center",padding:20}}>אין נתונים</div>:
                byCat.map(([catId,total])=>{
                  const cat=catInfo(catId);
                  const pct=Math.round((total/totalMonth)*100);
                  const bud=budget[catId]?.amount||0;
                  const over=bud>0&&total>bud;
                  return(
                    <div key={catId} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:15}}>{cat.icon}</span>
                          <span style={{fontSize:12,fontWeight:600}}>{cat.he}</span>
                          {over&&<span style={{fontSize:10,color:"#ef4444",fontWeight:700}}>⚠ חרגת!</span>}
                        </div>
                        <div style={{textAlign:"left"}}>
                          <span style={{fontSize:13,fontWeight:700,color:over?"#ef4444":"#e8eaf0"}}>₪{Math.round(total).toLocaleString()}</span>
                          {bud>0&&<span style={{fontSize:10,color:"#6b7280",marginRight:4}}>/ ₪{bud.toLocaleString()}</span>}
                          <span style={{fontSize:10,color:"#6b7280",marginRight:4}}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                        <div style={{height:"100%",background:over?"#ef4444":cat.color,borderRadius:2,width:Math.min(100,pct)+"%",opacity:0.8}}/>
                      </div>
                      {bud>0&&<div style={{height:2,background:"rgba(255,255,255,0.03)",borderRadius:1,marginTop:1}}>
                        <div style={{height:"100%",background:"rgba(255,255,255,0.2)",borderRadius:1,width:Math.min(100,Math.round((total/bud)*100))+"%"}}/>
                      </div>}
                    </div>
                  );
                })
              }
              {totalMonth>0&&<div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:10,marginTop:4,display:"flex",justifyContent:"space-between",fontWeight:700}}><span>סה"+"כ</span><span style={{color:"#ef4444"}}>₪{Math.round(totalMonth).toLocaleString()}</span></div>}
            </div>

            {/* Monthly comparison */}
            {Object.keys(monthlyTotals).length>1&&(
              <div style={S.card}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>📈 השוואה חודשית</div>
                {Object.entries(monthlyTotals).sort((a,b)=>b[0]>a[0]?1:-1).slice(0,6).map(([m,t])=>{
                  const maxT=Math.max(...Object.values(monthlyTotals));
                  return(
                    <div key={m} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                        <span style={{color:m===selMonth?"#a5b4fc":"#6b7280",fontWeight:m===selMonth?700:400}}>{monthLabel(m)}</span>
                        <span style={{fontWeight:700}}>₪{Math.round(t).toLocaleString()}</span>
                      </div>
                      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                        <div style={{height:"100%",background:m===selMonth?"linear-gradient(to right,#6366f1,#06b6d4)":"rgba(255,255,255,0.15)",borderRadius:2,width:Math.round((t/maxT)*100)+"%"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:768px){.exp-stats{grid-template-columns:repeat(2,1fr)!important;}.exp-grid{grid-template-columns:1fr!important;}}"}</style>
    </div>
  );
}
