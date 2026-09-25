const pool = require("../config/db");

/* CREATE POST — any logged-in user (student or mentor) */
const createPost = async (req, res) => {

    try {

        const { title, content, category, tags } = req.body;

        if (!title || !content) {

            return res.status(400).json({ message: "Title and content are required." });

        }

        const result = await pool.query(

            `INSERT INTO posts (user_id, title, content, category, tags)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,

            [req.user.user_id, title, content, category || null, tags || null]

        );

        res.status(201).json(result.rows[0]);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

/*
   LIST POSTS — feed view, newest first. Supports:
   ?search=keyword  (matches title/content/category/tags)
   ?category=DSA    (exact category filter)
   Each post includes the author's name/role, a reply count, and
   whether any mentor has replied (has_expert_answer).
*/
const getAllPosts = async (req, res) => {

    try {

        const { search, category } = req.query;

        const conditions = ["(users.role <> 'mentor' OR users.mentor_status = 'approved')"];
        const values = [];

        if (search) {

            values.push(`%${search}%`);
            conditions.push(`(
                posts.title ILIKE $${values.length}
                OR posts.content ILIKE $${values.length}
                OR posts.category ILIKE $${values.length}
                OR posts.tags ILIKE $${values.length}
            )`);

        }

        if (category) {

            values.push(category);
            conditions.push(`posts.category = $${values.length}`);

        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const result = await pool.query(

            `SELECT
                posts.*,
                users.full_name AS author_name,
                users.role AS author_role,
                COUNT(comments.comment_id) AS reply_count,
                BOOL_OR(commenter.role = 'mentor' AND commenter.mentor_status = 'approved') AS has_expert_answer
             FROM posts
             JOIN users ON posts.user_id = users.user_id
             LEFT JOIN comments ON comments.post_id = posts.post_id
             LEFT JOIN users commenter ON comments.user_id = commenter.user_id
             ${whereClause}
             GROUP BY posts.post_id, users.full_name, users.role
             ORDER BY posts.created_at DESC`,

            values

        );

        res.json(result.rows);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

/* GET ONE POST + all its replies, mentor replies pinned first */
const getPostById = async (req, res) => {

    try {

        const { id } = req.params;

        const post = await pool.query(

            `SELECT posts.*, users.full_name AS author_name, users.role AS author_role
             FROM posts
             JOIN users ON posts.user_id = users.user_id
             WHERE posts.post_id = $1`,

            [id]

        );

        if (post.rows.length === 0) {

            return res.status(404).json({ message: "Post not found." });

        }

        const comments = await pool.query(

            `SELECT comments.*, users.full_name AS author_name, users.role AS author_role
             FROM comments
             JOIN users ON comments.user_id = users.user_id
             WHERE comments.post_id = $1 AND (users.role <> 'mentor' OR users.mentor_status = 'approved')
             ORDER BY
                (users.role = 'mentor') DESC,
                comments.created_at ASC`,

            [id]

        );

        res.json({

            post: post.rows[0],
            comments: comments.rows

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

/* ADD A REPLY — any logged-in user, user_id from session only */
const createComment = async (req, res) => {

    try {

        const { id } = req.params;
        const { content, parent_comment_id } = req.body;

        if (!content || !content.trim()) {

            return res.status(400).json({ message: "Reply cannot be empty." });

        }

        const postExists = await pool.query("SELECT post_id FROM posts WHERE post_id = $1", [id]);

        if (postExists.rows.length === 0) {

            return res.status(404).json({ message: "Post not found." });

        }

        if (parent_comment_id) {
            const parent = await pool.query("SELECT comment_id FROM comments WHERE comment_id=$1 AND post_id=$2", [parent_comment_id, id]);
            if (!parent.rows.length) return res.status(400).json({ message: "The reply you selected no longer exists." });
        }

        const result = await pool.query(

            `INSERT INTO comments (post_id, user_id, content, parent_comment_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,

            [id, req.user.user_id, content, parent_comment_id || null]

        );

        res.status(201).json(result.rows[0]);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({ message: "Database Error" });

    }

};

const deletePost = async (req, res) => {
    try {
        const result = await pool.query("SELECT user_id FROM posts WHERE post_id=$1", [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ message: "Post not found." });
        if (req.user.role !== "admin" && result.rows[0].user_id !== req.user.user_id) return res.status(403).json({ message: "You can only delete your own question." });
        await pool.query("DELETE FROM posts WHERE post_id=$1", [req.params.id]);
        res.status(204).end();
    } catch (error) { res.status(500).json({ message: "Unable to delete question." }); }
};

const deleteComment = async (req, res) => {
    try {
        const result = await pool.query("SELECT user_id FROM comments WHERE comment_id=$1", [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ message: "Reply not found." });
        if (req.user.role !== "admin" && result.rows[0].user_id !== req.user.user_id) return res.status(403).json({ message: "You can only delete your own reply." });
        await pool.query("DELETE FROM comments WHERE comment_id=$1", [req.params.id]);
        res.status(204).end();
    } catch (error) { res.status(500).json({ message: "Unable to delete reply." }); }
};

module.exports = {

    createPost,
    getAllPosts,
    getPostById,
    createComment,
    deletePost,
    deleteComment

};
