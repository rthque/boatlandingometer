/** Resolve private worker scripts and public decoder URLs without plaintext module hosting. */
export function linkApplication(app,base,create){
 const urls=new Map(),all=[];
 const replace=(text,own)=>{
  text=text.replaceAll('import.meta.url',JSON.stringify(new URL(own,base).href));
  for(const m of app.modules)if(urls.has(m.name))for(const ref of [app.base+m.name,'./'+m.name,m.name,'./'+m.name.split('/').pop(),m.name.split('/').pop()])for(const quote of ['"',"'",'`'])text=text.replaceAll(quote+ref+quote,JSON.stringify(urls.get(m.name)));
  return text.replace(/(["'`])(\/[^"'`\s]+\.(?:wasm|js))\1/g,(_,q,p)=>JSON.stringify(new URL(p,base).href));
 };
 for(const m of app.modules.filter(m=>m.worker)){const u=create(replace(m.source,m.name));all.push(u);urls.set(m.name,u);}
 const entry=app.modules.find(m=>m.name===app.entry&&!m.worker);if(!entry)throw Error('entry');
 const u=create(replace(entry.source,entry.name));all.push(u);return{entry:u,urls:all};
}
