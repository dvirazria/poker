# הגשה ל־App Store — סוגרים קופה

מסמך עבודה להגשה הראשונה (נכתב 2026-10-28). הכול כאן מוכן להעתקה ל־App Store Connect.
התיקיה `docs/` לא עולה ל־Vercel.

## מה כבר מוכן בפרויקט

- `ios-app/`: אפליקציית Capacitor. מזהה `il.co.dvirazria.kupa`, גרסה 1.0 (build 1), iOS 15 ומעלה.
- אייפון בלבד ולאורך בלבד, ולכן אין צורך בצילומי אייפד.
- `ITSAppUsesNonExemptEncryption = NO`: אין שאלת הצפנה בכל העלאה.
- הודעות הרשאה למצלמה ולתמונות, לבחירת תמונת פרופיל או תמונת קבוצה. בלי הודעת המצלמה, בחירת "צלם תמונה" הייתה מקריסה את האפליקציה.
- supabase-js ארוז בתוך האפליקציה בגרסה קבועה (`ios-app/sync-web.mjs`), ולא נטען מ־CDN.
- שורת הסטטוס (שעון וסוללה) עוקבת אחרי ערכת הצבעים של האפליקציה.
- רטט אמיתי: בקנייה, כשמשחק מסתיים, וכשנסגר שולחן.
- הקישורים לפרטיות, לתנאים ולתמיכה נפתחים ב־Safari. באפליקציה עצמה קישור כזה לא היה עושה כלום.
- בתוך האפליקציה אין שורת "התראות זמינות כשהאפליקציה מותקנת במסך הבית", ואין כפתור Google.
- כניסה לבודק: `appreview@dvirazria.co.il` עם סיסמה בת 8 ספרות שמקלידים בשדה הקוד. לא נשלח מייל. הסיסמה לא נמצאת ב־repo.
- דף תמיכה: `support.html`.
- מדיניות הפרטיות מזכירה את תמונת הפרופיל.

הבדיקות שמחזיקות את כל זה: `tests/ios-app-review.test.cjs`.

## מה צריך לעשות, לפי הסדר

1. **Apple Developer Program**: developer.apple.com/programs, 99$ לשנה. האישור לוקח בדרך כלל יום־יומיים.
2. **Xcode**: אחרי ההתקנה, להריץ פעם אחת בטרמינל (מבקש סיסמת מק):
   `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
   ואז לפתוח את Xcode פעם אחת ולאשר את רכיבי ה־iOS.
3. **חשבון הבודק ב־Supabase**: Dashboard → Authentication → Users → Add user → Create new user.
   - Email: `appreview@dvirazria.co.il`
   - Password: 8 ספרות שתבחר. לרשום אותן רק ב־App Store Connect.
   - לסמן Auto Confirm User.
   - להיכנס איתו פעם אחת באתר ולהכין נתונים: שם "Apple Review", קבוצה עם 2–3 שחקנים ושני משחקים סגורים. כך הבודק יראה דירוג, היסטוריה וחובות.
4. **בנייה ובדיקה**: מריצים `cd ios-app && npm install && npm run sync && npm run open`. ב־Xcode:
   - Signing & Capabilities → Team = החשבון שלך.
   - להריץ על האייפון שלך ולעבור על הרשימה ב"בדיקות לפני הגשה" למטה.
5. **App Store Connect** → Apps → + → New App:
   - iOS, השם "סוגרים קופה", שפה ראשית Hebrew.
   - Bundle ID `il.co.dvirazria.kupa`. אם הוא לא מופיע ברשימה, רושמים אותו ב־Certificates, Identifiers & Profiles.
   - SKU: `kupa-ios`.
6. ממלאים את השדות שבהמשך, מעלים צילומי מסך.
7. ב־Xcode: Product → Archive → Distribute App → App Store Connect.
8. כשה־build מופיע ב־App Store Connect, בוחרים אותו בגרסה 1.0 ושולחים לבדיקה.

## שדות החנות

| שדה | ערך |
|---|---|
| Name | סוגרים קופה |
| Subtitle (עד 30 תווים) | פוקר ביתי: מי משלם למי |
| Primary category | Utilities |
| Secondary category | Lifestyle |
| Price | חינם |
| Support URL | https://poker-tau-pink.vercel.app/support.html |
| Privacy Policy URL | https://poker-tau-pink.vercel.app/privacy.html |
| Marketing URL | https://poker-tau-pink.vercel.app/ (רשות) |
| Copyright | 2026 Dvir Azria |

לא לבחור בקטגוריה Finance. Apple דורשת שאפליקציות פיננסיות יוגשו על ידי חברה רשומה, ובודקת אותן בקפדנות.

**Keywords** (96 מתוך 100 תווים):
```
פוקר,התחשבנות,חובות,חברים,ערב פוקר,משחק ביתי,באיין,צ׳יפים,קבוצה,poker,home game,buy-in,settle up
```

**Promotional text:**
```
פותחים שולחן, רושמים כניסות בלחיצה, ובסוף המשחק האפליקציה מחשבת מי משלם למי. בלי מחשבון, בלי ויכוחים.
```

**Description:**
```
סוגרים קופה היא הדרך הפשוטה לנהל משחק פוקר ביתי עם חברים — מהכניסה הראשונה ועד שכולם יודעים מי משלם למי.

