<?php
/**
 * @package Abricos
 * @subpackage recordbook
 * @copyright 2016 Kirill Kosaev
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */


class RecordBookModule extends Ab_Module {


    public static $instance;
	
    private $_manager = null;

    public function RecordBookModule(){
        RecordBookModule::$instance = $this;
        $this->version = "0.2.2";
        $this->name = "recordbook";
        $this->takelink = "recordbook";
        $this->permission = new RecordBookPermission($this);
     }

    public function GetManager(){
        if (is_null($this->_manager)){
            require_once 'includes/manager.php';
            $this->_manager = new RecordBookManager($this);
        }
        return $this->_manager;
    }
    
    public function GetContentName(){
    	$dir = Abricos::$adress->dir;
    	if (isset($dir[1])){
    		switch ($dir[1]){
    			case 'print':
    			case 'print_progress':
    				return $dir[1];
    		}
    	}
    	return '';
    }
    
    public function Bos_IsMenu(){
    	return true;
    }
    
    public function Bos_IsSummary(){
    	return true;
    }
}

class RecordBookAction {
    const ADMIN = 50;
    const WRITE = 30;
    const VIEW = 10;
}

class RecordBookPermission extends Ab_UserPermission {

    public function __construct(RecordBookModule $module){
        $defRoles = array(
            new Ab_UserRole(RecordBookAction::ADMIN, Ab_UserGroup::ADMIN)
        );
        parent::__construct($module, $defRoles);
    }

    public function GetRoles(){
        return array(
        	RecordBookAction::ADMIN => $this->CheckAction(RecordBookAction::ADMIN)
        );
    }
}

Abricos::ModuleRegister(new RecordBookModule());

?>