/**
 * generate-sql-tutorials.mjs
 * Creates all SQL tutorial MDX files for CodesCompiler.
 * Run: node scripts/generate-sql-tutorials.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'src', 'content', 'tutorials');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ── Shared base dataset ──────────────────────────────────────────────────────
const BASE_SETUP = `CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  city TEXT,
  score REAL,
  grade TEXT
);
INSERT INTO students VALUES
  (1,'Aria Chen',22,'Mumbai',94.5,'A'),
  (2,'Ben Torres',19,'Delhi',78.2,'B'),
  (3,'Cleo Park',24,'Bangalore',88.0,'A'),
  (4,'Dev Patel',21,'Chennai',65.5,'C'),
  (5,'Eva Müller',20,'Hyderabad',91.3,'A'),
  (6,'Finn Walsh',23,'Pune',72.8,'B'),
  (7,'Gina Lopez',22,'Kolkata',55.1,'D'),
  (8,'Hiro Sato',25,'Mumbai',83.6,'B');

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT,
  instructor TEXT,
  category TEXT,
  price REAL,
  rating REAL
);
INSERT INTO courses VALUES
  (1,'Python Mastery','Dr. Ada Lovelace','Programming',2999,4.9),
  (2,'SQL Foundations','Prof. Edgar Codd','Database',1999,4.8),
  (3,'Web Design','Ms. Grace Hopper','Design',1499,4.7),
  (4,'Data Science','Dr. Alan Turing','Analytics',3999,4.9),
  (5,'Cybersecurity','Mr. Kevin Mitnick','Security',2499,4.6);

CREATE TABLE enrollments (
  student_id INTEGER,
  course_id INTEGER,
  enroll_date TEXT,
  status TEXT,
  final_score REAL
);
INSERT INTO enrollments VALUES
  (1,1,'2024-01-15','completed',95),
  (1,2,'2024-02-01','completed',88),
  (2,3,'2024-01-20','active',NULL),
  (3,1,'2024-03-05','completed',90),
  (4,4,'2024-02-10','dropped',45),
  (5,2,'2024-01-10','completed',96),
  (6,5,'2024-03-15','active',NULL),
  (7,3,'2024-02-20','completed',60),
  (8,1,'2024-04-01','active',NULL);`;

// ── Tutorial definitions ─────────────────────────────────────────────────────
const tutorials = [

// ── SQL BASICS ───────────────────────────────────────────────────────────────
{
  slug: 'sql-guide', title: 'SQL – Guide', order: 1,
  desc: 'Start your SQL journey with an overview of what SQL is, why it matters, and how it powers every app you use.',
  intro: `Think of every app you use daily — Instagram, Netflix, your bank. Behind the scenes, each one asks a database thousands of questions every second: *"Who is this user? What videos should I recommend? What is their balance?"* **SQL (Structured Query Language)** is the universal language used to ask those questions and get answers instantly.

SQL is not a programming language in the traditional sense — it is a **query language**. Instead of telling the computer *how* to find data, you simply describe *what* you want, and the database engine figures out the rest. That simplicity is its superpower.`,
  concept: `**Quick Facts**\n- SQL stands for **S**tructured **Q**uery **L**anguage\n- Invented at IBM in the 1970s by Edgar F. Codd\n- Works with virtually every database: MySQL, PostgreSQL, SQLite, SQL Server, Oracle\n- Powers 90%+ of the world's data-driven applications`,
  setup: BASE_SETUP,
  query: `-- Welcome to CodesCompiler SQL!\n-- This query shows all students in our academy database.\nSELECT id, name, city, grade\nFROM   students\nORDER  BY grade;`,
  points: ['SQL is declarative — describe the result, not the steps', 'One SQL query can replace hundreds of lines of code', 'SQL databases store data in organized tables (rows & columns)', 'Learning SQL is one of the highest-ROI tech skills available'],
},

{
  slug: 'sql-home', title: 'SQL – Home', order: 2,
  desc: 'Your launchpad for the CodesCompiler SQL tutorial series — understand the roadmap and what you will build.',
  intro: `Welcome to the CodesCompiler SQL course! This series is built around a fictional online academy called **CodesCompiler Academy**, which has students, courses, instructors, and enrollments stored in a real SQLite database. Every tutorial you complete will use this same dataset — so instead of random abstract examples, you will always be working with something familiar.

By the end of this series, you will be able to extract insights from any dataset, transform raw numbers into meaningful reports, and design databases that scale from a dozen records to billions.`,
  concept: `**The CodesCompiler Academy Database**\nOur practice database has four tables:\n| Table | What it stores |\n|---|---|\n| \`students\` | Name, age, city, grade, score |\n| \`courses\` | Title, instructor, category, price, rating |\n| \`enrollments\` | Which student took which course |\n| \`instructors\` | Teacher profiles and ratings |`,
  setup: BASE_SETUP,
  query: `-- Explore the full students table\nSELECT * FROM students;`,
  points: ['Every SQL course uses tables — structured grids of data', 'Primary keys uniquely identify each row', 'Foreign keys link tables together', 'You query data with SELECT statements'],
},

{
  slug: 'sql-intro', title: 'SQL – Introduction', order: 3,
  desc: 'Understand the core concepts of relational databases and how SQL interacts with them.',
  intro: `A **relational database** stores data in tables — just like a well-organized spreadsheet. Each table has columns (fields) that define the type of data, and rows (records) that hold the actual values. The magic happens when you **relate** tables to each other using shared keys, which lets you answer complex questions without duplicating data everywhere.

SQL was designed in the 1970s to be readable like plain English. The query \`SELECT name FROM students WHERE grade = 'A'\` reads almost like asking a question out loud: *"Give me the names of students whose grade is A."* That readability is intentional — SQL was built for humans, not compilers.`,
  concept: `**Core Database Concepts**\n- **Table**: A collection of related data (like a spreadsheet tab)\n- **Row / Record**: A single data entry\n- **Column / Field**: A category of data (name, age, city)\n- **Primary Key**: A unique identifier for each row\n- **Foreign Key**: A column that links to another table's primary key`,
  setup: BASE_SETUP,
  query: `-- Find students from Mumbai\nSELECT name, age, score\nFROM   students\nWHERE  city = 'Mumbai';`,
  points: ['Relational databases avoid data duplication through normalization', 'Tables are linked via primary and foreign keys', 'SQL is the standard interface for all relational databases', 'SQLite (used here) is the most widely deployed database engine in the world'],
},

{
  slug: 'sql-syntax', title: 'SQL – Syntax', order: 4,
  desc: 'Master the fundamental syntax rules of SQL — keywords, clauses, whitespace, and best practices.',
  intro: `SQL has a clean, consistent structure that you will master quickly. Every SQL statement is built from **clauses** — named blocks that perform a specific role. The \`SELECT\` clause picks columns, \`FROM\` names the table, \`WHERE\` filters rows, and \`ORDER BY\` sorts results. Clauses are always written in a specific order, though most of them are optional.

One important thing: **SQL keywords are case-insensitive**. Writing \`select\` is identical to \`SELECT\`. However, capitalizing keywords is a widely adopted convention that makes queries far easier to read at a glance — always write \`SELECT\`, not \`select\`.`,
  concept: `**SQL Statement Anatomy**\n\`\`\`sql\nSELECT column1, column2   -- What to show\nFROM   table_name          -- Where to look\nWHERE  condition           -- Which rows to include\nORDER  BY column ASC/DESC  -- How to sort results\nLIMIT  n;                  -- How many rows to return\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Syntax demo: keywords in CAPS, readable formatting\nSELECT  name,\n        age,\n        score\nFROM    students\nWHERE   age >= 21\nORDER   BY score DESC\nLIMIT   5;`,
  points: ['SQL is not case-sensitive for keywords, but capitalize by convention', 'Statements end with a semicolon (;)', 'Whitespace and line breaks are ignored — format for readability', 'Comments use -- for single line or /* */ for multi-line'],
},

{
  slug: 'sql-select', title: 'SQL – SELECT', order: 5,
  desc: 'The SELECT statement is the foundation of every SQL query — learn to retrieve exactly the data you need.',
  intro: `The \`SELECT\` statement is the most important tool in your SQL toolkit. It lets you retrieve data from one or more columns in a table. You can select everything with \`SELECT *\`, or be precise and list only the columns you actually need. Being specific is almost always better — it is faster, uses less memory, and makes your queries self-documenting.

Think of \`SELECT\` like placing a custom order at a restaurant. Instead of saying "give me everything on the menu," you say exactly what you want: "I'll have the name, city, and score — nothing else."`,
  concept: `**SELECT variations**\n\`\`\`sql\nSELECT *                  -- All columns (use sparingly)\nSELECT name, score         -- Specific columns\nSELECT name AS student     -- Column with alias\nSELECT UPPER(name)         -- Apply a function\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Retrieve only the columns we actually need\nSELECT name, city, score, grade\nFROM   students;`,
  points: ['SELECT is read-only — it never changes your data', 'List specific columns instead of * for better performance', 'Column order in SELECT determines output column order', 'You can use expressions: SELECT price * 0.9 AS discounted_price'],
},

{
  slug: 'sql-select-distinct', title: 'SQL – SELECT DISTINCT', order: 6,
  desc: 'Eliminate duplicate rows from your results using SELECT DISTINCT to get unique values.',
  intro: `Imagine you have 10,000 student records and you want to know which cities they come from — but you do not want to see "Mumbai" listed 847 times. That is exactly what \`SELECT DISTINCT\` solves. It collapses duplicate values into a single unique entry, giving you a clean list of only the distinct occurrences.

\`DISTINCT\` operates on the entire row after your column selection. If you select two columns, a combination must appear twice to be considered duplicate — not just one of the columns individually.`,
  concept: `**Syntax**\n\`\`\`sql\nSELECT DISTINCT column1, column2\nFROM table_name;\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Find every unique city in our student database\nSELECT DISTINCT city\nFROM   students\nORDER  BY city;`,
  points: ['DISTINCT applies to all selected columns combined', 'NULL is treated as a distinct value by most databases', 'DISTINCT can slow queries on large datasets — use indexes', 'Alternative: use GROUP BY for more control'],
},

{
  slug: 'sql-where', title: 'SQL – WHERE', order: 7,
  desc: 'Filter your query results using the WHERE clause to retrieve only the rows that match your conditions.',
  intro: `Without \`WHERE\`, every query returns the entire table. That might be fine for a table of 8 rows, but imagine a database with 50 million users — you definitely do not want all of them. The \`WHERE\` clause is your precision filter; it evaluates each row against a condition and only returns the rows where that condition is **true**.

You can use comparison operators (\`=\`, \`!=\`, \`>\`, \`<\`, \`>=\`, \`<=\`), check for text patterns, or combine multiple conditions. The \`WHERE\` clause is evaluated *before* columns are selected, which makes it very efficient — the database discards rows it does not need before doing any extra work.`,
  concept: `**Comparison operators in WHERE**\n| Operator | Meaning |\n|---|---|\n| = | Equal to |\n| != or <> | Not equal to |\n| > / < | Greater / Less than |\n| >= / <= | Greater or equal / Less or equal |\n| BETWEEN | Within a range |\n| IN | Matches any value in a list |\n| LIKE | Pattern match |`,
  setup: BASE_SETUP,
  query: `-- Find high-performing students (score above 85)\nSELECT name, city, score, grade\nFROM   students\nWHERE  score > 85;`,
  points: ['WHERE filters happen before SELECT — very efficient', 'String comparisons are case-sensitive in most databases', 'Always use WHERE in UPDATE and DELETE to avoid changing all rows', 'WHERE can use column expressions: WHERE score * 2 > 150'],
},

{
  slug: 'sql-order-by', title: 'SQL – ORDER BY', order: 8,
  desc: 'Sort your query results ascending or descending using the ORDER BY clause.',
  intro: `Data stored in a database has no guaranteed order — rows can appear in any sequence depending on when they were inserted or how the storage engine organizes them. The \`ORDER BY\` clause lets you declare exactly how you want results sorted. Need the top scorers first? Sort by score descending. Building an alphabetical directory? Sort by name ascending.

You can sort by multiple columns — if two rows have the same value in the first sort column, the second column acts as a tiebreaker. This is called a **multi-level sort** and is surprisingly powerful for generating ranked reports.`,
  concept: `**Syntax**\n\`\`\`sql\n-- Single column sort\nSELECT * FROM students ORDER BY score DESC;\n\n-- Multi-column sort (age first, then score)\nSELECT * FROM students ORDER BY age ASC, score DESC;\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Leaderboard: top students by score\nSELECT name, city, score, grade\nFROM   students\nORDER  BY score DESC, name ASC;`,
  points: ['Default sort direction is ASC (ascending) if not specified', 'DESC reverses the order — highest values first', 'NULLs are typically sorted last in ASC, first in DESC', 'ORDER BY can reference column position: ORDER BY 3 DESC'],
},

{
  slug: 'sql-and', title: 'SQL – AND', order: 9,
  desc: 'Combine multiple conditions in a WHERE clause using AND to require all conditions to be true simultaneously.',
  intro: `The \`AND\` operator lets you stack multiple conditions in a single \`WHERE\` clause. A row is only included in the results if **every** condition connected by \`AND\` is true. Think of it as a checklist — every item on the list must be checked off for the row to pass.

This is enormously useful for precision filtering. Instead of finding all students from Mumbai *and then* manually filtering for those with an A grade, you write one query that does both at once with crystal-clear intent.`,
  concept: `**Syntax**\n\`\`\`sql\nSELECT * FROM students\nWHERE  city = 'Mumbai'\n  AND  grade = 'A'\n  AND  score > 90;\n\`\`\`\nAll three conditions must be true for a row to appear.`,
  setup: BASE_SETUP,
  query: `-- Students who are high scorers AND from Bangalore\nSELECT name, city, score, grade\nFROM   students\nWHERE  city = 'Bangalore'\n  AND  score > 80;`,
  points: ['AND requires ALL conditions to be true', 'Chain as many conditions as needed', 'Use parentheses to control evaluation order: (A AND B) OR C', 'AND is evaluated before OR in SQL — parentheses clarify intent'],
},

