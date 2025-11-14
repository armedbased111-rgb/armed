# apps/tools/generate_jwt.py
import os
import argparse
import time
import json
import base64

try:
    import jwt  # PyJWT
except ImportError:
    raise RuntimeError("PyJWT n'est pas installé. Lance: pip install PyJWT")

def load_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET non défini (export .env).")
    return secret

def main():
    parser = argparse.ArgumentParser(description="Signer un JWT (HS256) avec JWT_SECRET")
    parser.add_argument("--sub", type=str, required=True, help="Subject (id ou email)")
    parser.add_argument("--expires", type=int, default=3600, help="validité en secondes (défaut: 3600)")
    parser.add_argument("--claims", type=str, default="{}", help='claims JSON (ex: \'{"role":"user"}\')')
    args = parser.parse_args()

    secret = load_secret()
    now = int(time.time())
    try:
      extra = json.loads(args.claims)
    except json.JSONDecodeError:
      raise RuntimeError("Claims JSON invalide")

    payload = {
        "sub": args.sub,
        "iat": now,
        "exp": now + args.expires,
        **extra,
    }

    token = jwt.encode(payload, secret, algorithm="HS256")
    print("JWT=", token)

    # helper: afficher le payload (pour apprendre)
    parts = token.split(".")
    if len(parts) == 3:
        b = parts[1]
        b += "=" * (-len(b) % 4)
        decoded = base64.urlsafe_b64decode(b.encode("utf-8")).decode("utf-8")
        print("Payload=", decoded)

if __name__ == "__main__":
    main()
