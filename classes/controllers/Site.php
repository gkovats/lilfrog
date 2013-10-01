<?php

	namespace controllers;
	
	class Site {
		
		public $view;
		
	  public function __construct() {
	    $this->view = \View::instance();
	  }

		public function home() {
			echo \View::instance()->render('home.html');
			
		}		


		
	}
