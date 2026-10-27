#!/usr/bin/env python3
"""Generate static translations from English pages and reviewed HTML catalogues.
No runtime translation service or build step is used by GitHub Pages.
"""
from html.parser import HTMLParser
from html import escape, unescape
from pathlib import Path
import json, re, hashlib

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = {'en':'English','ru':'Русский','es':'Español','de':'Deutsch','fr':'Français','pt-BR':'Português (Brasil)','ja':'日本語','zh-CN':'简体中文'}
PREFIX = {k: k.lower() for k in LANGUAGES}
PAGES = ['index.html','mcp/index.html','guides/index.html','guides/record-iphone-app/index.html','guides/voice-comments/index.html','guides/send-screens-to-ai/index.html','support/index.html','privacy/index.html','terms/index.html','connect/index.html']
ROUTES = {'/' + p.removesuffix('index.html'): p for p in PAGES}
SKIP = {'script','style','svg','code','pre'}
BLOCKS = {'p','h1','h2','h3','h4','li','figcaption','summary','a','label','button','span','time','title','dt','dd'}
STRUCTURAL = {'p','h1','h2','h3','h4','ul','ol','li','div','figure','section','details'}
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
KEEP = {'Flow Capture','Claude','Codex','Figma','ZIP','PDF','MCP','OAuth','AI','Pro','iPhone','iOS','Supabase','Cloudflare','GitHub Pages','Google Fonts','App Store','Flow Capture Pro','support@flowcap.me','—','/','↗','© 2026 Flow Capture'}
# Commands must match the current English application interface.
UI_LABELS = ['Settings → Account → Delete Account','Codex & Claude','Send Screens','Share Answers & Usage','Add a Computer','Select Screens','Share','Export for Codex or Claude','Settings','Integrations','Customize','Connectors','Privacy & Data','Start Broadcast','Microphone','Finish Recording','Send to AI','Share Answers & Usage','Settings → Privacy & Data','Settings → Codex & Claude → Shared Access','Settings › Account › Delete Account','Settings → Codex & Claude','Settings → Integrations','Voice Commentary','Polish Voice Comments','Frame Editor','Flow Map','Shared Access','Copy Request','Review Complete']

MESSAGES = [
 'Copied','Copied to clipboard.','Select and copy the highlighted text.','Select text to copy',
 'This code expired. Start connecting again in Claude.','Access approved','Return to Claude to finish connecting.',
 'This request is no longer available. Start connecting again in your AI app.','Finishing approval…','Waiting for your iPhone…',
 'Reconnecting… Keep this page open.','Start connecting from Claude to get a code.','Enter the code shown above on your iPhone.',
 'Connect reviewer account','Sign in with the dedicated test account, then confirm read access for the requesting AI app.',
 'Could not prepare this connection. Start again in Claude, or contact support@flowcap.me.'
]

class Node:
 def __init__(self,tag='',attrs=(),start='',children=None,end=''):
  self.tag=tag;self.attrs=dict(attrs);self.start=start;self.children=[] if children is None else children;self.end=end
 def raw(self): return self.start+''.join(c.raw() if isinstance(c,Node) else c for c in self.children)+self.end
 def inner(self):return ''.join(c.raw() if isinstance(c,Node) else c for c in self.children)

class Parser(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=False);self.root=Node();self.stack=[self.root];self.feed(text)
 def handle_starttag(self,t,a):
  n=Node(t,a,self.get_starttag_text());self.stack[-1].children.append(n)
  if t not in VOID:self.stack.append(n)
 def handle_startendtag(self,t,a):self.stack[-1].children.append(Node(t,a,self.get_starttag_text()))
 def handle_endtag(self,t):
  if len(self.stack)>1 and self.stack[-1].tag==t:self.stack.pop().end='</'+t+'>'
  else: raise ValueError('Unbalanced '+t)
 def handle_data(self,s):self.stack[-1].children.append(s)
 def handle_entityref(self,n):self.handle_data('&'+n+';')
 def handle_charref(self,n):self.handle_data('&#'+n+';')
 def handle_comment(self,s):self.handle_data('<!--'+s+'-->')
 def handle_decl(self,s):self.handle_data('<!'+s+'>')

# Rejoin split entities/comments before collecting text leaves.
def merge(n):
 out=[]
 for c in n.children:
  if isinstance(c,Node):merge(c);out.append(c)
  elif out and isinstance(out[-1],str):out[-1]+=c
  else:out.append(c)
 n.children=out

