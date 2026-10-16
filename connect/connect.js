const endpoint='https://omhelpzpkowcncvqfnuw.supabase.co/functions/v1/mcp-auth';
const el=id=>document.getElementById(id);
const id=new URLSearchParams(location.search).get('authorization_id');
const storageKey='flowcap-phone-approval-'+id;
let pairing,timer,stopped=false;
function forget(){try{sessionStorage.removeItem(storageKey);}catch{}}
function formatCode(code){return code.slice(0,4)+'-'+code.slice(4);}
function fail(message){stopped=true;clearTimeout(timer);el('status').textContent=message;el('restart').hidden=false;el('pairing').hidden=true;forget();}
async function call(route,body){
 const response=await fetch(endpoint+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error(String(response.status));
 return response.json();
}
async function poll(){
 if(stopped)return;
 if(Date.now()>=Date.parse(pairing.expires_at)){fail('This code expired. Start connecting again in Claude or Codex.');return;}
 try{
  const state=await call('/pair/status',{id:pairing.id,secret:pairing.secret});
  if(state.status==='approved'){
   const next=new URL(state.redirect_url);
   if(next.origin!==new URL(endpoint).origin||next.pathname!==new URL(endpoint).pathname+'/callback')throw Error('Invalid destination');
   stopped=true;forget();el('heading').textContent='Access approved';el('instructions').textContent='Return to Claude or Codex to finish connecting.';el('pairing').hidden=true;el('footnote').hidden=true;el('status').textContent='';location.replace(next.href);return;
  }
  if(['failed','expired'].includes(state.status)){fail('This request is no longer available. Start connecting again in your AI app.');return;}
  el('status').textContent=state.status==='processing'?'Finishing approval…':'Waiting for your iPhone…';
  timer=setTimeout(poll,2500);
 }catch{el('status').textContent='Reconnecting… Keep this page open.';timer=setTimeout(poll,5000);}
}
async function start(){
 if(!id||!/^[A-Za-z0-9_-]{16,256}$/.test(id)){fail('Start connecting from Claude or Codex to get a code.');return;}
 try{pairing=JSON.parse(sessionStorage.getItem(storageKey));}catch{}
 if(!pairing||Date.parse(pairing.expires_at)<=Date.now()){
  pairing=await call('/pair/start',{authorization_id:id});try{sessionStorage.setItem(storageKey,JSON.stringify(pairing));}catch{}
 }
 const formattedCode=formatCode(pairing.code);
 el('code').textContent=formattedCode;el('pairing').hidden=false;
 el('copy').onclick=async()=>{try{await navigator.clipboard.writeText(formattedCode);el('copy').textContent='Copied';}catch{el('status').textContent='Enter the code shown above on your iPhone.';}};
 await poll();
}
start().catch(()=>fail('Could not prepare this connection. Start again in Claude or Codex, or contact support@flowcap.me.'));
