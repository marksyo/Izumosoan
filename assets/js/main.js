// 出云创安网站主要JavaScript文件
// 基本交互功能

document.addEventListener('DOMContentLoaded', function() {
    console.log('Izumo Soan website loaded');
    // Mobile hamburger menu toggle
    var hamburger = document.getElementById('hamburger');
    var nav = document.querySelector('header nav');
    if (hamburger && nav) {
        hamburger.addEventListener('click', function() {
            nav.classList.toggle('open');
            hamburger.classList.toggle('active');
        });
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                nav.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
    }
});