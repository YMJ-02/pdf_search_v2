from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import glob
import re
import shutil
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
        filename = secure_filename(file.filename)  # path traversal 방지
        if not filename:
            return jsonify({'error': 'Invalid filename'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # 같은 파일 재업로드 시 기존 텍스트 파일 정리
            base_filename = os.path.splitext(filename)[0]
            existing = glob.glob(os.path.join(app.config['TEXT_DATA_FOLDER'], f"{base_filename}_page_*.txt"))
            for f in existing:
                os.remove(f)

            process_pdf(filepath, app.config['TEXT_DATA_FOLDER'])
            print("Rebuilding model after upload...")
            build_model(app.config['TEXT_DATA_FOLDER'], app.config['MODELS_FOLDER'])
            print("Model rebuilt successfully.")
            return jsonify({'message': f'File {filename} uploaded and processed successfully'}), 201

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


# GET + DELETE 둘 다 지원 (Electron에서는 GET, 기존 웹에서는 DELETE)
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