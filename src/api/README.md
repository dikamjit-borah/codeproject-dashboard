API layer for the external service

Files created:
- `constants.ts` — base URLs and endpoints placeholders
- `httpClient.ts` — axios instance with request/response logging interceptors
- `adapters/externalServiceAdapter.ts` — example adapter functions to call the external API
- `index.ts` — re-exports for convenience

Notes:
- This project didn't previously include `axios`. I added it to `package.json`. Run `npm install` or `pnpm install` to fetch it.
- Environment variable `REACT_APP_EXTERNAL_SERVICE_BASE_URL` can be used to override the base URL.
- Logging uses `console.log`/`console.error`. Swap to a structured logger if desired.

Transactions usage
------------------
The adapter provides a `getTransactions` helper which calls the `/transactions` endpoint with common query params (startDate, endDate, status, subStatus, page, limit).

Example (TypeScript):

import { getTransactions } from './adapters/externalServiceAdapter';

const res = await getTransactions({ startDate: '2025-10-01', endDate: '2025-10-23', status: 'COMPLETED', subStatus: 'SUCCESS', page: 1, limit: 10 });

Helper script `src/api/testTransactions.ts` is included as a runnable example. Use `ts-node` or compile and run with node.
