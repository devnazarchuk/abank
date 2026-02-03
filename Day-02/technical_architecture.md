# Технічна архітектура та стек технологій

**Дата:** 23.01.2026 (День 2)

## 1. Архітектурний підхід

Для розробки MVP обрано **Монолітну архітектуру** на базі мета-фреймворку Next.js.

**Обґрунтування:**
- **Швидкість розробки:** Єдина кодова база для фронтенду та бекенду.
- **Типізація:** Спільні типи даних (TypeScript) між клієнтом та сервером.
- **Деплой:** Простий процес розгортання одного Docker-контейнера.
- **SEO:** Server-Side Rendering (SSR) з коробки, що критично для публічних курсів.

### Високорівнева схема (C4 Level 2):

```mermaid
graph TD
    User[Користувач] -->|HTTPS| CDN[CDN / Load Balancer]
    CDN -->|Next.js App| WebApp[Веб-додаток (Next.js)]
    
    subgraph "Application Server"
        WebApp -->|Server Actions| API[API Layer]
        API -->|ORM| DB[(PostgreSQL)]
        API -->|OAuth| Google[Google Auth]
        WebApp -->|Embed| YouTube[YouTube Player API]
    end
```

## 2. Технологічний стек

### Frontend & Backend (Fullstack)
*   **Framework:** **Next.js 14+ (App Router)**. Найсучасніший стандарт React.
*   **Language:** **TypeScript**. Строга типізація для надійності.
*   **Styling:** **Tailwind CSS**. Швидка верстка, адаптивність, темна тема.
*   **Components:** **Radix UI / shadcn/ui**. Готові доступні компоненти, що копіюються в код (максимальний контроль).
*   **State Management:** React Context + **Zustand** (якщо знадобиться глобальний стейт).

### Data & Storage
*   **Database:** **PostgreSQL**. Надійна реляційна база даних.
*   **ORM:** **Prisma**. Найкращий DX (Developer Experience) для роботи з SQL в TypeScript.
*   **Auth:** **NextAuth.js (Auth.js)**. Підтримка OAuth (Google/GitHub) та Credentials.

### DevOps & Tools
*   **Linting:** ESLint + Prettier.
*   **Containerization:** Docker.
*   **Package Manager:** npm або pnpm.

## 3. Структура бази даних (Попередня)

Ключові сутності для MVP:
1.  **User** (id, name, email, role).
2.  **Course** (id, title, description, thumbnail).
3.  **Lesson** (id, course_id, video_url, duration).
4.  **Progress** (user_id, lesson_id, status, last_position).
5.  **Comment** (user_id, lesson_id, text).

## 4. План розгортання
В якості цільової платформи для деплою обрано власний Linux-сервер (VPS) з використанням **Docker Compose**. Це забезпечує повний контроль над даними та відсутність прив'язки до хмарних провайдерів (vendor lock-in), що важливо для замовника.
