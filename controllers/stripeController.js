const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const channelModel = require('../models/channelModel');
const stripeConnectedAccountModel = require('../models/stripeConnectedAccountModel');
const transactionsModel = require('../models/transactionsModel');
const subscriptionDetailModel = require('../models/subscriptionDetailModel');
const ErrorHandler = require('../utils/errorHandler');
const stripe = require('stripe')('sk_test_51PMP4BLhsqLL49rZBED0LNv5P6OzMRirZe3F7BcEZVLU3gGXkXFG8n7nExzHqQB8nFYUd02wMtt01Enq5I7PHdK000EP2fSirO');
const sendEmail = require('../utils/sendEmail');
const userModel = require('../models/userModel');


// exports.checkOut = catchAsyncErrors(async (req, res, next)=>{

//     // const channelName = req.body.channelName;

//     const session = await stripe.checkout.sessions.create({
//         line_items: [
//             {
//                 price_data: {
//                     currency: 'usd',
//                     product_data: {
//                         name: 'Channel Subscription'
//                     },
//                     unit_amount: 10 * 100
//                     // unit_amount: req.body.amount * 100
//                 },
//                 quantity: 1
//             }
//             // {
//             //     price_data: {
//             //         currency: 'usd',
//             //         product_data: {
//             //             name: channelName
//             //         },
//             //         unit_amount: 20 * 100
//             //     },
//             //     quantity: 2
//             // }
//         ],
//         mode: 'payment',
//         // shipping_address_collection: {
//         //     allowed_countries: ['US', 'BR']
//         // },
//         success_url: `http://localhost:3000/complete?session_id=nl`,
//         cancel_url: `http://localhost:3000/cancel`
//     })
//     // console.log('session.url', session);
//     res.redirect(session.url);
// });


// exports.completePayment = catchAsyncErrors(async (req, res, next) => {
//     const result = Promise.all([
//         stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] }),
//         stripe.checkout.sessions.listLineItems(req.query.session_id)
//     ])

//     console.log(JSON.stringify(await result))

//     res.send('Your payment was successful')
// });


// exports.stripeWebhook= async (req, res) => {
//     let event;
//     // Only verify the event if you have an endpoint secret defined.
//     // Otherwise use the basic event deserialized with JSON.parse
//     if (process.env.STRIPE_WEBHOOK_SECRET) {
//       // Get the signature sent by Stripe
//       const signature = req.headers["stripe-signature"];
//       try {
//         event = stripe.webhooks.constructEvent(
//           req.body,
//           signature,
//           process.env.STRIPE_WEBHOOK_SECRET
//         );
//       } catch (err) {
//         console.log(`⚠️  Webhook signature verification failed.`, err.message);
//         return res.sendStatus(400);
//       }
//     }
  
//     // Handle the event
//     switch (event.type) {
//       case "payment_intent.succeeded":
//         const paymentIntent = event.data.object;
//         console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
//         console.log(paymentIntent);
//         // Then define and call a methstripe loginod to handle the successful payment intent.
//         // handlePaymentIntentSucceeded(paymentIntent);
//         break;
//       case "payment_method.attached":
//         const paymentMethod = event.data.object;
//         // Then define and call a method to handle the successful attachment of a PaymentMethod.
//         // handlePaymentMethodAttached(paymentMethod);
//         break;
//       case "payment_intent.payment_failed":
//         const failedpaymentIntent = event.data.object;
//         console.log(`PaymentIntent for ${paymentIntent.amount} failed!`);
//         // Then define and call a methstripe loginod to handle the successful payment intent.
//         // handlePaymentIntentSucceeded(paymentIntent);
//         break;
//       case "checkout.session.completed":
//         console.log(event.data.object);
//         // console.log(`PaymentIntent for ${paymentIntent.amount} failed!`);
//         // Then define and call a methstripe loginod to handle the successful payment intent.
//         // handlePaymentIntentSucceeded(paymentIntent);
//         break;
//       default:
//         // Unexpected event type
//         console.log(`Unhandled event type ${event.type}.`);
//     }
  
//     // Return a 200 response to acknowledge receipt of the event
//     res.send();
// }


