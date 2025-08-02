import { jsPDF } from 'jspdf';

class ImageSplitter {
  constructor() {
    this.initializeElements();
    this.initializeEventListeners();
    this.currentImage = null;
    this.canvas = null;
    this.ctx = null;
  }

  initializeElements() {
    this.uploadArea = document.getElementById('uploadArea');
    this.fileInput = document.getElementById('fileInput');
    this.rowsInput = document.getElementById('rowsInput');
    this.colsInput = document.getElementById('colsInput');
    this.generateBtn = document.getElementById('generateBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.previewContainer = document.getElementById('previewContainer');
    this.messageArea = document.getElementById('messageArea');
  }

  initializeEventListeners() {
    this.uploadArea.addEventListener('click', () => this.fileInput.click());
    this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.uploadArea.addEventListener('dragleave', (e) =>
      this.handleDragLeave(e)
    );
    this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.rowsInput.addEventListener('input', () => this.updatePreview());
    this.colsInput.addEventListener('input', () => this.updatePreview());
    this.generateBtn.addEventListener('click', () => this.generatePDF());
    this.resetBtn.addEventListener('click', () => this.reset());
  }

  handleDragOver(e) {
    e.preventDefault();
    this.uploadArea.classList.add('dragover');
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.uploadArea.classList.remove('dragover');
  }

  handleDrop(e) {
    e.preventDefault();
    this.uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file) {
    if (!this.validateFile(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      this.showMessage(
        'Please upload an image file (JPEG, PNG, WebP, or GIF)',
        'error'
      );
      return false;
    }

    if (file.size > maxSize) {
      this.showMessage(
        'Image too large. Please use an image under 10MB',
        'error'
      );
      return false;
    }

    return true;
  }

  loadImage(src) {
    const img = new Image();
    img.onload = () => {
      this.currentImage = img;
      this.createCanvas();
      this.updatePreview();
      this.generateBtn.disabled = false;
      this.showMessage('Image loaded successfully', 'success');
    };
    img.onerror = () => {
      this.showMessage('Failed to load image', 'error');
    };
    img.src = src;
  }

  createCanvas() {
    if (this.canvas) {
      this.canvas.remove();
    }

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'preview-canvas';
    this.ctx = this.canvas.getContext('2d');

    const maxDisplaySize = 800;
    const scale = Math.min(
      maxDisplaySize / this.currentImage.width,
      maxDisplaySize / this.currentImage.height,
      1
    );

    this.canvas.width = this.currentImage.width * scale;
    this.canvas.height = this.currentImage.height * scale;

    this.previewContainer.innerHTML = '';
    this.previewContainer.appendChild(this.canvas);
  }

  updatePreview() {
    if (!this.currentImage || !this.canvas) {
      return;
    }

    const rows = parseInt(this.rowsInput.value);
    const cols = parseInt(this.colsInput.value);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.currentImage,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    this.drawGrid(rows, cols);
  }

  drawGrid(rows, cols) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.strokeStyle = '#667eea';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    for (let i = 1; i < cols; i++) {
      const x = (width / cols) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    for (let i = 1; i < rows; i++) {
      const y = (height / rows) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]);
  }

  generatePDF() {
    if (!this.currentImage) {
      this.showMessage('Please upload an image first', 'error');
      return;
    }

    this.showLoadingState(true);

    setTimeout(() => {
      try {
        const rows = parseInt(this.rowsInput.value);
        const cols = parseInt(this.colsInput.value);

        const pdf = new jsPDF();
        const imgWidth = this.currentImage.width;
        const imgHeight = this.currentImage.height;
        const pieceWidth = imgWidth / cols;
        const pieceHeight = imgHeight / rows;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = pieceWidth;
        tempCanvas.height = pieceHeight;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (row !== 0 || col !== 0) {
              pdf.addPage();
            }

            tempCtx.clearRect(0, 0, pieceWidth, pieceHeight);
            tempCtx.drawImage(
              this.currentImage,
              col * pieceWidth,
              row * pieceHeight,
              pieceWidth,
              pieceHeight,
              0,
              0,
              pieceWidth,
              pieceHeight
            );

            const imgData = tempCanvas.toDataURL('image/jpeg', 0.92);
            const pdfWidth = 210 - 20;
            const pdfHeight = 297 - 20;
            const aspectRatio = pieceWidth / pieceHeight;

            let finalWidth, finalHeight;
            if (aspectRatio > pdfWidth / pdfHeight) {
              finalWidth = pdfWidth;
              finalHeight = pdfWidth / aspectRatio;
            } else {
              finalHeight = pdfHeight;
              finalWidth = pdfHeight * aspectRatio;
            }

            const x = (210 - finalWidth) / 2;
            const y = (297 - finalHeight) / 2;

            pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
          }
        }

        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:-]/g, '');
        pdf.save(`image-split-${timestamp}.pdf`);

        this.showMessage('PDF generated successfully!', 'success');
      } catch (error) {
        this.showMessage('Failed to generate PDF. Please try again.', 'error');
        console.error('PDF generation error:', error);
      } finally {
        this.showLoadingState(false);
      }
    }, 100);
  }

  showLoadingState(loading) {
    if (loading) {
      this.generateBtn.innerHTML =
        '<div class="loading"><div class="spinner"></div>Generating PDF...</div>';
      this.generateBtn.disabled = true;
    } else {
      this.generateBtn.innerHTML = '📄 Generate PDF';
      this.generateBtn.disabled = !this.currentImage;
    }
  }

  reset() {
    this.currentImage = null;
    this.canvas = null;
    this.ctx = null;
    this.fileInput.value = '';
    this.rowsInput.value = '3';
    this.colsInput.value = '3';
    this.generateBtn.disabled = true;

    this.previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <div class="preview-placeholder-icon">🖼️</div>
                    <div>Upload an image to see the grid preview</div>
                </div>
            `;

    this.clearMessages();
    this.showMessage('Reset complete', 'info');
  }

  showMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = text;

    this.messageArea.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }

  clearMessages() {
    this.messageArea.innerHTML = '';
  }
}

export default ImageSplitter;