{
  slug: 'sql-or', title: 'SQL – OR', order: 10,
  desc: 'Use OR in a WHERE clause to include a row when at least one of multiple conditions is true.',
  intro: `While \`AND\` is the strict condition (all must match), \`OR\` is the inclusive one. A row is included whenever **at least one** of the \`OR\` conditions is satisfied. It casts a wider net — perfect for scenarios like "show me students from Mumbai *or* Bangalore" without missing anyone from either city.

Be careful when mixing \`AND\` and \`OR\` without parentheses — SQL has operator precedence rules, and \`AND\` is evaluated before \`OR\`. Always use parentheses when combining them to make your intent perfectly explicit.`,
  concept: `**AND vs OR comparison**\n| City | Grade | AND result | OR result |\n|---|---|---|---|\n| Mumbai | A | ✅ | ✅ |\n| Delhi | A | ❌ | ✅ |\n| Mumbai | C | ❌ | ✅ |\n| Delhi | C | ❌ | ❌ |`,
  setup: BASE_SETUP,
  query: `-- Students from either Mumbai OR Hyderabad\nSELECT name, city, score, grade\nFROM   students\nWHERE  city = 'Mumbai'\n    OR city = 'Hyderabad';`,
  points: ['OR includes rows where ANY one condition is true', 'Use IN() as a cleaner alternative to many OR conditions', 'Parentheses are critical: WHERE a=1 AND (b=2 OR c=3)', 'OR conditions can impact query performance — consider indexes'],
},

{
  slug: 'sql-not', title: 'SQL – NOT', order: 11,
  desc: 'Invert a condition in your WHERE clause using NOT to exclude specific rows from results.',
  intro: `Sometimes it is easier to describe what you do NOT want than what you do. The \`NOT\` operator flips a condition from true to false and vice versa. \`NOT IN\` excludes a list of values, \`NOT LIKE\` skips pattern matches, and \`NOT NULL\` finds rows with actual values (instead of empty ones).

\`NOT\` is particularly valuable when the exclusion list is small but the inclusion set would be enormous. Rather than listing 47 valid categories, just exclude the 3 you do not want.`,
  concept: `**NOT with different operators**\n\`\`\`sql\nWHERE NOT city = 'Delhi'        -- Exclude Delhi\nWHERE city NOT IN ('Delhi','Pune') -- Exclude multiple\nWHERE grade NOT LIKE 'D%'       -- Exclude D grades\nWHERE score IS NOT NULL         -- Non-empty scores\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Everyone except D-grade students\nSELECT name, city, score, grade\nFROM   students\nWHERE  grade NOT IN ('D', 'F')\nORDER  BY score DESC;`,
  points: ['NOT inverts any Boolean condition', 'IS NOT NULL specifically checks for non-empty values', 'NOT IN is equivalent to using != with AND for each value', 'NOT can make queries slower — ensure columns are indexed'],
},

{
  slug: 'sql-insert', title: 'SQL – INSERT', order: 12,
  desc: 'Add new rows to a database table using the INSERT INTO statement.',
  intro: `Everything in a database started as an INSERT. When a user signs up on a website, their data is inserted into a users table. When you place an order online, a new row is inserted into the orders table. The \`INSERT INTO\` statement is how new data enters a database, and it is one of the four fundamental SQL data-manipulation operations (alongside SELECT, UPDATE, and DELETE).

You can insert a single row at a time, or insert multiple rows in one statement for efficiency. Inserting multiple rows in a single query is dramatically faster than running hundreds of individual inserts — always batch when you can.`,
  concept: `**Two ways to INSERT**\n\`\`\`sql\n-- With column list (recommended)\nINSERT INTO students (name, age, city, score, grade)\nVALUES ('Zara Ali', 20, 'Delhi', 88.5, 'A');\n\n-- Multi-row insert\nINSERT INTO students (name, age, city, score, grade)\nVALUES ('Jake Kim', 23, 'Pune', 76.0, 'B'),\n       ('Luna Ray', 21, 'Mumbai', 92.1, 'A');\n\`\`\``,
  setup: `CREATE TABLE gadgets (id INTEGER PRIMARY KEY, brand TEXT, model TEXT, price REAL, stock INTEGER);
INSERT INTO gadgets VALUES (1,'StarTech','Nova Pro',45999,120),(2,'ArcWave','Pulse X',32500,85),(3,'ByteCraft','Pixel S',28999,200),(4,'StarTech','Nova Lite',18999,340),(5,'ArcWave','Pulse Mini',15000,95);`,
  query: `-- Insert two new gadgets and verify\nINSERT INTO gadgets (brand, model, price, stock)\nVALUES ('ByteCraft','Pixel Ultra',62000,50),\n       ('QuantumGear','Nano Z',9999,500);\n\nSELECT * FROM gadgets ORDER BY price DESC;`,
  points: ['Always specify column names in INSERT — safer against schema changes', 'Values must match column data types', 'INSERT with SELECT copies rows from another table or query', 'Most databases auto-generate PRIMARY KEY values when omitted'],
},

{
  slug: 'sql-null-values', title: 'SQL – NULL Values', order: 13,
  desc: 'Understand what NULL means in SQL, why it is different from zero or empty string, and how to work with it.',
  intro: `NULL is one of SQL's most misunderstood concepts. It does not mean zero. It does not mean an empty string. It means **the absence of any value** — the data simply does not exist for that field. A student who hasn't received a grade yet has a NULL grade, not a grade of zero or an empty string.

NULL is infectious: any arithmetic or comparison with NULL returns NULL. \`5 + NULL = NULL\`. \`100 > NULL = NULL\` (not true, not false — unknown). This is called **three-valued logic** and it affects how you write WHERE conditions. You cannot use \`= NULL\`; you must use \`IS NULL\` or \`IS NOT NULL\`.`,
  concept: `**NULL rules**\n| Expression | Result |\n|---|---|\n| NULL = NULL | NULL (not TRUE!) |\n| NULL IS NULL | TRUE |\n| 5 + NULL | NULL |\n| COALESCE(NULL, 0) | 0 |`,
  setup: BASE_SETUP,
  query: `-- Find students who haven't completed any course (NULL final_score)\nSELECT s.name, s.city, e.status, e.final_score\nFROM   students s\nJOIN   enrollments e ON s.id = e.student_id\nWHERE  e.final_score IS NULL;`,
  points: ['NULL ≠ zero, NULL ≠ empty string — it means "no value"', 'Use IS NULL / IS NOT NULL, never = NULL', 'COALESCE(col, default) replaces NULL with a fallback value', 'COUNT(*) counts all rows; COUNT(col) ignores NULLs'],
},

{
  slug: 'sql-update', title: 'SQL – UPDATE', order: 14,
  desc: 'Modify existing rows in a table using the UPDATE statement with precise WHERE conditions.',
  intro: `Data changes. Students move cities. Grades get corrected. Prices are updated. The \`UPDATE\` statement lets you modify existing rows in a table. It is powerful — and therefore dangerous without a \`WHERE\` clause. An \`UPDATE\` without \`WHERE\` modifies **every single row** in the table simultaneously.

The golden rule: always write and verify your \`WHERE\` condition first using a \`SELECT\` statement. Only after confirming the right rows are selected, swap \`SELECT\` for \`UPDATE\`. This habit will save you from costly mistakes.`,
  concept: `**Safe UPDATE workflow**\n\`\`\`sql\n-- Step 1: Verify the rows first\nSELECT * FROM students WHERE name = 'Dev Patel';\n\n-- Step 2: Now run the update\nUPDATE students\nSET    grade = 'B', score = 75.0\nWHERE  name = 'Dev Patel';\n\`\`\``,
  setup: `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, in_stock INTEGER);
INSERT INTO products VALUES (1,'Laptop Pro','Electronics',65000,1),(2,'Desk Chair','Furniture',12000,1),(3,'Notebook','Stationery',250,1),(4,'USB Hub','Electronics',1800,0),(5,'Standing Desk','Furniture',28000,1);`,
  query: `-- Update: apply a 10% discount to all Electronics\nUPDATE products\nSET    price = price * 0.90\nWHERE  category = 'Electronics';\n\nSELECT * FROM products ORDER BY category;`,
  points: ['ALWAYS add WHERE to UPDATE or you change every row', 'You can update multiple columns in one SET clause', 'Use a transaction to safely test updates before committing', 'UPDATE can use expressions: SET score = score + 5'],
},

{
  slug: 'sql-delete', title: 'SQL – DELETE', order: 15,
  desc: 'Remove rows from a table permanently using the DELETE statement — and why the WHERE clause is critical.',
  intro: `The \`DELETE\` statement permanently removes rows from a table. Like \`UPDATE\`, it is completely unforgiving without a \`WHERE\` clause — \`DELETE FROM students\` will wipe out the entire table in an instant, with no warning and no undo.

Always develop the habit of running your filter as a \`SELECT\` first, confirming the rows you intend to delete, and only then issuing the \`DELETE\`. In production systems, most engineers wrap deletes inside a **transaction** so they can roll back if something goes wrong.`,
  concept: `**TRUNCATE vs DELETE**\n| | DELETE | TRUNCATE |\n|---|---|---|\n| Can use WHERE | ✅ Yes | ❌ No |\n| Is a transaction | ✅ Yes | ❌ No |\n| Speed on large tables | Slower | Faster |\n| Keeps table structure | ✅ Yes | ✅ Yes |`,
  setup: `CREATE TABLE log_entries (id INTEGER PRIMARY KEY, event TEXT, level TEXT, created_at TEXT);
INSERT INTO log_entries VALUES (1,'User logged in','INFO','2024-01-10'),(2,'DB backup failed','ERROR','2024-01-11'),(3,'Email sent','INFO','2024-01-11'),(4,'Disk full warning','WARN','2024-01-12'),(5,'Service restarted','INFO','2024-01-12'),(6,'Auth token expired','ERROR','2024-01-13');`,
  query: `-- Remove only INFO-level log entries (routine noise)\nDELETE FROM log_entries\nWHERE  level = 'INFO';\n\n-- Verify: only warnings and errors remain\nSELECT * FROM log_entries ORDER BY created_at;`,
  points: ['ALWAYS use WHERE with DELETE — no WHERE = delete all rows', 'Deleted rows are gone permanently (unless using transactions)', 'Run SELECT with the same WHERE first to preview what will be deleted', 'Use TRUNCATE when you want to empty an entire table quickly'],
},

{
  slug: 'sql-top-rows', title: 'SQL – Limiting Rows', order: 16,
  desc: 'Control how many rows are returned using LIMIT (and TOP/FETCH in other databases).',
  intro: `In the real world, you rarely want *all* rows from a query. Dashboards show "top 10" lists. Pagination shows 20 results per page. APIs return batches of 100 records at a time. The \`LIMIT\` clause (SQLite/MySQL/PostgreSQL) restricts how many rows your query returns. Combined with \`ORDER BY\`, it becomes a powerful tool for ranking and leaderboard queries.

The \`OFFSET\` keyword pairs with \`LIMIT\` for pagination — \`LIMIT 10 OFFSET 20\` means "skip the first 20 rows, then return the next 10" (page 3 of a 10-per-page list).`,
  concept: `**Database syntax differences**\n\`\`\`sql\n-- SQLite, MySQL, PostgreSQL\nSELECT * FROM students LIMIT 5;\n\n-- SQL Server\nSELECT TOP 5 * FROM students;\n\n-- Oracle / SQL Server 2012+\nSELECT * FROM students\nFETCH FIRST 5 ROWS ONLY;\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Top 3 students by score (our leaderboard)\nSELECT name, city, score, grade\nFROM   students\nORDER  BY score DESC\nLIMIT  3;`,
  points: ['LIMIT without ORDER BY returns arbitrary rows — always combine them', 'LIMIT + OFFSET enables efficient pagination', 'Performance tip: add indexes on ORDER BY columns for fast limits', 'LIMIT 1 is a common pattern to find the single best/worst record'],
},

// ── FUNCTIONS & FILTERS ───────────────────────────────────────────────────────
{
  slug: 'sql-aggregates', title: 'SQL – Aggregate Functions', order: 17,
  desc: 'Summarize data across multiple rows using SQL aggregate functions like COUNT, SUM, AVG, MIN, and MAX.',
  intro: `Aggregate functions transform many rows of data into a single summary value. Instead of seeing 8 individual student scores, you can see the average. Instead of scrolling through 1,000 orders, you can see the total revenue. This is where SQL transitions from a data-retrieval tool into a genuine analytics engine.

All aggregate functions ignore NULL values (except \`COUNT(*)\`), which is an important detail. If a student's score is NULL, it won't drag down the average — but you should be aware of its absence when interpreting results.`,
  concept: `**The five core aggregates**\n| Function | What it returns |\n|---|---|\n| COUNT() | Number of rows |\n| SUM() | Total of all values |\n| AVG() | Mean of all values |\n| MIN() | Smallest value |\n| MAX() | Largest value |`,
  setup: BASE_SETUP,
  query: `-- Academy-wide statistics in one query\nSELECT COUNT(*)       AS total_students,\n       ROUND(AVG(score),2)  AS avg_score,\n       MIN(score)     AS lowest_score,\n       MAX(score)     AS highest_score,\n       SUM(score)     AS total_points\nFROM   students;`,
  points: ['Aggregate functions collapse many rows into one summary row', 'COUNT(*) counts all rows; COUNT(col) skips NULLs', 'Use ROUND() to control decimal places on AVG results', 'Combine with GROUP BY to get aggregates per category'],
},

{
  slug: 'sql-min', title: 'SQL – MIN', order: 18,
  desc: 'Find the minimum (smallest) value in a column using the MIN() aggregate function.',
  intro: `The \`MIN()\` function scans a column and returns the single smallest value. It works on numbers (lowest score, cheapest price), dates (earliest date), and even strings (alphabetically first name). It is one of the most used functions in analytics — finding the floor of a dataset is always valuable.

\`MIN()\` automatically ignores NULL values in its calculation. If the column is all NULLs, it returns NULL. You can also use \`MIN()\` with \`GROUP BY\` to find the minimum per group — e.g., the cheapest course per category.`,
  concept: `**MIN on different types**\n\`\`\`sql\nMIN(score)        -- Lowest number\nMIN(enroll_date)  -- Earliest date\nMIN(name)         -- First alphabetically\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- What's the lowest score, cheapest course, and earliest enrollment?\nSELECT MIN(s.score)       AS lowest_student_score,\n       MIN(c.price)       AS cheapest_course,\n       MIN(e.enroll_date) AS first_enrollment\nFROM   students s,\n       courses c,\n       enrollments e;`,
  points: ['MIN works on numbers, dates, and strings', 'NULL values are ignored by MIN', 'MIN WITHOUT GROUP BY returns one global minimum', 'Pair with GROUP BY to get minimum-per-category'],
},