def translatable(s):
 plain=unescape(re.sub('<[^>]+>','',s)).strip()
 return bool(re.search('[A-Za-z]',plain)) and plain not in KEEP and not re.fullmatch(r'[\d\W]+|https?://\S+|[\w.+-]+@[\w.-]+',plain)

def entries(n):
 if n.tag=='script' and n.attrs.get('type')=='application/ld+json':
  yield from json_strings(json.loads(n.inner()))
  return
 if n.tag in SKIP:return
 children=[c for c in n.children if isinstance(c,Node)]
 if n.tag in BLOCKS and not any(c.tag in STRUCTURAL for c in children):
  if translatable(n.inner()):yield n.inner()
 else:
  for c in n.children:
   if isinstance(c,Node):yield from entries(c)
   elif translatable(c) and not c.lstrip().startswith(('<!','<!--')):yield c.strip()
 for a in ('alt','aria-label','title','placeholder'):
  if n.attrs.get(a) and translatable(n.attrs[a]):yield n.attrs[a]
 if n.tag=='meta' and (n.attrs.get('name') in ['description','twitter:title','twitter:description'] or n.attrs.get('property') in ['og:title','og:description']):yield n.attrs['content']
 if n.tag=='script' and n.attrs.get('type')=='application/ld+json':
  yield from json_strings(json.loads(n.inner()))

def json_strings(o):
 if isinstance(o,dict):
  for k,v in o.items():
   if k in ('name','headline','description') and isinstance(v,str) and translatable(v):yield v
   elif isinstance(v,(dict,list)):yield from json_strings(v)
 elif isinstance(o,list):
  for v in o:yield from json_strings(v)

def parse(text):
 p=Parser(text);merge(p.root);return p.root

def source_text(p):
 text=(ROOT/p).read_text()
 text=re.sub(r'<!-- language-switcher -->[\s\S]*?<!-- /language-switcher -->','',text)
 text=re.sub(r'<!-- locale-head -->[\s\S]*?<!-- /locale-head -->','',text)
 text=re.sub(r'<span class="nav-label-full">([\s\S]*?)</span><span class="nav-label-short" aria-hidden="true">MCP</span>',r'\1',text)
 return text

def all_entries():
 return list(dict.fromkeys([s for p in PAGES for s in entries(parse(source_text(p)))]+MESSAGES))

def mask(s):
 tokens={}
 def protect(m):
  token='ZQX'+str(len(tokens)).zfill(4)+'XQZ';tokens[token]=m.group(0);return token
 s=re.sub(r'<(svg|code|pre)\b[\s\S]*?</\1>',protect,s)
 # Keep product names, menu commands, endpoints and email exact.
 words=['Flow Capture','Claude','Codex','Figma','Supabase','Cloudflare','GitHub Pages','Google Fonts','App Store',*UI_LABELS]
 words += [w.replace('&','&amp;') for w in words if '&' in w]
 s=re.sub('|'.join(re.escape(w) for w in sorted(words,key=len,reverse=True)),protect,s)
 return s,tokens

def restore(s,tokens):
 for k,v in tokens.items():
  s=re.sub(re.escape(k),lambda m:v,s,flags=re.I)
  # A missing token is a hard failure, never silently publish mangled commands.
  if k.lower() in s.lower():raise ValueError('Unrestored token '+k)
 return s

def route(p):return '/'+p.removesuffix('index.html')
def localized_url(url,lang):
 from urllib.parse import urlsplit
 external=url.startswith('https://flowcap.me')
 u=url.removeprefix('https://flowcap.me') if external else url
 path=re.split('[?#]',u)[0]
 if path in ROUTES and lang!='en':u='/'+PREFIX[lang]+u
 return ('https://flowcap.me' if external else '')+u

LABELS={
 'en':('Choose language','Language versions','This is a translation. Read the English original.'),
 'ru':('Выбрать язык','Языковые версии','Это перевод. Читать оригинал на английском.'),
 'es':('Elegir idioma','Versiones por idioma','Esta es una traducción. Consulta el original en inglés.'),
 'de':('Sprache wählen','Sprachversionen','Dies ist eine Übersetzung. Englisches Original lesen.'),
 'fr':('Choisir la langue','Versions linguistiques','Ceci est une traduction. Lire la version originale en anglais.'),
 'pt-BR':('Escolher idioma','Versões por idioma','Esta é uma tradução. Leia o original em inglês.'),
 'ja':('言語を選択','言語別ページ','このページは翻訳です。英語の原文をご確認ください。'),
 'zh-CN':('选择语言','语言版本','此页面为译文。请参阅英文原文。')}

