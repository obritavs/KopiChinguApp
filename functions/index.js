/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions"); // 💡 ADDED: Needed for functions.config() and HttpsError
const { setGlobalOptions } = require("firebase-functions");
const { onCall } = require("firebase-functions/v2/https"); // Use v2 syntax for the callable function
const logger = require("firebase-functions/logger");

// 1. Initialize Stripe using the v1 context to access config()
const stripe = require('stripe')(functions.config().stripe.secret); 

// For cost control, you can set the maximum number of containers that can be
// running at the same time.
setGlobalOptions({ maxInstances: 10 });

// ----------------------------------------------------------------------
// ⚡️ STRIPE: CREATE PAYMENT INTENT FUNCTION (Callable)
// ----------------------------------------------------------------------

// We use the v2 onCall syntax imported above
exports.createPaymentIntent = onCall(async (request) => {
    // ⚠️ Security Check: Ensure the user is authenticated
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    
    // The amount is passed in the request data from the frontend
    const totalAmount = request.data.amount; // Expecting amount in cents/lowest unit
    
    if (!totalAmount || totalAmount < 50) { // Basic validation
        throw new functions.https.HttpsError('invalid-argument', 'A valid amount is required.');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'php', // Match your currency
            metadata: { 
                userId: request.auth.uid,
                userName: request.auth.token.name || 'N/A' 
            }, 
        });

        // Return the client secret to the frontend
        return {
            clientSecret: paymentIntent.client_secret,
        };

    } catch (error) {
        logger.error("Stripe Payment Intent Creation Error:", error);
        // Throw a client-safe error message
        throw new functions.https.HttpsError('internal', 'Unable to create payment intent. Check logs for details.');
    }
});
