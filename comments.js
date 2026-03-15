//80% hnaya generitha i bl ia hitax konz zrban w khdam rassi
var AUTH_USERS_KEY   = 'bookshelf-users';
var AUTH_CURRENT_KEY = 'bookshelf-current-user';
var COMMENTS_KEY     = 'bookshelf-comments'; 
var authCurrentUser = null;
function auth_getUsers()   { return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)   || '[]'); }
function auth_getUser()    { return JSON.parse(localStorage.getItem(AUTH_CURRENT_KEY) || 'null'); }
function auth_saveUsers(u) { localStorage.setItem(AUTH_USERS_KEY,   JSON.stringify(u)); }
function auth_saveUser(u)  { localStorage.setItem(AUTH_CURRENT_KEY, JSON.stringify(u)); }

function auth_getLang() {
    return localStorage.getItem('preferredLanguage') || 'en';
}

function auth_t(key) {
    var lang = auth_getLang();
    var T = {
        en: {
            loginTitle:        '🔐 Login',
            registerTitle:     '📝 Create Account',
            emailPlaceholder:  'your@email.com',
            passwordLabel:     'Password',
            passwordPlaceholder: '••••••••',
            nameLabel:         'Full Name',
            namePlaceholder:   'John Doe',
            confirmLabel:      'Confirm Password',
            loginBtn:          'Log in',
            registerBtn:       'Create account',
            logoutBtn:         '🚪 Logout',
            switchToRegister:  "Don't have an account?",
            switchToRegisterLink: 'Sign up',
            switchToLogin:     'Already have an account?',
            switchToLoginLink: 'Log in',
            errorPassMatch:    'Passwords do not match!',
            errorEmailUsed:    'This email is already in use!',
            errorCredentials:  'Incorrect email or password!',
            successRegister:   '✓ Account created successfully!',
            successLogin:      '✓ Welcome ',
            successLogout:     '✓ Logged out successfully!',
            loginRequired:     '🔒 Please log in to leave a comment',
            commentPlaceholder:'Share your thoughts…',
            postComment:       '💬 Post Comment',
            noComments:        'No comments yet. Be the first!',
            deleteConfirm:     'Delete this comment?',
            deleteSuccess:     '✓ Comment deleted',
            ownOnly:           'You can only delete your own comments',
            commentsTitle:     '💬 Comments',
            loginToComment:    'Log in',
            orRegister:        'or',
            toComment:         'to leave a comment.',
            registerToComment: 'Sign up',
        },
        fr: {
            loginTitle:        '🔐 Connexion',
            registerTitle:     '📝 Créer un compte',
            emailPlaceholder:  'votre@email.com',
            passwordLabel:     'Mot de passe',
            passwordPlaceholder: '••••••••',
            nameLabel:         'Nom complet',
            namePlaceholder:   'Jean Dupont',
            confirmLabel:      'Confirmer le mot de passe',
            loginBtn:          'Se connecter',
            registerBtn:       'Créer mon compte',
            logoutBtn:         '🚪 Déconnexion',
            switchToRegister:  'Pas encore de compte ?',
            switchToRegisterLink: 'Créer un compte',
            switchToLogin:     'Déjà inscrit ?',
            switchToLoginLink: 'Se connecter',
            errorPassMatch:    'Les mots de passe ne correspondent pas !',
            errorEmailUsed:    'Cet email est déjà utilisé !',
            errorCredentials:  'Email ou mot de passe incorrect !',
            successRegister:   '✓ Compte créé avec succès !',
            successLogin:      '✓ Bienvenue ',
            successLogout:     '✓ Déconnexion réussie !',
            loginRequired:     '🔒 Connectez-vous pour laisser un commentaire',
            commentPlaceholder:'Partagez votre avis…',
            postComment:       '💬 Publier',
            noComments:        'Aucun commentaire. Soyez le premier !',
            deleteConfirm:     'Supprimer ce commentaire ?',
            deleteSuccess:     '✓ Commentaire supprimé',
            ownOnly:           'Vous ne pouvez supprimer que vos commentaires',
            commentsTitle:     '💬 Commentaires',
            loginToComment:    'Connectez-vous',
            orRegister:        'ou',
            toComment:         'pour laisser un commentaire.',
            registerToComment: 'inscrivez-vous',
        },
        ar: {
            loginTitle:        '🔐 تسجيل الدخول',
            registerTitle:     '📝 إنشاء حساب',
            emailPlaceholder:  'بريدك@هنا.com',
            passwordLabel:     'كلمة المرور',
            passwordPlaceholder: '••••••••',
            nameLabel:         'الاسم الكامل',
            namePlaceholder:   'محمد علي',
            confirmLabel:      'تأكيد كلمة المرور',
            loginBtn:          'دخول',
            registerBtn:       'إنشاء الحساب',
            logoutBtn:         '🚪 خروج',
            switchToRegister:  'ليس لديك حساب؟',
            switchToRegisterLink: 'أنشئ حساباً',
            switchToLogin:     'لديك حساب بالفعل؟',
            switchToLoginLink: 'سجّل دخولك',
            errorPassMatch:    'كلمتا المرور غير متطابقتين!',
            errorEmailUsed:    'هذا البريد مستخدم بالفعل!',
            errorCredentials:  'بريد أو كلمة مرور خاطئة!',
            successRegister:   '✓ تم إنشاء الحساب!',
            successLogin:      '✓ أهلاً ',
            successLogout:     '✓ تم تسجيل الخروج!',
            loginRequired:     '🔒 سجّل دخولك لترك تعليق',
            commentPlaceholder:'شاركنا رأيك…',
            postComment:       '💬 نشر',
            noComments:        'لا تعليقات بعد. كن الأول!',
            deleteConfirm:     'حذف هذا التعليق؟',
            deleteSuccess:     '✓ تم حذف التعليق',
            ownOnly:           'يمكنك حذف تعليقاتك فقط',
            commentsTitle:     '💬 التعليقات',
            loginToComment:    'سجّل دخولك',
            orRegister:        'أو',
            toComment:         'لترك تعليق.',
            registerToComment: 'أنشئ حساباً',
        }
    };
    return (T[lang] || T['en'])[key] || key;
}