{
  slug: 'sql-max', title: 'SQL – MAX', order: 19,
  desc: 'Retrieve the maximum (largest) value in a column using the MAX() aggregate function.',
  intro: `\`MAX()\` is the mirror of \`MIN()\` — it returns the largest value in a column. Use it to find the top score, most expensive product, latest date, or the last alphabetical entry. Like all aggregate functions, it ignores NULLs and collapses the result to a single value unless combined with \`GROUP BY\`.

A practical pattern: use \`MIN()\` and \`MAX()\` together to understand the **range** of your data. The gap between them tells you how spread out your values are — an early but crucial step in data analysis.`,
  concept: `**Finding range**\n\`\`\`sql\nSELECT MIN(score) AS floor,\n       MAX(score) AS ceiling,\n       MAX(score) - MIN(score) AS range\nFROM students;\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Best course rating and most expensive course per category\nSELECT category,\n       MAX(rating) AS best_rating,\n       MAX(price)  AS premium_price\nFROM   courses\nGROUP  BY category;`,
  points: ['MAX returns the single largest value in a column', 'MAX of a date column returns the most recent date', 'MAX of a string column returns the last alphabetically', 'Combine MIN and MAX to quickly understand data spread'],
},

{
  slug: 'sql-count', title: 'SQL – COUNT', order: 20,
  desc: 'Count the number of rows or non-null values in a result set using the COUNT() function.',
  intro: `\`COUNT()\` answers the most frequent question in data analysis: *how many?* How many students enrolled? How many products are in stock? How many orders were placed this month? It returns the number of rows that match your query — and the subtle difference between \`COUNT(*)\` and \`COUNT(column_name)\` is one of SQL's most important nuances.

\`COUNT(*)\` counts every row including those with NULL values. \`COUNT(score)\` counts only rows where score is not NULL. This distinction matters enormously when your data has gaps.`,
  concept: `**COUNT variations**\n\`\`\`sql\nCOUNT(*)              -- All rows\nCOUNT(score)          -- Rows where score is NOT NULL  \nCOUNT(DISTINCT city)  -- Number of unique cities\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Count students per grade category\nSELECT grade,\n       COUNT(*)   AS student_count,\n       ROUND(AVG(score),1) AS avg_score_in_grade\nFROM   students\nGROUP  BY grade\nORDER  BY grade;`,
  points: ['COUNT(*) counts all rows regardless of NULL', 'COUNT(col) skips NULLs in that column', 'COUNT(DISTINCT col) counts unique, non-null values', 'COUNT is frequently the first aggregation applied in reporting'],
},

{
  slug: 'sql-sum', title: 'SQL – SUM', order: 21,
  desc: 'Add up all values in a numeric column using the SUM() aggregate function.',
  intro: `\`SUM()\` totals all non-NULL values in a numeric column. It is the cornerstone of financial reporting — total revenue, total expenses, sum of all scores, combined inventory value. Without \`SUM()\`, you would need to pull every individual value into your application and add them yourself, massively increasing data transfer and slowing everything down.

Combine \`SUM()\` with \`GROUP BY\` to get subtotals per category — the total sales per region, total enrollment fees per course, total score per grade group. This pattern is one of the most common in business intelligence.`,
  concept: `**SUM with GROUP BY — the power combo**\n\`\`\`sql\nSELECT category, SUM(price) AS total_value\nFROM courses\nGROUP BY category;\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Total enrollment revenue per course\nSELECT c.title,\n       COUNT(e.student_id) AS enrollments,\n       SUM(c.price)        AS total_revenue\nFROM   courses c\nJOIN   enrollments e ON c.id = e.course_id\nGROUP  BY c.title\nORDER  BY total_revenue DESC;`,
  points: ['SUM ignores NULL values', 'SUM only works on numeric columns', 'Combine with GROUP BY for per-category totals', 'SUM(CASE WHEN ... THEN 1 ELSE 0 END) is a conditional count trick'],
},

{
  slug: 'sql-avg', title: 'SQL – AVG', order: 22,
  desc: 'Calculate the arithmetic mean of a numeric column using the AVG() aggregate function.',
  intro: `\`AVG()\` computes the mean by summing all non-NULL values and dividing by the count of non-NULL rows. The key word is *non-NULL* — if you have 10 students and 2 have no score (NULL), SQL calculates the average from the 8 existing scores, not divides by 10. Knowing this prevents silent errors in statistical reports.

Use \`ROUND(AVG(score), 2)\` to control decimal places — raw averages often produce unwieldy numbers like 83.66666667.`,
  concept: `**AVG gotcha with NULLs**\n\`\`\`sql\n-- These give different results if score has NULLs:\nAVG(score)                        -- divides by non-null count\nSUM(score) / COUNT(*)             -- divides by total row count\nCOALESCE(AVG(score), 0)           -- replace NULL result with 0\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Average score per city (with student count for context)\nSELECT city,\n       COUNT(*)             AS students,\n       ROUND(AVG(score), 2) AS avg_score,\n       ROUND(MAX(score) - MIN(score), 1) AS score_range\nFROM   students\nGROUP  BY city\nORDER  BY avg_score DESC;`,
  points: ['AVG ignores NULLs — be aware of what that means for your data', 'Use ROUND() to make averages readable', 'Weighted averages require SUM(value * weight) / SUM(weight)', 'AVG is only meaningful on numeric columns'],
},

{
  slug: 'sql-like', title: 'SQL – LIKE', order: 23,
  desc: 'Search for patterns within text columns using the LIKE operator with wildcard characters.',
  intro: `When you need to find rows based on partial text matches — a name that starts with "A", a city that ends in "i", or an email domain of "gmail.com" — the \`LIKE\` operator is your tool. It uses two special wildcard characters: \`%\` matches any sequence of characters (including none), and \`_\` matches exactly one character.

LIKE is case-insensitive in SQLite by default (though this varies by database). For case-sensitive matching, most databases provide \`ILIKE\` or require a specific collation setting.`,
  concept: `**Wildcard patterns**\n| Pattern | Matches |\n|---|---|\n| 'A%' | Starts with A |\n| '%i' | Ends with i |\n| '%an%' | Contains "an" anywhere |\n| '_eo%' | Second and third chars are "eo" |`,
  setup: BASE_SETUP,
  query: `-- Find all courses related to data topics\nSELECT title, instructor, category, price\nFROM   courses\nWHERE  title LIKE '%Data%'\n    OR title LIKE '%Science%'\n    OR title LIKE '%SQL%';`,
  points: ['% matches zero or more of any characters', '_ matches exactly one character', 'LIKE performs pattern matching, = performs exact matching', 'For complex patterns, consider REGEXP (not in all databases)'],
},

{
  slug: 'sql-wildcards', title: 'SQL – Wildcards', order: 24,
  desc: 'Deep dive into SQL wildcard characters % and _ and how to use them in creative search patterns.',
  intro: `Wildcards are the pattern-matching characters used with the \`LIKE\` operator. They give SQL text search surprising flexibility without needing a full text-search engine. The \`%\` wildcard is like saying "anything" — zero or more of any character. The \`_\` wildcard is like saying "exactly one mystery character."

Combining wildcards lets you build precise patterns: \`'_a%'\` finds any string where the second character is 'a', regardless of what comes before or after. Real-world uses include searching for product codes, email domains, and partial names.`,
  concept: `**Creative wildcard combinations**\n\`\`\`sql\n'M%'       -- Starts with M\n'%a'       -- Ends with a\n'%en%'     -- Contains "en"\n'__a%'     -- Third char is 'a'\n'M_____'   -- 6-char string starting with M\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Find students whose name is exactly 8 characters\nSELECT name, city, grade\nFROM   students\nWHERE  name LIKE '________';\n\n-- Also try: names starting with vowels\n-- WHERE name LIKE 'A%' OR name LIKE 'E%' OR name LIKE 'I%'`,
  points: ['% = zero or more of any character', '_ = exactly one of any character', 'Escape literal % or _ with ESCAPE clause when searching for them', 'LIKE with only % is equivalent to IS NOT NULL and not empty'],
},

{
  slug: 'sql-in', title: 'SQL – IN', order: 25,
  desc: 'Filter rows matching any value from a list using the IN operator — a cleaner alternative to multiple OR conditions.',
  intro: `The \`IN\` operator lets you check whether a column value matches any item in a list. It is syntactic sugar — \`WHERE city IN ('Mumbai', 'Delhi', 'Pune')\` is equivalent to \`WHERE city = 'Mumbai' OR city = 'Delhi' OR city = 'Pune'\` — but far more readable, especially when the list is long.

\`IN\` can also accept a **subquery** as its list — making it one of the most powerful filtering tools in SQL. \`WHERE id IN (SELECT student_id FROM enrollments WHERE status = 'active')\` finds exactly the students with active enrollments without writing a join.`,
  concept: `**IN with list vs. subquery**\n\`\`\`sql\n-- Static list\nWHERE grade IN ('A', 'B')\n\n-- Dynamic subquery\nWHERE id IN (\n  SELECT student_id FROM enrollments\n  WHERE final_score > 90\n)\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Students from top-tier cities\nSELECT name, city, score, grade\nFROM   students\nWHERE  city IN ('Mumbai','Bangalore','Hyderabad')\nORDER  BY score DESC;`,
  points: ['IN is cleaner than multiple OR conditions for same-column checks', 'NOT IN excludes all listed values', 'IN with a subquery is extremely powerful (correlated subqueries)', 'NULL in an IN list can cause unexpected behavior — always handle NULLs explicitly'],
},

{
  slug: 'sql-between', title: 'SQL – BETWEEN', order: 26,
  desc: 'Filter rows within a numeric or date range using the BETWEEN operator.',
  intro: `The \`BETWEEN\` operator filters rows where a column value falls within a defined range — inclusive of both endpoints. \`WHERE score BETWEEN 75 AND 90\` includes students with exactly 75, exactly 90, and everything in between. This is equivalent to \`WHERE score >= 75 AND score <= 90\`, but cleaner and more expressive.

\`BETWEEN\` works equally well on numbers, dates, and even strings. A date range query like \`WHERE enroll_date BETWEEN '2024-01-01' AND '2024-03-31'\` is a classic pattern for quarterly reporting.`,
  concept: `**BETWEEN is always inclusive**\n\`\`\`sql\n-- Number range\nWHERE score BETWEEN 80 AND 95\n\n-- Date range (quarterly)\nWHERE enroll_date BETWEEN '2024-01-01' AND '2024-03-31'\n\n-- Exclude range: NOT BETWEEN\nWHERE price NOT BETWEEN 1000 AND 5000\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Students in the B-grade score range (70–85)\nSELECT name, city, score, grade\nFROM   students\nWHERE  score BETWEEN 70 AND 85\nORDER  BY score DESC;`,
  points: ['BETWEEN is inclusive on both ends', 'Equivalent to column >= low AND column <= high', 'Works on numbers, dates, and strings (alphabetical for strings)', 'NOT BETWEEN excludes the range instead'],
},

{
  slug: 'sql-aliases', title: 'SQL – Aliases', order: 27,
  desc: 'Give tables and columns temporary names using AS aliases to make queries more readable and results cleaner.',
  intro: `Column names in a database are often abbreviated or technical (\`avg_s\`, \`usr_id\`, \`enrl_dt\`). Aggregate expressions like \`ROUND(AVG(score), 2)\` have no name at all. Aliases let you temporarily rename columns and tables within a query to produce readable output and simplify complex expressions.

Table aliases are especially powerful in join queries — instead of writing \`students.name\` and \`enrollments.student_id\` repeatedly, you assign \`students\` as \`s\` and refer to it as \`s.name\` everywhere. Less typing, same power.`,
  concept: `**Column and Table aliases**\n\`\`\`sql\n-- Column alias\nSELECT name AS student_name, score AS exam_score\nFROM students;\n\n-- Table alias  \nSELECT s.name, c.title\nFROM students AS s\nJOIN courses AS c ON ...\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Use aliases to create a clean, readable report\nSELECT s.name        AS "Student Name",\n       s.city        AS "Home City",\n       s.grade       AS "Grade",\n       s.score       AS "Total Score",\n       s.score * 100 / 100 AS "Percentage"\nFROM   students AS s\nORDER  BY s.score DESC;`,
  points: ['Aliases exist only during the query — they are not saved', 'Use double quotes for aliases with spaces or special characters', 'Table aliases are essential for self-joins and multi-table queries', 'You cannot use a column alias in the same SELECT\'s WHERE clause (use subquery)'],
},

// ── JOINS & SETS ──────────────────────────────────────────────────────────────
{
  slug: 'sql-joins', title: 'SQL – Joins Overview', order: 28,
  desc: 'Understand how SQL joins combine rows from two or more tables using a matching condition.',
  intro: `When data is split across multiple tables, joins bring it back together. The fundamental idea: find rows in Table A and Table B where some column matches — usually a primary key and foreign key — and combine them into a single output row. Without joins, relational databases would be just a collection of isolated spreadsheets.

There are four main types of joins: \`INNER JOIN\`, \`LEFT JOIN\`, \`RIGHT JOIN\`, and \`FULL JOIN\`. Each answers a slightly different question about how to handle rows that have no match in the other table.`,
  concept: `**Join types at a glance**\n| Join | Returns |\n|---|---|\n| INNER JOIN | Only rows with matches in BOTH tables |\n| LEFT JOIN | All left rows + matching right rows |\n| RIGHT JOIN | All right rows + matching left rows |\n| FULL JOIN | All rows from both tables |`,
  setup: BASE_SETUP,
  query: `-- Combine students with their enrollment data\nSELECT s.name     AS student,\n       c.title    AS course,\n       e.status,\n       e.final_score\nFROM   enrollments e\nJOIN   students   s ON e.student_id = s.id\nJOIN   courses    c ON e.course_id  = c.id\nORDER  BY s.name;`,
  points: ['Joins use a matching condition (ON clause) to link tables', 'The most common join is INNER JOIN (often written as just JOIN)', 'Always specify ON conditions — missing them cause cartesian products', 'Multiple joins can be chained in a single query'],
},

