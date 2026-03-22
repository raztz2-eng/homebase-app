import { useState, useMemo } from "react";

// ── Categories ────────────────────────────────────────────────
const CATS = {
  he: [
    { id:"produce",   label:"ירקות ופירות", icon:"🥦" },
    { id:"dairy",     label:"מוצרי חלב",    icon:"🥛" },
    { id:"meat",      label:"בשר ודגים",    icon:"🥩" },
    { id:"bakery",    label:"לחם ומאפים",   icon:"🍞" },
    { id:"dry",       label:"יבשים ושימורים", icon:"🫙" },
    { id:"cleaning",  label:"ניקיון",       icon:"🧹" },
    { id:"hygiene",   label:"היגיינה",      icon:"🧴" },
    { id:"snacks",    label:"חטיפים ומשקאות", icon:"🍿" },
    { id:"other",     label:"אחר",          icon:"📦" },
  ],
  en: [
    { id:"produce",   label:"Produce",      icon:"🥦" },
    { id:"dairy",     label:"Dairy",        icon:"🥛" },
    { id:"meat",      label:"Meat & Fish",  icon:"🥩" },
    { id:"bakery",    label:"Bakery",       icon:"🍞" },
    { id:"dry",       label:"Dry & Canned", icon:"🫙" },
    { id:"cleaning",  label:"Cleaning",     icon:"🧹" },
    { id:"hygiene",   label:"Hygiene",      icon:"🧴" },
    { id:"snacks",    label:"Snacks & Drinks", icon:"🍿" },
    { id:"other",     label:"Other",        icon:"📦" },
  ],
};

// ── Quick-add favourites ───────────────────────────────────────
const FAVOURITES_DEFAULT = [
  { id:"f1", name:"חלב", nameEn:"Milk",     icon:"🥛", cat:"dairy"   },
  { id:"f2", name:"לחם", nameEn:"Bread",    icon:"🍞", cat:"bakery"  },
  { id:"f3", name:"ביצים", nameEn:"Eggs",   icon:"🥚", cat:"dairy"   },
  { id:"f4", name:"עגבניות", nameEn:"Tomatoes", icon:"🍅", cat:"produce" },
  { id:"f5", name:"עוף", nameEn:"Chicken",  icon:"🍗", cat:"meat"    },
  { id:"f6", name:"קפה", nameEn:"Coffee",   icon:"☕", cat:"dry"     },
  { id:"f7", name:"בננות", nameEn:"Bananas",icon:"🍌", cat:"produce" },
  { id:"f8", name:"גבינה", nameEn:"Cheese", icon:"🧀", cat:"dairy"   },
];

// ── Styles ────────────────────────────────────────────────────
const S = {
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 },
  inp:  { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"9px 12px", color:"#e8eaf0", fontSize:14, width:"100%", outline:"none", boxSizing:"border-box" },
  btn:  { background:"linear-gradient(135deg,#6366f1,#06b6d4)", border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" },
  tag:  (c) => ({ fontSize:11, padding:"2px 8px", borderRadius:20, background:c+"22", color:c, border:"1px solid "+c+"44", fontWeight:600 }),
};

const PERSON_COLORS = { Raz:"#6366f1", Olga:"#06b6d4", Both:"#10b981", שניהם:"#10b981" };

let nextId = 100;
const uid = () => String(++nextId);

