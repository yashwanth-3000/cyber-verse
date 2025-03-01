export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  try {
    // Extract the latest user message
    const userInput = messages[messages.length - 1]?.content || '';
    
    console.log('Sending to webhook:', userInput);
    
    // Call the webhook endpoint
    const webhookResponse = await fetch(
      'https://api-lr.agent.ai/v1/agent/k5liv1l80kqmz028/webhook/e6cee581',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput }),
      }
    );
    
    if (!webhookResponse.ok) {
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
    }
    
    // Parse the JSON response
    const responseData = await webhookResponse.json();
    
    // Extract only the response field
    const assistantResponse = responseData.response || '';
    
    console.log('Response from webhook:', assistantResponse);
    
    // Return just the text response - our custom UI will handle the formatting
    return new Response(assistantResponse);
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      'Sorry, there was an error processing your request.',
      { status: 500 }
    );
  }
}
