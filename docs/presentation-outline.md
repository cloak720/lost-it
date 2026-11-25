# Lost-It: Presentation Outline

A suggested 12–13 slide flow for presenting the project.

1. **Title**: Lost-It, a campus Lost & Found Office. Name, course, guide.
2. **Problem**: Items lost on campus are rarely returned. Notices on boards and WhatsApp groups get buried, and finders don't know who the owner is.
3. **Solution**: A digital lost & found office. Found items go into category **boxes** (the Found Room), and lost items get **WANTED posters** (the Wanted Board). The system matches them and lets people talk safely.
4. **Objectives**: Easy reporting with photos · search & filters · automatic matching · private messaging · admin moderation.
5. **Tech stack**: Python + Flask (REST API), MySQL (data), React (UI), JWT (login), Werkzeug (password hashing), pure CSS 3D (boxes).
6. **Architecture**: React → JSON over HTTP → Flask → SQL → MySQL (diagram in README).
7. **Database design**: ER diagram with 5 tables: users (with role and is_active), categories, locations, items (with reward), messages.
8. **Roles & security**: user vs admin table. Show the `@admin_required` decorator from `auth_utils.py`. Explain that the role is checked in the DB on every request, so blocking someone works instantly.
9. **Matching algorithm**: The scoring table (category 40, location 30, keywords 20, date 10), with the earphones example (100% match).
10. **Modules**: Authentication & roles · Found Room · Wanted Board · Matching · Messaging · Admin desk.
11. **Live demo / screenshots** (see script below).
12. **Security**: Hashed passwords, JWT, role decorators, owner/admin-only edit, parameterised SQL (no SQL injection), upload type/size checks, private messages, admin password kept in `.env` (never committed to GitHub).
13. **Future scope & conclusion**: Email alerts, image matching, QR stickers, mobile app.

## Demo script (about 4 minutes)

1. **Home page.** Point out the two "doors": the Found Room and the Wanted Board. Flip the ☀️/🌙 switch to show the Day and Night themes.
2. **Found Room.** Hover over a box (the flaps open and items peek out), then **click Electronics**. The box opens into its catalogue.
3. **Wanted Board.** Show the bounty posters and their rewards.
4. Log in as `asha@campus.edu` / `demo1234`. Open the **Black JBL wireless earphones** poster and scroll to the **100% match**.
5. Open **Messages** to show the conversation with Rahul.
6. Click **+ Report** and type a lost item. Show the **live poster preview**, then post it.
7. Log out, then log in as `admin1@campus.edu` with the admin password from `.env`. Open the **Admin** desk, show the charts, then **block** a user in the Users tab.
8. Try to log in as the blocked user: it's refused. Unblock them again.
