<?php
/**
 * @package Abricos
 * @subpackage recordbook
 * @copyright 2016 Kirill Kosaev
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */

class RecordBook extends AbricosApplication {
	
	protected function GetClasses(){
		return array(
				'FieldItem' => 'FieldItem',
				'FieldList' => 'FieldList',
				'SubjectItem' => 'SubjectItem',
				'SubjectList' => 'SubjectList',
				'GroupItem' => 'GroupItem',
				'GroupList' => 'GroupList',
				'StudItem' => 'StudItem',
				'StudList' => 'StudList',
				'SheetItem' => 'SheetItem',
				'SheetList' => 'SheetList',
				'MarkItem' => 'MarkItem',
				'MarkList' => 'MarkList',
				'GroupModalItem' => 'GroupModalItem',
				'GroupModalList' => 'GroupModalList',
				'MarkItemStat' => 'MarkItemStat',
				'MarkListStat' => 'MarkListStat',
				'Config' => 'RecordBookConfig',
				'ReportItem' => 'ReportItem'
		);
	}
	
	
	protected function GetStructures(){
		return 'FieldItem, SubjectItem, GroupItem, StudItem, SheetItem, MarkItem, GroupModalItem, MarkItemStat, Config, ReportItem';
	}

	public function ResponseToJSON($d){
		if (!$this->manager->IsAdminRole()){
			return 403;
		}
		
		switch ($d->do){
            case "fieldList":
                return $this->FieldListToJSON($d->widget);
            case "fieldItem":
            	return $this->FieldItemToJSON($d->fieldid);
            case "fieldSave":
            	return $this->FieldSaveToJSON($d->data);
            case "fieldRemove":
            	return $this->FieldRemoveToJSON($d->fieldid, $d->restore);
            case "subjectList":
            	return $this->SubjectListToJSON($d->data);
            case "subjectSave":
            	return $this->SubjectSaveToJSON($d->data);
            case "subjectRemove":
            	return $this->SubjectRemoveToJSON($d->subjectid, $d->restore);
            case "groupList":
            	return $this->GroupListToJSON($d->data);
            case "groupSave":
            	return $this->GroupSaveToJSON($d->group);
            case "groupItem":
            	return $this->GroupItemToJSON($d->groupid);
            case "groupRemove":
            	return $this->GroupRemoveToJSON($d->data);
            case "studList":
            	return $this->StudListToJSON($d->groupid);
            case "studSave":
            	return $this->StudSaveToJSON($d->studs);
            case "studRemove":
            	return  $this->StudRemoveToJSON($d->data);
            case "sheetList":
            	return  $this->SheetListToJSON($d->objData);
            case "sheetSave":
            	return  $this->SheetAddToJSON($d->objData);
            case "sheetRemove":
            	return  $this->SheetRemoveToJSON($d->sheetid);
            case "markList":
            	return  $this->MarkListToJSON($d->idSheet);
            case "markUpdate":
            	return  $this->MarkUpdateToJSON($d->objData);
	        case "markUpdateZaoch":
	        	return  $this->MarkUpdateZaochToJSON($d->data);
            case "updateWeight":
            	return  $this->SheetUpdateWeightToJSON($d->objData);
            case "countPaginator":
            	return  $this->CountPaginatorToJSON($d->data);
            case "findSubject":
            case "findGroup":
            case "findStud":
            	return  $this->FindToJSON($d->data);
            case "fillModalField":
            case "fillModalGroup":
            	return  $this->FillModalToJSON($d->data);
            case "transitStud": 
            	return $this->TransitStudToJSON($d->data);
            case "markListStat":
            	return $this->MarkListStatToJSON($d->data);
            case "configSave":
            	return $this->ConfigSaveToJSON($d->data);
            case "config":
            	return $this->ConfigToJSON();
            case "expeledGroupList":
            	return $this->ExpeledGroupListToJSON();
            case "expeledStudList":
            	return $this->ExpeledStudListToJSON($d->groupid);
            case "findStudReport":
            	return $this->FindStudReportToJSON($d->value);
            case "markStudReport":
            	return $this->MarkStudReportToJSON($d->data);
            	
        }
        return null;
    }

    protected $_cache = array();

