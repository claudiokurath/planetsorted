"""Refresh only Notion-published public Gamma sources using a short-lived GitHub identity.
No Notion, Supabase or cron secret is copied into GitHub Actions.
"""
import argparse,importlib.util,json,os,re,sys,time,urllib.request,urllib.error
from urllib.parse import urlparse,quote
from pathlib import Path
SITE='https://www.planetsorted.com'
MANIFEST=SITE+'/api/content/presentations'
CRM=SITE+'/api/cron/sync-crm'

def read(url,headers=None,data=None):
 req=urllib.request.Request(url,headers=headers or {},data=data)
 with urllib.request.urlopen(req,timeout=285) as r:return json.loads(r.read().decode())

def identity(audience):
 url=os.environ['ACTIONS_ID_TOKEN_REQUEST_URL']
 url+=('&' if '?' in url else '?')+'audience='+quote(audience,safe='')
 return read(url,{'Authorization':'Bearer '+os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})['value']

def publish(payload):
 return read(MANIFEST,{'Authorization':'Bearer '+identity(MANIFEST),'Content-Type':'application/json'},json.dumps(payload).encode())

def load_manifest():
 for attempt in range(20):
  try:return read(MANIFEST)['entries']
  except urllib.error.HTTPError as e:
   if e.code not in [404,500,502,503,504] or attempt==19:raise
  time.sleep(15) # First deployment may still be publishing the new endpoint.
 raise RuntimeError('Published-source manifest unavailable')

def capture(entry,extract):
 slug,source=entry['slug'],entry['sourceId']
 if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug) or not re.fullmatch(r'[A-Za-z0-9]{5,80}',source):raise ValueError('Invalid public source')
 req=urllib.request.Request('https://gamma.app/docs-robot/'+source,headers={'User-Agent':'Mozilla/5.0 (compatible; SOR7ED public content sync)','Accept':'text/html'})
 with urllib.request.urlopen(req,timeout=45) as r:
  if urlparse(r.url).hostname!='gamma.app':raise ValueError('Unexpected public-source redirect')
  raw=r.read(5_000_001)
 if len(raw)>5_000_000:raise ValueError('Public document too large')
 match=re.search(r'<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)</script>',raw.decode(),re.S)
 if not match:raise ValueError('Public presentation unavailable')
 props=json.loads(match.group(1))['props']['pageProps']
 if props['doc']['id']!=source:raise ValueError('Public source mismatch')
 data=extract(props)
 for card in data['cards']:
  approved=[]
  for image in card['images']:
   url=urlparse(image['url'])
   if url.scheme=='https' and url.hostname=='cdn.gamma.app':
    approved.append({'src':image['url'],'width':image.get('width') or 1200,'height':image.get('height') or 800})
  card['images']=approved
 return {'slug':slug,'sourceId':source,'sourceUpdatedAt':props['doc']['updatedTime'],'data':data}

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--crm-only',action='store_true');args=parser.parse_args()
 if args.crm_only:
  result=read(CRM,{'Authorization':'Bearer '+identity(CRM)})
  print('CRM reconciliation:',json.dumps(result));return
 path=Path(__file__).with_name('import-gamma-presentations.py')
 spec=importlib.util.spec_from_file_location('gamma_import',path);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 failed=[]
 for entry in load_manifest():
  try:
   publish(capture(entry,module.extract));print('Updated public presentation:',entry['slug'],flush=True)
  except Exception as e:
   # Mark failed reads explicitly. Never replace them with a stale imported deck.
   try:publish({'slug':entry['slug'],'sourceId':entry['sourceId'],'error':True})
   except Exception:pass
   failed.append(entry['slug']);print('::error::Public presentation refresh failed: '+entry['slug']+' ('+type(e).__name__+')',flush=True)
 if failed:raise SystemExit('Refresh failed for '+', '.join(failed))
 print('All current Notion-published public presentations refreshed.',flush=True)
if __name__=='__main__':main()
