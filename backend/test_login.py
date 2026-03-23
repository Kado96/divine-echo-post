import urllib.request
import json

url = "https://shalom-ministry-backend-ipu3.onrender.com/api/login/"
data = {"username": "donald", "password": "admin"}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
req.add_header('Content-Type', 'application/json')
req.add_header('Accept', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        print("STATUS:", response.status)
        print("RESPONSE:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("STATUS:", e.code)
    print("ERROR:", e.read().decode('utf-8'))
