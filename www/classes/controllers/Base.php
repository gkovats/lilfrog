<?php

	namespace controllers;
	
	class Base {
		
		public $template;
		
	  public function __construct() {
	    $this->template = \Template::instance();
	  }

		/**
		 * Abstraction for F3 template render.
		 */
		public function render($template) {
			echo $this->template->render($template);
		}		

	}
