importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
  await scramjet.loadConfig();

  if (!scramjet.route(event)) {
    return fetch(event.request);
  }

  const response = await scramjet.fetch(event);
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) {
    return response;
  }

  const encoding = response.headers.get('content-encoding');
  if (encoding && encoding !== 'identity') {
    return response;
  }

  if (response.headers.get('content-security-policy')) {
    return response;
  }

  let html;
  try {
    html = await response.text();
  } catch {
    return response;
  }

  const trimmed = html.trim().toLowerCase();
  if (!trimmed.startsWith('<!doctype') && !trimmed.startsWith('<html')) {
    return response;
  }

  if (!html.includes('</body>')) {
    return response;
  }

  const erudaScript = `
    <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
    <script>eruda.init();</script>
  `;

  const newHtml = html.replace('</body>', `${erudaScript}</body>`);

  const newHeaders = new Headers(response.headers);
  newHeaders.delete('content-length');
  newHeaders.delete('content-encoding');
  newHeaders.delete('etag');

  return new Response(newHtml, { headers: newHeaders });
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});