{
  slug: 'sql-inner-join', title: 'SQL – INNER JOIN', order: 29,
  desc: 'Retrieve records that have matching values in both tables using INNER JOIN.',
  intro: `\`INNER JOIN\` returns only the rows where the join condition is satisfied in **both** tables. Rows that exist in one table but have no match in the other are completely excluded from the result. Think of it as the intersection of two circles in a Venn diagram — only the overlapping section.

This is the most common type of join and is simply written as \`JOIN\` (without the word INNER) in most queries, since inner is the default join behavior.`,
  concept: `**Venn diagram mental model**\n- Circle A = Table 1\n- Circle B = Table 2  \n- INNER JOIN = only the overlapping center\n- Rows with no partner in the other table are dropped`,
  setup: BASE_SETUP,
  query: `-- Only enrolled students (students with no enrollments are excluded)\nSELECT s.name,\n       c.title AS course,\n       e.status,\n       e.final_score\nFROM   students s\nINNER  JOIN enrollments e ON s.id   = e.student_id\nINNER  JOIN courses     c ON c.id   = e.course_id\nORDER  BY s.name, c.title;`,
  points: ['INNER JOIN = the default JOIN type — both words are equivalent', 'Only returns rows with matches in both tables', 'Unmatched rows (orphan records) are silently dropped', 'Great for finding records that have related data in another table'],
},

{
  slug: 'sql-left-join', title: 'SQL – LEFT JOIN', order: 30,
  desc: 'Keep all rows from the left table and fill in NULLs for non-matching rows in the right table.',
  intro: `\`LEFT JOIN\` (also called LEFT OUTER JOIN) keeps every row from the **left** table, regardless of whether a matching row exists in the right table. When there is no match in the right table, the right-side columns are filled with NULL. This is essential when you want to find records that are *missing* related data — e.g., students who have never enrolled in any course.`,
  concept: `**LEFT JOIN vs INNER JOIN**\n| Student | Enrollment | INNER | LEFT |\n|---|---|---|---|\n| Aria | SQL, Python | ✅ | ✅ |\n| Ben | Web Design | ✅ | ✅ |\n| Zara | (none) | ❌ | ✅ (NULLs) |`,
  setup: BASE_SETUP,
  query: `-- Find students who have NOT enrolled in course #4 (Data Science)\nSELECT s.name,\n       e.course_id,\n       e.status\nFROM   students s\nLEFT   JOIN enrollments e\n    ON s.id = e.student_id AND e.course_id = 4\nWHERE  e.course_id IS NULL;`,
  points: ['LEFT JOIN preserves every row from the left table', 'NULLs appear in right-side columns when there is no match', 'WHERE right_col IS NULL finds rows with no match (anti-join)', 'Table order matters: left table drives the result'],
},

{
  slug: 'sql-right-join', title: 'SQL – RIGHT JOIN', order: 31,
  desc: 'Preserve all rows from the right table using RIGHT JOIN, with NULLs for non-matching left rows.',
  intro: `\`RIGHT JOIN\` is the mirror of \`LEFT JOIN\` — it preserves every row from the **right** table whether or not a match exists in the left. Non-matching left columns are filled with NULL. In practice, most developers rewrite RIGHT JOINs as LEFT JOINs by swapping the table order, since LEFT JOIN is more intuitive and universally understood.

RIGHT JOIN is useful when you want to keep the "lookup" or "dimension" table complete — e.g., keeping all courses visible even if no student has enrolled in them yet.`,
  concept: `**Equivalent queries**\n\`\`\`sql\n-- RIGHT JOIN\nSELECT * FROM enrollments e\nRIGHT JOIN courses c ON c.id = e.course_id;\n\n-- Equivalent LEFT JOIN (just swap table order)\nSELECT * FROM courses c\nLEFT JOIN enrollments e ON c.id = e.course_id;\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- All courses, including those with zero enrollments\n-- (RIGHT JOIN keeping all courses)\nSELECT c.title         AS course,\n       c.price,\n       COUNT(e.student_id) AS enrolled_count\nFROM   enrollments e\nRIGHT  JOIN courses c ON c.id = e.course_id\nGROUP  BY c.title, c.price\nORDER  BY enrolled_count DESC;`,
  points: ['RIGHT JOIN keeps all rows from the right table', 'Equivalent to LEFT JOIN with swapped table order', 'SQLite supports RIGHT JOIN from version 3.39+', 'Most style guides prefer LEFT JOIN for consistency'],
},

{
  slug: 'sql-full-join', title: 'SQL – FULL JOIN', order: 32,
  desc: 'Combine all rows from both tables using FULL OUTER JOIN, showing NULLs where there is no match on either side.',
  intro: `\`FULL OUTER JOIN\` is the most inclusive join — it returns every row from both tables whether or not a match exists. Where the left table has no match, right columns are NULL. Where the right has no match, left columns are NULL. It is the union of a LEFT JOIN and a RIGHT JOIN.

SQLite does not natively support FULL OUTER JOIN, but you can emulate it perfectly using UNION ALL as shown below. This is a great example of problem-solving around database limitations.`,
  concept: `**Emulating FULL OUTER JOIN in SQLite**\n\`\`\`sql\n-- FULL JOIN = LEFT JOIN UNION ALL anti-join RIGHT\nSELECT * FROM a LEFT JOIN b ON a.id = b.id\nUNION ALL\nSELECT * FROM a RIGHT JOIN b ON a.id = b.id\nWHERE a.id IS NULL;\n\`\`\``,
  setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER);
INSERT INTO employees VALUES (1,'Alice',1),(2,'Bob',2),(3,'Carol',NULL),(4,'Dev',3);
CREATE TABLE departments (dept_id INTEGER PRIMARY KEY, dept_name TEXT);
INSERT INTO departments VALUES (1,'Engineering'),(2,'Marketing'),(4,'HR');`,
  query: `-- Emulate FULL OUTER JOIN: all employees and all departments\nSELECT e.name AS employee, d.dept_name AS department\nFROM employees e LEFT JOIN departments d ON e.dept_id = d.dept_id\nUNION ALL\nSELECT e.name, d.dept_name\nFROM employees e RIGHT JOIN departments d ON e.dept_id = d.dept_id\nWHERE e.id IS NULL;`,
  points: ['FULL JOIN returns every row from both tables', 'NULLs fill columns where no match exists on either side', 'SQLite emulates it with UNION of LEFT and RIGHT joins', 'Useful for finding all discrepancies between two datasets'],
},

{
  slug: 'sql-self-join', title: 'SQL – SELF JOIN', order: 33,
  desc: 'Join a table to itself to find relationships within the same dataset, such as employees and their managers.',
  intro: `A self-join is when a table joins to itself. It sounds paradoxical, but it is essential for hierarchical data — like an employees table where each employee has a manager who is also an employee in the same table. You must use aliases to differentiate the two "copies" of the same table.

Self-joins are also useful for finding pairs — students in the same city, products in the same price range, or any situation where you are comparing rows within a single table.`,
  concept: `**Self-join mental model**\n\`\`\`sql\n-- employees table has: id, name, manager_id\n-- manager_id references id in the SAME table\nSELECT e.name AS employee,\n       m.name AS manager\nFROM   employees e\nJOIN   employees m ON e.manager_id = m.id;\n\`\`\``,
  setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, city TEXT, manager_id INTEGER);
INSERT INTO employees VALUES (1,'Diana Prince','Mumbai',NULL),(2,'Clark Kent','Delhi',1),(3,'Bruce Wayne','Mumbai',1),(4,'Barry Allen','Delhi',2),(5,'Hal Jordan','Mumbai',2);`,
  query: `-- Find employees paired with coworkers from the same city\nSELECT a.name   AS employee1,\n       b.name   AS employee2,\n       a.city\nFROM   employees a\nJOIN   employees b\n    ON a.city = b.city AND a.id < b.id\nORDER  BY a.city, a.name;`,
  points: ['Self-join requires aliases (a and b) to tell the two copies apart', 'Use a.id < b.id to avoid duplicate pairs in pairing queries', 'Essential for hierarchical data: employees-managers, parent-children', 'Can be used with any join type: INNER, LEFT, etc.'],
},

{
  slug: 'sql-union', title: 'SQL – UNION', order: 34,
  desc: 'Stack results from two SELECT queries vertically using UNION, automatically removing duplicate rows.',
  intro: `\`UNION\` stacks the results of two SELECT statements on top of each other, as if you placed one table directly below another. Unlike a join (which adds columns horizontally), UNION adds rows vertically. Crucially, UNION automatically removes duplicate rows — if the same row appears in both queries, only one copy makes it into the output.

For UNION to work, both SELECT statements must have the **same number of columns** and **compatible data types** in corresponding positions.`,
  concept: `**UNION rules**\n- Both SELECTs must have the same column count\n- Corresponding columns must have compatible types\n- Column names come from the FIRST SELECT\n- Duplicates are removed automatically\n- Use UNION ALL to keep duplicates`,
  setup: BASE_SETUP,
  query: `-- Combine A-grade and active students into one list (no duplicates)\nSELECT s.name, s.city, 'A Grade' AS reason\nFROM   students s\nWHERE  s.grade = 'A'\n\nUNION\n\nSELECT s.name, s.city, 'Active Enrollment'\nFROM   students s\nJOIN   enrollments e ON s.id = e.student_id\nWHERE  e.status = 'active'\nORDER  BY name;`,
  points: ['UNION combines rows from two SELECT queries vertically', 'Duplicates are automatically removed (use UNION ALL to keep them)', 'Column count and types must match across both SELECTs', 'The final ORDER BY applies to the entire combined result'],
},

{
  slug: 'sql-union-all', title: 'SQL – UNION ALL', order: 35,
  desc: 'Combine results from multiple queries keeping all rows including duplicates using UNION ALL.',
  intro: `\`UNION ALL\` is identical to \`UNION\` except it does **not** remove duplicates. Every row from both queries appears in the output, even if it is identical to another row. This makes \`UNION ALL\` significantly faster than \`UNION\` because it skips the expensive duplicate-detection step.

Use \`UNION ALL\` when you know duplicates cannot exist (different tables with non-overlapping data), or when counting all occurrences is important — like a transaction log where the same entry appearing twice is meaningful.`,
  concept: `**Performance comparison**\n| | UNION | UNION ALL |\n|---|---|---|\n| Removes duplicates | ✅ Yes | ❌ No |\n| Extra sort/hash step | Yes | No |\n| Speed | Slower | Faster |\n| Use when | Data may overlap | Data is distinct |`,
  setup: `CREATE TABLE q1_sales (product TEXT, revenue REAL);
CREATE TABLE q2_sales (product TEXT, revenue REAL);
INSERT INTO q1_sales VALUES ('Laptop',150000),('Phone',80000),('Tablet',45000);
INSERT INTO q2_sales VALUES ('Laptop',175000),('Phone',90000),('Watch',30000);`,
  query: `-- Combine both quarters (UNION ALL preserves all rows)\nSELECT product, revenue, 'Q1' AS quarter FROM q1_sales\nUNION ALL\nSELECT product, revenue, 'Q2' AS quarter FROM q2_sales\nORDER BY product, quarter;`,
  points: ['UNION ALL keeps all rows including duplicates', 'Faster than UNION because it skips duplicate removal', 'Preferred when you know data sets do not overlap', 'Use UNION ALL when building audit trails or logging all events'],
},

// ── GROUPING & LOGIC ──────────────────────────────────────────────────────────
{
  slug: 'sql-group-by', title: 'SQL – GROUP BY', order: 36,
  desc: 'Group rows sharing a common value and apply aggregate functions to each group using GROUP BY.',
  intro: `\`GROUP BY\` is the mechanism that transforms row-level data into summaries. It collapses all rows sharing the same value in a specified column into a single group, and then aggregate functions (SUM, COUNT, AVG, etc.) compute a result for that group. Without GROUP BY, aggregate functions return a single value for the entire table.

Think of it like sorting physical files into folders — GROUP BY is the filing, and the aggregate functions then count or add up what is in each folder.`,
  concept: `**How GROUP BY works**\n\`\`\`\nBefore GROUP BY:          After GROUP BY city:\nAria   – Mumbai  94       Mumbai rows → avg 89.05\nHiro   – Mumbai  83       Delhi rows  → avg 78.2\nBen    – Delhi   78       ...\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Student statistics grouped by city\nSELECT city,\n       COUNT(*)             AS total_students,\n       ROUND(AVG(score),2)  AS avg_score,\n       MAX(score)           AS top_score\nFROM   students\nGROUP  BY city\nORDER  BY avg_score DESC;`,
  points: ['Every column in SELECT must either be in GROUP BY or be aggregated', 'GROUP BY is applied after WHERE and before HAVING', 'GROUP BY allows grouping on multiple columns (multi-level)', 'NULL values form their own group in GROUP BY'],
},

{
  slug: 'sql-having', title: 'SQL – HAVING', order: 37,
  desc: 'Filter grouped results using HAVING — the WHERE clause for aggregate functions.',
  intro: `\`WHERE\` cannot filter on aggregate functions — you cannot write \`WHERE COUNT(*) > 3\` because COUNT is calculated *after* rows are grouped. That is where \`HAVING\` comes in. It filters grouped results the same way WHERE filters individual rows — but it runs after grouping and aggregation.

A good memory trick: **WHERE** filters before grouping (on raw data), **HAVING** filters after grouping (on aggregate results). They can even appear in the same query together.`,
  concept: `**WHERE vs HAVING**\n\`\`\`sql\nSELECT city, AVG(score)\nFROM students\nWHERE  age > 20          -- Filters rows BEFORE grouping\nGROUP BY city\nHAVING AVG(score) > 80;  -- Filters groups AFTER aggregating\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Cities where the average student score exceeds 80\nSELECT city,\n       COUNT(*)             AS students,\n       ROUND(AVG(score),2)  AS avg_score\nFROM   students\nGROUP  BY city\nHAVING AVG(score) > 80\nORDER  BY avg_score DESC;`,
  points: ['HAVING filters GROUP BY results — WHERE filters individual rows', 'HAVING can use aggregate functions; WHERE cannot', 'HAVING runs after GROUP BY; WHERE runs before', 'Both WHERE and HAVING can exist in the same query'],
},

