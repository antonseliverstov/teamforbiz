<?php
// TeamForBiz — lead form handler (Timeweb shared hosting, PHP mail()).
header('Content-Type: application/json; charset=utf-8');

const LEAD_TO   = 'info@teamforbiz.ru';
const LEAD_FROM = 'noreply@teamforbiz.ru';

function out($ok, $err = null) {
    echo json_encode($err ? ['ok' => $ok, 'error' => $err] : ['ok' => $ok], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); out(false, 'method'); }
if (!empty($_POST['website'])) out(true); // honeypot: silently accept bots

function field($k, $max) {
    $v = isset($_POST[$k]) ? (string)$_POST[$k] : '';
    $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $v));
    return mb_substr($v, 0, $max);
}

$name    = field('name', 100);
$contact = field('contact', 150);
$task    = field('task', 3000);
$budget  = field('budget', 100);
$page    = field('page', 300);
$consent = !empty($_POST['consent']);
$interest = [];
if (isset($_POST['interest']) && is_array($_POST['interest'])) {
    foreach (array_slice($_POST['interest'], 0, 12) as $i) $interest[] = mb_substr(trim((string)$i), 0, 60);
}

if ($name === '' || $contact === '' || !$consent) { http_response_code(422); out(false, 'validation'); }

// simple per-IP rate limit: 5 leads / 10 min
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$rl = sys_get_temp_dir() . '/tfb_rl_' . md5($ip);
$hits = array_filter(@json_decode(@file_get_contents($rl), true) ?: [], fn($t) => $t > time() - 600);
if (count($hits) >= 5) { http_response_code(429); out(false, 'rate'); }
$hits[] = time();
@file_put_contents($rl, json_encode(array_values($hits)));

$lines = [
    'Новая заявка с сайта teamforbiz.ru',
    '',
    'Имя: ' . $name,
    'Контакт: ' . $contact,
    'Интересует: ' . ($interest ? implode(', ', $interest) : '—'),
    'Бюджет: ' . ($budget !== '' ? $budget : '—'),
    'Задача: ' . ($task !== '' ? $task : '—'),
    '',
    'Страница: ' . $page,
    'Время: ' . date('d.m.Y H:i'),
    'IP: ' . $ip,
];
$subject = '=?UTF-8?B?' . base64_encode('Заявка с сайта: ' . $name) . '?=';
$headers = implode("\r\n", [
    'From: TeamForBiz <' . LEAD_FROM . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'MIME-Version: 1.0',
]);

$sent = @mail(LEAD_TO, $subject, implode("\n", $lines), $headers, '-f' . LEAD_FROM);

// keep a local copy in case mail delivery fails
@file_put_contents(__DIR__ . '/leads.log', date('c') . ' ' . json_encode(compact('name', 'contact', 'interest', 'budget', 'task', 'page'), JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

if (!$sent) { http_response_code(500); out(false, 'mail'); }
out(true);
