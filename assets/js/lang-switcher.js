document.addEventListener('DOMContentLoaded', function() {
    var langSelect = document.getElementById('lang-select');
    if (!langSelect) return;

    var path = window.location.pathname;

    // Detect the current locale segment (/ja/, /en/, /zh/) in the path.
    var langs = ['ja', 'en', 'zh'];
    var currentLang = 'ja';
    var langSegIndex = -1; // index in the split parts where the locale sits
    var parts = path.split('/'); // e.g. ['', 'ja', 'column', 'rfid-vs-ai.html']
    for (var i = 0; i < parts.length; i++) {
        if (langs.indexOf(parts[i]) >= 0) {
            currentLang = parts[i];
            langSegIndex = i;
            break;
        }
    }
    langSelect.value = currentLang;

    langSelect.addEventListener('change', function() {
        var lang = this.value;
        if (lang === currentLang) return;

        function go(href) { window.location.href = href; }

        // Build the target URL by swapping ONLY the locale segment,
        // preserving any subpath (e.g. column/rfid-vs-ai.html).
        var target;
        var localeRoot; // same-locale root index.html, used as fallback
        if (langSegIndex >= 0) {
            var newParts = parts.slice();
            newParts[langSegIndex] = lang;
            target = newParts.join('/');
            localeRoot = parts.slice(0, langSegIndex).join('/') + '/' + lang + '/index.html';
        } else {
            // No locale in path (e.g. site root) — go to that locale's index.
            var idx = path.lastIndexOf('/');
            var b = (idx >= 0) ? path.substring(0, idx + 1) : '/';
            target = b + lang + '/index.html';
            localeRoot = target;
        }

        // Verify the translated page exists; fall back to the locale index if not.
        fetch(target, { method: 'HEAD' }).then(function(r) {
            if (r.ok) go(target);
            else go(localeRoot);
        }).catch(function() {
            go(localeRoot);
        });
    });
});
