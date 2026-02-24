# Ollama Setup Guide

Auto Inspector now supports local LLM execution with Ollama! This gives you:
- ✅ **Privacy**: All data stays on your machine
- ✅ **Cost**: No API costs
- ✅ **Speed**: No network latency (if you have good hardware)
- ✅ **Offline**: Works without internet

## Prerequisites

1. **Hardware Requirements**:
   - **Recommended**: 16GB+ RAM, GPU with 8GB+ VRAM
   - **Minimum**: 8GB RAM (slow, CPU-only)
   - Vision models need more resources than text-only models

2. **Install Ollama**:
   ```bash
   # Download from: https://ollama.ai
   # Or use package manager:
   
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download installer from https://ollama.ai/download
   ```

## Setup Steps

### 1. Start Ollama Server
```bash
ollama serve
```
This starts Ollama on `http://localhost:11434`

### 2. Pull a Vision Model
The app requires a vision-capable model to see screenshots:

```bash
# Recommended (11GB): Good balance of quality and speed
ollama pull llama3.2-vision:11b

# Alternative options:
ollama pull llama3.2-vision:90b  # Best quality (90GB, very slow)
ollama pull llava:13b            # Alternative (13GB)
ollama pull bakllava             # Smaller (4.5GB, lower quality)
```

### 3. Configure Your `.env` File
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
LLM_PROVIDER=ollama
OLLAMAHOST=http://localhost:11434
OLLAMA_MODEL=llama3.2-vision:11b
```

### 4. Run Tests
```bash
npm run example:file
```

## Performance Tips

### Speed Optimization
- Use GPU acceleration (automatically detected by Ollama)
- Use smaller models for faster inference:
  - `llama3.2-vision:11b` - Good balance
  - `llava:7b` - Faster but less accurate

### Quality Optimization
- Use larger models for better results:
  - `llama3.2-vision:90b` - Best quality (requires 90GB+ RAM/VRAM)
  - Increase `num_ctx` for longer context (default 2048)

### Custom Model Configuration
Create a `Modelfile` for custom settings:
```bash
FROM llama3.2-vision:11b

PARAMETER temperature 0
PARAMETER num_ctx 4096
PARAMETER num_predict 512
```

Then:
```bash
ollama create my-custom-model -f Modelfile
```

Update `.env`:
```env
OLLAMA_MODEL=my-custom-model
```

## Troubleshooting

### Ollama Not Found
```bash
# Check if Ollama is running
curl http://localhost:11434

# Should return: Ollama is running
```

### Model Not Downloaded
```bash
# List installed models
ollama list

# Pull the model if missing
ollama pull llama3.2-vision:11b
```

### Out of Memory
- Close other applications
- Use a smaller model
- Enable swap/page file (slower)

### Slow Performance
- Ensure GPU is being used: Check Ollama logs
- Use smaller model: `llava:7b`
- Reduce context window in Modelfile

## Remote Ollama Server

To use Ollama on another machine:

```env
OLLAMAHOST=http://192.168.1.100:11434
```

Make sure Ollama is configured to accept remote connections:
```bash
# On the Ollama server machine
export OLLAMA_HOST=0.0.0.0:11434
ollama serve
```

## Comparing Providers

| Provider | Cost | Speed | Quality | Privacy |
|----------|------|-------|---------|---------|
| **OpenAI GPT-4o** | $$$ | Fast | Excellent | Cloud |
| **Google Gemini 2.5** | $$ | Very Fast | Excellent | Cloud |
| **Ollama Local** | Free | Varies* | Good-Great | 100% Local |

*Speed depends on your hardware and model size

## Recommended Models by Use Case

| Use Case | Model | Size | Notes |
|----------|-------|------|-------|
| **Quick Testing** | `llava:7b` | 4.5GB | Fast, decent quality |
| **Production** | `llama3.2-vision:11b` | 11GB | Best balance |
| **High Accuracy** | `llama3.2-vision:90b` | 90GB | Slow, requires powerful GPU |

## Support

For Ollama-specific issues:
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Ollama Discord](https://discord.gg/ollama)

For Auto Inspector + Ollama integration issues:
- Check logs for error messages
- Verify model supports vision (check with `ollama show <model>`)
- Try a different model