function auth_injectModals() {
    if (document.getElementById('auth-modal-login')) return; // déjà injecté

    var html = `
    <!-- Overlay -->
    <div id="auth-overlay" onclick="auth_closeAll()" style="
        display:none; position:fixed; inset:0; z-index:1000;
        background:rgba(0,0,0,.65); backdrop-filter:blur(4px);
        animation: auth-fade-in .2s ease;
    "></div>

    <!-- LOGIN MODAL -->
    <div id="auth-modal-login" style="
        display:none; position:fixed; top:50%; left:50%;
        transform:translate(-50%,-50%); z-index:1001;
        width:min(420px, 94vw);
        background:rgba(12,10,8,.96);
        border:1px solid var(--border);
        border-radius:4px;
        box-shadow:0 0 0 1px rgba(201,169,110,.1), 0 40px 80px rgba(0,0,0,.8);
        padding:36px 32px 28px;
        animation: auth-slide-up .25s cubic-bezier(.22,1,.36,1);
        font-family:'DM Mono',monospace;
    ">
        <button onclick="auth_closeAll()" style="
            position:absolute; top:14px; right:14px;
            background:transparent; border:none; color:var(--muted);
            font-size:1.2rem; cursor:pointer; line-height:1; padding:4px;
            transition:color .15s;
        " onmouseover="this.style.color='var(--cream)'" onmouseout="this.style.color='var(--muted)'">✕</button>

        <h2 id="auth-login-title" style="
            font-family:'Cormorant Garamond',serif; font-size:1.45rem;
            font-weight:300; color:var(--cream); margin-bottom:24px; letter-spacing:.03em;
        "></h2>

        <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
                <label style="display:block;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px;">Email</label>
                <input id="auth-login-email" type="email" style="
                    width:100%; padding:9px 12px; background:var(--input-bg);
                    border:1px solid var(--border); border-radius:2px;
                    color:var(--cream); font-family:'DM Mono',monospace; font-size:.75rem;
                    outline:none; transition:border-color .2s;
                " onfocus="this.style.borderColor='var(--gold-dim)'" onblur="this.style.borderColor='var(--border)'">
            </div>
            <div>
                <label id="auth-login-pass-label" style="display:block;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px;"></label>
                <input id="auth-login-password" type="password" style="
                    width:100%; padding:9px 12px; background:var(--input-bg);
                    border:1px solid var(--border); border-radius:2px;
                    color:var(--cream); font-family:'DM Mono',monospace; font-size:.75rem;
                    outline:none; transition:border-color .2s;
                " onfocus="this.style.borderColor='var(--gold-dim)'" onblur="this.style.borderColor='var(--border)'">
            </div>
            <button id="auth-login-submit" onclick="auth_handleLogin()" style="
                margin-top:6px; padding:10px; background:var(--gold);
                border:1px solid var(--gold); border-radius:2px; color:var(--black);
                font-family:'DM Mono',monospace; font-size:.65rem; letter-spacing:.16em;
                text-transform:uppercase; font-weight:600; cursor:pointer;
                transition:background .2s, box-shadow .2s;
            " onmouseover="this.style.background='#e0bb7a'" onmouseout="this.style.background='var(--gold)'"></button>
        </div>

        <p style="margin-top:18px;font-size:.6rem;letter-spacing:.06em;color:var(--muted);text-align:center;">
            <span id="auth-login-switch-text"></span>
            <a id="auth-login-switch-link" onclick="auth_showRegister()" style="
                color:var(--gold); cursor:pointer; text-decoration:none; margin-left:4px;
            "></a>
        </p>
    </div>

    <!-- REGISTER MODAL -->
    <div id="auth-modal-register" style="
        display:none; position:fixed; top:50%; left:50%;
        transform:translate(-50%,-50%); z-index:1001;
        width:min(420px, 94vw);
        background:rgba(12,10,8,.96);
        border:1px solid var(--border);
        border-radius:4px;
        box-shadow:0 0 0 1px rgba(201,169,110,.1), 0 40px 80px rgba(0,0,0,.8);
        padding:36px 32px 28px;
        animation: auth-slide-up .25s cubic-bezier(.22,1,.36,1);
        font-family:'DM Mono',monospace;
    ">
        <button onclick="auth_closeAll()" style="
            position:absolute; top:14px; right:14px;
            background:transparent; border:none; color:var(--muted);
            font-size:1.2rem; cursor:pointer; line-height:1; padding:4px;
            transition:color .15s;
        " onmouseover="this.style.color='var(--cream)'" onmouseout="this.style.color='var(--muted)'">✕</button>

        <h2 id="auth-register-title" style="
            font-family:'Cormorant Garamond',serif; font-size:1.45rem;
            font-weight:300; color:var(--cream); margin-bottom:24px; letter-spacing:.03em;
        "></h2>

        <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
                <label id="auth-register-name-label" style="display:block;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px;"></label>
                <input id="auth-register-name" type="text" style="
                    width:100%; padding:9px 12px; background:var(--input-bg);
                    border:1px solid var(--border); border-radius:2px;
                    color:var(--cream); font-family:'DM Mono',monospace; font-size:.75rem;
                    outline:none; transition:border-color .2s;
                " onfocus="this.style.borderColor='var(--gold-dim)'" onblur="this.style.borderColor='var(--border)'">
            </div>
            <div>
                <label style="display:block;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px;">Email</label>
                <input id="auth-register-email" type="email" style="
                    width:100%; padding:9px 12px; background:var(--input-bg);
                    border:1px solid var(--border); border-radius:2px;
                    color:var(--cream); font-family:'DM Mono',monospace; font-size:.75rem;
                    outline:none; transition:border-color .2s;
                " onfocus="this.style.borderColor='var(--gold-dim)'" onblur="this.style.borderColor='var(--border)'">
            </div>
            <div>
                <label id="auth-register-pass-label" style="display:block;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px;"></label>
                <input id="auth-register-password" type="password" style="
                    width:100%; padding:9px 12px; background:var(--input-bg);
                    border:1px solid var(--border); border-radius:2px;
                    color:var(--cream); font-family:'DM Mono',monospace; font-size:.75rem;
                    outline:none; transition:border-color .2s;
                " onfocus="this.style.borderColor='var(--gold-dim)'" onblur="this.style.borderColor='var(--border)'">
            </div>
            <div>
                <label id="auth-register-confirm-label" style="display:block;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:6px;"></label>
                <input id="auth-register-confirm" type="password" style="
                    width:100%; padding:9px 12px; background:var(--input-bg);
                    border:1px solid var(--border); border-radius:2px;
                    color:var(--cream); font-family:'DM Mono',monospace; font-size:.75rem;
                    outline:none; transition:border-color .2s;
                " onfocus="this.style.borderColor='var(--gold-dim)'" onblur="this.style.borderColor='var(--border)'">
            </div>
            <button id="auth-register-submit" onclick="auth_handleRegister()" style="
                margin-top:6px; padding:10px; background:var(--gold);
                border:1px solid var(--gold); border-radius:2px; color:var(--black);
                font-family:'DM Mono',monospace; font-size:.65rem; letter-spacing:.16em;
                text-transform:uppercase; font-weight:600; cursor:pointer;
                transition:background .2s;
            " onmouseover="this.style.background='#e0bb7a'" onmouseout="this.style.background='var(--gold)'"></button>
        </div>

        <p style="margin-top:18px;font-size:.6rem;letter-spacing:.06em;color:var(--muted);text-align:center;">
            <span id="auth-register-switch-text"></span>
            <a id="auth-register-switch-link" onclick="auth_showLogin()" style="
                color:var(--gold); cursor:pointer; text-decoration:none; margin-left:4px;
            "></a>
        </p>
    </div>

    <style>
        @keyframes auth-fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes auth-slide-up { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }

        /* Normal theme overrides for modals */
        body.theme-normal #auth-modal-login,
        body.theme-normal #auth-modal-register {
            background: rgba(250,244,235,.98) !important;
            border-color: rgba(180,130,70,.3) !important;
        }
        body.theme-normal #auth-modal-login h2,
        body.theme-normal #auth-modal-register h2 { color: #3a2510 !important; }
        body.theme-normal #auth-modal-login input,
        body.theme-normal #auth-modal-register input {
            background: rgba(255,255,255,.8) !important;
            border-color: rgba(180,130,70,.3) !important;
            color: #2a1f14 !important;
        }
        body.theme-normal #auth-modal-login label,
        body.theme-normal #auth-modal-register label { color: #a07840 !important; }
        body.theme-normal #auth-modal-login p,
        body.theme-normal #auth-modal-register p { color: rgba(42,31,20,.55) !important; }
        body.theme-normal #auth-modal-login button[onclick="auth_closeAll()"],
        body.theme-normal #auth-modal-register button[onclick="auth_closeAll()"] { color: rgba(42,31,20,.4) !important; }

        /* Normal theme — user name in header */
        body.theme-normal .auth-user-name-text { color: #2a1f14 !important; }
    </style>`;

    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
    auth_refreshModalTexts();
}

