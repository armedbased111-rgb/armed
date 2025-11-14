# apps/tools/generate_secret.py
import secrets
import argparse

def generate_secret(length: int, fmt: str) -> str:
    if fmt == "hex":
        return secrets.token_hex(length)
    elif fmt == "base64":
        return secrets.token_urlsafe(length)
    else:
        raise ValueError("Format invalide: hex | base64")

def main():
    parser = argparse.ArgumentParser(description="Generate a strong JWT secret")
    parser.add_argument("--length", type=int, default=64, help="bytes d'entropie (défaut: 64)")
    parser.add_argument("--format", type=str, default="hex", choices=["hex", "base64"], help="format du secret (défaut: hex)")
    args = parser.parse_args()

    secret = generate_secret(args.length, args.format)
    print("JWT_SECRET=", secret)

if __name__ == "__main__":
    main()
