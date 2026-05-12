import { useState, useMemo, useEffect } from "react";
import { listenCol, saveDoc, deleteDocById, COL } from "./firebase.js";

const CATS={he:[{id:"produce",label:"ירקות ופירות",icon:"🥦"},{id:"dairy",label:"מוצרי חלב",icon:"🥛"},{id:"meat",label:"בשר ודגים",icon:"🥩"},{id:"bakery",label:"לחם ומאפים",icon:"🍞"},{id:"dry",label:"יבשים ושימורים",icon:"🫙"},{id:"cleaning",label:"ניקיון",icon:"🧹"},{id:"hygiene",label:"היגיינה",icon:"🧴"},{id:"snacks",label:"חטיפים ומשקאות",icon:"🍿"},{id:"other",label:"אחר",icon:"📦"}],en:[{id:"produce",label:"Produce",icon:"🥦"},{id:"dairy",label:"Dairy",icon:"🥛"},{id:"meat",label:"Meat & Fish",icon:"🥩"},{id:"bakery",label:"Bakery",icon:"🍞"},{id:"dry",label:"Dry & Canned",icon:"🫙"},{id:"cleaning",label:"Cleaning",icon:"🧹"},{id:"hygiene",label:"Hygiene",icon:"🧴"},{id:"snacks",label:"Snacks & Drinks",icon:"🍿"},{id:"other",label:"Other",icon:"📦"}]};
const FAVS=[{id:"f1",he:"חלב",en:"Milk",icon:"🥛",cat:"dairy"},{id:"f2",he:"לחם",en:"Bread",icon:"🍞",cat:"bakery"},{id:"f3",he:"ביצים",en:"Eggs",icon:"🥚",cat:"dairy"},{id:"f4",he:"עגבניות",en:"Tomatoes",icon:"🍅",cat:"produce"},{id:"f5",he:"עוף",en:"Chicken",icon:"🍗",cat:"meat"},{id:"f6",he:"קפה",en:"Coffee",icon:"☕",cat:"dry"},{id:"f7",he:"בננות",en:"Bananas",icon:"🍌",cat:"produce"},{id:"f8",he:"גבינה",en:"Cheese",icon:"🧀",cat:"dairy"}];
const MARKET_PRICES={"עגבניות":8,"tomatoes":8,"מלפפון":7,"cucumber":7,"בצל":5,"onion":5,"גזר":6,"carrot":6,"תפוחים":14,"apples":14,"בננות":9,"bananas":9,"תפוזים":8,"oranges":8,"אבוקדו":18,"avocado":18,"תות שדה":22,"strawberries":22,"ברוקולי":12,"broccoli":12,"חסה":8,"lettuce":8,"פלפל":14,"pepper":14,"חלב":7,"milk":7,"ביצים":18,"eggs":18,"גבינה לבנה":9,"white cheese":9,"גבינה צהובה":35,"yellow cheese":35,"גבינה":35,"cheese":35,"יוגורט":5,"yogurt":5,"חמאה":22,"butter":22,"קוטג":6,"cottage":6,"חזה עוף":38,"chicken breast":38,"עוף":25,"chicken":25,"בשר טחון":45,"ground beef":45,"סלמון":95,"salmon":95,"טונה":16,"tuna":16,"לחם":10,"bread":10,"לחם מחמצת":22,"sourdough":22,"פיתות":7,"pita":7,"שמן זית":28,"olive oil":28,"שמן":18,"oil":18,"סוכר":8,"sugar":8,"קמח":7,"flour":7,"אורז":14,"rice":14,"פסטה":8,"pasta":8,"קפה":55,"coffee":55,"שוקולד":15,"chocolate":15,"נייר טואלט":35,"toilet paper":35,"אבקת כביסה":45,"laundry powder":45,"שמפו":28,"shampoo":28,"סבון":12,"soap":12};
const getAvg=(name)=>{const lower=name.toLowerCase();for(const[k,v]of Object.entries(MARKET_PRICES)){if(lower.includes(k.toLowerCase()))return v;}return null;};
const priceTag=(name,price)=>{if(!price||price<=0)return null;const avg=getAvg(name);if(!avg)return null;const r=price/avg;if(r<0.85)return{label:"זול",color:"#10b981",icon:"👍"};if(r<=1.15)return{label:"מחיר שוק",color:"#6b7280",icon:"✓"};if(r<=1.4)return{label:"יקר קצת",color:"#f59e0b",icon:"⚠"};return{label:"יקר!",color:"#ef4444",icon:"🔴"};};
const PERSON_COLORS={Raz:"#6366f1",Olga:"#06b6d4",Both:"#10b981"};
let uid=100;const newId=()=>"s"+String(++uid)+Date.now();

