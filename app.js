
const h=(t,a={},...c)=>{const e=document.createElement(t);for(const k in a){if(k==='on')for(const v in a.on)e.addEventListener(v,a.on[v]);else if(k==='class')e.className=a[k];else if(k==='value')e.value=a[k];else e.setAttribute(k,a[k])}for(const x of c.flat())if(x!=null&&x!==false)e.append(x);return e};
const fa=n=>Number(n).toLocaleString(LOC());
let cfg={};
let books=[],about=[],lib=false,abt=false,bcat='همه',bq='',atab='app';
let madrasas=[],scholars=[],admins=[],users=[],isAdmin=false,adm=false;
const PREVIEW=false;let mode='user',adminsLoaded=false,usersSub=false;try{mode=localStorage.getItem('mode');if(mode!=='admin'&&mode!=='user')mode='user'}catch(e){}
let db,user,me,groups=[],members=[],posts=[],names={},cur=null,form=false,msg='',tab='st',day=0,tools=false,loc=null;try{loc=JSON.parse(localStorage.getItem('loc')||'null')}catch(e){}
const KINDS=['تعلیم','گشت','بیان','ذکر','خدمت و آشپزی','نماز جماعت','سایر'];
async function loadNames(){try{const ids=[...new Set([...members.map(m=>m.uid),...posts.map(p=>p.by),...crevs.map(r=>r.by),...groups.flatMap(g=>[g.alim,g.amir]),...scholars.map(x=>x.id)])].filter(i=>i&&!names[i]);if(ids.length){const p=await user.profiles(ids);ids.forEach(i=>names[i]=(p[i]&&p[i].name)||'عضو')}}catch(e){}render()}
function ensureUsers(){if(isAdmin&&!usersSub&&db){usersSub=true;db.collection('users').onSnapshot(s=>{users=s.docs.map(d=>({id:d.id,name:d.data().name}));users.forEach(u=>names[u.id]=u.name||'عضو');render()},()=>{usersSub=false})}}
function setMode(m){mode=m;try{m?localStorage.setItem('mode',m):localStorage.removeItem('mode')}catch(e){}isAdmin=m==='admin'&&admins.includes(me);ensureUsers();adm=false;render()}
const MODES={full:'حضور مداوم',flex:'انعطاف‌پذیر (رفت‌وآمد)'};
async function start(){
   user = window.__A && window.__A.user ? window.__A.user : { id: async () => 'guest', profiles: async () => ({}) };
  db = window.__A && window.__A.db ? window.__A.db : null;
  
  if(!db) {
    // اگر دیتابیس نبود، برنامه را در حالت مهمان (بدون خطا) اجرا کن
    me = 'guest';
    isAdmin = false;
    render();
    return;
  }
  try{const nt=localStorage.getItem('note');if(nt){msg=nt;localStorage.removeItem('note')}}catch(e){}
  try{me=await user.id()}catch(e){}
  const err=()=>{msg='خطا در ارتباط با سرور';render()};
  db.collection('groups').onSnapshot(s=>{groups=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.created||0)-(a.created||0));loadNames()},err);
  db.collection('madrasas').onSnapshot(s=>{madrasas=s.docs.map(d=>({id:d.id,...d.data()}));render()},err);
  db.collection('scholars').onSnapshot(s=>{scholars=s.docs.map(d=>({id:d.id,...d.data()}));loadNames()},err);
  db.collection('admins').onSnapshot(s=>{admins=s.docs.map(d=>d.id);adminsLoaded=true;isAdmin=mode==='admin'&&admins.includes(me);ensureUsers();render()},err);
  db.collection('events').onSnapshot(s=>{events=s.docs.map(d=>({id:d.id,...d.data()}));render()},err);
  db.collection('rsvps').onSnapshot(s=>{rsvps=s.docs.map(d=>({id:d.id,...d.data()}));render()},err);
  db.collection('adab').onSnapshot(s=>{adabX=s.docs.map(d=>({id:d.id,...d.data()}));render()},err);
  db.collection('centers').onSnapshot(s=>{centers=s.docs.map(d=>({id:d.id,...d.data()}));render()},err);
  db.collection('center_revs').onSnapshot(s=>{crevs=s.docs.map(d=>({id:d.id,...d.data()}));render()},err);
  db.collection('settings').onSnapshot(s=>{cfg={};s.docs.forEach(d=>cfg[d.id]=(d.data()||{}).text||'');render()},err);
  db.collection('books').onSnapshot(s=>{books=s.docs.map(d=>({id:d.id,...d.data()}));render()},err);
  db.collection('about').onSnapshot(s=>{about=s.docs.map(d=>({id:d.id,...d.data()}));render()},err);
  db.collection('members').onSnapshot(s=>{members=s.docs.map(d=>({id:d.id,...d.data()}));loadNames()},err);
  db.collection('posts').onSnapshot(s=>{posts=s.docs.map(d=>({id:d.id,...d.data()}));loadNames()},err);
}
const mem=g=>members.filter(m=>m.gid===g);
const mine=g=>members.find(m=>m.id===g+'_'+me);
function render(){render0();trDom(document.getElementById('app'))}
function render0(){
  const app=document.getElementById('app');app.replaceChildren();
  app.append(h('div',{class:'row',style:'justify-content:space-between'},h('h1',{},'همسفر'),h('div',{class:'row'},h('button',{class:'g',on:{click:()=>{langOpen=true;render()}}},'🌐 '+curLang()),h('button',{class:'g',on:{click:()=>{menu=!menu;render()}}},'☰ منو'))),h('div',{class:'mu'},'هماهنگی گروه‌های خروج با امکان رفت‌وآمد اعضا'),isAdmin?h('span',{class:'b out'},'🛡 حالت ادمین'):null,isF()?h('span',{class:'b in'},'🧕 حالت خواهران'):null);
  if(menu)app.append(menuView());
  if(!db||!user){app.append(h('div',{class:'card'},'برای استفاده باید وارد حساب شوید و صفحه را از طریق لینک اشتراکی باز کنید.'));return}
  if(msg)app.append(h('div',{class:'bar low'},msg));
  if(langOpen)return langView(app);
  if(regOpen)return regView(app);
  if(adl)return admLoginView(app);
  if(adm&&isAdmin)return adminView(app);
  if(qOpen)return qView(app);
  if(mapOpen)return mapView(app);
  if(cenOpen)return cenView(app);
  if(actOpen)return actView(app);
  if(tsOpen)return tsView(app);
  if(adabOpen)return adabView(app);
  if(evt)return eventsView(app);
  if(lib)return libView(app);
  if(abt)return aboutView(app);
  if(tools)return toolsView(app);
  if(cur){const g=groups.find(x=>x.id===cur);if(g)return groupView(app,g);cur=null}
  app.append(h('div',{class:'row'},h('button',{on:{click:()=>{if(!form&&guest()){regOpen=true;render();return}form=!form;render()}}},form?'بستن':'+ ساخت گروه جدید'),isAdmin&&h('button',{class:'g',on:{click:()=>{adm=true;render()}}},'⚙ مدیریت مرکز'+(pendN()?' ('+fa(pendN())+')':'')),h('button',{class:'g',on:{click:()=>{evt=true;render()}}},'📣 اجتماعات'),h('button',{class:'g',on:{click:()=>{tools=true;render()}}},'🧭 قبله و اوقات نماز'),h('button',{class:'g',on:{click:()=>{qOpen=true;qS=0;render()}}},'📖 قرآن'),h('button',{class:'g',on:{click:()=>{mapOpen=true;render()}}},'🗺 مسجدیاب'),h('button',{class:'g',on:{click:()=>{cenOpen=true;cenId=null;render()}}},'🏛 مراکز'),h('button',{class:'g',on:{click:()=>{lib=true;render()}}},'📚 کتابخانه'),h('button',{class:'g',on:{click:()=>{abt=true;render()}}},'ℹ️ درباره')));
  if(form)app.append(createForm());
  adabHome(app);
  actHome(app);
  upcoming(app);
  if(!groups.filter(visibleG).length)app.append(h('div',{class:'card mu'},'هنوز گروهی نیست. اولین گروه را بسازید.'));
  groups.filter(visibleG).forEach(g=>{const ms=mem(g.id);const n=ms.filter(m=>m.status==='in').length;
    app.append(h('div',{class:'card'},h('h2',{},(g.kind==='women'?'🧕 ':'')+g.title),
      h('div',{class:'mu'},`${g.mosque} · ${g.city||''}`),
      h('div',{class:'mu'},`شروع: ${g.start?new Date(g.start).toLocaleDateString(LOC()):'—'} · ${fa(g.days)} روز`),
      h('div',{class:'row',style:'margin-top:8px'},h('span',{class:'b in'},`${fa(ms.length)}${g.cap?' از '+fa(g.cap):''} عضو`),h('span',{class:'b '+(g.amir?'in':'out')},stt(g,ms.length)),h('span',{class:'b '+(n>=g.need?'in':'out')},`الان در مسجد: ${fa(n)}`),h('button',{class:'g',on:{click:()=>{cur=g.id;render()}}},'مشاهده'))))});
}
const done=g=>!g.cap||mem(g.id).length>=g.cap,pend=()=>groups.filter(g=>done(g)&&!g.amir).length;
const pendN=()=>pend()+members.filter(x=>x.approval==='pending'||x.pay==='submitted').length;
const stt=(g,n)=>g.amir?'آماده':(done(g)?'تکمیل؛ منتظر تعیین امیر و عالم':'در حال تشکیل');
const nm=i=>i?(names[i]||'عضو'):'—';
const uopt=()=>[h('option',{value:''},'— انتخاب —'),...users.map(u=>h('option',{value:u.id},(u.name||'عضو')+' · '+u.id.slice(-4)))];
const aopt=()=>[h('option',{value:''},'— انتخاب —'),...scholars.map(x=>h('option',{value:x.id},nm(x.id)+' ('+((madrasas.find(m=>m.id===x.madrasa)||{}).name||'')+')'))];
const S=(o,v)=>{const e=h('select',{},...o);e.value=v||'';return e};
const mOf=a=>(scholars.find(x=>x.id===a)||{}).madrasa||'';
function createForm(){
  const f={};const F=(k,l,t='text',v='')=>{const i=h('input',{type:t,value:v});f[k]=i;return h('div',{},h('label',{},l),i)};
  const mh=h('select',{},...mahramOpts());
  const itx=h('textarea',{rows:3,placeholder:'هر مورد در یک خط (اختیاری؛ وگرنه لوازم پیش‌فرض مرکز)'});
  return h('div',{class:'card'},F('title','عنوان گروه'),F('mosque','مسجد / محل اقامت'),F('city','شهر'),F('start','تاریخ شروع','date'),F('days','مدت (روز)','number','3'),F('need','حداقل نفرات لازم در مسجد در هر زمان','number','2'),F('cap','ظرفیت اعضای گروه (پس از تکمیل، مرکز امیر و عالم را تعیین می‌کند)','number','5'),isF()?h('div',{},h('label',{},'محرم همراه (فقط نسبت ثبت می‌شود)'),mh):null,F('fee','هزینه هر عضو (اختیاری، مثلاً ۵۰۰ هزار تومان)'),h('label',{},'لوازم مورد نیاز'),itx,
    h('button',{on:{click:async()=>{const v=k=>f[k].value.trim();if(!v('title')||!v('mosque')){msg='عنوان و مسجد را وارد کنید';return render()}if(isF()&&!mh.value){msg='انتخاب نسبت محرم همراه لازم است';return render()}msg='';
      try{const r=await db.collection('groups').add({title:v('title'),mosque:v('mosque'),city:v('city'),start:v('start'),days:+v('days')||3,need:+v('need')||1,alim:'',amir:'',madrasa:'',cap:Math.min(100,Math.max(2,+v('cap')||5)),kind:isF()?'women':'men',fee:v('fee'),items:itx.value.trim(),owner:me,created:Date.now()});await db.collection('members').doc(r.id+'_'+me).set({gid:r.id,uid:me,mode:'full',window:'',status:'in',approval:'pending',pay:'none',got:[],mahram:isF()?mh.value:'',acc:Date.now(),updated:Date.now()});form=false}catch(e){msg='ساخت گروه ناموفق بود'}render()}}},'ساختن گروه'));
}
function adminView(app){
  const fail=()=>{msg='ذخیره نشد؛ دسترسی ادمین لازم است';render()};
  const W=(c,id,d)=>db.collection(c).doc(id).set(d).catch(fail),D=(c,id)=>db.collection(c).doc(id).delete().catch(fail);
  app.append(h('button',{class:'g',on:{click:()=>{adm=false;render()}}},'→ بازگشت'));
  const mn=h('input',{placeholder:'نام مدرسه'}),mc=h('input',{placeholder:'شهر'});
  const c1=h('div',{class:'card'},h('h2',{},'مدارس دینی'),mn,mc,h('button',{on:{click:()=>{if(mn.value.trim())db.collection('madrasas').add({name:mn.value.trim(),city:mc.value.trim()}).catch(fail)}}},'افزودن مدرسه'));
  madrasas.forEach(m=>{const sc=scholars.filter(x=>x.madrasa===m.id),p=S(uopt());
    c1.append(h('div',{class:'item',style:'display:block'},h('b',{},m.name+(m.city?' · '+m.city:'')),h('div',{class:'mu'},'علما: '+(sc.map(x=>nm(x.id)).join('، ')||'—')),
      h('div',{class:'row'},p,h('button',{class:'g',on:{click:()=>p.value&&W('scholars',p.value,{madrasa:m.id})}},'افزودن عالم'),h('button',{class:'w',on:{click:()=>D('madrasas',m.id)}},'حذف مدرسه')),
      ...sc.map(x=>h('button',{class:'w',style:'margin:4px 4px 0 0',on:{click:()=>D('scholars',x.id)}},'حذف '+nm(x.id)))))});
  const ap=S(uopt());
  const c2=h('div',{class:'card'},h('h2',{},'ادمین‌های مرکز'),...admins.map(a=>h('div',{class:'item'},h('span',{},nm(a)+(a===me?' (شما)':'')),a===me?null:h('button',{class:'w',on:{click:()=>D('admins',a)}},'حذف'))),h('div',{class:'row'},ap,h('button',{on:{click:()=>ap.value&&W('admins',ap.value,{name:nm(ap.value)})}},'افزودن ادمین')));
  const c3=h('div',{class:'card'},h('h2',{},'تعیین عالم و امیر گروه‌ها'),h('div',{class:'mu'},'پس از تکمیل ظرفیت هر گروه، عالم و امیر آن را تعیین کنید. امیر از میان اعضای همان گروه انتخاب می‌شود.'));
  if(!groups.length)c3.append(h('div',{class:'mu'},'گروهی نیست.'));
  [...groups].sort((a,b)=>((done(b)&&!b.amir)?1:0)-((done(a)&&!a.amir)?1:0)).forEach(g=>{const ms=mem(g.id),{id,...r}=g,del=h('button',{class:'w',on:{click:()=>confirm('گروه حذف شود؟')&&D('groups',id)}},'حذف گروه');
    if(!done(g)){c3.append(h('div',{class:'item',style:'display:block'},h('b',{},g.title),h('div',{class:'mu'},`در حال تشکیل: ${fa(ms.length)} از ${fa(g.cap)} عضو`),del));return}
    const fee=h('input',{value:g.fee||''}),al=S(aopt(),g.alim),am=S([h('option',{value:''},'— انتخاب —'),...ms.filter(x=>!x.approval||x.approval==='approved').map(x=>h('option',{value:x.uid},nm(x.uid)))],g.amir);
    c3.append(h('div',{class:'item',style:'display:block'},h('b',{},g.title+(g.amir?'':' · منتظر تعیین')),h('div',{class:'mu'},`${fa(ms.length)} عضو`),h('label',{},'هزینه هر عضو'),fee,h('label',{},'عالم'),al,h('label',{},'امیر (از اعضا)'),am,
      h('div',{class:'row'},h('button',{on:{click:()=>{if(!al.value||!am.value){msg='هم عالم و هم امیر را انتخاب کنید';return render()}msg='';W('groups',id,{...r,alim:al.value,amir:am.value,madrasa:mOf(al.value),fee:fee.value.trim()})}}},'ذخیره'),del)))});
  const strip=x=>{const{id,...r}=x;return r},gt=id=>(groups.find(x=>x.id===id)||{}).title||'';
  const area=(k,l)=>{const t=h('textarea',{rows:5});t.value=cfg[k]||'';return h('div',{},h('label',{},l),t,h('button',{on:{click:()=>W('settings',k,{text:t.value.trim()})}},'ذخیره'))};
  const c4=h('div',{class:'card'},h('h2',{},'شرایط، لوازم و پرداخت'),area('terms','شرایط و مقررات عضویت'),area('items','لوازم مورد نیاز پیش‌فرض (هر مورد یک خط)'),area('pay','روش پرداخت (توضیح، شماره کارت مرکز یا لینک درگاه https://…)'));
  const row=(x,b)=>h('div',{class:'item',style:'display:block'},h('b',{},nm(x.uid)),h('div',{class:'mu'},gt(x.gid)+(x.mahram?' · محرم: '+x.mahram:'')+(x.pay==='submitted'?' · پیگیری: '+(x.payRef||''):'')),h('div',{class:'row'},...b));
  const pm=members.filter(x=>x.approval==='pending'),pp=members.filter(x=>x.pay==='submitted'),paid=members.filter(x=>x.pay==='paid').length;
  const c5=h('div',{class:'card'},h('h2',{},'تایید اعضا'),...(pm.length?pm.map(x=>row(x,[h('button',{on:{click:()=>W('members',x.id,{...strip(x),approval:'approved'})}},'تایید'),h('button',{class:'w',on:{click:()=>D('members',x.id)}},'رد و حذف')])):[h('div',{class:'mu'},'موردی نیست.')]));
  const c6=h('div',{class:'card'},h('h2',{},'تایید پرداخت‌ها'),h('div',{class:'mu'},'پرداخت‌شده تاکنون: '+fa(paid)+' نفر'),...(pp.length?pp.map(x=>row(x,[h('button',{on:{click:()=>W('members',x.id,{...strip(x),pay:'paid'})}},'تایید پرداخت'),h('button',{class:'w',on:{click:()=>W('members',x.id,{...strip(x),pay:'none',payRef:''})}},'رد (پرداخت دوباره)')])):[h('div',{class:'mu'},'موردی نیست.')]));
  app.append(c5,c6,c4,c1,c2,c3);
}
function groupView(app,g){
  const ms=mem(g.id),m=mine(g.id),n=ms.filter(x=>x.status==='in').length,ok=n>=g.need;
  const set=async d=>{try{await db.collection('members').doc(g.id+'_'+me).set({...(m||{}),gid:g.id,uid:me,...d,updated:Date.now()})}catch(e){msg='ذخیره نشد'}render()};
  const alim=g.alim===me,amir=g.amir===me||isAdmin,canAn=amir||alim;
  app.append(h('button',{class:'g',on:{click:()=>{cur=null;render()}}},'→ بازگشت'),
    h('div',{class:'card'},h('h2',{},(g.kind==='women'?'🧕 ':'')+g.title),h('div',{class:'mu'},`${g.mosque} · ${g.city||''}`),
      !g.amir&&h('div',{class:'bar low'},stt(g,ms.length)+(g.cap?` (${fa(ms.length)} از ${fa(g.cap)})`:'')),h('div',{class:'mu'},'امیر: '+nm(g.amir)+' · عالم: '+nm(g.alim)+(g.madrasa?' · '+((madrasas.find(x=>x.id===g.madrasa)||{}).name||''):'')),h('div',{class:'bar '+(ok?'ok':'low')},ok?`✓ الان ${fa(n)} نفر در مسجد هستند (حداقل ${fa(g.need)})`:`⚠ فقط ${fa(n)} نفر در مسجد هستند؛ حداقل ${fa(g.need)} نفر لازم است`)));
  app.append(h('div',{class:'tabs'},...[['st','وضعیت'],['an','اعلان'],['sh','مشورت'],['pl','برنامه'],['ni','شب‌ها'],['ch','گفتگو']].map(([k,l])=>h('button',{class:tab===k?'':'g',on:{click:()=>{tab=k;render()}}},l))));
  const P=t=>posts.filter(p=>p.gid===g.id&&p.type===t).sort((a,b)=>a.created-b.created);
  const add=async(t,o)=>{try{await db.collection('posts').add({gid:g.id,type:t,by:me,created:Date.now(),...o})}catch(e){msg='ارسال نشد'}};
  const del=async p=>{try{await db.collection('posts').doc(p.id).delete()}catch(e){msg='حذف نشد'}render()};
  const box=(ph,t,extra)=>{const x=h('textarea',{rows:2,placeholder:ph});return h('div',{class:'card'},x,h('button',{on:{click:()=>{if(x.value.trim()){add(t,{text:x.value.trim(),...(extra||{})});x.value=''}}}},'ارسال'))};
  const dstr=i=>{const d=new Date(g.start||Date.now());d.setDate(d.getDate()+i);return d.toLocaleDateString(LOC(),{weekday:'short',day:'numeric',month:'long'})};
  if(tab==='st'){  if(!m&&!isAdmin&&((g.kind==='women')!==isF())){app.append(h('div',{class:'card mu'},g.kind==='women'?'این گروه ویژه خواهران است.':'این گروه ویژه برادران است.'))}else if(!m&&g.cap&&ms.length>=g.cap){app.append(h('div',{class:'card mu'},'ظرفیت این گروه تکمیل شده است.'))}else if(!m){const mhs=h('select',{},...mahramOpts()),chk=h('input',{type:'checkbox',style:'width:auto;margin:0 0 0 8px'}),sel=h('select',{},...Object.entries(MODES).map(([k,v])=>h('option',{value:k},v)));
    const win=h('input',{placeholder:'مثلاً: هر شب از ۲۰ تا ۸ صبح'});
    app.append(h('div',{class:'card'},h('h2',{},'پیوستن به گروه'),h('label',{},'نوع حضور'),sel,h('label',{},'ساعت‌هایی که معمولاً در مسجد هستید (اختیاری)'),win,g.kind==='women'?h('div',{class:'card'},h('b',{},'🧕 گروه خواهران'),h('div',{class:'mu'},'این گروه فقط با همراهی محرم است. نسبت محرم همراه را انتخاب کنید (نام او ثبت نمی‌شود):'),mhs):null,joinInfo(g,chk),
      h('button',{on:{click:()=>{if(!chk.checked){msg='برای عضویت باید شرایط و مقررات را بپذیرید';return render()}if(g.kind==='women'&&!mhs.value){msg='برای گروه خواهران انتخاب محرم همراه لازم است';return render()}msg='';if(guest()){regOpen=true;render();return}set({mahram:g.kind==='women'?mhs.value:'',mode:sel.value,window:win.value.trim(),status:'in',approval:'pending',acc:Date.now(),pay:'none',got:[]})}}},'درخواست عضویت')));
  }else{
    const ret=h('input',{placeholder:'زمان بازگشت (مثلاً امشب ساعت ۲۰)',value:m.returnAt||''});
    app.append(h('div',{class:'card'},h('h2',{},'وضعیت من'),
      h('div',{},m.status==='in'?h('span',{class:'b in'},'در مسجد هستم'):h('span',{class:'b out'},'بیرون برای کار شخصی')),
      m.status==='in'?h('div',{style:'margin-top:8px'},h('label',{},'زمان بازگشت (اگر می‌روید)'),ret,h('button',{class:'w',on:{click:()=>set({status:'out',returnAt:ret.value.trim()})}},'برای کار بیرون می‌روم'))
        :h('div',{style:'margin-top:8px'},m.returnAt?h('div',{class:'mu'},'بازگشت: '+m.returnAt):null,h('button',{on:{click:()=>set({status:'in',returnAt:''})}},'به مسجد برگشتم'))));
  }
  if(m)mineCards(g,m,set).forEach(c=>app.append(c));
  const card=h('div',{class:'card'},h('h2',{},`اعضا (${fa(ms.length)})`));
  if(g.kind==='women'&&!isAdmin&&!m&&ms.length)card.append(h('div',{class:'mu'},'برای حفظ حریم خصوصی، اسامی اعضای گروه خواهران فقط برای اعضای همان گروه و مرکز نمایش داده می‌شود.'));
  if(!ms.length)card.append(h('div',{class:'mu'},'هنوز عضوی نیست.'));
  (g.kind==='women'&&!isAdmin&&!m?[]:ms.sort((a,b)=>(a.status==='in'?0:1)-(b.status==='in'?0:1))).forEach(x=>card.append(h('div',{class:'item'},
    h('div',{},h('div',{},(names[x.uid]||'عضو')+(x.uid===me?' (شما)':'')),h('div',{class:'mu'},MODES[x.mode]||''+(x.window?' · '+x.window:'')),x.window?h('div',{class:'mu'},x.window):null,x.status==='out'&&x.returnAt?h('div',{class:'mu'},'بازگشت: '+x.returnAt):null),
    h('span',{class:'b '+(x.status==='in'?'in':'out')},x.approval==='pending'?'در انتظار تایید':(x.status==='in'?'در مسجد':'بیرون')))));
  app.append(card);
  }
  else if(!m||!(!m.approval||m.approval==='approved')){app.append(h('div',{class:'card mu'},!m?'ابتدا درخواست عضویت دهید (تب وضعیت).':'پس از تایید مرکز، این بخش برای شما فعال می‌شود.'))}
  else if(tab==='an'){if(canAn)app.append(box('اعلان جدید برای گروه…','an'));const l=P('an').reverse();if(!l.length)app.append(h('div',{class:'card mu'},'اعلانی نیست.'));l.forEach(p=>app.append(h('div',{class:'card'},h('div',{},p.text),h('div',{class:'mu'},(names[p.by]||'امیر')+' · '+new Date(p.created).toLocaleString(LOC())),amir?h('button',{class:'w',on:{click:()=>del(p)}},'حذف'):null)))}
  else if(tab==='sh'){app.append(h('div',{class:'mu'},'پیشنهاد خود را مطرح کنید؛ اعضا موافق یا مخالف می‌دهند. تصمیم نهایی با امیر است.'),box('موضوع مشورت…','sh'));P('sh').reverse().forEach(p=>{const v=p.votes||{},y=Object.values(v).filter(x=>x==='y').length,n=Object.values(v).filter(x=>x==='n').length,vote=async c=>{const{id,...r}=p;try{await db.collection('posts').doc(id).set({...r,votes:{...v,[me]:c}})}catch(e){msg='ثبت نشد'}render()};app.append(h('div',{class:'card'},h('div',{},p.text),h('div',{class:'mu'},names[p.by]||'عضو'),h('div',{class:'row',style:'margin-top:8px'},h('button',{class:v[me]==='y'?'':'g',on:{click:()=>vote('y')}},'موافق '+fa(y)),h('button',{class:v[me]==='n'?'w':'g',on:{click:()=>vote('n')}},'مخالف '+fa(n))),amir?h('button',{class:'w',style:'margin-top:8px',on:{click:()=>del(p)}},'حذف'):null))})}
  else if(tab==='pl'){app.append(h('div',{class:'tabs'},...Array.from({length:g.days},(_,i)=>h('button',{class:day===i?'':'g',on:{click:()=>{day=i;render()}}},dstr(i)))));
    if(amir){const k=h('select',{},...KINDS.map(x=>h('option',{},x))),t=h('input',{placeholder:'ساعت (مثلاً بعد از عصر)'}),w=h('select',{},h('option',{value:''},'مسئول: —'),...ms.map(x=>h('option',{value:x.uid},names[x.uid]||'عضو')));app.append(h('div',{class:'card'},k,t,w,h('button',{on:{click:()=>add('pl',{day,kind:k.value,time:t.value.trim(),who:w.value})}},'افزودن به برنامه')))}
    const l=P('pl').filter(p=>p.day===day);if(!l.length)app.append(h('div',{class:'card mu'},'برنامه‌ای برای این روز ثبت نشده.'));
    l.forEach(p=>app.append(h('div',{class:'card'},h('b',{},p.kind),' ',p.time||'',h('div',{class:'mu'},'مسئول: '+(p.who?names[p.who]||'عضو':'تعیین نشده')),amir?h('button',{class:'w',on:{click:()=>del(p)}},'حذف'):null)))}
  else if(tab==='ni'){app.append(h('div',{class:'mu'},'شب‌هایی که در مسجد می‌مانید را علامت بزنید تا هر شب حداقل نفرات تأمین شود.'));for(let i=0;i<g.days;i++){const who=ms.filter(x=>(x.nights||[]).includes(i)),on=(m.nights||[]).includes(i);app.append(h('div',{class:'card'},h('div',{class:'row'},h('b',{},dstr(i)),h('span',{class:'b '+(who.length>=g.need?'in':'out')},fa(who.length)+' نفر')),h('div',{class:'mu'},who.map(x=>names[x.uid]||'عضو').join('، ')||'—'),h('button',{class:on?'w':'',on:{click:()=>set({nights:on?m.nights.filter(z=>z!==i):[...(m.nights||[]),i]})}},on?'انصراف':'من هستم')))}}
  else if(tab==='ch'){const c=h('div',{class:'card'},...P('ch').slice(-100).map(p=>h('div',{class:'msg'},h('b',{},(names[p.by]||'عضو')+': '),p.text)));app.append(c,box('پیام…','ch'))}
}