	    public function CacheClear(){
	        $this->_cache = array();
	    }
	    
	    public function FieldListToJSON($widget){
	    	$res = $this->FieldList($widget);
	    		return $this->ResultToJSON('fieldList', $res);
	    }

	    public function FieldList($widget){
			
	    	if($widget !== 'groupEditor' && $widget !== 'fieldList'){
				return false;
			}
			
	    	if (isset($this->_cache['FieldList'])){
	    		return $this->_cache['FieldList'];
	    	}
	    	$list = $this->models->InstanceClass('FieldList');
	    
		    	$rows = RecordBookQuery::FieldList($this->db, $widget);
		    	
		    		while (($d = $this->db->fetch_array($rows))){
		    			$list->Add($this->models->InstanceClass('FieldItem', $d));
		    		}
		    		return $this->_cache['FieldList'] = $list;
	    }
	    
	    public function FieldItemToJSON($fieldid){
	    	$res = $this->FieldItem($fieldid);
	    		return $this->ResultToJSON('fieldItem', $res);
	    }
	    
    	public function FieldItem($fieldid){
    		if(!isset($this->_cache['FieldItem'])){
    			$this->_cache['FieldItem'] = array();
    		}
    		if (isset($this->_cache['FieldItem'][$fieldid])){
    			return $this->_cache['FieldItem'][$fieldid];
    		}
    		
    		$d = RecordBookQuery::FieldItem($this->db, $fieldid);
    		
    		$field = $this->models->InstanceClass('FieldItem', $d);
    		
    			return $this->_cache['FieldItem'][$fieldid] = $field;
    			
    	}
    	
    	public function FieldSaveToJSON($d){
    		$res = $this->FieldSave($d);
    			return $this->ResultToJSON('fieldSave', $res);
    	}
    	
    	public function FieldSave($d){
    		$d->id = intval($d->id);
    		
    		$utmf = Abricos::TextParser(true);
    		$utm = Abricos::TextParser();
    		
    		$d->fieldcode = $utmf->Parser($d->fieldcode);
    		$d->field = $utmf->Parser($d->field);
    		$d->frmstudy = $utmf->Parser($d->frmstudy);
    		$d->qual = $utmf->Parser($d->qual);
    		$d->depart = $utmf->Parser($d->depart);
    		$d->note = $utmf->Parser($d->note);
    		
    		if($d->id !== 0){
    			RecordBookQuery::FieldUpdate(Abricos::$db, $d->id, $d);
    		} else {
    			RecordBookQuery::FieldAppend(Abricos::$db, $d);
    		}
    		
    	}
    	
    	public function FieldRemoveToJSON($fieldid, $restore){
    		$res = $this->FieldRemove($fieldid, $restore);
    			return $this->ResultToJSON('fieldRemove', $res);
    	}
    	
    	public function FieldRemove($fieldid,  $restore){
    		$fieldid = intval($fieldid);
    		$restore = intval($restore);
    		
    	      $field = $this->FieldItem($fieldid);
    	      
			        if (empty($field)){
			            return 404;
			        }
			        
			  RecordBookQuery::FieldRemove(Abricos::$db, $fieldid, $restore);
    		
    	}
    	
    	public function SubjectListToJSON($d){
    		
    		switch($d->from){
    			case 'subjectListWidget': 
    				$res = $this->SubjectList($d->fieldid, $d->pageSub);
    				
    				$ret = new stdClass();
    				$ret->type = 'subjectList';
    				$ret->fieldid = $d->fieldid;
    				
    				$count = $this->CountPaginator($ret);
    				
    					return $this->ImplodeJSON(
       						$this->ResultToJSON('subjectList', $res),
    						$this->ResultToJSON('countPaginator', $count)
       					);
    					
    			case 'sheetEditorWidget': 
    				$res = $this->SubjectListSheet($d);
    					break;
    			case 'progressViewWidget':
    				$res = $this->SubjectListProgress($d);
    					break;
    		}
    		return $this->ResultToJSON('subjectList', $res);
    	}
    	
