# Dorfbengel Setlist-Planer – Oberfläche

Dieses Repository enthält nur den Bedienungs-Code (`planer.js`) des Setlist-Planers.
Er wird von der Google-Apps-Script-Web-App geladen. Daten liegen ausschließlich in der privaten Google-Tabelle – hier sind keine Daten und keine Schlüssel.

## Aufbau
- `planer.js` – wird aus `src/` gebaut: `python3 build.py`
- `src/Code.gs`, `src/Index.html`, `src/appsscript.json` – Stand des Apps-Script-Projekts (Server-Teil, wird von Hand im Apps-Script-Editor gepflegt)
- Startdaten (Seed.gs) liegen bewusst NICHT hier.

## Wichtig
- Im Inline-Skript von `src/Index.html` keine `//` verwenden (Google entfernt sonst den Rest der Zeile).
- Konto ist im Erweiterten Sicherheitsprogramm: Apps Script darf nur `spreadsheets.currentonly`.
