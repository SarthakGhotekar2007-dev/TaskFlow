import urllib.request
import urllib.parse
import urllib.error
import json

def run():
    # Login
    data2 = json.dumps({"email":"test3@test.com", "password":"password"}).encode('utf-8')
    req2 = urllib.request.Request("http://127.0.0.1:8000/auth/login", data=data2, headers={"Content-Type":"application/json"})
    try:
        resp2 = urllib.request.urlopen(req2)
        token = json.loads(resp2.read().decode())["access_token"]
    except urllib.error.HTTPError as e:
        print("LOGIN ERROR:", e.read().decode())
        return

    # Fetch activity
    req3 = urllib.request.Request("http://127.0.0.1:8000/tasks/activity", headers={"Authorization": f"Bearer {token}"})
    try:
        resp3 = urllib.request.urlopen(req3)
        print("Success:", resp3.read().decode())
    except urllib.error.HTTPError as e:
        print("ACTIVITY ERROR:", e.code)
        print("BODY:", e.read().decode())

run()
