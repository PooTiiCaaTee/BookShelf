var AB_KEY = 'bookshelf-books';
var AB_HIST_KEY = 'bookshelf-history';
var HIST_MAX = 10;
var books = [];
var currentView = localStorage.getItem('bookshelf-view') || 'grid';
var activeTab = 'all';
var container = document.getElementById('books-container');

function ab_esc(s){
    return String(s || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function ab_toast(msg){
    var wrap = document.getElementById('toasts');
    if (!wrap) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function(){ t.remove(); }, 3000);
}

function ab_renderStarsDisplay(rating){
    var html = '<span class="book-card-stars">';
    for (var s=1; s<=5; s++){
        html += '<span style="color:' + (s <= rating ? '#c9a96e' : 'rgba(240,232,216,.2)') + ';">' + (s <= rating ? '★' : '☆') + '</span>';}
    return html + '</span>';
}

function ab_statusBadge(status){
    var map = {
        'read': { label: 'Read',    cls: 'status-read' },
        'reading': { label: 'Reading', cls: 'status-reading' },
        'toread': { label: 'To Read', cls: 'status-toread' }
    };
    var s = map[status] || map['toread'];
    return '<span class="status-badge ' + s.cls + '">' + s.label + '</span>';
}

window.ab_switchTab = function(tab, e){
    activeTab = tab;
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    var panel = document.getElementById('tab-' + tab);
    if (panel) panel.classList.add('active');
    document.querySelectorAll('.tab-nav-btn').forEach(function(b){ b.classList.remove('active'); });
    if (e && e.currentTarget) e.currentTarget.classList.add('active');
    if (tab === 'all') renderBooks(document.getElementById('genre-filter').value.trim());
    if (tab === 'favorites') renderFavorites();
    if (tab === 'history') renderHistory();
};

function ab_updateStats(all){
    var total = all.length;
    var read = all.filter(function(b){ return b.status === 'read'; }).length;
    var reading = all.filter(function(b){ return b.status === 'reading'; }).length;
    var toread = all.filter(function(b){ return !b.status || b.status === 'toread'; }).length;
    var fav = all.filter(function(b){ return b.favorite; }).length;
    function set(id,val){ var el=document.getElementById(id); if(el) el.textContent=val; }
    set('stat-total',total);
    set('stat-read',read);
    set('stat-reading',reading);
    set('stat-toread',toread);
    set('stat-fav',fav);
    set('shelf-count',total);
    var hs = document.getElementById('header-stats');
    if (hs) hs.style.display = total === 0 ? 'none' : '';
}

window.ab_clearHistory = function(){
    localStorage.setItem(AB_HIST_KEY, '[]');
    renderHistory();
    ab_toast('History cleared.');
};

function renderHistory(){
    var histContainer = document.getElementById('history-container');
    if (!histContainer) return;
    var hist = JSON.parse(localStorage.getItem(AB_HIST_KEY) || '[]');
    var all = JSON.parse(localStorage.getItem(AB_KEY) || '[]');
    var histBooks = [];
    hist.forEach(function(id) {
        for (var i=0; i<all.length; i++){
            if (all[i].id ===id) { histBooks.push(all[i]); break; }}
    });
    if (histBooks.length === 0){
        histContainer.innerHTML = '<div class="shelf-empty"><div class="shelf-empty-icon">🕓</div>' + '<p class="shelf-empty-title">No history yet</p>' + '<p class="shelf-empty-sub">Books you open will appear here</p></div>';
        return;}
    histContainer.innerHTML = histBooks.map(function(b){return ab_buildMiniCard(b); }).join('');
}

function renderFavorites(){
    var favContainer = document.getElementById('favorites-container');
    if (!favContainer) return;
    var all = JSON.parse(localStorage.getItem(AB_KEY) || '[]');
    var favBooks = all.filter(function(b){ return b.favorite; });
    favContainer.className = currentView === 'list' ? 'books-list-view' : 'books-grid-view';
    if (favBooks.length === 0){
        favContainer.innerHTML = '<div class="shelf-empty"><div class="shelf-empty-icon">❤️</div>' + '<p class="shelf-empty-title">No favorites yet</p>' + '<p class="shelf-empty-sub">Press ❤️ on a book detail page to add it</p></div>';
        return;}
    var html = '';
    favBooks.forEach(function(b){
        var ri = -1;
        var allBooks = JSON.parse(localStorage.getItem(AB_KEY) || '[]');
        for (var i= 0; i<allBooks.length; i++) {
            if (allBooks[i].id === b.id){ ri = i; break; }
        }
        html += ab_buildCard(b, ri);
    });
    favContainer.innerHTML = html;
}

window.ab_setView = function(view){
    currentView = view;
    localStorage.setItem('bookshelf-view', view);
    var c = document.getElementById('books-container');
    var fc = document.getElementById('favorites-container');
    if (c) c.className = view === 'list' ? 'books-list-view' : 'books-grid-view';
    if (fc) fc.className = view === 'list' ? 'books-list-view' : 'books-grid-view';
    document.getElementById('btn-grid').classList.toggle('active', view === 'grid');
    document.getElementById('btn-list').classList.toggle('active', view === 'list');
    renderBooks(document.getElementById('genre-filter').value.trim());
    if (activeTab === 'favorites') renderFavorites();
};

(function(){
    var c = document.getElementById('books-container');
    if (c) c.className = currentView === 'list' ? 'books-list-view' : 'books-grid-view';
    setTimeout(function(){
        var bg=document.getElementById('btn-grid');
        var bl=document.getElementById('btn-list');
        if (bg) bg.classList.toggle('active', currentView === 'grid');
        if (bl) bl.classList.toggle('active', currentView === 'list');
    }, 0);
})();

function ab_buildMiniCard(b){
    var color = b.color || '#3D2B1F';
    return '<div class="mini-card" onclick="window.location.href=\'book-detail.html?id=' + ab_esc(b.id) + '\'">'
            + '<div class="mini-card-spine" style="background:' + color + '"></div>'
            + '<div class="mini-card-info">'
                + '<span class="mini-card-title">'  + ab_esc(b.title)  + '</span>'
                + '<span class="mini-card-author">' + ab_esc(b.author) + '</span>'
                + '</div>'
            + '</div>';
}

function ab_buildCard(b, ri){
    var color = b.color  || '#3D2B1F';
    var rating = b.rating || 0;
    var isGrid = currentView !== 'list';

    var docBtn = '';
    if (b.doclink){
        docBtn = '<a class="bc-btn" href="' + ab_esc(b.doclink) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">🔗 Open</a>';
    }else if (b.pdfData){
        docBtn = '<button class="bc-btn" onclick="ab_openPdf(' + ri + ', event)">📄 PDF</button>';}
    var html = '';
    if (isGrid){
        html += '<div class="book-card" onclick="window.location.href=\'book-detail.html?id=' + ab_esc(b.id) + '\'">';
        html += '<div class="book-3d"><div class="book-3d-inner">';
        html += '<div class="book-face" style="background:' + color + '">';
        html += '<span class="book-face-title">' + ab_esc(b.title) + '</span>';
        html += '<div class="book-face-deco"></div></div>';
        html += '<div class="book-spine" style="background:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.3)),' + color + '"></div>';
        html += '</div><div class="book-shadow"></div></div>';
        html += '<div class="book-card-info">';
        html += '<div class="book-card-title">'  + ab_esc(b.title)  + '</div>';
        html += '<div class="book-card-author">' + ab_esc(b.author) + '</div>';
        if (b.genre) html += '<div class="book-card-genre">' + ab_esc(b.genre) + '</div>';
        html += ab_statusBadge(b.status);
        html += rating>0 ? ab_renderStarsDisplay(rating) : '<span class="book-card-unrated">unrated</span>';
        if (docBtn) html += '<div class="book-card-actions">' + docBtn + '</div>';
        html += '</div></div>';
    }else {
        html += '<div class="book-list-row" onclick="window.location.href=\'book-detail.html?id=' + ab_esc(b.id) + '\'">';
        html += '<div class="list-spine" style="background:' + color + '"></div>';
        html += '<div class="list-info">';
        html += '<span class="list-title">'  + ab_esc(b.title)  + '</span>';
        html += '<span class="list-author">' + ab_esc(b.author) + '</span>';
        html += '</div>';
        if (b.genre) html += '<span class="list-genre">' + ab_esc(b.genre) + '</span>';
        html += ab_statusBadge(b.status);
        html += rating>0 ? ab_renderStarsDisplay(rating) : '<span class="book-card-unrated">—</span>';
        if (docBtn) html += '<div class="list-actions">' + docBtn + '</div>';
        html += '</div>';
    }

    return html;
}

window.ab_openPdf = function(realIdx, e){
    e.stopPropagation();
    var all = JSON.parse(localStorage.getItem(AB_KEY) || '[]');
    var book = all[realIdx];
    if (!book || !book.pdfData) return;
    var bytes = atob(book.pdfData);
    var arr = new Uint8Array(bytes.length);
    for (var i=0; i<bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    var blob = new Blob([arr], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob), '_blank');
};

function renderBooks(filter){
    books = JSON.parse(localStorage.getItem(AB_KEY) || '[]');
    ab_updateStats(books);
    var query = (filter || '').toLowerCase();
    var filtered = [];
    var realIdxs = [];
    for (var i=0; i<books.length; i++){
        var b = books[i];
        var matchText = !query
            || (b.title  || '').toLowerCase().indexOf(query) !== -1
            || (b.author || '').toLowerCase().indexOf(query) !== -1
            || (b.genre  || '').toLowerCase().indexOf(query) !== -1;
        if (matchText) { filtered.push(b); realIdxs.push(i); }
    }
    if (filtered.length === 0){
        container.innerHTML = query
            ? '<div class="shelf-empty"><div class="shelf-empty-icon">🔍</div>'
            + '<p class="shelf-empty-title">No results</p>'
            + '<p class="shelf-empty-sub">Try a different search</p></div>'
            : '<div class="shelf-empty"><div class="shelf-empty-icon">📚</div>'
            + '<p class="shelf-empty-title">Your shelf is empty</p>'
            + '<p class="shelf-empty-sub">Start by adding your first book</p>'
            + '<a href="add-book.html" class="shelf-empty-link">+ Add a book</a></div>';
        return;
    }

    var html = '';
    for (var j=0; j<filtered.length; j++) {
        html += ab_buildCard(filtered[j], realIdxs[j]);
    }
    container.innerHTML = html;
}

document.getElementById('genre-filter').addEventListener('input', function() {
    renderBooks(this.value.trim());
});

renderBooks('');

window.addEventListener('focus', function() {
    renderBooks(document.getElementById('genre-filter').value.trim());
    if (activeTab === 'favorites') renderFavorites();
    if (activeTab === 'history') renderHistory();
});