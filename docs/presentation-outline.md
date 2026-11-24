# Lost-It: Presentation Outline

A suggested 10–12 slide flow for presenting the project.

1. **Title**: Lost-It, a campus lost & found portal. Name, course, guide.
2. **Problem**: Items lost on campus are rarely returned. Notices on boards and WhatsApp groups get buried, and finders don't know who the owner is.
3. **Solution**: One place to report lost and found items. Automatic match suggestions. Safe in-app contact.
4. **Objectives**: Easy reporting with photos · search & filters · automatic matching · private messaging · track returned items.
5. **Tech stack**: Python + Flask (REST API), MySQL (data), React (UI), JWT (login), Werkzeug (password hashing).
6. **Architecture**: React → JSON over HTTP → Flask → SQL → MySQL (diagram in README).
7. **Database design**: ER diagram with 5 tables: users, categories, locations, items, messages, and their foreign keys.
8. **Matching algorithm**: The scoring table (category 40, location 30, keywords 20, date 10), with an example of the earphones match.
9. **Modules**: Authentication · Item management · Search & filter · Matching · Messaging · Stats.
10. **Live demo / screenshots**:
    - Home page with stats
    - Report a lost item → matches appear right away
    - Send a message → reply from the other account
    - Mark as returned
11. **Security**: Hashed passwords, JWT-protected routes, owner-only edit/delete, parameterised SQL (no SQL injection), upload type and size checks.
12. **Future scope & conclusion**: Email alerts, admin moderation, image matching, mobile app.

## Demo script (about 3 minutes)

1. Open the home page and point out the live stats and recent items.
2. Log in as `asha@campus.edu` / `demo1234`.
3. Open **Black JBL wireless earphones** and show the **Possible matches** section, its score bar and the reasons.
4. Open **Messages** to show the conversation with Rahul.
5. Click **+ Report item**, post a new found item (for example a red keychain at the Parking Area), and show the matches it gets.
6. Go back to the earphones item and click **Mark as returned**. The home stats update.
