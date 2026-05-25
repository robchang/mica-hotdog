---
card-class:
  name: hotdog
  badge: HDG
  default_title: Hot Dog Detector
  handler: llm-direct
  sidecar: ~
  dependencies:
    umd_scripts: []
    styles: []
  subtasks:
    - {name: "photo upload via file input / camera", tier: 1, mechanism: "card.js + HTML file input (accept=image/*)", verify: "render_capture"}
    - {name: "send image to LLM for classification", tier: 2, mechanism: "llm-direct handler via mica.openChannel('turn', ...) with system prompt instructing hot dog classification + humorous explanation", verify: "end-to-end click"}
    - {name: "display result (image, verdict, explanation)", tier: 1, mechanism: "card.js + DOM update", verify: "render_capture"}
    - {name: "try another photo button", tier: 1, mechanism: "card.js + DOM reset", verify: "render_capture"}
  out_of_scope:
    - "image preprocessing or enhancement"
    - "history of past classifications"
---
# Hot Dog Detector

## Overview

A canvas card that lets the user upload or snap a photo, sends it to the local vision LLM (qwen3-vl-local) for classification, and returns a verdict — "Hot Dog" or "Not Hot Dog" — along with a humorous explanation. The result page shows the uploaded picture, the verdict, and the explanation, with a button to try another photo.

## Architecture

| Subtask | Tier | Mechanism | Verify |
| ------- | ---- | --------- | ------ |
| Photo upload (file input / camera) | 1 | card.js + HTML `<input type="file" accept="image/*" capture>` | render\_capture |
| LLM classification + humorous explanation | 2 | llm-direct handler via `mica.openChannel('turn', ...)` with system prompt | end-to-end click |
| Result display (image, verdict, explanation) | 1 | card.js + DOM update | render\_capture |
| Try another photo button | 1 | card.js + DOM reset | render\_capture |

## System Prompt (llm-direct)

The handler's system prompt instructs the LLM:

> You are a hot dog detector. Given an image, determine if it contains a hot dog (the food item: a sausage or frankfurter in a bun, typically with toppings). Respond with exactly two lines:
> 
> Line 1: "Hot Dog" or "Not Hot Dog"
> Line 2: A brief, funny, humorous explanation of your verdict (1-3 sentences). Be creative and entertaining.

The first line becomes the verdict title. The second line is the humorous explanation.

## UI Layout

**Upload state:**

* A prominent upload area (dashed border box) with text "🌭 Upload or snap a photo"
* A hidden `<input type="file" accept="image/*" capture>` triggered by clicking the upload area
* The upload area also accepts drag-and-drop of image files

**Result state (after classification):**

* The uploaded photo displayed at the top (preview)
* A verdict badge: green "🌭 Hot Dog" or red "❌ Not a Hot Dog"
* The humorous explanation in a styled text block
* A "Try Another Photo" button that resets to the upload state

## User Flow

1. User opens the card → sees upload area
2. User clicks upload area → file picker opens (or camera on mobile)
3. User selects an image → image preview appears + "Analyzing..." loading state
4. Image is sent via llm-direct channel → streaming response arrives
5. Result page shows: photo, verdict, explanation, "Try Another Photo" button
6. User clicks "Try Another Photo" → back to step 1

## Model Constraints

* Model: `qwen3-vl-local` (vision capable)
* Max images per turn: 4
* Supported formats: jpeg, png, webp
* Vision input must be a data: URL (not blob:)

## History Policy

Use `history: 'stateless'` at openChannel time since each classification is a one-shot exchange; no conversation memory needed.