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

callbackurl = "http://localhost:3000/sessions/video/"


http = urllib3.PoolManager()

def generateSD():
    while True:
        item = db.lpop('sd_queue')
        if item is not None:
            jsonitem = json.loads(item.decode("utf-8"))
            mp4path = animate_tool.render(jsonitem['prompt'],jsonitem['timings'],jsonitem['steps'],jsonitem['seed'],jsonitem['guidance'],jsonitem['scheduler'],jsonitem['selected_model'],jsonitem['cadance'],jsonitem['fps'],jsonitem['zoom'],jsonitem['xtrans'],jsonitem['ytrans'],jsonitem['useinitimage'],jsonitem['initimageurl'],jsonitem['initimagestrength'])
            print(mp4path)

            encoded_body = json.dumps({
                "videourl": mp4path
            })
            r = http.request('POST', callbackurl+jsonitem['videoid'],headers={'Content-Type': 'application/json'},body=encoded_body)
            print(r.read())
        time.sleep(0.1)
        

if __name__ == "__main__":
    generateSD()