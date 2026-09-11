<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 프로젝트 설명

호스트가 만든 임시 Room에서 여러 게스트와 기기 또는 캠 화면을 실시간으로 공유하고 채팅으로 소통하며, 파일도 함께 주고받을 수 있는 서버 없는 실시간 룸 서비스이다.

# 주요 기능

- 임시 Room 생성 및 입장
- URL 및 QR 코드로 Room 공유
- 호스트 기기 또는 캠 화면 공유
- 참여자 실시간 채팅
- 파일 실시간 전송
- 브라우저에서 파일 실행
- 파일 다운로드

# 기술 스택

- Next.js
- TypeScript
- Supabase Realtime
- WebRTC

# 아키텍처 원칙

- Room, Participant 정보는 DB에 저장하지 않는다.
- 파일은 서버나 Supabase Storage에 저장하지 않는다.
- Presence는 게스트 상태 관리에 사용한다.
- Broadcast는 WebRTC Signaling에 사용한다.
- 파일은 WebRTC DataChannel로 직접 전송한다.

# 개발 규칙

## 작업

- 작업 전에 관련 코드를 확인한다.
- 요청한 범위 내에서만 수정한다.
- 새로운 라이브러리나 기능을 임의로 추가하지 않고 사용자의 의견을 묻는다.
- 요구사항이 불명확하면 임의로 결정하지 않고 대안을 제시하고 사용자의 의견을 묻는다.

## 코드 컨벤션

### 네이밍

- 변수와 함수: `camelCase`
- React 컴포넌트, JS 클래스, 타입, 인터페이스: `PascalCase`
- 상수: `UPPER_SNAKE_CASE`
- 파일명: React 컴포넌트인 경우 `PascalCase`, 그 외 `kebab-case`
- 함수명: `get...`, `set...` 처럼 동작을 앞에 작성. 다루는 데이터 또는 수행하는 동작이 무엇인지 알 수 있어야 함
- 이벤트 핸들러 콜백 함수명: `handle동작` 형식
- 이벤트를 전달받는 props명: `on이벤트명` 형식
- boolean 변수명: `is`, `has`, `can`, `should` 등 값의 의미가 드러나는 prefix를 사용

### 컴포넌트 및 함수

- 단일 책임을 갖도록 작성한다.
- React 컴포넌트는 함수형 컴포넌트로 작성한다.
- 컴포넌트와 함수는 하나의 명확한 책임을 갖도록 작성한다.
- 중복 로직이나 반복되는 변경은 공통 함수 또는 컴포넌트로 추출한다.
- 단, 추상화로 사용처의 복잡성이 증가하거나 옵션·분기가 많아지면 개별 구현을 유지한다.
- import문 목록 사이에 빈 줄을 생성하지 않는다.

### 타입

- 가능한 경우 구체적으로 정의한다.
- `any` 대신 `unknown`과 타입 가드를 사용한다.
- 타입 단언(`as`)은 필요한 경우에만 사용하며, 타입 오류를 우회하는 용도로 사용하지 않는다.

### 변경 범위

- 기존 코드의 패턴과 구조를 우선한다.
- 요청 범위를 벗어난 리팩터링은 하지 않는다.

## 주석 삽입

- 다음 사항에 해당되는 경우에만 주석을 작성한다.
  - 공개 API 설명
  - 공통 컴포넌트·함수·타입 등 재사용되는 코드의 기능 설명
  - 코드만으로 알기 어려운 중요 사항
  - 복잡한 코드 흐름 설명
  - 추후 작업이 필요한 사항
- 추후 작업을 지시하는 주석은 다음 태그를 사용한다.
  - `TODO: ...` : 추가 구현이나 개선 필요
  - `FIXME: ...` : 알려진 버그 또는 잘못된 동작 수정 필요
  - `HACK: ...` : 현재 제약으로 인해 임시로 적용한 구현이며 재작업 필요
- 주석문의 형식은 JSDoc을 우선한다.
- 기능 설명은 명사구로 작성하며, 2문장을 넘기지 않는다(e.g. `전체 참여자 목록을 반환하는 함수.`).
- `—` 대신 `:`를 사용한다.
- 주석이 길어지는 경우 문장 단위로 줄바꿈한다.
- /utils, /types 폴더 내 코드는 기능 설명을 반드시 작성한다.

## 문서 참고

- 구현 시 프로젝트 설치 버전에 맞는 라이브러리 공식 문서를 우선 참고한다.
- API나 동작이 불확실한 경우 추측하지 않고 공식 문서를 확인한다.
