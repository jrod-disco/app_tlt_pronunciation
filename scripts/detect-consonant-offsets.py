#!/usr/bin/env python3
"""Rough boundary finder: picks N-1 deepest energy dips. Needs macOS afconvert. Output is a starting point; tune by ear."""
import array, json, subprocess, sys, wave
SRC = "assets/audio/tibetanconsonants.mp3"; N = 30; MIN_SEP = 0.45
subprocess.run(["afconvert","-f","WAVE","-d","LEI16@16000","-c","1",SRC,"/tmp/_c.wav"],check=True)
w = wave.open("/tmp/_c.wav"); r = w.getframerate()
a = array.array("h", w.readframes(w.getnframes())); dur = len(a)/r
win = int(r*0.02)
env = [(sum(x*x for x in a[i:i+win])/win)**.5 for i in range(0,len(a)-win,win)]
sm = [sum(env[max(0,i-2):i+3])/len(env[max(0,i-2):i+3]) for i in range(len(env))]
step = 0.02
cands = sorted(range(1,len(sm)-1), key=lambda i: sm[i])
picked = []
for i in cands:
    t = i*step
    if 0.4 < t < dur-0.4 and all(abs(t-p) >= MIN_SEP for p in picked):
        picked.append(t)
    if len(picked) == N-1: break
picked.sort()
b = [0.0]+picked+[dur]
out = {"duration": round(dur,3), "consonants": {}}
sys.path.insert(0,".")
import re
wylie = re.findall(r'wylie:\s*"([^"]+)"', open("js/data/unit1-consonants.js").read())
for k,name in enumerate(wylie):
    out["consonants"][name] = {"start": round(b[k],2), "end": round(b[k+1]-0.03,2)}
json.dump(out, open("js/data/consonant-audio-offsets.json","w"), indent=2)
print(len(wylie), "letters written")
