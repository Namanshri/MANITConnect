const pool = require("../config/db");

const MAX_CONTEXT_ITEMS = 8;
const STOP_WORDS = new Set([
    "a", "an", "and", "are", "about", "at", "be", "can", "do", "for", "from", "get", "give",
    "help", "how", "i", "in", "is", "it", "me", "of", "on", "or", "please", "tell", "that",
    "the", "to", "want", "what", "which", "with", "would", "you", "your"
]);

function scoreRecord(record, terms) {
    const text = Object.values(record).filter(Boolean).join(" ").toLowerCase();
    return terms.reduce((score, term) => {
        const matches = text.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "g"));
        return score + (matches ? Math.min(matches.length, 3) : 0);
    }, 0);
}

function formatRecord(record, index) {
    const source = record.source_type === "journey"
        ? `Journey #${record.source_id}`
        : record.source_type === "insight"
            ? `Insight #${record.source_id}`
            : `Guidance #${record.source_id}`;

    return `[${index + 1}] ${source}\nMentor: ${record.full_name || "Anonymous mentor"}${record.branch ? ` (${record.branch})` : ""}\n${record.company ? `Company: ${record.company}\n` : ""}${record.role ? `Role: ${record.role}\n` : ""}${record.experience_type ? `Type: ${record.experience_type}\n` : ""}${record.package_lpa ? `Package: ${record.package_lpa} LPA\n` : ""}${record.title ? `Title: ${record.title}\n` : ""}Details: ${(record.details || "").slice(0, 1400)}`;
}

async function getAdvisorContext(question) {
    const result = await pool.query(`
        SELECT 'journey' AS source_type, e.experience_id AS source_id, m.mentor_id, m.full_name, m.branch,
               e.company, e.role, e.experience_type, e.package_lpa,
               CONCAT_WS(' ', e.company, e.role, e.experience_type, e.placement_mode,
                   e.preparation_strategy, e.core_skills, e.resources, e.interview_timeline,
                   e.mistakes, e.interview_rounds) AS details,
               NULL::text AS title
        FROM experiences e JOIN mentors m ON m.mentor_id = e.mentor_id
        UNION ALL
        SELECT 'insight', i.insight_id, m.mentor_id, m.full_name, m.branch, e.company, e.role,
               e.experience_type, e.package_lpa, i.content, i.title
        FROM insights i
        JOIN mentors m ON m.mentor_id = i.mentor_id
        LEFT JOIN LATERAL (
            SELECT company, role, experience_type, package_lpa FROM experiences
            WHERE mentor_id = m.mentor_id ORDER BY experience_id DESC LIMIT 1
        ) e ON true
        UNION ALL
        SELECT 'guidance', g.guidance_id, m.mentor_id, m.full_name, m.branch, e.company, e.role,
               e.experience_type, e.package_lpa,
               CONCAT_WS(' ', g.question, g.answer), g.question
        FROM guidance g
        JOIN mentors m ON m.mentor_id = g.mentor_id
        LEFT JOIN LATERAL (
            SELECT company, role, experience_type, package_lpa FROM experiences
            WHERE mentor_id = m.mentor_id ORDER BY experience_id DESC LIMIT 1
        ) e ON true
        WHERE g.answer IS NOT NULL AND TRIM(g.answer) <> ''
    `);

    const terms = (question.toLowerCase().match(/[a-z0-9+#.]{2,}/g) || [])
        .filter((term) => !STOP_WORDS.has(term));
    return result.rows
        .map((record) => ({ record, score: scoreRecord(record, terms) }))
        .filter(({ score }) => terms.length === 0 || score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_CONTEXT_ITEMS)
        .map(({ record }, index) => ({ ...record, reference: index + 1 }));
}

function fallbackAnswer(records, question) {
    if (!records.length) {
        return "I couldn't find relevant mentor journeys, insights, or guidance in MANITConnect yet. Try a broader question, or explore the Mentors page.";
    }

    const lead = records.length === 1
        ? "I found one relevant record in MANITConnect."
        : `I found ${records.length} relevant records in MANITConnect.`;
    const highlights = records.slice(0, 3).map((record) => {
        const person = record.full_name || "A senior";
        const role = [record.role, record.company].filter(Boolean).join(" at ");
        const detail = (record.details || "").replace(/\s+/g, " ").trim();
        const identity = `${person}${role ? ` shared a ${record.experience_type || ""} ${role}`.replace(/\s+/g, " ") : " shared an experience"}`;
        return `${identity}. Their record says: ${detail.slice(0, 300)} [${record.reference}]`;
    });
    const limitation = /how|process|apply|selection|get into/i.test(question)
        ? "The available record may not include the full application or selection process; I have not inferred details that were not contributed."
        : "These are the records that directly match your question.";
    return `${lead}\n\n${highlights.join("\n\n")}\n\n${limitation}`;
}

const askAdvisor = async (req, res) => {
    const question = String(req.body?.question || "").trim();
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];

    if (!question || question.length > 1200) {
        return res.status(400).json({ message: "Please enter a question of up to 1200 characters." });
    }

    try {
        const records = await getAdvisorContext(question);
        const sources = records.map(({ reference, source_type, source_id, mentor_id, full_name, company, role, title }) => ({
            reference, source_type, source_id, mentor_id, mentor: full_name, company, role, title
        }));

        if (!process.env.OPENAI_API_KEY) {
            return res.json({ answer: fallbackAnswer(records, question), sources, mode: "database" });
        }

        const context = records.map(formatRecord).join("\n\n");
        const previousMessages = history
            .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
            .map((item) => ({ role: item.role, content: item.content.slice(0, 1000) }));
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
                instructions: "You are MANITConnect AI Advisor. Answer only from the supplied MANITConnect database records. Do not invent names, outcomes, statistics, or advice not supported by those records. If the records are insufficient, say so plainly. Be concise, practical, and cite every factual claim using [number] from the records.",
                input: [...previousMessages, { role: "user", content: `Question: ${question}\n\nDatabase records:\n${context}` }],
                max_output_tokens: 700
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "AI service request failed");
        const answer = data.output_text?.trim();
        if (!answer) throw new Error("AI service returned an empty response");
        res.json({ answer, sources, mode: "ai" });
    } catch (error) {
        console.error("AI advisor error:", error.message);
        res.status(500).json({ message: "The advisor could not read the database right now. Please try again." });
    }
};

module.exports = { askAdvisor };
