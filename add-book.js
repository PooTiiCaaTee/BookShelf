var AB_COLORS=['#8B2E16','#1B4332','#1A1A5E','#5C2D8E','#7B3F00','#1D3461','#4A0E0E','#0D3B2E','#3D2B1F','#2C3E50','#6B4226','#2E4057','#52414C','#3B1F2B','#1C3144'];
var AB_KEY='bookshelf-books';
var ab_books=[];
var ab_editId=null;
var ab_color=AB_COLORS[8];
var ab_pdfFile=null;
var ab_pdfName='';
var ab_docTab='url';
var ab_pdfStore={};
var AB_DB_NAME='bookshelf-db';
var AB_DB_VERSION=1;
var AB_STORE='pdfs';
var ab_db=null;

function ab_openDB(callback){
    if(ab_db){callback(ab_db);return;}
    var req=indexedDB.open(AB_DB_NAME,AB_DB_VERSION);
    req.onupgradeneeded=function(e){var db=e.target.result;if(!db.objectStoreNames.contains(AB_STORE))db.createObjectStore(AB_STORE);};
    req.onsuccess=function(e){ab_db=e.target.result;callback(ab_db);};
    req.onerror=function(){console.error('Erreur ouverture IndexedDB');};
}

function ab_idb_save(key,file,callback){
    ab_openDB(function(db){
        var tx=db.transaction(AB_STORE,'readwrite');
        tx.objectStore(AB_STORE).put(file,key);
        tx.oncomplete=function(){if(callback)callback();};
        tx.onerror=function(){console.error('Erreur sauvegarde PDF');};});
}
function ab_idb_get(key,callback){
    ab_openDB(function(db){
        var tx=db.transaction(AB_STORE,'readonly');
        var req=tx.objectStore(AB_STORE).get(key);
        req.onsuccess=function(){callback(req.result||null);};
        req.onerror=function(){callback(null);};});
}
function ab_idb_delete(key){
    ab_openDB(function(db){
        var tx=db.transaction(AB_STORE,'readwrite');
        tx.objectStore(AB_STORE).delete(key);});
}

function ab_isValidDate(val){if(!val)return true;var d=new Date(val);if(isNaN(d.getTime()))return false;var y=d.getFullYear();return y>=1000&&y<=2100;}
function ab_datesCoherentes(w,p){if(!w||!p)return true;return new Date(w)<=new Date(p);}
function ab_uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2);}
function ab_esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function ab_gv(id){var el=document.getElementById(id);return el?el.value.trim():'';}
function ab_el(id){return document.getElementById(id);}
function ab_loadBooks(){try{var d=localStorage.getItem(AB_KEY);ab_books=d?JSON.parse(d):[];}catch(e){ab_books=[];}}
function ab_saveBooks(){localStorage.setItem(AB_KEY,JSON.stringify(ab_books));}

function ab_init(){
    ab_loadBooks();
    ab_buildColors();
    ab_attachEvents();
    ab_attachStatusBtns();
    ab_renderList();
    ab_syncPreview();
    var params = new URLSearchParams(window.location.search);
    var editId = params.get('edit');
    if (editId){
        var found = false;
        for (var i=0; i<ab_books.length; i++) {
            if (ab_books[i].id === editId) {
                ab_loadEdit(ab_books[i].id);
                found = true;
                break;
            }
        }
        if (!found) {
            ab_toast('Livre introuvable.', 'error');
        }
    }else {
        var editIdx = localStorage.getItem('bookshelf_edit_idx');
        if (editIdx !== null) {
            var idx = parseInt(editIdx);
            if (!isNaN(idx) && ab_books[idx]) { ab_loadEdit(ab_books[idx].id); }
            localStorage.removeItem('bookshelf_edit_idx');
        }
    }
}

function ab_attachStatusBtns(){
    var group=ab_el('ab-status-group');
    if(!group)return;
    var btns=group.querySelectorAll('.status-btn');
    for(var i=0;i<btns.length;i++){
        btns[i].addEventListener('click',(function(btn){
            return function(){
                var all=group.querySelectorAll('.status-btn');
                for(var k=0;k<all.length;k++) all[k].classList.remove('active');
                btn.classList.add('active');
                var hidden=ab_el('ab-status');
                if(hidden) hidden.value=btn.dataset.value;
            };
        })(btns[i]));
    }
}

