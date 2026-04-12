import json
import joblib
import glob
import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# 한국어 형태소 분석기 (설치 안 된 경우 fallback)
try:
    from konlpy.tag import Okt
    _okt = Okt()
    _USE_KONLPY = True
    print("konlpy Okt loaded successfully.")
except Exception:
    _okt = None
    _USE_KONLPY = False
    print("konlpy not available, using simple preprocessing.")

# --- 인메모리 모델 캐시 ---
_model_cache = {
    'vectorizer': None,
    'lsa': None,
    'lsa_matrix': None,
    'filenames': None,
}


def preprocess_text(text):
    """텍스트 전처리: 소문자 변환, 공백 정리, 한국어 형태소 분석(가능 시)"""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    if _USE_KONLPY and _okt is not None:
        try:
            # 명사 + 동사 원형만 추출하여 검색 품질 향상
            morphs = _okt.pos(text, norm=True, stem=True)
            tokens = [word for word, pos in morphs if pos in ('Noun', 'Verb', 'Adjective')]
            if tokens:
                return ' '.join(tokens)
        except Exception:
            pass  # konlpy 오류 시 원문 그대로 반환

    return text


def reload_model_cache(models_folder):
    """저장된 모델을 메모리에 로드합니다."""
    global _model_cache
    try:
        _model_cache['vectorizer'] = joblib.load(os.path.join(models_folder, 'tfidf_vectorizer.joblib'))
        _model_cache['lsa'] = joblib.load(os.path.join(models_folder, 'lsa_model.joblib'))
        _model_cache['lsa_matrix'] = joblib.load(os.path.join(models_folder, 'lsa_matrix.joblib'))
        _model_cache['filenames'] = joblib.load(os.path.join(models_folder, 'filenames.joblib'))
        print("Model cache reloaded into memory.")
    except FileNotFoundError:
        _model_cache = {'vectorizer': None, 'lsa': None, 'lsa_matrix': None, 'filenames': None}
        print("No model files to load into cache.")


def build_model(text_data_folder, models_folder):
    """
    text_data 폴더의 텍스트 파일을 기반으로 TF-IDF, LSA 모델을 빌드하고 저장합니다.
    빌드 후 인메모리 캐시도 자동으로 갱신합니다.
    """
    print(f"Starting model build. Text data from: {text_data_folder}, Models to: {models_folder}")

    os.makedirs(models_folder, exist_ok=True)

    filepaths = glob.glob(os.path.join(text_data_folder, '*.txt'))
    if not filepaths:
        print("No text data available to build model.")
        for model_file in glob.glob(os.path.join(models_folder, '*')):
            os.remove(model_file)
        reload_model_cache(models_folder)
        return

    documents = []
    filenames = []
    for filepath in filepaths:
        with open(filepath, 'r', encoding='utf-8') as f:
            documents.append(preprocess_text(f.read()))
            filenames.append(os.path.basename(filepath))

    # TF-IDF 벡터화 (unigram + bigram)
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
    tfidf_matrix = vectorizer.fit_transform(documents)

    # LSA 모델
    n_components = min(100, len(documents) - 1) if len(documents) > 1 else 1
    lsa = TruncatedSVD(n_components=n_components)
    lsa.fit(tfidf_matrix)

    # LSA 매트릭스를 미리 계산하여 저장 (검색 시 재계산 불필요)
    lsa_matrix = lsa.transform(tfidf_matrix)

    joblib.dump(vectorizer, os.path.join(models_folder, 'tfidf_vectorizer.joblib'))
    joblib.dump(lsa, os.path.join(models_folder, 'lsa_model.joblib'))
    joblib.dump(lsa_matrix, os.path.join(models_folder, 'lsa_matrix.joblib'))
    joblib.dump(filenames, os.path.join(models_folder, 'filenames.joblib'))

    print("Model built and saved successfully.")

    # 인메모리 캐시 갱신
    reload_model_cache(models_folder)


def search_documents(query, models_folder, text_data_folder, threshold=0.2, top_k=10):
    """
    인메모리 캐시된 모델을 사용하여 주어진 쿼리와 가장 유사한 문서를 찾습니다.
    캐시가 없으면 디스크에서 로드합니다.
    """
    # 캐시가 비어 있으면 디스크에서 로드 시도
    if _model_cache['vectorizer'] is None:
        reload_model_cache(models_folder)

    if _model_cache['vectorizer'] is None:
        raise FileNotFoundError("Model not found. Please upload documents first.")

    vectorizer = _model_cache['vectorizer']
    lsa = _model_cache['lsa']
    lsa_matrix = _model_cache['lsa_matrix']
    filenames = _model_cache['filenames']

    processed_query = preprocess_text(query)
    if not processed_query:
        return []

    query_vec = vectorizer.transform([processed_query])
    query_lsa = lsa.transform(query_vec)

    # 사전 계산된 lsa_matrix 사용 (매번 재계산 없음)
    similarities = cosine_similarity(query_lsa, lsa_matrix).flatten()

    results = []
    for i in similarities.argsort()[:-top_k - 1:-1]:
        if similarities[i] > threshold:  # 임계값 0.2로 상향
            filepath = os.path.join(text_data_folder, filenames[i])
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    raw = f.read()
                # 단어 경계에서 미리보기 자르기
                preview = raw[:250]
                if len(raw) > 250:
                    last_space = preview.rfind(' ')
                    preview = preview[:last_space] if last_space != -1 else preview
                    preview += '...'
            except FileNotFoundError:
                preview = "원본 텍스트를 찾을 수 없습니다."

            results.append({
                'page': filenames[i].replace('.txt', '').replace('_', ' '),
                'similarity': round(float(similarities[i]), 4),
                'content_preview': preview
            })

    return results


if __name__ == '__main__':
    TEXT_DATA_FOLDER = 'text_data'
    MODELS_FOLDER = 'models'
    build_model(TEXT_DATA_FOLDER, MODELS_FOLDER)
    results = search_documents("검색어 입력", MODELS_FOLDER, TEXT_DATA_FOLDER)
    print(results)
