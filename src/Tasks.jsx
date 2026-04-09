import { useState, useMemo, useEffect, useRef } from "react";
import { listenCol, saveDoc, deleteDocById, COL } from "./firebase.js";




const PERSON_COLORS={Raz:"#6366f1",Olga:"#06b6d4",Both:"#10b981"};
const RECUR=[
  {id:"none",he:"חד פעמי",en:"One-time"},{id:"daily",he:"כל יום",en:"Daily"},
  {id:"weekly",he:"שבועי",en:"Weekly"},{id:"biweekly",he:"כל שבועיים",en:"Every 2 weeks"},
  {id:"monthly",he:"חודשי",en:"Monthly"},{id:"bimonthly",he:"כל חודשיים",en:"Every 2 months"},
  {id:"quarterly",he:"רבעוני",en:"Quarterly"},{id:"yearly",he:"שנתי",en:"Yearly"},
];
const CATS=[
  {id:"bills",he:"חשבונות",en:"Bills",icon:"💡"},{id:"home",he:"בית",en:"Home",icon:"🏠"},{id:"car",he:"רכב",en:"Car",icon:"🚗"},
  {id:"kids",he:"ילדים",en:"Kids",icon:"👶"},{id:"finance",he:"כספים",en:"Finance",icon:"💰"},
  {id:"work",he:"עבודה",en:"Work",icon:"💼"},{id:"personal",he:"אישי",en:"Personal",icon:"🙋"},
  {id:"other",he:"אחר",en:"Other",icon:"📋"},
];
const PC={high:"#ef4444",medium:"#f59e0b",low:"#6b7280"};
const PL={he:{high:"דחוף",medium:"בינוני",low:"נמוך"},en:{high:"High",medium:"Medium",low:"Low"}};
let UID=200;const newId=()=>"t"+String(++UID)+Date.now();
const today=()=>new Date().toISOString().slice(0,10);
const du=(d)=>d?Math.ceil((new Date(d)-new Date(today()))/86400000):null;
const uc=(d)=>d===null?null:d<=0?"#ef4444":d<=3?"#f59e0b":d<=7?"#06b6d4":"#6b7280";
const rl=(id,l)=>RECUR.find(r=>r.id===id)?.[l]||id;
const ci=(id)=>CATS.find(c=>c.id===id)||CATS[CATS.length-1];
const nd=(last,rec)=>{if(!last||rec==="none")return null;const d=new Date(last);const a={daily:1,weekly:7,biweekly:14,monthly:30,bimonthly:60,quarterly:90,yearly:365};d.setDate(d.getDate()+(a[rec]||0));return d.toISOString().slice(0,10);};




// select style — white text after selection, dark bg
const SEL={...{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"9px 12px",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"},color:"#e8eaf0",appearance:"none"};
const INP={background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"9px 12px",color:"#e8eaf0",fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"};
const BTN={background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"};
const CARD={background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:20};
const PILL=(a)=>({background:a?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)",border:a?"1px solid rgba(99,102,241,0.4)":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 13px",color:a?"#a5b4fc":"#6b7280",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"});
const TAG=(c)=>({fontSize:11,padding:"2px 8px",borderRadius:20,background:c+"22",color:c,border:"1px solid "+c+"44",fontWeight:600,whiteSpace:"nowrap"});




function Confetti({show}){
