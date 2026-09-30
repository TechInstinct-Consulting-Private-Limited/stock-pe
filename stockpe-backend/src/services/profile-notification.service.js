async function createNotification(client, { userId, type, title, message, metadata = {} }) {
    await client.query(
        `INSERT INTO profile_notifications (user_id, type, title, message, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, type, title, message, metadata],
    );
}

module.exports = { createNotification };
