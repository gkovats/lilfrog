<?php

$f3=require('lib/base.php');
$f3->config('config.ini');
$f3->set('AUTOLOAD','classes/');
$f3->route('GET /userref',
	function() {
		echo View::instance()->render('userref.htm');
	}
);

$f3->run();
