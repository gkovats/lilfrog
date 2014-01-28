<?php

    define('WWW_ROOT', realpath($_SERVER['DOCUMENT_ROOT']));
    define('ROOT', str_replace('www','',WWW_ROOT));
    
    require ROOT.'lib/Toro.php';
    require ROOT.'lib/rain.tpl.class.php';
    RainTPL::$tpl_dir       = ROOT."ui/"; // template directory
    RainTPL::$cache_dir     = ROOT."tmp/"; // cache directory   
    RainTPL::$path_replace  = false;  
    
    function __autoload($class_name) {
        include ROOT.'classes/'.$class_name . '.php';
    }   
 
    //$site = new \controllers\Site();
    //$site->home();

    
    Toro::serve(array(
        "/"                 => "controllers\Home",
        "/games/:string"    => "controllers\Games"
    ));