// exports.createConnectAccount = catchAsyncErrors(async (req, res, next)=>{
//   // const { email } = req.body;
//   const { email, firstName, lastName, dob, address, taxId } = req.body;
    
//   try {
//       // Create a Stripe Express account for the artist
//       // const artistAccount = await stripe.accounts.create({
//       //     type: 'express',
//       //     country: 'US',
//       //     email: email,
//       //     capabilities: {
//       //         card_payments: { requested: true },
//       //         transfers: { requested: true },
//       //     },
//       // });

//       const connectedAccount = await stripe.accounts.create({
//         type: 'express',
//         country: 'US',
//         email: email,
//         individual: {
//             first_name: "john",
//             last_name: "doe",
//             dob: {
//                 day: 1,
//                 month: 1,
//                 year: 2000,
//             },
//             address: {
//               line1: '1234 Test Street',
//               city: 'Test City',
//               state: 'CA',
//               postal_code: '90210'
//             },
//             email: email,
//             phone: '1212121212', // Provide a phone number if required
//         },
//         business_type: 'individual',
//         business_profile: {
//             name: `john doe`,
//             product_description: 'Streaming videos and earning through subscriptions',
//             support_email: "rahultest001@yopmail.com",
//         },
//         capabilities: {
//             card_payments: { requested: true },
//             transfers: { requested: true },
//         },
//     });
      
//       console.log("connectedAccount", connectedAccount)
//       // Generate an account link for onboarding
//       const accountLink = await stripe.accountLinks.create({
//           account: connectedAccount.id,
//           refresh_url: 'http://localhost:3000/reauth',
//           return_url: 'http://localhost:3000/return',
//           type: 'account_onboarding',
//       });
//       console.log("accountLink", accountLink)
//       res.json({ url: accountLink.url });
//   } catch (err) {
//       res.status(500).json({ error: err.message });
//   }
// });


// exports.stripeConnectWebhook = catchAsyncErrors(async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   const endpointSecret = 'whsec_...'; // Replace with your webhook secret

//   let event;

//   try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//   } catch (err) {
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   switch (event.type) {
//       case 'account.updated':
//           const account = event.data.object;
//           // Handle account update
//           break;
//       // ... handle other event types
//       default:
//           console.log(`Unhandled event type ${event.type}`);
//   }

//   res.json({ received: true });
// });


// exports.accountSession = catchAsyncErrors(async (req, res, next ) => {
//   try {
//     // const accountSession = await stripe.accountSessions.create({
//     //   account: 'acct_1PkOGCQ7ZOkwPolY',
//     //   components: {
//     //     payments: {
//     //       enabled: true,
//     //       features: {
//     //         refund_management: true,
//     //         dispute_management: true,
//     //         capture_payments: true,
//     //       }
//     //     },
//     //   }

//     const account = await stripe.accounts.create({
//       type: 'standard',
//     });
//     console.log("account", account);
//     // const accountSession = await stripe.accountSessions.create({
//     //   account: ,
//     //   components: {
//     //     account_onboarding: {
//     //       enabled: true,
//     //       features: {
//     //         external_account_collection: true,
//     //       },
//     //     },
//     //   },
//     // });

//     res.json({
//       client_secret: account,
//       // client_secret: accountSession.client_secret,
//     });
//   } catch (error) {
//     console.error('An error occurred when calling the Stripe API to create an account session', error);
//     res.status(500);
//     res.send({error: error.message});
//   }
// });


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
exports.createConnectedAccount = catchAsyncErrors(async (req, res, next ) => {
  try {
    const account = await stripe.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "express",
        },
        fees: {
          payer: "application"
        },
        losses: {
          payments: "application"
        },
      },
      business_type: 'individual',
      business_profile: {
        product_description: 'Streaming videos and earning through subscriptions',
      },
    });

    res.json({account: account.id});
   
  } catch (error) {
    console.error('An error occurred when calling the Stripe API to create an account:', error);
      res.status(500);
      res.json({error: error.message});
  }
});


