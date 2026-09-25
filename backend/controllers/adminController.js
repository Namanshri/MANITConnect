const pool = require("../config/db");

const mentorApplications = async (_req, res, next) => { try {
    const result = await pool.query(`SELECT mentors.mentor_id, mentors.full_name, mentors.branch, users.email, users.mentor_status
        FROM mentors JOIN users ON users.user_id=mentors.user_id ORDER BY mentors.mentor_id DESC`);
    res.json(result.rows);
} catch (error) { next(error); } };

const setMentorStatus = async (req, res, next) => { try {
    const { status } = req.body;
    if (!['approved','suspended','rejected'].includes(status)) return res.status(400).json({message:'Invalid mentor status.'});
    const result = await pool.query(`UPDATE users SET mentor_status=$1 WHERE user_id=(SELECT user_id FROM mentors WHERE mentor_id=$2) AND role='mentor' RETURNING mentor_status`, [status, req.params.mentorId]);
    if (!result.rows.length) return res.status(404).json({message:'Mentor not found.'});
    res.json(result.rows[0]);
} catch (error) { next(error); } };

const listAlerts = async (_req,res,next) => { try { const result=await pool.query(`SELECT * FROM placement_alerts WHERE is_active=true AND (closes_at IS NULL OR closes_at > NOW()) ORDER BY created_at DESC LIMIT 6`); res.json(result.rows); } catch(error){next(error);} };
const createAlert = async (req,res,next) => { try { const {title,description,company,application_url,urgency,closes_at}=req.body; if(!title?.trim()||!description?.trim()) return res.status(400).json({message:'Title and description are required.'}); let applicationUrl=null; if(application_url?.trim()){ try { const parsed=new URL(application_url.trim()); if(!['http:','https:'].includes(parsed.protocol)) throw new Error(); applicationUrl=parsed.href; } catch (_) { return res.status(400).json({message:'Application link must be a full http:// or https:// URL.'}); } } const result=await pool.query(`INSERT INTO placement_alerts(title,description,company,application_url,urgency,closes_at,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[title.trim(),description.trim(),company||null,applicationUrl,['new','update','urgent'].includes(urgency)?urgency:'new',closes_at||null,req.user.user_id]);res.status(201).json(result.rows[0]); }catch(error){next(error);} };
const removePost = async (req,res,next) => { try { await pool.query('DELETE FROM comments WHERE post_id=$1',[req.params.postId]); const result=await pool.query('DELETE FROM posts WHERE post_id=$1 RETURNING post_id',[req.params.postId]); if(!result.rows.length)return res.status(404).json({message:'Post not found.'});res.status(204).end(); }catch(error){next(error);} };
const removeComment = async (req,res,next) => { try { const result=await pool.query('DELETE FROM comments WHERE comment_id=$1 RETURNING comment_id',[req.params.commentId]);if(!result.rows.length)return res.status(404).json({message:'Comment not found.'});res.status(204).end();}catch(error){next(error);} };
const analytics = async (_req,res,next) => { try { const [topInsights,topResources]=await Promise.all([pool.query(`SELECT insights.insight_id, insights.title, COUNT(content_events.event_id) FILTER(WHERE event_type='view')::int AS views, COUNT(content_events.event_id) FILTER(WHERE event_type='bookmark')::int AS bookmarks FROM insights LEFT JOIN content_events ON item_type='insight' AND item_id=insights.insight_id GROUP BY insights.insight_id ORDER BY views DESC,bookmarks DESC LIMIT 8`),pool.query(`SELECT company, role, COUNT(*)::int AS journeys FROM experiences GROUP BY company,role ORDER BY journeys DESC LIMIT 8`)]);res.json({top_insights:topInsights.rows, popular_company_roles:topResources.rows}); }catch(error){next(error);} };
module.exports={mentorApplications,setMentorStatus,listAlerts,createAlert,removePost,removeComment,analytics};
