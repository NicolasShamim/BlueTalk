"""Emit a tab-separated manifest of shots for build-video.sh."""
import json, sys
d = json.load(open(sys.argv[1]))
for s in d["shots"]:
    print("\t".join([s["clip"], str(s["dur"]), s.get("caption", "").replace("\t", " ")]))