function auth_refreshModalTexts() {
    var ids = {
        'auth-login-title':          auth_t('loginTitle'),
        'auth-login-pass-label':     auth_t('passwordLabel'),
        'auth-login-submit':         auth_t('loginBtn'),
        'auth-login-switch-text':    auth_t('switchToRegister'),
        'auth-login-switch-link':    auth_t('switchToRegisterLink'),
        'auth-register-title':       auth_t('registerTitle'),
        'auth-register-name-label':  auth_t('nameLabel'),
        'auth-register-pass-label':  auth_t('passwordLabel'),
        'auth-register-confirm-label': auth_t('confirmLabel'),
        'auth-register-submit':      auth_t('registerBtn'),
        'auth-register-switch-text': auth_t('switchToLogin'),
        'auth-register-switch-link': auth_t('switchToLoginLink'),
    };
    var placeholders = {
        'auth-login-email':       'emailPlaceholder',
        'auth-login-password':    'passwordPlaceholder',
        'auth-register-name':     'namePlaceholder',
        'auth-register-email':    'emailPlaceholder',
        'auth-register-password': 'passwordPlaceholder',
        'auth-register-confirm':  'passwordPlaceholder',
    };
    Object.keys(ids).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.textContent = ids[id];
    });
    Object.keys(placeholders).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.placeholder = auth_t(placeholders[id]);
    });
}

