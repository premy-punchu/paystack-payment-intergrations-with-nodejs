async function onPayPalWebSdkLoaded() {
  try {
    // Get client token for authentication
    const clientToken = await getBrowserSafeClientToken();
    
    // Create PayPal SDK instance
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });

    // Check eligibility for save payment with vault flow
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
      paymentFlow: "VAULT_WITHOUT_PAYMENT", // Specify vault flow without payment
    });

    // Setup save payment button if eligible
    if (paymentMethods.isEligible("paypal")) {
      setupPayPalButton(sdkInstance);
    } else {
      console.log("PayPal save payment is not eligible for this session");
      showNotEligibleMessage();
    }
  } catch (error) {
    console.error("SDK initialization error:", error);
    handleInitializationError(error);
  }
}



const paymentSessionOptions = {
  // Called when customer approves saving their payment method
  async onApprove(data) {
    console.log("Save payment approved:", data);
    
    try {
      // Create payment token from vault setup token
      const createPaymentTokenResponse = await createPaymentToken(
        data.vaultSetupToken,
      );
      
      console.log("Payment token created:", createPaymentTokenResponse);
      
      // Handle successful save payment
      handleSavePaymentSuccess(createPaymentTokenResponse);
      
    } catch (error) {
      console.error("Payment token creation failed:", error);
      handleSavePaymentError(error);
    }
  },
  
  // Called when customer cancels the save payment flow
  onCancel(data) {
    console.log("Save payment cancelled:", data);
    handleSavePaymentCancellation();
  },
  
  // Called when an error occurs during save payment
  onError(error) {
    console.error("Save payment error:", error);
    handleSavePaymentError(error);
  },
};