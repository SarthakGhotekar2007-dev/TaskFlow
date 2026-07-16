import urllib.request
import urllib.parse
import urllib.error
import json

def run():
    try:
        # Register
        data = json.dumps({"username":"test3", "email":"test3@test.com", "password":"password"}).encode('utf-8')
        req1 = urllib.request.Request("http://127.0.0.1:8000/auth/register", data=data, headers={"Content-Type":"application/json"})
        try:
            urllib.request.urlopen(req1)
        except:
            pass # Ignore if already exists

        # Login
        data2 = urllib.parse.urlencode({"username":"test3@test.com", "password":"password"}).encode('utf-8')
        req2 = urllib.request.Request("http://127.0.0.1:8000/auth/login", data=data2, headers={"Content-Type":"application/x-www-form-urlencoded"})
        resp2 = urllib.request.urlopen(req2)
        token = json.loads(resp2.read().decode())["access_token"]

        # Fetch activity
        req3 = urllib.request.Request("http://127.0.0.1:8000/tasks/activity", headers={"Authorization": f"Bearer {token}"})
        try:
            resp3 = urllib.request.urlopen(req3)
            print("Success:", resp3.read().decode())
        except urllib.error.HTTPError as e:
            print("HTTPError:", e.code)
            print("Response:", e.read().decode())

    except Exception as e:
        print("General Error:", e)

run()