function ab_getStatus(){
    var hidden=ab_el('ab-status');
    return hidden?hidden.value:'toread';
}

function ab_setStatus(val){
    var group=ab_el('ab-status-group');
    var hidden=ab_el('ab-status');
    if(!group)return;
    var btns=group.querySelectorAll('.status-btn');
    for(var i=0;i<btns.length;i++){
        btns[i].classList.toggle('active', btns[i].dataset.value===val);
    }
    if(hidden) hidden.value=val||'toread';
}

function ab_buildColors(){
    var row=ab_el('ab-color-row');
    if(!row)return;
    var html='';
    for(var i=0;i<AB_COLORS.length;i++){
        var c=AB_COLORS[i];
        html+='<div class="ab-swatch'+(c===ab_color?' ab-swatch-on':'')+'" data-color="'+c+'" style="background:'+c+';width:24px;height:24px;border-radius:2px;cursor:pointer;display:inline-block;margin:2px;border:2px solid '+(c===ab_color?'#fff':'transparent')+'"></div>';}
    row.innerHTML=html;
    var swatches=row.querySelectorAll('.ab-swatch');
    for(var j=0;j<swatches.length;j++){
        swatches[j].addEventListener('click',function(){
            ab_color=this.dataset.color;
            var all=document.querySelectorAll('.ab-swatch');
            for(var k=0;k<all.length;k++) all[k].style.border='2px solid transparent';
            this.style.border='2px solid #fff';
            ab_syncPreview();
        });
    }
}

function ab_attachEvents(){
    var ids=['ab-title','ab-author'];
    for(var i=0;i<ids.length;i++){var el=ab_el(ids[i]);if(el)el.addEventListener('input',ab_syncPreview);}
    var summaryEl=ab_el('ab-summary');
    if(summaryEl)summaryEl.addEventListener('input',function(){ab_syncPreview();ab_charCount();});
    var doclinkEl=ab_el('ab-doclink');
    if(doclinkEl)doclinkEl.addEventListener('input',ab_checkUrl);
    var pubEl=ab_el('ab-pubdate');
    var writtenEl=ab_el('ab-writtendate');
    if(pubEl)pubEl.addEventListener('change',ab_validateDatesUI);
    if(writtenEl)writtenEl.addEventListener('change',ab_validateDatesUI);
    var tabUrl=ab_el('ab-tab-url');
    var tabPdf=ab_el('ab-tab-pdf');
    if(tabUrl)tabUrl.addEventListener('click',function(){ab_switchTab('url');});
    if(tabPdf)tabPdf.addEventListener('click',function(){ab_switchTab('pdf');});
    var pdfInput=ab_el('ab-pdf-input');
    var pdfDrop=ab_el('ab-pdf-dropzone');
    var pdfClear=ab_el('ab-btn-clear-pdf');
    if(pdfInput)pdfInput.addEventListener('change',function(){if(this.files&&this.files[0])ab_loadPdf(this.files[0]);});
    if(pdfDrop){
        pdfDrop.addEventListener('click',function(){ab_el('ab-pdf-input').click();});
        pdfDrop.addEventListener('dragover',function(e){e.preventDefault();});
        pdfDrop.addEventListener('drop',ab_handlePdfDrop);
    }
    if(pdfClear)pdfClear.addEventListener('click',ab_clearPdf);
    var saveBtn=ab_el('ab-save-btn');
    var resetBtn=ab_el('ab-btn-reset');
    if(saveBtn)saveBtn.addEventListener('click',ab_submit);
    if(resetBtn)resetBtn.addEventListener('click',function(){ab_resetForm();ab_setMode('add');});
}

function ab_validateDatesUI(){
    var pubEl=ab_el('ab-pubdate');
    var writtenEl=ab_el('ab-writtendate');
    if(pubEl)pubEl.style.border=ab_isValidDate(pubEl.value)?'':'1px solid #c0401a';
    if(writtenEl)writtenEl.style.border=ab_isValidDate(writtenEl.value)?'':'1px solid #c0401a';
}

