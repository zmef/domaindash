
async function fetchData(domain) {
  const dnsRes = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
  const dnsData = await dnsRes.json();
  const aRecord = dnsData.Answer ? dnsData.Answer[0].data : "Unavailable";

  const sslRes = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${domain}`);
  const sslData = await sslRes.json();
  const certStatus = sslData.status || "Unknown";

  const screenshotUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${domain}&screenshot=true`;

  return { aRecord, certStatus, screenshotUrl };
}

async function buildDashboard() {
  const res = await fetch('domains.json');
  const domains = await res.json();
  const container = document.getElementById('dashboard');

  for (const entry of domains) {
    const { name, note } = entry;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h2>${name}</h2><p>Loading...</p>`;
    container.appendChild(card);

    try {
      const { aRecord, certStatus, screenshotUrl } = await fetchData(name);
      const screenshotRes = await fetch(screenshotUrl);
      const screenshotData = await screenshotRes.json();
      const screenshotBase64 = screenshotData.lighthouseResult.audits["final-screenshot"].details.data;

      card.innerHTML = `
        <h2>${name}</h2>
        <img src="${screenshotBase64}" alt="Screenshot of ${name}" style="width:100%;border-radius:8px;" />
        <p>🌐 A Record: ${aRecord}</p>
        <p>🔒 SSL Status: ${certStatus}</p>
        <p>📝 Note: ${note}</p>
      `;
    } catch (err) {
      card.innerHTML += `<p>❌ Error loading data</p>`;
    }
  }
}

buildDashboard();
