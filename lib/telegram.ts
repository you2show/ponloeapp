export const getTelegramUpdates = async (offset?: number, retries = 3) => {
  const offsetParam = offset ? `?offset=${offset}` : '';
  
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`/api/messages/sync${offsetParam}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      if (i === retries - 1) {
        console.error('Error fetching Telegram updates after retries:', error);
      } else {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
      }
    }
  }
  
  return { ok: false, result: [] };
};

export const sendTelegramMessage = async (chatId: number, text: string) => {
  try {
    const res = await fetch(`/api/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, text })
    });
    return await res.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return { ok: false };
  }
};
