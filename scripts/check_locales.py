#!/usr/bin/env python3
"""Check every localized route, link, anchor, media asset and translation structure."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from collections import Counter
import json, re, subprocess, xml.etree.ElementTree as ET
import localize as l

ROOT=l.ROOT

def walk(n):
 yield n
 for c in n.children:
  if isinstance(c,l.Node):yield from walk(c)

def shape(n):
 # Inline translation may reorder emphasis/links; it may not lose or invent markup.
 return Counter((x.tag,tuple(sorted((k,v) for k,v in x.attrs.items() if k in ('class','id')))) for x in walk(n) if x.tag)

pages={}
for lang in l.LANGUAGES:
 for p in l.PAGES:
  f=ROOT/(p if lang=='en' else l.PREFIX[lang]+'/'+p)
  text=f.read_text();root=l.parse(text);nodes=list(walk(root));pages[f]=nodes
  assert not re.search(r'ZQX\d+XQZ|FCPROTECTED',text),f
  assert next(n for n in nodes if n.tag=='html').attrs['lang']==lang,f
  assert len([n for n in nodes if n.tag=='h1'])==1,f
  ids=[n.attrs['id'] for n in nodes if n.attrs.get('id')];assert len(ids)==len(set(ids)),f
  langs=[n.attrs.get('hreflang') for n in nodes if n.tag=='link' and n.attrs.get('rel')=='alternate']
  assert set(langs)==set(l.LANGUAGES)|{'x-default'},f
  for n in nodes:
   if n.tag=='script' and n.attrs.get('type')=='application/ld+json':json.loads(n.inner())
  if p!='connect/index.html':
   canonical=next(n.attrs['href'] for n in nodes if n.tag=='link' and n.attrs.get('rel')=='canonical')
   assert canonical=='https://flowcap.me'+l.localized_url(l.route(p),lang),(f,canonical)
  else:assert any(n.tag=='meta' and n.attrs.get('name')=='robots' and 'noindex' in n.attrs.get('content','') for n in nodes),f
  if lang!='en':
   # Screenshots, commands, code examples, section IDs and download targets must survive.
   original=list(walk(l.parse(l.source_text(p))))
   assert {n.attrs['id'] for n in original if n.attrs.get('id')}==set(ids),(f,'section ids')
   assert [n.inner() for n in original if n.tag in ('code','pre')]==[n.inner() for n in nodes if n.tag in ('code','pre')],(f,'code')
   def external_links(ns):
    return sorted(n.attrs['href'] for n in ns if n.attrs.get('href','').startswith(('https://','http://','mailto:')) and not n.attrs['href'].startswith('https://flowcap.me'))
   assert external_links(original)==external_links(nodes),(f,'external links')
   for tag in ['svg','figure','video','img','details','h1','h2','h3','a','strong']:
    expected=sum(n.tag==tag for n in original)
    actual=sum(n.tag==tag for n in nodes)
    if tag=='svg':expected+=2 # Language control icons.
    if tag=='details':expected+=1
    if tag=='a':expected+=8+(1 if p in ('privacy/index.html','terms/index.html') else 0)
    assert expected==actual,(f,tag,expected,actual)

for f,nodes in pages.items():
 for n in nodes:
  attrs=n.attrs
  refs=[attrs[k] for k in ('href','src','data-src','data-src-mobile','poster') if attrs.get(k)]
  refs += [part.strip().split()[0] for part in attrs.get('srcset','').split(',') if part.strip()]
  for ref in refs:
   u=urlsplit(ref)
   if u.scheme or u.netloc:continue
   path=unquote(u.path)
   target=(ROOT/path.lstrip('/')) if path.startswith('/') else (f.parent/path)
   if not path:target=f
   if target.is_dir():target=target/'index.html'
   assert target.exists(),(f,ref,target)
   if u.fragment and target.suffix=='.html':
    ns=pages.get(target) or list(walk(l.parse(target.read_text())))
    assert any(x.attrs.get('id')==u.fragment for x in ns),(f,'anchor',ref)

# Localized legal pages add translations; authoritative English body copy is untouched.
for p in ['privacy/index.html','terms/index.html']:
 old=subprocess.check_output(['git','show','HEAD:'+p],cwd=ROOT).decode()
 def content(text):return re.search(r'<main\b[\s\S]*?</main>',text)[0]
 assert content(old)==content((ROOT/p).read_text()),p
for f in (ROOT/'mcp/downloads').glob('*'):
 if f.is_file():assert f.read_bytes()==subprocess.check_output(['git','show','HEAD:'+str(f.relative_to(ROOT))],cwd=ROOT),f
ET.parse(ROOT/'sitemap.xml')
print(json.dumps({'pages':len(pages),'languages':len(l.LANGUAGES),'links_assets_anchors':'OK','metadata':'OK','media_commands_and_structure':'OK','English_legal_body_and_downloads':'unchanged'}))