    	public function SubjectList($fieldid, $pageSub){
    		$fieldid = intval($fieldid);
    		$pageSub = intval($pageSub);
    		
    		if (isset($this->_cache[$fieldid][$pageSub]['SubjectList'])){
    			return $this->_cache[$fieldid][$pageSub]['SubjectList'];
    		}
    		$list = $this->models->InstanceClass('SubjectList');
    		 
    		$rows = RecordBookQuery::SubjectList($this->db, $fieldid, $pageSub);
    		
    		while (($d = $this->db->fetch_array($rows))){
    			$list->Add($this->models->InstanceClass('SubjectItem', $d));
    		}
    		return $this->_cache[$fieldid][$pageSub]['SubjectList'] = $list;
       	}
       	
       	public function SubjectListSheet($d){
       		$d->fieldid = intval($d->fieldid);
       		$d->numcrs = intval($d->numcrs);
       		$d->semestr = intval($d->semestr);
       		$d->type = intval($d->type);//тип ведомости
       		
       		if (isset($this->_cache['SubjectListSheet'][$d->fieldid])){
       			return $this->_cache['SubjectListSheet'];
       		}
       		
			$list = $this->SubjectListModels('SubjectListSheet', $d);
			
       		return $this->_cache['SubjectListSheet'][$d->fieldid] = $list;
       	}
       	
       	public function SubjectListProgress($d){
       		$d->fieldid = intval($d->fieldid);
       		$d->numcrs = intval($d->numcrs);
       		$d->semestr = intval($d->semestr);
       		$d->groupid = intval($d->groupid);
       		 
       		if (isset($this->_cache['SubjectListProgress'][$d->fieldid])){
       			return $this->_cache['SubjectListProgress'][$d->fieldid];
       		}
			$list = $this->SubjectListModels('SubjectListProgress', $d);
			
       		return $this->_cache['SubjectListProgress'][$d->fieldid] = $list;
       	}
       	
       	public function SubjectListModels($query, $d){
       		
       		$list = $this->models->InstanceClass('SubjectList');
       		$rows = RecordBookQuery::$query($this->db, $d);
	       		while (($dd = $this->db->fetch_array($rows))){
	       			$list->Add($this->models->InstanceClass('SubjectItem', $dd));
	       		}
       		return $list;
       	}
       	
       	public function SubjectSaveToJSON($d){
       		
       		$res = $this->SubjectSave($d);
       		return $this->ResultToJSON('subjectSave', $res);
       	}
       	
       	public function SubjectSave($d){
       	   	$d->id = intval($d->id);
       	   	$d->subjectid = intval($d->subjectid);
    		$utmf = Abricos::TextParser(true);
    		$utm = Abricos::TextParser();
    		
    		$d->formcontrol = $utmf->Parser($d->formcontrol);
    		
    		switch($d->formcontrol){
    			case 'Экзамен':
    			case 'Зачет':
    			case 'Зачет с оценкой':
    			case '-': break;
    			default: return false;
    		}
    		
    		$d->namesubject = $utmf->Parser($d->namesubject);
    		$d->numcrs = intval($d->numcrs);
    		$d->numhours1 = intval($d->numhours1);
    		$d->numhours2 = intval($d->numhours2);
    		$d->semestr = intval($d->semestr);
    		$d->project1 = intval($d->project1);
    		$d->project2 = intval($d->project2);
    		
    		if($d->subjectid !== 0){
    			RecordBookQuery::SubjectEdit($this->db, $d);
    		} else {
    			RecordBookQuery::SubjectAppend($this->db, $d);
    		}
    		
       	}
       	
       	public function SubjectRemoveToJSON($subjectid, $restore){
       		 
       		$res = $this->SubjectRemove($subjectid, $restore);
       		return $this->ResultToJSON('subjectRemove', $res);
       	}
       	
       	public function SubjectRemove($subjectid, $restore){
       		$subjectid = intval($subjectid);
       		$restore = intval($restore);
       		
		    RecordBookQuery::SubjectRemove(Abricos::$db, $subjectid, $restore);
       	}
       	
       	public function GroupListToJSON($d){
       		$res = $this->GroupList($d);
       		return $this->ResultToJSON('groupList', $res);
       	}
       	
