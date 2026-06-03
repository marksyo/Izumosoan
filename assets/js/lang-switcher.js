document.addEventListener('DOMContentLoaded', function() {
    var langSelect = document.getElementById('lang-select');
    if (!langSelect) return;

    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    var currentLang = 'ja';
    if (path.includes('/en/')) currentLang = 'en';
    else if (path.includes('/zh/')) currentLang = 'zh';
    langSelect.value = currentLang;

    langSelect.addEventListener('change', function() {
        var lang = this.value;
        var root = '../';
        function go(href) {
            window.location.href = href;
        }
        function fallback() {
            go(root + lang + '/index.html');
        }
        var target = root + lang + '/' + filename;
        // Check if target page exists; fallback to index if not
        fetch(target, { method: 'HEAD' }).then(function(r) {
            if (r.ok) go(target);
            else fallback();
        }).catch(function() {
            fallback();
        });
    });
});