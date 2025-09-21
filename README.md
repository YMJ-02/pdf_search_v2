# PDF Search System

## Overview

This project is an advanced PDF document search system using TF-IDF, N-gram, LSA, and cosine similarity. It provides a web interface for uploading, searching, and managing PDF files. The system is designed for easy use on local networks and supports automatic server startup for non-technical users.

## Features

- Upload and search PDF documents
- Advanced search algorithm: TF-IDF + N-gram + LSA + Cosine Similarity
- Fast and accurate document retrieval
- User-friendly web interface (React + Material UI)
- Network access: use from other computers on the same network
- Automatic server startup on Windows boot
- Server status management tool

## How to Use

1. **Start the server**
   - Recommended: Double-click start_servers_protected.bat
   - For background mode: Run start_servers_detached.ps1
2. **Access the web interface**
   - Open [http://localhost:5173](http://localhost:5173) in your browser
   - Or use your computer's IP for network access
3. **Manage the server**
   - Use server_manager.bat to check status, start/stop servers, or open the website
4. **Set up auto-start**
   - Run setup_autostart.bat and follow the instructions

## File Structure

- backend - Python Flask server
- frontend - React web client
- start_servers_protected.bat - Recommended server start script
- start_servers_detached.ps1 - Background server start script
- server_manager.bat - Server management tool
- setup_autostart.bat - Auto-start setup script

## Requirements

- Windows 10 or higher
- Python 3.8+ (with virtual environment)
- Node.js 16+ (for frontend)
- Powershell 5.1+ (for background scripts)

---

# PDF Search System (한글)

## 개요

이 프로젝트는 TF-IDF, N-gram, LSA, 코사인 유사도를 활용한 고급 PDF 문서 검색 시스템입니다. PDF 파일 업로드, 검색, 관리가 가능한 웹 인터페이스를 제공합니다. 네트워크 공유 및 자동 서버 시작 기능으로 컴맹도 쉽게 사용할 수 있습니다.

## 주요 기능

- PDF 문서 업로드 및 검색
- 고급 검색 알고리즘: TF-IDF + N-gram + LSA + 코사인 유사도
- 빠르고 정확한 문서 검색
- 사용자 친화적 웹 UI (React + Material UI)
- 네트워크 접근: 같은 네트워크 내 다른 PC에서도 사용 가능
- 윈도우 부팅 시 자동 서버 시작
- 서버 상태 관리 도구 제공

## 사용 방법

1. **서버 시작**
   - 추천: start_servers_protected.bat 더블클릭
   - 백그라운드 모드: start_servers_detached.ps1 실행
2. **웹 인터페이스 접속**
   - 브라우저에서 [http://localhost:5173](http://localhost:5173) 접속
   - 또는 컴퓨터 IP로 네트워크 접속
3. **서버 관리**
   - server_manager.bat로 상태 확인, 시작/중단, 웹사이트 열기 가능
4. **자동 시작 설정**
   - setup_autostart.bat 실행 후 안내에 따라 설정

## 폴더 구조

- backend - Python Flask 백엔드 서버
- frontend - React 프론트엔드 웹 클라이언트
- start_servers_protected.bat - 추천 서버 시작 스크립트
- start_servers_detached.ps1 - 백그라운드 서버 시작 스크립트
- server_manager.bat - 서버 관리 도구
- setup_autostart.bat - 자동 시작 설정 스크립트

## 요구 사항

- Windows 10 이상
- Python 3.8+ (가상환경 사용)
- Node.js 16+ (프론트엔드)
- Powershell 5.1+ (백그라운드 스크립트)