       	public function GroupList($d){
       		$d->page = intval($d->page);
       		$utmf = Abricos::TextParser(true);
       		$d->frmstudy = $utmf->Parser($d->frmstudy);
       		
       		if (isset($this->_cache[$d->frmstudy]['GroupList'])){
       			return $this->_cache[$d->frmstudy]['GroupList'];
       		}
       		
       		$list = $this->models->InstanceClass('GroupList');
       		 
       		$rows = RecordBookQuery::GroupList($this->db, $d);
       		 
       		while (($dd = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('GroupItem', $dd));
       		}
       	
       		return $this->_cache[$d->frmstudy]['GroupList'] = $list;
       	}
       	
       	public function GroupSaveToJSON($group){
       		 
       		$res = $this->GroupSave($group);
       		return $this->ResultToJSON('groupSave', $res);
       	}
       	
       	public function GroupSave($group){
       		$group->groupid = intval($group->groupid);
       		$group->numcrs = intval($group->numcrs);
       		$utmf = Abricos::TextParser(true);
       		$utm = Abricos::TextParser();
       		$group->numgroup = $utmf->Parser($group->numgroup);
       		$group->currentFieldId = intval($group->currentFieldId);
       		
       		if($group->groupid > 0){
        		RecordBookQuery::GroupEdit($this->db, $group);
       		}else {
       			RecordBookQuery::GroupAppend($this->db, $group);       			
       		}
       	
       	}
       	
       	public function GroupItemToJSON($groupid){
       		$res = $this->GroupItem($groupid);
       		return $this->ResultToJSON('groupItem', $res);
       	}
       	 
       	public function GroupItem($groupid){
       		if(!isset($this->_cache['GroupItem'])){
       			$this->_cache['GroupItem'] = array();
       		}
       		if (isset($this->_cache['GroupItem'][$groupid])){
       			return $this->_cache['GroupItem'][$groupid];
       		}
       	
       		$d = RecordBookQuery::GroupItem($this->db, $groupid);
       	
       		$group = $this->models->InstanceClass('GroupItem', $d);
       		return $this->_cache['GroupItem'][$groupid] = $group;
       	}
       	
       	public function GroupRemoveToJSON($d){
       		$res = $this->GroupRemove($d);
       		return $this->ResultToJSON('groupRemove', $res);
       	}
       	
       	public function GroupRemove($d){
       		$d->groupid = intval($d->groupid);
       		$d->remove = intval($d->remove);
       		RecordBookQuery::GroupRemove(Abricos::$db, $d);
       	}
       	
       	public function StudListToJSON($groupid){
       		$res = $this->StudList($groupid);
       		return $this->ResultToJSON('studList', $res);
       	}
       	 
       	public function StudList($groupid){
       		$groupid = intval($groupid);
       		if (isset($this->_cache['StudList'][$groupid])){
       			return $this->_cache['StudList'][$groupid];
       		}
       		$list = $this->models->InstanceClass('StudList');
       		 
       		$rows = RecordBookQuery::StudList($this->db, $groupid);
       	
       		while (($d = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('StudItem', $d));
       		}
       		return $this->_cache['StudList'][$groupid] = $list;
       	}
       	
       	public function StudSaveToJSON($stud){
       		$res = $this->StudSave($stud);
       		return $this->ResultToJSON('studSave', $res);
       	}
       	
       	public function StudSave($d){
       		$d->gid = intval($d->gid);
       		$d->sid = intval($d->sid);
       		$d->datebirth = intval($d->datebirth);
       		
       		$utmf = Abricos::TextParser(true);
       		$utm = Abricos::TextParser();
       		
       		$d->numbook = $utmf->Parser($d->numbook);
       		$d->fio = $utmf->Parser($d->fio);
       		$d->preveducation = $utmf->Parser($d->preveducation);
       		
       		if($d->sid !== 0){
       			RecordBookQuery::StudEdit(Abricos::$db, $d);
       		} else {
       			RecordBookQuery::StudAppend(Abricos::$db, $d);
       		}
       	}
       	
       	public function StudRemoveToJSON($d){
       		$res = $this->StudRemove($d);
       		return $this->ResultToJSON('studRemove', $res);
       	}
       	
       	public function StudRemove($d){
       		$d->studid = intval($d->studid);
       		$d->remove = intval($d->remove);
       		RecordBookQuery::StudRemove(Abricos::$db, $d);
       	}
       	
