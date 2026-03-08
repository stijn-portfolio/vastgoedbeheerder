# Vastgoedbeheerder

Een webapplicatie voor het beheren van vastgoed: panden, huurders, verhuurders en transacties. Angular frontend met een JSON Server backend voor development.

> Schoolproject voor Angular — Thomas More Hogeschool (score: 16/20)

## Screenshots

*Wordt nog aangevuld*

## Tech stack

- Angular 18
- TypeScript
- Chart.js (dashboard grafieken)
- JSON Server (mock API)
- RxJS

## Features

- Dashboard met vastgoed-statistieken en grafieken
- CRUD voor vastgoedobjecten (panden)
- Huurder- en transactiebeheer
- Favorieten-systeem
- Login/authenticatie met JWT
- Reactive forms met validatie
- Routing met guards

## Installatie

```bash
# Clone repo
git clone https://github.com/stijn-portfolio/vastgoedbeheerder.git
cd vastgoedbeheerder

# Dependencies installeren
npm install

# JSON Server starten (mock API op poort 3000)
npx json-server db.json

# Angular dev server starten
ng serve
```

Open `http://localhost:4200` in je browser.

## Architectuur

Standalone Angular componenten met een service-gebaseerde architectuur:

```
src/app/
├── components/
│   ├── dashboard/          # Overzichtspagina met Chart.js
│   ├── asset-list/         # Vastgoed overzicht
│   ├── asset-detail/       # Detail + bewerken
│   ├── asset-form/         # Nieuw vastgoed toevoegen
│   ├── transaction-list/   # Transactie overzicht
│   ├── transaction-form/   # Transactie toevoegen
│   ├── favorite-list/      # Favorieten
│   ├── login/              # Authenticatie
│   └── nav-bar/            # Navigatie
├── services/               # API communicatie (HttpClient)
├── models/                 # TypeScript interfaces
├── guards/                 # Route guards (auth)
└── pipes/                  # Custom pipes
```
