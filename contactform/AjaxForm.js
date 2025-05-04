/**
 * 表单提交处理及reCAPTCHA v3集成
 * @see https://developers.google.com/recaptcha/docs/v3
 */
const reCAPTCHA_SITE_KEY = '6LcvrBcrAAAAAFZ_zegpjQnud2i7Mn0_xjrnHeNq';

// 页面加载初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeRecaptcha();
    setupFormValidation();
});

// reCAPTCHA初始化
function initializeRecaptcha() {
    grecaptcha.ready(() => {
        refreshRecaptchaToken();
    });
}

// 刷新reCAPTCHA token
function refreshRecaptchaToken() {
    grecaptcha.execute(reCAPTCHA_SITE_KEY, { action: 'submit' })
        .then(token => {
            document.querySelector('[name="recaptcha-token"]').value = token;
        });
}

// 表单验证和提交配置
function setupFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            // 表单验证状态检查
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            // 显示加载状态
            const spinner = form.querySelector('.loading-spinner');
            const submitBtn = form.querySelector('button[type="submit"]');
            showLoadingState(spinner, submitBtn);

            try {
                // 准备表单数据
                const formData = new FormData(form);
                console.log (formData);
                // 发送请求
                const response = await fetch('https://kaiseiweb.onrender.com/contactform/AjaxForm.php', {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'omit',
                    body: formData
                });

                // 处理响应
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const result = await response.json();
                handleResponse(form, result);

            } catch (error) {
                handleError(form, error);
            } finally {
                // 重置UI状态
                hideLoadingState(spinner, submitBtn);
                // 刷新reCAPTCHA token
                refreshRecaptchaToken();
            }
        });
    });
}

// 显示加载状态
function showLoadingState(spinner, button) {
    spinner?.classList.remove('d-none');
    button.disabled = true;
}

// 隐藏加载状态
function hideLoadingState(spinner, button) {
    spinner?.classList.add('d-none');
    button.disabled = false;
}

// 处理成功响应
function handleResponse(form, result) {
    const alertContainer = form.querySelector('#alert-statut');
    
    // 清空旧消息
    alertContainer.innerHTML = '';
    
    // 创建消息元素
    const alert = document.createElement('div');
    alert.className = `alert ${result.error ? 'alert-danger' : 'alert-success'}`;
    alert.textContent = result.message;
    
    // 添加动效
    alert.style.opacity = 0;
    alertContainer.appendChild(alert);
    setTimeout(() => alert.style.opacity = 1, 10);

    // 成功时重置表单
    if (!result.error) {
        form.reset();
        form.classList.remove('was-validated');
    }

    // 自动隐藏消息
    setTimeout(() => {
        alert.style.opacity = 0;
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// 处理错误
function handleError(form, error) {
    console.error('Submission error:', error);
    
    const alertContainer = form.querySelector('#alert-statut');
    alertContainer.innerHTML = `
        <div class="alert alert-danger fade-in">
            ${error.message || '网络请求失败，请稍后重试'}
        </div>
    `;
}

// 样式建议（添加到CSS文件）
/*
.fade-in {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
*/