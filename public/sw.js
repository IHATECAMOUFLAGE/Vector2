importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
  await scramjet.loadConfig();

  if (scramjet.route(event)) {
    // 1. Get the original response from the proxy
    const response = await scramjet.fetch(event);
    const contentType = response.headers.get('content-type');

    // 2. Check if the response is HTML
    if (contentType && contentType.includes('text/html')) {
      let html = await response.text();

      // 3. Define the Eruda script
      const erudaScript = `
        <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
        <script>eruda.init();</script>
      `;

      // 4. Inject before the closing </body> tag
      const newHtml = html.replace('</body>', `${erudaScript}</body>`);

      // 5. Return the modified response
      return new Response(newHtml, {
        headers: response.headers
      });
    }

    return response;
  }

  return fetch(event.request);
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});