<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
//ini_set('memory_limit', -1);
require_once '../credentials.php';

$data = json_decode(file_get_contents("php://input"), true);
if (isset($data)) {
    $source = $data["source"];
    $fileName = $data["fileName"];
    //error_log('memory used '. memory_get_usage());

    if ($source == "b2") {
        $fileType = $data["fileType"];
        $user = $data["user"];
        $subFolder = '<FOLDER NAME>/' . "" . $user . "/videos/";
        $cmd = $b2->getCommand('PutObject', [
            'Bucket' => '<BUCKET NAME>',
            'Key' => $subFolder . "" . $fileName,
            'ContentType' => $fileType,
        ]);
        $request = $b2->createPresignedRequest($cmd, '+20 minutes');
    }

    if ($source == "playbook") {
        $subFolder = $data["subFolder"];
        $cmd = $b2->getCommand('PutObject', [
            'Bucket' => '<BUCKET NAME NAME>',
            'Key' => $subFolder . "/" . $fileName
        ]);
        $request = $b2->createPresignedRequest($cmd, '+20 minutes');
    }

    // Get the actual presigned-url
    $presignedUrl = (string)$request->getUri();

    error_log("url " . $presignedUrl);

    echo $presignedUrl;
}