       	public function SheetListToJSON($d){
       		$res = $this->SheetList($d);
       		return $this->ResultToJSON('sheetList', $res);
       	}
       	
       	public function SheetList($objData){
       	
       		if (isset($this->_cache['SheetList'][$objData->groupid][$objData->currentSemestr])){
       			return $this->_cache['SheetList'][$objData->groupid][$objData->currentSemestr];
       		}
       		 
       		$list = $this->models->InstanceClass('SheetList');
       	
       		$rows = RecordBookQuery::SheetList($this->db, $objData);
       	
       		while (($d = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('SheetItem', $d));
       		}
       	
       		return $this->_cache['SheetList'][$objData->groupid][$objData->currentSemestr] = $list;
       	}
       	
       	public function SheetAddToJSON($d){
       		$res = $this->SheetAdd($d);
       		return $this->ResultToJSON('sheetAdd', $res);
       	}
       	
       	public function SheetAdd($d){
       		$d->idSubject = intval($d->idSubject);
       		$d->date = intval($d->date);
       		$d->groupid = intval($d->groupid);
       		$d->idSheet = intval($d->idSheet);
       		$d->typeSheet = intval($d->typeSheet);
       		
       		$utmf = Abricos::TextParser(true);
       		$d->fioteacher = $utmf->Parser($d->fioteacher);
       		
       		if($d->typeSheet === 2){
       			foreach($d->arrStudId as $val){
       				$val = intval($val);
       			}
       		}
       		
       		if($d->idSheet > 0){
       			RecordBookQuery::SheetUpdate(Abricos::$db, $d);
       		} else {
       			RecordBookQuery::SheetAppend(Abricos::$db, $d);
       		}
       	}
       	
       	public function SheetRemoveToJSON($id){
       		$res = $this->SheetRemove($id);
       		return $this->ResultToJSON('studRemove', $res);
       	}
       	
       	public function SheetRemove($id){
       		$id = intval($id);
       			RecordBookQuery::SheeetRemove(Abricos::$db, $id);
       	}
       	
       	public function MarkListToJSON($id){
       		$res = $this->MarkList($id);
       		return $this->ResultToJSON('markList', $res);
       	}
       	
       	public function MarkList($id){
       	
       		if (isset($this->_cache['MarkList'][$id])){
       			return $this->_cache['MarkList'][$id];
       		}
       	
       		$list = $this->models->InstanceClass('MarkList');
       	
       		$rows = RecordBookQuery::MarkList($this->db, $id);
       	
       		while (($d = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('MarkItem', $d));
       		}
       	
       		return $this->_cache['MarkList'][$id] = $list;
       	}
       	
       	public function SheetUpdateWeightToJSON($d){
       		$res = $this->SheetUpdateWeight($d);
       		return $this->ResultToJSON('updateWeight', $res);
       	}
       	
       	public function SheetUpdateWeight($d){
       		$d->idSheet = intval($d->idSheet);
       		$utmf = Abricos::TextParser(true);
       		$d->attProc = $utmf->Parser($d->attProc);
       		
       		if(strlen($d->attProc) <= 9){
       			$a = explode("-", $d->attProc);
       				if(count($a) == 3){
       					$sum = $a[0] + $a[1] + $a[2];
	       					if($sum === 100){
	       						RecordBookQuery::SheetUpdateWeight($this->db, $d->idSheet, $a[0], $a[1], $a[2]);
	       					} else {
	       						return false;
	       					}
       				} else {
       					return false;
       				}
       		} else {
       			return false;
       		} 
       	}
       	
       	public function MarkUpdateToJSON($d){
       		if(is_array($d)){//если изменяем оценки всех студентов
       			foreach($d as $val){
       				$res = $this->MarkUpdate($val);
       			}
       		} else {
       			$res = $this->MarkUpdate($d);
       		}
       		return $this->ResultToJSON('markUpdate', $res);
       	}
       	
       	public function MarkUpdate($d){
       			foreach($d as $key => $val){
       				$val = intval($val);
	       				if($key !== 'id' && $key !== 'mark'){
		       					if($val < 0 || $val > 100){
		       						return false;
		       					}
	       				}
       			}
       			RecordBookQuery::MarkUpdate($this->db, $d);
       	}
       	