exports.createConnectedAccountSession = catchAsyncErrors(async (req, res, next ) => {
  try {
    const accountSession = await stripe.accountSessions.create({
      account: req.body.account,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    res.json({
      client_secret: accountSession.client_secret,
    });
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account session",
      error
    );
    res.status(500);
    res.json({error: error.message});
  }
});


exports.connectAccountWebhook = catchAsyncErrors( async (req, res, next)=>{ 
  // console.log('running', req.body);
  let accInfoByWebhook;
  if(req.body?.type == "account.updated") {
    accInfoByWebhook = req.body.data?.object
    // console.log('capabilities', req.body.data.object?.capabilities);
    // console.log('business_profile', req.body.data.object?.business_profile);
    // console.log('controller', req.body.data.object?.controller);
    // console.log('future_requirements', req.body.data.object?.future_requirements);
    // console.log('requirements', req.body.data.object?.requirements);
    // console.log('settings', req.body.data.object?.settings);
    // console.log('external_accounts', req.body.data.object?.external_accounts);
    // console.log('login_links', req.body.data.object?.login_links);
    // console.log('details_submitted', req.body.data.object?.details_submitted);
    // console.log('payouts_enabled', req.body.data.object?.payouts_enabled);
    // console.log('--------------------------------------------------------------------------------------------------------------------------------------------------------------------------');

    let accStatus;
    if(accInfoByWebhook?.details_submitted){
      accStatus = 'created';
    } else {
      accStatus = 'pending'
    }

    updateInfo = {
      isAccountCreated: accStatus,
      isTransfer: accInfoByWebhook?.capabilities?.transfers
    }

    const accountInfo = await stripeConnectedAccountModel.findOneAndUpdate({ connectAccountId: accInfoByWebhook?.id }, updateInfo );
  }

  res.status(200).send('Webhook received');
})


exports.paymentCheckOut = catchAsyncErrors(async (req, res, next)=>{

  const { userId, channelId, channelName, amount, unit, duration, url, email } = req.body;

  if(!channelId) {
    return next(ErrorHandler('Channel id not found, Please provide channel id', 404));
  }

  const channelInfo = await channelModel.findById(channelId);
  
  if(!channelInfo) {
    return next(ErrorHandler('Channel not found', 404));
  }

  const connectAccount = await stripeConnectedAccountModel.findOne({channelId: channelId});

  const totalAmount = amount;

  // Platform percentage (25%)
  const platformPercentage = 0.25;

  // Stripe fee calculation (2.9% + 30¢)
  const stripeFeePercentage = 0.029;
  const fixedStripeFee = 0.30;

  // // Step 1: Calculate Stripe fees
  // const stripeFee = (totalAmount * stripeFeePercentage) + fixedStripeFee;

  // // Step 2: Calculate the platform's base share
  // const platformBaseShare = totalAmount * platformPercentage;

  // // Step 3: Calculate the total platform fee including Stripe fees
  // const platformFee = platformBaseShare + stripeFee;

  // // Step 4: Calculate the amount to be transferred to the user
  // const userAmount = totalAmount - platformFee;


  let stripeFee = (totalAmount * stripeFeePercentage) + fixedStripeFee;
  stripeFee = Math.round((stripeFee * 100) / 100); // Round to the nearest cent

  // Step 2: Calculate the platform's base share
  let platformBaseShare = totalAmount * platformPercentage;
  platformBaseShare = Math.round((platformBaseShare * 100) / 100); // Round to the nearest cent

  // Step 3: Calculate the total platform fee including Stripe fees
  let platformFee = platformBaseShare + stripeFee;
  platformFee = Math.round((platformFee * 100) / 100); // Round to the nearest cent

  // Step 4: Calculate the amount to be transferred to the user
  let userAmount = totalAmount - platformFee;
  userAmount = Math.round((userAmount * 100) / 100);


  let txnData = {
    // checkoutSessionId: session.id,
    userId: userId,
    channelId: channelId,
    status: 'pending',
    amount: amount,
    platformFees: platformBaseShare,
    stripeFees: stripeFee,
    artistAmount: userAmount,
    isTransferToArtist: false,
    planDuration: duration,
    planDurationUnit: unit,
    transactionDate: new Date()
  }

  console.log('txnData-------------------------------------------------------------------------------------------------', txnData)
  const transactionDetail = await transactionsModel.create(txnData);
  
  if(!transactionDetail) {
    return next(new ErrorHandler('Transaction is not created, please try again'))
  }

  let txnId = transactionDetail._id.toString();

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${channelName} subscription price`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: Math.round(platformFee) * 100,
      transfer_data: {
        destination: connectAccount.connectAccountId,
      },
      metadata: {
        txn_id: txnId,
        email: email,
        channelName: channelName
      },
    },
    mode: 'payment',
    success_url: `http://localhost:3000/payment/complete?channelName=${channelName}`,
    cancel_url: url,
    // cancel_url: `http://localhost:3000/cancel`
  });

  
  await transactionsModel.findByIdAndUpdate(transactionDetail._id, {checkoutSessionId: session.id,}, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  // console.log('session', session)
  // // res.redirect(session.url);
  res.status(200).json({
    success: true,
    url: session.url
  })
});


