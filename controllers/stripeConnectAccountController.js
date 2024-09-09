const stripeConnectModel = require('../models/stripeConnectedAccountModel');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sendEmail = require('../utils/sendEmail');
const userModel = require('../models/userModel');
const channelModel = require('../models/channelModel');
const channelActivePlanModel = require('../models/channelActivePlanModel');
const notificationModel = require('../models/notificationModel');
// const stripe = require('stripe')('sk_test_51PMP4BLhsqLL49rZBED0LNv5P6OzMRirZe3F7BcEZVLU3gGXkXFG8n7nExzHqQB8nFYUd02wMtt01Enq5I7PHdK000EP2fSirO');


exports.getConnectAccount = catchAsyncErrors(async (req, res, next)=>{
    const channelId = req.params.channelId

    const foundAccount = await stripeConnectModel.findOne({channelId: channelId});

    if(!foundAccount){
        // return next(new ErrorHandler('account not found', 404));
        res.status(200).json({
            success: false,
            isFound: false,
            message: 'Account not found'
        })
    } else {
        res.status(200).json({
            success: true,
            isFound: true,
            account: foundAccount
        })
    }


});

exports.createConnectAccount = catchAsyncErrors(async (req, res, next)=>{
    const {connectAccountId, userId, channelId, isAccountCreated, isTransfer } = req.body

    const foundAccount = await stripeConnectModel.findOne({channelId: channelId});

    if(foundAccount){
        return next(new ErrorHandler('account already exists', 401));
    }

    const accountDetails = await stripeConnectModel.create({connectAccountId, userId, channelId, isAccountCreated, isTransfer });

    res.status(200).json({
        success: true,
        accountDetails
    })

});

exports.getAllConnectedAccount = catchAsyncErrors(async (req, res, next)=>{
    const accounts = await stripe.accounts.list({
      limit: 5,
    });
    
    res.status(200).json({
      success: true,
      accounts
    })
});

exports.getSingleConnectAccount = catchAsyncErrors(async (req, res, next)=>{
    const account = await stripe.account.retrieve(req.params.id);
    
    res.status(200).json({
      success: true,
      account
    })
});

exports.removeConnectAccount = catchAsyncErrors(async (req, res, next)=>{
    
    // const deleted = await stripe.accounts.del('acct_1PkNIwQ8zTwFYept');
    const reject = await stripe.accounts.reject(
        req.params.id,
        {
          reason: 'other',
        }
    );
    let account;

    console.log("reject", reject);
    
    if(!reject.charges_enabled && !reject.payouts_enabled) {
        const deleteAccount = await stripeConnectModel.findOne({connectAccountId: deleted.id});
        const channelDetail = await channelModel.findOne({userId: deleteAccount.userId});
        console.log('channelDetail', channelDetail);
        const userDetail = await userModel.findById(deleteAccount.userId);
        if(deleteAccount){
            account = await stripeConnectModel.findByIdAndDelete(deleteAccount._id);

            console.log("account", account);

            if(account) {
                const message = `
                    <p>Hi ${channelDetail.channelName },</p>

                    <p>We hope this message finds you well.</p>

                    <p>We are writing to inform you that your Stripe Connect account has been <strong>removed</strong> by the admin. As a result, you will no longer be able to receive payouts for any earnings generated through our platform.</p>

                    <h3>Why Was Your Account Removed?</h3>
                    <p>The admin may have decided to remove your account for one of the following reasons:</p>
                    <ul>
                        <li><strong>Account inactivity</strong>: If your account has not been active for an extended period.</li>
                        <li><strong>Violations of platform policies</strong>: Non-compliance with our terms of service or guidelines.</li>
                    </ul>

                    <h3>What Does This Mean for You?</h3>
                    <p>
                        - Any pending payouts to your Stripe account will no longer be processed.<br>
                        - You will need to create a new Stripe Connect account to resume receiving payouts on the platform.
                    </p>

                    <h3>What to Do Next:</h3>
                    <p>If you believe this was done in error or if you would like to continue receiving payouts, please feel free to 
                        <a href="mailto:support@yourplatform.com">contact our support team</a>. We will be happy to assist you in reactivating your account or guiding you through the steps to create a new one.
                    </p>

                    <p>Thank you for your understanding, and we appreciate your contributions to our community.</p>

                    <p>Best regards,<br>
                    <strong>The Tattoo Live Streaming Team</strong><br>
                    </p>
                `;
                // <a href="https://yourplatform.com">YourPlatform.com</a><br>
                //     Support Email: <a href="mailto:support@yourplatform.com">support@yourplatform.com</a>
                
                try{
                    await sendEmail({
                        email: userDetail.email,
                        subject:`Important: Your Stripe Account Has Been Removed`,
                        message,
                        type: 'html'
                    });
                } catch(error){
                    return next(new ErrorHandler(error.message, 500));
                }
            }
        } else {
            account = ''
        }
    }

    res.status(200).json({
        success: true,
        account
    });

});

