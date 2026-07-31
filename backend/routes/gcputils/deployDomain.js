const {
  EDGE_PURGE_GITHUB_WEBHOOK_TOKEN,
  DOMAIN_WEBHOOK_URI,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFARE_API_TOKEN,
  APP_ENV
} = require("../../config/config");


async function checkDomainExists(domain) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/registrar/domains/${domain}`,
    { headers: { Authorization: `Bearer ${CLOUDFARE_API_TOKEN}` } }
  );
  const data = await res.json();
  console.log(data);
  return data.success && data.result?.current_registrar != null;
}

async function deployDomains(payload) {
  try {
    const checked = new Set();
    for (const domain of payload.domains) {
      const root = domain.split(".").slice(-2).join(".");
      if (checked.has(root)) continue;
      checked.add(root);
      if (!(await checkDomainExists(root))) {
        return { status: 500, message: `This domain doesn't exist: ${root}` };
      }
    }

    const response = await fetch(DOMAIN_WEBHOOK_URI, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${EDGE_PURGE_GITHUB_WEBHOOK_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: APP_ENV === "prod" ? "main" : "develop",
        inputs: {
          domains: payload.domains.join(",")
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { status: 200, message: "Domain deployment request sent successfully" };
  } catch (error) {
    console.error("Error sending domain deployment request:", error);
    return { status: 500, message: "Error sending domain deployment request", error: error.message };
  }
}

module.exports = {
  deployDomains,
  checkDomainExists,
};