window.auth_showLogin = function() {
    auth_injectModals();
    auth_refreshModalTexts();
    document.getElementById('auth-overlay').style.display = 'block';
    document.getElementById('auth-modal-login').style.display = 'block';
    document.getElementById('auth-modal-register').style.display = 'none';
};
window.auth_showRegister = function() {
    auth_injectModals();
    auth_refreshModalTexts();
    document.getElementById('auth-overlay').style.display = 'block';
    document.getElementById('auth-modal-register').style.display = 'block';
    document.getElementById('auth-modal-login').style.display = 'none';
};
window.auth_closeAll = function() {
    var ov = document.getElementById('auth-overlay');
    var ml = document.getElementById('auth-modal-login');
    var mr = document.getElementById('auth-modal-register');
    if (ov) ov.style.display = 'none';
    if (ml) ml.style.display = 'none';
    if (mr) mr.style.display = 'none';
};

window.auth_handleRegister = function() {
    var name     = document.getElementById('auth-register-name').value.trim();
    var email    = document.getElementById('auth-register-email').value.trim();
    var password = document.getElementById('auth-register-password').value;
    var confirm  = document.getElementById('auth-register-confirm').value;

    if (!name || !email || !password) return;
    if (password !== confirm) { alert(auth_t('errorPassMatch')); return; }

    var users = auth_getUsers();
    if (users.find(function(u){ return u.email === email; })) {
        alert(auth_t('errorEmailUsed')); return;
    }

    users.push({ name: name, email: email, password: password });
    auth_saveUsers(users);
    authCurrentUser = { name: name, email: email };
    auth_saveUser(authCurrentUser);
    auth_closeAll();
    auth_updateUI();
    bd_toast(auth_t('successRegister'));
};

