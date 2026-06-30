export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

const ADMIN_KEY = process.env.ADMIN_KEY;

if (req.headers.authorization !== ADMIN_KEY) {
return res.status(401).json({ error: "Unauthorized" });
}

const { quotes } = req.body;
if (!Array.isArray(quotes) || quotes.length === 0) {
return res.status(400).json({ error: "Invalid quotes payload" });
}

const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER || "ACS-CUTZ";
const repo = process.env.GITHUB_REPO || "bibleVerseCML";
const path = process.env.GITHUB_VERSES_PATH || "verses.json";

if (!token) {
return res.status(500).json({ error: "Missing GITHUB_TOKEN in environment" });
}

const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
headers: {
Authorization: `Bearer ${token}`,
Accept: "application/vnd.github+json"
}
});

const file = await fileRes.json();
if (!fileRes.ok) {
return res.status(fileRes.status).json({
error: "Failed to read verses.json from GitHub",
details: file.message || "Unknown GitHub error"
});
}

const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
Accept: "application/vnd.github+json",
"Content-Type": "application/json"
},
body: JSON.stringify({
message: "update verses",
content: Buffer.from(JSON.stringify(quotes, null, 2)).toString("base64"),
sha: file.sha
})
});

const update = await updateRes.json();
if (!updateRes.ok) {
return res.status(updateRes.status).json({
error: "Failed to push updated verses to GitHub",
details: update.message || "Unknown GitHub error"
});
}

res.status(200).json({
success: true,
commit: update.commit?.html_url || null
});
}
