# -*- coding: utf-8 -*-
import sys
import os
import shutil

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    os.environ['PYTHONUTF8'] = '1'

from flask import Flask, request, jsonify
from flask_cors import CORS
import glob
import re
from werkzeug.utils import secure_filename
from nlp_processor import build_model, search_documents
from pdf_processor import process_pdf

app = Flask(__name__)

BASE_DIR         = os.environ.get('DATA_DIR', os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER    = os.path.join(BASE_DIR, 'uploads')
TEXT_DATA_FOLDER = os.path.join(BASE_DIR, 'text_data')
MODELS_FOLDER    = os.path.join(BASE_DIR, 'models')

app.config['UPLOAD_FOLDER']    = UPLOAD_FOLDER
app.config['TEXT_DATA_FOLDER'] = TEXT_DATA_FOLDER
app.config['MODELS_FOLDER']    = MODELS_FOLDER

CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

for folder in [UPLOAD_FOLDER, TEXT_DATA_FOLDER, MODELS_FOLDER]:
    os.makedirs(folder, exist_ok=True)

try:
    print("Attempting initial model build...")
    build_model(app.config['TEXT_DATA_FOLDER'], app.config['MODELS_FOLDER'])
except Exception as e:
    print(f"Initial model build skipped/failed: {e}")


@app.route('/api/upload-path', methods=['POST'])
def upload_by_path():
    """
    Electron 전용: 파일 경로를 JSON으로 받아 직접 복사 처리.
    multipart 인코딩을 우회하므로 한글 파일명이 완벽하게 보존됨.
    """
    data = request.get_json()
    if not data or 'file_path' not in data:
        return jsonify({'error': 'file_path is required'}), 400

    src_path = data['file_path']

    if not os.path.isfile(src_path):
        return jsonify({'error': f'File not found: {src_path}'}), 400
    if not src_path.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400

    # 파일명을 경로에서 직접 추출 — 인코딩 변환 없이 그대로 사용
    filename = os.path.basename(src_path)
    dest_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    try:
        shutil.copy2(src_path, dest_path)

        base_filename = os.path.splitext(filename)[0]
        existing = glob.glob(os.path.join(app.config['TEXT_DATA_FOLDER'], f"{base_filename}_page_*.txt"))
        for f in existing:
            os.remove(f)

        process_pdf(dest_path, app.config['TEXT_DATA_FOLDER'])
        print("Rebuilding model after upload...")
        build_model(app.config['TEXT_DATA_FOLDER'], app.config['MODELS_FOLDER'])
        print("Model rebuilt successfully.")
        return jsonify({'message': f'File {filename} uploaded and processed successfully'}), 201

    except Exception as e:
        print(f"Error during file processing: {e}")
        return jsonify({'error': f'An error occurred: {e}'}), 500


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """브라우저 fallback용 기존 multipart 엔드포인트"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.lower().endswith('.pdf'):
        original_filename = file.filename
        try:
            original_filename = original_filename.encode('latin-1').decode('utf-8')
        except (UnicodeDecodeError, UnicodeEncodeError):
            pass

        safe_filename = os.path.basename(original_filename).replace('/', '').replace('\\', '')
        if not safe_filename:
            safe_filename = secure_filename(file.filename) or 'upload.pdf'

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
        file.save(filepath)

        try:
            base_filename = os.path.splitext(safe_filename)[0]
            existing = glob.glob(os.path.join(app.config['TEXT_DATA_FOLDER'], f"{base_filename}_page_*.txt"))
            for f in existing:
                os.remove(f)

            process_pdf(filepath, app.config['TEXT_DATA_FOLDER'])
            print("Rebuilding model after upload...")
            build_model(app.config['TEXT_DATA_FOLDER'], app.config['MODELS_FOLDER'])
            print("Model rebuilt successfully.")
            return jsonify({'message': f'File {safe_filename} uploaded and processed successfully'}), 201

        except Exception as e:
            print(f"Error during file processing: {e}")
            return jsonify({'error': f'An error occurred: {e}'}), 500
    else:
        return jsonify({'error': 'Invalid file type, only PDF is allowed'}), 400


@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q')
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    try:
        search_results = search_documents(query, app.config['MODELS_FOLDER'], app.config['TEXT_DATA_FOLDER'])
        return jsonify(search_results)
    except FileNotFoundError:
        return jsonify({'error': 'Model not found. Please upload a file first.'}), 500
    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    try:
        text_files = glob.glob(os.path.join(app.config['TEXT_DATA_FOLDER'], '*.txt'))
        processed_files = sorted(list(set([
            re.sub(r'_page_\d+\.txt$', '', os.path.basename(f)) for f in text_files
        ])))
        return jsonify({'total_pages': len(text_files), 'processed_files': processed_files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/reset-all', methods=['GET', 'DELETE'])
def reset_all():
    print("=== RESET-ALL REQUEST RECEIVED ===")
    try:
        for folder in [TEXT_DATA_FOLDER, UPLOAD_FOLDER, MODELS_FOLDER]:
            for f in glob.glob(os.path.join(folder, '*')):
                os.remove(f)
        build_model(app.config['TEXT_DATA_FOLDER'], app.config['MODELS_FOLDER'])
        print("=== RESET-ALL COMPLETED ===")
        return jsonify({'message': 'All data and models have been reset.'}), 200
    except Exception as e:
        print(f"=== RESET-ALL ERROR: {e} ===")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    app.run(debug=False, port=5001, host='127.0.0.1', use_reloader=False)