       	public function MarkUpdateZaochToJSON($d){
       			$res = $this->MarkUpdateZaoch($d);
       		return $this->ResultToJSON('markUpdate', $res);
       	}
       	
       	public function MarkUpdateZaoch($d){
       		$d->id = intval($d->id);
       		$d->mark = intval($d->mark);
       		
       		RecordBookQuery::MarkUpdateZaoch($this->db, $d);
       	}
       	
       	public function CountPaginatorToJSON($d){
       		$res = $this->CountPaginator($d);
       		return $this->ResultToJSON('countPaginator', $res);
       	}
       	
       	public function CountPaginator($d){
       		
       		$utmf = Abricos::TextParser(true);
       		$d->type = $utmf->Parser($d->type);
      		
       		switch($d->type){
       			case 'subjectList': 
       				$d->fieldid = intval($d->fieldid);
       					$row = RecordBookQuery::CountSubject($this->db, $d->fieldid); 
       						break;
       			case 'groupList': 
       				$d->frmstudy = $utmf->Parser($d->frmstudy);
       				$row = RecordBookQuery::CountGroup($this->db, $d->frmstudy); 
       					break;
       		}
       			return $row;
       	}
       	
       	public function FindToJSON($d){
       		$res = $this->Find($d);
       		$respon = "";
       		
       		switch($d->type){
       			case 'Subject': $respon = 'findSubject'; break;
       			case 'Group': $respon = 'findGroup'; break;
       			case 'Stud': $respon = 'findStud'; break;
       		}
       		return $this->ResultToJSON($respon, $res);
       	}
       	
       	public function Find($d){
       	
       		if (isset($this->_cache[$d->type][$d->value])){
       			return $this->_cache[$d->type][$d->value];
       		}
       		
       		$utmf = Abricos::TextParser(true);
       		$d->value = $utmf->Parser($d->value);
       		
       		switch($d->type){
       			case 'Subject':
       				$d->fieldid = intval($d->fieldid);
       				$d->filterCourse = intval($d->filterCourse);
       				$d->filterSemestr = intval($d->filterSemestr);
       					$rows = RecordBookQuery::SubjectFind($this->db, $d);
       						break;
       			case 'Group':
       				$d->frmstudy = $utmf->Parser($d->frmstudy);
       					$rows = RecordBookQuery::GroupFind($this->db, $d);
       						break;
       			case 'Stud':
       				$d->groupid = intval($d->groupid);
       					$rows = RecordBookQuery::StudFind($this->db, $d);
       						break;
       			default: 
       				return false;
       		}
       		
       		$listClass = $d->type."List";
       		$itemClass = $d->type."Item";
       		
       		$list = $this->models->InstanceClass($listClass);       		
       		while (($dd = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass($itemClass, $dd));
       		}
       		return $this->_cache[$d->type][$d->value] = $list;
       	}
       	
       	public function FillModalToJSON($d){
       		$res = $this->FillModal($d);
       		$respon = "";
       		 
       		switch($d->type){
       			case 'Field': $respon = 'fillModalField'; break;
       			case 'GroupModal': $respon = 'fillModalGroup'; break;
       		}
       		return $this->ResultToJSON($respon, $res);
       	}
       	
       	public function FillModal($d){
       	
       		if (isset($this->_cache['modal'][$d->type])){
       			return $this->_cache['modal'][$d->type];
       		}
       		
       		$utmf = Abricos::TextParser(true);
       		$d->type = $utmf->Parser($d->type);
       		
       		switch($d->type){
       			case 'Field':
       				$d->formStudy = $utmf->Parser($d->formStudy);
       					$rows = RecordBookQuery::ModalFieldList($this->db, $d->formStudy);
       				break;
       			case 'GroupModal':
       				$d->fieldid = intval($d->fieldid);
       				$d->curGroup = intval($d->curGroup);
       					$rows = RecordBookQuery::ModalGroupList($this->db, $d->fieldid, $d->curGroup);
       				break;
       		}
       		 
       		$listClass = $d->type."List";
       		$itemClass = $d->type."Item";
       		
       		$list = $this->models->InstanceClass($listClass);
       		while (($dd = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass($itemClass, $dd));
       		}
       		return $this->_cache['modal'][$d->type] = $list;
       	}
       	