במשחק
• פותחים שולחן ומוסיפים שחקנים
• רושמים כניסות (באיינים) בלחיצה, עם יומן מלא לכל שחקן
• בסוף המשחק מזינים כמה כל אחד יצא, והאפליקציה מחשבת את ההעברות
• בודקת שהקופה מאוזנת לפני שסוגרים

קבוצות
• קבוצה לכל חבר׳ה קבועים, עם היסטוריית משחקים ודירוג
• מזמינים לקבוצה בקישור — בוואטסאפ או בכל דרך אחרת
• שולחן פתוח מתעדכן אצל כל המשתתפים בזמן אמת

חובות וחברים
• חוב שלא שולם בסוף משחק נשמר, ומי שצריך לקבל מסמן כששולם
• רשימת חברים, הזמנה בקישור
• תמונת פרופיל, צורה או שני קלפים — מה שמייצג אותך

פרטיות
• כניסה בקוד חד־פעמי במייל, בלי סיסמה — או משחק בלי חשבון בכלל, עם שם מקומי
• בלי פרסומות, בלי מעקב, בלי אנליטיקס
• מחיקת חשבון ישירות מההגדרות

חשוב: סוגרים קופה רק רושמת ומחשבת. היא לא מעבירה כסף, לא מחזיקה אמצעי תשלום ואין בה הימורים — התשלום עצמו עובר בין החברים, מחוץ לאפליקציה. מיועדת לגילאי 18 ומעלה.
```

## דירוג גיל (Age Rating)

עונים בכנות, ואז מעלים ידנית ל־18+ כדי להתאים לתנאי השימוש ("השימוש מיועד מגיל 18 ומעלה"):

- Gambling (הימורים בכסף אמיתי): **No**. אין באפליקציה הימורים.
- Simulated Gambling: **None**. זה לא משחק.
- Contests, Loot boxes: **No**.
- Unrestricted web access: **No**.
- Messaging / chat: **No**.
- User-generated content: **No**. משתמשים רואים רק שמות ושמות קבוצות של מי שהם בחרו לשחק איתו. אין פיד, אין הודעות ואין תוכן ציבורי.
- כל השאר: None.

## פרטיות (App Privacy)

- Tracking: **No**. אין מעקב, אין פרסומות, אין SDK של צד שלישי.
- Data collected: כל הסוגים שלמטה מסומנים **Linked to the user**, **Not used for tracking**, והמטרה היא **App Functionality** בלבד.

| סוג | למה |
|---|---|
| Contact Info → Email Address | כניסה לחשבון |
| Contact Info → Name | שם התצוגה במשחקים ובקבוצות |
| User Content → Photos or Videos | תמונת פרופיל או תמונת קבוצה, רק אם המשתמש העלה |
| User Content → Other User Content | משחקים, כניסות, פדיון, קבוצות, חברים |
| Financial Info → Other Financial Info | סכומי משחקים וחובות בין חברים (רישום בלבד) |
| Identifiers → User ID | מזהה החשבון בשרת |

לא נאספים: מיקום, אנשי קשר, היסטוריית גלישה, נתוני שימוש, אבחון.

## הערות לבודק (App Review Information → Notes)

ב־Sign-in required מסמנים ✔. Username: `appreview@dvirazria.co.il`. Password: 8 הספרות שבחרת בשלב 3.

```
Sogrim Kupa ("closing the pot") is a Hebrew-language companion for friends' home poker games. It records the buy-ins and cash-outs friends agree on at a physical table and computes who owes whom. It offers no gambling or wagering, processes no payments and never moves money - it only keeps records. The UI is in Hebrew (right-to-left).

