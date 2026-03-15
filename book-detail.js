var AB_DB_NAME = 'bookshelf-db';
var AB_DB_VERSION = 1;
var AB_STORE = 'pdfs';

function ab_openDB(callback){
    var req = indexedDB.open(AB_DB_NAME, AB_DB_VERSION);
    req.onupgradeneeded = function(e){
        var db = e.target.result;
        if (!db.objectStoreNames.contains(AB_STORE)) db.createObjectStore(AB_STORE);
    };
    req.onsuccess = function(e){ callback(e.target.result); };
    req.onerror = function(){ callback(null); };
}

function ab_idb_get(key, callback){
    ab_openDB(function(db){
        if (!db) { callback(null); return; }
        var tx  = db.transaction(AB_STORE, 'readonly');
        var req = tx.objectStore(AB_STORE).get(key);
        req.onsuccess = function(){ callback(req.result || null); };
        req.onerror   = function(){ callback(null); };
    });
}

function ab_addToHistory(bookId){
    var hist = JSON.parse(localStorage.getItem('bookshelf-history') || '[]');
    hist = hist.filter(function(id){ return id !== bookId; });
    hist.unshift(bookId);
    if (hist.length > 10) hist = hist.slice(0, 10);
    localStorage.setItem('bookshelf-history', JSON.stringify(hist));
}

window.bd_toggleFav = function(){
    var books = JSON.parse(localStorage.getItem('bookshelf-books') || '[]');
    var isFav = false;
    for (var i=0; i<books.length; i++) {
        if (books[i].id === currentBookId) {
            books[i].favorite = !books[i].favorite;
            isFav = books[i].favorite;
            break;
        }
    }
    localStorage.setItem('bookshelf-books', JSON.stringify(books));
    bd_updateFavBtn(isFav);
    bd_toast(isFav ? '❤️ Added to favorites' : '💔 Removed from favorites');
};

function bd_updateFavBtn(isFav){
    var btn = document.getElementById('bd-fav-btn');
    if (!btn) return;
    btn.textContent = isFav ? '❤️' : '🤍';
    btn.classList.toggle('bd-fav-active', isFav);
}

function bd_saveRating(bookId, value){
    var books = JSON.parse(localStorage.getItem('bookshelf-books') || '[]');
    for (var i=0; i<books.length; i++) {
        if (books[i].id === bookId) { books[i].rating = value; break; }
    }
    localStorage.setItem('bookshelf-books', JSON.stringify(books));
}

function bd_renderStars(bookId, currentRating){
    var container = document.getElementById('bd-stars');
    if (!container) return;
    container.innerHTML = '';
    for (var s=1; s<=5; s++){
        var star = document.createElement('span');
        star.className = 'bd-star' + (s <= currentRating ? ' bd-star-on' : '');
        star.textContent = s <= currentRating ? '★' : '☆';
        star.dataset.val = s;
        star.addEventListener('mouseenter', (function(sv){
            return function(){
                document.querySelectorAll('.bd-star').forEach(function(st){
                    var kv = parseInt(st.dataset.val);
                    st.textContent = kv <= sv ? '★' : '☆';
                    st.style.color = kv <= sv ? '#f5a623' : '';
                    st.classList.toggle('bd-star-on', kv <= sv);
                });
            };
        })(s));
        star.addEventListener('mouseleave', function(){
            bd_renderStars(bookId, parseInt(container.dataset.rating || 0));
        });
        star.addEventListener('click', (function(sv){
            return function(){
                container.dataset.rating = sv;
                bd_saveRating(bookId, sv);
                bd_renderStars(bookId, sv);
                bd_toast('✓ ' + (
                    document.documentElement.lang === 'fr' ? 'Note sauvegardée' :
                    document.documentElement.lang === 'ar' ? 'تم حفظ التقييم' :
                    'Rating saved'
                ));
            };
        })(s));
        container.appendChild(star);
    }
    container.dataset.rating = currentRating;
}

