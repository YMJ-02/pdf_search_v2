export const translations = {
  ko: {
    appTitle: '고급 PDF 문서 검색 시스템',
    // FileUpload
    uploadTitle: 'PDF 업로드 (다중 선택 가능)',
    selectFile: '파일 선택',
    noFile: '선택된 파일 없음',
    filesSelected: (n) => `${n}개 파일 선택됨`,
    upload: '업로드',
    // SearchBar
    searchTitle: '문서 검색',
    searchLabel: '검색할 지문 또는 키워드',
    search: '검색',
    // Results
    resultsTitle: '검색 결과',
    similarity: (s) => `유사도: ${s}`,
    noResults: '검색어를 입력하거나 다른 검색어로 시도해보세요.',
    resultsError: '검색 결과를 불러오는 중 오류가 발생했습니다.',
    // Status
    statusTitle: '처리된 문서 현황',
    resetAll: '전체 초기화',
    totalPages: '총 처리된 페이지 수:',
    fileList: '처리된 파일 목록:',
    noProcessed: '처리된 파일이 없습니다.',
    // ConfirmationDialog
    resetDialogTitle: '데이터 초기화 확인',
    resetDialogDesc: '정말로 모든 데이터를 초기화하시겠습니까? 업로드된 파일, 처리된 텍스트, 학습된 모델이 모두 영구적으로 삭제됩니다.',
    cancel: '취소',
    confirm: '확인',
    // Notifications
    noQuery: '검색어를 입력하세요.',
    noResultsNotif: '검색 결과가 없습니다.',
    searchError: '검색에 실패했습니다.',
    uploadSuccess: '파일이 성공적으로 업로드 및 처리되었습니다.',
    resetSuccess: '모든 데이터가 초기화되었습니다.',
    resetError: '초기화에 실패했습니다.',
    noUploadFile: '업로드할 파일을 선택하세요.',
    uploadFail: (name, msg) => `${name} 업로드 실패: ${msg}`,
    uploadPartial: (n) => `${n}개 파일 업로드 실패.`,
  },
  en: {
    appTitle: 'Advanced PDF Passage Search',
    // FileUpload
    uploadTitle: 'Upload PDFs (multi-select supported)',
    selectFile: 'Select Files',
    noFile: 'No file selected',
    filesSelected: (n) => `${n} file(s) selected`,
    upload: 'Upload',
    // SearchBar
    searchTitle: 'Search',
    searchLabel: 'Enter passage or keyword',
    search: 'Search',
    // Results
    resultsTitle: 'Results',
    similarity: (s) => `Similarity: ${s}`,
    noResults: 'Enter a keyword or try a different search term.',
    resultsError: 'An error occurred while loading results.',
    // Status
    statusTitle: 'Processed Documents',
    resetAll: 'Reset All',
    totalPages: 'Total pages processed:',
    fileList: 'Processed files:',
    noProcessed: 'No files processed yet.',
    // ConfirmationDialog
    resetDialogTitle: 'Confirm Reset',
    resetDialogDesc: 'Are you sure you want to reset all data? All uploaded files, processed text, and trained models will be permanently deleted.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    // Notifications
    noQuery: 'Please enter a search term.',
    noResultsNotif: 'No results found.',
    searchError: 'Search failed.',
    uploadSuccess: 'File(s) uploaded and processed successfully.',
    resetSuccess: 'All data has been reset.',
    resetError: 'Reset failed.',
    noUploadFile: 'Please select a file to upload.',
    uploadFail: (name, msg) => `Upload failed for ${name}: ${msg}`,
    uploadPartial: (n) => `${n} file(s) failed to upload.`,
  },
};
