from flask import Flask, request, send_file
from flask_cors import CORS
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Endpoint to receive PDF and coordinates
@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    x = float(request.form['x'])
    y = float(request.form['y'])
    width = float(request.form['width'])
    height = float(request.form['height'])
    

    # Process the PDF and add a box
    output_pdf = draw_box_on_pdf(file, x, y, width, height)

    # Return the modified PDF
    print(f"Received file: {file.filename}, x: {x}, y: {y}, width: {width}, height: {height}")	
    return send_file(output_pdf, as_attachment=True, download_name="modified_pdf.pdf")


def draw_box_on_pdf(pdf_file, x, y, width, height):
    # Read the input PDF
    reader = PdfReader(pdf_file)
    writer = PdfWriter()

    # Get the first page (where the box will be drawn)
    first_page = reader.pages[0]

    # Get the actual dimensions of the PDF page using 'mediabox'
    pdf_width = float(first_page.mediabox.width)
    pdf_height = float(first_page.mediabox.height)

    print(f"PDF page dimensions: width={pdf_width}, height={pdf_height}")
    
    # Create a new PDF to overlay the box using the actual page size
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=(pdf_width, pdf_height))  # Use actual page size
    can.setStrokeColorRGB(1, 0, 0)  # Red color for the box
    can.setLineWidth(4)  # Thicker line for better visibility

    # Adjust the y-coordinate for the PDF coordinate system (bottom-left origin)
    adjusted_y = pdf_height - y - height

    print(f"Drawing box at x={x}, y={adjusted_y}, width={width}, height={height}")

    # Draw the rectangle at the specified location
    can.rect(x, adjusted_y, width, height)
    can.save()

    # Merge the box overlay into the first page
    packet.seek(0)
    overlay = PdfReader(packet)
    first_page.merge_page(overlay.pages[0])
    writer.add_page(first_page)  # Add the modified first page

    # Copy all remaining pages (starting from the second page)
    for i in range(1, len(reader.pages)):
        page = reader.pages[i]
        writer.add_page(page)  # Add unmodified pages

    # Output the final PDF
    output = BytesIO()
    writer.write(output)
    output.seek(0)

    return output


if __name__ == '__main__':
    app.run(debug=True)
