<?php

namespace controllers;

class Base {

    protected $template;

    public function __construct() {

        $this->template = new \RainTPL();
        
    }

    /**
     * Abstraction for F3 template render.
     */
    public function render($template) {

        //echo $this->template->render($template);
    }


    /**
     * Render a page not found
     */
    protected function pagenotfound(){
        $this->template->draw('404');
        exit;
    }

}
