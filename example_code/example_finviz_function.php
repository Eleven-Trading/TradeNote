<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
//ini_set('memory_limit', -1);
require_once '../credentials.php';
use FinvizCrawler\Client;
$finviz_crawler = new Client();

$data = json_decode(file_get_contents("php://input"), true);
error_log("data is " . json_encode($data));
if (isset($data)) {
    //PREPARING FINVIZ DATA
    $finvizCrawler = $finviz_crawler->quote($data["symbol"]);
    $finvizData = $finvizCrawler["snapshot"];
    error_log("finviz " . json_encode($finvizData));
    echo(json_encode($finvizData));
}