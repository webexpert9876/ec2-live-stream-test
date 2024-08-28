const cron = require('node-cron');
const SubscriptionModel = require('./models/subscriptionDetailModel');
const TransactionsModel = require('./models/transactionsModel');
const SubscriptionPlanModel = require('./models/subscriptionPlanModel');

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


// Function to start the cron job
const startCronJob = () => {
    // Schedule the cron job to run at midnight every day
    cron.schedule('0 0 * * *', deactivateExpiredSubscriptions);
    cron.schedule('0 0 * * *', updateOldPendingTransactions);
    cron.schedule('0 0 * * *', resetSubscriptionPlanLimit);
    console.log('Cron job scheduled to deactivate expired subscriptions.');
};

module.exports = startCronJob;