def switcher(path,lang):
 code={'pt-BR':'PT','zh-CN':'中文','ja':'日本語'}.get(lang,lang.upper())
 globe='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg>'
 arrow='<svg class="language-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m5 6 3 3 3-3"/></svg>'
 links=''.join('<a href="'+localized_url(path,k)+'" lang="'+k+'" hreflang="'+k+'"'+(' aria-current="true"' if k==lang else '')+'>'+v+('</a>') for k,v in LANGUAGES.items())
 return '<details class="language-switcher"><summary aria-label="'+LABELS[lang][0]+'">'+globe+'<span>'+code+'</span>'+arrow+'</summary><nav class="language-options" aria-label="'+LABELS[lang][1]+'">'+links+'</nav></details>'

def enhance_english(text,p):
 # Keep the source pages editable and regenerate only this marked addition.
 text=re.sub(r'<!-- language-switcher -->[\s\S]*?<!-- /language-switcher -->','',text)
 text=re.sub(r'<!-- locale-head -->[\s\S]*?<!-- /locale-head -->','',text)
 path=route(p)
 control='<!-- language-switcher -->'+switcher(path,'en')+'<!-- /language-switcher -->'
 if p=='connect/index.html':text=text.replace('<body>','<body>'+control) if '<body>' in text else re.sub(r'(<body[^>]*>)',lambda m:m[0]+control,text,count=1)
 else:
  match=re.search(r'<div class="nav-links">[\s\S]*?</div>',text)
  assert match,p
  text=text[:match.end()]+control+text[match.end():]
 head='<!-- locale-head --><link rel="stylesheet" href="/locales/languages.css?v=20261027-6"><script src="/locales/languages.js?v=20261027-1" defer></script>'+alternates(path)+'<!-- /locale-head -->'
 text=text.replace('</head>',head+'</head>')
 text=compact_nav(text)
 return text

def compact_nav(text):
 pattern=r'(<div class="nav-links"><a[^>]*>)([\s\S]*?)(</a>)'
 def repl(m):
  label=re.sub('<[^>]*>','',m[2]).replace('MCPMCP','MCP')
  if 'nav-label-full' in m[2]:label=re.search(r'<span class="nav-label-full">([\s\S]*?)</span>',m[2])[1]
  opening=re.sub(r' aria-label="[^"]*"','',m[1][:-1])+' aria-label="'+escape(unescape(label),quote=True)+'">'
  return opening+'<span class="nav-label-full">'+label+'</span><span class="nav-label-short" aria-hidden="true">MCP</span>'+m[3]
 return re.sub(pattern,repl,text,count=1)

def alternates(path):
 return ''.join('<link rel="alternate" hreflang="'+k+'" href="https://flowcap.me'+localized_url(path,k)+'">' for k in LANGUAGES)+'<link rel="alternate" hreflang="x-default" href="https://flowcap.me'+path+'">'

