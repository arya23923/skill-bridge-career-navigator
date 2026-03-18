import io
from fastapi import UploadFile, HTTPException


async def extract_text(file: UploadFile) -> str:
    """Extract raw text from uploaded PDF or DOCX resume."""
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        return await _parse_pdf(file)
    elif filename.endswith(".docx"):
        return await _parse_docx(file)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a PDF or DOCX file."
        )


async def _parse_pdf(file: UploadFile) -> str:
    try:
        import PyPDF2
        contents = await file.read()
        reader = PyPDF2.PdfReader(io.BytesIO(contents))
        text = " ".join(
            page.extract_text() or "" for page in reader.pages
        )
        if not text.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from PDF. Please ensure the PDF is not scanned/image-based."
            )
        return text
    except ImportError:
        raise HTTPException(status_code=500, detail="PyPDF2 not installed.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse PDF: {str(e)}")


async def _parse_docx(file: UploadFile) -> str:
    try:
        from docx import Document
        contents = await file.read()
        doc = Document(io.BytesIO(contents))
        text = " ".join(para.text for para in doc.paragraphs if para.text.strip())
        if not text.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from DOCX. The file may be empty."
            )
        return text
    except ImportError:
        raise HTTPException(status_code=500, detail="python-docx not installed.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse DOCX: {str(e)}")