function pt(lat,lng,dt){const R=Math.PI/180,D=Date.UTC(dt.getFullYear(),dt.getMonth(),dt.getDate(),12)/864e5+2440587.5-2451545,g=(357.529+0.98560028*D)%360,q=(280.459+0.98564736*D)%360,L=q+1.915*Math.sin(g*R)+0.02*Math.sin(2*g*R),e=23.439-4e-7*D,RA=Math.atan2(Math.cos(e*R)*Math.sin(L*R),Math.cos(L*R))/R/15,d=Math.asin(Math.sin(e*R)*Math.sin(L*R))/R;let eq=q/15-((RA%24+24)%24);eq-=Math.round(eq/24)*24;const noon=12-dt.getTimezoneOffset()/-60-lng/15-eq,T=a=>Math.acos((Math.sin(a*R)-Math.sin(lat*R)*Math.sin(d*R))/(Math.cos(lat*R)*Math.cos(d*R)))/R/15,as=Math.atan(1/(2+Math.tan(Math.abs(lat-d)*R)))/R;return[['فجر',noon-T(-18)],['طلوع',noon-T(-.833)],['ظهر',noon+.03],['عصر (حنفی)',noon+T(as)],['مغرب',noon+T(-.833)],['عشاء',noon+T(-18)]]}
const hm=x=>isNaN(x)?'—':fa(Math.floor(((x%24)+24)%24)).padStart(2,fa(0))+':'+fa(Math.round((((x%24)+24)%24%1)*60)%60).padStart(2,fa(0));
let heading=null,orient=false;
function toolsView(app){
  app.append(h('button',{class:'g',on:{click:()=>{tools=false;render()}}},'→ بازگشت'));
  const la=h('input',{type:'number',step:'any',placeholder:'عرض جغرافیایی',value:loc?loc[0]:''}),lo=h('input',{type:'number',step:'any',placeholder:'طول جغرافیایی',value:loc?loc[1]:''});
  const save=(a,b)=>{loc=[a,b];try{localStorage.setItem('loc',JSON.stringify(loc))}catch(e){}render()};
  app.append(h('div',{class:'card'},h('h2',{},'موقعیت'),h('button',{on:{click:()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>save(p.coords.latitude,p.coords.longitude),()=>{msg='دسترسی به موقعیت داده نشد؛ مختصات را دستی وارد کنید';render()}):0}},'استفاده از موقعیت من'),h('div',{class:'mu',style:'margin-top:8px'},'یا دستی:'),la,lo,h('button',{class:'g',on:{click:()=>{if(la.value&&lo.value)save(+la.value,+lo.value)}}},'ذخیره')));
  if(!loc)return;
  const [a,b]=loc,R=Math.PI/180,K=[21.4225,39.8262],dl=(K[1]-b)*R,qb=((Math.atan2(Math.sin(dl)*Math.cos(K[0]*R),Math.cos(a*R)*Math.sin(K[0]*R)-Math.sin(a*R)*Math.cos(K[0]*R)*Math.cos(dl))/R)+360)%360;
  const arrow=h('i',{},'🕋');arrow.style.transform='rotate('+(qb-(heading||0))+'deg)';
  const bt=h('button',{class:'g',on:{click:async()=>{try{if(DeviceOrientationEvent.requestPermission&&await DeviceOrientationEvent.requestPermission()!=='granted')return}catch(e){}if(!orient){orient=true;addEventListener('deviceorientationabsolute',o);addEventListener('deviceorientation',o)}}}},'فعال‌سازی قطب‌نما');
  function o(e){const v=e.webkitCompassHeading!=null?e.webkitCompassHeading:(e.alpha!=null?360-e.alpha:null);if(v==null)return;heading=v;arrow.style.transform='rotate('+(qb-v)+'deg)'}
  app.append(h('div',{class:'card'},h('h2',{},'قبله‌نما'),h('div',{},'زاویه قبله از شمال: '+fa(Math.round(qb))+'°'),h('div',{class:'cmp'},arrow),h('div',{class:'mu'},'برای دقت بیشتر گوشی را صاف نگه دارید و از آهن‌ربا و فلز دور کنید.'),bt));
  const c=h('div',{class:'card'},h('h2',{},'اوقات نماز امروز'),h('div',{class:'mu'},'محاسبه تقریبی (فجر و عشاء ۱۸°، عصر حنفی)؛ با تقویم مسجد محل تطبیق دهید.'));
  pt(a,b,new Date()).forEach(([n,t])=>c.append(h('div',{class:'item'},h('span',{},n),h('b',{},hm(t)))));app.append(c);
}


