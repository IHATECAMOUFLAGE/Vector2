importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
  await scramjet.loadConfig();

  if (scramjet.route(event)) {
    const response = await scramjet.fetch(event);
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('text/html')) {
      let html = await response.text();

      const erudaScript = `
        <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
        <script>eruda.init();</script>
      `;

      if (document.querySelector('body')) {
        const newHtml = html.replace('</body>', `${erudaScript}</body>`);
  
        return new Response(newHtml, {
          headers: response.headers
        });
      } else {
         return new Response(html)
      }

    return response;
  }

  return fetch(event.request);
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});
