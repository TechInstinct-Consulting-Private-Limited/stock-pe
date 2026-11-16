const pool = require("../config/database");

function publicFields(row) {
    return {
        id: row.id,
        key: row.tutorial_key,
        title: row.title,
        description: row.description,
        icon: row.icon_name,
        accent: row.accent_color,
        background: row.background_color,
        videoUrl: row.youtube_url,
        displayOrder: Number(row.display_order),
    };
}

function text(value, maximum) {
    return String(value || "").trim().slice(0, maximum);
}

function optionalUrl(value) {
    const url = text(value, 1000);
    if (!url) return null;
    try {
        const parsed = new URL(url);
        if (!["https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
        return parsed.toString();
    } catch (_error) {
        const error = new Error("youtubeUrl must be a valid HTTPS URL");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }
}

async function listPublishedTutorials() {
    const result = await pool.query(
        `SELECT id, tutorial_key, title, description, icon_name, accent_color, background_color, youtube_url, display_order
         FROM profile_tutorials
         WHERE is_published=TRUE
         ORDER BY display_order ASC, created_at ASC`,
    );
    return result.rows.map(publicFields);
}

async function listTutorialsForAdmin() {
    const result = await pool.query(
        `SELECT id, tutorial_key, title, description, icon_name, accent_color, background_color, youtube_url, display_order, is_published, created_at, updated_at
         FROM profile_tutorials
         ORDER BY display_order ASC, created_at ASC`,
    );
    return result.rows.map((row) => ({ ...publicFields(row), isPublished: row.is_published, createdAt: row.created_at, updatedAt: row.updated_at }));
}

async function updateTutorial({ key, input }) {
    const tutorialKey = text(key, 80).toLowerCase();
    const title = text(input.title, 120);
    const description = text(input.description, 500);
    const icon = text(input.icon, 80);
    const accent = text(input.accent, 20);
    const background = text(input.background, 20);
    const displayOrder = Number(input.displayOrder);
    const isPublished = typeof input.isPublished === "boolean" ? input.isPublished : true;

    if (!tutorialKey || !title || !description || !icon || !accent || !background || !Number.isInteger(displayOrder)) {
        const error = new Error("key, title, description, icon, accent, background and integer displayOrder are required");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
    }

    const result = await pool.query(
        `INSERT INTO profile_tutorials
            (tutorial_key,title,description,icon_name,accent_color,background_color,youtube_url,display_order,is_published)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (tutorial_key) DO UPDATE SET
            title=EXCLUDED.title,
            description=EXCLUDED.description,
            icon_name=EXCLUDED.icon_name,
            accent_color=EXCLUDED.accent_color,
            background_color=EXCLUDED.background_color,
            youtube_url=EXCLUDED.youtube_url,
            display_order=EXCLUDED.display_order,
            is_published=EXCLUDED.is_published,
            updated_at=NOW()
         RETURNING id,tutorial_key,title,description,icon_name,accent_color,background_color,youtube_url,display_order,is_published,created_at,updated_at`,
        [tutorialKey, title, description, icon, accent, background, optionalUrl(input.videoUrl), displayOrder, isPublished],
    );
    const row = result.rows[0];
    return { ...publicFields(row), isPublished: row.is_published, createdAt: row.created_at, updatedAt: row.updated_at };
}

module.exports = { listPublishedTutorials, listTutorialsForAdmin, updateTutorial };
