import mongoose from 'mongoose';

const WorkflowSchema = new mongoose.Schema({
    metadata: {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    sequence: {
        start: {
            id: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            next: {
                type: String,
                required: true
            }
        },
        steps: [
            {
                id: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    required: true,
                    enum: ['apiCall', 'email', 'condition', 'delay', 'scriptExecution']
                },
                config: {
                    type: mongoose.Schema.Types.Mixed,
                    required: true
                },
                next: {
                    type: String,
                    required: true
                }
            }
        ],
        end: {
            id: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            }
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    count: {
        type: Number,
        default: 0
    }
}, { 
    // This will ensure the id field doesn't get a unique index in future
    autoIndex: true 
});

// Update the 'updatedAt' field before saving
WorkflowSchema.pre('save', function(next) {
    this.metadata.updatedAt = new Date();
    next();
});


export const Workflow = mongoose.model('Workflow', WorkflowSchema);

// Run the initialization
mongoose.connection.once('open', async () => {
    await Workflow.init();
}); 