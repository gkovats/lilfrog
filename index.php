<?php

  define('ROOT', $_SERVER['DOCUMENT_ROOT']);

  $f3=require('lib/base.php');
  $f3->config('config.ini');
  $f3->set('AUTOLOAD','classes/');

  // F3 help text
  $f3->route('GET /userref',
    function() {
      echo View::instance()->render('userref.htm');
    }
  );

  // F3 help text
  $f3->route('GET /',
    function() {
      echo View::instance()->render('home.html');
    }
  );

  $f3->run();
