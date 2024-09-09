const mongooose = require('mongoose');


const connectedAccountSchema = new mongooose.Schema({
    connectAccountId: {
        type: String,
        required: [true, "please Enter Stripe connected account id"]
    },
    userId: {
        type: mongooose.Types.ObjectId,
        ref: "users",
        required: [true, "Please Enter user id"]
    },
    channelId: {
        type: mongooose.Types.ObjectId,
        ref: "channels",
        required: [true, "Please Enter channel id"],
        unique: true
    },
    isAccountCreated: {
        type: String,
        enum: ['created', 'notCreated', 'pending'],
        default: 'notCreated',
        required: [true, "Please provide account created or not"]
    },
    // is transfer capabilites available or not
    isTransfer: {
        type: String,
        // enum: ['enabled', 'rejected', 'in_review', 'restricted', 'restricted_soon', 'pending', 'disabled'],
    },
    isPayoutEnabled: {
        type: Boolean,
        default: false  // payout is enabled or not 
    },
    payoutType: {
        type: String,
        default: 'manual'  // payout type is daily and manual
    },
    isRequirementPending: {
        type: Boolean,
        default: true
    },
    isAccountActive: {
        type: Boolean,
        default: true  // is stripe account acitve or not
    }
},
{
    timestamps: true
});

module.exports = mongooose.model('connect-accounts', connectedAccountSchema);