       	public function TransitStudToJSON($d){
       		$res = $this->TransitStud($d);
       		
       		return $this->ResultToJSON('transitStud', $res);
       	}
       	
       	public function TransitStud($d){
       		$d->groupid = intval($d->groupid);
       		$d->studid = intval($d->studid);
       		
       		return RecordBookQuery::TransitStud(Abricos::$db, $d);
       		
       	}
       	
       	public function MarkListStatToJSON($d){
       		$res = $this->MarkListStat($d);
       		$mark = $this->ResultToJSON('markListStat', $res);
       		
       		$subject = $this->SubjectListToJSON($d);
       		$studlist = $this->StudListToJSON($d->groupid);
       		
       		
       		/*
       		 * 
       		 * Подсчет рейтинга и сортировка 
       		 * 
       		 * */
       		if($d->view == 2){
       			$arrSubj = $subject->subjectList->list;
       			
       			foreach($arrSubj as $value){
       				$hour = explode("/", $value->nh);
       				
       				$value->nh = (($hour[0] + $hour[1]) / 36).'';
       			}
       			
      			$arrStud = $studlist->studList->list;
      			$arrMark = $mark->markListStat->list;
      			$arrRating = array();
      			
       			foreach($arrStud as $keySt => $stud){
       				$rating = 0;
       				
       				foreach($arrMark as $keyMk => $mark){
       					if($stud->id == $mark->stid){
       						if(isset($mark->mk) && $mark->mk >= 51){
       							foreach($arrSubj as $subj){
       								if($mark->sid == $subj->id){
       									$rating += $subj->nh * $mark->mk;
       								}
       							}
       						} else {
       							$rating = 0;
       								break;
       						}
       						unset($arrMark[$keyMk]);
       					}
       				}
       				$stud->rt = round($rating / 100, 2);
       				
       				$arrRating[$keySt] = $stud->rt;
       			}
       			array_multisort($arrRating, SORT_DESC, $arrStud);
       			
       			$studlist->studList->list = $arrStud;
       		}
       		
       		$list = $this->ImplodeJSON(
       				$subject,
       				$studlist
       		);
       		
       		return $this->ImplodeJSON(
       				$this->ResultToJSON('markListStat', $res),
       				$list
       		); 
       	}
       	
       	public function MarkListStat($d){
       		
       		$d->groupid = intval($d->groupid);
       		$d->fieldid = intval($d->fieldid);
       		$d->numcrs = intval($d->numcrs);
       		$d->semestr = intval($d->semestr);
       		$d->view = intval($d->view);
       		
       		if (isset($this->_cache['markListStat'][$d->groupid])){
       			return $this->_cache['markListStat'][$d->groupid];
       		}
       		
       		$rows = RecordBookQuery::MarkListStat(Abricos::$db, $d);
       		
       		$list = $this->models->InstanceClass('MarkListStat');
       		while (($dd = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('MarkItemStat', $dd));
       		}
       		
       		return $this->_cache['markListStat'][$d->groupid] = $list;
       	}
       	
       	public function ConfigSaveToJSON($d){
       		$res = $this->ConfigSave($d);
       		return $this->ResultToJSON('configSave', $res);
       	}
       	
       	public function ConfigSave($d){
       		$utmf = Abricos::TextParser(true);
       		$d->fullname = $utmf->Parser($d->fullname);
       		$d->shortname = $utmf->Parser($d->shortname);
       		$d->manager = $utmf->Parser($d->manager);
       		
       		$phs = RecordBookModule::$instance->GetPhrases();
       		$phs->Set("fullname", $d->fullname);
       		$phs->Set("shortname", $d->shortname);
       		$phs->Set("manager", $d->manager);
       		
       		Abricos::$phrases->Save();
       	}
       	
