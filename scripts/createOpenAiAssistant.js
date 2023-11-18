const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

// Add your OpenAI API key below
const OPENAI_API_KEY = 'sk-...<get_at_https://platform.openai.com/api-keys>....';

// Example file and assistant configs - please update as needed
const CONTEXTS_FILE_PATH = path.join(__dirname, 'ExampleShop-QnA.pdf');
const ASSISTANT_NAME = 'ai24support-assistant';
const ASSISTANT_MODEL = 'gpt-3.5-turbo-1106';
const ASSISTANT_INSTRUCTIONS = `You are an experienced and professional customer service agent of ExampleShop, tasked with kindly responding to customer inquiries. Give the answer in markdown format. Always answer in English. Keep your answers concise. You only know the information provided in the documents. Do not make up any info which is not present in the documents. If the documents don't provide enough details to answer user's question, ask the user to provide more details or rephrase the question.`;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

(async () => {
  // https://www.npmjs.com/package/openai#file-uploads
  const fileUploadRes = await openai.files.create({
    file: fs.createReadStream(CONTEXTS_FILE_PATH),
    purpose: 'assistants',
  });
  console.log('File was uploaded: ', fileUploadRes);

  const { id: fileId } = fileUploadRes;

  // https://platform.openai.com/docs/api-reference/assistants/createAssistant
  const assistantCreationRes = await openai.beta.assistants.create({
    name: ASSISTANT_NAME,
    model: ASSISTANT_MODEL,
    instructions: ASSISTANT_INSTRUCTIONS,
    tools: [{ type: 'retrieval' }],
    file_ids: [fileId],
  });
  console.log('Assistant created: ', assistantCreationRes);

  console.log('\n\nASSISTANT ID:');
  console.log(assistantCreationRes.id);
})();

/*
In the console expect to get the following:

File was uploaded:  {
  object: 'file',
  id: 'file-cJ6s3Sy4xSqlLiyrjgVbPJrf',
  purpose: 'assistants',
  filename: 'ExampleShop-QnA.pdf',
  bytes: 78324,
  created_at: 1700332578,
  status: 'processed',
  status_details: null
}
Assistant created:  {
  id: 'asst_vh5EBWjfrcj0imtwocWe8lIX',
  object: 'assistant',
  created_at: 1700332580,
  name: 'ai24support-assistant',
  description: null,
  model: 'gpt-3.5-turbo-1106',
  instructions: "You are an experienced and professional customer service agent of ExampleShop, tasked with kindly responding to customer inquiries. Give the answer in markdown format. Always answer in English. Keep your answers concise. You only know the information provided in the documents. Do not make up any info which is not present in the documents. If the documents don't provide enough details to answer user's question, ask the user to provide more details or rephrase the question.",
  tools: [ { type: 'retrieval' } ],
  file_ids: [ 'file-cJ6s3Sy4xSqlLiyrjgVbPJrf' ],
  metadata: {}
}


ASSISTANT ID:
asst_vh5EBWjfrcj0imtwocWe8lIX

You can also find the ID of your newly created assistant at https://platform.openai.com/assistants
*/