exports.rejectConnectAccount = catchAsyncErrors(async (req, res, next)=>{
    const deleted = await stripe.accounts.del(req.params.id);
    let account;

    console.log("deleted", deleted);
    
    if(deleted.deleted) {
        const deleteAccount = await stripeConnectModel.findOne({connectAccountId: deleted.id});
        const channelDetail = await channelModel.findOne({userId: deleteAccount.userId});
        console.log('channelDetail', channelDetail);
        const userDetail = await userModel.findById(deleteAccount.userId);
        if(deleteAccount){
            account = await stripeConnectModel.findByIdAndDelete(deleteAccount._id);

            console.log("account", account);

            if(account) {
                const message = `
                    <p>Hi ${channelDetail.channelName },</p>

                    <p>We hope this message finds you well.</p>

                    <p>We are writing to inform you that your Stripe Connect account has been <strong>removed</strong> by the admin. As a result, you will no longer be able to receive payouts for any earnings generated through our platform.</p>

                    <h3>Why Was Your Account Removed?</h3>
                    <p>The admin may have decided to remove your account for one of the following reasons:</p>
                    <ul>
                        <li><strong>Account inactivity</strong>: If your account has not been active for an extended period.</li>
                        <li><strong>Violations of platform policies</strong>: Non-compliance with our terms of service or guidelines.</li>
                    </ul>

                    <h3>What Does This Mean for You?</h3>
                    <p>
                        - Any pending payouts to your Stripe account will no longer be processed.<br>
                        - You will need to create a new Stripe Connect account to resume receiving payouts on the platform.
                    </p>

                    <h3>What to Do Next:</h3>
                    <p>If you believe this was done in error or if you would like to continue receiving payouts, please feel free to 
                        <a href="mailto:support@yourplatform.com">contact our support team</a>. We will be happy to assist you in reactivating your account or guiding you through the steps to create a new one.
                    </p>

                    <p>Thank you for your understanding, and we appreciate your contributions to our community.</p>

                    <p>Best regards,<br>
                    <strong>The Tattoo Live Streaming Team</strong><br>
                    </p>
                `;
                // <a href="https://yourplatform.com">YourPlatform.com</a><br>
                //     Support Email: <a href="mailto:support@yourplatform.com">support@yourplatform.com</a>
                
                try{
                    await sendEmail({
                        email: userDetail.email,
                        subject:`Important: Your Stripe Account Has Been Removed`,
                        message,
                        type: 'html'
                    });
                } catch(error){
                    return next(new ErrorHandler(error.message, 500));
                }
            }
        } else {
            account = ''
        }
    }

    res.status(200).json({
        success: true,
        account
    });
});