function ab_syncPreview(){
    var title=ab_gv('ab-title');
    var author=ab_gv('ab-author');
    var summary=ab_gv('ab-summary');
    ab_setPv('ab-pv-title',title,'Titre du livre');
    ab_setPv('ab-pv-author',author,"Nom de l'auteur");
    ab_setPv('ab-pv-summary',summary,'Le résumé apparaîtra ici…');
    var gen=ab_el('ab-pv-cover-gen');
    var spine=ab_el('ab-pv-spine');
    var ct=ab_el('ab-pv-cover-title');
    if(gen)gen.style.background=ab_color;
    if(spine)spine.style.background='linear-gradient(to bottom,rgba(0,0,0,0.55),rgba(0,0,0,0.35)),'+ab_color;
    if(ct)ct.textContent=title||'?';
}

function ab_setPv(id,val,ph){var el=ab_el(id);if(!el)return;el.textContent=val||ph;el.style.color=val?'':'#555';}
function ab_charCount(){var len=ab_gv('ab-summary').length;var hint=ab_el('ab-char-hint');if(hint)hint.textContent=len+' / 320';}
function ab_checkUrl(){
    var v=ab_gv('ab-doclink');
    var el=ab_el('ab-url-indicator');
    if(!el)return;
    if(!v){el.textContent='🔗';return;}
    try{new URL(v);el.textContent='✅';}
    catch(e){el.textContent='⚠️';}
}

function ab_switchTab(tab){
    ab_docTab=tab;
    var urlWrap=ab_el('ab-doc-url-wrap');
    var pdfWrap=ab_el('ab-doc-pdf-wrap');
    var tabUrl=ab_el('ab-tab-url');
    var tabPdf=ab_el('ab-tab-pdf');
    if(urlWrap)urlWrap.style.display=(tab==='url')?'block':'none';
    if(pdfWrap)pdfWrap.style.display=(tab==='pdf')?'block':'none';
    if(tabUrl)tabUrl.classList.toggle('active',tab==='url');
    if(tabPdf)tabPdf.classList.toggle('active',tab==='pdf');
}
function ab_handlePdfDrop(e){
    e.preventDefault();
    var file=e.dataTransfer.files[0];
    if(file&&file.type==='application/pdf')ab_loadPdf(file);
    else ab_toast('Veuillez déposer un fichier PDF.','error');
}
function ab_loadPdf(file){
    ab_pdfFile=file;ab_pdfName=file.name;
    var nameEl=ab_el('ab-pdf-name');
    var infoEl=ab_el('ab-pdf-info');
    if(nameEl)nameEl.textContent=ab_pdfName;
    if(infoEl)infoEl.style.display='block';
}
function ab_clearPdf(){
    ab_pdfFile=null;ab_pdfName='';
    var input=ab_el('ab-pdf-input');
    var nameEl=ab_el('ab-pdf-name');
    var infoEl=ab_el('ab-pdf-info');
    if(input)input.value='';
    if(nameEl)nameEl.textContent='';
    if(infoEl)infoEl.style.display='none';
}
function ab_openPdf(bookId){
    var file=ab_pdfStore[bookId];
    if(file){window.open(URL.createObjectURL(file),'_blank');return;}
    ab_idb_get('pdf-'+bookId,function(f){
        if(f)window.open(URL.createObjectURL(f),'_blank');
        else ab_toast('PDF non disponible. Veuillez le rattacher au livre.','error');
    });
}

