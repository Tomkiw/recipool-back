# 🔐 Security incident checklist — витік `.env`

`.env` з реальними креденшлами був закомічений у публічну історію (коміти `1903b17`, `b17bf53` — "start").
Нижче — що вже зроблено і що лишилось **тобі** (коміти/пуш робиш сам).

---

## ✅ Вже зроблено (локально, без комітів)

- [x] `git rm --cached .env` — знято з відстеження
- [x] Створено `.env.example` з порожніми секретами
- [x] `.gitignore` вже містить `.env` / `.env.*` / `!.env.example`
- [x] **Історію переписано** через `git filter-repo --path .env --invert-paths` — `.env` зник з усіх комітів усіх гілок (`main`, `server_autt`, `recipe-and-ingredients`)
- [x] Резервна копія повної історії: `../recipool-back-BACKUP-20260721-184327.bundle`

---

## 🔴 КРОК 1 — Ротувати креденшли (НАЙВАЖЛИВІШЕ, роби першим)

> Переписування історії НЕ рятує: старі коміти лишаються доступними за прямим SHA на GitHub,
> у форках, кешах і в тих, хто вже зробив fetch. Єдиний надійний захист — **інвалідувати ключі**.

### MongoDB Atlas (юзер `igortomkiw3_db_user`, cluster `cluster0.i6amft2`)
- [ ] Atlas → **Database Access** → цей юзер → **Edit Password** (або видалити й створити нового)
- [ ] Оновити `MONGO_URL` у локальному `.env`
- [ ] Atlas → **Network Access** → перевірити, що немає зайвого `0.0.0.0/0`
- [ ] Переглянути логи під'єднань на підозрілу активність

### Cloudinary (cloud `dkhn11nfs`)
- [ ] Console → **Settings → Security → Regenerate API Secret**
- [ ] Оновити `CLOUDINARY_API_SECRET` у локальному `.env`

---

## 🟠 КРОК 2 — Залити чисту історію на GitHub (force-push усіх гілок)

filter-repo прибрав remote `origin`. Повертаємо і пушимо (пуш робиш **ти**):

```bash
git remote add origin git@github.com:Tomkiw/recipool-back.git

# force-push кожної очищеної гілки
git push origin --force --all
git push origin --force --tags
```

- [ ] `git remote add origin …`
- [ ] `git push origin --force --all`
- [ ] Не забути гілку `recipe-and-ingredients` (вона теж очищена локально й піде разом з `--all`)
- [ ] Якщо є відкриті PR-и на цих гілках — попередити, що база історії змінилась

---

## 🟡 КРОК 3 — Закомітити `.env.example`

```bash
git add .env.example SECURITY-CHECKLIST.md
git commit -m "chore: add .env.example, security cleanup"
git push origin server_autt
```

- [ ] закомічено й запушено

---

## 🟡 КРОК 4 — Команда

- [ ] Попередити всіх співавторів: історію переписано → треба **реклонити** репо
      (або `git fetch --all && git reset --hard origin/<branch>`), інакше вони повернуть старі коміти назад
- [ ] Видалити локальні бекап-креденшли після ротації

---

## 🟢 КРОК 5 — Перевірка

- [ ] На GitHub відкрити старий коміт за SHA `1903b17` — має бути 404 (не одразу; кеш GitHub тримає якийсь час)
- [ ] Перевірити, що `.env` не видно в жодній гілці на GitHub
- [ ] Якщо секрети критичні — написати в **GitHub Support**, щоб примусово вичистили кеш/unreachable-об'єкти
- [ ] (Опційно) Увімкнути **GitHub Secret Scanning / Push Protection** у Settings → Code security

---

## ↩️ Відкат (якщо щось пішло не так)

Повна історія збережена в bundle:

```bash
# перевірити вміст
git bundle verify ../recipool-back-BACKUP-20260721-184327.bundle
# відновити у нову теку
git clone ../recipool-back-BACKUP-20260721-184327.bundle recipool-restore
```
