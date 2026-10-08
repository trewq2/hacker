# Törd fel a titkos kódot! – Hacker mini játék

Látványos, pályaorientációs napra készült mini hackerjáték.

## Funkciók

- névbekérés és véletlen hacker-név
- 3 jegyű titkos kód
- nagyobb/kisebb segítség
- 60 másodperces visszaszámlálás
- próbálkozásszámláló
- pontszám
- hanghatások
- Matrix-szerű háttér
- külön megtekinthető Python-forrás
- mobilbarát megjelenés
- GitHub Pages kompatibilis

## GitHub Pages közzététel

1. Hozz létre egy új GitHub repositoryt.
2. Másold fel a repository gyökerébe ezeket a fájlokat:
   - `index.html`
   - `style.css`
   - `script.js`
   - `hacker_game.py`
3. GitHubon nyisd meg: **Settings → Pages**.
4. A **Build and deployment** résznél válaszd:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/(root)**
5. Kattints a **Save** gombra.
6. Néhány pillanat múlva megjelenik a weboldal címe.

## Helyi futtatás

Az `index.html` közvetlenül is megnyitható böngészőben.

A Python-verzió futtatása:

```bash
python hacker_game.py
```

## Megjegyzés

A GitHub Pages statikus weboldalakat futtat, ezért a böngészős játék HTML/CSS/JavaScript segítségével működik. A mellékelt `hacker_game.py` ugyanennek a logikának az oktatási Python-változata.
