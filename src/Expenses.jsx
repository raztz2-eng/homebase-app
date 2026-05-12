import { useState, useEffect, useMemo } from "react";
import { listenCol, saveDoc, deleteDocById } from "./firebase.js";

const CATS=[
  {id:"food_rest",he:"מסעדות",icon:"🍽",color:"#f59e0b"},
  {id:"grocery",he:"סופרמרקט",icon:"🛒",color:"#10b981"},
  {id:"fuel",he:"דלק",icon:"⛽",color:"#6366f1"},
  {id:"fashion",he:"ביגוד",icon:"👗",color:"#a855f7"},
  {id:"home",he:"בית",icon:"🏠",color:"#06b6d4"},
  {id:"entertain",he:"בידור",icon:"🎬",color:"#f59e0b"},
  {id:"travel",he:"נסיעות",icon:"✈",color:"#10b981"},
  {id:"education",he:"חינוך",icon:"📚",color:"#6366f1"},
  {id:"insurance",he:"ביטוח",icon:"🛡",color:"#6b7280"},
  {id:"utilities",he:"חשבונות",icon:"💡",color:"#f59e0b"},
  {id:"online",he:"אונליין",icon:"🛍",color:"#a855f7"},
  {id:"finance",he:"בנק",icon:"🏦",color:"#06b6d4"},
  {id:"pets",he:"חיות",icon:"🐕",color:"#10b981"},
  {id:"other",he:"אחר",icon:"📦",color:"#6b7280"},
];
const PAY=[
  {id:"credit",he:"אשראי",icon:"💳"},
  {id:"cash",he:"מזומן",icon:"💵"},
  {id:"check",he:"שיק",icon:"📄"},
  {id:"transfer",he:"העברה",icon:"🏦"},
  {id:"bit",he:"ביט",icon:"📱"},
];
let UID=600;
const nid=()=>"exp"+String(++UID)+Date.now();
const monthKey=(y,m)=>y+"-"+String(m+1).padStart(2,"0");
const MONTHS=["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const monthLabel=(k)=>{const[y,m]=k.split("-");return MONTHS[parseInt(m)-1]+" "+y;};
const catInfo=(id)=>CATS.find(c=>c.id===id)||CATS[CATS.length-1];

export default function Expenses({theme}){
  const TH=theme||{bg:"#0f1117",card:"rgba(255,255,255,0.02)",cardBorder:"rgba(255,255,255,0.07)",text:"#e8eaf0",subText:"#6b7280",mutedText:"#4b5563",header:"rgba(15,17,23,0.92)",input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.12)",rowBg:"rgba(255,255,255,0.03)"};
  const CARD={background:TH.card,border:"1px solid "+TH.cardBorder,borderRadius:16,padding:18};
  const INP={background:TH.input,border:"1px solid "+TH.inputBorder,borderRadius:10,padding:"9px 12px",color:TH.text,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"};
  const BTN={background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"};
  const PILL=(a)=>({background:a?"rgba(99,102,241,0.2)":TH.input,border:a?"1px solid rgba(99,102,241,0.4)":"1px solid "+TH.cardBorder,borderRadius:20,padding:"5px 13px",color:a?"#a5b4fc":TH.subText,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"});

  const [expenses,setExpenses]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selMonth,setSelMonth]=useState(monthKey(new Date().getFullYear(),new Date().getMonth()));
  const [filterCat,setFilterCat]=useState("all");
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [importing,setImporting]=useState(false);
  const [importMsg,setImportMsg]=useState("");
  const [budget,setBudget]=useState({});
  const [showBudget,setShowBudget]=useState(false);
  const f0={desc:"",amount:"",cat:"food_rest",payMethod:"credit",date:new Date().toISOString().slice(0,10),note:""};
  const [form,setForm]=useState(f0);

  useEffect(()=>{
    const u=listenCol("expenses",d=>{setExpenses(d);setLoading(false);});
    const u2=listenCol("expense_budget",d=>{const b={};d.forEach(x=>{b[x.id]=x;});setBudget(b);});
    return()=>{u();u2();};
  },[]);

  const months=useMemo(()=>{const s=new Set(expenses.map(e=>e.month).filter(Boolean));if(!s.has(selMonth))s.add(selMonth);return[...s].sort().reverse();},[expenses,selMonth]);
  const monthExp=useMemo(()=>expenses.filter(e=>e.month===selMonth&&(filterCat==="all"||e.cat===filterCat)),[expenses,selMonth,filterCat]);
  const totalMonth=useMemo(()=>expenses.filter(e=>e.month===selMonth).reduce((s,e)=>s+(parseFloat(e.amount)||0),0),[expenses,selMonth]);
  const byCat=useMemo(()=>{const m={};expenses.filter(e=>e.month===selMonth).forEach(e=>{if(!m[e.cat])m[e.cat]=0;m[e.cat]+=parseFloat(e.amount)||0;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);},[expenses,selMonth]);
  const monthlyTotals=useMemo(()=>{const m={};expenses.forEach(e=>{if(!m[e.month])m[e.month]=0;m[e.month]+=parseFloat(e.amount)||0;});return m;},[expenses]);
  const budgetTotal=Object.values(budget).reduce((s,b)=>s+(b.amount||0),0);
  const budgetLeft=budgetTotal-totalMonth;

  const saveExp=async()=>{
    if(!form.desc||!form.amount)return;
    const id=editId||nid();
    const month=form.date.slice(0,7);
    await saveDoc("expenses",id,{...form,id,amount:parseFloat(form.amount),month});
    setEditId(null);setShowForm(false);setForm(f0);
  };
  const startEdit=(exp)=>{setEditId(exp.id);setForm({...exp,amount:String(exp.amount)});setShowForm(true);};
  const delExp=async(id)=>deleteDocById("expenses",id);
  const saveBudget=async(catId,val)=>saveDoc("expense_budget",catId,{id:catId,amount:parseFloat(val)||0});

  const importCSV=async(file)=>{
    setImporting(true);setImportMsg("");
    try{
      const text=await file.text();
      const lines=text.split("\n").filter(l=>l.trim());
      let added=0;
      const headers=lines[0].split(",").map(h=>h.trim().replace(/"/g,""));
      for(let i=1;i<lines.length;i++){
        const cols=lines[i].split(",").map(c=>c.trim().replace(/"/g,""));
        if(cols.length<3)continue;
        const dI=headers.findIndex(h=>/תאריך|date/i.test(h));
        const dsI=headers.findIndex(h=>/עסקה|תיאור|שם|desc|name/i.test(h));
        const aI=headers.findIndex(h=>/סכום|חיוב|amount/i.test(h));
        if(dI<0||dsI<0||aI<0)continue;
        const rawDate=cols[dI]||"";
        const desc=cols[dsI]||"";
        const rawAmt=cols[aI]||"0";
        const amount=parseFloat(rawAmt.replace(/[^0-9.]/g,""))||0;
        if(!desc||!amount)continue;
        let date=new Date().toISOString().slice(0,10);
        const parts=rawDate.split(/[.\/]/);
        if(parts.length===3){
          const yr=parts[2].length===2?"20"+parts[2]:parts[2];
          date=yr+"-"+parts[1].padStart(2,"0")+"-"+parts[0].padStart(2,"0");
        }
        const month=date.slice(0,7);
        let cat="other";
        const dl=desc.toLowerCase();
        if(/מסעדה|אוכל|קפה|pizza|cafe/.test(dl))cat="food_rest";
        else if(/סופר|שופרסל|רמי לוי/.test(dl))cat="grocery";
        else if(/דלק|סונול|פז/.test(dl))cat="fuel";
        else if(/ביטוח|הראל|מגדל/.test(dl))cat="insurance";
        else if(/חשמל|מים|ארנונה|בזק/.test(dl))cat="utilities";
        else if(/אמזון|aliex|ebay/.test(dl))cat="online";
        const id=nid();
        await saveDoc("expenses",id,{id,desc,amount,cat,payMethod:"credit",date,month,note:"CSV"});
        added++;
      }
      setImportMsg("נייבאו "+added+" הוצאות");
    }catch(err){setImportMsg("שגיאה: "+err.message);}
    setImporting(false);
  };

  if(loading)return(<div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,background:TH.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}><div style={{width:28,height:28,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>טוען...<style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>);

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,direction:"rtl",minHeight:"100vh",background:TH.bg,transition:"background .3s,color .3s"}}>
      <div style={{background:TH.header,borderBottom:"1px solid "+TH.cardBorder,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>₪</div>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:TH.text}}>הוצאות</div>
            <div style={{fontSize:11,color:TH.subText}}>{monthLabel(selMonth)} · <span style={{color:"#10b981"}}>🔥 מסונכרן</span></div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowBudget(!showBudget)} style={{background:TH.input,border:"1px solid "+TH.cardBorder,borderRadius:10,padding:"7px 14px",color:TH.subText,fontSize:12,cursor:"pointer"}}>🎯 תקציב</button>
          <button onClick={()=>{setShowForm(!showForm);setEditId(null);setForm(f0);}} style={BTN}>+ הוסף</button>
        </div>
      </div>

      <div style={{padding:"16px 18px",maxWidth:1000,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          {[
            {l:"סכום חודשי",v:"₪"+Math.round(totalMonth).toLocaleString(),c:"#ef4444",icon:"💸"},
            {l:"עסקאות",v:expenses.filter(e=>e.month===selMonth).length,c:"#6366f1",icon:"🧾"},
            {l:"תקציב",v:budgetTotal>0?"₪"+budgetTotal.toLocaleString():"לא נקבע",c:"#10b981",icon:"🎯"},
            {l:budgetLeft>=0?"נותר":"חריגה",v:budgetTotal>0?"₪"+Math.abs(budgetLeft).toLocaleString():"—",c:budgetLeft>=0?"#10b981":"#ef4444",icon:budgetLeft>=0?"✅":"⚠️"},
          ].map(s=>(
            <div key={s.l} style={{...CARD,textAlign:"center",borderTop:"2px solid "+s.c+"44"}}>
              <div style={{fontSize:18,marginBottom:3}}>{s.icon}</div>
              <div style={{fontSize:10,color:TH.subText}}>{s.l}</div>
              <div style={{fontSize:18,fontWeight:800,color:s.c,margin:"3px 0"}}>{s.v}</div>
            </div>
          ))}
        </div>

        {budgetTotal>0&&<div style={{...CARD,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6,color:TH.subText}}>
            <span>ניצול תקציב</span>
            <span style={{color:budgetLeft>=0?"#10b981":"#ef4444",fontWeight:700}}>{Math.min(100,Math.round((totalMonth/budgetTotal)*100))}%</span>
          </div>
          <div style={{height:7,background:TH.input,borderRadius:4}}>
            <div style={{height:"100%",background:budgetLeft>=0?"linear-gradient(to right,#10b981,#06b6d4)":"linear-gradient(to right,#f59e0b,#ef4444)",borderRadius:4,width:Math.min(100,Math.round((totalMonth/budgetTotal)*100))+"%"}}/>
          </div>
        </div>}

        {showBudget&&<div style={{...CARD,marginBottom:16,borderColor:"rgba(99,102,241,0.3)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",marginBottom:12}}>🎯 תקציב חודשי לפי קטגוריה</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {CATS.map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:16}}>{c.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:TH.subText,marginBottom:2}}>{c.he}</div>
                <input type="number" placeholder="₪" defaultValue={budget[c.id]?.amount||""} onBlur={e=>saveBudget(c.id,e.target.value)} style={{...INP,padding:"5px 8px",fontSize:12}}/>
              </div>
            </div>))}
          </div>
        </div>}

        <div style={{...CARD,marginBottom:16,borderColor:"rgba(6,182,212,0.2)"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#06b6d4",marginBottom:8}}>📥 ייבוא פירוט אשראי (CSV)</div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <label style={{...BTN,display:"inline-flex",alignItems:"center",gap:7,cursor:"pointer",background:"rgba(6,182,212,0.15)",border:"1px solid rgba(6,182,212,0.3)",color:"#67e8f9"}}>
              📄 {importing?"מייבא...":"בחר קובץ CSV"}
              <input type="file" accept=".csv" style={{display:"none"}} disabled={importing} onChange={e=>e.target.files[0]&&importCSV(e.target.files[0])}/>
            </label>
            {importMsg&&<span style={{fontSize:13,color:"#10b981",fontWeight:600}}>{importMsg}</span>}
          </div>
        </div>

        <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
          {months.map(m=><button key={m} onClick={()=>{setSelMonth(m);setFilterCat("all");}} style={PILL(m===selMonth)}>{monthLabel(m)}</button>)}
        </div>

        {showForm&&<div style={{...CARD,marginBottom:16,borderColor:"rgba(99,102,241,0.3)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",marginBottom:12}}>{editId?"עריכה":"הוצאה חדשה"}</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10,marginBottom:10}}>
            <div><div style={{fontSize:11,color:TH.subText,marginBottom:4}}>תיאור</div><input value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} style={INP} autoFocus/></div>
            <div><div style={{fontSize:11,color:TH.subText,marginBottom:4}}>סכום</div><input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} style={INP}/></div>
            <div><div style={{fontSize:11,color:TH.subText,marginBottom:4}}>תאריך</div><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={INP}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
            <div><div style={{fontSize:11,color:TH.subText,marginBottom:4}}>קטגוריה</div><select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={{...INP,appearance:"none"}}>{CATS.map(c=><option key={c.id} value={c.id} style={{background:TH.bg,color:TH.text}}>{c.icon} {c.he}</option>)}</select></div>
            <div><div style={{fontSize:11,color:TH.subText,marginBottom:4}}>תשלום</div><select value={form.payMethod} onChange={e=>setForm({...form,payMethod:e.target.value})} style={{...INP,appearance:"none"}}>{PAY.map(p=><option key={p.id} value={p.id} style={{background:TH.bg,color:TH.text}}>{p.icon} {p.he}</option>)}</select></div>
            <div><div style={{fontSize:11,color:TH.subText,marginBottom:4}}>הערה</div><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} style={INP}/></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveExp} style={BTN}>{editId?"עדכן":"שמור"}</button>
            <button onClick={()=>{setShowForm(false);setEditId(null);}} style={{...BTN,background:TH.input,color:TH.subText}}>ביטול</button>
          </div>
        </div>}

        <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto",paddingBottom:3}}>
          <button onClick={()=>setFilterCat("all")} style={PILL(filterCat==="all")}>הכל</button>
          {CATS.map(c=><button key={c.id} onClick={()=>setFilterCat(c.id)} style={PILL(filterCat===c.id)}>{c.icon} {c.he}</button>)}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16,alignItems:"start"}}>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:TH.subText,marginBottom:8}}>
              <span>{monthExp.length} הוצאות</span>
              <span style={{fontWeight:700,color:TH.text}}>₪{monthExp.reduce((s,e)=>s+(parseFloat(e.amount)||0),0).toLocaleString()}</span>
            </div>
            {monthExp.length===0?<div style={{...CARD,textAlign:"center",padding:40,color:TH.subText}}><div style={{fontSize:36,marginBottom:10}}>💸</div>אין הוצאות</div>
              :monthExp.sort((a,b)=>b.date>a.date?1:-1).map(exp=>{
                const cat=catInfo(exp.cat);
                const pay=PAY.find(p=>p.id===exp.payMethod)||PAY[0];
                return(<div key={exp.id} style={{...CARD,marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:34,height:34,borderRadius:9,background:cat.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{cat.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:TH.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{exp.desc}</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:3}}>
                      <span style={{fontSize:10,color:TH.subText}}>{exp.date}</span>
                      <span style={{fontSize:10,padding:"1px 6px",borderRadius:20,background:cat.color+"22",color:cat.color}}>{cat.he}</span>
                      <span style={{fontSize:10,color:TH.subText}}>{pay.icon} {pay.he}</span>
                    </div>
                  </div>
                  <div style={{fontSize:15,fontWeight:800,color:"#ef4444",flexShrink:0}}>₪{parseFloat(exp.amount).toLocaleString()}</div>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>startEdit(exp)} style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:7,padding:"3px 8px",color:"#a5b4fc",fontSize:11,cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>delExp(exp.id)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:7,padding:"3px 8px",color:"#fca5a5",fontSize:11,cursor:"pointer"}}>🗑</button>
                  </div>
                </div>);
              })}
          </div>

          <div style={{position:"sticky",top:20}}>
            <div style={CARD}>
              <div style={{fontSize:13,fontWeight:700,color:TH.text,marginBottom:12}}>📊 פילוח</div>
              {byCat.length===0?<div style={{fontSize:12,color:TH.subText,textAlign:"center",padding:16}}>אין נתונים</div>
                :byCat.map(([catId,total])=>{
                  const cat=catInfo(catId);
                  const pct=Math.round((total/totalMonth)*100);
                  return(<div key={catId} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}><span>{cat.icon}</span><span style={{fontSize:11,fontWeight:600,color:TH.text}}>{cat.he}</span></div>
                      <div><span style={{fontSize:12,fontWeight:700,color:TH.text}}>₪{Math.round(total).toLocaleString()}</span><span style={{fontSize:10,color:TH.subText}}> {pct}%</span></div>
                    </div>
                    <div style={{height:4,background:TH.input,borderRadius:2}}>
                      <div style={{height:"100%",background:cat.color,borderRadius:2,width:pct+"%",opacity:0.8}}/>
                    </div>
                  </div>);
                })}
              {totalMonth>0&&<div style={{borderTop:"1px solid "+TH.cardBorder,paddingTop:8,marginTop:4,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:13,color:TH.text}}>
                <span>סכום כולל</span>
                <span style={{color:"#ef4444"}}>₪{Math.round(totalMonth).toLocaleString()}</span>
              </div>}
            </div>

            {Object.keys(monthlyTotals).length>1&&<div style={{...CARD,marginTop:12}}>
              <div style={{fontSize:13,fontWeight:700,color:TH.text,marginBottom:12}}>📈 השוואה</div>
              {Object.entries(monthlyTotals).sort((a,b)=>b[0]>a[0]?1:-1).slice(0,6).map(([m,t])=>{
                const maxT=Math.max(...Object.values(monthlyTotals));
                return(<div key={m} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3,color:m===selMonth?"#a5b4fc":TH.subText,fontWeight:m===selMonth?700:400}}>
                    <span>{monthLabel(m)}</span>
                    <span>₪{Math.round(t).toLocaleString()}</span>
                  </div>
                  <div style={{height:4,background:TH.input,borderRadius:2}}>
                    <div style={{height:"100%",background:m===selMonth?"linear-gradient(to right,#6366f1,#06b6d4)":"rgba(150,150,150,0.3)",borderRadius:2,width:Math.round((t/maxT)*100)+"%"}}/>
                  </div>
                </div>);
              })}
            </div>}
          </div>
        </div>
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
