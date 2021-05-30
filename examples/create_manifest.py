import io
import os
import json

directory = r"json_ex"
files = [os.path.join(dp, f) for dp, dn, filenames in os.walk(directory) for f in filenames if
		  os.path.splitext(f)[1].lower() == '.json']
out = io.open("manifest.json","w+",encoding="utf8")

files = [f.replace("\\","/").replace("wordlists/","") for f in files]

out.write(json.dumps(files,ensure_ascii=False, indent=4))
out.close()