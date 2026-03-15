document.addEventListener('DOMContentLoaded', function (){
    var placeholder = document.getElementById('auth-header-placeholder');
        if (placeholder){
            placeholder.outerHTML = auth_headerHTML();}
    auth_init();
});