const BCAT=['قرآن و تفسیر','فضائل و تبلیغ','فقه و مسائل','سیره و تاریخ','سایر'];
const SEC=[['app','برنامه'],['center','مرکز'],['builders','بانیان'],['leaders','والیان و امرا'],['hifz','حفظ قرآن'],['teachers','اساتید']];
const HINT={center:'نام مرکز، سال تأسیس و تاریخچه',builders:'نام بانی و نقش او',leaders:'نام، سمت (والی/امیر) و سال‌های مسئولیت',hifz:'سال تأسیس و افتتاح مدرسه حفظ قرآن',teachers:'نام استاد، تخصص و سال‌های تدریس'};
const back=f=>h('button',{class:'g',on:{click:f}},'→ بازگشت');
const pic=(u,c)=>u?h('img',{src:u,class:c||'ph',loading:'lazy',alt:''}):null;
const nd=t=>(t||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const shrink=(f,max=1280)=>new Promise(res=>{const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{const k=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext('2d').drawImage(i,0,0,c.width,c.height);c.toBlob(b=>{URL.revokeObjectURL(u);res(b)},'image/jpeg',.82)};i.onerror=()=>res(f);i.src=u});
const up=async(f,dir,img)=>{if(!f)return'';const b=img?await shrink(f):f;return window.__A.upload(b,dir+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,7)+(img?'.jpg':'.pdf'))};
const safe=u=>/^https?:\/\//.test(u||'');
function libView(app){
  app.append(back(()=>{lib=false;render()}),h('h2',{style:'margin-top:10px'},'📚 کتابخانه'));
  const q=h('input',{placeholder:'جستجوی عنوان یا نویسنده (با Enter)',value:bq});q.addEventListener('change',()=>{bq=q.value.trim();render()});
  app.append(q,h('div',{class:'tabs'},...['همه',...BCAT].map(c=>h('button',{class:bcat===c?'':'g',on:{click:()=>{bcat=c;render()}}},c))));
  if(bcat==='همه'||bcat==='قرآن و تفسیر')app.append(h('div',{class:'card'},h('h2',{},'📖 قرآن کریم'),h('div',{class:'mu',style:'margin-bottom:8px'},'متن با اعراب، ترجمه، تفسیر و صوت قاریان مشهور'),h('button',{on:{click:()=>{lib=false;qOpen=true;qS=0;render()}}},'باز کردن قرآن')));
  if(isAdmin){const t=h('input',{placeholder:'عنوان کتاب'}),a=h('input',{placeholder:'نویسنده / مترجم'}),c=S(BCAT.map(x=>h('option',{value:x},x)),BCAT[0]),d=h('textarea',{rows:2,placeholder:'توضیح کوتاه'}),cv=h('input',{type:'file',accept:'image/*'}),pf=h('input',{type:'file',accept:'application/pdf'}),u=h('input',{placeholder:'یا لینک کتاب (https://…)',dir:'ltr'}),bt=h('button',{},'ذخیره کتاب');
    bt.onclick=async()=>{if(!t.value.trim()){msg='عنوان را وارد کنید';return render()}if(u.value.trim()&&!safe(u.value.trim())){msg='لینک باید با https شروع شود';return render()}bt.disabled=true;bt.textContent='در حال بارگذاری…';try{const cover=await up(cv.files[0],'covers',true),file=await up(pf.files[0],'books',false);await db.collection('books').add({title:t.value.trim(),author:a.value.trim(),cat:c.value,desc:d.value.trim(),cover,url:file||u.value.trim(),created:Date.now()});msg=''}catch(e){msg='ذخیره نشد؛ دسترسی ادمین، Storage یا حجم فایل را بررسی کنید'}render()};
    app.append(h('details',{class:'card'},h('summary',{},'+ افزودن کتاب (ادمین)'),t,a,c,d,h('label',{},'تصویر جلد'),cv,h('label',{},'فایل PDF (فقط کتاب‌هایی که اجازه انتشارشان را دارید)'),pf,u,bt))}
  const l=books.filter(b=>(bcat==='همه'||b.cat===bcat)&&(!bq||((b.title||'')+' '+(b.author||'')).includes(bq))).sort((x,y)=>x.created-y.created);
  if(!l.length)app.append(h('div',{class:'card mu'},'کتابی ثبت نشده است.'));
  l.forEach(b=>app.append(h('div',{class:'card'},h('div',{class:'row',style:'align-items:flex-start;flex-wrap:nowrap'},b.cover?pic(b.cover,'cv'):h('div',{class:'cv',style:'display:flex;align-items:center;justify-content:center;font-size:30px;background:var(--ac2)'},'📖'),
    h('div',{style:'flex:1'},h('b',{},b.title),h('div',{class:'mu'},(b.author||'')+(b.cat?' · '+b.cat:'')),b.desc?h('div',{style:'font-size:14px'},b.desc):null,
      h('div',{class:'row',style:'margin-top:6px'},safe(b.url)?h('a',{class:'btn',href:b.url,target:'_blank',rel:'noopener'},'مطالعه / دانلود'):null,isAdmin?h('button',{class:'w',on:{click:()=>confirm('کتاب حذف شود؟')&&db.collection('books').doc(b.id).delete().catch(()=>{msg='حذف نشد';render()})}},'حذف'):null))))));
}
function aboutView(app){
  app.append(back(()=>{abt=false;render()}),h('h2',{style:'margin-top:10px'},'ℹ️ درباره'),h('div',{class:'card'},h('h2',{},'همسفر'),h('div',{},'برنامه‌ای برای هماهنگی گروه‌های خروج، آداب و اذکار، قرآن و صوت، مسجدیاب، معرفی مراکز تبلیغ و ثبت فعالیت‌های شخصی.'),h('div',{class:'mu',style:'margin-top:8px'},'روند گروه: تشکیل گروه ← تکمیل ظرفیت ← تعیین عالم و امیر توسط مرکز. اوقات نماز تقریبی است و باید با تقویم مسجد محل تطبیق داده شود. محتوای آداب و اذکار خلاصه‌ای عمومی است و عالم مرکز باید آن را بازبینی کند.'),h('button',{class:'g',style:'margin-top:8px',on:{click:()=>{abt=false;cenOpen=true;cenId=null;render()}}},'🏛 معرفی مراکز تبلیغ')));
}

const itemsOf=g=>(g.items||cfg.items||'').split('\n').map(x=>x.trim()).filter(Boolean);
function joinInfo(g,chk){const it=itemsOf(g);return h('div',{},
  h('details',{class:'card'},h('summary',{},'📜 شرایط و مقررات'),h('div',{style:'white-space:pre-wrap'},cfg.terms||'شرایط هنوز توسط مرکز ثبت نشده است.')),
  h('div',{class:'card'},h('b',{},'🎒 لوازم مورد نیاز'),...(it.length?it.map(x=>h('div',{},'• '+x)):[h('div',{class:'mu'},'ثبت نشده است.')])),
  h('div',{class:'card'},'💰 هزینه: '+(g.fee||'تعیین نشده'),h('div',{class:'mu'},'پرداخت پس از تایید مرکز فعال می‌شود.')),
  h('label',{class:'row',style:'color:var(--tx);font-size:16px'},chk,'شرایط و مقررات را خوانده و می‌پذیرم'))}
function mineCards(g,m,set){const out=[],ap=!m.approval||m.approval==='approved';
  out.push(h('div',{class:'card'},h('h2',{},'وضعیت عضویت'),h('span',{class:'b '+(ap?'in':'out')},ap?'تایید شده':'در انتظار تایید مرکز'),h('div',{class:'mu',style:'margin-top:6px'},ap?'بخش‌های گروه برای شما فعال است.':'پس از تایید ادمین، بخش‌های گروه و پرداخت فعال می‌شود.'),
    h('button',{class:'w',style:'margin-top:8px',on:{click:()=>confirm('از گروه خارج می‌شوید؟')&&db.collection('members').doc(g.id+'_'+me).delete().catch(()=>{msg='انجام نشد';render()})}},'انصراف از عضویت')));
  const it=itemsOf(g);
  if(it.length)out.push(h('div',{class:'card'},h('h2',{},'🎒 لوازم من'),...it.map((x,i)=>{const c=h('input',{type:'checkbox',style:'width:auto;margin:0 0 0 8px'}),got=m.got||[];c.checked=got.includes(i);c.addEventListener('change',()=>set({got:c.checked?[...got,i]:got.filter(z=>z!==i)}));return h('label',{class:'row',style:'color:var(--tx);font-size:16px'},c,x)})));
  const pay=m.pay||'none',pc=h('div',{class:'card'},h('h2',{},'💰 پرداخت هزینه'),h('div',{},'مبلغ: '+(g.fee||'تعیین نشده')));
  if(!ap)pc.append(h('div',{class:'mu'},'پرداخت پس از تایید ادمین فعال می‌شود.'));
  else if(pay==='paid')pc.append(h('span',{class:'b in'},'پرداخت تایید شد ✓'));
  else if(pay==='submitted')pc.append(h('span',{class:'b out'},'در انتظار تایید پرداخت توسط مرکز'),h('div',{class:'mu'},'شماره پیگیری: '+(m.payRef||'')));
  else{const r=h('input',{placeholder:'شماره پیگیری تراکنش (شماره کارت وارد نکنید)'}),u=((cfg.pay||'').match(/https:\/\/\S+/)||[])[0];
    pc.append(h('div',{style:'white-space:pre-wrap;margin:6px 0'},cfg.pay||'روش پرداخت هنوز توسط مرکز ثبت نشده است.'),u?h('a',{class:'btn',href:u,target:'_blank',rel:'noopener'},'رفتن به درگاه پرداخت'):null,r,h('button',{on:{click:()=>{if(!r.value.trim()){msg='شماره پیگیری را وارد کنید';return render()}msg='';set({pay:'submitted',payRef:r.value.trim()})}}},'پرداخت کردم'))}
  out.push(pc);return out}

function entryView(app){
  const deny=h('div',{class:'bar low',style:'display:none'});
  app.append(h('div',{class:'card'},h('h2',{},'نوع ورود'),
    h('button',{style:'width:100%;margin:6px 0',on:{click:()=>setMode('user')}},'👤 ورود به‌عنوان کاربر'),
    h('button',{class:'g',style:'width:100%;margin:6px 0',on:{click:()=>{if(!adminsLoaded)deny.textContent='کمی صبر کنید…';else if(admins.includes(me))return setMode('admin');else deny.textContent='این حساب دسترسی ادمین ندارد.';deny.style.display=''}}},'🛡 ورود به‌عنوان ادمین'),deny));
  if(PREVIEW&&adminsLoaded&&!admins.length)app.append(h('div',{class:'card'},h('div',{class:'mu'},'در این پیش‌نمایش هنوز ادمینی تعریف نشده است.'),h('button',{on:{click:async()=>{await db.collection('admins').doc(me).set({name:nm(me)});setMode('admin')}}},'من ادمین اول باشم')));
}

let adabOpen=false,adabId=null,adabX=[],rd={size:20,theme:'light',last:null};
try{Object.assign(rd,JSON.parse(localStorage.getItem('rd')||'{}'))}catch(e){}
let events=[],rsvps=[],evt=false,etype='همه',ecountry='همه';
let menu=false,regOpen=false,adl=false;
const guest=()=>{try{return window.__A.isGuest()}catch(e){return true}};
function menuView(){
  const c=h('div',{class:'card'}),go=f=>()=>{menu=false;f();render()};
  const it=(l,f)=>c.append(h('button',{class:'g',style:'display:block;width:100%;margin:5px 0;text-align:right',on:{click:go(f)}},l));
  c.append(h('div',{class:'mu',style:'margin-bottom:6px'},guest()?'👤 مهمان (بدون ثبت‌نام)':'👤 '+(names[me]||'کاربر')));
  it('🌐 زبان / Language',()=>{langOpen=true});
  it('📖 آداب و دستورات',()=>{adabOpen=true;adabId=null});
  it('📿 تسبیح‌شمار',()=>{tsOpen=true});
  it('📖 قرآن کریم',()=>{qOpen=true;qS=0});it('🗺 مسجدیاب و مرکزیاب',()=>{mapOpen=true});it('🏛 معرفی مراکز تبلیغ',()=>{cenOpen=true;cenId=null});
  it(isF()?'👨 بازگشت به حالت عمومی':'🧕 ورود به‌عنوان خواهر',()=>setGender(isF()?'m':'f'));
  it('👤 فعالیت من',()=>{actOpen=true;actTab='q'});
  if(guest())it('📝 ثبت‌نام / ورود کاربر',()=>{regOpen=true});
  it('📣 اجتماعات و اعلان‌ها',()=>{evt=true});it('🧭 قبله و اوقات نماز',()=>{tools=true});it('📚 کتابخانه',()=>{lib=true});it('ℹ️ درباره',()=>{abt=true});
  if(isAdmin){it('⚙ مدیریت مرکز',()=>{adm=true});it('🔁 رفتن به حالت کاربر',()=>setMode('user'))}
  else if(admins.includes(me))it('🔁 رفتن به حالت ادمین',()=>setMode('admin'));
  else it('🛡 ورود ادمین',()=>{adl=true});
  if(!guest()||admins.includes(me))it('🚪 خروج از حساب',()=>window.__A.out());
  app_menu=c;return c}
