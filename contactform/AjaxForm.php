<?php
//reCAPTCHA-V3 setting
//sitekey=6LcvrBcrAAAAAFZ_zegpjQnud2i7Mn0_xjrnHeNq
//secretkey=6LcvrBcrAAAAAB2WMCv3VjB-0RyeJUsUjUvEe5iB

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

# https://www.php.net/manual/fr/timezones.php
date_default_timezone_set('Asia/Tokyo');

require __DIR__ . '/vendor/PHPMailer/Exception.php';
require __DIR__ . '/vendor/PHPMailer/PHPMailer.php';
require __DIR__ . '/vendor/PHPMailer/SMTP.php';
require __DIR__ . '/vendor/recaptcha/autoload.php';

// 在常量定义区添加
const ADMIN_EMAIL = 'markshou@gmail.com';
const SECOND_EMAIL = 'yanyanli302@gmail.com';

// Define the log file path
define('LOG_FILE', __DIR__ . '/contact_form.log');
define('BACKUP_LOG_FILE', __DIR__ . '/bak_contactform.log');
define('MAX_LOG_SIZE', 1024 * 1024); // 1MB

// Function to log messages
function log_message($message) {
    $timestamp = date('Y/m/d H:i:s:u'); // Format: yyyy/mm/dd hh:mm:ss:ms

    // ログサイズが上限を超えたらローテーション
    if (file_exists(LOG_FILE) && filesize(LOG_FILE) >= MAX_LOG_SIZE) {
        // 既にバックアップがあるなら削除
        if (file_exists(BACKUP_LOG_FILE)) {
            unlink(BACKUP_LOG_FILE);
        }

        // 現在のログをバックアップとしてリネーム
        rename(LOG_FILE, BACKUP_LOG_FILE);
    }

    error_log("[$timestamp] $message" . PHP_EOL, 3, LOG_FILE);
}

//CROS problem start
// 允许的前端域名列表
$allowedOrigins = [
    'https://kaiseilearntravel.onrender.com',
    'http://localhost:3000', // 本地开发环境
    'http://localhost', // 本地开发环境
    'https://izumosoan.com',  // Added to allow requests from izumosoan.com
    'https://kaiseilearntravel.com'  // Added to allow requests from izumosoan.com
];

// 获取请求来源
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// 检查来源是否在允许列表中
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin'); // 重要：避免缓存问题
}

// 允许的请求方法和头部
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-Recaptcha-Token');
header('Access-Control-Max-Age: 86400'); // 预检请求缓存24小时

// 处理OPTIONS预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // header('HTTP/1.1 204 No Content');
    http_response_code(204);
    exit;
}

//CROS problem end




log_message("Origin: " . $origin);

# Constants to redefined
# Check this for more configurations: https://blog.mailtrap.io/phpmailer
// const HOST        = ''; # SMTP server
// const USERNAME    = ''; # SMTP username
// const PASSWORD    = ''; # SMTP password
// const SECRET_KEY  = ''; # GOOGLE secret key
const HOST        = 'smtp.gmail.com';       // Gmail SMTP地址
const USERNAME    = 'markshou@gmail.com';       // 您的Gmail地址
const PASSWORD    = 'xymi hpmz wrfk ilik';    // 应用专用密码（需两步验证）phpmailform
const SECRET_KEY  = '6LcvrBcrAAAAAB2WMCv3VjB-0RyeJUsUjUvEe5iB';   // Google reCAPTCHA密钥

const SMTP_SECURE = PHPMailer::ENCRYPTION_STARTTLS; # or ENCRYPTION_SMTPS
const SMTP_AUTH   = true;
const PORT        = 587;
const SUBJECT     = 'New message from Kaisei web form!';
const HANDLER_MSG = [
    'success'       => '✔️ Your message has been sent !',
    'token-error'   => '❌ Error recaptcha token.',
    'enter_company' => '❌ Please enter your company name.',
    'enter_name'    => '❌ Please enter your name.',
    'enter_email'   => '❌ Please enter a valid email.',
    'enter_message' => '❌ Please enter your message.',
    'ajax_only'     => '❌ Asynchronous anonymous.',
    # Mail body
    'email_body'    => '
        <h1>{{subject}}</h1>
        <p><b>Date</b>: {{date}}</p>
          {{company_field}}
        <p><b>Name</b>: {{name}}</p>
        <p><b>E-Mail</b>: {{email}}</p>
        <p><b>Message</b>: {{message}}</p>
        <p><b>IP</b>: {{ip}}</p>
        <p><b>Source:</b>: <a href="{{source_url}}">{{source_url}}</a></p>
    '
];



# Check if request is Ajax request
if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] !== 'XMLHttpRequest') {
    statusHandler(true, HANDLER_MSG['ajax_only']);
}

// IP获取优化（兼容更多代理情况）
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] 
?? $_SERVER['HTTP_CLIENT_IP'] 
?? $_SERVER['REMOTE_ADDR'];

