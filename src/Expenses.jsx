import { useState, useEffect, useMemo } from "react";
import { listenCol, saveDoc, deleteDocById } from "./firebase.js";


const CATS=[{id:"food_rest",he:"מסעדות ואוכל",icon:"🍽",color:"#f59e0b"},{id:"grocery",he:"סופרמרקט",icon:"🛒",color:"#10b981"},{id:"fuel",he:"דלק ורכב",icon:"⛽",color:"#6366f1"},{id:"fashion",he:"ביגוד",icon:"👗",color:"#a855f7"},{id:"home",he:"בית",icon:"🏠",color:"#06b6d4"},{id:"entertain",he:"בידור",icon:"🎬",color:"#f59e0b"},{id:"travel",he:"נסיעות",icon:"✈",color:"#10b981"},{id:"education",he:"חינוך",icon:"📚",color:"#6366f1"},{id:"insurance",he:"ביטוח",icon:"🛡",color:"#6b7280"},{id:"utilities",he:"חשבונות",icon:"💡",color:"#f59e0b"},{id:"online",he:"קניות אונליין",icon:"🛍",color:"#a855f7"},{id:"finance",he:"בנק",icon:"🏦",color:"#06b6d4"},{id:"pets",he:"חיות מחמד",icon:"🐕",color:"#10b981"},{id:"other",he:"אחר",icon:"📦",color:"#6b7280"}];
const PAY=[{id:"credit",he:"אשראי",icon:"💳"},{id:"cash",he:"מזומן",icon:"💵"},{id:"check",he:"שיק",icon:"📄"},{id:"transfer",he:"העברה",icon:"🏦"},{id:"bit",he:"ביט",icon:"📱"}];
let UID=600;const nid=()=>"exp"+String(++UID)+Date.now();
const monthKey=(y,m)=>y+"-"+String(m+1).padStart(2,"0");
const monthLabel=(k)=>{const[y,m]=k.split("-");return["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"][parseInt(m)-1]+" "+y;};
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
  const f0={desc:"",amount:"",cat:"food_rest",payMethod:"credit",date:new Date().toISOString().slice(0,10),note:"",person:"Both"};
  const [form,setForm]=useState(f0);


  useEffect(()=>{
    const u=listenCol("expenses",d=>{setExpenses(d);setLoading(false);});
    const u2=listenCol("expense_budget",d=>{const b={};d.forEach(x=>{b[x.id]=x;});setBudget(b);});
    return()=>{u();u2();};
  },[]);

