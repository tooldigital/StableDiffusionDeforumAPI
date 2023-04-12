from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import redis
import os
import uuid
import json
import time
import PIL.Image as Image
from io import BytesIO
import base64 

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
db = redis.Redis(connection_pool=pool)
db.flushall()
db.ping() 

app.add_middleware(
    CORSMiddleware, 
    allow_credentials=True, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

@app.get("/")
def index():
    return Response("Hello World from Tool Deforum Animation!")

@app.get("/generatevideo")
def generate(prompt: str,timings: str,steps: int,seed: str,guidance: float,scheduler: str,selected_model: str,cadance: int,fps: int,zoom: str, xtrans: str,ytrans: str,useinitimage: bool,initimageurl: str,initimagestrength: float):
    k = str(uuid.uuid4())
    print("started request with id: "+k)
    d = {"id": k, "prompt": prompt,"timings":timings,"steps":steps,"seed":seed,"guidance":guidance,"scheduler":scheduler,"selected_model":selected_model,"cadance":cadance,"fps":fps,"zoom":zoom,"xtrans":xtrans,"ytrans":ytrans,"useinitimage":useinitimage,"initimageurl":initimageurl,"initimagestrength":initimagestrength}
    db.rpush("sd_queue", json.dumps(d))
    num_tries = 0
    data = None
    while num_tries < 6000:
        num_tries += 1
        output = db.get(k)
        # Check to see if our model has classified the input image
        if output is not None:
            #convert bytes to PIL image
            data = output
            db.delete(k)
            break
        # Sleep for a small amount to give the model a chance to classify the input image
        tt = 0.1
        time.sleep(tt)

    return Response(data)