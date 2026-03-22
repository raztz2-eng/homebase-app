import { useState, useMemo } from "react";

// ── Supermarkets ──────────────────────────────────────────────
const SUPERS = [
  { id:"any",      he:"כל סופר",     en:"Any Store",      icon:"🛒" },
  { id:"shufersal",he:"שופרסל",      en:"Shufersal",      icon:"🟠" },
  { id:"rami",     he:"רמי לוי",     en:"Rami Levy",      icon:"🔵" },
  { id:"machsane", he:"מחסני השוק",  en:"Machsane Hashuk",icon:"🟢" },
  { id:"victory",  he:"ויקטורי",     en:"Victory",        icon:"🟣" },
  { id:"yochananof",he:"יוחננוף",    en:"Yochananof",     icon:"🟡" },
  { id:"online",   he:"אונליין",     en:"Online",         icon:"💻" },
];

// ── Categories — produce & dairy FIRST per user preference ───
const CATS = {
  he: [
    { id:"produce",  label:"ירקות ופירות",    icon:"🥦" },
    { id:"dairy",    label:"מוצרי חלב",       icon:"🥛" },
    { id:"meat",     label:"בשר ודגים",       icon:"🥩" },
    { id:"bakery",   label:"לחם ומאפים",      icon:"🍞" },
    { id:"dry",      label:"יבשים ושימורים",  icon:"🫙" },
    { id:"cleaning", label:"ניקיון",          icon:"🧹" },
    { id:"hygiene",  label:"היגיינה",         icon:"🧴" },
    { id:"snacks",   label:"חטיפים ומשקאות",  icon:"🍿" },
    { id:"other",    label:"אחר",             icon:"📦" },
  ],
  en: [
    { id:"produce",  label:"Produce",         icon:"🥦" },
    { id:"dairy",    label:"Dairy",           icon:"🥛" },
    { id:"meat",     label:"Meat & Fish",     icon:"🥩" },
    { id:"bakery",   label:"Bakery",          icon:"🍞" },
    { id:"dry",      label:"Dry & Canned",    icon:"🫙" },
    { id:"cleaning", label:"Cleaning",        icon:"🧹" },
    { id:"hygiene",  label:"Hygiene",         icon:"🧴" },
    { id:"snacks",   label:"Snacks & Drinks", icon:"🍿" },
    { id:"other",    label:"Other",           icon:"📦" },
  ],
};

// ── Quick-add favourites ──────────────────────────────────────
const FAVS = [
  { id:"f1", he:"חלב",     en:"Milk",     icon:"🥛", cat:"dairy"   },
  { id:"f2", he:"לחם",     en:"Bread",    icon:"🍞", cat:"bakery"  },
  { id:"f3", he:"ביצים",   en:"Eggs",     icon:"🥚", cat:"dairy"   },
  { id:"f4", he:"עגבניות", en:"Tomatoes", icon:"🍅", cat:"produce" },
  { id:"f5", he:"עוף",     en:"Chicken",  icon:"🍗", cat:"meat"    },
  { id:"f6", he:"קפה",     en:"Coffee",   icon:"☕", cat:"dry"     },
  { id:"f7", he:"בננות",   en:"Bananas",  icon:"🍌", cat:"produce" },
  { id:"f8", he:"גבינה",   en:"Cheese",   icon:"🧀", cat:"dairy"   },
];

// ── Styles ────────────────────────────────────────────────────
const S = {
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 },
  inp:  { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"9px 12px", color:"#e8eaf0", fontSize:14, width:"100%", outline:"none", boxSizing:"border-box" },
  btn:  { background:"linear-gradient(135deg,#6366f1,#06b6d4)", border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" },
  tag:  (c) => ({ fontSize:11, padding:"2px 8px", borderRadius:20, background:c+"22", color:c, border:"1px solid "+c+"44", fontWeight:600, whiteSpace:"nowrap" }),
};

const PERSON_COLORS = { Raz:"#6366f1", Olga:"#06b6d4", Both:"#10b981" };
let uid = 100; const newId = () => String(++uid);