window.auth_handleLogin = function() {
    var email    = document.getElementById('auth-login-email').value.trim();
    var password = document.getElementById('auth-login-password').value;
    var users    = auth_getUsers();
    var user     = users.find(function(u){ return u.email === email && u.password === password; });

    if (!user) { alert(auth_t('errorCredentials')); return; }

    authCurrentUser = { name: user.name, email: user.email };
    auth_saveUser(authCurrentUser);
    auth_closeAll();
    auth_updateUI();
    bd_toast(auth_t('successLogin') + user.name + '!');
};

window.auth_handleLogout = function() {
    authCurrentUser = null;
    localStorage.removeItem(AUTH_CURRENT_KEY);
    auth_updateUI();
    bd_toast(auth_t('successLogout'));
};

function auth_updateUI() {
    authCurrentUser = auth_getUser();
    var btnLogin    = document.getElementById('auth-btn-login');
    var btnRegister = document.getElementById('auth-btn-register');
    var userInfo    = document.getElementById('auth-user-info');
    var userAvatar  = document.getElementById('auth-user-avatar');
    var userName    = document.getElementById('auth-user-name');

    if (authCurrentUser) {
        if (btnLogin)    btnLogin.style.display    = 'none';
        if (btnRegister) btnRegister.style.display = 'none';
        if (userInfo)    userInfo.style.display    = 'flex';
        if (userAvatar)  userAvatar.textContent    = authCurrentUser.name.charAt(0).toUpperCase();
        if (userName)    userName.textContent      = authCurrentUser.name;
    } else {
        if (btnLogin)    btnLogin.style.display    = '';
        if (btnRegister) btnRegister.style.display = '';
        if (userInfo)    userInfo.style.display    = 'none';
    }
    if (document.getElementById('auth-comments-section')) {
        auth_renderComments(window._authCommentBookId || null);
    }
}