{
  slug: 'sql-exists', title: 'SQL – EXISTS', order: 38,
  desc: 'Check if a subquery returns any rows at all using the EXISTS operator for efficient conditional filtering.',
  intro: `\`EXISTS\` checks whether a subquery returns **at least one row**. If the subquery produces any result (even one), EXISTS evaluates to TRUE and the outer row passes the filter. It short-circuits — the moment one match is found, it stops looking. This makes EXISTS surprisingly fast for checking "is there any related data?"

A common use case: find all students who have at least one completed enrollment. You do not need to know the details of the enrollment, just whether one exists.`,
  concept: `**EXISTS vs IN**\n| | EXISTS | IN |\n|---|---|---|\n| Works with | Any subquery | Scalar list |\n| Returns | TRUE/FALSE | Matches value |\n| Performance on large | Often faster | Can be slower |\n| With NULLs | Safe | Tricky |`,
  setup: BASE_SETUP,
  query: `-- Find students who have at least one completed enrollment\nSELECT s.name, s.city, s.grade\nFROM   students s\nWHERE  EXISTS (\n  SELECT 1\n  FROM   enrollments e\n  WHERE  e.student_id = s.id\n    AND  e.status = 'completed'\n)\nORDER  BY s.name;`,
  points: ['EXISTS returns TRUE if subquery has any rows, FALSE otherwise', 'SELECT 1 in the subquery is a convention — the actual value does not matter', 'NOT EXISTS finds records with no matching related data', 'Often faster than IN when checking for existence in large datasets'],
},

{
  slug: 'sql-any', title: 'SQL – ANY', order: 39,
  desc: 'Compare a value against any value returned by a subquery using the ANY operator.',
  intro: `\`ANY\` (also written as \`SOME\`) compares a value against each value returned by a subquery and returns TRUE if the comparison is true for at least one of them. \`WHERE price > ANY (SELECT price FROM courses WHERE category = 'Design')\` means "return courses priced higher than at least one Design course."

ANY is less common than IN or EXISTS, but it shines when you need comparison operators (\`>\`, \`<\`, \`>=\`) against a dynamic set of values.`,
  concept: `**ANY with different operators**\n\`\`\`sql\n= ANY  -- equivalent to IN\n> ANY  -- greater than the minimum\n< ANY  -- less than the maximum\n>= ANY -- at least as large as the minimum\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Courses priced higher than at least one Design course\nSELECT title, category, price\nFROM   courses\nWHERE  price > ANY (\n  SELECT price FROM courses WHERE category = 'Design'\n)\nORDER  BY price;`,
  points: ['ANY returns TRUE if comparison is true for at least one subquery row', '= ANY is equivalent to IN', '> ANY means "greater than the minimum" value returned', 'SOME is a synonym for ANY in standard SQL'],
},

{
  slug: 'sql-all', title: 'SQL – ALL', order: 40,
  desc: 'Compare a value against every value returned by a subquery using the ALL operator.',
  intro: `\`ALL\` is the strict sibling of \`ANY\` — it requires the comparison to be true for **every** value returned by the subquery, not just one. \`WHERE price > ALL (SELECT price FROM courses WHERE category = 'Design')\` means "return courses more expensive than every Design course" — i.e., more expensive than even the priciest Design course.

Think of it this way: ANY passes if you beat *one* opponent, ALL passes only if you beat *all* opponents.`,
  concept: `**ALL vs ANY**\n| Operator | Passes when... |\n|---|---|\n| > ANY | Greater than the MIN of subquery values |\n| > ALL | Greater than the MAX of subquery values |\n| < ANY | Less than the MAX of subquery values |\n| < ALL | Less than the MIN of subquery values |`,
  setup: BASE_SETUP,
  query: `-- Courses more expensive than ALL Security courses\nSELECT title, category, price\nFROM   courses\nWHERE  price > ALL (\n  SELECT price FROM courses WHERE category = 'Security'\n)\nORDER  BY price DESC;`,
  points: ['ALL requires the comparison to hold true for every subquery row', '> ALL is equivalent to being greater than the MAX value', 'If subquery returns no rows, ALL is vacuously TRUE', 'If subquery returns a NULL, ALL comparisons become NULL/Unknown'],
},

{
  slug: 'sql-select-into', title: 'SQL – SELECT INTO / CREATE AS', order: 41,
  desc: 'Copy data from one table into a new table using SELECT INTO or CREATE TABLE AS SELECT.',
  intro: `\`SELECT INTO\` (SQL Server syntax) and \`CREATE TABLE AS SELECT\` (SQLite/MySQL/PostgreSQL syntax) let you create a new table and populate it with data from an existing table in a single operation. This is perfect for creating backups, snapshots, or derived reporting tables without running separate CREATE TABLE and INSERT statements.`,
  concept: `**Syntax differences by database**\n\`\`\`sql\n-- SQL Server\nSELECT * INTO students_backup FROM students;\n\n-- SQLite / PostgreSQL / MySQL\nCREATE TABLE students_backup AS\nSELECT * FROM students;\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Create a table of only A-grade students\nCREATE TABLE honor_roll AS\nSELECT name, city, score, grade\nFROM   students\nWHERE  grade = 'A';\n\nSELECT * FROM honor_roll;`,
  points: ['Creates a new table and populates it in one statement', 'SQLite/PostgreSQL use CREATE TABLE AS; SQL Server uses SELECT INTO', 'The new table copies column names and types from the source', 'Use for snapshots, backups, and staging tables in ETL pipelines'],
},

{
  slug: 'sql-insert-select', title: 'SQL – INSERT INTO SELECT', order: 42,
  desc: 'Copy rows from one table into another existing table using INSERT INTO ... SELECT.',
  intro: `While \`CREATE TABLE AS SELECT\` creates a brand new table, \`INSERT INTO ... SELECT\` copies rows into an **existing** table. This is the go-to pattern for data migration, ETL (Extract, Transform, Load) pipelines, and merging data from multiple sources into a reporting table.

The SELECT can include any filtering, joining, or transformation — you can reshape and filter data as it is being copied, not just do a straight duplicate.`,
  concept: `**Syntax**\n\`\`\`sql\nINSERT INTO destination_table (col1, col2)\nSELECT col1, col2\nFROM   source_table\nWHERE  condition;\n\`\`\`\nColumn count and types must be compatible.`,
  setup: `CREATE TABLE vip_students (id INTEGER PRIMARY KEY, name TEXT, score REAL, badge TEXT);
INSERT INTO vip_students VALUES (99,'Legacy Student',100,'Gold');

CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, city TEXT, score REAL, grade TEXT);
INSERT INTO students VALUES (1,'Aria Chen',22,'Mumbai',94.5,'A'),(2,'Ben Torres',19,'Delhi',78.2,'B'),(3,'Cleo Park',24,'Bangalore',88.0,'A'),(4,'Dev Patel',21,'Chennai',65.5,'C'),(5,'Eva Müller',20,'Hyderabad',91.3,'A');`,
  query: `-- Copy all A-grade students into the VIP table\nINSERT INTO vip_students (id, name, score, badge)\nSELECT id, name, score, 'Silver'\nFROM   students\nWHERE  grade = 'A';\n\nSELECT * FROM vip_students ORDER BY score DESC;`,
  points: ['Copies data into an existing table (unlike CREATE TABLE AS)', 'The SELECT can join, filter, and transform data', 'Column count must match between INSERT list and SELECT', 'Core pattern in ETL pipelines for loading data warehouses'],
},

{
  slug: 'sql-case', title: 'SQL – CASE', order: 43,
  desc: 'Write conditional logic directly inside SQL queries using the CASE expression — SQL\'s version of if-then-else.',
  intro: `\`CASE\` is SQL's built-in conditional expression — it works like an if-else chain inside any SELECT, WHERE, or ORDER BY clause. You can use it to create new computed columns, assign category labels, transform values, or even sort rows by custom logic not directly stored in any column.

There are two forms: **searched CASE** (which evaluates any boolean condition) and **simple CASE** (which compares one value to a list). Both output a single value based on whichever condition matches first.`,
  concept: `**Two CASE forms**\n\`\`\`sql\n-- Searched CASE (most flexible)\nCASE\n  WHEN score >= 90 THEN 'Outstanding'\n  WHEN score >= 75 THEN 'Good'\n  ELSE 'Needs Work'\nEND\n\n-- Simple CASE\nCASE grade\n  WHEN 'A' THEN 'Excellent'\n  WHEN 'B' THEN 'Good'\n  ELSE 'Other'\nEND\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Assign performance tier labels to each student\nSELECT name, score, grade,\n  CASE\n    WHEN score >= 90 THEN '🏆 Outstanding'\n    WHEN score >= 80 THEN '⭐ Excellent'\n    WHEN score >= 70 THEN '👍 Good'\n    WHEN score >= 60 THEN '📚 Average'\n    ELSE '⚠️ Needs Improvement'\n  END AS performance_tier\nFROM  students\nORDER BY score DESC;`,
  points: ['CASE can appear in SELECT, WHERE, ORDER BY, and HAVING', 'Conditions are evaluated top-to-bottom — first match wins', 'ELSE catches anything not matched by the WHEN clauses', 'Omitting ELSE returns NULL for unmatched rows'],
},

{
  slug: 'sql-null-functions', title: 'SQL – NULL Functions', order: 44,
  desc: 'Handle NULL values elegantly using COALESCE, NULLIF, IFNULL, and other NULL-managing functions.',
  intro: `SQL provides several functions specifically designed to handle the awkwardness of NULL values in real data. The most important is \`COALESCE()\` — it scans a list of expressions and returns the first non-NULL value. This is indispensable for providing "default" values in reports where some fields may be empty.

\`NULLIF(a, b)\` is the opposite — it returns NULL if the two values are equal, otherwise returns the first value. It is frequently used to avoid division-by-zero errors by converting zero denominators to NULL.`,
  concept: `**Key NULL functions**\n| Function | What it does |\n|---|---|\n| COALESCE(a,b,c) | First non-NULL value |\n| NULLIF(a,b) | NULL if a=b, else a |\n| IFNULL(col,default) | SQLite: a or default |\n| ISNULL(col,default) | SQL Server version |`,
  setup: BASE_SETUP,
  query: `-- Show final scores, replacing NULL with 'Not graded yet'\nSELECT s.name,\n       c.title,\n       COALESCE(CAST(e.final_score AS TEXT), 'Pending') AS final_score,\n       e.status\nFROM   enrollments e\nJOIN   students   s ON s.id = e.student_id\nJOIN   courses    c ON c.id = e.course_id\nORDER  BY s.name;`,
  points: ['COALESCE returns the first non-NULL in a list of arguments', 'NULLIF(a,b) prevents division by zero: val / NULLIF(qty,0)', 'IFNULL is SQLite-specific shorthand for COALESCE with one fallback', 'Chain COALESCE across multiple columns to find the first available value'],
},

// ── ADVANCED ──────────────────────────────────────────────────────────────────
{
  slug: 'sql-stored-procedures', title: 'SQL – Stored Procedures', order: 45,
  desc: 'Understand stored procedures — named, reusable SQL programs stored in the database server.',
  intro: `A **stored procedure** is a named collection of SQL statements saved inside the database itself. Instead of sending a long SQL query from your application every time, you simply call the procedure by name and pass any required parameters. The database executes the stored logic directly — faster, more secure, and reusable.

SQLite does not support stored procedures (it uses application-level logic instead), but MySQL, PostgreSQL, and SQL Server do. Below we simulate the concept using a CTE-based approach that demonstrates the same reusable computation pattern.`,
  concept: `**MySQL / PostgreSQL syntax**\n\`\`\`sql\nCREATE PROCEDURE GetTopStudents(IN min_score REAL)\nBEGIN\n  SELECT name, score\n  FROM students\n  WHERE score >= min_score\n  ORDER BY score DESC;\nEND;\n\n-- Calling it:\nCALL GetTopStudents(85);\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Simulate a "stored procedure" using a CTE\n-- In MySQL/PG you would CALL GetStudentReport(85)\nWITH top_students AS (\n  SELECT name, city, score, grade\n  FROM   students\n  WHERE  score >= 85\n)\nSELECT *, 'High Performer' AS category\nFROM   top_students\nORDER  BY score DESC;`,
  points: ['Stored procedures are saved SQL programs in the database', 'They accept parameters and can contain flow control (IF, LOOP)', 'Reduce network round-trips between app and database', 'SQLite uses application logic instead; MySQL/PG/SQL Server support them fully'],
},

{
  slug: 'sql-comments', title: 'SQL – Comments', order: 46,
  desc: 'Add explanatory notes to your SQL code using single-line and multi-line comment syntax.',
  intro: `Good SQL code is thoroughly commented, especially in complex stored procedures, views, and multi-join queries. SQL supports two comment styles: **single-line** comments starting with \`--\` (everything after the dashes is ignored), and **multi-line** comments enclosed between \`/*\` and \`*/\`.

Comments are invisible to the SQL engine — they exist purely for humans. Use them to explain *why* a query does something, not just *what* it does. The "what" is usually apparent from the code; the "why" requires context.`,
  concept: `**Comment styles**\n\`\`\`sql\n-- This is a single-line comment\n\nSELECT name -- you can comment mid-line too\nFROM students;\n\n/*\n  This is a multi-line comment.\n  Useful for documenting complex logic or\n  temporarily disabling blocks of SQL.\n*/\n\`\`\``,
  setup: BASE_SETUP,
  query: `/*\n  Query: Student Leaderboard Report\n  Author: CodesCompiler Academy\n  Purpose: Shows top 5 students with performance tiers\n*/\nSELECT\n  name,      -- Student full name\n  city,      -- Home location\n  score,     -- Final exam score\n  grade      -- Letter grade assigned\nFROM students\nORDER BY score DESC -- Highest first\nLIMIT 5; -- Top 5 only`,
  points: ['-- is the standard single-line comment in all SQL dialects', '/* */ wraps multi-line comments', 'Comments are stripped by the parser — zero performance impact', 'Use comments to explain business logic, not just repeat the code'],
},

