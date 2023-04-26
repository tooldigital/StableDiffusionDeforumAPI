import random
from PIL import Image, ImageOps
import redis
import os
import json
import time
import base64
from io import BytesIO
import animate_tool
import urllib3

pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
db = redis.Redis(connection_pool=pool)
db.ping()
db.flushall()
print("MODEL STARTED")

localurl = "http://127.0.0.1:5150/static/"
callbackurl = "http://localhost:3000/api/sessions/video/"

def generateSD():
    while True:
        item = db.lpop('sd_queue')
        if item is not None:

            http = urllib3.PoolManager()
            jsonitem = json.loads(item.decode("utf-8"))
            mp4path = animate_tool.render(jsonitem['prompt'],jsonitem['timings'],jsonitem['steps'],jsonitem['seed'],jsonitem['guidance'],jsonitem['scheduler'],jsonitem['selected_model'],jsonitem['cadance'],jsonitem['fps'],jsonitem['zoom'],jsonitem['xtrans'],jsonitem['ytrans'],jsonitem['useinitimage'],jsonitem['initimageurl'],jsonitem['initimagestrength'])


            data = {"videoUrl": localurl+mp4path}
            encoded_data = json.dumps(data).encode('utf-8')
            url = callbackurl+jsonitem['videoid']
            print(url)
            print(encoded_data)

            try:
                r = http.request('POST',url,body=encoded_data,headers={'Content-Type': 'application/json'})
                print(r.status)
            except Exception as e:
                print(e)
            
        time.sleep(0.1)
        

if __name__ == "__main__":
    generateSD()