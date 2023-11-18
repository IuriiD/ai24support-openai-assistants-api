# ai24support-openai-assistants-api
This is a proof-of-concept (POC) of a customer support automation service built using [OpenAI Assistants API](https://platform.openai.com/docs/api-reference/assistants).


## Setup Local Development Steps

- [Install Dependencies](#install-dependencies)
- [Configuration](#configuration)
- [Run the App](#run-app)
- [Call the Completion API](#call-completion-api)

### Install Dependencies
```bash
npm ci
```

### Configuration
1. Create an OpenAI assistant by running the following script (assuming that your are in the root of the project). Please add your OPENAI_API_KEY (get it at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys))
```bash
node scripts/createOpenAiAssistant.js
```
After this expect to see a new assistant in your [OpenAI Assistants dashboard](https://platform.openai.com/assistants).
In consode or in the dashboard copy the assistant ID (e.g. `asst_vh5EBWjfrcj0imtwocWe8lIY`).


2. Copy the contents of `.env.example` file to `.env` file and update the variables:
- `CUSTOMER_CONFIGS` is an array of objects like `{ "x-customer-id": "test-customer", "x-api-key": "secret", "OPENAI_API_KEY": "secret", "OPENAI_ORG": "secret", "OPENAI_ASSISTANT_ID": "secret" }`:
  - `x-customer-id` is a random UUID which you need to generate once and which will serve as the ID of your customer. This value must be sent as the header key `x-customer-id` in the requests to `[POST] /api/v1/assistant/complete` endpoint
  - `x-api-key` - some password to protect the endpoint for this customer (header `x-api-key`)
  - `OPENAI_API_KEY` and `OPENAI_ORG` - please find those at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - `OPENAI_ASSISTANT_ID` - the ID of your OpenAI assistant (see step 1 above)
- `POSTGRESQL_CONNECTION_STRING` - a string to connect to your Postgresql DB, e.g. `postgres://postgres.bwghlfwqsbwaxnafsysc:YourPassword@aws-0-us-west-1.pooler.supabase.com:6543/postgres` (example from [https://supabase.com/](https://supabase.com/)).

Note that several customers can be added to `CUSTOMER_CONFIGS`, each with their own OpenAI credentials and assistant.

### Run the App
```bash
npm run start:local
```

### Call the Completion API
```bash
curl --location 'localhost:3000/api/v1/assistant/complete' \
--header 'x-api-key: secret' \
--header 'x-customer-id: 74a2aeb0-6963-4eb2-b458-e62877fcc152' \
--header 'Content-Type: application/json' \
--data '{
    "userId": "44e2ef2c-89a3-4428-9373-2d18d2e2113f",
    "query": "Is it possible to return something I bought on clearance in the store?""
}'
```
Notes:
- `x-customer-id` and `x-api-key` must coincide with the values stored in .env
- `userId` must be a UUID. Each user gets their own thread with the bot, in which all the messages are processed (so consider the possible effect of the previous conversation turns on the current question). Pass a new `userId` to start conversation from scratch.

Please also see [https://github.com/IuriiD/ai24support-openai-pinecone-rag](https://github.com/IuriiD/ai24support-openai-pinecone-rag) for comparison how the same task can be solved using "custom" retrieval augmented generation (RAG) setup (OpenAI [Embeddings](https://platform.openai.com/docs/api-reference/embeddings) and [Chat Completion](https://platform.openai.com/docs/api-reference/chat) API + [Pinecone](https://www.pinecone.io/) vector DB).