function bd_toast(msg){
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#2a6e3f;color:#fff;padding:8px 20px;border-radius:3px;z-index:999;font-family:DM Mono,monospace;font-size:.78rem;letter-spacing:.1em;';
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 2500);
}
var params        = new URLSearchParams(window.location.search);
var id            = params.get('id');
var currentBookId = id;  
var books         = JSON.parse(localStorage.getItem('bookshelf-books') || '[]');
var book          = null;

for (var i = 0; i < books.length; i++) {
    if (books[i].id === id){ book = books[i]; break; }
}

window.addEventListener('load', function(){

    if (!book){
        document.querySelector('.detail-card').innerHTML =
            '<div style="padding:60px;text-align:center;font-family:Cormorant Garamond,serif;font-size:1.4rem;color:rgba(240,232,216,.5);">Book not found.</div>';
        return;
    }
    ab_addToHistory(book.id);

    var color = book.color  || '#3D2B1F';
    var rating = book.rating || 0;
    var lang = localStorage.getItem('preferredLanguage') || 'en';
    var face = document.getElementById('bd-cover-face');
    var spine = document.getElementById('bd-cover-spine');
    var ct = document.getElementById('bd-cover-title');
    if (face)  face.style.background  = color;
    if (spine) spine.style.background = 'linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.35)),' + color;
    if (ct) ct.textContent = book.title;
    var titleEl = document.getElementById('bd-book-title');
    var authorEl = document.getElementById('bd-book-author');
    if (titleEl) titleEl.textContent = book.title;
    if (authorEl) authorEl.textContent = book.author;
    var metaEl = document.getElementById('bd-meta-tags');
    if (metaEl){
        var tags = '';
        if (book.genre) tags += '<span class="bd-meta-tag">📚 ' + book.genre + '</span>';
        if (book.pubDate) tags += '<span class="bd-meta-tag">📅 ' + book.pubDate + '</span>';
        if (book.writtenDate) tags += '<span class="bd-meta-tag">✍️ ' + book.writtenDate + '</span>';
        metaEl.innerHTML = tags;
    }
    var summaryEl = document.getElementById('bd-book-summary');
    if (summaryEl){
        summaryEl.textContent = book.summary || '';
        summaryEl.style.display = book.summary ? 'block' : 'none';
    }
    bd_renderStars(book.id, rating);

    bd_updateFavBtn(!!book.favorite);
    var docSection = document.getElementById('bd-doc-section');
    var urlSection = document.getElementById('bd-url-section');
    var pdfSection = document.getElementById('bd-pdf-section');
    if (book.docLink || book.hasPdf){
        if (docSection) docSection.style.display = 'block';
        if (book.docLink && urlSection){
            urlSection.innerHTML = '<a href="' + book.docLink + '" target="_blank">🔗 ' +
                (lang === 'fr' ? 'Visiter le site →' :
                 lang === 'ar' ? '← زيارة الموقع'   :
                 'Visit site →') + '</a>';
        }

        if (book.hasPdf && pdfSection){
            pdfSection.innerHTML =
                '<p id="bd-pdf-msg" style="margin-bottom:12px;font-size:.78rem;color:var(--muted);">' +
                (lang === 'fr' ? 'Chargement du PDF…' :
                 lang === 'ar' ? 'جارٍ تحميل الملف…' :
                 'Loading PDF…') + '</p>' + '<iframe id="bd-pdf-viewer" width="100%" height="600px" style="border:none;display:none;border-radius:3px;"></iframe>';
            ab_idb_get('pdf-' + book.id, function(file){
                var msg = document.getElementById('bd-pdf-msg');
                var viewer = document.getElementById('bd-pdf-viewer');
                if (file) {
                    if (viewer){ viewer.src = URL.createObjectURL(file); viewer.style.display = 'block'; }
                    if (msg) msg.style.display = 'none';
                } else {
                    if (msg) msg.textContent =
                        lang === 'fr' ? '⚠️ PDF non disponible.' :
                        lang === 'ar' ? '⚠️ الملف غير متاح.'     :
                        '⚠️ PDF not available.';
                }
            });
        }
    }
});