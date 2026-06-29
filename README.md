# מאמן כושר Pro 💪

אפליקציית ניהול מתאמנים למאמני כושר — Full-Stack, Mobile-First, Hebrew RTL.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + Dark Mode
- **Shadcn/ui** components
- **Prisma ORM** + Supabase (PostgreSQL)
- **NextAuth.js v5** (JWT sessions)
- **Recharts** (גרפים)
- **Supabase Storage** (תמונות התקדמות)
- **Framer Motion** (אנימציות)
- **Netlify** (פריסה)

## הגדרת הפרויקט

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת Supabase

1. צור פרויקט חדש ב-[Supabase](https://supabase.com)
2. עבור ל-Settings > Database > Connection String
3. העתק את ה-Connection String (Transaction Pooler + Direct)
4. צור Storage Bucket בשם `progress-photos` עם **Public** access

### 3. הגדרת משתני סביבה

העתק את `.env` ועדכן:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. יצירת ה-Schema ו-Seed

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push

# Seed exercises + demo coach
npm run db:seed
```

**Demo credentials:**
- Coach: `coach@demo.com` / `demo1234`

### 5. הרצת הפרויקט

```bash
npm run dev
```

פתח http://localhost:3000

## מבנה העמודים

### מאמן
| עמוד | תיאור |
|------|--------|
| `/dashboard` | דאשבורד ראשי + כרטיסי מתאמנים |
| `/trainees` | רשימת כל המתאמנים |
| `/trainees/[id]` | פרופיל מתאמן עם 6 טאבים |
| `/trainees/[id]/workout/new` | בניית תוכנית אימון |
| `/trainees/[id]/nutrition/new` | בניית תוכנית תזונה |
| `/exercises` | ספריית תרגילים |
| `/invite` | הזמנת מתאמן/ת |

### מתאמן
| עמוד | תיאור |
|------|--------|
| `/my/dashboard` | דאשבורד אישי + אימון היום |
| `/my/workout` | צפייה ותיעוד אימון |
| `/my/nutrition` | תוכנית תזונה + רשימת קניות |
| `/my/checkin` | צ׳ק-אין שבועי + תמונות |
| `/my/progress` | גרפים + גלריית תמונות |
| `/my/timeline` | ציר זמן אישי |

## פריסה ל-Netlify

1. Push ל-GitHub
2. חבר ב-Netlify
3. הוסף את כל משתני הסביבה ב-Netlify Dashboard
4. הגדר `NEXTAUTH_URL` לדומיין שלך
5. בנייה אוטומטית בכל push

## API Routes

| Route | Method | תיאור |
|-------|--------|--------|
| `/api/auth/register` | POST | הרשמת מתאמן דרך invite |
| `/api/invite` | POST | שליחת הזמנה |
| `/api/trainees/[id]/profile` | PUT | עדכון פרופיל מתאמן |
| `/api/workout/plans` | POST | יצירת תוכנית אימון |
| `/api/workout/log` | POST | תיעוד אימון + גילוי PR |
| `/api/nutrition/plans` | POST | יצירת תוכנית תזונה |
| `/api/checkin` | POST | שמירת צ׳ק-אין |
| `/api/checkin/upload` | POST | העלאת תמונה ל-Supabase |
| `/api/exercises` | GET/POST | ספריית תרגילים |
| `/api/alerts` | GET/POST | מערכת התראות |
