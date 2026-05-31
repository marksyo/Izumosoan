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
        var base = '';
        var siteIdx = path.indexOf('/new-site/');
        if (siteIdx >= 0) {
            base = path.substring(0, siteIdx + 10);
        } else {
            base = path.substring(0, path.lastIndexOf('/') + 1);
        }
        function go(href) {
            window.location.href = href;
        }
        function fallback() {
            if (lang === 'ja') go(base + 'index.html');
            else go(base + lang + '/index.html');
        }
        var target = (lang === 'ja') ? base + filename : base + lang + '/' + filename;
        // Check if target page exists; fallback to index if not
        fetch(target, { method: 'HEAD' }).then(function(r) {
            if (r.ok) go(target);
            else fallback();
        }).catch(function() {
            fallback();
        });
    });
});