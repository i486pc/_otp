# Vapi.ai Prompt Guide for OTP Voice Authentication

This document provides a comprehensive guide for creating an effective Vapi.ai prompt for delivering one-time passwords (OTPs) via voice calls.

## Table of Contents

1. [Introduction](#introduction)
2. [Prompt Structure](#prompt-structure)
3. [Sample Prompt](#sample-prompt)
4. [Implementation Guide](#implementation-guide)
5. [Best Practices](#best-practices)
6. [Testing and Validation](#testing-and-validation)

## Introduction

Voice-delivered OTPs provide an additional authentication channel that can be particularly useful for:
- Users with visual impairments
- Situations where SMS or email is unavailable
- Adding an extra layer of security to critical operations
- Users who prefer voice interaction

Vapi.ai allows you to create AI assistants that can make voice calls and deliver OTPs in a clear, secure manner.

## Prompt Structure

An effective OTP voice prompt should include:

1. **Introduction**: Clearly identify the service making the call
2. **Purpose**: Explain why the call is being made
3. **OTP Delivery**: Clearly state the OTP code, with appropriate pacing
4. **Repetition**: Repeat the code to ensure it's understood
5. **Expiration**: Mention the code's expiration time
6. **Security Reminder**: Include a brief security note
7. **Closing**: Thank the user and end the call professionally

## Sample Prompt

Below is a sample prompt for Vapi.ai that follows the recommended structure:

```
You are an automated security assistant for [Company Name]. Your task is to deliver a one-time verification code to the user.

When the call connects:
1. Introduce yourself: "Hello, this is the security verification system for [Company Name]."
2. Explain the purpose: "I'm calling to provide you with a one-time verification code that you requested for your account."
3. Deliver the OTP: "Your verification code is: {{OTP}}."
4. Repeat the code slowly and clearly: "Let me repeat that. Your verification code is: {{OTP}}."
5. Mention expiration: "This code will expire in 30 seconds."
6. Security reminder: "For security reasons, please don't share this code with anyone."
7. Closing: "Thank you for using our service. Goodbye."

Important guidelines:
- Speak at a moderate pace, especially when saying the code
- Pause briefly between each digit of the code
- If the user asks you to repeat the code, do so clearly
- If the user asks any questions about the service, politely explain that you're an automated system only able to provide the verification code
- Do not engage in conversations unrelated to the verification code
- If the user seems confused, offer to repeat the code one more time
- End the call after delivering the message and addressing any immediate questions about the code

Remember, your only purpose is to deliver the verification code securely and clearly.
```

## Implementation Guide

### Setting Up in Vapi.ai

1. **Create a New Assistant**:
   - Log in to your Vapi.ai account
   - Create a new assistant
   - Set the assistant ID as `aadf170f-0c11-451e-ac98-256b7f654455`
   - Name it "OTP Voice Authentication"

2. **Configure the Assistant**:
   - Set the voice to a clear, professional voice
   - Configure the assistant to end calls after delivering the message
   - Set appropriate call timeouts

3. **Add the Prompt**:
   - Copy the sample prompt above
   - Customize it with your company name
   - Save the prompt to the assistant

4. **Test the Assistant**:
   - Use the Vapi.ai testing tools to verify the assistant works correctly
   - Make sure the OTP is pronounced clearly and correctly

### Integration with Your API

When making a call through the Vapi.ai API, you'll need to:

1. **Format the OTP**:
   - Add spaces between digits for better readability
   - Example: Convert "123456" to "1 2 3 4 5 6"

2. **Make the API Call**:
   ```javascript
   const response = await fetch('https://api.vapi.ai/call', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${process.env.VAPI_API_KEY}`
     },
     body: JSON.stringify({
       recipient: {
         phone_number: phoneNumber
       },
       assistant_id: process.env.VAPI_ASSISTANT_ID,
       first_message: `Your verification code is: ${formattedOtp}. I repeat, your verification code is: ${formattedOtp}. This code will expire in 30 seconds.`
     })
   });
   ```

## Best Practices

1. **Clear Pronunciation**:
   - Format the OTP with spaces between digits
   - Use a voice that pronounces numbers clearly
   - Consider using phonetic pronunciations for ambiguous digits (e.g., "five" instead of "5")

2. **Security Considerations**:
   - Never include personal information in the call
   - Keep the call focused only on delivering the OTP
   - Remind users not to share the code with anyone

3. **User Experience**:
   - Keep the call short and to the point
   - Provide clear instructions
   - Repeat the code at least once
   - Speak at a moderate pace

4. **Accessibility**:
   - Ensure the voice is clear and easy to understand
   - Provide adequate pauses between digits
   - Offer to repeat the code if needed

5. **Compliance**:
   - Ensure your voice calls comply with local regulations
   - Include opt-out instructions if required by law
   - Maintain call records as required for compliance

## Testing and Validation

Before deploying to production, thoroughly test your Vapi.ai assistant:

1. **Internal Testing**:
   - Test with different OTP combinations
   - Verify the OTP is pronounced correctly
   - Test with different phone types and carriers

2. **User Testing**:
   - Conduct a small pilot with real users
   - Gather feedback on clarity and ease of use
   - Make adjustments based on feedback

3. **Edge Cases**:
   - Test with very long or short calls
   - Test with users interrupting the assistant
   - Test with background noise

4. **Monitoring**:
   - Monitor call success rates
   - Track verification success rates
   - Analyze call durations and patterns

By following this guide, you can create an effective Vapi.ai prompt for delivering OTPs via voice calls, enhancing your authentication system's security and accessibility.