exports.pauseAccountPayout = catchAsyncErrors(async (req, res, next)=>{

    let account = await stripe.accounts.update(req.params.accountId, {
        settings: {
            payouts: {
                schedule: {
                    interval: req.body.payoutType, // Set the payout schedule to manual
                },
            },
        },
    });
    
    if(account?.settings?.payouts?.schedule?.interval == "manual") {
        
        const payoutAccount = await stripeConnectModel.findOne({connectAccountId: req.body.connectAccountId});
        if(payoutAccount){
            const channelDetail = await channelModel.findById(payoutAccount.channelId);
            const userDetail = await userModel.findById(payoutAccount.userId);
            // const channelPlan = await channelActivePlanModel.findOne(payoutAccount.channelId);
            
            let updatedAccount = await stripeConnectModel.findByIdAndUpdate(payoutAccount._id, { payoutType: 'manual' }, {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });

            if(updatedAccount.payoutType == 'manual') {
                const notificationData = await notificationModel.create({
                    senderUserId: req.body.adminUserId,
                    notificationType: 'single',
                    receiverUserIds: payoutAccount.userId,
                    message: 'Your payout method has been set to manual by admin.',
                });
                // const planDetail = await channelActivePlanModel.findByIdAndUpdate(channelPlan._id, {
                //     isPaid: false
                // }, {
                //     new: true,
                //     runValidators: true,
                //     useFindAndModify: false,
                // });

                // if(planDetail.isPaid){

                    const message = `
                        <p>Hi ${channelDetail.channelName },</p>
    
                        <p>We hope this message finds you well.</p>
    
                        <p>We are writing to inform you that your Stripe Connect account's payout method has been changed to <strong>manual payouts</strong>. This means that future payouts will no longer be automatically processed and your channel is currently <strong>unable to receive payments</strong></p>
    
                        <h3>Why Was Your Payout Method Changed?</h3>
                        <p>This change may have occurred for the below reasons:</p>
                        <ul>
                            <li> Your stripe account details may be incomplete or pending verification.</li>
                            <li><strong>Account review</strong>: Your account is under review, and payouts will be manually processed while this review is completed.</li>
                        </ul>
    
                        <h3>What Does This Mean for You?</h3>
                        <p>
                            - Automatic payouts will no longer occur.
                        </p>
    
                        <p>Thank you for your understanding, and we appreciate your continued contributions to our platform.</p>
    
                        <p>Best regards,<br>
                        <strong>The Tattoo Live Streaming Team</strong><br>
                        </p>
                    `;
                    
                    try{
                        await sendEmail({
                            email: userDetail.email,
                            subject:`Complete Your Account Details to Receive Payouts`,
                            message,
                            type: 'html'
                        });
                    } catch(error){
                        return next(new ErrorHandler(error.message, 500));
                    }
                // }
            }
        } else {
            account = ''
        }
    } else if(account?.settings?.payouts?.schedule?.interval == "daily") {

        const payoutAccount = await stripeConnectModel.findOne({connectAccountId: req.body.connectAccountId});
        if(payoutAccount){
            const channelDetail = await channelModel.findById(payoutAccount.channelId);
            const userDetail = await userModel.findById(payoutAccount.userId);
            // const channelPlan = await channelActivePlanModel.findOne(payoutAccount.channelId);
            
            let updatedAccount = await stripeConnectModel.findByIdAndUpdate(payoutAccount._id, { payoutType: 'daily' }, {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });

            if(updatedAccount.payoutType == 'daily') {
                const notificationData = await notificationModel.create({
                    senderUserId: req.body.adminUserId,
                    notificationType: 'single',
                    receiverUserIds: payoutAccount.userId,
                    message: 'Your payout method has been set to automatic by admin.',
                });
                // const planDetail = await channelActivePlanModel.findByIdAndUpdate(channelPlan._id, {
                //     isPaid: false
                // }, {
                //     new: true,
                //     runValidators: true,
                //     useFindAndModify: false,
                // });

                // if(planDetail.isPaid){

                    const message = `
                        <p>Hi ${channelDetail.channelName },</p>
                        <p>We hope this message finds you well.</p>

                        <p>We are pleased to inform you that your Stripe Connect account's payout method has been changed to <strong>automatic payouts</strong>. This means your future earnings will be automatically deposited into your linked bank account without the need for manual intervention.</p>

                        <h3>What Does This Mean for You?</h3>
                        <p>
                            - Your earnings will now be automatically transferred to your bank account.<br>
                        </p>

                        <p>No further action is required on your part. Your payouts will be processed automatically based on your payout schedule.</p>

                        <p>Thank you for your continued contributions to our platform, and we are excited to help you grow your channel.</p>
    
                        <p>Best regards,<br>
                        <strong>The Tattoo Live Streaming Team</strong><br>
                        </p>
                    `;
                    
                    try{
                        await sendEmail({
                            email: userDetail.email,
                            subject:`Automatic Payouts Activated`,
                            message,
                            type: 'html'
                        });
                    } catch(error){
                        return next(new ErrorHandler(error.message, 500));
                    }
                // }
            }
        } else {
            account = ''
        }
    }

    res.status(200).json({
        success: true,
        account
    });

});

