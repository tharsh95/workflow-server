import express from 'express';
import { 
    createWorkflow, 
    getWorkflows, 
    getWorkflow, 
    deleteWorkflow,
    updateWorkflow,
    executeWorkflow
} from '../controllers/workflowController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Workflow routes
router.route('/')
    .post(createWorkflow)
    .get(getWorkflows);

router.route('/:id')
    .get(getWorkflow)
    .put(updateWorkflow)
    .delete(deleteWorkflow);

// Execute workflow route
router.route('/:id/execute')
    .post(executeWorkflow);

export default router; 