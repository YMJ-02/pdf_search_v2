from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import glob
import re
import shutil
from nlp_processor import build_model, search_documents
from pdf_processor import process_pdf

app = Flask(__name__)

# --- 설정 ---
UPLOAD_FOLDER = 'uploads'
TEXT_DATA_FOLDER = 'text_data'
MODELS_FOLDER = 'models'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['TEXT_DATA_FOLDER'] = TEXT_DATA_FOLDER
app.config['MODELS_FOLDER'] = MODELS_FOLDER

# CORS 설정: 모든 origin에서 접근 허용 (네트워크 공유용)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# --- 초기화 ---
# 서버 시작 시 폴더 생성
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEXT_DATA_FOLDER, exist_ok=True)
os.makedirs(MODELS_FOLDER, exist_ok=True)

# 서버 시작 시 초기 모델 빌드
try:
    print("Attempting initial model build...")
    build_model(app.config['TEXT_DATA_FOLDER'], app.config['MODELS_FOLDER'])
except Exception as e:
    print(f"Initial model build skipped/failed: {e}")

# --- 라우트 (API 엔드포인트) ---

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # PDF 처리
            process_pdf(filepath, app.config['TEXT_DATA_FOLDER'])
            
            # 모델 재빌드
            print("Rebuilding model after upload...")
            build_model(app.config['TEXT_DATA_FOLDER'], app.config['MODELS_FOLDER'])
            print("Model rebuilt successfully after upload.")
            
            return jsonify({'message': f'File {filename} uploaded and processed successfully'}), 201
        
        except Exception as e:
            print(f"Error during file processing or model rebuilding: {e}")
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
        processed_files = sorted(list(set([re.sub(r'_page_\d+\.txt$', '', os.path.basename(f)) for f in text_files])))
        
        return jsonify({
            'total_pages': len(text_files),
            'processed_files': processed_files
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-all', methods=['GET'])
def reset_all():
    print("=== RESET-ALL (GET) REQUEST RECEIVED ===")
    try:
        # text_data 폴더 내용 삭제
        for f in glob.glob(os.path.join(app.config['TEXT_DATA_FOLDER'], '*')):
            os.remove(f)
        print("Text data cleared")

        # uploads 폴더 내용 삭제
        for f in glob.glob(os.path.join(app.config['UPLOAD_FOLDER'], '*')):
            os.remove(f)
        print("Upload folder cleared")

        # models 폴더 내용 삭제
        for f in glob.glob(os.path.join(app.config['MODELS_FOLDER'], '*')):
            os.remove(f)
        print("Model folder cleared")
        
        # 초기 모델 상태로 되돌리기 (빈 모델)
        build_model(app.config['TEXT_DATA_FOLDER'], app.config['MODELS_FOLDER'])

        print("=== RESET-ALL COMPLETED SUCCESSFULLY ===")
        return jsonify({'message': 'All data and models have been reset.'}), 200
    except Exception as e:
        print(f"=== RESET-ALL ERROR: {e} ===")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0', use_reloader=False)
