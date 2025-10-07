import { HfInference } from '@huggingface/inference'

// ⛔️ Sadece yerelde kullan: token’ını koda yaz
const hf = new HfInference()

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients...
Format your response in markdown.
`

export async function getRecipeFromMistral(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(', ')
  const res = await hf.chatCompletion({
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
    ],
    max_tokens: 768,
  })
  return res.choices[0].message.content
}
