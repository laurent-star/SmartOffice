# Inventaire des nodes

## Tools

### Google Drive (`workflows/tools/google-drive.workflow.json`)
- Nombre total de nodes : 9
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, file.download, file.get, file.upload, fileFolder.search, folder.create, sampleFetch

### OpenAI (`workflows/tools/openai.workflow.json`)
- Nombre total de nodes : 7
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, assistant.classify, assistant.extract, assistant.summarize, sampleFetch

### Slack (`workflows/tools/slack.workflow.json`)
- Nombre total de nodes : 12
- Liste : Manual Trigger, Normalize Input, Dispatch Operation, conversation.getMany, file.get, file.getMany, file.upload, message.delete, message.getPermalink, message.search, message.send, sampleFetch

## Agents

### Supervisor (`workflows/agent/supervisor.workflow.json`)
- Nombre total de nodes : 2
- Liste : Agent Trigger, Build Execution Envelope

### Planificator (`workflows/agent/planner.workflow.json`)
- Nombre total de nodes : 2
- Liste : Agent Trigger, Build Execution Envelope
