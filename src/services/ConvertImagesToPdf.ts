import RNHTMLtoPDF from 'react-native-html-to-pdf';

async function convertImagesToPDF(imagePaths: string[]): Promise<string> {
  if (!imagePaths?.length) {
    throw new Error("No images provided for conversion.");
  }

  // 1. Prepare HTML with proper image handling
  const html = `
    <html>
      <head>
        <style>
          .page {
            page-break-after: always;
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .page:last-child {
            page-break-after: auto;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        ${imagePaths.map(uri => `
          <div class="page">
            <img src="${uri}" onerror="this.style.display='none'" />
          </div>
        `).join('')}
      </body>
    </html>
  `;

  // 2. Generate PDF with proper options
  try {
    const options = {
      html,
      fileName: `document_${Date.now()}`,
      directory: 'Documents',
      base64: false,
      padding: 10, // Add small padding
      bgColor: '#FFFFFF' // Ensure white background
    };

    const { filePath } = await RNHTMLtoPDF.convert(options);
    
    if (!filePath) {
      throw new Error("PDF generation failed - no file path returned");
    }

    return filePath;
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

export default convertImagesToPDF;