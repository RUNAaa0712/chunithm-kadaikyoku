document.addEventListener('DOMContentLoaded', () => {
    const convertButton = document.getElementById('convert-button');
    const tsvInput = document.getElementById('tsv-input');
    const imageResult = document.getElementById('image-result');
  
    convertButton.addEventListener('click', () => {
        const text = tsvInput.value;
  
        if (!text.trim()) {
            alert('タブ区切りのTSV形式のテキストを入力してください。');
            return;
        }
  
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
  
        // Split text into rows and cells
        const rows = text.split('\n').map(row => row.split('\t'));
  
        // Calculate dynamic cell sizes
        const fontSize = 20; // 文字サイズを大きくする
        const padding = 10;
        const scale = window.devicePixelRatio || 1; // 高解像度スケール
        context.font = `${fontSize}px Arial`;
        const cellHeights = rows.map(() => fontSize + padding);
        const cellWidths = rows[0].map((_, colIndex) => {
            return Math.max(...rows.map(row => context.measureText(row[colIndex] || '').width)) + padding * 2;
        });
  
        // Calculate canvas dimensions
        const tableWidth = cellWidths.reduce((acc, width) => acc + width, 0);
        const tableHeight = cellHeights.reduce((acc, height) => acc + height, 0);
        canvas.width = (tableWidth + padding * 2) * scale;
        canvas.height = (tableHeight + padding * 2) * scale;
        canvas.style.width = `${tableWidth + padding * 2}px`;
        canvas.style.height = `${tableHeight + padding * 2}px`;
  
        // Apply scale for high resolution
        context.scale(scale, scale);
  
        // Set background color
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
  
        // Draw table cells and text
        context.font = `${fontSize}px Arial`;
        context.textBaseline = 'middle';
        context.imageSmoothingEnabled = true;
  
        let yPosition = padding;
        rows.forEach((row, rowIndex) => {
            let xPosition = padding;
  
            // Set alternating row background color
            context.fillStyle = rowIndex % 2 === 0 ? '#f0f0f0' : '#ffffff';
            context.fillRect(xPosition, yPosition, tableWidth, cellHeights[rowIndex]);
  
            row.forEach((cell, colIndex) => {
                const cellWidth = cellWidths[colIndex];
                const cellHeight = cellHeights[rowIndex];
  
                // Draw cell border
                context.strokeStyle = '#dddddd';
                context.strokeRect(xPosition, yPosition, cellWidth, cellHeight);
  
                // Draw text in the cell
                context.fillStyle = '#000000';
                context.fillText(cell, xPosition + padding, yPosition + cellHeight / 2);
                xPosition += cellWidth;
            });
            yPosition += cellHeights[rowIndex];
        });
  
        // Convert canvas to image and display it
        const img = new Image();
        img.src = canvas.toDataURL('image/png'); // PNG形式で高品質出力
        imageResult.innerHTML = ''; // Clear previous result
        imageResult.appendChild(img);
    });
  });
  