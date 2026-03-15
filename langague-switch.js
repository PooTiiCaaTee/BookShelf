let currentLang =localStorage.getItem('preferredLanguage') || 'en';

    function changeLanguage(langue){
        currentLang=langue;
        localStorage.setItem('preferredLanguage', langue);
        applyLanguage(langue);
    }
    function applyLanguage(langue){
        document.querySelectorAll('#lang-group button').forEach(x => {
            x.classList.toggle('active', x.textContent.trim().toLowerCase()=== langue.toLowerCase());});
        document.querySelectorAll('[data-en]').forEach(el => {
            const value = el.getAttribute('data-' + langue);
            if (value !== null && value !== '') {
                el.innerHTML = value;}});
        document.documentElement.setAttribute('dir',  langue === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', langue);
    }
applyLanguage(currentLang);

/*function applyLangAttributes(langue) {
    document.querySelectorAll('.langue-x').forEach(x => {
        const map = { 'EN': 'en', 'FR': 'fr', 'AR': 'ar' }; x.classList.toggle('active', map[x.textContent.trim()] === langue);});
    document.querySelectorAll('[data-en]').forEach(el =>{if (!el.querySelector('[data-en]')){el.textContent = el.getAttribute('data-' + langue);}})
    document.documentElement.setAttribute('dir', langue === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('langue', langue);
}*/
 