import axios from 'axios';
import { Workflow } from '../models/Workflow.js';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/mailer.js';

// Create a new workflow
export const createWorkflow = async (req, res) => {
    try {
        const workflowData = req.body;
        
        // Remove id if it exists in the request data
        if (workflowData.id) {
            delete workflowData.id;
        }

        // Add user reference to workflow
        workflowData.user = req.user.id;
        workflowData.status = false;
        
        // Ensure there's no id field at all for MongoDB to auto-generate _id
        workflowData.id = undefined;
        
        // Create workflow
        const workflow = await Workflow.create(workflowData);
        
        // Convert the workflow to a plain object
        const workflowObj = workflow.toObject();
        
        // Replace _id with id
        workflowObj.id = workflowObj._id;
        delete workflowObj._id;
        
        res.status(201).json({
            success: true,
            data: workflowObj
        });
    } catch (error) {
        // If there's still a unique constraint error, try to manually drop the index
        if (error.message.includes('E11000 duplicate key error')) {
            try {
                // Try to drop the index if it exists
                await mongoose.connection.db.collection('workflows').dropIndex('id_1');
                console.log('Dropped id_1 index from workflows collection due to error');
                
                // Retry the creation after dropping the index
                const workflow = await Workflow.create(workflowData);
                const workflowObj = workflow.toObject();
                workflowObj.id = workflowObj._id;
                delete workflowObj._id;
                
                return res.status(201).json({
                    success: true,
                    data: workflowObj
                });
            } catch (indexError) {
                console.error('Error dropping index:', indexError);
            }
        }
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all workflows for the logged-in user
export const getWorkflows = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        
        // Get total count for pagination info
        const totalCount = await Workflow.countDocuments({ user: req.user.id });
        
        // Find workflows with pagination
        const workflows = await Workflow.find()
            .sort({ 'metadata.createdAt': -1 }) // Sort by most recently updated
            .skip(skip)
            .limit(limit);
        
        // Convert the workflows to plain objects and replace _id with id
        const formattedWorkflows = workflows.map(workflow => {
            const workflowObj = workflow.toObject();
            workflowObj.id = workflowObj._id;
            delete workflowObj._id;
            return workflowObj;
        });
        
        res.status(200).json({
            success: true,
            count: formattedWorkflows.length,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: formattedWorkflows,
            pagination: {
                hasNextPage: skip + limit < totalCount,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get a single workflow by ID
export const getWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findOne({ 
            _id: req.params.id,
        });
        
        if (!workflow) {
            return res.status(404).json({
                success: false,
                message: 'Workflow not found'
            });
        }
        
        // Convert the workflow to a plain object and replace _id with id
        const workflowObj = workflow.toObject();
        workflowObj.id = workflowObj._id;
        delete workflowObj._id;
        
        res.status(200).json({
            success: true,
            data: workflowObj
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a workflow by ID
export const deleteWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!workflow) {
            return res.status(404).json({
                success: false,
                message: 'Workflow not found'
            });
        }
        
        await workflow.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Workflow deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update a workflow by ID
export const updateWorkflow = async (req, res) => {
    try {
        const workflowData = req.body;
        
        // Remove id if it exists in the request data
        if (workflowData.id) {
            delete workflowData.id;
        }
        
        // Find and update the workflow
        const workflow = await Workflow.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            workflowData,
            { new: true, runValidators: true }
        );
        
        if (!workflow) {
            return res.status(404).json({
                success: false,
                message: 'Workflow not found'
            });
        }
        
        // Convert the workflow to a plain object
        const workflowObj = workflow.toObject();
        
        // Replace _id with id
        workflowObj.id = workflowObj._id;
        delete workflowObj._id;
        
        res.status(200).json({
            success: true,
            data: workflowObj
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Execute a workflow by ID
export const executeWorkflow = async (req, res) => {
    try {
        // Find the workflow by ID
        const workflow = await Workflow.findOne({ 
            _id: req.params.id,
        });
        
        if (!workflow) {
            return res.status(404).json({
                success: false,
                message: 'Workflow not found'
            });
        }
        
        // Mock execution logic
        
        // Start with the start node
        let currentNodeId = workflow.sequence.start.id;
        let executionSteps = [];
        let stepResults = {}; // Store results from each step to pass to subsequent steps
        
        // Simple execution tracking
        executionSteps.push({
            step: 'start',
            nodeId: currentNodeId,
            type: workflow.sequence.start.type,
            timestamp: new Date()
        });
        
        // Get the next node ID from the start node
        currentNodeId = workflow.sequence.start.next;
        
        // Execute each step in sequence
        while (currentNodeId && currentNodeId !== 'end') {
            // Find the current step
            const currentStep = workflow.sequence.steps.find(step => step.id === currentNodeId);
            
            if (!currentStep) {
                throw new Error(`Step not found: ${currentNodeId}`);
            }
            
            // Execute the step based on its type
            executionSteps.push({
                step: 'processing',
                nodeId: currentStep.id,
                type: currentStep.type,
                config: currentStep.config,
                timestamp: new Date()
            });
            
            // In a real implementation, we would execute different logic based on step type
            // Execute step logic based on type
            switch (currentStep.type) {
                case 'apiCall':
                    let config = {}
                    let headers = {};
                    if (currentStep.config.headers) {
                        // Check if headers is a string (possibly JSON)
                        if (typeof currentStep.config.headers === 'string') {
                            try {
                                headers = JSON.parse(currentStep.config.headers);
                            } catch (e) {
                                console.error('Invalid headers format:', e);
                            }
                        } else if (typeof currentStep.config.headers === 'object') {
                            headers = currentStep.config.headers;
                        }
                    }
                    
                    if (currentStep.config.method === 'POST' || currentStep.config.method === 'PUT') {
                        config = {
                            method: currentStep.config.method,
                            url: currentStep.config.url,
                            data: currentStep.config.data,
                            headers: headers
                        }
                    }
                    else {
                        config = {
                            method: currentStep.config.method,
                            url: currentStep.config.url,
                            headers: headers
                        }
                    }

                    const response = await axios(config);
                    // Store API response for potential use in subsequent steps
                    stepResults[currentStep.next] = {
                        data: response.data,
                        status: response.status,
                        headers: response.headers
                    };
                    
                    // Add result to execution steps
                    executionSteps[executionSteps.length - 1].result = {
                        status: response.status,
                        statusText: response.statusText,
                        dataPreview: JSON.stringify(response.data).substring(0, 100) + (JSON.stringify(response.data).length > 100 ? '...' : '')
                    };
                    break;
                case 'email':
                    try {
                        // Check if this email should use data from a previous step
                        let emailBody = JSON.stringify(stepResults[currentStep.id].data) || 'This is an automated notification from your workflow.';
                        let emailSubject = currentStep.config.subject || 'Workflow Notification';
                        let emailHtml = currentStep.config.htmlBody;
                        
                        // If this step references a previous step's result
                        if (currentStep.config.useStepResult && stepResults[currentStep.config.useStepResult]) {
                            const previousStepData = stepResults[currentStep.config.useStepResult].data;
                            
                            // If body template is defined, replace placeholders with actual data
                            if (currentStep.config.bodyTemplate) {
                                emailBody = currentStep.config.bodyTemplate;
                                
                                // Replace placeholders in template with actual data
                                if (typeof previousStepData === 'object') {
                                    // For each property in the data object, replace placeholders
                                    Object.keys(previousStepData).forEach(key => {
                                        const value = typeof previousStepData[key] === 'object' 
                                            ? JSON.stringify(previousStepData[key], null, 2) 
                                            : previousStepData[key];
                                        emailBody = emailBody.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
                                    });
                                }
                            } else {
                                // If no template is provided, just use the JSON string of the data
                                emailBody = JSON.stringify(previousStepData, null, 2);
                            }
                        }
                        
                        // Send the email using the new interface
                        const emailSent = await sendEmail({
                            to: currentStep.config.email || currentStep.config.recipient,
                            subject: emailSubject,
                            text: emailBody,
                            html: emailHtml || emailBody // Use HTML body if provided, otherwise use text body
                        });
                        
                        if (emailSent) {
                            executionSteps[executionSteps.length - 1].result = {
                                status: 'success',
                                message: `Email sent to ${currentStep.config.email || currentStep.config.recipient}`
                            };
                        } else {
                            throw new Error('Failed to send email');
                        }
                    } catch (emailError) {
                        console.error('Error sending email:', emailError);
                        executionSteps[executionSteps.length - 1].result = {
                            status: 'error',
                            message: `Failed to send email: ${emailError.message}`
                        };
                    }
                    break;
                case 'condition':
                    console.log(`Evaluating condition: ${JSON.stringify(currentStep.config)}`);
                    // In a real implementation, we would evaluate the condition
                    break;
                case 'delay':
                    console.log(`Delaying for: ${currentStep.config.duration}`);
                    // In a real implementation, we would implement the delay
                    break;
                case 'scriptExecution':
                    console.log(`Executing script: ${currentStep.config.script}`);
                    // In a real implementation, we would execute the script
                    break;
                default:
                    console.log(`Unknown step type: ${currentStep.type}`);
            }
            
            // Move to the next step
            currentNodeId = currentStep.next;
        }
        
        // Add end step to execution steps
        executionSteps.push({
            step: 'end',
            nodeId: 'end',
            type: workflow.sequence.end.type,
            timestamp: new Date()
        });

        workflow.count += 1;
        await workflow.save();
        
        res.status(200).json({
            success: true,
            message: 'Workflow executed successfully',
            workflowId: workflow._id.toString(),
            count: workflow.count,
            executionSteps
        });
    } catch (error) {
        console.error('Workflow execution error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error executing workflow'
        });
    }
}; 