let app_menu=null;
function regView(app){
  const simple=!!window.__A.simple,n=h('input',{placeholder:'نام و نام خانوادگی'}),e=simple?null:h('input',{type:'email',placeholder:'ایمیل',dir:'ltr'}),p=simple?null:h('input',{type:'password',placeholder:'رمز عبور (حداقل ۶ نویسه)',dir:'ltr'});
  const m=h('div',{class:'bar low',style:'display:none'}),say=t=>{m.style.display='';m.textContent=t};
  const reg=async()=>{if(!n.value.trim())return say('نام را وارد کنید');try{await window.__A.register(n.value.trim(),e&&e.value.trim(),p&&p.value);names[me]=n.value.trim();regOpen=false;msg='ثبت‌نام انجام شد؛ حالا می‌توانید درخواست عضویت بدهید.';render()}catch(x){say(x.code==='auth/email-already-in-use'?'این ایمیل قبلاً ثبت شده؛ از «ورود» استفاده کنید':x.code==='auth/weak-password'?'رمز باید حداقل ۶ نویسه باشد':'ثبت‌نام ناموفق بود: '+(x.code||''))}};
  const sin=async()=>{try{await window.__A.signin(e.value.trim(),p.value)}catch(x){say('ورود ناموفق بود: '+(x.code||''))}};
  app.append(h('button',{class:'g',on:{click:()=>{regOpen=false;render()}}},'→ بازگشت'),h('div',{class:'card'},h('h2',{},'ثبت‌نام برای عضویت'),h('div',{class:'mu',style:'margin-bottom:8px'},'برای درخواست عضویت یا ساخت گروه یک‌بار ثبت‌نام لازم است. مشاهده برنامه بدون ثبت‌نام آزاد است.'),m,n,e,p,h('div',{class:'row'},h('button',{on:{click:reg}},'ساخت حساب'),simple?null:h('button',{class:'g',on:{click:sin}},'قبلاً ثبت‌نام کرده‌ام (ورود)'))));
}
function admLoginView(app){
  const simple=!!window.__A.simple,e=h('input',{type:'email',placeholder:'ایمیل ادمین',dir:'ltr'}),p=h('input',{type:'password',placeholder:'رمز عبور',dir:'ltr'});
  const m=h('div',{class:'bar low',style:'display:none'}),say=t=>{m.style.display='';m.textContent=t},c=h('div',{class:'card'},h('h2',{},'🛡 ورود ادمین'),m);
  if(simple){c.append(h('div',{class:'mu',style:'margin:6px 0'},'در پیش‌نمایش، حساب شما باید در فهرست ادمین‌ها باشد.'),h('button',{on:{click:()=>{if(admins.includes(me)){adl=false;setMode('admin')}else say('این حساب دسترسی ادمین ندارد')}}},'ورود به‌عنوان ادمین'));
    if(PREVIEW&&adminsLoaded&&!admins.length)c.append(h('div',{style:'margin-top:10px'},h('div',{class:'mu'},'هنوز ادمینی تعریف نشده است.'),h('button',{class:'g',on:{click:async()=>{await db.collection('admins').doc(me).set({name:nm(me)});adl=false;setMode('admin')}}},'من ادمین اول باشم')))}
  else c.append(e,p,h('button',{on:{click:async()=>{try{await window.__A.adminLogin(e.value.trim(),p.value)}catch(x){say('ورود ناموفق بود: '+(x.code||''))}}}},'ورود ادمین'),h('div',{class:'mu',style:'margin-top:8px'},'حساب ادمین را مرکز تعریف می‌کند و ثبت‌نام ندارد.'));
  app.append(h('button',{class:'g',on:{click:()=>{adl=false;render()}}},'→ بازگشت'),c);
}

const ETYPES=[['weekly','🗓 جلسه هفتگی'],['jor','🚩 اجتماع (جور)'],['ijtema','🌍 اجتماع بزرگ'],['women','🧕 اجتماع خواهران'],['other','📌 سایر']];
const etl=k=>(ETYPES.find(x=>x[0]===k)||[0,'📌 سایر'])[1];
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const isPast=e=>e.type!=='weekly'&&!!e.start&&(e.end||e.start)<today();
const dfa=s=>s?new Date(s+'T12:00:00').toLocaleDateString(LOC(),{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'';
const going=e=>rsvps.filter(r=>r.eid===e.id),iGo=e=>rsvps.some(r=>r.id===e.id+'_'+me);
async function toggleGo(e){if(guest()){regOpen=true;render();return}const id=e.id+'_'+me;try{if(iGo(e))await db.collection('rsvps').doc(id).delete();else await db.collection('rsvps').doc(id).set({eid:e.id,uid:me,created:Date.now()})}catch(x){msg='ثبت نشد'}render()}
function evCard(e){const n=going(e).length,ok=iGo(e),past=isPast(e);
  return h('div',{class:'card',style:past?'opacity:.65':''},pic(e.photo),h('div',{class:'row'},h('span',{class:'b in'},etl(e.type)),past?h('span',{class:'b out'},'برگزار شده'):null),h('h2',{style:'margin-top:6px'},e.title),
    h('div',{class:'mu'},[e.country,e.city].filter(Boolean).join('، ')+(e.venue?' · '+e.venue:'')),
    e.type==='weekly'?h('div',{},'⏰ '+(e.time||'هر هفته')):h('div',{},'📅 '+dfa(e.start)+(e.end&&e.end!==e.start?' تا '+dfa(e.end):'')+(e.time?' · '+e.time:'')),
    e.desc?h('div',{style:'white-space:pre-wrap;margin-top:6px'},e.desc):null,
    safe(e.link)?h('a',{class:'btn',style:'margin-top:6px',href:e.link,target:'_blank',rel:'noopener'},'اطلاعات بیشتر'):null,
    h('div',{class:'row',style:'margin-top:8px'},!past?h('button',{class:ok?'w':'',on:{click:()=>toggleGo(e)}},ok?'✓ شرکت می‌کنم (لغو)':'شرکت می‌کنم'):null,h('span',{class:'mu'},fa(n)+' نفر قصد شرکت دارند'),isAdmin?h('button',{class:'w',on:{click:()=>confirm('اطلاعیه حذف شود؟')&&db.collection('events').doc(e.id).delete().catch(()=>{msg='حذف نشد';render()})}},'حذف'):null))}
function upcoming(app){const l=events.filter(evVisible).filter(e=>!isPast(e)).sort((a,b)=>(a.type==='weekly'?1:0)-(b.type==='weekly'?1:0)||(a.start||'').localeCompare(b.start||'')).slice(0,3);if(!l.length)return;
  const c=h('div',{class:'card'},h('h2',{},'📣 اجتماعات پیش‌رو'));
  l.forEach(e=>c.append(h('div',{class:'item'},h('div',{},h('b',{},e.title),h('div',{class:'mu'},[e.city,e.country].filter(Boolean).join('، ')+' · '+(e.type==='weekly'?(e.time||'هر هفته'):dfa(e.start)))),h('span',{class:'b in'},etl(e.type)))));
  c.append(h('button',{class:'g',style:'margin-top:8px',on:{click:()=>{evt=true;render()}}},'مشاهده همه'));app.append(c)}
function eventsView(app){
  app.append(back(()=>{evt=false;render()}),h('h2',{style:'margin-top:10px'},'📣 اجتماعات و اعلان‌ها'),h('div',{class:'mu'},'اجتماع‌های هفتگی شهرها، اجتماع‌های (جور) و اجتماع‌های بزرگ مثل اجتماع سالانه'));
  app.append(h('div',{class:'tabs'},...['همه',...ETYPES.map(x=>x[0])].map(k=>h('button',{class:etype===k?'':'g',on:{click:()=>{etype=k;render()}}},k==='همه'?'همه':etl(k)))));
  const cs=['همه',...new Set(events.filter(evVisible).map(e=>e.country).filter(Boolean))];
  if(cs.length>2){const s=S(cs.map(c=>h('option',{value:c},c==='همه'?'همه کشورها':c)),ecountry);s.addEventListener('change',()=>{ecountry=s.value;render()});app.append(s)}
  if(isAdmin){const ty=S(ETYPES.map(x=>h('option',{value:x[0]},x[1])),'weekly'),t=h('input',{placeholder:'عنوان (مثلاً اجتماع سالانه رایوند)'}),co=h('input',{placeholder:'کشور'}),ci=h('input',{placeholder:'شهر'}),ve=h('input',{placeholder:'محل برگزاری (مسجد، مرکز…)'}),st=h('input',{type:'date'}),en=h('input',{type:'date'}),tm=h('input',{placeholder:'زمان (مثلاً پنجشنبه شب تا جمعه، بعد از نماز مغرب)'}),de=h('textarea',{rows:3,placeholder:'توضیحات'}),li=h('input',{placeholder:'لینک اطلاعات بیشتر (https://…)',dir:'ltr'}),ph=h('input',{type:'file',accept:'image/*'}),bt=h('button',{},'انتشار اطلاعیه');
    bt.onclick=async()=>{if(!t.value.trim()){msg='عنوان را وارد کنید';return render()}if(ty.value!=='weekly'&&!st.value){msg='تاریخ شروع را وارد کنید';return render()}if(li.value.trim()&&!safe(li.value.trim())){msg='لینک باید با https شروع شود';return render()}bt.disabled=true;bt.textContent='در حال انتشار…';try{const photo=await up(ph.files[0],'events',true);await db.collection('events').add({type:ty.value,title:t.value.trim(),country:co.value.trim(),city:ci.value.trim(),venue:ve.value.trim(),start:st.value,end:en.value,time:tm.value.trim(),desc:de.value.trim(),link:li.value.trim(),photo,created:Date.now()});msg=''}catch(x){msg='انتشار نشد؛ دسترسی ادمین یا حجم عکس را بررسی کنید'}render()};
    app.append(h('details',{class:'card'},h('summary',{},'+ اطلاعیه جدید (ادمین)'),ty,t,co,ci,ve,h('label',{},'تاریخ شروع (برای جلسه هفتگی لازم نیست)'),st,h('label',{},'تاریخ پایان (اختیاری)'),en,tm,de,li,h('label',{},'تصویر'),ph,bt))}
  const l=events.filter(evVisible).filter(e=>(etype==='همه'||e.type===etype)&&(ecountry==='همه'||e.country===ecountry));
  const up_=l.filter(e=>!isPast(e)&&e.type!=='weekly').sort((a,b)=>(a.start||'').localeCompare(b.start||'')),wk=l.filter(e=>e.type==='weekly'),pa=l.filter(isPast).sort((a,b)=>(b.start||'').localeCompare(a.start||''));
  if(!l.length)app.append(h('div',{class:'card mu'},'اطلاعیه‌ای ثبت نشده است.'));
  if(up_.length)app.append(h('h2',{},'پیش‌رو'),...up_.map(evCard));
  if(wk.length)app.append(h('h2',{},'برنامه‌های همیشگی'),...wk.map(evCard));
  if(pa.length)app.append(h('details',{},h('summary',{},'برگزارشده‌ها ('+fa(pa.length)+')'),...pa.map(evCard)));
}

const LANGS=[['fa','فارسی','Persian'],['en','English','English'],['ar','العربية','Arabic'],['ur','اردو','Urdu'],['ps','پښتو','Pashto'],['hi','हिन्दी','Hindi'],['bn','বাংলা','Bengali'],['tr','Türkçe','Turkish'],['id','Bahasa Indonesia','Indonesian'],['ms','Bahasa Melayu','Malay'],['fr','Français','French'],['es','Español','Spanish'],['pt','Português','Portuguese'],['ru','Русский','Russian'],['de','Deutsch','German'],['it','Italiano','Italian'],['uz','Oʻzbekcha','Uzbek'],['kk','Қазақша','Kazakh'],['tg','Тоҷикӣ','Tajik'],['ckb','کوردی (سۆرانی)','Kurdish (Sorani)'],['ku','Kurdî','Kurdish (Kurmanji)'],['sw','Kiswahili','Swahili'],['ha','Hausa','Hausa'],['so','Soomaali','Somali'],['am','አማርኛ','Amharic'],['zh','中文','Chinese'],['ja','日本語','Japanese'],['ko','한국어','Korean'],['th','ไทย','Thai'],['vi','Tiếng Việt','Vietnamese'],['tl','Filipino','Filipino'],['ta','தமிழ்','Tamil'],['te','తెలుగు','Telugu'],['ml','മലയാളം','Malayalam'],['gu','ગુજરાતી','Gujarati'],['pa','ਪੰਜਾਬੀ','Punjabi'],['ne','नेपाली','Nepali'],['si','සිංහල','Sinhala'],['my','မြန်မာ','Burmese'],['az','Azərbaycanca','Azerbaijani'],['sq','Shqip','Albanian'],['bs','Bosanski','Bosnian'],['nl','Nederlands','Dutch'],['pl','Polski','Polish'],['uk','Українська','Ukrainian'],['ro','Română','Romanian'],['el','Ελληνικά','Greek'],['he','עברית','Hebrew'],['sd','سنڌي','Sindhi'],['ug','ئۇيغۇرچە','Uyghur'],['yo','Yorùbá','Yoruba'],['ig','Igbo','Igbo'],['zu','isiZulu','Zulu'],['af','Afrikaans','Afrikaans'],['be','Беларуская','Belarusian'],['bg','Български','Bulgarian'],['ca','Català','Catalan'],['cs','Čeština','Czech'],['cy','Cymraeg','Welsh'],['da','Dansk','Danish'],['et','Eesti','Estonian'],['eu','Euskara','Basque'],['fi','Suomi','Finnish'],['ga','Gaeilge','Irish'],['gl','Galego','Galician'],['hr','Hrvatski','Croatian'],['hu','Magyar','Hungarian'],['hy','Հայերեն','Armenian'],['is','Íslenska','Icelandic'],['jv','Basa Jawa','Javanese'],['ka','ქართული','Georgian'],['km','ខ្មែរ','Khmer'],['kn','ಕನ್ನಡ','Kannada'],['ky','Кыргызча','Kyrgyz'],['lo','ລາວ','Lao'],['lt','Lietuvių','Lithuanian'],['lv','Latviešu','Latvian'],['mg','Malagasy','Malagasy'],['mi','Māori','Māori'],['mk','Македонски','Macedonian'],['mn','Монгол','Mongolian'],['mr','मराठी','Marathi'],['mt','Malti','Maltese'],['no','Norsk','Norwegian'],['or','ଓଡ଼ିଆ','Odia'],['rw','Kinyarwanda','Kinyarwanda'],['sk','Slovenčina','Slovak'],['sl','Slovenščina','Slovenian'],['sn','chiShona','Shona'],['sr','Српски','Serbian'],['su','Basa Sunda','Sundanese'],['sv','Svenska','Swedish'],['ti','ትግርኛ','Tigrinya'],['tk','Türkmençe','Turkmen'],['tt','Татарча','Tatar'],['wo','Wolof','Wolof'],['xh','isiXhosa','Xhosa'],['ff','Fulfulde','Fula'],['bm','Bamanankan','Bambara'],['lg','Luganda','Luganda'],['ny','Chichewa','Chichewa'],['ak','Twi','Twi'],['om','Oromoo','Oromo'],['ce','Нохчийн','Chechen'],['ks','کٲشُر','Kashmiri'],['bal','بلوچی','Balochi'],['skr','سرائیکی','Saraiki'],['dv','ދިވެހި','Dhivehi'],['lb','Lëtzebuergesch','Luxembourgish']];
const RTL=new Set(['fa','ar','ur','ps','ckb','he','sd','ug','dv','ks','bal','skr']);
let LANG=(()=>{try{const s=localStorage.getItem('lang');if(s&&LANGS.some(l=>l[0]===s))return s}catch(e){}return detectLang()})(),_loc=null,langOpen=false,langBusy=false;
function LOC(){if(_loc)return _loc;const c={fa:'fa-IR',ur:'ur-PK',ku:'ckb'}[LANG]||LANG;try{_loc=Intl.NumberFormat.supportedLocalesOf([c]).length?c:'en'}catch(e){_loc='en'}return _loc}
const curLang=()=>(LANGS.find(l=>l[0]===LANG)||LANGS[0])[1];
function applyLang(){document.documentElement.lang=LANG;document.documentElement.dir=RTL.has(LANG)?'rtl':'ltr'}
window.I18N=window.I18N||{};
function detectLang(){const M={nb:'no',nn:'no',iw:'he',in:'id',fil:'tl',prs:'fa'},T=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'en']);for(const t of T){const s=String(t).toLowerCase();let c=s.split('-')[0];c=M[c]||c;if(s==='ckb'||s.startsWith('ku-arab'))c='ckb';if(LANGS.some(l=>l[0]===c))return c}return'en'}
const hasDict=c=>c==='fa'||!!window.I18N[c];
async function autoTranslate(code){
  if(hasDict(code))return true;
  try{const s=localStorage.getItem('i18n_'+code);if(s){window.I18N[code]=JSON.parse(s);return true}}catch(e){}
  if(!('Translator' in self))return false;
  try{const o={sourceLanguage:'en',targetLanguage:code};if((await Translator.availability(o))==='unavailable')return false;
    const tr=await Translator.create(o),E=window.I18N.en||{},out={};
    for(const k of Object.keys(E)){if(E[k].includes('#'))continue;out[k]=await tr.translate(E[k])}
    window.I18N[code]=out;try{localStorage.setItem('i18n_'+code,JSON.stringify(out))}catch(e){}return true}catch(e){return false}}