exports.checkoutWebhook = catchAsyncErrors( async (req, res, next)=>{ 
  console.log('checkout', req.body);

  let requestType = req.body.type;
  let bodyData = req.body?.data?.object;


  if(requestType == 'checkout.session.completed') {
    
    console.log(" check bodyData ", bodyData);
    let transactionDetail = await transactionsModel.findOne({checkoutSessionId: bodyData.id});

    console.log("checkout compeleted transactionDetail", transactionDetail);

    if(!transactionDetail) {
      res.status(200).send('Webhook received');
    }

    // console.log('total_details', bodyData.total_details)
    // console.log('payment_method_types', bodyData.payment_method_types) 
    // console.log('payment_method_options', bodyData.payment_method_options) 
    // console.log('payment_method_configuration_details', bodyData.payment_method_configuration_details) 
    // console.log('automatic_tax', bodyData.automatic_tax) 
    // console.log('customer_details', bodyData.customer_details) 
    
    let updateData = {
      paymentIntentId: bodyData.payment_intent,
      transactionDate: new Date(bodyData.created * 1000)
    }
    
    await transactionsModel.findByIdAndUpdate(transactionDetail._id, updateData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

  }
    
  // if(requestType == 'charge.succeeded'){    
  //   console.log('---------------------------charge succeeded ------------------------------', ) 
  //   console.log('outcome', bodyData.outcome) 
  //   console.log('payment_method_details', bodyData.payment_method_details) 
  //   console.log('transfer_data', bodyData.transfer_data) 
  // }

  // ------------------------------------ payment_intent.succeeded ---------------------------------------
  if(requestType == 'payment_intent.succeeded'){
    // console.log('amount_details', bodyData.amount_details) 
    // console.log('payment_method_options', bodyData.payment_method_options) 
    // console.log('payment_method_types', bodyData.payment_method_types) 
    // console.log('transfer_data', bodyData.transfer_data) 
    // console.log('transactionDetail._id bodyData.id', bodyData.id)

    // let transactionDetail = await transactionsModel.findOne({paymentIntentId: bodyData.id});

    // let transactionDetail = await retryFindTransaction(bodyData.id);
    
    let transactionDetail = await transactionsModel.findById(bodyData.metadata.txn_id);

    console.log("succedd transactionDetail", transactionDetail)
    // if (transactionDetail) {
    //   return transactionDetail;
    // }

    if (!transactionDetail) {
      // console.log('Transaction not found after retries.');
      return res.status(200).send('Webhook received');
    }

    let updateData = {
      status: bodyData.status,
      paymentMethod: bodyData.payment_method_types[0],
      artistAccountId: bodyData.transfer_data.destination,
      reason: ''
    }
    console.log("updateData----> ", updateData);
    // console.log('intent transactionDetail._id', transactionDetail)
    const txnDetail = await transactionsModel.findByIdAndUpdate(transactionDetail._id, updateData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    console.log("succedd txnDetail", txnDetail)

    let userId= txnDetail.userId;
    let channelId= txnDetail.channelId;

    const alreadySubscribed = await subscriptionDetailModel.find({$and:[
      { userId: userId },
      { channelId: channelId }
    ]});

    console.log("succedd alreadySubscribed", alreadySubscribed)
    let subscriptionDetail;
    if(alreadySubscribed.length > 0){

      let startDate = new Date();
      let newDate = new Date();
      let endDate;

      if (txnDetail.planDurationUnit === 'month') {
        endDate = newDate.setMonth(newDate.getMonth() + txnDetail.planDuration);
      } else if (txnDetail.planDurationUnit === 'year') {
        endDate = newDate.setFullYear(newDate.getFullYear() + txnDetail.planDurationUnit);
      }

      subscriptionDetail = await subscriptionDetailModel.findByIdAndUpdate(alreadySubscribed[0]._id, {
        userId,
        channelId,
        planDuration: txnDetail.planDuration,
        planDurationUnit: txnDetail.planDurationUnit,
        startDate,
        endDate,
        isActive: true
      },{
          new: true,
          runValidators: true,
          useFindAndModify: false,
      });

      // return next(new ErrorHandler("User already subscribed this channel", 400))
    } else if(alreadySubscribed.length == 0) {
  
      let startDate = new Date();
      let newDate = new Date();
      let endDate;

      if (txnDetail.planDurationUnit === 'month') {
        endDate = newDate.setMonth(newDate.getMonth() + txnDetail.planDuration);
      } else if (txnDetail.planDurationUnit === 'year') {
        endDate = newDate.setFullYear(newDate.getFullYear() + txnDetail.planDurationUnit);
      }

      console.log(endDate);
      
      let createData = {
        userId,
        channelId,
        planDuration: txnDetail.planDuration,
        planDurationUnit: txnDetail.planDurationUnit,
        startDate,
        endDate,
        isActive: true
      }

      console.log("createData", createData);

      subscriptionDetail = await subscriptionDetailModel.create(createData);

    }

    const userInfo = await userModel.findById(userId);

    const message = `
      <div style="width: 80%; max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
            <h1 style="margin: 0; color: #333;">Subscription Success!</h1>
        </div>
        <div style="margin: 20px 0;">
            <p>Hi ${userInfo.firstName} ${userInfo.lastName},</p>
            <p>Thank you for subscribing to ${ bodyData.metadata.channelName }! 🎉</p>
            <p>We’re excited to have you join our community. Your subscription has been successfully processed, and you now have access to all the exclusive content and benefits that come with it.</p>
            <h2>Your Subscription Details:</h2>
            <p><strong>Channel:</strong> ${bodyData.metadata.channelName}</p>
            <p><strong>Start Date:</strong> ${subscriptionDetail.startDate}</p>
            <p><strong>End Date:</strong> ${subscriptionDetail.endDate}</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #777;">
          <p>Thank you once again for your support. We’re thrilled to have you with us!</p>
          <p>Best regards,<br>The Tattoo Live Streaming Team</p>
        </div>
      </div>`;

    // <h2>What’s Next?</h2>
    // <p><strong>Explore:</strong> Check out our latest content and upcoming streams at <a href="[Link to Channel]">Visit Channel</a></p>
    // <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:[Support Email Address]">[Support Email Address]</a>.</p>

      try{
          await sendEmail({
              email: bodyData.metadata.email,
              subject:`Subscription Success! Welcome to ${bodyData.metadata.channelName}`,
              message,
              type: 'html'
          });
      } catch(error){
          return next(new ErrorHandler(error.message, 500));
      }

  }

  // ------------------------------------ payment_intent.created ---------------------------------------
  if(requestType == 'payment_intent.created'){
    // console.log('---------------------------payment_intent created ------------------------------', ) 
    // console.log('amount_details', bodyData.amount_details) 
    // console.log('payment_method_options', bodyData.payment_method_options) 
    // console.log('payment_method_types', bodyData.payment_method_types) 
    // console.log('transfer_data', bodyData.transfer_data) 
    
    // const paymentIntent = await stripe.paymentIntents.retrieve(bodyData.id);
    // console.log('Order ID:', paymentIntent);

    // console.log('bodyData.id payment_intent.created', bodyData.id);
    // console.log('bodyData.id payment_intent.created', bodyData.metadata);

    // let transactionDetail = await transactionsModel.findOne({paymentIntentId: bodyData.id});
    let transactionDetail = await transactionsModel.findById(bodyData.metadata.txn_id);

    // console.log('transactionDetail ----- created', transactionDetail)

    if(!transactionDetail) {
      res.status(200).send('Webhook received');    
    }
    
    let updateData = {
      paymentIntentId: bodyData.payment_intent,
      transactionDate: new Date(bodyData.created * 1000)
    }
    // console.log('transactionDetail._id', transactionDetail._id)
    await transactionsModel.findByIdAndUpdate(transactionDetail._id, updateData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  }
  
  // ------------------------------------ payment_intent requires_action------------------------------------
  if(requestType == "payment_intent.requires_action") {
    console.log('metadata require action -->', bodyData.metadata)

    const transactionDetail = await transactionsModel.findById(bodyData.metadata.txn_id);

    let updateData = {
      paymentIntentId: bodyData.payment_intent,
      transactionDate: new Date(bodyData.created * 1000),
    }
    
    await transactionsModel.findByIdAndUpdate(transactionDetail._id, updateData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  }



  // if(requestType == 'payment.created'){
  //   console.log('---------------------------payment created ------------------------------', ) 
  //   console.log('billing_details', bodyData.billing_details) 
  //   console.log('payment_method_details', bodyData.payment_method_details) 
  //   console.log('source', bodyData.source)
  // }

  // if(requestType == 'transfer.created'){
  //   console.log('---------------------------transfer created ------------------------------', ) 
  //   console.log('reversals', bodyData.reversals)
  // }
  // if(requestType == 'charge.updated'){
  //   console.log('---------------------------charge update ------------------------------', ) 
  //   console.log('outcome', bodyData.outcome) 
  //   console.log('payment_method_details', bodyData.payment_method_details) 
  //   console.log('transfer_data', bodyData.transfer_data)
  // }
  // if(requestType == 'application_fee.created'){
  //   console.log('---------------------------application_fee created ------------------------------', ) 
  //   console.log('fee_source', bodyData.fee_source) 
  //   console.log('refunds', bodyData.refunds)
  // }


  if(requestType == 'charge.failed'){
    // console.log('bodyData.last_payment_error', bodyData.last_payment_error)
    // console.log("bodyData------------------------->", bodyData.metadata)
    let transactionDetail = await transactionsModel.findById( bodyData.metadata.txn_id);
    // console.log('failed transactionDetail', transactionDetail)

    if (!transactionDetail) {
      // console.log('Transaction not found after retries.');
      return res.status(200).send('Webhook received');
    }

    let updateData = {
      status: bodyData.status,
      reason: bodyData.failure_message,
      // paymentMethod: bodyData.payment_method_types[0],
      // artistAccountId: bodyData.transfer_data.destination
    }

    // console.log('intent transactionDetail._id', transactionDetail)
    await transactionsModel.findByIdAndUpdate(transactionDetail._id, updateData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  }
  if(requestType == 'payment_intent.payment_failed'){
    
    console.log("bodyData.last_payment_error", bodyData.last_payment_error)
    
  }

  res.status(200).send('Webhook received');
})


exports.expressDashboardLink = catchAsyncErrors(async (req, res, next)=>{
  const { connectAccountId } = req.body;
  const loginLink = await stripe.accounts.createLoginLink(connectAccountId);

  console.log("loginLink", loginLink)

  res.status(200).json({
    loginLink
  })
});


exports.getAllConnectedAccount = catchAsyncErrors(async (req, res, next)=>{
  const accounts = await stripe.accounts.list({
    limit: 50,
  });
  
  res.status(200).json({
    success: true,
    accounts
  })
});




const retryFindTransaction = async (paymentIntentId, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    let transactionDetail = await transactionsModel.findOne({ paymentIntentId });
    if (transactionDetail) {
      return transactionDetail;
    }
    await new Promise(res => setTimeout(res, delay));
  }
  return null;
};


function calculateEndDate(startDate, duration, unit) {
  let endDate = new Date(startDate);

  if (unit === 'month') {
      endDate.setMonth(endDate.getMonth() + duration);
  } else if (unit === 'year') {
      endDate.setFullYear(endDate.getFullYear() + duration);
  }

  return endDate;
}


