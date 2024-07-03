javascript:(function() {
  function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function downloadFile(filename, content) {
    const link = document.createElement('a');
    link.href = content;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function stripURL(url) {
    return url.replace(/^https?:\/\//, '').split(/[?#]/)[0];
  }

  async function captureSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const div = document.createElement('div');
      div.appendChild(range.cloneContents());
      return div.innerHTML;
    }
    return null;
  }

  async function renderHtmlToCanvas(html, canvas) {
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = canvas.width + 'px';
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);

    const tempCanvas = await html2canvas(tempDiv, {
      useCORS: true,
      scale: 1,
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight,
      backgroundColor: null,
    });

    document.body.removeChild(tempDiv);
    return tempCanvas;
  }

  function init() {
    const modalHTML = `
      <div id="note-modal" style="position: fixed; top: 10%; left: 10%; width: 350px; height: 400px; background: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); z-index: 9999; resize: both; overflow: hidden; font-family: Arial, sans-serif;">
        <div id="note-header" style="cursor: move; background: #007bff; color: white; padding: 5px; border-top-left-radius: 8px; border-top-right-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <button id="cancel-note" style="background: #dc3545; border: none; color: white; padding: 2px 6px; border-radius: 4px; cursor: pointer;">X</button>
          <div style="flex: 1; display: flex; justify-content: center; align-items: center;">
            <input id="note-title" value="Note" style="background: transparent; border: none; color: white; font-size: 14px; text-align: center; outline: none; width: 80px;">
          </div>
          <button id="save-note" style="background: #28a745; border: none; color: white; padding: 2px 6px; border-radius: 4px; cursor: pointer;">Save</button>
        </div>
        <div style="padding: 5px; display: flex; flex-direction: column; height: calc(100% - 30px);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <input type="color" id="color-picker" value="#000000" style="margin-right: 5px; flex: 1;">
            <input type="range" id="brush-size" min="1" max="10" value="2" style="flex: 2;">
          </div>
          <button id="capture-selection" style="margin-bottom: 5px; padding: 2px 6px; border-radius: 4px; background: #17a2b8; color: white; border: none; cursor: pointer;">Capture Selection</button>
          <canvas id="note-canvas" style="width: 100%; height: 100%; border: 1px solid #ddd; border-radius: 4px;"></canvas>
        </div>
      </div>
    `;

    const modalStyle = `
      #note-modal { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
    `;

    if (!document.getElementById('note-modal')) {
      const style = document.createElement('style');
      style.innerHTML = modalStyle;
      document.head.appendChild(style);

      const div = document.createElement('div');
      div.innerHTML = modalHTML;
      document.body.appendChild(div);

      const modal = document.getElementById('note-modal');
      const header = document.getElementById('note-header');
      const saveBtn = document.getElementById('save-note');
      const cancelBtn = document.getElementById('cancel-note');
      const captureBtn = document.getElementById('capture-selection');
      const noteTitle = document.getElementById('note-title');
      const colorPicker = document.getElementById('color-picker');
      const brushSize = document.getElementById('brush-size');
      const canvas = document.getElementById('note-canvas');
      const ctx = canvas.getContext('2d');

      let savedData = null;

      function resizeCanvas() {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        ctx.putImageData(imgData, 0, 0);
      }

      resizeCanvas();

      let isDrawing = false;
      let lastX = 0;
      let lastY = 0;

      function setPosition(e) {
        const rect = canvas.getBoundingClientRect();
        lastX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        lastY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      }

      function draw(e) {
        if (!isDrawing) return;
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSize.value;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        const newX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const newY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.lineTo(newX, newY);
        ctx.stroke();
        [lastX, lastY] = [newX, newY];
      }

      canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        setPosition(e);
      });

      canvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        setPosition(e);
        e.preventDefault();
      });

      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('touchmove', (e) => {
        draw(e);
        e.preventDefault();
      });

      canvas.addEventListener('mouseup', () => isDrawing = false);
      canvas.addEventListener('touchend', () => isDrawing = false);
      canvas.addEventListener('mouseout', () => isDrawing = false);

      let offsetX = 0;
      let offsetY = 0;
      let isDragging = false;

      header.addEventListener('mousedown', (e) => {
        if (e.target !== noteTitle) {
          isDragging = true;
          offsetX = e.clientX - modal.offsetLeft;
          offsetY = e.clientY - modal.offsetTop;
        }
      });

      header.addEventListener('touchstart', (e) => {
        if (e.target !== noteTitle) {
          isDragging = true;
          offsetX = e.touches[0].clientX - modal.offsetLeft;
          offsetY = e.touches[0].clientY - modal.offsetTop;
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          modal.style.left = `${e.clientX - offsetX}px`;
          modal.style.top = `${e.clientY - offsetY}px`;
        }
      });

      document.addEventListener('touchmove', (e) => {
        if (isDragging) {
          modal.style.left = `${e.touches[0].clientX - offsetX}px`;
          modal.style.top = `${e.touches[0].clientY - offsetY}px`;
        }
      });

      document.addEventListener('mouseup', () => isDragging = false);
      document.addEventListener('touchend', () => isDragging = false);

      saveBtn.addEventListener('click', () => {
        const imgData = canvas.toDataURL('image/png');
        const url = stripURL(window.location.href);
        const filename = `${noteTitle.value.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${url}.png`;
        downloadFile(filename, imgData);
        
        modal.remove();
      });

      cancelBtn.addEventListener('click', () => {
        modal.remove();
      });

      captureBtn.addEventListener('click', async () => {
        const selectionHTML = await captureSelection();
        if (selectionHTML) {
          const tempCanvas = await renderHtmlToCanvas(selectionHTML, canvas);
          const combinedHeight = canvas.height + tempCanvas.height;
          if (combinedHeight > window.innerHeight) {
            canvas.height = window.innerHeight;
            modal.style.height = `${window.innerHeight}px`;
          } else {
            canvas.height = combinedHeight;
            modal.style.height = `${combinedHeight + 60}px`;
          }
          ctx.drawImage(tempCanvas, 0, canvas.height - tempCanvas.height);
        }
      });

      new ResizeObserver(resizeCanvas).observe(modal);
    }
  }

  if (typeof html2canvas === 'undefined') {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', init);
  } else {
    init();
  }
})();
