let currentTheme = localStorage.getItem('preferredTheme') || 'dark';

    function changeTheme(them){
        currentTheme = them;
        localStorage.setItem('preferredTheme', them);
        applyTheme(them);
    }
    function applyTheme(them){
        document.body.classList.toggle('theme-normal', them==='normal');
        document.querySelectorAll('#theme-group button').forEach(x => {
            x.classList.toggle('active',x.getAttribute('data-en').toLowerCase() ===them);});
    }
applyTheme(currentTheme); 