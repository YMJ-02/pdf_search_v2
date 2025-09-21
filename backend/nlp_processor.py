import json
import joblib
import glob
import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def preprocess_text(text):
    """간단한 텍스트 전처리 (소문자 변환, 공백 정리)"""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def build_model(text_data_folder, models_folder):
    """
    text_data 폴더의 텍스트 파일들을 기반으로 TF-IDF, LSA 모델을 빌드하고 저장합니다.
    """
    print(f"Starting model build. Text data from: {text_data_folder}, Models to: {models_folder}")

    if not os.path.exists(models_folder):
        os.makedirs(models_folder)

    filepaths = glob.glob(os.path.join(text_data_folder, '*.txt'))
    if not filepaths:
        print("No text data available to build model.")
        # 기존 모델이 있다면 삭제하여 불일치를 방지
        for model_file in glob.glob(os.path.join(models_folder, '*')):
            os.remove(model_file)
        return

    documents = []
    filenames = []
    for filepath in filepaths:
        with open(filepath, 'r', encoding='utf-8') as f:
            # 전처리 적용
            documents.append(preprocess_text(f.read()))
            filenames.append(os.path.basename(filepath))

    # TF-IDF 벡터화
    # n-gram(1, 2)는 단어 1개, 2개짜리를 모두 피처로 사용한다는 의미
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
    tfidf_matrix = vectorizer.fit_transform(documents)

    # LSA 모델
    lsa = TruncatedSVD(n_components=100)
    lsa.fit(tfidf_matrix)

    # 모델 및 데이터 저장
    joblib.dump(vectorizer, os.path.join(models_folder, 'tfidf_vectorizer.joblib'))
    joblib.dump(lsa, os.path.join(models_folder, 'lsa_model.joblib'))
    joblib.dump(tfidf_matrix, os.path.join(models_folder, 'tfidf_matrix.joblib'))
    joblib.dump(filenames, os.path.join(models_folder, 'filenames.joblib'))
    
    print("Model built and saved successfully.")


def search_documents(query, models_folder, text_data_folder):
    """
    저장된 모델을 로드하여 주어진 쿼리와 가장 유사한 문서를 찾습니다.
    """
    try:
        # 모델 및 데이터 로드
        vectorizer = joblib.load(os.path.join(models_folder, 'tfidf_vectorizer.joblib'))
        lsa = joblib.load(os.path.join(models_folder, 'lsa_model.joblib'))
        tfidf_matrix = joblib.load(os.path.join(models_folder, 'tfidf_matrix.joblib'))
        filenames = joblib.load(os.path.join(models_folder, 'filenames.joblib'))
    except FileNotFoundError:
        print("Model files not found. Please upload documents first.")
        return []

    # 쿼리 전처리
    processed_query = preprocess_text(query)
    if not processed_query:
        return []

    # 쿼리 변환
    query_vec = vectorizer.transform([processed_query])
    query_lsa = lsa.transform(query_vec)

    # LSA 공간에서의 코사인 유사도 계산
    lsa_matrix = lsa.transform(tfidf_matrix)
    similarities = cosine_similarity(query_lsa, lsa_matrix).flatten()

    # 유사도 순으로 정렬
    results = []
    # 유사도가 높은 상위 10개 결과만 추출
    for i in similarities.argsort()[:-11:-1]:
        # 유사도가 0.1 이상인 결과만 포함 (임계값)
        if similarities[i] > 0.1:
            # 파일명에서 페이지 정보 추출 (예: 'document_name_page_1.txt')
            page_info = filenames[i].replace('.txt', '').replace('_', ' ')
            
            # 원본 텍스트 내용 로드
            try:
                with open(os.path.join(text_data_folder, filenames[i]), 'r', encoding='utf-8') as f:
                    content = f.read(200) # 미리보기용으로 200자만 로드
            except FileNotFoundError:
                content = "원본 텍스트를 찾을 수 없습니다."

            results.append({
                'page': page_info,
                'similarity': round(float(similarities[i]), 4),
                'content_preview': content + '...'
            })
            
    return results

if __name__ == '__main__':
    # 테스트 코드
    TEXT_DATA_FOLDER = 'text_data'
    MODELS_FOLDER = 'models'
    
    # 모델 빌드 테스트
    # build_model(TEXT_DATA_FOLDER, MODELS_FOLDER)
    
    # 검색 테스트
    search_query = "your search query"
    search_results = search_documents(search_query, MODELS_FOLDER, TEXT_DATA_FOLDER)
    # print(search_results[:5])
