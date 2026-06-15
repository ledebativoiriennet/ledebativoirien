import { GET } from './src/app/api/cron/sync-search-console/route';

GET({
  headers: new Headers({ authorization: 'Bearer ldi_secret_update_2026' })
} as any)
  .then(res => res.json())
  .then(data => console.log('Result:', data))
  .catch(err => console.error('Error:', err));
