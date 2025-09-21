import fitz  # PyMuPDF
import os
import re

def clean_text(text):
    """텍스트에서 불필요한 공백, 제어 문자 등을 정리합니다."""
    text = re.sub(r'\s+', ' ', text)  # 여러 공백을 하나로
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text) # 제어 문자 제거
    return text.strip()

def process_pdf(pdf_path, text_data_folder):
    """
    PDF 파일에서 텍스트를 추출하여 페이지별로 텍스트 파일에 저장합니다.
    """
    if not os.path.exists(text_data_folder):
        os.makedirs(text_data_folder)

    try:
        doc = fitz.open(pdf_path)
        pdf_filename = os.path.basename(pdf_path)
        base_filename = os.path.splitext(pdf_filename)[0]

        for i, page in enumerate(doc):
            text = page.get_text()
            cleaned_text = clean_text(text)

            if cleaned_text:  # 내용이 있는 페이지만 저장
                output_filename = f"{base_filename}_page_{i + 1}.txt"
                output_path = os.path.join(text_data_folder, output_filename)
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned_text)
        
        print(f"Processed {len(doc)} pages from {pdf_filename}.")

    except Exception as e:
        print(f"Error processing PDF {pdf_path}: {e}")
        raise
