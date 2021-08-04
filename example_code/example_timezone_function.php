<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
//ini_set('memory_limit', -1);
require_once '../credentials.php';

$data = json_decode(file_get_contents("php://input"), true);
error_log("data is " . json_encode($data));
if (isset($data)) {
    if ($data["source"] == "import") {
        $dateTD = new DateTime($data["td"] . "T00:00:00", new DateTimeZone('America/New_York'));
        $dateTDUnix = $dateTD->getTimestamp();
        $dateSD = new DateTime($data["sd"] . "T00:00:00", new DateTimeZone('America/New_York'));
        $dateSDUnix = $dateSD->getTimestamp();
        $dateExecTime = new DateTime($data["td"] . " " . $data["execTime"], new DateTimeZone('America/New_York'));
        $dateExecTimeUnix = $dateExecTime->getTimestamp();
        error_log("date (in NY tz) " . $dateTD->format('Y-m-d H:i:s'));
        $result = [
            "dateTDUnix" => $dateTDUnix,
            "dateSDUnix" => $dateSDUnix,
            "dateExecTimeUnix" => $dateExecTimeUnix
        ];
        error_log("result : " . json_encode($result));
        echo json_encode($result);
    }

    if ($data["source"] == "video") {
        $date = new DateTime($data["fileYear"] . "-" . $data["fileMonth"] . "-" . $data["fileDay"] . "T" . $data["fileHour"] . ":" . $data["fileMinutes"] . ":" . $data["fileSeconds"], new DateTimeZone('America/New_York'));
        $dateUnix = $date->getTimestamp();
        $result = [
            "startTimeDate" => $date,
            "startTimeUnix" => $dateUnix
        ];
        error_log("result : " . json_encode($result));
        echo json_encode($result);
    }
}