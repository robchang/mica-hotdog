# Hot Dog Detector

A canvas card that lets you upload or snap a photo and tells you whether it's a **Hot Dog** or **Not Hot Dog** — along with a humorous explanation from the local vision LLM.

## Usage

1. Open the **Hot Dog Detector** card on the canvas.
2. Click the upload area (or drag-and-drop an image).
3. Wait for the LLM to analyze your photo.
4. See the verdict, explanation, and a button to try another photo.

## Model

- **Vision model:** `qwen3-vl-local` (local, no API key needed)
- **Mode:** Stateless classification (each photo is a one-shot query)
- **Supported formats:** jpeg, png, webp

## Canvas

| Card | Description |
| ---- | ----------- |
| `hotdog.hotdog` | Hot Dog Detector — upload a photo, get a verdict |
