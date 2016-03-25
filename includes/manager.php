<?php
/**
 * @package Abricos
 * @subpackage recordbook
 * @copyright 2016 Kirill Kosaev
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */

class RecordBookManager extends Ab_ModuleManager {


    public static $instance;

    public $module = null;

    public function __construct(RecordBookModule $module){
        parent::__construct($module);
        RecordBookManager::$instance = $this;
    }

    private $_recordbook = null;
    
    public function IsAdminRole(){
    	return $this->IsRoleEnable(RecordBookAction::ADMIN);
    }
    
    /**
     * @return RecordBook
     */
    public function GetRecordBook() {
        if (empty($this->_recordbook)) {
         	require_once 'dbquery.php';
         	require_once 'classes/models.php';
            require_once 'classes/recordbook.php';
            $this->_recordbook = new RecordBook($this);
        }
       
        return $this->_recordbook;
    }

    public function AJAX($d) {
        return $this->GetRecordBook()->AJAX($d);
    }
    
    public function Bos_MenuData(){
    	if (!$this->IsAdminRole()){
    		return null;
    	}
    	$i18n = $this->module->I18n();
    	return array(
    			array(
    					"name" => "recordbook",
    					"title" => "Учебная часть",
    					"icon" => "/modules/recordbook/images/cp_icon.gif",
    					"url" => "recordbook/wspace/ws"
    			)
    	);
    }

}

?>