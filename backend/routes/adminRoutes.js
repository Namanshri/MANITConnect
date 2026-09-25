const router=require('express').Router();
const admin=require('../controllers/adminController'); const auth=require('../middleware/authMiddleware'); const roles=require('../middleware/authorizeRoles');
router.get('/placement-alerts',admin.listAlerts);
router.use(auth,roles('admin'));
router.get('/mentors',admin.mentorApplications); router.patch('/mentors/:mentorId/status',admin.setMentorStatus);
router.post('/placement-alerts',admin.createAlert); router.delete('/posts/:postId',admin.removePost); router.delete('/comments/:commentId',admin.removeComment); router.get('/analytics',admin.analytics);
module.exports=router;
