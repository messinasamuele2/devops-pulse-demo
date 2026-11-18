# DevOps Pulse

DevOps Pulse è una demo full-stack minimale. Il frontend statico mostra lo stato del sistema e offre controlli manuali; il backend Express espone `GET /api/health` e un endpoint che genera un errore per i test. In locale nginx fa da reverse proxy per `/api` verso il backend.

## Ambienti

- **development**: `docker-compose.yml` sul computer dello sviluppatore; variabili da `.env`, frontend su `localhost:8080`.
- **staging**: pull request validate dalla pipeline CI; usa container separati e, prima del deploy pubblico, URL/DSN staging dedicati.
- **production**: push su `main` pubblicato da GitHub Actions su GitHub Pages; ambiente protetto con approval policy opzionale.

## Scelte tecniche

È stato scelto **GitHub Actions** perché il repository è già destinato a GitHub, GitHub Pages richiede soltanto permessi `pages` e `id-token`, e CI e deploy restano nello stesso sistema. Docker permette un'immagine riproducibile del frontend e una build separata del backend.

## Avvio locale

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Apri `http://localhost:8080`. Verifica l'API con `http://localhost:8080/api/health`.

Comandi singoli:

```powershell
npm ci --prefix backend
npm test
npm run lint
npm run build
docker compose down
```

## Configurazione secrets

`.env` è escluso da Git tramite `.gitignore` e non deve comparire nella history. Il template pubblico è `.env.example`.

In GitHub, imposta `SENTRY_DSN` come repository variable o Actions secret senza inserirlo in file o log. GitHub Pages non richiede un secret per il deploy.

## CI/CD

`.github/workflows/ci-cd.yml` viene avviato ad ogni push su `main` e su pull request. I job eseguono lint, test, build del frontend e build del backend. Solo un push su `main` avvia il job Pages dopo il successo di tutte le validate.

Configurazione repository per Pages:

1. Impostazioni > Pages > Source: `GitHub Actions`.
2. Impostazioni > Environments > `production`: approvazione manuale opzionale.
3. Impostazioni > Secrets and variables > Actions: aggiungere `SENTRY_DSN` solo se attivato.

## Deploy pubblico

Una volta attivato Pages e effettuato il push su `main`, GitHub mostra l'URL nella run e nell'ambiente `production`.

## Monitoraggio

- Configura UptimeRobot con controllo HTTP ogni 5 minuti sull'URL pubblico. Imposta un alert email/Telegram: `DOWN` indica indisponibilità, `UP` indica ripristino.
- Per Sentry creare un progetto Browser, aggiungere `SENTRY_DSN` come secret Actions e integrare l'SDK nel frontend prima del rilascio. Per il test manuale usare il pulsante **Simula errore**: dopo il refresh atteso nell'evento, verificare stack trace, URL e timestamp nella dashboard Sentry.
- Per il backend, aggiungere un endpoint health check al monitor e integrare l'SDK server nella versione distribuita.

Interpreta gli alert: un singolo timeout può essere una rete transitoria; due fallimenti consecutivi richiedono controllo; `5xx` richiede ispezione dei log; assenza di eventi Sentry durante un errore simulato indica DSN o CSP errati.