# Check if fields has been entered and valid
$date    = new DateTime();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $company = isset($_POST['company']) ? secure($_POST['company']) : '';
    if ($company === '' && isset($_POST['company'])) {
        statusHandler(true, HANDLER_MSG['enter_company']);
    }
    log_message("company=$company");

    $name    = secure($_POST['name']) ?? statusHandler(true, HANDLER_MSG['enter_name']);
    $email   = filter_var(secure($_POST['email']), FILTER_SANITIZE_EMAIL) ?? statusHandler(true, HANDLER_MSG['enter_email']);
    $message = secure($_POST['message']) ?? statusHandler(true, HANDLER_MSG['enter_message']);
    $token   = secure($_POST['recaptcha-token']) ?? statusHandler(true, HANDLER_MSG['token-error']);
    $ip      = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'];
    // $date    = new DateTime();

    // 新增来源URL获取
    $source_url = filter_var(
        $_SERVER['HTTP_REFERER'] ?? '未知来源', 
        FILTER_VALIDATE_URL
    ) ?: 'invalid URL';

    log_message("Form submitted: Name=$name, Email=$email, Message=$message, IP=$ip");
}

# Prepare email body
$company_field = $company ? '<p><b>Company</b>: {{company}}</p>' : '';
$title ="web form: " . $name;
$email_body = HANDLER_MSG['email_body'];
$email_body = template($email_body, [
    'subject' => $title , //SUBJECT,
    'date'    => $date->format('y/m/j H:i:s'),
    'company_field' => $company_field,
    'company'       => $company,
    'name'    => $name,
    'email'   => $email,
    'ip'      => filter_var($ip, FILTER_VALIDATE_IP),
    'message' => $message,
    'source_url' => htmlspecialchars($source_url) // 新增参数
]);

log_message("server name= " . $_SERVER['SERVER_NAME']);
log_message("Form submitted from: $source_url");
# Verifying the user's response
$recaptcha = new \ReCaptcha\ReCaptcha(SECRET_KEY);
// $resp = $recaptcha
//     // ->setExpectedHostname($_SERVER['SERVER_NAME']) //front host=kaiseilearntravel.onrender.com, backend host=kaiseiweb.onrender.com. this cause hostname mismatch
//     ->verify($token, filter_var($ip, FILTER_VALIDATE_IP));

// if ($resp->isSuccess()) 
if (1){
    # Instanciation of PHPMailer
    $mail = new PHPMailer(true);
    $mail->setLanguage('en', __DIR__ . '/vendor/PHPMailer/language/');

    try {
        # Server settings
        $mail->SMTPDebug  = SMTP::DEBUG_OFF; # Enable verbose debug output
        $mail->isSMTP();                     # Set mailer to use SMTP
        $mail->Host       = HOST;            # Specify main and backup SMTP servers
        $mail->Port       = PORT;            # TCP port
        $mail->SMTPAuth   = SMTP_AUTH;       # Enable SMTP authentication
        $mail->Username   = USERNAME;        # SMTP username
        $mail->Password   = PASSWORD;        # SMTP password
        $mail->SMTPSecure = SMTP_SECURE;     # Enable TLS encryption, `ssl` also accepted

        // # Recipients
        // $mail->setFrom(USERNAME, 'Raspgot');
        // $mail->addAddress($email, $name);
        // $mail->AddCC(USERNAME, 'Dev_copy');
        // $mail->addReplyTo(USERNAME, 'Information');

        // 修改收件人设置（重要！）
        $mail->setFrom(USERNAME, 'Web Contact Form');  // 发件人必须与SMTP用户一致
        // $mail->addAddress(USERNAME, 'Admin');             // 主收件人改为管理员邮箱
       
        // 修改收件人配置
        $mail->addAddress(ADMIN_EMAIL, 'Xiao');
        $mail->addAddress(SECOND_EMAIL, 'Yan');

        $mail->clearReplyTos();                           // 移除默认回复地址
        $mail->addReplyTo($email, $name);                 // 设置用户邮箱为回复地址


        // 增强输入验证
        $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL) 
        ?? statusHandler(true, HANDLER_MSG['enter_email']);



        # Content
        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = $title; // SUBJECT;
        $mail->Body    = $email_body;
        $mail->AltBody = strip_tags($email_body);

        # Send email
        $mail->send();
        log_message('Email sent successfully');
        statusHandler(false, HANDLER_MSG['success']);

    } catch (Exception $e) {
        log_message('Email sending failed: ' . $mail->ErrorInfo);
        statusHandler(true, $mail->ErrorInfo);
    }
} else {
    log_message('reCAPTCHA verification failed: ' . implode(', ', $resp->getErrorCodes()));
    statusHandler(true, $resp->getErrorCodes());
}

/**
 * Template string values
 * @param string $string
 * @param array $vars
 * @return string
 */
function template(string $string, array $vars): string
{
    foreach ($vars as $name => $val) {
        $string = str_replace("{{{$name}}}", $val, $string);
    }

    return $string;
}

/**
 * Secure inputs fields
 * @param string $post
 * @return string
 */
function secure(string $post): string
{
    $post = htmlspecialchars($post, ENT_QUOTES);
    $post = stripslashes($post);
    $post = trim($post);

    return $post;
}

/**
 * Error or success message
 * @param bool $error
 * @param mixed $message
 * @return string
 */
function statusHandler(bool $error, $message): string
{
    die(json_encode([
        'error'   => $error,
        'message' => $message
    ]));
}