{
  slug: 'sql-operators', title: 'SQL – Operators', order: 47,
  desc: 'Master all SQL operators — arithmetic, comparison, logical, string, and bitwise — for precise query control.',
  intro: `SQL operators are the building blocks of conditions and expressions. Knowing all of them gives you precision and power in your queries. Beyond the basics (\`=\`, \`>\`, \`AND\`), SQL includes arithmetic operators for calculations, string concatenation, range and list operators, and even bitwise operators for binary data.

Understanding operator precedence is critical — \`AND\` always binds tighter than \`OR\`, meaning \`A OR B AND C\` is evaluated as \`A OR (B AND C)\`. When in doubt, use parentheses to make your intent explicit.`,
  concept: `**Operator Categories**\n| Type | Examples |\n|---|---|\n| Arithmetic | + - * / % |\n| Comparison | = != < > <= >= |\n| Logical | AND OR NOT |\n| Range | BETWEEN, IN, LIKE |\n| Null | IS NULL, IS NOT NULL |\n| String | \\|\\| (concatenate in SQLite) |`,
  setup: BASE_SETUP,
  query: `-- Operators in action: arithmetic + comparison + logical\nSELECT name,\n       score,\n       score * 1.1                          AS boosted_score,\n       ROUND(score / 100 * 4.0, 2)          AS gpa_equivalent,\n       name || ' from ' || city             AS full_label\nFROM   students\nWHERE  score >= 70 AND city != 'Kolkata'\nORDER  BY score DESC;`,
  points: ['AND has higher precedence than OR — use parentheses for clarity', '|| is SQLite\'s string concatenation operator (+ in SQL Server)', 'Arithmetic operators work on numeric columns directly in SELECT', 'Modulus (%) returns the remainder of division'],
},

// ── DATABASE & TABLES ──────────────────────────────────────────────────────────
{
  slug: 'sql-database', title: 'SQL – Databases', order: 48,
  desc: 'Understand what a SQL database is, how databases contain tables, and how to organize data effectively.',
  intro: `A **database** is the top-level container in a relational database management system (RDBMS). It holds tables, views, indexes, stored procedures, and more — all logically grouped under one roof. A company might have separate databases for their application data, analytics warehouse, and audit logs.

Think of a database like a filing cabinet: inside are multiple folders (tables), and inside each folder are individual documents (rows). The database management system (MySQL, PostgreSQL, SQLite) is the cabinet itself — the software that organizes, stores, and retrieves everything efficiently.`,
  concept: `**Database hierarchy**\n\`\`\`\nDatabase Server (MySQL, PostgreSQL)\n└── Database: "codescompiler_academy"\n    ├── Table: students\n    ├── Table: courses\n    ├── Table: enrollments\n    └── View: top_students_view\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- In SQLite, list all tables in the current database\nSELECT name AS table_name,\n       type\nFROM   sqlite_master\nWHERE  type = 'table'\nORDER  BY name;`,
  points: ['A database groups related tables, views, and indexes together', 'Different databases on the same server are fully isolated', 'SQLite stores an entire database in a single .db file', 'Most RDBMS allow multiple databases per server instance'],
},

{
  slug: 'sql-create-db', title: 'SQL – Create Database', order: 49,
  desc: 'Create a new database using the CREATE DATABASE statement and understand how database creation works.',
  intro: `The first step in any new project is creating a dedicated database to hold all your data. \`CREATE DATABASE\` is the command used in MySQL and PostgreSQL. In SQLite, simply opening a connection to a new file path automatically creates that database file.

Best practices for naming: use lowercase with underscores (\`online_store\`, \`hr_system\`), avoid spaces and special characters, and make the name descriptive. The database name is permanent and changing it later requires migrating all data.`,
  concept: `**Syntax by database**\n\`\`\`sql\n-- MySQL / SQL Server\nCREATE DATABASE academy_db;\nUSE academy_db;\n\n-- PostgreSQL\nCREATE DATABASE academy_db;\n\n-- SQLite\n-- Just open/connect to a new .db file path\n\`\`\``,
  setup: ``,
  query: `-- In SQLite, we simulate CREATE DATABASE behavior\n-- by creating a schema with multiple tables together.\n-- This creates the entire "academy" database structure:\n\nCREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, grade TEXT);\nCREATE TABLE courses  (id INTEGER PRIMARY KEY, title TEXT, price REAL);\nCREATE TABLE instructors (id INTEGER PRIMARY KEY, name TEXT, rating REAL);\n\n-- Verify all tables exist:\nSELECT name FROM sqlite_master WHERE type='table';`,
  points: ['MySQL/PostgreSQL use CREATE DATABASE; SQLite uses file creation', 'Database names should be lowercase with underscores', 'CREATE DATABASE IF NOT EXISTS prevents errors on re-runs', 'Always USE or connect to the database before running queries on it'],
},

{
  slug: 'sql-drop-db', title: 'SQL – Drop Database', order: 50,
  desc: 'Permanently delete an entire database and all its contents using the DROP DATABASE statement.',
  intro: `\`DROP DATABASE\` permanently and irreversibly deletes an entire database — every table, every row of data, every view and index inside it. This is one of the most destructive commands in SQL and should only be used with extreme caution in production environments.

In production, this operation typically requires elevated permissions, active connection termination, and often a double-confirmation mechanism. Always back up your database before dropping it, and use \`IF EXISTS\` to avoid errors when the database does not exist.`,
  concept: `**Syntax (MySQL/PostgreSQL)**\n\`\`\`sql\n-- Safe form\nDROP DATABASE IF EXISTS old_db;\n\n-- Without IF EXISTS — errors if db not found\nDROP DATABASE old_db;\n\`\`\`\n> ⚠️ There is NO undo. This is permanent.`,
  setup: ``,
  query: `-- Simulate DROP DB by creating and dropping a table\n-- (SQLite has no separate databases to drop)\nCREATE TABLE temp_data (id INTEGER, value TEXT);\nINSERT INTO temp_data VALUES (1,'alpha'),(2,'beta');\n\n-- Verify it exists first\nSELECT name FROM sqlite_master WHERE type='table';\n\n-- Now drop it\nDROP TABLE IF EXISTS temp_data;\n\n-- Verify it is gone\nSELECT name FROM sqlite_master WHERE type='table';`,
  points: ['DROP DATABASE permanently deletes everything — no undo', 'Always back up before dropping any database', 'IF EXISTS prevents errors when the target does not exist', 'In SQLite, "dropping the database" means deleting the .db file'],
},

{
  slug: 'sql-backup-db', title: 'SQL – Backup Database', order: 51,
  desc: 'Learn the strategies and commands used to back up and restore SQL databases to protect against data loss.',
  intro: `A database backup is a snapshot of your data at a specific point in time. Without regular backups, a single corrupted query, hardware failure, or accidental DROP could permanently erase months of data. Every production system must have an automated backup strategy.

There are three common backup types: **full backup** (complete copy), **differential backup** (changes since last full backup), and **incremental backup** (changes since last backup of any type). Most teams use full daily backups with hourly incrementals for critical systems.`,
  concept: `**Backup commands by database**\n\`\`\`bash\n# MySQL\nmysqldump -u root -p academy_db > backup.sql\n\n# PostgreSQL\npg_dump academy_db > backup.sql\n\n# SQLite (file copy)\ncp academy.db academy_backup_2024.db\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Simulate a backup-to-table strategy\n-- (Common in analytics: archive snapshots)\nCREATE TABLE students_snapshot_2024 AS\nSELECT *, date('now') AS snapshot_date\nFROM students;\n\nSELECT * FROM students_snapshot_2024;`,
  points: ['Back up databases regularly — daily at minimum for production', 'Test your backups by actually restoring them periodically', 'Store backups off-site or in cloud storage', 'Use transactions to ensure consistency during backup'],
},

{
  slug: 'sql-create-table', title: 'SQL – CREATE TABLE', order: 52,
  desc: 'Define the structure of a new database table using CREATE TABLE with column names, data types, and constraints.',
  intro: `\`CREATE TABLE\` defines the structure of a new table — column names, their data types, and any constraints. Getting table design right at the start is critical; changing table structures later (adding columns, changing types) in a live database can be complex and risky.

The key decisions: choosing appropriate data types for each column, identifying the primary key, and deciding which columns should allow NULL values. Good table design is the foundation of a fast, reliable database.`,
  concept: `**Common SQL data types**\n| Type | Used for |\n|---|---|\n| INTEGER / INT | Whole numbers |\n| REAL / DECIMAL | Decimal numbers |\n| TEXT / VARCHAR | Character strings |\n| BLOB | Binary data |\n| DATE / DATETIME | Temporal values |`,
  setup: ``,
  query: `-- Design a full e-commerce products table\nCREATE TABLE products (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  sku         TEXT    NOT NULL UNIQUE,\n  name        TEXT    NOT NULL,\n  category    TEXT    DEFAULT 'General',\n  price       REAL    NOT NULL CHECK (price > 0),\n  stock_qty   INTEGER DEFAULT 0,\n  is_active   INTEGER DEFAULT 1,\n  created_at  TEXT    DEFAULT (date('now'))\n);\n\n-- Insert a test product\nINSERT INTO products (sku, name, category, price, stock_qty)\nVALUES ('PRD-001', 'Wireless Headphones', 'Electronics', 4999, 150);\n\nSELECT * FROM products;`,
  points: ['Always define a PRIMARY KEY for every table', 'NOT NULL prevents empty values where data is required', 'DEFAULT sets a fallback value for omitted columns', 'CHECK constraints validate data at the database level'],
},

{
  slug: 'sql-drop-table', title: 'SQL – DROP TABLE', order: 53,
  desc: 'Permanently remove a table and all of its data using the DROP TABLE statement.',
  intro: `\`DROP TABLE\` permanently deletes the entire table structure and every row of data inside it. Unlike \`DELETE\`, which removes rows but keeps the empty table, DROP removes the table itself completely — column definitions, indexes, and all. Recovery requires restoring from a backup.

In development environments, DROP TABLE is used frequently for rebuilding schema during iteration. In production, it should be used with extreme caution and always within a change management process.`,
  concept: `**DROP vs TRUNCATE vs DELETE**\n| | DROP | TRUNCATE | DELETE |\n|---|---|---|---|\n| Removes rows | ✅ | ✅ | ✅ |\n| Removes structure | ✅ | ❌ | ❌ |\n| Resettable | ❌ | ❌† | ✅ |\n| Triggers fire | ❌ | ❌ | ✅ |`,
  setup: `CREATE TABLE scratch_data (id INTEGER, note TEXT);
INSERT INTO scratch_data VALUES (1,'temp'),(2,'scratch'),(3,'delete me');`,
  query: `-- Confirm table exists\nSELECT * FROM scratch_data;\n\n-- Drop it safely\nDROP TABLE IF EXISTS scratch_data;\n\n-- Verify it no longer exists\nSELECT name FROM sqlite_master WHERE type='table';`,
  points: ['DROP TABLE removes the table AND all its data permanently', 'IF EXISTS prevents an error if the table does not exist', 'Cannot DROP a table that other tables reference via foreign keys', 'Use DELETE to remove rows; DROP to remove the entire table'],
},

{
  slug: 'sql-alter-table', title: 'SQL – ALTER TABLE', order: 54,
  desc: 'Modify an existing table structure using ALTER TABLE to add, drop, or rename columns.',
  intro: `\`ALTER TABLE\` lets you modify the schema of an existing table without losing existing data. Common operations include adding a new column (as your application evolves), renaming columns, changing data types, or dropping obsolete columns. 

In SQLite, ALTER TABLE has limited support — it allows adding columns and renaming tables/columns, but not dropping columns or changing types (those require recreating the table). Other databases like MySQL and PostgreSQL support the full range of ALTER operations.`,
  concept: `**Common ALTER operations**\n\`\`\`sql\n-- Add a column\nALTER TABLE students ADD COLUMN email TEXT;\n\n-- Rename a column (SQLite 3.25+)\nALTER TABLE students RENAME COLUMN age TO student_age;\n\n-- Drop a column (MySQL/PostgreSQL)\nALTER TABLE students DROP COLUMN old_col;\n\`\`\``,
  setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, salary REAL);
INSERT INTO employees VALUES (1,'Alice',75000),(2,'Bob',68000),(3,'Carol',82000);`,
  query: `-- Add new columns to an existing table\nALTER TABLE employees ADD COLUMN department TEXT DEFAULT 'General';\nALTER TABLE employees ADD COLUMN hire_year INTEGER DEFAULT 2024;\n\n-- Update some values in the new columns\nUPDATE employees SET department = 'Engineering' WHERE id IN (1,3);\nUPDATE employees SET department = 'Marketing' WHERE id = 2;\n\nSELECT * FROM employees;`,
  points: ['ALTER TABLE modifies structure without losing existing data', 'New columns added via ALTER cannot have NOT NULL without a DEFAULT', 'SQLite supports ADD COLUMN and RENAME but not DROP COLUMN', 'Always test ALTER operations on a backup first in production'],
},

// ── CONSTRAINTS ───────────────────────────────────────────────────────────────
{
  slug: 'sql-constraints', title: 'SQL – Constraints', order: 55,
  desc: 'Protect data integrity using SQL constraints — rules enforced at the database level on table columns.',
  intro: `Constraints are rules defined on a column (or table) that the database enforces automatically. They ensure data integrity — preventing invalid, inconsistent, or nonsensical data from ever entering the database. Rather than relying on your application code to validate every input, constraints build that validation directly into the database schema.

