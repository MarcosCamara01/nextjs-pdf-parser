import { NextRequest, NextResponse } from 'next/server'; // To handle the request and response
import { promises as fs } from 'fs'; // To save the file temporarily
import { v4 as uuidv4 } from 'uuid'; // To generate a unique filename
import PDFParser from 'pdf2json'; // To parse the pdf

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll('filepond');
    let fileName = '';
    let parsedText = '';

    if (uploadedFiles && uploadedFiles.length > 0) {
      const uploadedFile = uploadedFiles[1];

      if (uploadedFile instanceof File) {
        fileName = uuidv4();
        const tempFilePath = `C:\\Users\\Marcos\\AppData\\Local\\Temp\\${fileName}.pdf`;
        const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

        await fs.writeFile(tempFilePath, fileBuffer);

        const pdfParser = new (PDFParser as any)(null, 1);

        pdfParser.on('pdfParser_dataError', (errData: any) =>
          console.error('Error al procesar el archivo PDF:', errData.parserError)
        );

        pdfParser.on('pdfParser_dataReady', () => {
          console.log((pdfParser as any).getRawTextContent());
          parsedText = (pdfParser as any).getRawTextContent();
          // Eliminar el archivo temporal después de procesarlo
          fs.unlink(tempFilePath);
        });

        pdfParser.loadPDF(tempFilePath);
      } else {
        console.error('El archivo subido no es un archivo válido.');
      }
    } else {
      console.error('No se encontraron archivos.');
    }

    const response = new NextResponse(parsedText);
    response.headers.set('FileName', fileName);
    return response;
  } catch (error) {
    console.error('Se ha producido un error inesperado:', error);
    // Manejar el error y enviar una respuesta de error al cliente si es necesario
    return new NextResponse('Ocurrió un error al procesar la solicitud.', { status: 500 });
  }
}