<?php

    namespace controllers;
    
    class Games extends Base {
        

        public function get($game) {
            switch($game) {
                case 'wordsearch':
                    $this->wordsearch();
                    break;
                default:
                    $this->pagenotfound();
            }
        }


        public function wordsearch(){
            $this->template->draw('games/wordsearch');
        }

        
    }
