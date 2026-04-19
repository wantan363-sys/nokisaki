const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!

export async function sendLineMessage(groupId: string, text: string) {
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      to: groupId,
      messages: [{ type: 'text', text }],
    }),
  })
}
