// ── Hot Dog Detector — card.js ──────────────────────────────
const uploadArea = container.querySelector('#upload-area');
const fileInput  = container.querySelector('#file-input');
const previewArea = container.querySelector('#preview-area');
const previewImg = container.querySelector('#preview-img');
const loadingState = container.querySelector('#loading-state');
const resultArea = container.querySelector('#result-area');
const resultImg = container.querySelector('#result-img');
const verdictEl  = container.querySelector('#verdict');
const explanationEl = container.querySelector('#explanation');
const tryAgainBtn = container.querySelector('#try-again-btn');

let classifyChannel = null;
let currentFileDataUrl = null;

// ── State helpers ───────────────────────────────────────────

function showUpload() {
  uploadArea.style.display = 'flex';
  previewArea.style.display = 'none';
  resultArea.style.display = 'none';
  fileInput.value = '';
  currentFileDataUrl = null;
}

function showPreview() {
  uploadArea.style.display = 'none';
  previewArea.style.display = 'flex';
  resultArea.style.display = 'none';
}

function showResult() {
  uploadArea.style.display = 'none';
  previewArea.style.display = 'none';
  resultArea.style.display = 'flex';
}

function showLoading() {
  loadingState.style.display = 'flex';
}

function hideLoading() {
  loadingState.style.display = 'none';
}

// ── File handling ───────────────────────────────────────────

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = () => {
    currentFileDataUrl = reader.result;
    previewImg.src = currentFileDataUrl;
    resultImg.src = currentFileDataUrl;
    showPreview();
    showLoading();
    classifyImage(currentFileDataUrl);
  };
  reader.readAsDataURL(file);
}

// ── LLM classification ─────────────────────────────────────

function classifyImage(dataUrl) {
  if (!classifyChannel) {
    classifyChannel = mica.openChannel('turn', {
      systemPrompt: 'You are a hot dog detector. Given an image, determine if it contains a hot dog (the food item: a sausage or frankfurter in a bun, typically with toppings). Respond with exactly two lines:\n\nLine 1: "Hot Dog" or "Not Hot Dog"\nLine 2: A brief, funny, humorous explanation of your verdict (1-3 sentences). Be creative and entertaining.',
      model: 'qwen3-vl-local',
      history: 'stateless',
    });
  }

  classifyChannel.onData((evt) => {
    if (evt.type === 'done') {
      hideLoading();
      parseAndShowResult(evt.content);
    }
    if (evt.type === 'error') {
      hideLoading();
      verdictEl.textContent = 'Error';
      verdictEl.className = 'verdict not-hot-dog';
      explanationEl.textContent = 'Could not analyze the image. Please try again.';
      showResult();
    }
  });

  classifyChannel.send({
    message: 'Is this a hot dog?',
    content: [
      { type: 'image_url', image_url: { url: dataUrl } },
    ],
  });
}

function parseAndShowResult(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);

  let verdict = 'Unknown';
  let explanation = '';

  if (lines.length >= 1) {
    verdict = lines[0];
  }
  if (lines.length >= 2) {
    explanation = lines.slice(1).join(' ');
  } else {
    explanation = text.trim();
  }

  const isHotDog = /hot\s*dog/i.test(verdict);

  verdictEl.textContent = verdict;
  verdictEl.className = 'verdict ' + (isHotDog ? 'hot-dog' : 'not-hot-dog');
  explanationEl.textContent = explanation;
  showResult();
}

// ── Event listeners ─────────────────────────────────────────

// File input change
fileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) handleFile(file);
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// Try another photo
tryAgainBtn.addEventListener('click', () => {
  showUpload();
});

// ── First render ────────────────────────────────────────────

showUpload();
