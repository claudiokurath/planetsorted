"""Reconcile account records through an audience-bound, short-lived GitHub identity."""
import json, os, sys, urllib.error, urllib.request
from urllib.parse import quote

ENDPOINT = 'https://www.planetsorted.com/api/cron/sync-crm'

def read(url, bearer):
    req = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + bearer})
    try:
        with urllib.request.urlopen(req, timeout=285) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as error:
        # Print where it failed and the server's error body (never the token).
        body = error.read().decode(errors='replace')[:500]
        print(f'HTTP {error.code} from {url.split("?")[0]}: {body}', file=sys.stderr)
        raise SystemExit(1)

url = os.environ['ACTIONS_ID_TOKEN_REQUEST_URL']
url += ('&' if '?' in url else '?') + 'audience=' + quote(ENDPOINT, safe='')
token = read(url, os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN'])['value']
print('CRM reconciliation:', json.dumps(read(ENDPOINT, token)))
