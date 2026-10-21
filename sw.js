const CACHE='lamely-v29';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const PDF='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(CORE);
  try {await cache.add(new Request(PDF,{mode:'cors'}));}catch(e){console.warn('PDF knižnica sa neuložila:',e)}
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('lamely-')&&n!==CACHE).map(n=>caches.delete(n)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin===self.location.origin){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const hit=await cache.match(req,{ignoreSearch:true});
   const fresh=fetch(req).then(res=>{if(res.ok)cache.put(req,res.clone());return res}).catch(()=>null);
   if(hit){event.waitUntil(fresh);return hit}
   return await fresh || Response.error();
  })());return;
 }
 if(url.href===PDF){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);const hit=await cache.match(req);
   if(hit)return hit;
   try{const res=await fetch(req);if(res.ok)await cache.put(req,res.clone());return res}catch(e){return Response.error()}
  })());
 }
});
