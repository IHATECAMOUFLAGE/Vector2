export async function runCheck(targetUrl) {
    const apiUrl =
        "https://live.glseries.net/api/v1/check?token=gl_26167605ef65b47d51926c87e197290a5b6ef7f8e1eaa796&url=" +
        encodeURIComponent(targetUrl);

    const response = await fetch(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    const raw = await response.text();
    const data = JSON.parse(raw);

    const blocked = data.results.filter(r => r.blocked === true);
    const allowed = data.results.filter(r => r.blocked === false);
    const errors  = data.results.filter(r => r.error === true);

    return {
        summary: {
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
        },
        full: data
    };
}
