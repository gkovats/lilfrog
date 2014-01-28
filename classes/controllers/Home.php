<?php

	namespace controllers;
	
	class Home extends Base {
		

		public function get() {
			$this->template->draw('home');
		}


		
	}