The main constraints are: NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK, and DEFAULT. Each plays a distinct protective role.`,
  concept: `**Constraint overview**\n| Constraint | Protection it provides |\n|---|---|\n| NOT NULL | Value cannot be empty |\n| UNIQUE | No two rows can have the same value |\n| PRIMARY KEY | Unique + not null identifier |\n| FOREIGN KEY | Must match a value in another table |\n| CHECK | Must satisfy a custom condition |\n| DEFAULT | Provides a fallback value |`,
  setup: ``,
  query: `-- Table with all major constraints applied\nCREATE TABLE library_books (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  isbn        TEXT    NOT NULL UNIQUE,\n  title       TEXT    NOT NULL,\n  author      TEXT    NOT NULL,\n  year        INTEGER CHECK (year BETWEEN 1450 AND 2100),\n  copies      INTEGER DEFAULT 1 CHECK (copies >= 0),\n  genre       TEXT    DEFAULT 'General'\n);\n\nINSERT INTO library_books (isbn, title, author, year, copies)\nVALUES ('978-3-16-148410-0', 'SQL Mastery', 'Ada Lovelace', 2023, 5);\n\nSELECT * FROM library_books;`,
  points: ['Constraints are enforced by the DB engine — more reliable than app-level validation', 'Multiple constraints can be applied to a single column', 'Violations raise an error and prevent the INSERT/UPDATE', 'Constraints make schema self-documenting — readers see the rules immediately'],
},

{
  slug: 'sql-not-null', title: 'SQL – NOT NULL', order: 56,
  desc: 'Require a column to always have a value using the NOT NULL constraint.',
  intro: `The \`NOT NULL\` constraint ensures a column can never have a NULL value — every row must provide an actual value for that column. Without NOT NULL, any column defaults to being nullable, and missing values silently become NULL, which can cause subtle bugs in calculations and reports.

Apply NOT NULL to columns that are essential to a record's meaning. A student row without a name, an order without a customer ID, or a product without a price — these are fundamentally incomplete records and should be rejected at the database level.`,
  concept: `**NULL vs NOT NULL column behavior**\n\`\`\`sql\n-- Nullable column (default)\nCREATE TABLE example (middle_name TEXT);\n\n-- Required column\nCREATE TABLE example (first_name TEXT NOT NULL);\n\n-- Inserting NULL into NOT NULL column raises an error:\nINSERT INTO example (first_name) VALUES (NULL); -- ❌ Error\n\`\`\``,
  setup: ``,
  query: `-- Create a table with NOT NULL constraints\nCREATE TABLE user_accounts (\n  id       INTEGER PRIMARY KEY,\n  username TEXT    NOT NULL,\n  email    TEXT    NOT NULL,\n  password TEXT    NOT NULL,\n  bio      TEXT    -- nullable, optional\n);\n\nINSERT INTO user_accounts VALUES (1,'aria_chen','aria@dev.io','hashed_pw','SQL enthusiast');\nINSERT INTO user_accounts VALUES (2,'ben_torres','ben@dev.io','hashed_pw2', NULL);\n\nSELECT * FROM user_accounts;`,
  points: ['NOT NULL prevents any row from having an empty value in that column', 'ALL columns default to nullable unless NOT NULL is specified', 'Adding NOT NULL to an existing column requires all rows to have values', 'Combine NOT NULL with DEFAULT to auto-fill required fields'],
},

{
  slug: 'sql-unique', title: 'SQL – UNIQUE', order: 57,
  desc: 'Enforce that all values in a column (or combination of columns) are distinct using the UNIQUE constraint.',
  intro: `The \`UNIQUE\` constraint ensures no two rows in a table share the same value in the specified column. This is the perfect tool for enforcing natural identifiers — usernames, email addresses, SKUs, license plates — where every entry must be one-of-a-kind.

Unlike a PRIMARY KEY, a UNIQUE column can contain NULL values (and typically multiple NULLs are allowed, since NULL ≠ NULL in SQL). You can also create composite UNIQUE constraints spanning multiple columns — e.g., ensuring no student can enroll twice in the same course.`,
  concept: `**UNIQUE variations**\n\`\`\`sql\n-- Single column unique\nCREATE TABLE users (email TEXT UNIQUE);\n\n-- Composite unique (two columns together must be unique)\nCREATE TABLE enrollments (\n  student_id INTEGER,\n  course_id  INTEGER,\n  UNIQUE (student_id, course_id)\n);\n\`\`\``,
  setup: ``,
  query: `-- UNIQUE prevents duplicate usernames and emails\nCREATE TABLE members (\n  id       INTEGER PRIMARY KEY,\n  username TEXT    NOT NULL UNIQUE,\n  email    TEXT    NOT NULL UNIQUE,\n  tier     TEXT    DEFAULT 'Free'\n);\n\nINSERT INTO members VALUES (1,'aria_sql','aria@code.io','Pro');\nINSERT INTO members VALUES (2,'ben_dev','ben@code.io','Free');\n\nSELECT * FROM members;\n\n-- Uncommenting the next line would fail (duplicate username):\n-- INSERT INTO members VALUES (3,'aria_sql','new@email.io','Free');`,
  points: ['UNIQUE prevents duplicate values in the constrained column', 'Multiple UNIQUE constraints are allowed on the same table', 'NULL values are typically exempt from uniqueness checks', 'Composite UNIQUE spans multiple columns: the combination must be unique'],
},

{
  slug: 'sql-primary-key', title: 'SQL – PRIMARY KEY', order: 58,
  desc: 'Uniquely identify every row in a table using the PRIMARY KEY constraint.',
  intro: `Every table should have a **primary key** — a column (or set of columns) whose values uniquely identify each row. The PRIMARY KEY constraint combines UNIQUE and NOT NULL automatically: every value must be present and unique. It also creates an index behind the scenes, making lookups by primary key extremely fast.

The most common pattern is a synthetic integer primary key with AUTOINCREMENT (or IDENTITY), which the database generates automatically. This avoids relying on real-world data (like names or emails) that might change or have duplicates.`,
  concept: `**Natural vs Surrogate keys**\n| | Natural Key | Surrogate Key |\n|---|---|---|\n| Example | email, ISBN | id INTEGER |\n| Stable? | May change | Always stable |\n| Meaningful? | Yes | No (just a number) |\n| Preferred? | Sometimes | Usually ✅ |`,
  setup: ``,
  query: `-- Surrogate primary key with AUTOINCREMENT\nCREATE TABLE projects (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  title       TEXT    NOT NULL,\n  team_lead   TEXT    NOT NULL,\n  deadline    TEXT,\n  status      TEXT    DEFAULT 'Planning'\n);\n\nINSERT INTO projects (title, team_lead, deadline)\nVALUES ('API Redesign', 'Aria Chen', '2024-06-30'),\n       ('Mobile App', 'Ben Torres', '2024-09-01'),\n       ('Data Pipeline', 'Cleo Park', '2024-04-15');\n\nSELECT * FROM projects;`,
  points: ['PRIMARY KEY = NOT NULL + UNIQUE + fast lookup index', 'Every table should have exactly one primary key', 'AUTOINCREMENT generates the next ID automatically on insert', 'Composite PKs use multiple columns: PRIMARY KEY (col1, col2)'],
},

{
  slug: 'sql-foreign-key', title: 'SQL – FOREIGN KEY', order: 59,
  desc: 'Link tables together and enforce referential integrity using FOREIGN KEY constraints.',
  intro: `A **foreign key** is a column that references the primary key of another table, creating a guaranteed link between related records. The FOREIGN KEY constraint enforces **referential integrity** — it prevents orphaned records (e.g., an enrollment referencing a student that doesn't exist) and prevents accidentally deleting a parent record that still has children.

In SQLite, foreign keys must be explicitly enabled per connection with \`PRAGMA foreign_keys = ON;\` — they are off by default for backward compatibility.`,
  concept: `**ON DELETE actions**\n| Option | What happens to children when parent is deleted |\n|---|---|\n| CASCADE | Children are also deleted automatically |\n| SET NULL | Child foreign key becomes NULL |\n| RESTRICT | Delete blocked if children exist |\n| NO ACTION | Default — similar to RESTRICT |`,
  setup: ``,
  query: `PRAGMA foreign_keys = ON;\n\nCREATE TABLE departments (\n  id   INTEGER PRIMARY KEY,\n  name TEXT NOT NULL UNIQUE\n);\n\nCREATE TABLE staff (\n  id      INTEGER PRIMARY KEY,\n  name    TEXT NOT NULL,\n  dept_id INTEGER REFERENCES departments(id) ON DELETE SET NULL\n);\n\nINSERT INTO departments VALUES (1,'Engineering'),(2,'Design'),(3,'Analytics');\nINSERT INTO staff VALUES (1,'Alice',1),(2,'Bob',2),(3,'Carol',1),(4,'Dev',3);\n\nSELECT s.name, d.name AS department\nFROM staff s\nJOIN departments d ON s.dept_id = d.id;`,
  points: ['Foreign keys link child rows to valid parent rows', 'Prevents orphaned records and broken references', 'SQLite requires PRAGMA foreign_keys = ON; to enforce them', 'ON DELETE CASCADE auto-removes children when the parent is deleted'],
},

{
  slug: 'sql-check', title: 'SQL – CHECK Constraint', order: 60,
  desc: 'Enforce custom business rules at the database level using CHECK constraints on column values.',
  intro: `The \`CHECK\` constraint lets you define custom validation rules directly in the database schema. Any INSERT or UPDATE that would set a column to a value violating the condition is rejected with an error. This is business logic baked into your data layer.

CHECK constraints can reference other columns in the same row, making them capable of cross-column validation — like ensuring an end date is always after a start date.`,
  concept: `**CHECK examples**\n\`\`\`sql\nscore REAL CHECK (score BETWEEN 0 AND 100)\nage   INTEGER CHECK (age >= 18)\nprice REAL CHECK (price > 0)\ngender TEXT CHECK (gender IN ('M','F','NB','X'))\n-- Cross-column:\nCHECK (end_date > start_date)\n\`\`\``,
  setup: ``,
  query: `CREATE TABLE events (\n  id         INTEGER PRIMARY KEY,\n  title      TEXT    NOT NULL,\n  start_date TEXT    NOT NULL,\n  end_date   TEXT    NOT NULL,\n  capacity   INTEGER CHECK (capacity BETWEEN 10 AND 50000),\n  ticket_price REAL  CHECK (ticket_price >= 0),\n  CHECK (end_date >= start_date)\n);\n\nINSERT INTO events VALUES\n  (1,'SQL Summit','2024-09-01','2024-09-03',500,999.00),\n  (2,'Hackathon','2024-10-15','2024-10-17',200,0.00);\n\nSELECT * FROM events;`,
  points: ['CHECK validates data at insert and update time', 'Can reference multiple columns in the same row', 'Failed CHECK raises an error automatically', 'More reliable than application-level validation alone'],
},

{
  slug: 'sql-default', title: 'SQL – DEFAULT', order: 61,
  desc: 'Set automatic fallback values for columns when no value is provided on insert using DEFAULT.',
  intro: `The \`DEFAULT\` constraint specifies a value to use when an INSERT statement does not provide one for that column. Defaults reduce boilerplate, prevent accidental NULLs, and make inserts simpler by allowing you to omit optional column values entirely.

Defaults can be static literals ("General", 0, TRUE) or dynamic expressions like \`date('now')\` for a timestamp or \`LOWER()\` for automatic formatting. They make schemas more self-service and reduce bugs from forgetting to set routine values.`,
  concept: `**Useful default patterns**\n\`\`\`sql\nstatus      TEXT    DEFAULT 'pending'\ncreated_at  TEXT    DEFAULT (datetime('now'))\nis_active   INTEGER DEFAULT 1\npriority    INTEGER DEFAULT 5\ncountry     TEXT    DEFAULT 'IN'\n\`\`\``,
  setup: ``,
  query: `CREATE TABLE support_tickets (\n  id          INTEGER PRIMARY KEY AUTOINCREMENT,\n  title       TEXT    NOT NULL,\n  status      TEXT    DEFAULT 'open',\n  priority    INTEGER DEFAULT 3,\n  created_at  TEXT    DEFAULT (date('now')),\n  resolved_at TEXT    -- no default, NULL until resolved\n);\n\n-- Insert without specifying optional columns\nINSERT INTO support_tickets (title) VALUES ('Login page broken');\nINSERT INTO support_tickets (title, priority) VALUES ('Slow API',1);\nINSERT INTO support_tickets (title, status, priority)\n  VALUES ('Missing email', 'in_progress', 2);\n\nSELECT * FROM support_tickets;`,
  points: ['DEFAULT provides automatic values when a column is omitted from INSERT', 'Dynamic defaults like date(\'now\') run at insert time', 'DEFAULT values can be overridden by providing an explicit value', 'Combine DEFAULT with NOT NULL to guarantee a value is always present'],
},

// ── PERFORMANCE & EXTRAS ──────────────────────────────────────────────────────
{
  slug: 'sql-index', title: 'SQL – Indexes', order: 62,
  desc: 'Speed up query performance dramatically by creating indexes on frequently searched columns.',
  intro: `An **index** is a separate data structure that the database maintains alongside a table to speed up lookups. Think of a book's index at the back — instead of reading every page to find "photosynthesis," you jump directly to page 247. Database indexes work the same way, allowing the engine to find rows matching a WHERE condition without scanning every row.

The trade-off: indexes speed up reads but slightly slow down writes (INSERT, UPDATE, DELETE) because the index must be updated along with the table. Index the columns you query most frequently; leave rarely-queried columns unindexed.`,
  concept: `**When to create an index**\n✅ Columns used in WHERE conditions\n✅ Columns used in JOIN ON clauses\n✅ Columns used in ORDER BY\n❌ Columns rarely filtered on\n❌ Very small tables (full scan is fine)\n❌ Columns with very low cardinality (e.g., boolean)`,
  setup: BASE_SETUP,
  query: `-- Create indexes on frequently queried columns\nCREATE INDEX idx_students_city  ON students (city);\nCREATE INDEX idx_students_grade ON students (grade);\nCREATE INDEX idx_students_score ON students (score DESC);\n\n-- Now list all indexes in the database\nSELECT name, tbl_name, sql\nFROM   sqlite_master\nWHERE  type = 'index'\nORDER  BY tbl_name;`,
  points: ['Indexes dramatically reduce query time on large tables', 'Created separately from the table with CREATE INDEX', 'Automatically used by the query optimizer — no query changes needed', 'Too many indexes slow down writes — be selective'],
},

