"""Import explicitly selected PUBLIC Gamma captures into native presentations.
Input files contain pageProps from Gamma's public /docs/<id> __NEXT_DATA__.
Never use private Protocol Gamma captures here. Requires Pillow for artwork.
"""
import json,re
from html.parser import HTMLParser
from pathlib import Path

def text(node):
 if node.get('type')=='text':return node.get('text','')
 if node.get('type')=='hardBreak':return '\n'
 if node.get('type')=='emoji':return node.get('attrs',{}).get('native','')
 return ''.join(text(c) for c in node.get('content',[]))

def extract(data):
 doc=data['content']; documents=doc.get('content',[])
 if len(documents)!=1 or documents[0].get('type')!='document':raise ValueError('Unexpected Gamma document structure')
 cards=[]
 for card in documents[0].get('content',[]):
  if card.get('type')!='card' or card.get('attrs',{}).get('hidden'):continue
  blocks=[];images=[];seen=set()
  def image(im):
   src=im.get('src') if isinstance(im,dict) else None
   if src and src not in seen:images.append({'url':src,**{k:im.get('meta',{}).get(k) for k in ['width','height']}});seen.add(src)
  def walk(n):
   a=n.get('attrs',{});image(a);image(a.get('background',{}).get('image'))
   t=n.get('type');value=text(n).strip()
   if t in ['title','heading','paragraph','bullet']:
    if value:blocks.append({'kind':'h'+str(a.get('level',1)) if t in ['title','heading'] else 'li' if t=='bullet' else 'p','text':value})
    return
   if t=='smartDiagram':
    class Fragment(HTMLParser):
     def __init__(self):super().__init__();self.kind=None;self.parts=[]
     def handle_starttag(self,tag,attrs):
      if tag in ['h1','h2','h3','h4','p','li']:self.kind=tag;self.parts=[]
      if tag=='br':self.parts.append('\n')
     def handle_data(self,s):self.parts.append(s)
     def handle_endtag(self,tag):
      if self.kind==tag:
       value=''.join(self.parts).strip()
       if value:blocks.append({'kind':tag,'text':value})
       self.kind=None;self.parts=[]
    for step in a.get('data',{}).get('step',[]):
     if isinstance(step.get('text'),str):Fragment().feed(step['text'])
    return
   for c in n.get('content',[]):walk(c)
  walk(card);cards.append({'blocks':blocks,'images':images})
 return {'cards':cards}

def import_captures(input_dir, slugs):
 import hashlib,io,urllib.request
 from urllib.parse import urlparse
 from PIL import Image,ImageOps
 root=Path(__file__).resolve().parents[1]
 output_path=root/'lib/content/nativeGammaCopy.json'
 output=json.loads(output_path.read_text())
 sources=json.loads((root/'lib/content/presentationSources.json').read_text())
 versions_path=root/'lib/content/presentationVersions.json'
 versions=json.loads(versions_path.read_text()) if versions_path.exists() else {}
 for slug in slugs:
  if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug):raise ValueError('Invalid slug')
  data=json.loads((Path(input_dir)/(slug+'.json')).read_text())
  expected=re.search(r'gamma\.app/(?:embed|docs)/([A-Za-z0-9]+)',sources.get(slug,''))
  if not expected or data.get('doc',{}).get('id')!=expected.group(1):raise ValueError('Capture does not match the approved public source: '+slug)
  parsed=extract(data)
  if not parsed['cards'] or not any(c['blocks'] for c in parsed['cards']):raise ValueError('Empty public presentation: '+slug)
  for card in parsed['cards']:
   local=[]
   for image in card['images']:
    url=image['url'];u=urlparse(url)
    if u.scheme!='https' or u.hostname!='cdn.gamma.app':raise ValueError('Unapproved image host: '+u.netloc)
    raw=urllib.request.urlopen(url,timeout=40).read()
    digest=hashlib.sha256(raw).hexdigest()[:16]
    path=Path('public/images/presentations')/(slug+'-'+digest+'.webp')
    im=ImageOps.exif_transpose(Image.open(io.BytesIO(raw)))
    im.thumbnail((2000,2000))
    im=im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
    im.save(root/path,'WEBP',quality=86,method=6)
    local.append({'src':'/'+str(path.relative_to('public')),'width':im.width,'height':im.height})
   card['images']=local
  output[slug]=parsed
  doc=data['doc']
  versions[slug]={'id':doc['id'],'title':doc['title'],'updatedAt':doc['updatedTime']}
  print(slug,len(parsed['cards']),'cards',sum(len(c['images']) for c in parsed['cards']),'images',flush=True)
 output_path.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
 versions_path.write_text(json.dumps(versions,ensure_ascii=False,indent=2)+'\n')

if __name__=='__main__':
 import argparse
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--input-dir',required=True)
 parser.add_argument('--slugs',nargs='+',required=True)
 args=parser.parse_args()
 import_captures(args.input_dir,args.slugs)