export default function Shopping({ lang }) {
  const isRTL = lang === "he";
  const cats  = CATS[lang];

  const T = {
    title:      isRTL ? "קניות" : "Shopping",
    addItem:    isRTL ? "+ הוסף פריט" : "+ Add Item",
    quickAdd:   isRTL ? "הוספה מהירה" : "Quick Add",
    allCats:    isRTL ? "הכל" : "All",
    allPeople:  isRTL ? "כולם" : "Everyone",
    allSupers:  isRTL ? "כל הסופרים" : "All Stores",
    showDone:   isRTL ? "הצג שנקנו" : "Show Bought",
    hideDone:   isRTL ? "הסתר שנקנו" : "Hide Bought",
    clearDone:  isRTL ? "נקה שנקנו" : "Clear Bought",
    estimate:   isRTL ? "הערכת עלות" : "Est. Cost",
    pending:    isRTL ? "ממתינים" : "Pending",
    bought:     isRTL ? "נקנו" : "Bought",
    listView:   isRTL ? "רשימה" : "List",
    catView:    isRTL ? "קטגוריות" : "Categories",
    superView:  isRTL ? "לפי סופר" : "By Store",
    save:       isRTL ? "שמור" : "Save",
    itemName:   isRTL ? "שם פריט" : "Item name",
    qty:        isRTL ? "כמות" : "Qty",
    unit:       isRTL ? "יחידה" : "Unit",
    price:      isRTL ? "מחיר" : "Price",
    person:     isRTL ? "מי קונה" : "Buyer",
    category:   isRTL ? "קטגוריה" : "Category",
    store:      isRTL ? "סופר" : "Store",
    recurring:  isRTL ? "קבוע" : "Recurring",
    empty:      isRTL ? "הרשימה ריקה 🎉" : "List is empty 🎉",
    both:       isRTL ? "שניהם" : "Both",
    search:     isRTL ? "חיפוש..." : "Search...",
  };

  // ── State ──────────────────────────────────────────────────
  const [items, setItems] = useState([
    { id:"1", he:"שמן זית",    en:"Olive Oil",     cat:"dry",     qty:1, unit:"בקבוק", person:"Both", price:28, store:"rami",     done:false, recurring:true  },
    { id:"2", he:"חלב",        en:"Milk",          cat:"dairy",   qty:2, unit:"ליטר",  person:"Olga", price:9,  store:"shufersal",done:false, recurring:true  },
    { id:"3", he:"חזה עוף",    en:"Chicken Breast",cat:"meat",    qty:1, unit:"kg",    person:"Raz",  price:42, store:"rami",     done:false, recurring:false },
    { id:"4", he:"עגבניות",    en:"Tomatoes",      cat:"produce", qty:1, unit:"kg",    person:"Both", price:12, store:"shufersal",done:true,  recurring:false },
    { id:"5", he:"לחם מחמצת",  en:"Sourdough",     cat:"bakery",  qty:1, unit:"כיכר",  person:"Both", price:22, store:"machsane", done:false, recurring:true  },
    { id:"6", he:"נייר טואלט", en:"Toilet Paper",  cat:"cleaning",qty:1, unit:"חבילה", person:"Both", price:35, store:"any",      done:false, recurring:true  },
    { id:"7", he:"תות שדה",    en:"Strawberries",  cat:"produce", qty:1, unit:"קופסה", person:"Both", price:18, store:"machsane", done:false, recurring:false },
    { id:"8", he:"יוגורט",     en:"Yogurt",        cat:"dairy",   qty:3, unit:"יח",    person:"Olga", price:6,  store:"shufersal",done:false, recurring:true  },
  ]);

  const [filterCat,    setFilterCat]    = useState("all");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterSuper,  setFilterSuper]  = useState("all");
  const [showDone,     setShowDone]     = useState(false);
  const [view,         setView]         = useState("list");
  const [search,       setSearch]       = useState("");
  const [favAdded,     setFavAdded]     = useState({});
  const [form, setForm] = useState({ he:"", en:"", cat:"produce", qty:"1", unit:"", person:"Both", price:"", store:"any", recurring:false });
  const [showForm, setShowForm] = useState(false);

  // ── Derived ────────────────────────────────────────────────
  const filtered = useMemo(() => items.filter(it => {
    if (!showDone && it.done) return false;
    if (filterCat !== "all" && it.cat !== filterCat) return false;
    if (filterPerson !== "all" && it.person !== filterPerson && it.person !== "Both") return false;
    if (filterSuper !== "all" && it.store !== filterSuper && it.store !== "any") return false;
    const q = search.toLowerCase();
    if (q && !it.he.toLowerCase().includes(q) && !it.en.toLowerCase().includes(q)) return false;
    return true;
  }), [items, filterCat, filterPerson, filterSuper, showDone, search]);

  const totalEst   = useMemo(() => items.filter(i=>!i.done).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0), [items]);
  const doneCount  = items.filter(i=>i.done).length;
  const pendCount  = items.filter(i=>!i.done).length;

  const byCat = useMemo(() => {
    const m={}; filtered.forEach(i=>{ if(!m[i.cat]) m[i.cat]=[]; m[i.cat].push(i); }); return m;
  }, [filtered]);

  const bySuper = useMemo(() => {
    const m={}; filtered.forEach(i=>{ const k=i.store||"any"; if(!m[k]) m[k]=[]; m[k].push(i); }); return m;
  }, [filtered]);

  // ── Actions ────────────────────────────────────────────────
  const toggle  = (id) => setItems(p=>p.map(i=>i.id===id?{...i,done:!i.done}:i));
  const remove  = (id) => setItems(p=>p.filter(i=>i.id!==id));
  const clearDone = () => setItems(p=>p.filter(i=>!i.done));

  const addItem = () => {
    if (!form.he.trim()) return;
    setItems(p=>[...p,{...form,id:newId(),he:form.he.trim(),en:form.en.trim()||form.he.trim(),qty:parseFloat(form.qty)||1,price:parseFloat(form.price)||0,done:false}]);
    setForm({he:"",en:"",cat:"produce",qty:"1",unit:"",person:"Both",price:"",store:"any",recurring:false});
    setShowForm(false);
  };

  const addFav = (fav) => {
    setItems(p=>[...p,{id:newId(),he:fav.he,en:fav.en,cat:fav.cat,qty:1,unit:"",person:"Both",price:0,store:"any",done:false,recurring:false}]);
    setFavAdded(p=>({...p,[fav.id]:true}));
    setTimeout(()=>setFavAdded(p=>({...p,[fav.id]:false})),1500);
  };

  // ── Helpers ────────────────────────────────────────────────
  const catLabel  = (id) => cats.find(c=>c.id===id)?.label || id;
  const catIcon   = (id) => cats.find(c=>c.id===id)?.icon  || "📦";
  const superInfo = (id) => SUPERS.find(s=>s.id===id) || SUPERS[0];
  const pLabel    = (p)  => isRTL ? (p==="Both"?"שניהם":p) : (p==="שניהם"?"Both":p);

  // ── Item Row ───────────────────────────────────────────────
  const ItemRow = ({ it }) => {
    const sup = superInfo(it.store);
    return (
      <div style={{
        display:"flex", alignItems:"center",
        flexDirection:isRTL?"row-reverse":"row",
        gap:10, padding:"11px 14px", borderRadius:12,
        background:it.done?"rgba(16,185,129,0.05)":"rgba(255,255,255,0.03)",
        border:it.done?"1px solid rgba(16,185,129,0.15)":"1px solid rgba(255,255,255,0.07)",
        marginBottom:7, transition:"all .15s",
      }}>
        {/* Checkbox */}
        <div onClick={()=>toggle(it.id)} style={{
          width:22,height:22,borderRadius:7,flexShrink:0,
          background:it.done?"#10b981":"transparent",
          border:it.done?"2px solid #10b981":"2px solid rgba(255,255,255,0.2)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:12,color:"#fff",cursor:"pointer",
        }}>{it.done?"✓":""}</div>

        {/* Cat icon */}
        <span style={{fontSize:16,flexShrink:0}}>{catIcon(it.cat)}</span>

        {/* Name */}
        <div style={{flex:1,textAlign:isRTL?"right":"left"}}>
          <div style={{fontSize:14,fontWeight:600,textDecoration:it.done?"line-through":"none",color:it.done?"#4b5563":"#e8eaf0"}}>
            {isRTL?it.he:it.en}
          </div>
          <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap",justifyContent:isRTL?"flex-end":"flex-start"}}>
            <span style={S.tag("#6b7280")}>{catLabel(it.cat)}</span>
            {it.recurring&&<span style={S.tag("#f59e0b")}>🔄</span>}
          </div>
        </div>

        {/* Qty */}
        <div style={{fontSize:13,fontWeight:700,color:"#a5b4fc",flexShrink:0,textAlign:"center"}}>
          {it.qty}{it.unit?" "+it.unit:""}
          {it.price>0&&<div style={{fontSize:10,color:"#6b7280"}}>&#8362;{it.price}</div>}
        </div>

        {/* Store badge */}
        <div style={{...S.tag("#6b7280"),flexShrink:0}}>{sup.icon} {isRTL?sup.he:sup.en}</div>

        {/* Person */}
        <div style={{...S.tag(PERSON_COLORS[it.person]||"#10b981"),flexShrink:0}}>{pLabel(it.person)}</div>

        {/* Delete */}
        <button onClick={()=>remove(it.id)} style={{background:"none",border:"none",color:"#374151",cursor:"pointer",fontSize:15,padding:"0 2px",flexShrink:0}}>✕</button>
      </div>
    );
  };

  // ── Pill button ────────────────────────────────────────────
  const Pill = ({active, onClick, children}) => (
    <button onClick={onClick} style={{
      background:active?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.04)",
      border:active?"1px solid rgba(99,102,241,0.4)":"1px solid rgba(255,255,255,0.08)",
      borderRadius:20,padding:"5px 13px",color:active?"#a5b4fc":"#6b7280",
      fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",
    }}>{children}</button>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'Outfit',sans-serif",color:"#e8eaf0",direction:isRTL?"rtl":"ltr",minHeight:"100vh",background:"#0f1117"}}>

      {/* Header */}
      <div style={{background:"rgba(17,19,30,0.95)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#06b6d4,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🛒</div>
          <div>
            <div style={{fontSize:19,fontWeight:800}}>{T.title}</div>
            <div style={{fontSize:11,color:"#6b7280"}}>{pendCount} {T.pending} · {doneCount} {T.bought}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{...S.card,padding:"8px 16px",textAlign:"center",minWidth:90}}>
            <div style={{fontSize:10,color:"#6b7280"}}>{T.estimate}</div>
            <div style={{fontSize:18,fontWeight:800,color:"#10b981"}}>&#8362;{totalEst}</div>
          </div>
          <button onClick={()=>setShowForm(!showForm)} style={S.btn}>{T.addItem}</button>
        </div>
      </div>

      <div style={{padding:"18px 22px",maxWidth:920,margin:"0 auto"}}>

        {/* Quick add */}
        <div style={{...S.card,marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:"#a5b4fc",marginBottom:12}}>⚡ {T.quickAdd}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:7}}>
            {FAVS.map(fav=>(
              <button key={fav.id} onClick={()=>addFav(fav)} style={{
                background:favAdded[fav.id]?"rgba(16,185,129,0.15)":"rgba(255,255,255,0.04)",
                border:favAdded[fav.id]?"1px solid rgba(16,185,129,0.3)":"1px solid rgba(255,255,255,0.08)",
                borderRadius:11,padding:"9px 4px",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .2s",
              }}>
                <span style={{fontSize:18}}>{favAdded[fav.id]?"✓":fav.icon}</span>
                <span style={{fontSize:9,color:favAdded[fav.id]?"#6ee7b7":"#9ca3af",fontWeight:500}}>
                  {isRTL?fav.he:fav.en}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Add form */}
        {showForm&&(
          <div style={{...S.card,marginBottom:18,borderColor:"rgba(99,102,241,0.3)"}}>
            {/* Row 1 */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.itemName} (עברית)</div>
                <input value={form.he} onChange={e=>setForm({...form,he:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder="לדוגמה: תפוחים" style={S.inp}/>
              </div>
              <div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.qty}</div>
                <input type="number" min="0.1" step="0.5" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} style={S.inp}/>
              </div>
              <div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.unit}</div>
                <input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} placeholder="kg / יח..." style={S.inp}/>
              </div>
              <div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.price} &#8362;</div>
                <input type="number" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="0" style={S.inp}/>
              </div>
            </div>
            {/* Row 2 */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:10,alignItems:"end"}}>
              <div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.category}</div>
                <select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={{...S.inp,appearance:"none"}}>
                  {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.store}</div>
                <select value={form.store} onChange={e=>setForm({...form,store:e.target.value})} style={{...S.inp,appearance:"none"}}>
                  {SUPERS.map(s=><option key={s.id} value={s.id}>{s.icon} {isRTL?s.he:s.en}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{T.person}</div>
                <select value={form.person} onChange={e=>setForm({...form,person:e.target.value})} style={{...S.inp,appearance:"none"}}>
                  {["Raz","Olga",T.both].map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,paddingBottom:2}}>
                <input type="checkbox" id="rec" checked={form.recurring} onChange={e=>setForm({...form,recurring:e.target.checked})} style={{width:15,height:15,accentColor:"#6366f1"}}/>
                <label htmlFor="rec" style={{fontSize:12,color:"#9ca3af",cursor:"pointer"}}>{T.recurring}</label>
              </div>
              <button onClick={addItem} style={S.btn}>{T.save}</button>
            </div>
          </div>
        )}

        {/* Filters bar */}
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          {/* Search */}
          <div style={{position:"relative",flex:"1 1 160px"}}>
            <span style={{position:"absolute",[isRTL?"right":"left"]:10,top:"50%",transform:"translateY(-50%)",color:"#6b7280",fontSize:13}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={T.search}
              style={{...S.inp,[isRTL?"paddingRight":"paddingLeft"]:32}}/>
          </div>
          {/* Person filter */}
          <div style={{display:"flex",gap:5}}>
            {[{k:"all",l:T.allPeople},{k:"Raz",l:"Raz"},{k:"Olga",l:"Olga"}].map(({k,l})=>(
              <Pill key={k} active={filterPerson===k} onClick={()=>setFilterPerson(k)}>{l}</Pill>
            ))}
          </div>
          {/* View tabs */}
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3}}>
            {[{v:"list",l:"≡ "+T.listView},{v:"category",l:"⊞ "+T.catView},{v:"store",l:"🏪 "+T.superView}].map(({v,l})=>(
              <button key={v} onClick={()=>setView(v)} style={{background:view===v?"rgba(99,102,241,0.3)":"transparent",border:"none",borderRadius:8,padding:"5px 10px",color:view===v?"#a5b4fc":"#6b7280",fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          {/* Done controls */}
          <div style={{display:"flex",gap:5}}>
            <Pill active={showDone} onClick={()=>setShowDone(!showDone)}>{showDone?T.hideDone:T.showDone}</Pill>
            {doneCount>0&&<button onClick={clearDone} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:20,padding:"5px 12px",color:"#fca5a5",fontSize:12,cursor:"pointer"}}>{T.clearDone}</button>}
          </div>
        </div>

        {/* Category filter pills */}
        <div style={{display:"flex",gap:5,marginBottom:16,overflowX:"auto",paddingBottom:3}}>
          <Pill active={filterCat==="all"} onClick={()=>setFilterCat("all")}>{T.allCats}</Pill>
          {cats.map(c=><Pill key={c.id} active={filterCat===c.id} onClick={()=>setFilterCat(c.id)}>{c.icon} {c.label}</Pill>)}
        </div>

        {/* Store filter pills — shown in store view */}
        {view==="store"&&(
          <div style={{display:"flex",gap:5,marginBottom:14,overflowX:"auto",paddingBottom:3}}>
            <Pill active={filterSuper==="all"} onClick={()=>setFilterSuper("all")}>{T.allSupers}</Pill>
            {SUPERS.filter(s=>s.id!=="any").map(s=>(
              <Pill key={s.id} active={filterSuper===s.id} onClick={()=>setFilterSuper(s.id)}>{s.icon} {isRTL?s.he:s.en}</Pill>
            ))}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {view==="list"&&(
          filtered.length===0
            ? <div style={{...S.card,textAlign:"center",padding:40,color:"#6b7280"}}><div style={{fontSize:36,marginBottom:10}}>🎉</div>{T.empty}</div>
            : filtered.map(it=><ItemRow key={it.id} it={it}/>)
        )}

        {/* ── CATEGORY VIEW ── */}
        {view==="category"&&cats.map(cat=>{
          const ci=byCat[cat.id];
          if(!ci||!ci.length) return null;
          return(
            <div key={cat.id} style={{marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexDirection:isRTL?"row-reverse":"row"}}>
                <span style={{fontSize:18}}>{cat.icon}</span>
                <span style={{fontSize:14,fontWeight:700}}>{cat.label}</span>
                <span style={{...S.tag("#6b7280")}}>{ci.length}</span>
              </div>
              {ci.map(it=><ItemRow key={it.id} it={it}/>)}
            </div>
          );
        })}

        {/* ── STORE VIEW ── */}
        {view==="store"&&SUPERS.map(sup=>{
          const si=bySuper[sup.id];
          if(!si||!si.length) return null;
          return(
            <div key={sup.id} style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexDirection:isRTL?"row-reverse":"row"}}>
                <span style={{fontSize:20}}>{sup.icon}</span>
                <span style={{fontSize:15,fontWeight:700}}>{isRTL?sup.he:sup.en}</span>
                <span style={{...S.tag("#6b7280")}}>{si.length} פריטים</span>
                <span style={{...S.tag("#10b981")}}>&#8362;{si.filter(i=>!i.done).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0)}</span>
              </div>
              {si.map(it=><ItemRow key={it.id} it={it}/>)}
            </div>
          );
        })}

        {/* Progress bar */}
        {items.length>0&&(
          <div style={{...S.card,marginTop:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12,color:"#6b7280"}}>
              <span>{doneCount} / {items.length} {isRTL?"נקנו":"bought"}</span>
              <span>{Math.round((doneCount/items.length)*100)}%</span>
            </div>
            <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3}}>
              <div style={{height:"100%",background:"linear-gradient(to right,#10b981,#06b6d4)",borderRadius:3,width:Math.round((doneCount/items.length)*100)+"%",transition:"width .4s"}}/>
            </div>
          </div>
        )}

      </div>
    </div>
  );
      }
