/**
 * Import Plan Modal.
 * Accepts a `terraform show -json` plan for any supported cloud
 * (AWS, Google Cloud, Azure — including multi-provider plans) via
 * drag-and-drop, file picker or paste.
 */

export class ImportModal {
  constructor(containerElement, onImportSubmit) {
    this.container = containerElement;
    this.onImportSubmit = onImportSubmit;
    this.isOpen = false;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div id="import-modal-backdrop" class="modal-backdrop">
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
          <div class="modal-header">
            <h3 id="import-modal-title" style="font-size:16px; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9a6ad4" stroke-width="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Import Terraform Plan
            </h3>
            <button id="btn-modal-close" class="control-btn" aria-label="Close">✕</button>
          </div>

          <div class="modal-body">
            <div style="background:rgba(123,66,188,0.10); border:1px solid rgba(123,66,188,0.30); border-radius:8px; padding:12px 16px; font-size:12px; color:#cbd5e1;">
              <strong>Generate plan JSON (works for AWS, Google Cloud and Azure):</strong>
              <div style="margin-top:6px; font-family:var(--font-mono); color:#c4b5fd; background:rgba(0,0,0,0.3); padding:6px 10px; border-radius:4px;">
                terraform plan -out=tfplan && terraform show -json tfplan > plan.json
              </div>
            </div>

            <!-- Drag & Drop Zone -->
            <div id="import-dropzone" class="dropzone" role="button" tabindex="0" aria-label="Choose a plan.json file">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9a6ad4" stroke-width="2" aria-hidden="true">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                <path d="M12 12v9"></path>
                <path d="m16 16-4-4-4 4"></path>
              </svg>
              <div style="font-weight:600; font-size:13px; color:#fff;">Drag & drop your plan.json here</div>
              <div style="font-size:11px; color:var(--text-muted);">or click to browse files</div>
              <input type="file" id="file-input" accept=".json,.tfstate" style="display:none;" />
            </div>

            <!-- Paste Area -->
            <div>
              <div style="font-size:12px; font-weight:600; margin-bottom:6px; color:var(--text-secondary);">Or paste raw Terraform Plan JSON:</div>
              <textarea id="import-textarea" class="code-textarea" aria-label="Terraform plan JSON" aria-describedby="import-error-msg" placeholder='{"format_version": "1.2", "resource_changes": [ ... ]}'></textarea>
            </div>

            <div id="import-error-msg" role="alert" style="color:#ef4444; font-size:12px; display:none;"></div>
          </div>

          <div class="modal-footer">
            <button id="btn-cancel-import" class="btn btn-secondary">Cancel</button>
            <button id="btn-submit-import" class="btn btn-primary">Visualize Architecture</button>
          </div>
        </div>
      </div>
    `;

    this.backdrop = document.getElementById('import-modal-backdrop');
    this.dropzone = document.getElementById('import-dropzone');
    this.fileInput = document.getElementById('file-input');
    this.textarea = document.getElementById('import-textarea');
    this.errorMsg = document.getElementById('import-error-msg');

    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-modal-close').addEventListener('click', () => this.close());
    document.getElementById('btn-cancel-import').addEventListener('click', () => this.close());

    this.dropzone.addEventListener('click', () => this.fileInput.click());
    this.dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.fileInput.click();
      }
    });

    // Escape closes, like every native dialog; only while open so the canvas
    // keeps its own Esc-to-deselect shortcut the rest of the time.
    this.onKeyDown = (e) => {
      if (this.isOpen && e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this.onKeyDown);
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('dragover');
    });

    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('dragover');
    });

    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.readFile(e.dataTransfer.files[0]);
      }
    });

    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.readFile(e.target.files[0]);
      }
    });

    document.getElementById('btn-submit-import').addEventListener('click', () => {
      const text = this.textarea.value.trim();
      if (!text) {
        this.showError('Please paste Terraform plan JSON or select a file.');
        return;
      }
      let json;
      try {
        json = JSON.parse(text);
      } catch (err) {
        this.showError(`Invalid JSON: ${err.message}`);
        return;
      }
      // Valid JSON that is not a plan (or fails to parse as one) stays in the
      // dialog with the reason shown inline instead of an alert() after close.
      try {
        if (this.onImportSubmit(json) === false) return;
      } catch (err) {
        this.showError(err.message || String(err));
        return;
      }
      this.close();
    });
  }

  readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.textarea.value = e.target.result;
      this.errorMsg.style.display = 'none';
    };
    reader.readAsText(file);
  }

  open() {
    this.isOpen = true;
    this.previouslyFocused = document.activeElement;
    this.backdrop.classList.add('open');
    this.textarea.value = '';
    this.errorMsg.style.display = 'none';
    this.textarea.focus();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.backdrop.classList.remove('open');
    if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
      this.previouslyFocused.focus();
    }
  }

  showError(msg) {
    this.errorMsg.textContent = msg;
    this.errorMsg.style.display = 'block';
  }
}
