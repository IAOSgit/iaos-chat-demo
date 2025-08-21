# IAOS Chat Demo with Azure OpenAI Integration

A modern React chat interface that connects to Azure OpenAI services.

## Features

- Clean, modern chat interface with floating chat bubble
- Real-time connection to Azure OpenAI
- Fallback to demo mode when Azure is not configured
- Responsive design with Tailwind CSS
- Connection status indicator

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Azure OpenAI
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Azure OpenAI credentials in `.env`:
   ```
   VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   VITE_AZURE_OPENAI_API_KEY=your-api-key-here
   VITE_AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
   VITE_AZURE_OPENAI_API_VERSION=2024-05-01-preview
   ```

### 3. Getting Azure OpenAI Credentials

To get your Azure OpenAI credentials:

1. **Azure Portal**: Go to [portal.azure.com](https://portal.azure.com)
2. **Find your OpenAI resource**: Navigate to your Azure OpenAI service
3. **Get the endpoint**: Found in the "Keys and Endpoint" section
4. **Get the API key**: Also in "Keys and Endpoint" section
5. **Get deployment name**: Found in "Model deployments" section

### 4. Run the Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Usage

- Click the chat bubble in the bottom-right corner to open the chat
- The status light shows if Azure OpenAI is connected (green) or in demo mode (gray)
- If Azure OpenAI is properly configured, your messages will be sent to the real AI
- If not configured, it will run in demo mode with echo responses

## Project Structure

```
src/
├── App.jsx           # Main chat component
├── azureOpenAI.js    # Azure OpenAI service
├── main.jsx          # React entry point
└── index.css         # Tailwind styles
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint URL | Yes |
| `VITE_AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key | Yes |
| `VITE_AZURE_OPENAI_DEPLOYMENT_NAME` | Your model deployment name | Yes |
| `VITE_AZURE_OPENAI_API_VERSION` | API version (default: 2024-05-01-preview) | No |

## Troubleshooting

- **Connection fails**: Check your endpoint URL and API key
- **No response**: Verify your deployment name is correct
- **CORS errors**: Ensure your Azure OpenAI resource allows requests from your domain

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

A minimal React + Vite + Tailwind project with a floating chat bubble UI.

## Run locally
1. Open a terminal in this folder.
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open the URL printed in the terminal (usually http://localhost:5173).

> This build runs in **offline demo** mode unless you wire it to your Azure endpoint inside `src/App.jsx`.
