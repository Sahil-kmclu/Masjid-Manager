
/**
 * Handles OTP verification logic using simulated SMS.
 * 
 * @param {string} phoneNumber - The phone number to send OTP to.
 * @param {string} actionDescription - Description of the action for the alert (e.g., "delete this payment").
 * @returns {Promise<boolean>} - Resolves to true if verified, false otherwise.
 */
export const verifyOTP = async (phoneNumber, actionDescription) => {
    if (!phoneNumber) {
        alert('No phone number registered for this section to receive OTP. Action cannot be verified.');
        return false;
    }

    // 1. Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 2. Simulate sending OTP
    // Using a slight timeout to make it feel async/realistic if needed, but alert is blocking.
    alert(`[SIMULATED SMS] Your OTP to ${actionDescription} is: ${otp}\n(Sent to: ${phoneNumber})`);

    // 3. Prompt for OTP
    // Using window.prompt as it is simple and used elsewhere in the project.
    // For a better UX, we would use a Modal, but this matches existing patterns (MosqueProfile.jsx).
    const inputOtp = window.prompt(`Enter the 4-digit OTP sent to ${phoneNumber} to confirm:`);

    if (inputOtp === null) {
        // User cancelled
        return false;
    }

    if (inputOtp === otp) {
        return true;
    } else {
        alert('Invalid OTP. Verification failed.');
        return false;
    }
};
