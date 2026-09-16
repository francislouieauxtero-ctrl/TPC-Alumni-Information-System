<?php
try {
    $pdo = new PDO(
        'mysql:host=gateway01.ap-southeast-1.prod.aws.tidbcloud.com;port=4000;dbname=tpc_alumni',
        '3AmsX7WPRGu2Rdb.root',
        'YxpowXktq3RdRdxO',
        [PDO::MYSQL_ATTR_SSL_CA => 'C:\Users\owner\.gemini\antigravity\brain\5bf7492c-4511-4d16-a083-7fd2bf6122e0\scratch\isrgrootx1.pem']
    );
    $stmt = $pdo->prepare("UPDATE departments SET deleted_at = NULL WHERE name = 'BSIS'");
    $stmt->execute();
    echo "Restored BSIS!\n";
} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}
