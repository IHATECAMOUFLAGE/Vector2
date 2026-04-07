function analyzeFilters(data) {
    const blocked = data.results
        .filter(r => r.blocked === true)
        .map(r => r.name);

    const allowed = data.results
        .filter(r => r.blocked === false)
        .map(r => r.name);

    return {
        blocked,
        allowed
    };
}

async function checkUrl(target) {
    const res = await fetch(`/check?url=${encodeURIComponent(target)}`);
    const data = await res.json();

    const result = analyzeFilters(data);

    console.log("Blocked:", result.blocked);
    console.log("Allowed:", result.allowed);

    return result;
}