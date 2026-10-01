// Refresh HTML asset URLs after changing JavaScript or CSS; no runtime network calls.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
for(const name of fs.readdirSync(__dirname).filter(n=>n.endsWith('.html'))){
 const file=path.join(__dirname,name),html=fs.readFileSync(file,'utf8');
 const updated=html.replace(/(\b(?:src|href)=")([^"?:]+\.(?:js|css))(?:\?[^"\s]*)?(")/g,(_,prefix,asset,suffix)=>{
  const digest=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,asset))).digest('hex').slice(0,12);
  return prefix+asset+'?asset='+digest+suffix;
 });
 if(updated!==html)fs.writeFileSync(file,updated);
}