async function setLang(c){LANG=c;_loc=null;try{localStorage.setItem('lang',c)}catch(e){}applyLang();
  if(!hasDict(c)){langBusy=true;render();await autoTranslate(c);langBusy=false}
  langOpen=false;render()}
const PERS=/[\u0600-\u06FF]/,NUM=/[0-9۰-۹٠-٩]+(?:[.٫,٬][0-9۰-۹٠-٩]+)?/g;
function trStr(v){
  if(LANG==='fa')return v;
  const D=(window.I18N||{})[LANG]||{},E=(window.I18N||{}).en||{},look=k=>D[k]!==undefined?D[k]:(LANG!=='en'?E[k]:undefined);
  let r=look(v);if(r!==undefined)return r;
  const nums=[],k=v.replace(NUM,m=>{nums.push(m);return'#'});
  if(nums.length){r=look(k);if(r!==undefined){let i=0;return r.replace(/#/g,()=>nums[i++]!==undefined?nums[i-1]:'#')}}
  for(const sep of[' · ',': ',' تا ']){if(v.includes(sep)){const p=v.split(sep),o=p.map(trStr);if(o.some((x,i)=>x!==p[i])){const s=sep===' تا '?' '+(look('تا')||'تا')+' ':sep;return o.join(s)}}}
  return v}
function trDom(root){
  if(LANG==='fa'||!root)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),ns=[];while(w.nextNode())ns.push(w.currentNode);
  ns.forEach(n=>{const raw=n.nodeValue,v=raw.trim();if(!v||!PERS.test(v))return;const r=trStr(v);if(r!==v)n.nodeValue=raw.replace(v,()=>r)});
  root.querySelectorAll('[placeholder]').forEach(e=>{const v=e.getAttribute('placeholder');if(v&&PERS.test(v)){const r=trStr(v);if(r!==v)e.setAttribute('placeholder',r)}});
}
{const _c=window.confirm.bind(window);window.confirm=s=>_c(trStr(String(s)))}
function langView(app){
  const q=h('input',{placeholder:'Search language…'});
  q.addEventListener('input',()=>{const k=q.value.trim().toLowerCase();document.querySelectorAll('[data-s]').forEach(b=>{b.style.display=(!k||b.dataset.s.includes(k))?'':'none'})});
  const c=h('div',{class:'card'});
  LANGS.forEach(([code,name,en])=>c.append(h('button',{class:code===LANG?'':'g','data-s':(code+' '+name+' '+en).toLowerCase(),style:'display:block;width:100%;margin:4px 0;text-align:start',on:{click:()=>setLang(code)}},(code===LANG?'✓ ':'')+name+' · '+en+(hasDict(code)?'':' (English UI*)'))));
  app.append(h('button',{class:'g',on:{click:()=>{langOpen=false;render()}}},'→ Back'),h('h2',{style:'margin-top:10px'},'🌐 Language'),langBusy?h('div',{class:'bar low'},'Translating… please wait'):null,q,c,h('div',{class:'mu'},'* Languages without a built-in translation show English; on browsers that support on-device translation (e.g. recent Chrome) the app will try to translate automatically — quality may vary. Built-in: Persian, English, Arabic, Urdu.'));
}
applyLang();try{const s=localStorage.getItem('i18n_'+LANG);if(s&&!window.I18N[LANG])window.I18N[LANG]=JSON.parse(s)}catch(e){}

const rdSave=()=>{try{localStorage.setItem('rd',JSON.stringify(rd))}catch(e){}};
const allAdab=()=>{const f=isF();return [...(window.ADAB||[]).filter(x=>x.cat!=='women'||f).map(x=>{const o=window.ADAB_F&&window.ADAB_F[x.id];return f&&o?Object.assign({},x,o):x}),...adabX.map(x=>({id:'x_'+x.id,icon:x.icon||'📌',title:x.title||'',intro:x.intro||'',items:(x.text||'').split('\n').map(s=>s.trim()).filter(Boolean),custom:x.id}))]};
const tile=t=>h('button',{class:'tile',on:{click:()=>{adabOpen=true;adabId=t.id;window.scrollTo(0,0);render()}}},h('b',{},t.icon),t.title);
const tsTile=()=>h('button',{class:'tile',on:{click:()=>{tsOpen=true;window.scrollTo(0,0);render()}}},h('b',{},'📿'),'تسبیح‌شمار');
const ASEC=[['main','📖 آداب و دستورات'],['sifat','🌟 شش صفات'],['zikr','🤲 تسبیحات و اذکار'],['women','🧕 ویژه خواهران']];
const secOf=x=>x.cat||'main';
function adabHome(app){
  const L=allAdab(),last=L.find(x=>x.id===rd.last);
  ASEC.forEach(([k,t])=>{const l=L.filter(x=>secOf(x)===k);if(!l.length)return;
    const c=h('div',{class:'card'},h('h2',{},t));
    if(k==='main'&&last)c.append(h('button',{class:'g',style:'margin-bottom:8px',on:{click:()=>{adabOpen=true;adabId=last.id;render()}}},'📖 ادامه مطالعه: '+last.title));
    const tl=(k==='main'?l.slice(0,7):l).map(tile);
    if(k==='main')tl.push(h('button',{class:'tile',on:{click:()=>{adabOpen=true;adabId=null;render()}}},h('b',{},'📚'),'همه آداب ←'));
    if(k==='zikr')tl.push(tsTile());
    c.append(h('div',{class:'grid'},...tl));app.append(c)})}
function adabForm(){
  const ic=h('input',{placeholder:'ایموجی (مثلاً 📌)'}),t=h('input',{placeholder:'عنوان (مثلاً آداب …)'}),it=h('input',{placeholder:'توضیح کوتاه (اختیاری)'}),x=h('textarea',{rows:6,placeholder:'هر مورد را در یک خط جدا بنویسید'}),bt=h('button',{},'ذخیره');
  bt.onclick=async()=>{if(!t.value.trim()||!x.value.trim()){msg='عنوان و متن را وارد کنید';return render()}try{await db.collection('adab').add({icon:ic.value.trim()||'📌',title:t.value.trim(),intro:it.value.trim(),text:x.value.trim(),created:Date.now()});msg=''}catch(e){msg='ذخیره نشد؛ دسترسی ادمین را بررسی کنید'}render()};
  return h('details',{class:'card'},h('summary',{},'+ افزودن مطلب (ادمین)'),ic,t,it,x,bt)}
function adabView(app){
  const L=allAdab();
  if(!adabId){app.append(back(()=>{adabOpen=false;render()}),h('h2',{style:'margin-top:10px'},'📖 آداب و دستورات'),h('div',{class:'mu',style:'margin-bottom:8px'},'برای مطالعه، یک مورد را انتخاب کنید'));ASEC.forEach(([k,t])=>{const l=L.filter(x=>secOf(x)===k);if(!l.length)return;app.append(h('h2',{style:'margin-top:14px'},t),h('div',{class:'grid'},...l.map(tile),k==='zikr'?tsTile():null))});if(isAdmin)app.append(adabForm());return}
  const i=L.findIndex(x=>x.id===adabId),t=L[i];if(!t){adabId=null;return adabView(app)}
  rd.last=adabId;rdSave();
  const th=({light:['#ffffff','#1c2a24'],sepia:['#f4ecd8','#3b2f1e'],dark:['#0f1512','#e6ede8']})[rd.theme]||['#ffffff','#1c2a24'],nx={light:'sepia',sepia:'dark',dark:'light'},ico={light:'☀️',sepia:'📜',dark:'🌙'};
  const ctl=h('div',{class:'row',style:'margin:8px 0'},h('button',{class:'g',on:{click:()=>{adabId=null;render()}}},'☰ فهرست'),h('button',{class:'g',on:{click:()=>{rd.size=Math.max(15,rd.size-2);rdSave();render()}}},'A−'),h('button',{class:'g',on:{click:()=>{rd.size=Math.min(34,rd.size+2);rdSave();render()}}},'A+'),h('button',{class:'g',on:{click:()=>{rd.theme=nx[rd.theme]||'sepia';rdSave();render()}}},ico[rd.theme]||'☀️'));
  const body=h('div',{style:'background:'+th[0]+';color:'+th[1]+';border-radius:14px;padding:18px 16px;line-height:2.1;font-size:'+rd.size+'px'});
  body.append(h('h2',{style:'font-size:'+(rd.size+6)+'px;margin:0 0 6px;color:inherit'},t.icon+' '+t.title));
  if(t.intro)body.append(h('div',{style:'opacity:.8;font-size:.85em;margin-bottom:12px'},t.intro));
  t.items.forEach((s,n)=>{const c=h('div',{style:'flex:1'});
    if(typeof s==='string')c.append(s);else{if(s.t)c.append(s.t);c.append(h('div',{dir:'rtl',lang:'ar',style:"font-family:'Amiri','Scheherazade New','Traditional Arabic','Noto Naskh Arabic',serif;font-size:1.25em;line-height:2.2;margin:6px 0;padding:8px 12px;border-radius:10px;background:"+th[1]+'14'},s.ar))}
    body.append(h('div',{style:'display:flex;gap:10px;margin:14px 0'},h('span',{style:'flex:none;opacity:.55;min-width:1.6em'},fa(n+1)+'.'),c))});
  body.append(h('div',{style:'opacity:.65;font-size:.72em;margin-top:18px;border-top:1px solid '+th[1]+'33;padding-top:10px'},'این متن خلاصه‌ای عمومی (بیشتر بر پایه رویه رایج در مذهب حنفی) است و جایگزین پرسش از عالم نیست.'));
  const nav=h('div',{class:'row',style:'margin:10px 0;justify-content:space-between'},i>0?h('button',{class:'g',on:{click:()=>{adabId=L[i-1].id;window.scrollTo(0,0);render()}}},'→ '+L[i-1].title):h('span'),i<L.length-1?h('button',{on:{click:()=>{adabId=L[i+1].id;window.scrollTo(0,0);render()}}},L[i+1].title+' ←'):h('span'));
  app.append(h('div',{id:'rdbar',style:'position:sticky;top:0;height:4px;background:var(--ac);width:0;border-radius:2px;z-index:5'}),back(()=>{adabOpen=false;render()}),ctl,body,nav);
  if(isAdmin&&t.custom)app.append(h('button',{class:'w',on:{click:()=>confirm('حذف شود؟')&&db.collection('adab').doc(t.custom).delete().then(()=>{adabId=null;render()}).catch(()=>{msg='حذف نشد';render()})}},'حذف این مطلب'));
}
addEventListener('scroll',()=>{const b=document.getElementById('rdbar');if(!b)return;const e=document.documentElement,m=e.scrollHeight-e.clientHeight;b.style.width=(m>0?Math.min(100,e.scrollTop/m*100):0)+'%'},{passive:true});

let tsOpen=false,tsEls={};
const TS_Z=[['سبحان الله','سُبْحَانَ اللَّهِ',33],['الحمد لله','الْحَمْدُ لِلَّهِ',33],['الله اکبر','اللَّهُ أَكْبَرُ',34],['لا إله إلا الله','لَا إِلَٰهَ إِلَّا اللَّهُ',100],['استغفار','أَسْتَغْفِرُ اللَّهَ',100],['درود / صلوات','اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',100],['لا حول ولا قوة إلا بالله','لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',100],['سبحان الله وبحمده','سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',100],['سبحان الله وبحمده، سبحان الله العظیم','سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',100]];
let ts={z:0,t:33,c:0,r:0,total:0,d:'',n:0,design:'ring',vib:true,custom:''};
try{Object.assign(ts,JSON.parse(localStorage.getItem('tsb')||'{}'))}catch(e){}
const tsSave=()=>{try{localStorage.setItem('tsb',JSON.stringify(ts))}catch(e){}};
const tsText=()=>ts.z>=TS_Z.length?(ts.custom||'ذکر دلخواه'):TS_Z[ts.z][1];
function tsTap(){if(ts.d!==today()){ts.d=today();ts.n=0}ts.c++;ts.total++;ts.n++;
  const v=p=>{if(ts.vib&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}};v(12);
  if(ts.t>0&&ts.c>=ts.t){ts.r++;ts.c=0;v([70,50,70])}
  tsSave();tsPaint()}
function tsPaint(){const E=tsEls;if(!E.num)return;E.num.textContent=fa(ts.c);
  if(E.ring)E.ring.style.background='conic-gradient(var(--ac) '+(ts.t>0?ts.c/ts.t*360:0)+'deg,var(--ac2) 0)';
  if(E.beads){const N=E.beads.children.length,pos=ts.t>33?Math.floor(ts.c/ts.t*N):ts.c%N;[...E.beads.children].forEach((b,i)=>b.style.background=i<pos?'var(--ac)':'var(--ac2)')}
  if(E.bar)E.bar.style.width=(ts.t>0?ts.c/ts.t*100:0)+'%';
  if(E.stats)E.stats.textContent='دور '+fa(ts.r)+' · امروز '+fa(ts.n)+' · کل '+fa(ts.total);
  if(E.tgt)E.tgt.textContent=(ts.t>0?'هدف: '+fa(ts.t):'هدف: ∞')}
function tsView(app){
  tsEls={};if(ts.d!==today()){ts.d=today();ts.n=0}
  app.append(back(()=>{tsOpen=false;render()}),h('h2',{style:'margin-top:10px'},'📿 تسبیح‌شمار'));
  const sel=h('select',{},...TS_Z.map((z,i)=>h('option',{value:String(i)},z[0])),h('option',{value:String(TS_Z.length)},'ذکر دلخواه…'));sel.value=String(ts.z);
  sel.addEventListener('change',()=>{ts.z=+sel.value;if(ts.z<TS_Z.length)ts.t=TS_Z[ts.z][2];ts.c=0;tsSave();render()});
  const chips=(arr,cur,f)=>h('div',{class:'tabs'},...arr.map(([k,l])=>h('button',{class:cur===k?'':'g',on:{click:()=>{f(k);tsSave();render()}}},l)));
  const setup=h('div',{class:'card'},h('label',{},'ذکر'),sel);
  if(ts.z>=TS_Z.length){const ci=h('input',{placeholder:'متن ذکر',value:ts.custom});ci.addEventListener('change',()=>{ts.custom=ci.value.trim();tsSave();render()});setup.append(ci)}
  setup.append(h('label',{},'هدف'),chips([[33,'۳۳'],[34,'۳۴'],[99,'۹۹'],[100,'۱۰۰'],[500,'۵۰۰'],[1000,'۱۰۰۰'],[0,'∞']],ts.t,k=>{ts.t=k;ts.c=0}),
    h('label',{},'طرح'),chips([['ring','⭕ حلقه'],['beads','📿 دانه‌ها'],['classic','🔘 دکمه'],['digital','🔢 دیجیتال']],ts.design,k=>{ts.design=k}));
  app.append(setup);
  const th={dir:'rtl',lang:'ar',style:"font-family:'Amiri','Scheherazade New','Traditional Arabic','Noto Naskh Arabic',serif;font-size:30px;line-height:2;text-align:center"};
  app.append(h('div',{class:'card'},h('div',th,tsText()),ts.z<TS_Z.length?h('div',{class:'mu',style:'text-align:center'},TS_Z[ts.z][0]):null));
  const num=h('div',{style:'font-size:60px;font-weight:700;line-height:1.1'},''),hint=h('div',{class:'mu'},'برای شمارش لمس کنید'),tgt=h('div',{class:'mu'},'');
  const base='cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;';
  tsEls.num=num;tsEls.tgt=tgt;let box;
  if(ts.design==='ring'){const ring=h('div',{style:base+'width:240px;height:240px;border-radius:50%;margin:10px auto;display:flex;align-items:center;justify-content:center',on:{click:tsTap}},h('div',{style:'width:204px;height:204px;border-radius:50%;background:var(--card);display:flex;flex-direction:column;align-items:center;justify-content:center'},num,tgt,hint));tsEls.ring=ring;box=ring}
  else if(ts.design==='beads'){const N=Math.min(ts.t>0?ts.t:33,33),beads=h('div',{style:'display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin:6px 0 12px'},...Array.from({length:N},()=>h('span',{style:'width:24px;height:24px;border-radius:50%;background:var(--ac2);border:1px solid var(--bd);display:inline-block;transition:background .15s'})));tsEls.beads=beads;box=h('div',{style:base+'text-align:center;padding:16px 10px;border:1px solid var(--bd);border-radius:18px;background:var(--card)',on:{click:tsTap}},beads,num,tgt,hint)}
  else if(ts.design==='classic'){const bar=h('div',{style:'height:100%;background:#fff;width:0;border-radius:3px'});tsEls.bar=bar;const btn=h('div',{style:base+'width:240px;height:240px;border-radius:50%;margin:10px auto;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 30% 28%,var(--ac),#0b3d2b);color:#fff;box-shadow:0 10px 26px rgba(0,0,0,.3);transition:transform .08s',on:{click:tsTap,pointerdown:()=>{btn.style.transform='scale(.96)'},pointerup:()=>{btn.style.transform=''},pointerleave:()=>{btn.style.transform=''}}},num,h('div',{style:'width:110px;height:6px;background:rgba(255,255,255,.3);border-radius:3px;margin:8px 0;overflow:hidden'},bar),tgt);box=btn}
  else{const bar=h('div',{style:'height:100%;background:#7cfc8a;width:0'});tsEls.bar=bar;num.style.cssText='font-size:76px;letter-spacing:4px;line-height:1.1';box=h('div',{style:base+"background:#0c1a10;color:#7cfc8a;border-radius:16px;padding:18px;text-align:center;font-family:ui-monospace,Menlo,monospace;box-shadow:inset 0 0 18px #000;margin:10px 0",on:{click:tsTap}},num,h('div',{style:'height:6px;background:#17301c;border-radius:3px;margin:8px 0;overflow:hidden'},bar),tgt)}
  app.append(box);
  const stats=h('div',{class:'mu',style:'text-align:center;margin:6px 0'},'');tsEls.stats=stats;
  app.append(stats,h('div',{class:'row',style:'justify-content:center;margin-top:8px'},
    h('button',{class:'g',on:{click:()=>{if(ts.c>0){ts.c--;ts.total=Math.max(0,ts.total-1);ts.n=Math.max(0,ts.n-1);tsSave();tsPaint()}}}},'↩ یک‌عدد کمتر'),
    h('button',{class:'w',on:{click:()=>{ts.c=0;tsSave();tsPaint()}}},'⟲ صفر کردن'),
    h('button',{class:'g',on:{click:()=>{ts.vib=!ts.vib;tsSave();render()}}},ts.vib?'📳 لرزش: روشن':'📴 لرزش: خاموش')));
  tsPaint()}

let actOpen=false,actTab='q';
let act={q:{days:{},pos:0,khatm:0,goal:2,hifz:0},n:{days:{}},j:[]};
try{const s=JSON.parse(localStorage.getItem('act')||'null');if(s&&typeof s==='object')act=Object.assign(act,s)}catch(e){}
const actFix=()=>{act.q=Object.assign({days:{},pos:0,khatm:0,goal:2,hifz:0},act.q||{});act.n=Object.assign({days:{}},act.n||{});if(!Array.isArray(act.j))act.j=[]};actFix();
const actSave=()=>{try{localStorage.setItem('act',JSON.stringify(act))}catch(e){}};
const offD=k=>{const d=new Date();d.setDate(d.getDate()-k);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const streakOf=has=>{let k=has(offD(0))?0:1,s=0;while(k<3660&&has(offD(k))){s++;k++}return s};
const sumDays=(m,n)=>{let t=0;for(let k=0;k<n;k++)t+=(+m[offD(k)]||0);return t};
const stat=(i,l,v)=>h('div',{class:'tile',style:'cursor:default'},h('b',{},i),h('span',{style:'font-size:22px;font-weight:700'},fa(v)),l);
const NAFL=[['tahajjud','🌙 تهجد'],['ishraq','🌅 اشراق'],['chasht','☀️ چاشت'],['awwabin','🌇 اوابین'],['sunan','🕌 سنت‌های مؤکده'],['tahiya','🕋 تحیة‌المسجد'],['wudu','💧 تحیة‌الوضوء']];
const ADHK=[['a_sobh','🌅 اذکار صبح'],['a_sham','🌆 اذکار شام'],['a_namaz','📿 اذکار بعد از نماز'],['a_istighfar','🔁 استغفار (۱۰۰ بار)'],['a_durood','🤍 درود (۱۰۰ بار)']];
const JT=[['d3','۳ روزه (ماهانه)',3],['d7','۷ روزه (هفتگی)',7],['d10','۱۰ روزه',10],['d40','۴۰ روزه (چله)',40],['m4','۴ ماهه',120],['y1','۱۲ ماهه (سال)',365],['intl','اجتماع بین‌المللی',3],['jor','اجتماع (جور)',1],['wom','🧕 جماعت خواهران (با محرم)',3],['oth','سایر',1]];
function addPages(n){const q=act.q,t=today();q.days[t]=Math.max(0,(q.days[t]||0)+n);q.pos+=n;while(q.pos>=604){q.pos-=604;q.khatm++}while(q.pos<0){if(q.khatm>0){q.pos+=604;q.khatm--}else q.pos=0}actSave();render()}
function actHome(app){
  const t=act.q.days[today()]||0,nn=(act.n.days[today()]||[]).length,tot=NAFL.length+ADHK.length;
  const b=(ic,l,sub,tab)=>h('button',{class:'tile',on:{click:()=>{actOpen=true;actTab=tab;window.scrollTo(0,0);render()}}},h('b',{},ic),l,h('span',{class:'mu',style:'font-size:12px'},sub));
  app.append(h('div',{class:'card'},h('h2',{},'👤 فعالیت من'),h('div',{class:'grid'},b('📖','قرآن',fa(t)+' صفحه امروز','q'),b('📿','اذکار و نوافل',fa(nn)+' از '+fa(tot)+' امروز','n'),b('🕌','جماعت',fa(act.j.length)+' سابقه','j'))))}
function actQ(app){
  const q=act.q,t=q.days[today()]||0,st=streakOf(d=>(q.days[d]||0)>0),pct=q.goal>0?Math.min(100,t/q.goal*100):0;
  const cu=h('input',{type:'number',min:'1',placeholder:'تعداد صفحه'});
  app.append(h('div',{class:'card'},h('h2',{},'📖 امروز'),h('div',{style:'font-size:44px;font-weight:700;text-align:center'},fa(t)+' صفحه'),
    h('div',{style:'height:8px;background:var(--ac2);border-radius:4px;margin:8px 0;overflow:hidden'},h('div',{style:'height:100%;background:var(--ac);width:'+pct+'%'})),
    h('div',{class:'mu',style:'text-align:center'},'هدف روزانه: '+fa(q.goal)+' صفحه'),
    h('div',{class:'row',style:'justify-content:center;margin-top:10px'},...[1,2,5,10].map(n=>h('button',{on:{click:()=>addPages(n)}},'+'+fa(n))),h('button',{class:'w',on:{click:()=>addPages(-1)}},'−'+fa(1))),
    h('div',{class:'row',style:'margin-top:8px'},cu,h('button',{class:'g',on:{click:()=>{const n=Math.floor(+cu.value);if(n>0)addPages(n)}}},'ثبت'))));
  app.append(h('div',{class:'card'},h('div',{class:'grid'},stat('🔥','روز پیاپی',st),stat('📅','این هفته (صفحه)',sumDays(q.days,7)),stat('🗓','۳۰ روز اخیر',sumDays(q.days,30)),stat('✅','ختم قرآن',q.khatm),stat('🧠','حفظ شده (صفحه)',q.hifz))));
  const mx=Math.max(q.goal||1,1,...Array.from({length:14},(_,k)=>q.days[offD(13-k)]||0));
  app.append(h('div',{class:'card'},h('h2',{},'۱۴ روز اخیر'),h('div',{style:'display:flex;gap:4px;align-items:flex-end;height:90px'},...Array.from({length:14},(_,k)=>{const v=q.days[offD(13-k)]||0;return h('div',{title:fa(v),style:'flex:1;border-radius:4px 4px 0 0;background:'+(q.goal>0&&v>=q.goal?'var(--ac)':'var(--ac2)')+';height:'+Math.max(3,v/mx*100)+'%'})}))));
  const gi=h('input',{type:'number',min:'0',value:String(q.goal)}),pi=h('input',{type:'number',min:'0',max:'603',value:String(q.pos)});
  app.append(h('div',{class:'card'},h('h2',{},'تنظیمات'),h('div',{},'جای فعلی تلاوت: صفحه '+fa(q.pos)+' از '+fa(604)+' (حدود جزء '+fa(Math.min(30,Math.floor(q.pos/20)+1))+')'),h('div',{class:'mu'},'بر پایه مصحف ۶۰۴ صفحه‌ای؛ تقسیم جزء‌ها در مصحف‌ها کمی متفاوت است.'),
    h('label',{},'هدف روزانه (صفحه)'),gi,h('label',{},'صفحه فعلی'),pi,
    h('div',{class:'row'},h('button',{class:'g',on:{click:()=>{q.goal=Math.max(0,Math.floor(+gi.value)||0);q.pos=Math.min(603,Math.max(0,Math.floor(+pi.value)||0));actSave();render()}}},'ذخیره تنظیمات'),
      h('button',{class:'g',on:{click:()=>{q.hifz=Math.max(0,q.hifz-1);actSave();render()}}},'حفظ −'),h('button',{class:'g',on:{click:()=>{q.hifz++;actSave();render()}}},'حفظ +'))))}
function actN(app){
  const k=today(),day=act.n.days[k]||[],tog=id=>{const s=new Set(act.n.days[k]||[]);s.has(id)?s.delete(id):s.add(id);act.n.days[k]=[...s];actSave();render()};
  const tn=ts.d===k?ts.n:0,total=NAFL.length+ADHK.length,st=streakOf(d=>(act.n.days[d]||[]).length>0);
  const list=(title,arr)=>{const c=h('div',{class:'card'},h('h2',{},title));arr.forEach(([id,l])=>{const cb=h('input',{type:'checkbox',style:'width:auto;margin:0 0 0 8px'});cb.checked=day.includes(id);cb.addEventListener('change',()=>tog(id));c.append(h('label',{class:'row',style:'color:var(--tx);font-size:16px;margin:6px 0'},cb,l))});return c};
  app.append(h('div',{class:'card'},h('div',{class:'grid'},stat('✅','امروز از '+fa(total),day.length),stat('🔥','روز پیاپی',st),stat('📿','تسبیح امروز',tn),stat('🔄','دور تسبیح',ts.r),stat('∑','مجموع تسبیح',ts.total)),h('button',{class:'g',style:'margin-top:8px',on:{click:()=>{tsOpen=true;actOpen=false;render()}}},'📿 باز کردن تسبیح‌شمار')));
  app.append(list('🕌 نوافل امروز',NAFL),list('📿 اذکار امروز',ADHK));
  app.append(h('div',{class:'card'},h('h2',{},'۷ روز اخیر'),h('div',{style:'display:flex;gap:6px'},...Array.from({length:7},(_,i)=>{const d=offD(6-i),c=(act.n.days[d]||[]).length;return h('div',{style:'flex:1;text-align:center'},h('div',{style:'height:60px;display:flex;align-items:flex-end'},h('div',{style:'width:100%;border-radius:4px 4px 0 0;background:'+(c?'var(--ac)':'var(--ac2)')+';height:'+Math.max(4,c/total*100)+'%'})),h('div',{class:'mu',style:'font-size:12px'},new Date(d+'T12:00:00').toLocaleDateString(LOC(),{weekday:'short'})),h('div',{style:'font-size:13px'},fa(c)))}))));
}
function actJ(app){
  const sel=h('select',{},...JT.map(x=>h('option',{value:x[0]},x[1]))),st=h('input',{type:'date',value:today()}),dy=h('input',{type:'number',min:'1',value:'3'}),pl=h('input',{placeholder:'مکان (شهر، کشور)'}),nt=h('input',{placeholder:'یادداشت (اختیاری)'});
  sel.value='d3';sel.addEventListener('change',()=>{dy.value=String(JT.find(x=>x[0]===sel.value)[2])});
  app.append(h('div',{class:'card'},h('h2',{},'➕ ثبت جماعت جدید'),sel,h('label',{},'تاریخ شروع'),st,h('label',{},'تعداد روز'),dy,pl,nt,h('button',{on:{click:()=>{act.j.push({id:Date.now().toString(36),t:sel.value,s:st.value||today(),d:Math.max(1,Math.floor(+dy.value)||1),p:pl.value.trim(),n:nt.value.trim()});actSave();render()}}},'ثبت در سابقه')));
  const cnt=k=>act.j.filter(x=>x.t===k).length;
  app.append(h('div',{class:'card'},h('h2',{},'📊 خلاصه سابقه'),h('div',{class:'grid'},stat('🧭','کل دفعات',act.j.length),stat('📆','مجموع روزها',act.j.reduce((a,x)=>a+x.d,0)),...JT.filter(x=>cnt(x[0])).map(x=>stat('✓',x[1],cnt(x[0]))))));
  const l=[...act.j].sort((a,b)=>(b.s||'').localeCompare(a.s||''));
  const c=h('div',{class:'card'},h('h2',{},'سابقه من'));
  if(!l.length)c.append(h('div',{class:'mu'},'هنوز سابقه‌ای ثبت نشده است.'));
  l.forEach(x=>c.append(h('div',{class:'item',style:'display:block'},h('b',{},(JT.find(j=>j[0]===x.t)||[0,'سایر'])[1]),h('div',{class:'mu'},dfa(x.s)+' · '+fa(x.d)+' روز'+(x.p?' · '+x.p:'')),x.n?h('div',{style:'font-size:14px'},x.n):null,h('button',{class:'w',style:'margin-top:6px',on:{click:()=>confirm('این مورد حذف شود؟')&&(act.j=act.j.filter(z=>z.id!==x.id),actSave(),render())}},'حذف'))));
  app.append(c);
  const mine=members.filter(m=>m.uid===me).map(m=>({m,g:groups.find(g=>g.id===m.gid)})).filter(x=>x.g);
  if(mine.length)app.append(h('div',{class:'card'},h('h2',{},'گروه‌های من در همسفر'),...mine.map(({m,g})=>h('div',{class:'item'},h('div',{},h('b',{},g.title),h('div',{class:'mu'},(g.start?dfa(g.start)+' · ':'')+fa(g.days)+' روز')),h('span',{class:'b '+((!m.approval||m.approval==='approved')?'in':'out')},(!m.approval||m.approval==='approved')?'تایید شده':'در انتظار تایید')))));
}
function actView(app){
  app.append(back(()=>{actOpen=false;render()}),h('h2',{style:'margin-top:10px'},'👤 فعالیت من'),h('div',{class:'mu',style:'margin-bottom:6px'},'این اطلاعات فقط روی همین دستگاه ذخیره می‌شود و برای هیچ‌کس (حتی ادمین) دیده نمی‌شود.'),
    h('div',{class:'tabs'},...[['q','📖 قرآن'],['n','📿 اذکار و نوافل'],['j','🕌 جماعت']].map(([k,l])=>h('button',{class:actTab===k?'':'g',on:{click:()=>{actTab=k;render()}}},l))));
  if(actTab==='q')actQ(app);else if(actTab==='n')actN(app);else actJ(app);
  const ta=h('textarea',{rows:4});ta.value=JSON.stringify(act);
  app.append(h('details',{class:'card'},h('summary',{},'پشتیبان‌گیری و بازیابی'),h('div',{class:'mu'},'متن زیر را کپی و جای امنی نگه دارید؛ برای بازیابی روی دستگاه دیگر همین متن را جای‌گذاری کنید.'),ta,
    h('div',{class:'row'},h('button',{class:'g',on:{click:()=>{try{navigator.clipboard.writeText(ta.value)}catch(e){ta.select()}}}},'کپی'),h('button',{class:'w',on:{click:()=>{try{const o=JSON.parse(ta.value);if(!o||typeof o!=='object')throw 0;act=o;actFix();actSave();msg='بازیابی شد';}catch(e){msg='متن پشتیبان معتبر نیست'}render()}}},'بازیابی از متن'))));
}

let gender='m';try{gender=localStorage.getItem('gender')==='f'?'f':'m'}catch(e){}
const isF=()=>gender==='f';
const visibleG=g=>isAdmin||((g.kind==='women')===isF());
const evVisible=e=>e.type!=='women'||isF()||isAdmin;
const mahramOpts=()=>[h('option',{value:''},'— انتخاب —'),...['همسر','پدر','برادر','پسر','دیگر محرم'].map(x=>h('option',{value:x},x))];
function setGender(g){gender=g;try{localStorage.setItem('gender',g)}catch(e){}adabId=null;cur=null;msg=g==='f'?'حالت خواهران فعال شد؛ محتوا و گروه‌های ویژه خواهران نمایش داده می‌شود.':'حالت عمومی فعال شد.';render()}
// ================= قرآن =================
let qOpen=false,qS=0,qList=null,qEds=null,qTfs=null,qAyahs=[],qIdx=-1,qLoad=false,qSearch='';
let qs={tr:'',tf:'',rec:'ar.alafasy',size:26,showTr:true};
try{Object.assign(qs,JSON.parse(localStorage.getItem('qs')||'{}'))}catch(e){}
const qsSave=()=>{try{localStorage.setItem('qs',JSON.stringify(qs))}catch(e){}};
const QTR={fa:'fa.makarem',ur:'ur.jalandhry',en:'en.sahih',tr:'tr.diyanet',id:'id.indonesian',bn:'bn.bengali',hi:'hi.hindi',ru:'ru.kuliev',fr:'fr.hamidullah',de:'de.aburida',es:'es.cortes',ar:'ar.muyassar'};
const REC=[['ar.alafasy','مشاری راشد العفاسی'],['ar.abdurrahmaansudais','عبدالرحمن السدیس'],['ar.saoodshuraym','سعود الشریم'],['ar.mahermuaiqly','ماهر المعیقلی'],['ar.hudhaify','علی الحذیفی'],['ar.muhammadayyoub','محمد ایوب'],['ar.abdulbasitmurattal','عبدالباسط عبدالصمد (مرتل)'],['ar.husary','محمود خلیل الحصری'],['ar.minshawi','محمد صدیق المنشاوی'],['ar.shaatree','ابوبکر الشاطری'],['ar.ahmedajamy','احمد العجمی']];
const FAT=[['بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ','به نام خداوند بخشنده مهربان'],['الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ','ستایش مخصوص خداوند، پروردگار جهانیان است'],['الرَّحْمَٰنِ الرَّحِيمِ','بخشنده مهربان'],['مَالِكِ يَوْمِ الدِّينِ','مالک روز جزا'],['إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ','تنها تو را می‌پرستیم و تنها از تو یاری می‌جوییم'],['اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ','ما را به راه راست هدایت کن'],['صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ','راه کسانی که به آنان نعمت دادی؛ نه کسانی که بر آنان خشم شده و نه گمراهان']];
async function qget(url){let c=null;try{c=await caches.open('qdata')}catch(e){}let r=c?await c.match(url):null;if(!r){r=await fetch(url);if(!r.ok)throw new Error('http');if(c)try{await c.put(url,r.clone())}catch(e){}}return r.json()}
const qTrId=()=>qs.tr||QTR[LANG]||'en.sahih';
async function qInit(){if(qList)return;try{qList=(await qget('https://api.alquran.cloud/v1/surah')).data}catch(e){qList=[]}
  try{qEds=(await qget('https://api.alquran.cloud/v1/edition?format=text&type=translation')).data}catch(e){qEds=[]}
  try{qTfs=(await qget('https://api.alquran.cloud/v1/edition?format=text&type=tafsir')).data}catch(e){qTfs=[]}render()}
async function qOpenS(n){qS=n;qAyahs=[];qIdx=-1;qLoad=true;try{qa.pause()}catch(e){}render();
  try{const ids=['quran-uthmani',qTrId()];if(qs.tf)ids.push(qs.tf);const d=(await qget('https://api.alquran.cloud/v1/surah/'+n+'/editions/'+ids.join(','))).data;
    qAyahs=d[0].ayahs.map((x,i)=>{let t=x.text;if(n!==1&&x.numberInSurah===1&&/^بِسْمِ/.test(t))t=t.split(' ').slice(4).join(' ');return{n:x.number,i:x.numberInSurah,ar:t,tr:d[1]&&d[1].ayahs[i]?d[1].ayahs[i].text:'',tf:qs.tf&&d[2]&&d[2].ayahs[i]?d[2].ayahs[i].text:''}})}
  catch(e){qAyahs=[];if(n===1)qAyahs=FAT.map((x,i)=>({n:i+1,i:i+1,ar:x[0],tr:x[1],tf:''}));else msg='بارگذاری ناموفق بود؛ اتصال اینترنت را بررسی کنید.'}
  qLoad=false;render()}
const qa=new Audio();
const qUrl=(rec,n)=>'https://cdn.islamic.network/quran/audio/128/'+rec+'/'+n+'.mp3';
async function qSrc(n){const u=qUrl(qs.rec,n);try{const c=await caches.open('qaudio'),r=await c.match(u);if(r)return URL.createObjectURL(await r.blob())}catch(e){}return u}
function qMark(){qAyahs.forEach((a,i)=>{const e=document.getElementById('qa'+i);if(e)e.style.background=i===qIdx?'var(--ac2)':''});const e=document.getElementById('qa'+qIdx);if(e)e.scrollIntoView({block:'center',behavior:'smooth'})}
async function qPlay(i){if(i<0||i>=qAyahs.length){qIdx=-1;qMark();return}qIdx=i;qMark();qa.src=await qSrc(qAyahs[i].n);try{await qa.play()}catch(e){msg='پخش صوت ممکن نشد؛ اتصال اینترنت یا قاری را بررسی کنید.';render()}}
qa.addEventListener('ended',()=>{if(qIdx>=0)qPlay(qIdx+1)});
let qdl={};try{qdl=JSON.parse(localStorage.getItem('qdl')||'{}')}catch(e){}
const qDlKey=()=>qs.rec+'_'+qS,qdlSave=()=>{try{localStorage.setItem('qdl',JSON.stringify(qdl))}catch(e){}};
async function qDownload(){try{const c=await caches.open('qaudio'),b=document.getElementById('qdlb');for(let i=0;i<qAyahs.length;i++){if(b)b.textContent='⏳ '+fa(i+1)+' / '+fa(qAyahs.length);const u=qUrl(qs.rec,qAyahs[i].n);if(!(await c.match(u))){const r=await fetch(u);if(!r.ok)throw new Error('x');await c.put(u,r)}}qdl[qDlKey()]=1;qdlSave()}catch(e){msg='دانلود ناموفق بود؛ اتصال اینترنت یا قاری را بررسی کنید.'}render()}
async function qDelDl(){try{const c=await caches.open('qaudio');for(const a of qAyahs)await c.delete(qUrl(qs.rec,a.n))}catch(e){}delete qdl[qDlKey()];qdlSave();render()}
function qView(app){
  app.append(back(()=>{if(qS){qS=0;try{qa.pause()}catch(e){}qIdx=-1;render()}else{qOpen=false;render()}}),h('h2',{style:'margin-top:10px'},'📖 قرآن کریم'));
  if(PREVIEW){app.append(h('div',{class:'card mu'},'در پیش‌نمایش Claude دسترسی به اینترنت (متن کامل، ترجمه و صوت) بسته است. این بخش در نسخه نصب‌شده کار می‌کند؛ اینجا فقط سوره فاتحه نمونه نمایش داده می‌شود.'));
    if(!qS){app.append(h('button',{on:{click:()=>{qS=1;qAyahs=FAT.map((x,i)=>({n:i+1,i:i+1,ar:x[0],tr:x[1],tf:''}));render()}}},'سوره فاتحه (نمونه)'));return}}
  else if(!qList){qInit();app.append(h('div',{class:'card mu'},'در حال بارگذاری…'));return}
  if(!qS){
    const inp=h('input',{placeholder:'جستجوی سوره (نام یا شماره)',value:qSearch});inp.addEventListener('change',()=>{qSearch=inp.value.trim();render()});app.append(inp);
    const l=qList.filter(s=>!qSearch||String(s.number)===qSearch||(s.englishName||'').toLowerCase().includes(qSearch.toLowerCase())||(s.name||'').includes(qSearch));
    if(!l.length)app.append(h('div',{class:'card mu'},'سوره‌ای یافت نشد یا اتصال اینترنت برقرار نیست.'));
    app.append(h('div',{class:'card'},...l.map(s=>h('div',{class:'item',style:'cursor:pointer',on:{click:()=>qOpenS(s.number)}},h('span',{},fa(s.number)+'.'),h('span',{dir:'rtl',lang:'ar',style:'font-size:20px;flex:1;margin:0 8px'},s.name),h('span',{class:'mu'},(s.englishName||'')+' · '+fa(s.numberOfAyahs)+' آیه')))));return}
  const s=(qList||[]).find(x=>x.number===qS)||{name:'الفاتحة',englishName:'Al-Fatiha',numberOfAyahs:7};
  app.append(h('div',{class:'card',style:'text-align:center'},h('div',{dir:'rtl',lang:'ar',style:'font-size:30px'},s.name),h('div',{class:'mu'},(s.englishName||'')+' · '+fa(s.numberOfAyahs)+' آیه')));
  const sel=(arr,cur,f)=>{const e=h('select',{},...arr);e.value=cur;e.addEventListener('change',()=>f(e.value));return e};
  const trO=(qEds||[]).slice().sort((a,b)=>(a.language||'').localeCompare(b.language||'')).map(e=>h('option',{value:e.identifier},(e.language||'')+' — '+(e.name||e.englishName||e.identifier)));
  const tfO=[h('option',{value:''},'— بدون تفسیر —'),...(qTfs||[]).map(e=>h('option',{value:e.identifier},(e.language||'')+' — '+(e.name||e.englishName||e.identifier)))];
  const ctl=h('div',{class:'card'});
  if(trO.length)ctl.append(h('label',{},'ترجمه'),sel(trO,qTrId(),v=>{qs.tr=v;qsSave();qOpenS(qS)}));
  if(qTfs&&qTfs.length)ctl.append(h('label',{},'تفسیر'),sel(tfO,qs.tf,v=>{qs.tf=v;qsSave();qOpenS(qS)}));
  ctl.append(h('label',{},'قاری (از قاریان مشهور)'),sel(REC.map(r=>h('option',{value:r[0]},r[1])),qs.rec,v=>{qs.rec=v;qsSave();render()}),
    h('div',{class:'row',style:'margin-top:8px'},h('button',{class:'g',on:{click:()=>{qs.size=Math.max(18,qs.size-2);qsSave();render()}}},'A−'),h('button',{class:'g',on:{click:()=>{qs.size=Math.min(44,qs.size+2);qsSave();render()}}},'A+'),h('button',{class:'g',on:{click:()=>{qs.showTr=!qs.showTr;qsSave();render()}}},qs.showTr?'ترجمه: روشن':'ترجمه: خاموش')),
    h('div',{class:'row',style:'margin-top:8px'},h('button',{on:{click:()=>qPlay(0)}},'▶ پخش سوره'),h('button',{class:'g',on:{click:()=>{try{qa.pause()}catch(e){}}}},'⏸ توقف'),
      qdl[qDlKey()]?h('button',{class:'w',on:{click:qDelDl}},'✓ دانلود شده (حذف)'):h('button',{id:'qdlb',class:'g',on:{click:qDownload}},'⬇ دانلود برای شنیدن آفلاین')));
  app.append(ctl);
  if(qLoad){app.append(h('div',{class:'card mu'},'در حال بارگذاری…'));return}
  if(qS!==1&&qS!==9)app.append(h('div',{dir:'rtl',lang:'ar',style:'text-align:center;font-size:'+(qs.size+2)+'px;margin:8px 0'},'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'));
  qAyahs.forEach((a,i)=>app.append(h('div',{id:'qa'+i,class:'card',style:'padding:12px'},h('div',{class:'row',style:'justify-content:space-between'},h('span',{class:'b in'},fa(a.i)),h('button',{class:'g',on:{click:()=>qPlay(i)}},'▶')),
    h('div',{dir:'rtl',lang:'ar',style:"font-family:'Amiri','Scheherazade New','Traditional Arabic','Noto Naskh Arabic',serif;font-size:"+qs.size+"px;line-height:2.2;margin:8px 0"},a.ar),
    qs.showTr&&a.tr?h('div',{style:'font-size:16px;line-height:1.9'},a.tr):null,
    a.tf?h('details',{},h('summary',{},'تفسیر'),h('div',{style:'font-size:15px;line-height:1.9;margin-top:6px'},a.tf)):null)));
  if(qIdx>=0)setTimeout(qMark,0)}
// ================= مسجدیاب =================
let mapOpen=false,mapObj=null,mapRes=[],mapPos=null,mapR=3000,mapBusy='',mapFocus=null;
const hav=(a,b,c,d)=>{const r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,z=Math.sin(x/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)**2;return 12742*Math.asin(Math.sqrt(z))};
const loadLeaflet=()=>new Promise((ok,no)=>{if(window.L)return ok();const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';document.head.append(l);const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';s.onload=ok;s.onerror=no;document.head.append(s)});
const getPos=()=>new Promise((ok,no)=>{const fb=()=>loc?ok(loc):no();if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>ok([p.coords.latitude,p.coords.longitude]),fb,{enableHighAccuracy:true,timeout:12000});else fb()});
async function findMosques(lat,lon,r){const q='[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:'+r+','+lat+','+lon+');way["amenity"="place_of_worship"]["religion"="muslim"](around:'+r+','+lat+','+lon+'););out center tags;';
  const res=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'}});const j=await res.json();
  return j.elements.map(e=>({id:e.type+e.id,lat:e.lat!=null?e.lat:(e.center&&e.center.lat),lon:e.lon!=null?e.lon:(e.center&&e.center.lon),name:(e.tags&&(e.tags['name:fa']||e.tags.name||e.tags['name:ar']||e.tags['name:en']))||'مسجد'})).filter(x=>x.lat!=null&&x.lon!=null)}
async function mapSearch(){mapBusy='در حال یافتن موقعیت…';render();
  try{mapPos=await getPos()}catch(e){mapBusy='';msg='موقعیت در دسترس نیست؛ دسترسی موقعیت را فعال کنید یا در بخش قبله مختصات را وارد کنید.';return render()}
  mapBusy='در حال جست‌وجوی مساجد نزدیک…';render();let list=[];
  try{list=await findMosques(mapPos[0],mapPos[1],mapR)}catch(e){msg='جست‌وجوی مسجد ناموفق بود (اینترنت را بررسی کنید).'}
  const cs=centers.filter(c=>c.lat!==''&&c.lat!=null&&c.lng!==''&&c.lng!=null).map(c=>({id:'c'+c.id,lat:+c.lat,lon:+c.lng,name:c.name,center:true})).filter(x=>hav(mapPos[0],mapPos[1],x.lat,x.lon)*1000<=mapR);
  mapRes=[...list,...cs].map(x=>({...x,d:hav(mapPos[0],mapPos[1],x.lat,x.lon)})).sort((a,b)=>a.d-b.d);mapFocus=null;mapBusy='';render()}
async function mapDraw(div){const base=mapFocus||mapPos;if(!base)return;
  try{await loadLeaflet()}catch(e){div.textContent='نقشه بارگذاری نشد (اینترنت را بررسی کنید).';return}
  if(mapObj){try{mapObj.remove()}catch(e){}mapObj=null}
  const m=L.map(div).setView(base,mapFocus?16:14);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(m);
  const pop=t=>{const d=document.createElement('div');d.textContent=t;return d};
  if(mapPos)L.circleMarker(mapPos,{radius:8,color:'#1a73e8',fillColor:'#1a73e8',fillOpacity:.9}).addTo(m).bindPopup(pop('موقعیت شما'));
  mapRes.forEach(x=>L.circleMarker([x.lat,x.lon],{radius:7,color:x.center?'#d97706':'#1f6f50',fillOpacity:.85}).addTo(m).bindPopup(pop(x.name+' · '+x.d.toFixed(1)+' km')));
  centers.filter(c=>c.lat!==''&&c.lat!=null&&c.lng!==''&&c.lng!=null&&!mapRes.some(x=>x.id==='c'+c.id)).forEach(c=>L.circleMarker([+c.lat,+c.lng],{radius:7,color:'#d97706',fillOpacity:.85}).addTo(m).bindPopup(pop('🏛 '+c.name)));
  mapObj=m}
function mapView(app){
  app.append(back(()=>{mapOpen=false;mapFocus=null;render()}),h('h2',{style:'margin-top:10px'},'🗺 مسجدیاب و مرکزیاب'));
  if(PREVIEW){app.append(h('div',{class:'card mu'},'این بخش به اینترنت آزاد (نقشه و جست‌وجوی مساجد) نیاز دارد و در پیش‌نمایش Claude کار نمی‌کند؛ در نسخه نصب‌شده فعال است.'));return}
  const r=h('select',{},...[[1000,'۱ کیلومتر'],[3000,'۳ کیلومتر'],[5000,'۵ کیلومتر'],[10000,'۱۰ کیلومتر']].map(([v,l])=>h('option',{value:String(v)},l)));r.value=String(mapR);r.addEventListener('change',()=>{mapR=+r.value});
  app.append(h('div',{class:'card'},h('label',{},'شعاع جست‌وجو'),r,h('button',{on:{click:mapSearch}},'📍 نزدیک‌ترین مسجد را پیدا کن'),mapBusy?h('div',{class:'mu',style:'margin-top:8px'},mapBusy):null));
  if(mapPos||mapFocus){const div=h('div',{style:'height:320px;border-radius:14px;margin:10px 0;border:1px solid var(--bd)'});app.append(div);setTimeout(()=>mapDraw(div),0)}
  if(mapPos&&!mapRes.length&&!mapBusy)app.append(h('div',{class:'card mu'},'در این شعاع مسجدی یافت نشد؛ شعاع را بیشتر کنید.'));
  mapRes.slice(0,25).forEach((x,i)=>app.append(h('div',{class:'card'},i===0?h('span',{class:'b in'},'نزدیک‌ترین'):null,h('h2',{style:'margin:6px 0'},(x.center?'🏛 ':'🕌 ')+x.name),h('div',{class:'mu'},fa(x.d.toFixed(1))+' کیلومتر'),
    h('div',{class:'row'},h('a',{class:'btn',href:'https://www.google.com/maps/dir/?api=1&destination='+x.lat+','+x.lon,target:'_blank',rel:'noopener'},'مسیریابی'),h('button',{class:'g',on:{click:()=>{mapFocus=[x.lat,x.lon];render();window.scrollTo(0,0)}}},'روی نقشه')))));
  app.append(h('div',{class:'mu',style:'margin-top:8px'},'داده‌های نقشه: © OpenStreetMap contributors. فهرست مساجد از داده‌های آزاد گرفته می‌شود و ممکن است ناقص باشد.'))}
// ================= معرفی مراکز (ویکی) =================
let cenOpen=false,cenId=null,cenEdit=false,cenHist=false,centers=[],crevs=[],cenQ='';
const CSEC=[['desc','📜 تاریخچه و معرفی'],['founders','👥 بانیان و سازندگان'],['leaders','🕋 والیان و امرای مرکز (به ترتیب زمان)'],['hifz','📖 مدرسه حفظ قرآن'],['teachers','🎓 اساتید']];
const stripId=x=>{const{id,...r}=x;return r};
async function cenSave(c,data,summary,photo){
  try{
    if(!c.id){const r=await db.collection('centers').add({...data,photo:photo||'',rev:1,locked:false,editor:me,created:Date.now(),updated:Date.now()});await db.collection('center_revs').add({cid:r.id,rev:1,by:me,at:Date.now(),summary:summary||'ایجاد صفحه',data});cenId=r.id}
    else{const rev=(c.rev||1)+1;await db.collection('centers').doc(c.id).set({...stripId(c),...data,photo:photo!=null?photo:(c.photo||''),rev,editor:me,updated:Date.now()});await db.collection('center_revs').add({cid:c.id,rev,by:me,at:Date.now(),summary:summary||'ویرایش',data})}
    cenEdit=false;cenHist=false;msg=''}catch(e){msg='ذخیره نشد؛ ثبت‌نام، قفل بودن صفحه یا حجم عکس را بررسی کنید.'}
  render()}
function cenEditor(app){
  const c=centers.find(x=>x.id===cenId)||{};
  app.append(back(()=>{cenEdit=false;render()}),h('h2',{style:'margin-top:10px'},c.id?'✏️ ویرایش: '+c.name:'➕ مرکز جدید'));
  if(c.locked&&!isAdmin){app.append(h('div',{class:'card mu'},'این صفحه توسط ادمین قفل شده است.'));return}
  const f={},I=(k,l,t='text',ph='')=>{const i=h('input',{type:t,placeholder:ph,step:'any'});i.value=c[k]!=null?c[k]:'';f[k]=i;return h('div',{},h('label',{},l),i)},T=(k,l,ph)=>{const t=h('textarea',{rows:4,placeholder:ph||''});t.value=c[k]||'';f[k]=t;return h('div',{},h('label',{},l),t)};
  const ph=h('input',{type:'file',accept:'image/*'}),sm=h('input',{placeholder:'خلاصه تغییر (مثلاً: افزودن اساتید)'}),bt=h('button',{},'ذخیره');
  const here=h('button',{class:'g',on:{click:async()=>{try{const p=await getPos();f.lat.value=p[0];f.lng.value=p[1]}catch(e){msg='موقعیت در دسترس نیست';render()}}}},'📍 موقعیت فعلی من');
  bt.onclick=async()=>{const g=k=>f[k].value.trim(),num=s=>{const n=parseFloat(String(s).replace(',','.'));return isNaN(n)?'':n};
    if(!g('name')){msg='نام مرکز را وارد کنید';return render()}if(g('website')&&!safe(g('website'))){msg='وب‌سایت باید با https شروع شود';return render()}
    bt.disabled=true;bt.textContent='در حال ذخیره…';let photo;try{if(ph.files[0])photo=await up(ph.files[0],'centers',true)}catch(e){msg='عکس ذخیره نشد';return render()}
    cenSave(c,{name:g('name'),country:g('country'),city:g('city'),address:g('address'),lat:num(g('lat')),lng:num(g('lng')),founded:g('founded'),website:g('website'),desc:g('desc'),founders:g('founders'),leaders:g('leaders'),hifz:g('hifz'),teachers:g('teachers')},sm.value.trim(),photo!==undefined?photo:(c.id?undefined:''))};
  app.append(h('div',{class:'card'},h('div',{class:'mu',style:'margin-bottom:8px'},'اطلاعات را دقیق و بی‌طرفانه بنویسید. همه ویرایش‌ها با نام ویرایشگر در تاریخچه ثبت می‌شود.'),
    I('name','نام مرکز'),I('country','کشور'),I('city','شهر'),I('address','آدرس'),I('lat','عرض جغرافیایی (اختیاری)','number'),I('lng','طول جغرافیایی (اختیاری)','number'),here,I('founded','سال تأسیس'),I('website','وب‌سایت (https://…)'),
    T('desc','📜 تاریخچه و معرفی'),T('founders','👥 بانیان (هر خط یک نفر)'),T('leaders','🕋 والیان و امرا به ترتیب (هر خط: سال — نام — سمت)'),T('hifz','📖 مدرسه حفظ قرآن (سال تأسیس و افتتاح، توضیح)'),T('teachers','🎓 اساتید (هر خط یک نفر)'),
    h('label',{},'عکس'),ph,sm,bt))}
function cenHistory(app,c){
  const l=crevs.filter(r=>r.cid===c.id).sort((a,b)=>b.rev-a.rev);
  app.append(h('h2',{style:'margin-top:10px'},'🕘 تاریخچه ویرایش‌ها: '+c.name));
  if(!l.length)app.append(h('div',{class:'card mu'},'ویرایشی ثبت نشده است.'));
  l.forEach(r=>app.append(h('div',{class:'card'},h('b',{},'نسخه '+fa(r.rev)),h('div',{class:'mu'},nm(r.by)+' · '+new Date(r.at).toLocaleString(LOC())),h('div',{},r.summary||'—'),
    h('details',{},h('summary',{},'مشاهده محتوا'),h('div',{style:'white-space:pre-wrap;font-size:14px'},Object.entries(r.data||{}).filter(([k,v])=>v!==''&&v!=null).map(([k,v])=>k+': '+v).join('\n'))),
    isAdmin?h('button',{class:'w',style:'margin-top:6px',on:{click:()=>cenSave(c,{...r.data},'بازگردانی به نسخه '+r.rev)}},'بازگردانی'):null)))}
function cenView(app){
  if(cenEdit)return cenEditor(app);
  const c=centers.find(x=>x.id===cenId);if(cenId&&!c)cenId=null;
  if(!c){
    const q=h('input',{placeholder:'جستجوی مرکز (نام، شهر یا کشور)',value:cenQ});q.addEventListener('change',()=>{cenQ=q.value.trim();render()});
    app.append(back(()=>{cenOpen=false;render()}),h('h2',{style:'margin-top:10px'},'🏛 معرفی مراکز تبلیغ'),h('div',{class:'mu',style:'margin-bottom:8px'},'مانند ویکی‌پدیا: هر کاربر ثبت‌نام‌شده می‌تواند مرکز اضافه یا صفحه‌ها را ویرایش کند؛ همه ویرایش‌ها در تاریخچه ثبت می‌شود و ادمین می‌تواند آن‌ها را بازگرداند.'),
      h('button',{on:{click:()=>{if(guest()){regOpen=true;render();return}cenEdit=true;cenId=null;render()}}},'+ افزودن مرکز'),q);
    const l=centers.filter(x=>!cenQ||((x.name||'')+' '+(x.city||'')+' '+(x.country||'')).includes(cenQ)).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    if(!l.length)app.append(h('div',{class:'card mu'},'مرکزی ثبت نشده است. اولین مرکز را اضافه کنید.'));
    l.forEach(x=>app.append(h('div',{class:'card',style:'cursor:pointer',on:{click:()=>{cenId=x.id;window.scrollTo(0,0);render()}}},h('div',{class:'row',style:'flex-wrap:nowrap;align-items:flex-start'},x.photo?pic(x.photo,'cv'):h('div',{class:'cv',style:'display:flex;align-items:center;justify-content:center;font-size:30px;background:var(--ac2)'},'🏛'),h('div',{style:'flex:1'},h('b',{},x.name),h('div',{class:'mu'},[x.city,x.country].filter(Boolean).join('، ')+(x.founded?' · تأسیس '+x.founded:'')),h('div',{class:'mu',style:'font-size:12px'},'نسخه '+fa(x.rev||1)))))));
    return}
  app.append(back(()=>{if(cenHist){cenHist=false}else{cenId=null}render()}));
  if(cenHist)return cenHistory(app,c);
  app.append(pic(c.photo),h('h2',{},'🏛 '+c.name),c.locked?h('span',{class:'b out'},'🔒 قفل‌شده توسط ادمین'):null);
  const rows=[['کشور',c.country],['شهر',c.city],['آدرس',c.address],['سال تأسیس',c.founded]].filter(x=>x[1]);
  app.append(h('div',{class:'card'},...rows.map(([k,v])=>h('div',{class:'item'},h('span',{class:'mu'},k),h('span',{},v))),safe(c.website)?h('a',{class:'btn',style:'margin-top:8px',href:c.website,target:'_blank',rel:'noopener'},'وب‌سایت'):null));
  CSEC.forEach(([k,t])=>{if(c[k])app.append(h('div',{class:'card'},h('h2',{},t),h('div',{style:'white-space:pre-wrap;line-height:1.9'},c[k])))});
  const hasLoc=c.lat!==''&&c.lat!=null&&c.lng!==''&&c.lng!=null;
  app.append(h('div',{class:'row'},h('button',{on:{click:()=>{if(guest()){regOpen=true;render();return}cenEdit=true;render()}}},'✏️ ویرایش'),h('button',{class:'g',on:{click:()=>{cenHist=true;render()}}},'🕘 تاریخچه ('+fa(crevs.filter(r=>r.cid===c.id).length)+')'),hasLoc?h('button',{class:'g',on:{click:()=>{cenOpen=false;mapOpen=true;mapFocus=[+c.lat,+c.lng];render()}}},'🗺 روی نقشه'):null));
  if(isAdmin)app.append(h('div',{class:'row',style:'margin-top:8px'},h('button',{class:'w',on:{click:()=>db.collection('centers').doc(c.id).set({...stripId(c),locked:!c.locked}).catch(()=>{msg='انجام نشد';render()})}},c.locked?'🔓 باز کردن قفل':'🔒 قفل صفحه'),h('button',{class:'w',on:{click:()=>confirm('صفحه حذف شود؟')&&db.collection('centers').doc(c.id).delete().then(()=>{cenId=null;render()}).catch(()=>{msg='حذف نشد';render()})}},'🗑 حذف')))}
render();start();