{
  slug: 'sql-auto-increment', title: 'SQL – Auto Increment', order: 63,
  desc: 'Automatically generate unique sequential IDs for new rows using AUTOINCREMENT.',
  intro: `\`AUTOINCREMENT\` (or AUTO_INCREMENT in MySQL, SERIAL in PostgreSQL) automatically assigns the next available integer to a column whenever a new row is inserted. This eliminates the need to manually track and supply primary key values — the database handles it for you.

The guarantee: once an ID is used, it is never reused — even if the row is deleted. This is important for audit trails and references stored outside the database (logs, URLs).`,
  concept: `**Syntax by database**\n\`\`\`sql\n-- SQLite\nid INTEGER PRIMARY KEY AUTOINCREMENT\n\n-- MySQL\nid INT AUTO_INCREMENT PRIMARY KEY\n\n-- PostgreSQL\nid SERIAL PRIMARY KEY\n-- or: id INTEGER GENERATED ALWAYS AS IDENTITY\n\`\`\``,
  setup: ``,
  query: `CREATE TABLE orders (\n  order_id   INTEGER PRIMARY KEY AUTOINCREMENT,\n  customer   TEXT    NOT NULL,\n  product    TEXT    NOT NULL,\n  quantity   INTEGER DEFAULT 1,\n  order_date TEXT    DEFAULT (date('now'))\n);\n\n-- IDs are generated automatically\nINSERT INTO orders (customer, product, quantity)\nVALUES ('Aria Chen', 'SQL Textbook', 2),\n       ('Ben Torres', 'Keyboard', 1),\n       ('Cleo Park', 'Monitor Stand', 3);\n\n-- Delete order 2 (its ID is never reused)\nDELETE FROM orders WHERE order_id = 2;\n\nSELECT * FROM orders;`,
  points: ['AUTOINCREMENT generates the next unique ID automatically', 'IDs are never reused even after row deletion (in SQLite)', 'Manual ID values can still be inserted if specified explicitly', 'Do not use AUTOINCREMENT as a meaningful business identifier — use it as a technical key only'],
},

{
  slug: 'sql-dates', title: 'SQL – Working with Dates', order: 64,
  desc: 'Store, compare, and calculate with dates and times in SQL using date functions and formatting.',
  intro: `Dates and times are everywhere in databases — order dates, signup timestamps, appointment schedules, expiry dates. SQL provides functions for getting the current date, extracting parts (year, month, day), calculating differences, and formatting dates for display.

SQLite stores dates as text ('YYYY-MM-DD') or as numeric Unix timestamps, which makes date arithmetic particularly clean with functions like \`date()\`, \`datetime()\`, and \`strftime()\`.`,
  concept: `**Key SQLite date functions**\n| Function | Example | Returns |\n|---|---|---|\n| date('now') | date('now') | 2024-04-20 |\n| date('now','-7 days') | | 7 days ago |\n| strftime('%Y', date) | | Year only |\n| julianday(d2)-julianday(d1) | | Days between |`,
  setup: BASE_SETUP,
  query: `-- Date math: days since each enrollment\nSELECT s.name,\n       e.enroll_date,\n       e.status,\n       CAST(julianday('now') - julianday(e.enroll_date) AS INTEGER)\n         AS days_since_enrollment,\n       strftime('%Y', e.enroll_date) AS enrollment_year\nFROM   enrollments e\nJOIN   students    s ON s.id = e.student_id\nORDER  BY e.enroll_date;`,
  points: ['Store dates in ISO 8601 format (YYYY-MM-DD) for correct sorting', 'julianday() converts dates to a numeric scale for arithmetic', 'strftime() formats dates: %Y=year, %m=month, %d=day, %H=hour', 'date(\'now\', \'-30 days\') calculates relative dates'],
},

{
  slug: 'sql-views', title: 'SQL – Views', order: 65,
  desc: 'Create virtual tables from saved SQL queries using views to simplify complex queries and control data access.',
  intro: `A **view** is a saved SELECT query that acts like a virtual table. Instead of rewriting a complex 5-table join every time you need a particular report, you create a view once and then query it like a simple table. Views also serve as a security layer — you can grant users access to a view without giving them access to the underlying tables.

Views are always computed fresh — they do not store data (unless they are materialized views, a more advanced concept). Every time you query a view, the underlying SELECT runs.`,
  concept: `**Views vs Tables**\n| | View | Table |\n|---|---|---|\n| Stores data | ❌ (virtual) | ✅ (physical) |\n| Always current | ✅ | ✅ |\n| Can simplify | ✅ complex joins | N/A |\n| Can limit access | ✅ | Indirectly |`,
  setup: BASE_SETUP,
  query: `-- Create a view that shows a clean enrollment report\nCREATE VIEW enrollment_report AS\nSELECT s.name        AS student,\n       s.city,\n       c.title        AS course,\n       c.price,\n       e.status,\n       e.final_score\nFROM   enrollments e\nJOIN   students   s ON s.id = e.student_id\nJOIN   courses    c ON c.id = e.course_id;\n\n-- Query the view just like a table!\nSELECT * FROM enrollment_report\nWHERE  status = 'completed'\nORDER  BY final_score DESC;`,
  points: ['Views are saved SELECT queries — virtual tables', 'No data duplication — views always reflect current table data', 'Simplify complex joins into a single reusable table-like object', 'Use views to restrict which columns users can see (security layer)'],
},

// ── SECURITY & EXECUTION ─────────────────────────────────────────────────────
{
  slug: 'sql-injection', title: 'SQL – SQL Injection', order: 66,
  desc: 'Understand SQL injection attacks — what they are, how they work, and how to prevent them completely.',
  intro: `SQL injection is the most common and damaging database attack. It occurs when user input is concatenated directly into a SQL query without sanitization, allowing an attacker to inject malicious SQL code. A single login form vulnerable to injection can expose an entire database containing millions of records.

The classic example: a login query built as \`"SELECT * FROM users WHERE username = '" + input + "'"\` can be defeated by entering \`' OR '1'='1\` as the username — the injected \`OR '1'='1\` always evaluates to true, bypassing authentication entirely.`,
  concept: `**The fix: Parameterized Queries**\n\`\`\`python\n# VULNERABLE (never do this)\nquery = f"SELECT * FROM users WHERE username = '{user_input}'"\n\n# SAFE (parameterized)\nquery = "SELECT * FROM users WHERE username = ?"\ncursor.execute(query, (user_input,))\n\`\`\`\nThe \`?\` placeholder is filled by the driver with proper escaping.`,
  setup: `CREATE TABLE user_accounts (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, role TEXT DEFAULT 'user');
INSERT INTO user_accounts VALUES (1,'admin','superadmin'),(2,'aria_chen','user'),(3,'ben_torres','user');`,
  query: `-- Safe demonstration: show what injectable queries look like\n-- and why parameterization is the only real fix.\n\n-- This query is SAFE because we control the literal:\nSELECT * FROM user_accounts WHERE username = 'admin';\n\n-- In real apps, NEVER build queries like this:\n-- "SELECT * FROM users WHERE username = '" + userInput + "'"\n-- Instead always use parameterized queries in your language driver.\n\n-- For education: count users to show what's at risk\nSELECT COUNT(*) AS total_accounts_at_risk FROM user_accounts;`,
  points: ['SQL injection exploits unparameterized dynamic queries', 'ALWAYS use parameterized queries / prepared statements', 'Never concatenate user input directly into SQL strings', 'Input sanitization alone is insufficient — parameterization is the only safe defense'],
},

{
  slug: 'sql-parameters', title: 'SQL – Parameters', order: 67,
  desc: 'Make SQL queries safe and reusable using parameter placeholders instead of string concatenation.',
  intro: `Parameters (also called bind variables or placeholders) let you write a query template with placeholder symbols instead of hard-coded values. The values are supplied separately, and the database driver handles proper escaping. This is the correct solution to SQL injection and also makes queries more efficient — the database can reuse the query execution plan across different parameter values.

Different database drivers use different placeholder syntax: \`?\` in SQLite and MySQL, \`$1, $2...\` in PostgreSQL, or \`:name\` for named parameters in SQLAlchemy.`,
  concept: `**Parameter placeholders**\n\`\`\`python\n# SQLite (Python)\ncursor.execute("SELECT * FROM students WHERE city=? AND grade=?",\n               (city_value, grade_value))\n\n# PostgreSQL\ncursor.execute("SELECT * FROM students WHERE city=%s AND grade=%s",\n               (city_value, grade_value))\n\n# Named parameters (SQLAlchemy)\ncursor.execute("SELECT * FROM students WHERE city=:city",\n               {"city": city_value})\n\`\`\``,
  setup: BASE_SETUP,
  query: `-- Parameterized queries run safely and efficiently.\n-- Here we simulate filtering by "parameter" values:\n-- (In production code, these would be ? placeholders\n--  filled in by your database driver)\n\nSELECT name, city, score, grade\nFROM   students\nWHERE  city  = 'Mumbai'   -- would be a ? in real code\n  AND  grade = 'A'        -- would be a ? in real code\nORDER  BY score DESC;`,
  points: ['Parameters prevent SQL injection by separating code from data', 'Reusable as prepared statements for improved performance', 'Supported by every modern database driver in every language', 'Named parameters (:city) are more readable than positional (?)'],
},

{
  slug: 'sql-prepared-statements', title: 'SQL – Prepared Statements', order: 68,
  desc: 'Pre-compile SQL queries for security, performance, and reuse using prepared statements.',
  intro: `A **prepared statement** is a pre-compiled SQL query template. The database parses and optimizes it once, and then you can execute it multiple times with different parameter values — without re-parsing each time. This provides two major benefits: security (parameters prevent injection) and performance (parsing happens only once).

Prepared statements are the standard approach for any query executed repeatedly in a loop — like inserting thousands of records, or running the same filtered search with different input values.`,
  concept: `**Prepared statement lifecycle**\n1. PREPARE — database parses and compiles the query template\n2. BIND — you supply the actual parameter values\n3. EXECUTE — database runs with those values\n4. REPEAT steps 2-3 as many times as needed\n5. DEALLOCATE — free the compiled plan`,
  setup: `CREATE TABLE inventory (id INTEGER PRIMARY KEY, product TEXT NOT NULL, qty INTEGER DEFAULT 0, price REAL NOT NULL);`,
  query: `-- Simulate bulk INSERT (the prepared statement pattern)\n-- In a real driver: stmt = conn.prepare("INSERT INTO inventory VALUES(?,?,?,?)")\n-- Then execute in a loop with different values\n\nINSERT INTO inventory VALUES (1,'Laptop',45,65000);\nINSERT INTO inventory VALUES (2,'Mouse',150,1200);\nINSERT INTO inventory VALUES (3,'Keyboard',80,3500);\nINSERT INTO inventory VALUES (4,'Monitor',30,28000);\nINSERT INTO inventory VALUES (5,'Webcam',60,4500);\n\nSELECT product,\n       qty,\n       price,\n       qty * price AS total_stock_value\nFROM   inventory\nORDER  BY total_stock_value DESC;`,
  points: ['Prepared statements parse SQL once, execute many times', 'Mandatory for security — prevents SQL injection via bound parameters', 'Improve performance when the same query runs repeatedly', 'Available in all major database libraries across all programming languages'],
},

{
  slug: 'sql-hosting', title: 'SQL – Database Hosting', order: 69,
  desc: 'Understand the options for hosting SQL databases — local, cloud, managed, and serverless.',
  intro: `Choosing where to host your database is as important as choosing the database itself. Options range from running SQLite locally in a single file (perfect for learning and small apps) to managed cloud databases that handle backups, scaling, and failover automatically.

For production applications, **managed database services** like AWS RDS, Supabase, PlanetScale, or Neon are popular — they handle the infrastructure so your team can focus on building features rather than administering servers.`,
  concept: `**Hosting tiers**\n| Tier | Examples | Best for |\n|---|---|---|\n| Local file | SQLite | Development, learning |\n| Self-hosted | PostgreSQL on VPS | Full control |\n| Managed Cloud | AWS RDS, Supabase | Most production apps |\n| Serverless | Neon, PlanetScale | Scale-to-zero apps |\n| In-memory | SQLite :memory: | Testing, this browser! |`,
  setup: BASE_SETUP,
  query: `-- This entire tutorial runs on SQLite in your browser!\n-- Zero configuration, zero cost, works on GitHub Pages.\n-- Perfect for learning SQL concepts interactively.\n\n-- Summary of everything in our academy database:\nSELECT 'students'   AS table_name, COUNT(*) AS rows FROM students\nUNION ALL\nSELECT 'courses',    COUNT(*) FROM courses\nUNION ALL\nSELECT 'enrollments', COUNT(*) FROM enrollments;`,
  points: ['SQLite is ideal for development, learning, and small applications', 'Managed cloud databases handle backups, scaling, and patching automatically', 'Serverless databases scale to zero cost when idle', 'Always use dedicated hosting for production — not the same server as your web app'],
},

]; // end of tutorials array

// ── Generate files ────────────────────────────────────────────────────────────
let created = 0;
let skipped = 0;

for (const t of tutorials) {
  const filepath = join(outDir, `${t.slug}.mdx`);

  const keyPointsList = t.points.map(p => `- ${p}`).join('\n');

  // Escape backticks and $ in the SQL strings for the MDX template literal
  const safeSetup = (t.setup || '').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const safeQuery = t.query.replace(/`/g, '\\`').replace(/\$/g, '\\$');

  const content = `---
title: "${t.title}"
description: "${t.desc}"
category: "sql"
order: ${t.order}
---

import SqlEditor from '../../components/SqlEditor.astro';

${t.intro}

${t.concept}

## Try It Yourself — Interactive SQL Editor

Edit the query below and click **Run Query ▶** to see live results powered by SQLite running directly in your browser.

<SqlEditor
  setupSql={\`${safeSetup}\`}
  querySql={\`${safeQuery}\`}
/>

## Key Points

${keyPointsList}

> **Pro Tip from CodesCompiler:** The best way to learn SQL is to break things intentionally — modify the query above, change the WHERE conditions, try different columns. Every error teaches you something the docs cannot.

In the next lesson, we continue exploring SQL's powerful feature set to build your database mastery.
`;

  if (existsSync(filepath)) {
    console.log(`  SKIP  ${t.slug}.mdx (already exists)`);
    skipped++;
  } else {
    writeFileSync(filepath, content, 'utf-8');
    console.log(`  ✓     ${t.slug}.mdx`);
    created++;
  }
}

console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