function auth_headerHTML() {
    return `<div id="auth-header-group" style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <button id="auth-btn-login" onclick="auth_showLogin()" style="
            font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:.14em;
            text-transform:uppercase; padding:6px 13px;
            border:1px solid var(--gold-dim); background:transparent; color:var(--muted);
            cursor:pointer; border-radius:2px;
            transition:background .2s, color .2s, border-color .2s;
        " onmouseover="this.style.background='var(--gold)';this.style.color='var(--black)';this.style.borderColor='var(--gold)'"
           onmouseout="this.style.background='transparent';this.style.color='var(--muted)';this.style.borderColor='var(--gold-dim)'">
            🔐 <span class="auth-btn-login-text"></span>
        </button>
        <button id="auth-btn-register" onclick="auth_showRegister()" style="
            font-family:'DM Mono',monospace; font-size:.6rem; letter-spacing:.14em;
            text-transform:uppercase; padding:6px 13px;
            border:1px solid var(--gold); background:var(--gold); color:var(--black);
            cursor:pointer; border-radius:2px; font-weight:600;
            transition:background .2s, box-shadow .2s;
        " onmouseover="this.style.background='#e0bb7a'" onmouseout="this.style.background='var(--gold)'">
            <span class="auth-btn-register-text"></span>
        </button>
        <div id="auth-user-info" style="display:none;align-items:center;gap:8px;">
            <div id="auth-user-avatar" style="
                width:28px; height:28px; border-radius:50%;
                background:var(--gold); color:var(--black);
                display:flex; align-items:center; justify-content:center;
                font-family:'DM Mono',monospace; font-size:.65rem; font-weight:700;
                flex-shrink:0;
            "></div>
            <span id="auth-user-name" class="auth-user-name-text" style="
                font-family:'DM Mono',monospace; font-size:.62rem;
                letter-spacing:.08em; color:var(--cream); white-space:nowrap;
            "></span>
            <button onclick="auth_handleLogout()" style="
                font-family:'DM Mono',monospace; font-size:.58rem; letter-spacing:.12em;
                text-transform:uppercase; padding:5px 10px;
                border:1px solid var(--border); background:transparent; color:var(--muted);
                cursor:pointer; border-radius:2px;
                transition:border-color .2s, color .2s;
            " onmouseover="this.style.borderColor='rgba(180,60,40,.5)';this.style.color='#d96060'"
               onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">
                <span class="auth-btn-logout-text"></span>
            </button>
        </div>
    </div>`;
}
//encore testé
function auth_updateHeaderTexts() {
    document.querySelectorAll('.auth-btn-login-text').forEach(function(el){
        el.textContent = auth_getLang() === 'fr' ? 'Connexion' : auth_getLang() === 'ar' ? 'دخول' : 'Login';
    });
    document.querySelectorAll('.auth-btn-register-text').forEach(function(el){
        el.textContent = auth_getLang() === 'fr' ? 'Inscription' : auth_getLang() === 'ar' ? 'تسجيل' : 'Sign up';
    });
    document.querySelectorAll('.auth-btn-logout-text').forEach(function(el){
        el.textContent = auth_getLang() === 'fr' ? 'Déconnexion' : auth_getLang() === 'ar' ? 'خروج' : 'Logout';
    });
    if (document.getElementById('auth-modal-login')) auth_refreshModalTexts();
    if (document.getElementById('auth-comments-section')) {
        auth_renderComments(window._authCommentBookId || null);
    }
}

function auth_getComments(bookId) {
    var key = bookId ? COMMENTS_KEY + ':' + bookId : COMMENTS_KEY;
    return JSON.parse(localStorage.getItem(key) || '[]');
}
function auth_saveComments(bookId, arr) {
    var key = bookId ? COMMENTS_KEY + ':' + bookId : COMMENTS_KEY;
    localStorage.setItem(key, JSON.stringify(arr));
}

