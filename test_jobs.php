<?php
try {
    $pdo = new PDO(
        'mysql:host=gateway01.ap-southeast-1.prod.aws.tidbcloud.com;port=4000;dbname=tpc_alumni',
        '3AmsX7WPRGu2Rdb.root',
        'YxpowXktq3RdRdxO',
        [PDO::MYSQL_ATTR_SSL_CA => 'C:\Users\owner\.gemini\antigravity\brain\5bf7492c-4511-4d16-a083-7fd2bf6122e0\scratch\isrgrootx1.pem']
    );
    $stmt = $pdo->query("SELECT id, queue, attempts, created_at FROM jobs");
    $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Pending Jobs: " . count($jobs) . "\n";
    if (count($jobs) > 0) {
        print_r($jobs);
    }
} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}
