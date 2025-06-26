import RNHTMLtoPDF from 'react-native-html-to-pdf';

async function convertImagesToPDF(imagePaths: string[]): Promise<string> {
  if (imagePaths.length === 0) {
    throw new Error("No images to convert.");
  }

  // Generate an HTML string with all images, each in its own page
  const html = imagePaths
    .map(
      (uri) => `
        <div style="page-break-after: always;">
          <img src="${uri}" style="width:100%; height:auto;" />
        </div>
      `
    )
    .join('');

  const result = await RNHTMLtoPDF.convert({
    html,
    fileName: `scanned_doc_${Date.now()}`,
    directory: 'Documents',
  });

  return result.filePath ?? '';
}

export default convertImagesToPDF;
