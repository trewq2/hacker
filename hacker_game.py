import random

# Pályaorientációs mini hackerjáték
# A játék egy 100 és 999 közötti titkos kódot választ.

nev = input("Add meg a neved: ")

elotagok = ["Shadow", "Cyber", "Zero", "Byte", "Ghost", "Neo"]
utotagok = ["Fox", "Wolf", "Ninja", "Coder", "Hunter", "404"]

hackernev = random.choice(elotagok) + random.choice(utotagok)
titkos_kod = random.randint(100, 500)
probak = 0

print()
print("=" * 50)
print("        PÁLFY CYBER LAB // SECURE TERMINAL")
print("=" * 50)
print(f"Üdv, {nev}!")
print(f"A hackerneved: {hackernev}")
print("Törd fel a 3 jegyű titkos kódot!")
print()

while True:
    try:
        tipp = int(input("Kód: "))
    except ValueError:
        print("Csak számot írj be!")
        continue

    if tipp < 100 or tipp > 500:
        print("100 és 500 közötti számot adj meg!")
        continue

    probak += 1

    if tipp < titkos_kod:
        print("▲ NAGYOBB kód kell!")
    elif tipp > titkos_kod:
        print("▼ KISEBB kód kell!")
    else:
        print()
        print("ACCESS GRANTED")
        print(f"A titkos kód: {titkos_kod}")
        print(f"Próbálkozások száma: {probak}")
        break