export default function Shopping({lang,theme}){
  const isRTL=lang==="he";
  const cats=CATS[lang];
  const TH=theme||{bg:"#0f1117",card:"rgba(255,255,255,0.03)",cardBorder:"rgba(255,255,255,0.08)",text:"#e8eaf0",subText:"#6b7280",mutedText:"#4b5563",input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.12)"};
  const S={
    card:{background:TH.card,border:"1px solid "+TH.cardBorder,borderRadius:16,padding:20},
    inp:{background:TH.input,border:"1px solid "+TH.inputBorder,borderRadius:10,padding:"9px 12px",color:TH.text,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"},
    btn:{background:"linear-gradient(135deg,#6366f1,#06b6d4)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"},
    pill:(a)=>({background:a?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)",border:a?"1px solid rgba(99,102,241,0.4)":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 13px",color:a?"#a5b4fc":TH.subText,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}),
  };
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filterPerson,setFilterPerson]=useState("all");
  const [showDone,setShowDone]=useState(false);
  const [search,setSearch]=useState("");
  const [favAdded,setFavAdded]=useState({});
  const [form,setForm]=useState({he:"",cat:"produce",qty:"1",unit:"",person:"Both",price:"",recurring:false});
  const [showForm,setShowForm]=useState(false);

  useEffect(()=>{const u=listenCol(COL.shopping,(data)=>{setItems(data.sort((a,b)=>(a._order||0)-(b._order||0)));setLoading(false);});return()=>u();},[]);

  const grouped=useMemo(()=>{const filtered=items.filter(it=>{if(!showDone&&it.done)return false;if(filterPerson!=="all"&&it.person!==filterPerson&&it.person!=="Both")return false;const q=search.toLowerCase();if(q&&!it.he.toLowerCase().includes(q))return false;return true;});const map={};filtered.forEach(it=>{if(!map[it.cat])map[it.cat]=[];map[it.cat].push(it);});return map;},[items,filterPerson,showDone,search]);
  const totalEst=useMemo(()=>items.filter(i=>!i.done).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0),[items]);
  const doneCount=items.filter(i=>i.done).length;
  const pendCount=items.filter(i=>!i.done).length;

  const toggle=async(it)=>saveDoc(COL.shopping,it.id,{done:!it.done});
  const remove=async(id)=>deleteDocById(COL.shopping,id);
  const clearDone=async()=>Promise.all(items.filter(i=>i.done).map(i=>deleteDocById(COL.shopping,i.id)));
  const addItem=async()=>{if(!form.he.trim())return;const id=newId();await saveDoc(COL.shopping,id,{id,he:form.he.trim(),en:form.he.trim(),cat:form.cat,qty:parseFloat(form.qty)||1,unit:form.unit,person:form.person,price:parseFloat(form.price)||0,done:false,recurring:form.recurring,_order:Date.now()});setForm({he:"",cat:"produce",qty:"1",unit:"",person:"Both",price:"",recurring:false});setShowForm(false);};
  const addFav=async(fav)=>{const id=newId();await saveDoc(COL.shopping,id,{id,he:fav.he,en:fav.en,cat:fav.cat,qty:1,unit:"",person:"Both",price:0,done:false,recurring:false,_order:Date.now()});setFavAdded(p=>({...p,[fav.id]:true}));setTimeout(()=>setFavAdded(p=>({...p,[fav.id]:false})),1500);};
  const catIcon=(id)=>cats.find(c=>c.id===id)?.icon||"📦";
  const pLabel=(p)=>isRTL?(p==="Both"?"שניהם":p):p;

  const ItemRow=({it})=>{
    const pTag=priceTag(it.he,it.price);const avgP=getAvg(it.he);
    return(
      <div style={{display:"flex",alignItems:"center",flexDirection:isRTL?"row-reverse":"row",gap:10,padding:"12px 14px",borderRadius:12,background:it.done?"rgba(16,185,129,0.05)":TH.input,border:it.done?"1px solid rgba(16,185,129,0.15)":"1px solid "+TH.cardBorder,marginBottom:7}}>
        <div onClick={()=>toggle(it)} style={{width:22,height:22,borderRadius:7,flexShrink:0,background:it.done?"#10b981":"transparent",border:it.done?"2px solid #10b981":"2px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",cursor:"pointer"}}>{it.done?"✓":""}</div>
        <span style={{fontSize:16,flexShrink:0}}>{catIcon(it.cat)}</span>
        <div style={{flex:1,textAlign:isRTL?"right":"left"}}>
          <div style={{fontSize:14,fontWeight:600,textDecoration:it.done?"line-through":"none",color:it.done?TH.mutedText:TH.text}}>{it.he}{it.recurring&&<span style={{marginRight:6,fontSize:11,color:"#f59e0b"}}>🔄</span>}</div>
          {it.qty>1&&<div style={{fontSize:11,color:TH.subText,marginTop:2}}>{it.qty} {it.unit}</div>}
        </div>
import { listenCol, saveDoc, deleteDocById, COL } from "./firebase.js";

const CATS={
  he:[
    {id:"produce",label:"ירקות ופירות",icon:"🥦"},
    {id:"dairy",label:"מוצרי חלב",icon:"🥛"},
    {id:"meat",label:"בשר ודגים",icon:"🥩"},
    {id:"bakery",label:"לחם ומאפים",icon:"🍞"},
    {id:"dry",label:"יבשים ושימורים",icon:"🫙"},
    {id:"cleaning",label:"ניקיון",icon:"🧹"},
    {id:"hygiene",label:"היגיינה",icon:"🧴"},
    {id:"snacks",label:"חטיפים ומשקאות",icon:"🍿"},
    {id:"other",label:"אחר",icon:"📦"},
  ],
  en:[
    {id:"produce",label:"Produce",icon:"🥦"},
    {id:"dairy",label:"Dairy",icon:"🥛"},
    {id:"meat",label:"Meat & Fish",icon:"🥩"},
    {id:"bakery",label:"Bakery",icon:"🍞"},
    {id:"dry",label:"Dry & Canned",icon:"🫙"},
    {id:"cleaning",label:"Cleaning",icon:"🧹"},
    {id:"hygiene",label:"Hygiene",icon:"🧴"},
    {id:"snacks",label:"Snacks",icon:"🍿"},
    {id:"other",label:"Other",icon:"📦"},
  ],
};

const AVG_PRICES={
  "חלב":7,"milk":7,"ביצים":18,"eggs":18,"לחם":10,"bread":10,
  "עגבניות":8,"tomatoes":8,"מלפפון":7,"cucumber":7,"בצל":5,"onion":5,
  "גזר":6,"carrot":6,"תפוחים":14,"apples":14,"בננות":9,"bananas":9,
  "תפוזים":8,"oranges":8,"אבוקדו":18,"avocado":18,"תות שדה":22,
  "ברוקולי":12,"broccoli":12,"חסה":8,"lettuce":8,"פלפל":14,"pepper":14,
  "גבינה לבנה":9,"white cheese":9,"גבינה":35,"cheese":35,
  "יוגורט":5,"yogurt":5,"חמאה":22,"butter":22,"קוטג":6,"cottage":6,
  "עוף":25,"chicken":25,"חזה עוף":38,"chicken breast":38,
  "בשר טחון":45,"ground beef":45,"סלמון":95,"salmon":95,"טונה":16,"tuna":16,
  "שמן זית":28,"olive oil":28,"שמן":18,"oil":18,"סוכר":8,"sugar":8,
  "קמח":7,"flour":7,"אורז":14,"rice":14,"פסטה":8,"pasta":8,
  "קפה":55,"coffee":55,"שוקולד":15,"chocolate":15,
  "נייר טואלט":35,"toilet paper":35,"אבקת כביסה":45,"שמפו":28,"shampoo":28,
  "סבון":12,"soap":12,"משחת שיניים":14,"toothpaste":14,
};

const getAvg=(name)=>{
  const l=name.toLowerCase();
  for(const[k,v]of Object.entries(AVG_PRICES)){
    if(l.includes(k.toLowerCase()))return v;
  }
  return null;
};

const FAVS=[
  {id:"f1",he:"חלב",en:"Milk",icon:"🥛",cat:"dairy"},
  {id:"f2",he:"לחם",en:"Bread",icon:"🍞",cat:"bakery"},
  {id:"f3",he:"ביצים",en:"Eggs",icon:"🥚",cat:"dairy"},
  {id:"f4",he:"עגבניות",en:"Tomatoes",icon:"🍅",cat:"produce"},
  {id:"f5",he:"עוף",en:"Chicken",icon:"🍗",cat:"meat"},
  {id:"f6",he:"קפה",en:"Coffee",icon:"☕",cat:"dry"},
  {id:"f7",he:"בננות",en:"Bananas",icon:"🍌",cat:"produce"},
  {id:"f8",he:"גבינה",en:"Cheese",icon:"🧀",cat:"dairy"},
];

let uid=100;
const newId=()=>"s"+String(++uid)+Date.now();

export default function Shopping({lang,theme}){
  const isRTL=lang==="he";
  const cats=CATS[lang];
  const TH=theme||{bg:"#0f1117",card:"rgba(255,255,255,0.03)",cardBorder:"rgba(255,255,255,0.08)",text:"#e8eaf0",subText:"#6b7280",mutedText:"#4b5563",input:"rgba(255,255,255,0.05)",inputBorder:"rgba(255,255,255,0.12)"};

  const S={
    card:{background:TH.card,border:"1px solid "+TH.cardBorder,borderRadius:16,padding:18},
    inp:{background:TH.input,border:"1px solid "+TH.inputBorder,borderRadius:10,padding:"9px 12px",color:TH.text,fontSize:14,width:"100%",outline:"none",boxSizing:"border-box"},
    pill:(a)=>({background:a?"rgba(99,102,241,0.2)":TH.input,border:a?"1px solid rgba(99,102,241,0.4)":"1px solid "+TH.cardBorder,borderRadius:20,padding:"5px 13px",color:a?"#a5b4fc":TH.subText,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}),
  };

  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showDone,setShowDone]=useState(false);
  const [search,setSearch]=useState("");
  const [favAdded,setFavAdded]=useState({});
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({he:"",cat:"produce",qty:"1",unit:"",note:""});

  useEffect(()=>{
    const u=listenCol(COL.shopping,(data)=>{
      setItems(data.sort((a,b)=>(a._order||0)-(b._order||0)));
      setLoading(false);
    });
    return()=>u();
  },[]);

  const grouped=useMemo(()=>{
    const filtered=items.filter(it=>{
      if(!showDone&&it.done)return false;
      const q=search.toLowerCase();
      if(q&&!it.he.toLowerCase().includes(q))return false;
      return true;
    });
    const map={};
    filtered.forEach(it=>{if(!map[it.cat])map[it.cat]=[];map[it.cat].push(it);});
    return map;
  },[items,showDone,search]);

  const doneCount=items.filter(i=>i.done).length;
  const pendCount=items.filter(i=>!i.done).length;
  const totalEst=items.filter(i=>!i.done).reduce((s,i)=>{
    const avg=getAvg(i.he);
    return s+(avg||0)*(i.qty||1);
  },0);

  const toggle=async(it)=>saveDoc(COL.shopping,it.id,{done:!it.done});
  const remove=async(id)=>deleteDocById(COL.shopping,id);
  const clearDone=async()=>Promise.all(items.filter(i=>i.done).map(i=>deleteDocById(COL.shopping,i.id)));

  const addItem=async()=>{
    if(!form.he.trim())return;
    const id=newId();
    await saveDoc(COL.shopping,id,{
      id,he:form.he.trim(),en:form.he.trim(),
      cat:form.cat,qty:parseFloat(form.qty)||1,
      unit:form.unit,note:form.note,
      done:false,_order:Date.now(),
    });
    setForm({he:"",cat:"produce",qty:"1",unit:"",note:""});
    setShowForm(false);
  };

  const addFav=async(fav)=>{
    const id=newId();
    await saveDoc(COL.shopping,id,{
      id,he:fav.he,en:fav.en,cat:fav.cat,
      qty:1,unit:"",note:"",done:false,_order:Date.now(),
    });
    setFavAdded(p=>({...p,[fav.id]:true}));
    setTimeout(()=>setFavAdded(p=>({...p,[fav.id]:false})),1500);
  };

  const catIcon=(id)=>cats.find(c=>c.id===id)?.icon||"📦";

  const ItemRow=({it})=>{
    const avgP=getAvg(it.he);
    return(
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 16px",borderRadius:12,background:it.done?"rgba(16,185,129,0.05)":TH.input,border:it.done?"1px solid rgba(16,185,129,0.15)":"1px solid "+TH.cardBorder,marginBottom:8}}>
        <div onClick={()=>toggle(it)} style={{width:24,height:24,borderRadius:7,flexShrink:0,background:it.done?"#10b981":"transparent",border:it.done?"2px solid #10b981":"2px solid rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",cursor:"pointer"}}>{it.done?"✓":""}</div>
        <span style={{fontSize:20,flexShrink:0}}>{catIcon(it.cat)}</span>
        <div style={{flex:1,textAlign:isRTL?"right":"left"}}>
          <div style={{fontSize:15,fontWeight:600,textDecoration:it.done?"line-through":"none",color:it.done?TH.mutedText:TH.text}}>
            {it.he}
            {it.qty>1&&<span style={{fontSize:12,color:TH.subText,marginRight:6}}> × {it.qty}{it.unit?" "+it.unit:""}</span>}
          </div>
          {it.note&&<div style={{fontSize:11,color:TH.subText,marginTop:2}}>📝 {it.note}</div>}
        </div>
        {avgP&&!it.done&&(
          <div style={{textAlign:"center",flexShrink:0,padding:"4px 10px",background:"rgba(16,185,129,0.1)",borderRadius:8,border:"1px solid rgba(16,185,129,0.2)"}}>
            <div style={{fontSize:10,color:TH.mutedText}}>{isRTL?"מחיר שוק":"Avg"}</div>
            <div style={{fontSize:14,fontWeight:700,color:"#10b981"}}>₪{avgP}</div>
          </div>
        )}
        <button onClick={()=>remove(it.id)} style={{background:"none",border:"none",color:TH.mutedText,cursor:"pointer",fontSize:18,padding:"0 4px",flexShrink:0}}>✕</button>
      </div>
    );
  };

  if(loading)return(<div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,background:TH.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",gap:12}}><div style={{width:28,height:28,border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>מסנכרן...<style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>);

  return(
    <div style={{fontFamily:"'Outfit',sans-serif",color:TH.text,direction:isRTL?"rtl":"ltr",minHeight:"100vh",background:TH.bg,transition:"background .3s,color .3s"}}>
      {/* Header */}
      <div style={{background:TH.bg==="#f1f5f9"?"rgba(255,255,255,0.95)":"rgba(17,19,30,0.95)",borderBottom:"1px solid "+TH.cardBorder,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:42,height:42,borderRadius:13,background:"linear-gradient(135deg,#06b6d4,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🛒</div>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:TH.text}}>{isRTL?"קניות":"Shopping"}</div>
            <div style={{fontSize:11,color:TH.subText}}>{pendCount} {isRTL?"ממתינים":"pending"} · {doneCount} {isRTL?"נקנו":"bought"} · <span style={{color:"#10b981"}}>🔥 {isRTL?"מסונכרן":"Synced"}</span></div>
          </div>
        </div>
        {totalEst>0&&<div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:"6px 16px",textAlign:"center"}}>
          <div style={{fontSize:10,color:TH.subText}}>{isRTL?"הערכת עלות":"Est."}</div>
          <div style={{fontSize:16,fontWeight:800,color:"#10b981"}}>₪{Math.round(totalEst)}</div>
        </div>}
      </div>

      <div style={{padding:"16px 18px",maxWidth:800,margin:"0 auto"}}>

        {/* כפתור הוספה גדול ובולט */}
        <button
          onClick={()=>setShowForm(!showForm)}
          style={{
            width:"100%",padding:"16px",marginBottom:16,
            background:showForm?"rgba(99,102,241,0.15)":"linear-gradient(135deg,#6366f1,#06b6d4)",
            border:showForm?"2px solid rgba(99,102,241,0.4)":"none",
            borderRadius:16,color:"#fff",fontSize:17,fontWeight:700,
            cursor:"pointer",display:"flex",alignItems:"center",
            justifyContent:"center",gap:10,
            boxShadow:showForm?"none":"0 4px 20px rgba(99,102,241,0.35)",
            transition:"all .2s",
          }}
        >
          <span style={{fontSize:26,lineHeight:1}}>{showForm?"✕":"+"}</span>
          {showForm?(isRTL?"סגור":"Close"):(isRTL?"הוסף פריט לקניות":"Add Shopping Item")}
        </button>

        {/* Add form */}
        {showForm&&(
          <div style={{...S.card,marginBottom:16,borderColor:"rgba(99,102,241,0.3)"}}>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:TH.subText,marginBottom:4}}>{isRTL?"שם פריט":"Item name"}</div>
              <input
                value={form.he}
                onChange={e=>setForm({...form,he:e.target.value})}
                onKeyDown={e=>e.key==="Enter"&&addItem()}
                placeholder={isRTL?"לדוגמה: תפוחים, חלב...":"e.g. Apples, Milk..."}
                style={{...S.inp,fontSize:16,padding:"12px 14px"}}
                autoFocus
              />
              {form.he&&getAvg(form.he)&&(
                <div style={{fontSize:12,color:"#10b981",marginTop:5,display:"flex",alignItems:"center",gap:4}}>
                  <span>💡</span> {isRTL?"מחיר שוק ממוצע":"Avg market price"}: <strong>₪{getAvg(form.he)}</strong>
                </div>
              )}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr",gap:8,marginBottom:10}}>
              <div>
                <div style={{fontSize:11,color:TH.subText,marginBottom:4}}>{isRTL?"כמות":"Qty"}</div>
                <input type="number" min="0.1" step="0.5" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} style={S.inp}/>
              </div>
              <div>
                <div style={{fontSize:11,color:TH.subText,marginBottom:4}}>{isRTL?"יחידה":"Unit"}</div>
                <input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} placeholder="kg/יח..." style={S.inp}/>
              </div>
              <div>
                <div style={{fontSize:11,color:TH.subText,marginBottom:4}}>{isRTL?"קטגוריה":"Category"}</div>
                <select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={{...S.inp,appearance:"none",color:TH.text}}>
                  {cats.map(c=><option key={c.id} value={c.id} style={{background:TH.bg,color:TH.text}}>{c.icon} {c.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:TH.subText,marginBottom:4}}>{isRTL?"הערה":"Note"}</div>
              <input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder={isRTL?"אופציונלי...":"Optional..."} style={S.inp}/>
            </div>
            <button
              onClick={addItem}
              style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}
            >
              ✓ {isRTL?"הוסף לרשימה":"Add to List"}
            </button>
          </div>
        )}

        {/* Quick add favs */}
        <div style={{...S.card,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:"#a5b4fc",marginBottom:12}}>⚡ {isRTL?"הוספה מהירה":"Quick Add"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {FAVS.map(fav=>{
              const avg=getAvg(fav.he);
              return(
                <button key={fav.id} onClick={()=>addFav(fav)} style={{background:favAdded[fav.id]?"rgba(16,185,129,0.15)":TH.input,border:favAdded[fav.id]?"1px solid rgba(16,185,129,0.3)":"1px solid "+TH.cardBorder,borderRadius:12,padding:"12px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all .15s"}}>
                  <span style={{fontSize:24}}>{favAdded[fav.id]?"✓":fav.icon}</span>
                  <span style={{fontSize:12,color:favAdded[fav.id]?"#6ee7b7":TH.text,fontWeight:600}}>{isRTL?fav.he:fav.en}</span>
                  {avg&&<span style={{fontSize:11,color:"#10b981",fontWeight:700}}>₪{avg}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search only — no person filter */}
        <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
          <div style={{position:"relative",flex:1}}>
            <span style={{position:"absolute",[isRTL?"right":"left"]:12,top:"50%",transform:"translateY(-50%)",color:TH.subText,fontSize:15}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={isRTL?"חיפוש פריט...":"Search item..."} style={{...S.inp,fontSize:15,padding:"11px 14px",[isRTL?"paddingRight":"paddingLeft"]:38}}/>
          </div>
          {doneCount>0&&(
            <button onClick={()=>setShowDone(!showDone)} style={S.pill(showDone)}>
              {showDone?(isRTL?"הסתר":"Hide"):(isRTL?"נקנו":"Bought")} ({doneCount})
            </button>
          )}
          {showDone&&doneCount>0&&(
            <button onClick={clearDone} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:20,padding:"5px 12px",color:"#fca5a5",fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
              {isRTL?"נקה":"Clear"}
            </button>
          )}
        </div>

        {/* Items by category */}
        {cats.map(cat=>{
          const ci=grouped[cat.id];
          if(!ci||!ci.length)return null;
          const catEst=ci.filter(i=>!i.done).reduce((s,i)=>{const a=getAvg(i.he);return s+(a||0)*(i.qty||1);},0);
          return(
            <div key={cat.id} style={{marginBottom:22}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexDirection:isRTL?"row-reverse":"row",paddingBottom:8,borderBottom:"1px solid "+TH.cardBorder}}>
                <span style={{fontSize:22}}>{cat.icon}</span>
                <span style={{fontSize:15,fontWeight:700,color:TH.text}}>{cat.label}</span>
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:TH.input,color:TH.subText,fontWeight:600}}>{ci.length}</span>
                {catEst>0&&<span style={{fontSize:11,padding:"2px 10px",borderRadius:20,background:"rgba(16,185,129,0.1)",color:"#10b981",fontWeight:700,marginRight:"auto"}}>~₪{Math.round(catEst)}</span>}
              </div>
              {ci.map(it=><ItemRow key={it.id} it={it}/>)}
            </div>
          );
        })}

        {cats.every(c=>!grouped[c.id]||!grouped[c.id].length)&&(
          <div style={{...S.card,textAlign:"center",padding:50,color:TH.subText}}>
            <div style={{fontSize:48,marginBottom:12}}>🛒</div>
            <div style={{fontSize:16,fontWeight:600}}>{isRTL?"הרשימה ריקה":"List is empty"}</div>
            <div style={{fontSize:12,marginTop:6,color:TH.mutedText}}>{isRTL?"לחץ על הכפתור הכחול למעלה להוסיף":"Click the button above to add items"}</div>
          </div>
        )}
      </div>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
                                                             }
