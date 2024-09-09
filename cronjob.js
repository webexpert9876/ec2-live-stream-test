const cron = require('node-cron');
const SubscriptionModel = require('./models/subscriptionDetailModel');
const TransactionsModel = require('./models/transactionsModel');
const SubscriptionPlanModel = require('./models/subscriptionPlanModel');
const catchAsyncErrors = require('./middlewares/catchAsyncErrors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sendEmail = require('./utils/sendEmail');

// Function to deactivate expired subscriptions
const deactivateExpiredSubscriptions = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const result = await SubscriptionModel.updateMany(
            { endDate: { $lte: today }, isActive: true },
            { isActive: false }
        );

        // console.log(`Deactivated ${result.modifiedCount} subscriptions.`);
    } catch (error) {
        console.error('Error deactivating subscriptions:', error);
    }
};


const updateOldPendingTransactions = async () => {
    try {
      // Calculate the date 24 hours ago
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
      // Update all transactions with status "pending" and created more than 24 hours ago
      const result = await TransactionsModel.updateMany(
        {
          status: 'pending',
          createdAt: { $lt: twentyFourHoursAgo }
        },
        {
          $set: { status: 'canceled' } // Update status to "canceled"
        }
      );
  
    //   console.log(`${result.modifiedCount} transactions were updated.`);
    } catch (error) {
      console.error('Error updating transactions:', error);
    }
}

const resetSubscriptionPlanLimit = async () => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    
    const plansToUpdate = await SubscriptionPlanModel.find({
      createdAt: { $lte: oneYearAgo }, planUpdateCount: { $gt: 0 }
    });

    if (plansToUpdate.length > 0) {
      for (let plan of plansToUpdate) {
        plan.planUpdateCount = 0; // Reset the plan limit
        await plan.save();
      }
      console.log(`${plansToUpdate.length} plans have been reset.`);
    } else {
      console.log('No plans to reset today.');
    }
  } catch (error) {
    console.error('Error resetting plan limits:', error);
  }
}

const sendEmailIfRequirementIsPending = catchAsyncErrors(async () => {
  let hasMore = true;
  let startingAfter = null;
  // let count1 = 0;
  // let count2= 0;
  // let count3= 0;
  // let count= 0;
  try {
    while (hasMore) {

      const params = { limit: 100 }; // Stripe's max limit per request
      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const response = await stripe.accounts.list(params);
      
      for (const account of response.data) {
        const { id, capabilities, charges_enabled, payouts_enabled, metadata, requirements } = account;
        // console.log('id==> ', account.id)
        let issues = [];

        if (!charges_enabled) {
          // count1++
          issues.push('Your account cannot currently receive payments from customers.');
        }

        if (!payouts_enabled) {
          // count2++
          issues.push('Payouts are not enabled. Your earnings cannot be sent to your bank account at this time.');
        }

        if (requirements.currently_due.length > 0 || requirements.eventually_due.length > 0) {
          // console.log(`pending ${count++}`)
          issues.push('Your account has pending requirements that must be completed to avoid payout pauses.');
        }

        if (!capabilities.transfers || capabilities.transfers !== 'active') {
          // count3++
          issues.push('Transfers capability is not active. You are currently unable to send payments or transfer money.');
        }

        if (issues.length > 0) {
          // sendAlertEmail(account.id, issues);
          if(metadata?.email) {
            // console.log('email sent', metadata.email);
            const message = `
                  <body>
                    <h2>Stripe Account Alert</h2>
                    <p>Hello,</p>
                    <p>The following issues have been detected with Stripe account <strong>${id}</strong>:</p>
                    <ul>
                      ${issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                    <p>To resolve these issues, please complete your profile and fill in any missing required details. This will ensure you can continue to receive payments without any interruptions.</p>
  
                    <p>Best regards,<br>Live Tattoo Stream</p>
                  </body>`;
  
              try{
                  await sendEmail({
                      email: metadata?.email,
                      subject:`⚠️ Action Required: Issue with Your Stripe Account`,
                      message,
                      type: 'html'
                  });
              
              } catch(error){
  
                  return next(new ErrorHandler(error.message, 500));
              }
          } else {
            // console.log('else')
          }
        }
      }

      // Check if there are more accounts to fetch
      hasMore = response.has_more;
      if (hasMore) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }
  } catch (error) {
    console.error('Error checking Stripe accounts:', error);
  }
  // console.log('count1 ', count1)
  // console.log('count2 ', count2)
  // console.log('count3 ', count3)
})


// Function to start the cron job
const startCronJob = () => {
    // Schedule the cron job to run at midnight every day
    cron.schedule('0 0 * * *', deactivateExpiredSubscriptions);
    cron.schedule('0 0 * * *', updateOldPendingTransactions);
    cron.schedule('0 0 * * *', resetSubscriptionPlanLimit);
    cron.schedule('0 0 * * *', sendEmailIfRequirementIsPending);
    console.log('Cron job scheduled to deactivate expired subscriptions.');
};

module.exports = startCronJob;