window.auth_renderComments = function(bookId) {
    window._authCommentBookId = bookId || null;
    var container = document.getElementById('auth-comments-section');
    if (!container) return;

    authCurrentUser = auth_getUser();
    var comments = auth_getComments(bookId);
    var lang = auth_getLang();

    var formHTML = authCurrentUser
        ? `<div style="margin-bottom:20px;">
            <textarea id="auth-comment-input" rows="3" placeholder="${auth_t('commentPlaceholder')}" style="
                width:100%; padding:10px 13px;
                background:var(--input-bg); border:1px solid var(--border);
                border-radius:2px; color:var(--cream);
                font-family:'DM Mono',monospace; font-size:.72rem; line-height:1.6;
                outline:none; resize:vertical;
                transition:border-color .2s;
            " onfocus="this.style.borderColor='var(--gold-dim)'" onblur="this.style.borderColor='var(--border)'"></textarea>
            <button onclick="auth_postComment('${bookId || ''}')" style="
                margin-top:8px; padding:8px 18px;
                background:var(--gold); border:1px solid var(--gold); border-radius:2px;
                color:var(--black); font-family:'DM Mono',monospace;
                font-size:.6rem; letter-spacing:.14em; text-transform:uppercase;
                font-weight:600; cursor:pointer; transition:background .2s;
            " onmouseover="this.style.background='#e0bb7a'" onmouseout="this.style.background='var(--gold)'">
                ${auth_t('postComment')}
            </button>
           </div>`
        : `<p style="
            font-size:.68rem; letter-spacing:.06em; color:var(--muted);
            padding:14px 18px; border:1px solid var(--border); border-radius:2px;
            background:var(--input-bg); margin-bottom:20px;
           ">
            🔒
            <a onclick="auth_showLogin()" style="color:var(--gold);cursor:pointer;text-decoration:none;">${auth_t('loginToComment')}</a>
            ${auth_t('orRegister')}
            <a onclick="auth_showRegister()" style="color:var(--gold);cursor:pointer;text-decoration:none;">${auth_t('registerToComment')}</a>
            ${auth_t('toComment')}
           </p>`;

    var listHTML = '';
    if (comments.length === 0) {
        listHTML = `<p style="font-size:.65rem;letter-spacing:.1em;color:var(--muted);text-align:center;padding:28px 0;opacity:.6;">${auth_t('noComments')}</p>`;
    } else {
        listHTML = comments.map(function(c) {
            var canDelete = authCurrentUser && authCurrentUser.email === c.email;
            return `<div style="
                padding:14px 16px; border:1px solid var(--border); border-radius:3px;
                background:rgba(255,255,255,.02); margin-bottom:10px;
                transition:border-color .2s;
            " onmouseover="this.style.borderColor='var(--gold-dim)'" onmouseout="this.style.borderColor='var(--border)'">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px;">
                    <div style="
                        width:26px; height:26px; border-radius:50%;
                        background:var(--gold); color:var(--black);
                        display:flex; align-items:center; justify-content:center;
                        font-family:'DM Mono',monospace; font-size:.6rem; font-weight:700;
                        flex-shrink:0;
                    ">${c.author.charAt(0).toUpperCase()}</div>
                    <span style="font-size:.65rem;letter-spacing:.08em;color:var(--cream);font-weight:500;">${auth_esc(c.author)}</span>
                    <span style="font-size:.55rem;letter-spacing:.07em;color:var(--muted);margin-left:auto;">${c.date}</span>
                    ${canDelete ? `<button onclick="auth_deleteComment('${bookId || ''}', ${c.id})" style="
                        background:transparent; border:none; cursor:pointer;
                        padding:4px; display:flex; align-items:center; justify-content:center;
                        transition:transform .2s;
                    " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"
                       title="${auth_t('deleteConfirm')}">
                        <svg viewBox="0 0 448 512" style="width:13px;height:13px;fill:#d96060;opacity:.7;transition:opacity .2s;"
                             onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.7'">
                            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                        </svg>
                    </button>` : ''}
                </div>
                <p style="font-size:.72rem;line-height:1.7;color:rgba(240,232,216,.8);font-family:'Cormorant Garamond',serif;font-size:.95rem;font-style:italic;">${auth_esc(c.text)}</p>
            </div>`;
        }).join('');
    }

    container.innerHTML = formHTML + listHTML;
};

function auth_esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
//encore testé
window.auth_postComment = function(bookId) {
    authCurrentUser = auth_getUser();
    if (!authCurrentUser) { auth_showLogin(); return; }
    var input = document.getElementById('auth-comment-input');
    if (!input || !input.value.trim()) return;

    var lang = auth_getLang();
    var comments = auth_getComments(bookId || null);
    comments.unshift({
        id:     Date.now(),
        author: authCurrentUser.name,
        email:  authCurrentUser.email,
        text:   input.value.trim(),
        date:   new Date().toLocaleString(lang === 'fr' ? 'fr-FR' : lang === 'ar' ? 'ar-MA' : 'en-US')
    });
    auth_saveComments(bookId || null, comments);
    input.value = '';
    auth_renderComments(bookId || null);
};

window.auth_deleteComment = function(bookId, commentId) {
    authCurrentUser = auth_getUser();
    if (!authCurrentUser) return;
    var comments = auth_getComments(bookId || null);
    var comment  = comments.find(function(c){ return c.id === commentId; });
    if (!comment) return;
    if (comment.email !== authCurrentUser.email) { alert(auth_t('ownOnly')); return; }
    if (!confirm(auth_t('deleteConfirm'))) return;
    comments = comments.filter(function(c){ return c.id !== commentId; });
    auth_saveComments(bookId || null, comments);
    auth_renderComments(bookId || null);
    bd_toast(auth_t('deleteSuccess'));
};

window.auth_init = function() {
    auth_injectModals();
    auth_updateUI();
    auth_updateHeaderTexts();
};

(function() {
    var _orig = window.changeLanguage;
    window.changeLanguage = function(lang) {
        if (_orig) _orig(lang);
        auth_updateHeaderTexts();
    };
})();