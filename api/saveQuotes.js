export default async function handler(req, res) {

const ADMIN_KEY = process.env.ADMIN_KEY;

if (req.headers.authorization !== ADMIN_KEY) {
return res.status(401).json({ error: "Unauthorized" });
}

const { quotes } = req.body;

const token = process.env.GITHUB_TOKEN;
const owner = "YOUR_USERNAME";
const repo = "YOUR_REPO";
const path = "verses.json";

const file = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`,{
headers:{ Authorization:`Bearer ${token}` }
}).then(r=>r.json());

const update = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`,{
method:"PUT",
headers:{
Authorization:`Bearer ${token}`,
"Content-Type":"application/json"
},
body: JSON.stringify({
message:"update verses",
content: Buffer.from(JSON.stringify(quotes,null,2)).toString("base64"),
sha: file.sha
})
});

res.status(200).json({success:true});
}