SIGNING IN WITH THE DEMO ACCOUNT
1. On the first screen, type appreview@dvirazria.co.il in the email field and tap "שלחו לי קוד" (send me a code).
2. In the code field, type the 8-digit password from the Sign-in section above. It signs in by itself (or tap "אישור").
Regular users receive a one-time code by email instead; the demo address skips the email.

THE APP WITHOUT AN ACCOUNT
Tap "המשך בלי חשבון" (continue without an account) and enter any name. The full game flow then works on the device only.

A GAME, END TO END
On the middle tab, tap "התחל משחק" (start a game), add players and tap "פתח שולחן" (open the table). Tap a player to add a buy-in. Hold "סיים משחק" (finish game) for one second, enter each player's cash-out, then close the table. The game is saved to the history, and unpaid amounts become debts.

ACCOUNT DELETION
Settings (the gear in the top corner) > "אזור מסוכן" (danger zone) > "מחיקת חשבון" (delete account) > hold "מחיקה לצמיתות" (delete permanently).

Sign-in is an emailed one-time code only. There is no third-party login in the iOS app. Support: dvirazria1@gmail.com
```

## צילומי מסך

נדרש סט אחד לאייפון בגודל 6.9 אינץ', 1320×2868. מצלמים בסימולטור iPhone 17 Pro Max עם `xcrun simctl io booted screenshot`. 3 עד 6 צילומים, לפי הסדר:

1. שולחן פתוח עם 4–5 שחקנים וכניסות
2. מסך הסגירה: מי משלם למי
3. דף קבוצה עם דירוג והיסטוריה
4. חובות בפרופיל
5. עורך תמונת הפרופיל (צורות וקלפים)

בצילומים משתמשים בשמות בדויים, לא בשמות של חברים אמיתיים.

## בדיקות לפני הגשה (במכשיר)

לעבור גם על ההערות לבודק צעד אחר צעד, ולוודא שכל שם כפתור שמופיע שם הוא בדיוק מה שרואים במסך.


- [ ] כניסה בקוד מייל אמיתי, וגם בחשבון הבודק
- [ ] "המשך בלי חשבון" ומשחק שלם עד סגירה
- [ ] הקלדה בשדות: המקלדת לא מסתירה את השדה, וסרגל הטאבים נעלם בזמן הקלדה
- [ ] תמונת פרופיל: בחירה מהתמונות, וגם "צלם תמונה" (לא קורס)
- [ ] הקישורים בהגדרות (פרטיות, תנאים, תמיכה) נפתחים ב־Safari
- [ ] קישור הזמנה לקבוצה: שיתוף ופתיחה
- [ ] מצב בהיר וכהה: השעון בשורת הסטטוס קריא בשניהם
- [ ] מחיקת חשבון על חשבון בדיקה
- [ ] מצב טיסה: האפליקציה נפתחת ומשחק מקומי עובד

## סיכונים שנשארו

- **4.2 (Minimum Functionality)**: זו אפליקציית WebView. מה שעוזר: הקוד ארוז בפנים, האפליקציה עובדת בלי רשת ובלי חשבון, יש רטט ושורת סטטוס של Apple, ואין שום ממשק של דפדפן. אם תגיע דחייה מהסוג הזה, הצעד הבא הוא התראות של Apple (APNs). זה דורש תוסף push, מפתח APNs מחשבון המפתחים, ושליחה מפונקציית `notify`.
- **5.3 (Gambling)**: נושא הפוקר יכול לעורר שאלות. ההערות לבודק מבהירות שאין הימורים ואין העברת כסף.
- **1.2 (UGC)**: חיפוש חבר לפי שם או מייל מדויק מאפשר בקשת חברות מאדם זר. אין כרגע חסימה או דיווח. אם Apple תבקש, מוסיפים "חסום".
