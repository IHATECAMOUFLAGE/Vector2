import http from "http";

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith("/check")) {
        const query = new URL(req.url, "http://localhost");
        const targetUrl = query.searchParams.get("url");

        if (!targetUrl) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing ?url= parameter" }));
            return;
        }

        const apiUrl =
            "https://live.glseries.net/api/v1/check?token=gl_26167605ef65b47d51926c87e197290a5b6ef7f8e1eaa796&url=" +
            encodeURIComponent(targetUrl);

        try {
            const response = await fetch(apiUrl, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            const raw = await response.text();
            const data = JSON.parse(raw);

            const blocked = data.results.filter(r => r.blocked === true);
            const allowed = data.results.filter(r => r.blocked === false);
            const errors  = data.results.filter(r => r.error === true);

            const summary = {
                url: data.url,
                blockedBy: blocked.map(r => r.name),
                allowedBy: allowed.map(r => r.name),
                errors: errors.map(r => r.name),
                totals: {
                    blocked: blocked.length,
                    allowed: allowed.length,
                    errors: errors.length,
                    totalFilters: data.totalFilters
                }
            };

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ summary, full: data }, null, 2));

        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
    }
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