       	public function ConfigToJSON(){
       		$res = $this->Config();
       		return $this->ResultToJSON('config', $res);
       	}
       	
       	
       	public function Config(){
       		if (isset($this->_cache['Config'])){
       			return $this->_cache['Config'];
       		}
       		
       		$phrases = RecordBookModule::$instance->GetPhrases();
       		$d = array();
       		for ($i = 0; $i < $phrases->Count(); $i++){
       			$ph = $phrases->GetByIndex($i);
       			$d[$ph->id] = $ph->value;
       		}
       		
       		return $this->_cache['Config'] = $this->models->InstanceClass('Config', $d);
       	}
       	
       	public function ExpeledGroupListToJSON(){
       		$res = $this->ExpeledGroupList();
       		return $this->ResultToJSON('expeledGroupList', $res);
       	}
       	
       	public function ExpeledGroupList(){
       		if (isset($this->_cache['ExpeledGroupList'])){
       			return $this->_cache['ExpeledGroupList'];
       		}
       		 
       		$list = $this->models->InstanceClass('GroupList');
       	
       		$rows = RecordBookQuery::ExpeledGroupList($this->db);
       	
       		while (($dd = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('GroupItem', $dd));
       		}
       	
       		return $this->_cache['ExpeledGroupList'] = $list;
       	}
       	
       	public function ExpeledStudListToJSON($groupid){
       		$res = $this->ExpeledStudList($groupid);
       		return $this->ResultToJSON('studList', $res);
       	}
       	 
       	public function ExpeledStudList($groupid){
       		$groupid = intval($groupid);
       		
       		if (isset($this->_cache['ExpeledStudList'][$groupid])){
       			return $this->_cache['ExpeledStudList'][$groupid];
       		}
       		$list = $this->models->InstanceClass('StudList');
       	
       		$rows = RecordBookQuery::ExpeledStudList($this->db, $groupid);
       	
       		while (($d = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('StudItem', $d));
       		}
       		return $this->_cache['ExpeledStudList'][$groupid] = $list;
       	}
       	
       	public function FindStudReportToJSON($value){
       		$res = $this->FindStudReport($value);
       		$oldGr = isset($res->oldGroup) ? $this->ResultToJSON('groupList', $res->oldGroup) : "";
       		
       		return $this->ImplodeJSON(
       				$this->ResultToJSON('findStudReport', $res->curentGroup),
       				$oldGr
       		);
       	}
       	
       	public function FindStudReport($value){
       		$utmf = Abricos::TextParser(true);
       		$value = $utmf->Parser($value);
       		
       		$row = RecordBookQuery::FindStudReport($this->db, $value);
       		
       		$res = new stdClass();
       		$res->curentGroup = $this->models->InstanceClass('ReportItem', $row);
       		
	       		if(isset($row['listgroup'])){
	       			$arGroup = explode(',', $row['listgroup']);
	       			$listGr = $this->models->InstanceClass('GroupList');
	       			
	       			foreach ($arGroup as $value){
	       				$rowGr = RecordBookQuery::GroupItem($this->db, $value);
	       				$listGr->Add($this->models->InstanceClass('GroupItem', $rowGr));
	       			}
	       			$res->oldGroup = $listGr;
	       		}
	       		
       		return $res;
       	}
       	
       	public function MarkStudReportToJSON($d){
       		$res = $this->MarkStudReport($d);
       		return $this->ResultToJSON('markStudReport', $res);
       	}
       	
       	public function MarkStudReport($d){
       		
       		if (isset($this->_cache['MarkStudReport'][$d->studid.$d->course.$d->semestr])){
       			return $this->_cache['MarkStudReport'][$d->studid.$d->course.$d->semestr];
       		}
       		
       		$d->fieldid = intval($d->fieldid);
       		$d->groupid = intval($d->groupid);
       		$d->studid = intval($d->studid);
       		$d->course = intval($d->course);
       		$d->semestr = intval($d->semestr);
       		
       		$list = $this->models->InstanceClass('MarkListStat');
       		
       		$rows = RecordBookQuery::MarkStudReport($this->db, $d);
       		
       		while ($dd = $this->db->fetch_array($rows)){
       			$list->Add($this->models->InstanceClass('MarkItemStat', $dd));
       		}
       		return $this->_cache['MarkStudReport'][$d->studid.$d->course.$d->semestr] = $list;
       	}
       	
}

?>