
# Expert Proposal Automator

AI 기반 제안서 자동화 시스템입니다.

## ⚠️ 깃허브 배포 시 필독 (중요!)

깃허브 웹사이트("Upload files")를 통해 코드를 올릴 때, **절대로 `node_modules` 폴더를 업로드하지 마세요.**
파일 개수가 너무 많아 "Something went wrong" 오류가 발생합니다.

### ✅ 올바른 업로드 방법
다음 파일/폴더만 선택해서 드래그앤드롭 하세요:
- 📁 `components`
- 📁 `services`
- 📁 `.github`
- 📄 `index.html`
- 📄 `index.tsx`
- 📄 `App.tsx`
- 📄 `types.ts`
- 📄 `package.json`
- 📄 `vite.config.ts`
- 📄 `tsconfig.json`
- 📄 `metadata.json`
- 📄 `.gitignore`

### ❌ 업로드 금지
- 🚫 `node_modules` 폴더 (서버에서 자동으로 설치됩니다)
- 🚫 `dist` 폴더 (서버에서 자동으로 생성됩니다)

## 🚀 로컬 실행 방법

1. 설치: `npm install`
2. 실행: `npm run dev`
3. 빌드: `npm run build`

## 🔑 설정

- 배포 후 웹사이트 상단의 **'에이전트 설정(Settings)'** 메뉴에서 Google AI Studio API Key를 입력하여 사용합니다.
