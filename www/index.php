<?php

  define('ROOT', $_SERVER['DOCUMENT_ROOT']);

  $f3=require('lib/f3/base.php');
  $f3->config('config.ini');
  $f3->set('AUTOLOAD','classes/');

	// $site = new controllers\Site();


  // F3 help text
  // $f3->route('GET /userref', function() { echo View::instance()->render('userref.htm'); } );

  // F3 help text
  $f3->route('GET /', 'controllers\Site->home' );

  $f3->run();