export default function Shopping({ lang }) {
  const isRTL = lang === "he";
  const cats  = CATS[lang];

  // ── State ──────────────────────────────────────────────────
  const [items, setItems] = useState([
    { id:"1", name:"שמן זית",      nameEn:"Olive Oil",    cat:"dry",     qty:1, unit:"בקבוק", person:"Both",   price:28,  done:false, recurring:true  },
    { id:"2", name:"חלב",          nameEn:"Milk",         cat:"dairy",   qty:2, unit:"ליטר",  person:"Olga",  price:9,   done:false, recurring:true  },
    { id:"3", name:"חזה עוף",      nameEn:"Chicken Breast",cat:"meat",   qty:1, unit:"ק"ג", person:"Raz",   price:42,  done:false, recurring:false },
    { id:"4", name:"עגבניות",      nameEn:"Tomatoes",     cat:"produce", qty:1, unit:"ק"ג", person:"Both",   price:12,  done:true,  recurring:false },
    { id:"5", name:"לחם מחמצת",    nameEn:"Sourdough",    cat:"bakery",  qty:1, unit:"כיכר", person:"Both",   price:22,  done:false, recurring:true  },
    { id:"6", name:"נייר טואלט",   nameEn:"Toilet Paper", cat:"cleaning",qty:1, unit:"חבילה",person:"Both",   price:35,  done:false, recurring:true  },
  ]);

  const [filterCat,   setFilterCat]   = useState("all");
  const [filterPerson,setFilterPerson] = useState("all");
  const [showDone,    setShowDone]     = useState(false);
  const [view,        setView]         = useState("list"); // list | category
  const [search,      setSearch]       = useState("");
  const [favAdded,    setFavAdded]     = useState({});

  // New item form
  const [form, setForm] = useState({ name:"", cat:"produce", qty:"1", unit:"", person:"Both", price:"", recurring:false });
  const [showForm, setShowForm] = useState(false);

  // ── Derived ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return items.filter(it => {
      if (!showDone && it.done) return false;
      if (filterCat !== "all" && it.cat !== filterCat) return false;
      if (filterPerson !== "all" && it.person !== filterPerson && it.person !== "Both" && it.person !== "שניהם") return false;
      const q = search.toLowerCase();
      if (q && !it.name.toLowerCase().includes(q) && !it.nameEn.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filterCat, filterPerson, showDone, search]);

  const totalEstimate = useMemo(() =>
    items.filter(it => !it.done).reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0)
  , [items]);

  const doneCount = items.filter(it => it.done).length;
  const pendingCount = items.filter(it => !it.done).length;

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach(it => {
      if (!map[it.cat]) map[it.cat] = [];
      map[it.cat].push(it);
    });
    return map;
  }, [filtered]);

  // ── Actions ────────────────────────────────────────────────
  const toggleDone = (id) => setItems(p => p.map(it => it.id===id ? {...it, done:!it.done} : it));
  const removeItem = (id) => setItems(p => p.filter(it => it.id!==id));

  const addItem = () => {
    if (!form.name.trim()) return;
    setItems(p => [...p, {
      id: uid(),
      name: form.name.trim(),
      nameEn: form.name.trim(),
      cat: form.cat,
      qty: parseFloat(form.qty) || 1,
      unit: form.unit,
      person: form.person,
      price: parseFloat(form.price) || 0,
      done: false,
      recurring: form.recurring,
    }]);
    setForm({ name:"", cat:"produce", qty:"1", unit:"", person:"Both", price:"", recurring:false });
    setShowForm(false);
  };

  const addFavourite = (fav) => {
    const name = lang==="he" ? fav.name : fav.nameEn;
    setItems(p => [...p, { id:uid(), name:fav.name, nameEn:fav.nameEn, cat:fav.cat, qty:1, unit:"", person:"Both", price:0, done:false, recurring:false }]);
    setFavAdded(p => ({...p, [fav.id]:true}));
    setTimeout(() => setFavAdded(p => ({...p, [fav.id]:false})), 1500);
  };

  const clearDone = () => setItems(p => p.filter(it => !it.done));

  // ── Helpers ────────────────────────────────────────────────
  const catLabel = (id) => cats.find(c=>c.id===id)?.label || id;
  const catIcon  = (id) => cats.find(c=>c.id===id)?.icon  || "📦";
  const personLabel = (p) => lang==="he" ? (p==="Both"?"שניהם":p) : (p==="שניהם"?"Both":p);

  const T = {
    title:       lang==="he" ? "קניות" : "Shopping",
    search:      lang==="he" ? "חיפוש פריט..." : "Search item...",
    addItem:     lang==="he" ? "+ הוסף פריט" : "+ Add Item",
    quickAdd:    lang==="he" ? "הוספה מהירה" : "Quick Add",
    allCats:     lang==="he" ? "הכל" : "All",
    allPeople:   lang==="he" ? "כולם" : "Everyone",
    showDone:    lang==="he" ? "הצג שנקנו" : "Show Bought",
    hideDone:    lang==="he" ? "הסתר שנקנו" : "Hide Bought",
    clearDone:   lang==="he" ? "נקה שנקנו" : "Clear Bought",
    estimate:    lang==="he" ? "הערכת עלות" : "Est. Cost",
    pending:     lang==="he" ? "ממתינים" : "Pending",
    bought:      lang==="he" ? "נקנו" : "Bought",
    listView:    lang==="he" ? "רשימה" : "List",
    catView:     lang==="he" ? "קטגוריות" : "Categories",
    save:        lang==="he" ? "שמור" : "Save",
    itemName:    lang==="he" ? "שם פריט" : "Item name",
    qty:         lang==="he" ? "כמות" : "Qty",
    unit:        lang==="he" ? "יחידה" : "Unit",
    price:       lang==="he" ? "מחיר" : "Price",
    person:      lang==="he" ? "מי קונה" : "Buyer",
    category:    lang==="he" ? "קטגוריה" : "Category",
    recurring:   lang==="he" ? "מחזורי" : "Recurring",
    empty:       lang==="he" ? "הרשימה ריקה! הוסף פריטים 🎉" : "List is empty! Add items 🎉",
    both:        lang==="he" ? "שניהם" : "Both",
  };

  // ── Item Row Component ─────────────────────────────────────
  const ItemRow = ({ it }) => (
    <div style={{
      display:"flex", alignItems:"center",
      flexDirection: isRTL ? "row-reverse" : "row",
      gap:12, padding:"12px 16px", borderRadius:12,
      background: it.done ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.03)",
      border: it.done ? "1px solid rgba(16,185,129,0.15)" : "1px solid rgba(255,255,255,0.07)",
      marginBottom:8, transition:"all .15s",
    }}>
      {/* Checkbox */}
      <div onClick={()=>toggleDone(it.id)} style={{
        width:22, height:22, borderRadius:7, flexShrink:0,
        background: it.done ? "#10b981" : "transparent",
        border: it.done ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:12, color:"#fff", cursor:"pointer",
      }}>{it.done ? "✓" : ""}</div>

      {/* Category icon */}
      <span style={{fontSize:18, flexShrink:0}}>{catIcon(it.cat)}</span>

      {/* Name + meta */}
      <div style={{flex:1, textAlign: isRTL ? "right" : "left"}}>
        <div style={{
          fontSize:14, fontWeight:600,
          textDecoration: it.done ? "line-through" : "none",
          color: it.done ? "#4b5563" : "#e8eaf0",
        }}>{lang==="he" ? it.name : it.nameEn}</div>
        <div style={{display:"flex", gap:6, marginTop:4, flexWrap:"wrap", justifyContent: isRTL ? "flex-end" : "flex-start"}}>
          <span style={S.tag("#6b7280")}>{catLabel(it.cat)}</span>
          {it.recurring && <span style={S.tag("#f59e0b")}>🔄</span>}
        </div>
      </div>

      {/* Qty + price */}
      <div style={{textAlign:"center", flexShrink:0}}>
        <div style={{fontSize:13, fontWeight:700, color:"#a5b4fc"}}>{it.qty} {it.unit}</div>
        {it.price > 0 && <div style={{fontSize:11, color:"#6b7280"}}>&#8362;{it.price}</div>}
      </div>

      {/* Person badge */}
      <div style={S.tag(PERSON_COLORS[it.person] || PERSON_COLORS["Both"])}>{personLabel(it.person)}</div>

      {/* Delete */}
      <button onClick={()=>removeItem(it.id)} style={{background:"none", border:"none", color:"#4b5563", cursor:"pointer", fontSize:16, padding:"0 4px", flexShrink:0}}>✕</button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'Outfit',sans-serif", color:"#e8eaf0", direction: isRTL?"rtl":"ltr", minHeight:"100vh", background:"#0f1117"}}>

      {/* Header */}
      <div style={{background:"rgba(17,19,30,0.95)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div style={{display:"flex", alignItems:"center", gap:14}}>
          <div style={{width:46, height:46, borderRadius:14, background:"linear-gradient(135deg,#06b6d4,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22}}>🛒</div>
          <div>
            <div style={{fontSize:20, fontWeight:800}}>{T.title}</div>
            <div style={{fontSize:12, color:"#6b7280"}}>{pendingCount} {T.pending} · {doneCount} {T.bought}</div>
          </div>
        </div>
        {/* Stats */}
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <div style={{...S.card, padding:"10px 18px", textAlign:"center"}}>
            <div style={{fontSize:11, color:"#6b7280"}}>{T.estimate}</div>
            <div style={{fontSize:20, fontWeight:800, color:"#10b981"}}>&#8362;{totalEstimate}</div>
          </div>
          <button onClick={()=>setShowForm(!showForm)} style={S.btn}>{T.addItem}</button>
        </div>
      </div>

      <div style={{padding:"20px 24px", maxWidth:900, margin:"0 auto"}}>

        {/* Quick add favourites */}
        <div style={{...S.card, marginBottom:20}}>
          <div style={{fontSize:13, fontWeight:700, color:"#a5b4fc", marginBottom:14}}>{T.quickAdd} ⚡</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:8}}>
            {FAVOURITES_DEFAULT.map(fav => (
              <button key={fav.id} onClick={()=>addFavourite(fav)} style={{
                background: favAdded[fav.id] ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                border: favAdded[fav.id] ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius:12, padding:"10px 6px", cursor:"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", gap:4, transition:"all .2s",
              }}>
                <span style={{fontSize:20}}>{favAdded[fav.id] ? "✓" : fav.icon}</span>
                <span style={{fontSize:10, color: favAdded[fav.id] ? "#6ee7b7" : "#9ca3af", fontWeight:500}}>
                  {lang==="he" ? fav.name : fav.nameEn}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Add item form */}
        {showForm && (
          <div style={{...S.card, marginBottom:20, borderColor:"rgba(99,102,241,0.3)"}}>
            <div style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:10, marginBottom:10}}>
              <div>
                <div style={{fontSize:11, color:"#6b7280", marginBottom:4}}>{T.itemName}</div>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder={T.itemName} style={S.inp}/>
              </div>
              <div>
                <div style={{fontSize:11, color:"#6b7280", marginBottom:4}}>{T.qty}</div>
                <input type="number" min="0.1" step="0.1" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} style={S.inp}/>
              </div>
              <div>
                <div style={{fontSize:11, color:"#6b7280", marginBottom:4}}>{T.unit}</div>
                <input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} placeholder={lang==="he"?"יח'":"pcs"} style={S.inp}/>
              </div>
              <div>
                <div style={{fontSize:11, color:"#6b7280", marginBottom:4}}>{T.price} (&#8362;)</div>
                <input type="number" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="0" style={S.inp}/>
              </div>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr auto", gap:10, alignItems:"end"}}>
              <div>
                <div style={{fontSize:11, color:"#6b7280", marginBottom:4}}>{T.category}</div>
                <select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} style={{...S.inp, appearance:"none"}}>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:11, color:"#6b7280", marginBottom:4}}>{T.person}</div>
                <select value={form.person} onChange={e=>setForm({...form,person:e.target.value})} style={{...S.inp, appearance:"none"}}>
                  {["Raz","Olga",T.both].map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8, paddingBottom:2}}>
                <input type="checkbox" id="rec" checked={form.recurring} onChange={e=>setForm({...form,recurring:e.target.checked})} style={{width:16,height:16,accentColor:"#6366f1"}}/>
                <label htmlFor="rec" style={{fontSize:13, color:"#9ca3af", cursor:"pointer"}}>{T.recurring}</label>
              </div>
              <button onClick={addItem} style={S.btn}>{T.save}</button>
            </div>
          </div>
        )}

        {/* Filters + view toggle */}
        <div style={{display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", justifyContent:"space-between", alignItems:"center"}}>
          {/* Search */}
          <div style={{position:"relative", flex:1, minWidth:180}}>
            <span style={{position:"absolute", [isRTL?"right":"left"]:12, top:"50%", transform:"translateY(-50%)", color:"#6b7280"}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={T.search} style={{...S.inp, [isRTL?"paddingRight":"paddingLeft"]:36}}/>
          </div>

          {/* Person filter */}
          <div style={{display:"flex", gap:6}}>
            {[{k:"all",l:T.allPeople},{k:"Raz",l:"Raz"},{k:"Olga",l:"Olga"}].map(({k,l})=>(
              <button key={k} onClick={()=>setFilterPerson(k)} style={{
                background: filterPerson===k ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                border: filterPerson===k ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius:8, padding:"6px 14px", color: filterPerson===k ? "#a5b4fc" : "#6b7280",
                fontSize:12, fontWeight:600, cursor:"pointer",
              }}>{l}</button>
            ))}
          </div>

          {/* View toggle */}
          <div style={{display:"flex", gap:4, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:3}}>
            {[{v:"list",l:"≡ "+T.listView},{v:"category",l:"⊞ "+T.catView}].map(({v,l})=>(
              <button key={v} onClick={()=>setView(v)} style={{
                background: view===v ? "rgba(99,102,241,0.3)" : "transparent",
                border:"none", borderRadius:8, padding:"5px 12px",
                color: view===v ? "#a5b4fc" : "#6b7280", fontSize:12, fontWeight:600, cursor:"pointer",
              }}>{l}</button>
            ))}
          </div>

          {/* Done toggle + clear */}
          <div style={{display:"flex", gap:6}}>
            <button onClick={()=>setShowDone(!showDone)} style={{
              background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:8, padding:"6px 12px", color:"#9ca3af", fontSize:12, cursor:"pointer",
            }}>{showDone ? T.hideDone : T.showDone}</button>
            {doneCount > 0 && (
              <button onClick={clearDone} style={{
                background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
                borderRadius:8, padding:"6px 12px", color:"#fca5a5", fontSize:12, cursor:"pointer",
              }}>{T.clearDone}</button>
            )}
          </div>
        </div>

        {/* Category filter pills */}
        <div style={{display:"flex", gap:6, marginBottom:18, overflowX:"auto", paddingBottom:4}}>
          <button onClick={()=>setFilterCat("all")} style={{
            background: filterCat==="all" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
            border: filterCat==="all" ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
            borderRadius:20, padding:"5px 14px", color: filterCat==="all" ? "#a5b4fc" : "#6b7280",
            fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
          }}>{T.allCats}</button>
          {cats.map(c => (
            <button key={c.id} onClick={()=>setFilterCat(c.id)} style={{
              background: filterCat===c.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
              border: filterCat===c.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius:20, padding:"5px 14px", color: filterCat===c.id ? "#a5b4fc" : "#6b7280",
              fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
            }}>{c.icon} {c.label}</button>
          ))}
        </div>

        {/* List view */}
        {view==="list" && (
          <div>
            {filtered.length === 0 ? (
              <div style={{...S.card, textAlign:"center", padding:40, color:"#6b7280"}}>
                <div style={{fontSize:40, marginBottom:12}}>🎉</div>
                {T.empty}
              </div>
            ) : (
              filtered.map(it => <ItemRow key={it.id} it={it}/>)
            )}
          </div>
        )}

        {/* Category view */}
        {view==="category" && (
          <div>
            {cats.map(cat => {
              const catItems = byCategory[cat.id];
              if (!catItems || catItems.length === 0) return null;
              return (
                <div key={cat.id} style={{marginBottom:20}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:10, flexDirection: isRTL?"row-reverse":"row"}}>
                    <span style={{fontSize:20}}>{cat.icon}</span>
                    <span style={{fontSize:15, fontWeight:700}}>{cat.label}</span>
                    <span style={{...S.tag("#6b7280"), marginRight:"auto"}}>{catItems.length}</span>
                  </div>
                  {catItems.map(it => <ItemRow key={it.id} it={it}/>)}
                </div>
              );
            })}
          </div>
        )}

        {/* Progress bar */}
        {items.length > 0 && (
          <div style={{...S.card, marginTop:20}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:12, color:"#6b7280"}}>
              <span>{doneCount} / {items.length} {lang==="he" ? "נקנו" : "bought"}</span>
              <span>{Math.round((doneCount/items.length)*100)}%</span>
            </div>
            <div style={{height:6, background:"rgba(255,255,255,0.06)", borderRadius:3}}>
              <div style={{height:"100%", background:"linear-gradient(to right,#10b981,#06b6d4)", borderRadius:3, width:Math.round((doneCount/items.length)*100)+"%", transition:"width .4s"}}/>
            </div>
          </div>
        )}

      </div>
    </div>
  );
      }