function ab_submit(){
    var title=ab_gv('ab-title');
    var author=ab_gv('ab-author');
    var summary=ab_gv('ab-summary');
    var pubDate=ab_gv('ab-pubdate');
    var writtenDate=ab_gv('ab-writtendate');
    var genre=ab_gv('ab-genre');
    var status=ab_getStatus();
    var docLink=(ab_docTab==='url')?ab_gv('ab-doclink'):'';
    var hasPdf=(ab_docTab==='pdf')&&(ab_pdfFile!==null);

    var fields=[['ab-title',title],['ab-author',author]];
    var valid=true;
    for(var i=0;i<fields.length;i++){
        var el=ab_el(fields[i][0]);
        if(!fields[i][1]){if(el)el.style.border='1px solid #c0401a';valid=false;}
        else{if(el)el.style.border='';}
    }
    if(!valid){ab_toast('Veuillez remplir les champs obligatoires.','error');return;}
    if(docLink){try{new URL(docLink);}catch(e){ab_toast('Le lien doit être une URL correcte.','error');return;}}
    if(!ab_isValidDate(pubDate)){var el=ab_el('ab-pubdate');if(el)el.style.border='1px solid #c0401a';ab_toast('Date de publication invalide.','error');return;}
    if(!ab_isValidDate(writtenDate)){var el=ab_el('ab-writtendate');if(el)el.style.border='1px solid #c0401a';ab_toast("Date d'écriture invalide.",'error');return;}
    if(!ab_datesCoherentes(writtenDate,pubDate)){ab_toast("La date d'écriture ne peut pas être après la date de publication.",'error');return;}
    var entry={title:title,author:author,summary:summary,pubDate:pubDate,writtenDate:writtenDate,genre:genre,status:status,docLink:docLink,hasPdf:hasPdf,docPdfName:hasPdf?ab_pdfName:'',color:ab_color};
    if(ab_editId){
        for(var j=0;j<ab_books.length;j++){
            if(ab_books[j].id===ab_editId){
                ab_books[j]=Object.assign({},ab_books[j],entry);
                if(hasPdf){ab_pdfStore[ab_editId]=ab_pdfFile;ab_idb_save('pdf-'+ab_editId,ab_pdfFile);}
                break;}
        }
        ab_toast('Livre mis à jour !');
    }else{
        var newBook=Object.assign({id:ab_uid(),dateAdded:Date.now()},entry);
        if(hasPdf){ab_pdfStore[newBook.id]=ab_pdfFile;ab_idb_save('pdf-'+newBook.id,ab_pdfFile);}
        ab_books.unshift(newBook);
        ab_toast('Livre ajouté !');
    }
    ab_saveBooks();
    ab_resetForm();
    ab_setMode('add');
    ab_renderList();
    setTimeout(function(){window.location.href='index.html';},1000);
}

function ab_resetForm(){
    var ids=['ab-title','ab-author','ab-summary','ab-pubdate','ab-writtendate','ab-genre','ab-doclink'];
    for(var i=0;i<ids.length;i++){var el=ab_el(ids[i]);if(el){el.value='';el.style.border='';}}
    var hint=ab_el('ab-char-hint');
    var ind=ab_el('ab-url-indicator');
    if(hint)hint.textContent='0 / 320';
    if(ind)ind.textContent='🔗';
    ab_color=AB_COLORS[8];
    ab_clearPdf();
    ab_switchTab('url');
    ab_buildColors();
    ab_setStatus('toread');
    ab_syncPreview();
}

function ab_loadEdit(id){
    var b=null;
    for(var i=0;i<ab_books.length;i++){if(ab_books[i].id===id){b=ab_books[i];break;}}
    if(!b)return;
    ab_editId=id;
    ab_setMode('edit');
    var map={'ab-title':b.title,'ab-author':b.author,'ab-summary':b.summary,'ab-pubdate':b.pubDate,'ab-writtendate':b.writtenDate,'ab-genre':b.genre,'ab-doclink':b.docLink};
    for(var key in map){var el=ab_el(key);if(el)el.value=map[key]||'';}
    ab_color=b.color||AB_COLORS[8];
    ab_setStatus(b.status||'toread');
    ab_buildColors();ab_checkUrl();ab_charCount();ab_syncPreview();
    if(b.hasPdf){
        ab_switchTab('pdf');
        var nameEl=ab_el('ab-pdf-name');
        var infoEl=ab_el('ab-pdf-info');
        var dropEl=ab_el('ab-pdf-dropzone');
        if(nameEl) nameEl.textContent = b.docPdfName || 'PDF existant';
        if(infoEl) infoEl.style.display = 'block';
        ab_idb_get('pdf-'+id, function(file){
            if(file){
                ab_pdfFile = file;
                ab_pdfName = file.name || b.docPdfName || 'PDF';
                if(nameEl) nameEl.textContent = ab_pdfName;
                if(dropEl) dropEl.querySelector('p').textContent = '✅ ' + ab_pdfName + ' (cliquer pour remplacer)';
            }else {
                if(nameEl) nameEl.textContent = (b.docPdfName || 'PDF') + ' (non disponible localement)';
                if(infoEl) infoEl.style.display = 'block';
                if(dropEl) dropEl.querySelector('p').textContent = '⚠️ PDF non disponible — cliquer pour en choisir un nouveau';
            }
        });
    } else if(b.docLink){
        ab_switchTab('url');
    }
    var rightCol = document.querySelector('.right-col');
    if(rightCol) rightCol.scrollIntoView({behavior:'smooth', block:'start'});
}

