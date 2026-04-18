# -*- coding: utf-8 -*-
import sys
import os

# Windows PyInstaller 환경에서 한글 파일명 처리를 위해 UTF-8 강제 설정
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

# DATA_DIR 환경변수로 각 컴퓨터마다 독립 데이터 폴더 사용 (Electron 앱용)
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


@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.lower().endswith('.pdf'):
        # 한글 파일명 보존: secure_filename은 한글을 제거하므로
        # 원본 파일명을 UTF-8로 디코딩하여 사용
        original_filename = file.filename
        try:
            # werkzeug가 latin-1로 잘못 디코딩한 경우 복구
            original_filename = original_filename.encode('latin-1').decode('utf-8')
        except (UnicodeDecodeError, UnicodeEncodeError):
            pass  # 이미 올바른 UTF-8이면 그대로 사용

        # path traversal 방지: 디렉토리 구분자 제거
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