def translate_page(text,p,lang,catalog):
 # Strip generated UI before translating English source; recreate it in the target language.
 text=re.sub(r'<!-- language-switcher -->[\s\S]*?<!-- /language-switcher -->','',text)
 text=re.sub(r'<!-- locale-head -->[\s\S]*?<!-- /locale-head -->','',text)
 root=parse(text)
 def tr(s):
  if not translatable(s):return s
  if s not in catalog:raise KeyError((lang,s))
  return catalog[s]
 def json_tr(o):
  if isinstance(o,dict):
   return {k:(tr(v) if k in ('name','headline','description') and isinstance(v,str) else localized_url(v,lang) if k in ('url','mainEntityOfPage','item') and isinstance(v,str) else json_tr(v)) for k,v in o.items()}
  if isinstance(o,list):return [json_tr(v) for v in o]
  return o
 def render(n):
  if n.tag in SKIP:
   if n.tag=='script' and n.attrs.get('src'):
    src=n.attrs['src']
    if not re.match(r'[/#]|[a-zA-Z][\w+.-]*:',src):
     absolute='/'+str(Path(p).parent).replace('.', '').strip('/')+('/' if Path(p).parent!=Path('.') else '')+src
     return n.start.replace(src,absolute)+n.inner()+n.end
   if n.tag=='script' and n.attrs.get('type')=='application/ld+json':return n.start+json.dumps(json_tr(json.loads(n.inner())),ensure_ascii=False)+n.end
   return n.raw()
  attrs=dict(n.attrs)
  if n.tag=='html':attrs['lang']=lang
  for a in ('alt','aria-label','title','placeholder'):
   if attrs.get(a):attrs[a]=unescape(tr(attrs[a]))
  if n.tag=='meta':
   if attrs.get('name') in ('description','twitter:title','twitter:description') or attrs.get('property') in ('og:title','og:description'):attrs['content']=unescape(tr(attrs['content']))
   elif attrs.get('property')=='og:url':attrs['content']=localized_url(attrs['content'],lang)
  for a in ('href','src','poster','data-src','data-src-mobile'):
   if attrs.get(a):
    v=attrs[a]
    if not re.match(r'[/#]|[a-zA-Z][\w+.-]*:',v):v='/'+str(Path(p).parent).replace('.', '').strip('/')+('/' if Path(p).parent!=Path('.') else '')+v
    attrs[a]=localized_url(v,lang) if a=='href' else v
  if 'srcset' in attrs:
   attrs['srcset']=re.sub(r'(^|,\s*)(assets/)',r'\1/\2',attrs['srcset'])
  start=n.start
  if attrs!=n.attrs:start='<'+n.tag+''.join(' '+k+('="'+escape(v,quote=True)+'"' if v is not None else '') for k,v in attrs.items())+(' />' if n.start.endswith('/>') else '>')
  children=[c for c in n.children if isinstance(c,Node)]
  if n.tag in BLOCKS and not any(c.tag in STRUCTURAL for c in children):
   inner=tr(n.inner())
   # Parse the translated inline HTML to localize its links and accessibility strings.
   inner=localize_inline(inner,lang)
  else:inner=''.join(render(c) if isinstance(c,Node) else re.sub(r'\S[\s\S]*\S|\S',lambda m:tr(m[0]),c,count=1) if translatable(c) and not c.lstrip().startswith(('<!','<!--')) else c for c in n.children)
  return start+inner+n.end
 out=render(root)
 path=route(p);control=switcher(path,lang)
 if p=='connect/index.html':out=re.sub(r'(<body[^>]*>)',lambda m:m[0]+control,out,count=1)
 else:
  match=re.search(r'<div class="nav-links">[\s\S]*?</div>',out);assert match
  out=out[:match.end()]+control+out[match.end():]
 if p in ('privacy/index.html','terms/index.html'):
  notice='<p class="translation-notice"><a href="'+path+'" lang="en">'+LABELS[lang][2]+'</a></p>'
  out=out.replace('<div class="article-body">',notice+'<div class="article-body">',1)
 head='<link rel="stylesheet" href="/locales/languages.css?v=20261027-6"><script src="/locales/runtime/'+lang+'.js?v=20261027-1" defer></script><script src="/locales/languages.js?v=20261027-1" defer></script>'+alternates(path)
 out=out.replace('</head>',head+'</head>')
 out=compact_nav(out)
 return out

def localize_inline(s,lang):
 def repl(m):
  name,quote,url=m.groups();return name+'='+quote+(localized_url(url,lang) if name=='href' else '/'+url if url.startswith('assets/') else url)+quote
 return re.sub(r'(href|src|poster)=("|\')([^"\']+)\2',repl,s)

def build():
 for p in PAGES:
  source=ROOT/p;text=enhance_english(source_text(p),p);source.write_text(text)
 for lang in LANGUAGES:
  if lang=='en':continue
  catalog=json.loads((ROOT/'locales'/f'{lang}.json').read_text())
  runtime=ROOT/'locales/runtime'/f'{lang}.js';runtime.parent.mkdir(exist_ok=True)
  runtime.write_text('window.flowcapMessages = '+json.dumps({m:catalog[m] for m in MESSAGES},ensure_ascii=False)+';\n')
  for p in PAGES:
   out=ROOT/PREFIX[lang]/p;out.parent.mkdir(parents=True,exist_ok=True)
   out.write_text(translate_page(source_text(p),p,lang,catalog))
 # Public pages only; OAuth approval is deliberately not indexed.
 urls=[]
 for lang in LANGUAGES:
  for p in PAGES:
   if p.startswith('connect/'):continue
   path=route(p)
   links=''.join('<xhtml:link rel="alternate" hreflang="'+k+'" href="https://flowcap.me'+localized_url(path,k)+'" />' for k in LANGUAGES)
   urls.append('<url><loc>https://flowcap.me'+localized_url(path,lang)+'</loc><lastmod>2026-10-27</lastmod>'+links+'</url>')
 (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+'\n'.join(urls)+'\n</urlset>\n')

if __name__=='__main__':
 import sys
 if '--extract' in sys.argv:print(json.dumps(all_entries(),ensure_ascii=False,indent=2))
 else:build()