function ab_setMode(mode){
    var isEdit=(mode==='edit');
    ab_editId=isEdit?ab_editId:null;
    var title=ab_el('ab-form-title');
    var modeTag=ab_el('ab-mode-tag');
    var saveBtn=ab_el('ab-save-btn');
    var lang = localStorage.getItem('preferredLanguage') || 'en';
    if(title) title.textContent = isEdit
        ? (lang==='fr' ? 'Modifier le livre' : lang==='ar' ? 'تعديل الكتاب' : 'Edit book')
        : (lang==='fr' ? 'Nouveau livre'     : lang==='ar' ? 'كتاب جديد'    : 'New book');
    if(modeTag) modeTag.textContent = isEdit
        ? (lang==='fr' ? 'Édition' : lang==='ar' ? 'تعديل' : 'Edit')
        : (lang==='fr' ? 'Ajout'   : lang==='ar' ? 'إضافة' : 'Add');
    if(saveBtn) saveBtn.textContent = isEdit
        ? (lang==='fr' ? 'Mettre à jour →' : lang==='ar' ? '← تحديث' : 'Update →')
        : (lang==='fr' ? 'Enregistrer →'   : lang==='ar' ? '← حفظ'   : 'Save →');
}

function ab_delete(id){
    if(!confirm('Supprimer ce livre ?'))return;
    ab_books=ab_books.filter(function(b){return b.id!==id;});
    delete ab_pdfStore[id];
    ab_idb_delete('pdf-'+id);
    if(ab_editId===id){ab_editId=null;ab_resetForm();ab_setMode('add');}
    ab_saveBooks();ab_renderList();
    ab_toast('Livre supprimé.');
}

function ab_renderList(){
    var list=ab_el('ab-book-list');
    var badge=ab_el('ab-count-badge');
    var badge2=ab_el('ab-count-badge-2');
    if(!list)return;
    if(badge)badge.textContent=ab_books.length;
    if(badge2)badge2.textContent=ab_books.length;
    if(!ab_books.length){list.innerHTML='<p>Aucun livre encore. Remplissez le formulaire pour commencer.</p>';return;}
    var statusLabel={'read':'✅','reading':'📖','toread':'🔖'};
    var html='';
    for(var i=0;i<ab_books.length;i++){
        var b=ab_books[i];var color=b.color||'#3D2B1F';
        html+='<div class="ab-book-card">';
            html+='<div class="ab-book-3d"><div class="ab-book-3d-inner">';
                html+='<div class="ab-book-face" style="background:'+color+'">';
                    html+='<span class="ab-book-face-title">'+ab_esc(b.title)+'</span>';
                    html+='<div class="ab-book-face-deco"></div></div>';
                html+='<div class="ab-book-spine" style="background:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.3)),'+color+'"></div>';
            html+='</div><div class="ab-book-shadow"></div></div>';
        html+='<div class="ab-book-card-info">';
            html+='<div class="ab-book-card-title">'+ab_esc(b.title)+'</div>';
            html+='<div class="ab-book-card-author">'+ab_esc(b.author)+'</div>';
            if(b.status) html+='<span style="font-size:.6rem;letter-spacing:.1em;">'+(statusLabel[b.status]||'🔖')+' '+b.status+'</span>';
            if(b.docLink)html+='<a href="'+ab_esc(b.docLink)+'" target="_blank">🔗 Document</a>';
            if(b.hasPdf)html+='<button onclick="ab_openPdf(\''+b.id+'\')">📄 '+ab_esc(b.docPdfName||'PDF')+'</button>';
            html+='<div class="ab-book-card-actions">';
                html+='<button onclick="ab_loadEdit(\''+b.id+'\')">Modifier</button>';
                html+='<button onclick="ab_delete(\''+b.id+'\')">Supprimer</button>';
            html+='</div></div></div>';
    }
    list.innerHTML=html;
}

function ab_toast(msg,type){
    var container=ab_el('ab-toasts');
    if(!container)return;
    var el=document.createElement('div');
    el.style.cssText='padding:8px 12px;margin:4px;background:'+(type==='error'?'#c0401a':'#2a6e3f')+';color:#fff;border-radius:4px;font-family:DM Mono,monospace;font-size:.8rem;';
    el.textContent=msg;
    container.appendChild(el);
    setTimeout(function(){el.remove();},3500);
}

window.addEventListener('load',ab_init);