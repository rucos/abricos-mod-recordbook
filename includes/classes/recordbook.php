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
				'ReportItem' => 'ReportItem',
				'ProgramItem' => 'ProgramItem',
				'ProgramList' => 'ProgramList',
				'DepartList' => 'DepartList',
				'DepartItem' => 'DepartItem',
				'TeacherList' => 'TeacherList',
				'TeacherItem' => 'TeacherItem'
		);
	}
	
	
	protected function GetStructures(){
		return 'FieldItem, SubjectItem, GroupItem, StudItem, SheetItem, MarkItem, GroupModalItem, MarkItemStat, Config, ReportItem, ProgramItem, DepartItem, TeacherItem';
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
            	return $this->GroupSaveToJSON($d->data);
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
            	return  $this->SheetListToJSON($d->data);
            case "sheetItem":
            	return  $this->SheetItemToJSON($d->data);
            case "sheetSave":
            	return  $this->SheetAddToJSON($d->data);
            case "sheetRemove":
            	return  $this->SheetRemoveToJSON($d->sheetid);
            case "markList":
            	return  $this->MarkListToJSON($d->idSheet);
            case "markUpdate":
            	return  $this->MarkUpdateToJSON($d->objData);
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
            case "expeledGroupList":
            	return $this->ExpeledGroupListToJSON();
            case "expeledStudList":
            	return $this->ExpeledStudListToJSON($d->groupid);
            case "findStudReport":
            	return $this->FindStudReportToJSON($d->value);
            case "markStudReport":
            	return $this->MarkStudReportToJSON($d->data);
            case "programList":
            	return $this->ProgramListToJSON();
            case "departList":
            	return $this->DepartListToJSON();
            case "departItem":
           		return $this->DepartItemToJSON($d->departid);
            case "departSave":
            	return $this->DepartSaveToJSON($d->data);
           	case "teacherList":
           		return $this->TeacherListToJSON($d->departid);
           	case "teacherSave":
           		return $this->TeacherSaveToJSON($d->data);
           	case "teacherItem":
           		return $this->TeacherItemToJSON($d->teacherid);
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
			
	    	$list = $this->models->InstanceClass('FieldList');
	    
		    	$rows = RecordBookQuery::FieldList($this->db, $widget);
		    	
		    		while (($d = $this->db->fetch_array($rows))){
		    			$d['formEdu'] = array($d['och'], $d['ochzaoch'], $d['zaoch']);
		    			
		    			$d['frmstudy'] = $this->DetermineFormStudy($d['formEdu'], $d['frmstudy']);
		    			
		    			$list->Add($this->models->InstanceClass('FieldItem', $d));
		    		}
		    		return $list;
	    }
	    
	    public function FieldItemToJSON($fieldid){
	    	$res = $this->FieldItem($fieldid);
	    	
    		return 	$this->ResultToJSON('fieldItem', $res);
	    }
	    
	    private function DetermineFormStudy($arr, $ind){
	    	return $arr[$ind - 1] == 0 ? -1 : $ind;
	    }
	    
    	public function FieldItem($fieldid){
    		$d = RecordBookQuery::FieldItem($this->db, $fieldid);
    		
    		$d['formEdu'] = array($d['och'], $d['ochzaoch'], $d['zaoch']);
    		
   			$d['frmstudy'] = $this->DetermineFormStudy($d['formEdu'], $d['frmstudy']);
   			
    		$field = $this->models->InstanceClass('FieldItem', $d);
    			return $field;
    	}
    	
    	public function FieldSaveToJSON($d){
    		$res = $this->FieldSave($d);
    			return $this->ResultToJSON('fieldSave', $res);
    	}
    	
    	public function FieldSave($d){
    		$utmf = Abricos::TextParser(true);
    		
    		$d->id = intval($d->id);
    		$d->depart = $utmf->Parser($d->depart);
    		$d->frmstudy = intval($d->frmstudy);
    		$d->levelid = intval($d->levelid);
    		$d->note = $utmf->Parser($d->note);
    		
    		if($d->id !== 0){
    			RecordBookQuery::FieldUpdate(Abricos::$db, $d);
    		} else {
    			return RecordBookQuery::FieldAppend(Abricos::$db, $d).'';
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
       		
			$list = $this->SubjectListModels('SubjectListSheet', $d);
			
       		return $list;
       	}
       	
       	public function SubjectListProgress($d){
       		$d->fieldid = intval($d->fieldid);
       		$d->numcrs = intval($d->numcrs);
       		$d->semestr = intval($d->semestr);
       		$d->groupid = intval($d->groupid);
       		 
			$list = $this->SubjectListModels('SubjectListProgress', $d);
       		return $list;
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
    		$d->namesubject = $utmf->Parser($d->namesubject);
    		$d->numcrs = intval($d->numcrs);
    		$d->numhours1 = floatval($d->numhours1);
    		$d->numhours2 = floatval($d->numhours2);
    		$d->semestr = intval($d->semestr);
    		$d->project1 = intval($d->project1);
    		$d->project2 = intval($d->project2);
    		
    		switch($d->formcontrol){
    			case 'Экзамен':
    				break;
    			case 'Зачет':
    				break;
    			case 'Зачет с оценкой':
    				break;
    			case 'Практика':
    				$d->project1 = 0;
    				$d->project2 = 0;
    					break;
    			case '-': break;
    			default: return false;
    		}
    		

    		
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
       		$d->frmstudy = intval($d->frmstudy);
       		
       		$list = $this->models->InstanceClass('GroupList');
       		 
       		$rows = RecordBookQuery::GroupList($this->db, $d);
       		 
       		while (($dd = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('GroupItem', $dd));
       		}
       	
       		return $list;
       	}
       	
       	public function GroupSaveToJSON($d){
       		 
       		$res = $this->GroupSave($d);
       		return $this->ResultToJSON('groupSave', $res);
       	}
       	
       	public function GroupSave($d){
       		$d->groupid = intval($d->groupid);
       		$d->numcrs = intval($d->numcrs);
       		
       		$utmf = Abricos::TextParser(true);
       		
       		$d->numgroup = $utmf->Parser($d->numgroup);
       		$d->currentFieldid = intval($d->currentFieldid);
       		$d->year = intval($d->year);
       		
       		if($d->groupid > 0){
        		RecordBookQuery::GroupEdit($this->db, $d);
       		}else {
       			RecordBookQuery::GroupAppend($this->db, $d);			
       		}
       	}
       	
       	public function GroupItemToJSON($groupid){
       		$res = $this->GroupItem($groupid);
       		return $this->ResultToJSON('groupItem', $res);
       	}
       	 
       	public function GroupItem($groupid){
       		$groupid = intval($groupid);
       		
       		$d = RecordBookQuery::GroupItem($this->db, $groupid);
       	
       		$group = $this->models->InstanceClass('GroupItem', $d);
       		
       		return $group;
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
       	
       	public function SheetList($d){
       		$d->groupid = intval($d->groupid);
       		$d->currentSemestr = intval($d->currentSemestr);
       		$d->numcrs = intval($d->numcrs);
       		$d->fieldid = intval($d->fieldid);
       		 
       		$list = $this->models->InstanceClass('SheetList');
       	
       		$rows = RecordBookQuery::SheetList($this->db, $d);
       	
       		while (($dd = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('SheetItem', $dd));
       		}
       	
       		return $list;
       	}
       	
       	public function SheetItemToJSON($d){
       		$res = $this->SheetItem($d);
       		return $this->ResultToJSON('sheetItem', $res);
       	}
       	
       	public function SheetItem($d){
       		$d->sheetid = intval($d->sheetid);
       		
       		$row = RecordBookQuery::SheetItemlist($this->db, $d->sheetid);
       		
       		if($row['type'] == 2 || $row['type'] == 4){
       			$arrStudId = array();
       			
       			$studid = RecordBookQuery::StudidListFromMark($this->db, $row['id']);
       			
       		    while ($dd = $this->db->fetch_array($studid)){
       				$arrStudId[] = $dd['id'];
       			}
       			
       			$row['arrstudid'] = $arrStudId;
       		}
       		
       		if(isset($d->mark)){
       			if($d->mark === true){
       				$row['attestation'] =  array(
       						$row['firstattproc'],
       						$row['secondattproc'],
       						$row['thirdattproc'],
       				);
       			}
       		}
       		
       		return $this->models->InstanceClass('SheetItem', $row);
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
       		$d->isPractic = intval($d->isPractic);
       		
       		if(!isset($d->teacherid)){
       			   return false;  			
       		}
       		$d->teacherid = intval($d->teacherid);
       		
       		if($d->typeSheet === 2 || $d->typeSheet === 4){
       			if(count($d->arrStudId) == 0){
       				return false;
       			}
       		}
       		foreach($d->arrStudId as $val){
       			$val = intval($val);
       		}
       		
       		if($d->idSheet === 0 && $d->idSubject === 0){
       			return false;
       		} else if($d->idSheet > 0){
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
       		$d->id = intval($d->id);
       		$d->sheetid = intval($d->sheetid);
       		
       		$sheetItem = RecordBookQuery::SheetItemlist($this->db, $d->sheetid);
       		
       		if($sheetItem['formcontrol'] === 'Зачет'){
       			$credit = true;
       		} else {
       			$credit = false;
       		}

       		$res = $this->MarkUpdate($d, $credit);
       		
       		return $this->ResultToJSON('markUpdate', $res);
       	}
       	
       	public function MarkUpdate($d, $credit){
       			foreach($d as $key => $val){
       				if($key !== 'id' && $key !== 'sheetid'){
       					$val = intval($val);
	       					if($val < 0 || $val > 100){
	       						return false;
	       					}
       				}
       			}
       			$d->mark = $d->additional + $d->prliminary;  
       			
       			if($credit === true){
       				$d->mark = $d->mark > 51 ? 102 : 101;
       			}
       			RecordBookQuery::MarkUpdate($this->db, $d);
       	}
       	
       	public function CountPaginatorToJSON($d){
       		$res = $this->CountPaginator($d);
       		return $this->ResultToJSON('countPaginator', $res);
       	}
       	
       	public function CountPaginator($d){
       		
       		switch($d->type){
       			case 'subjectList': 
       				$d->fieldid = intval($d->fieldid);
       					$row = RecordBookQuery::CountSubject($this->db, $d->fieldid); 
       						break;
       			case 'groupList': 
       				$d->frmstudy = intval($d->frmstudy);
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
       		$resProj = $this->MarkListStat($d, true);
       		
       		$mark = $this->ResultToJSON('markListStat', $res);
       		$markProj = $this->ResultToJSON('markListStatProj', $resProj);
       		
       		$subject = $this->SubjectListToJSON($d);
       		$studlist = $this->StudListToJSON($d->groupid);
       		
       		if($d->view == 2){
       			$studlist->studList->list = $this->CalcRating($subject, $studlist, $mark, $markProj);
       		}
       		
       		$list = $this->ImplodeJSON(
       				$subject,
       				$studlist
       		);
       		
       		$listMark = $this->ImplodeJSON(
       				$this->ResultToJSON('markListStat', $res),
       				$this->ResultToJSON('markListStatProj', $resProj)
       		);
       		
       		return $this->ImplodeJSON(
       				$listMark,
       				$list
       		); 
       	}
       	
       	/*
       	 *
       	* Подсчет рейтинга и сортировка
       	*
       	* */
       	public function CalcRating($subject, $studlist, $mark, $markProj){
       		$arrSubj = $subject->subjectList->list;
       		$arrStud = $studlist->studList->list;
       		$arrMark = $mark->markListStat->list;
       		$arrMarkProj = $markProj->markListStatProj->list;
       		$countMark = count($arrMark);
       		$countMarkProj = count($arrMarkProj);
       		
       		if($countMark || $countMarkProj){
       			foreach($arrSubj as $value){
       				if($value->fc !== 'Практика'){
       					$hour = explode("/", $value->nh);
       					
       					$value->nh = (($hour[0] + $hour[1]) / 36).'';
       				} else {
       					$value->nh = 1;
       				}
       			}
       			
       			$arrRating = array();
       		}
       	
       		foreach($arrStud as $keySt => $stud){
       			$ratingMark = 0;
       			
       			if($countMark > 0){
       				$ratingMark = $this->Rating($arrMark, $stud, $arrSubj);    				
       			}
       			
       			if($ratingMark === -1){
       				$ratingMark = 0;
       			} else {
       				if($countMarkProj > 0){
       					$ratingMarkProj = $this->Rating($arrMarkProj, $stud, $arrSubj, 1);
       					if($ratingMarkProj === -1){
       						$ratingMark = 0;
       					} else {
       						$ratingMark += $ratingMarkProj;
       					}
       						
       				}
       			}

  
       			$stud->rt = round($ratingMark / 100, 2);
       			 
       			$arrRating[$keySt] = $stud->rt;
       		}
       		array_multisort($arrRating, SORT_DESC, $arrStud);
       		
       		return $arrStud;
       	}
       	
       	public function Rating($arr, $stud, $arrSubj, $proj = 0){
       		$rating = 0;
	       		foreach($arr as $mark){
	       			if($stud->id == $mark->stid){
	       				if(isset($mark->mk) && $mark->mk >= 51){
	       					foreach($arrSubj as $subj){
	       						if($mark->sid == $subj->id){
	       							
	       							switch($proj){
	       								case 0: 
	       									$rating += $subj->nh * $mark->mk;
	       									 	break;
	       								case 1:
	       									if($subj->fc == '-'){
	       										$rating += $subj->nh * $mark->mk;
	       									} else {
	       										$rating += $mark->mk;
	       									}
	       							}
	       						}
	       					}
	       				} else {
	       					$rating = -1;
	       						break;
	       				}
	       			}
	       		}
       		return $rating;
       	}
       	
       	public function MarkListStat($d, $project = false){
       		
       		$d->groupid = intval($d->groupid);
       		$d->fieldid = intval($d->fieldid);
       		$d->numcrs = intval($d->numcrs);
       		$d->semestr = intval($d->semestr);
       		$d->view = intval($d->view);
       		
       		$rows = RecordBookQuery::MarkListStat(Abricos::$db, $d, $project);
       		
       		$list = $this->models->InstanceClass('MarkListStat');
       		while (($dd = $this->db->fetch_array($rows))){
       			$list->Add($this->models->InstanceClass('MarkItemStat', $dd));
       		}
       		
       		return $list;
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
       	
       	public function SheetPrint($id, $quory){
       		return RecordBookQuery::$quory($this->db, $id);
       	}
       	
       	public function ProgressPrint($d, $quory){
       		return RecordBookQuery::$quory($this->db, $d);
       	}
       	
       	public function ProgressMarkPrint($d, $project){
       		return RecordBookQuery::MarkListStat($this->db, $d, $project);
       	}
       	
       	public function SetTradMark($mark, $print = false){
       	    if($mark <= 100){
        		if($mark < 51){
        			return $print ? ' ' : 'неудов.';
        		} else if($mark >= 51 && $mark < 71){
        			return $print ? 'У' :  'удов.';
        		} else if($mark >= 71 && $mark < 86){
        			return $print ? 'Х' :  'хор.';
        		} else {
        			return $print ? 'О' :  'отл.';
        		}
        	} else {
        		switch($mark){
        			case 101: return $print ? '' :  'не зачтено';
        			case 102: return $print ? 'З' :  'зачтено';
        			case 103: return $print ? 'У' :  'удов.';
        			case 104: return $print ? 'Х' :  'хор.';
        			case 105: return $print ? 'О' :  'отл.';
        		}
        	}
        	return "";
       	}
       	
       	public function ProgramListToJSON(){
       		$res = $this->ProgramList();
       		return $this->ResultToJSON('programList', $res);
       	}
       	
       	public function ProgramList(){
       		$list = $this->models->InstanceClass('ProgramList');
       		 
       		$rows = RecordBookQuery::ProgramList($this->db);
       		 
       		while ($dd = $this->db->fetch_array($rows)){
       			$list->Add($this->models->InstanceClass('ProgramItem', $dd));
       		}
       		return $list;
       	}
       	
       	public function DepartListToJSON(){
       		$res = $this->DepartList();
       		return $this->ResultToJSON('departList', $res);
       	}
       	
       	public function DepartList(){
       		$list = $this->models->InstanceClass('DepartList');
       	
       		$rows = RecordBookQuery::DepartList($this->db);
       	
       		while ($d = $this->db->fetch_array($rows)){
       			$list->Add($this->models->InstanceClass('DepartItem', $d));
       		}
       		return $list;
       	}
       	
       	public function DepartItemToJSON($id){
       		$res = $this->DepartItem($id);
       		return $this->ResultToJSON('departItem', $res);
       	}
       	
       	public function DepartItem($id){
       		$id = intval($id);
       	
       		$rows = RecordBookQuery::DepartItem($this->db, $id);
       	
       		return $this->models->InstanceClass('DepartItem', $rows);
       	}
       	
       	public function DepartSaveToJSON($d){
       		$res = $this->DepartSave($d);       			
       		return $this->ResultToJSON('departSave', $res);
       	}
       	
       	public function DepartSave($d){
       		$d->id = intval($d->id);
       		
       		if(!isset($d->remove)){
       			$utmf = Abricos::TextParser(true);
       			 
       			$d->namedepart = $utmf->Parser($d->namedepart);
       			$d->shortname = $utmf->Parser($d->shortname);
       			 
       			if($d->id > 0){
       				RecordBookQuery::DepartUpdate($this->db, $d);
       			} else {
       				RecordBookQuery::DepartAppend($this->db, $d);
       			}
       		} else {
       			$d->remove = intval($d->remove);
       				RecordBookQuery::DepartRemove($this->db, $d);
       			
       		}
       	
       	}
       	
       	public function TeacherListToJSON($departid){
       		$res = $this->TeacherList($departid);
       		return $this->ResultToJSON('teacherList', $res);
       	}
       	
       	public function TeacherList($departid){
       		$departid = intval($departid);
       	
       		$list = $this->models->InstanceClass('TeacherList');
       	
       		$rows = RecordBookQuery::TeacherList($this->db, $departid);
       	
       		while ($d = $this->db->fetch_array($rows)){
       			$list->Add($this->models->InstanceClass('TeacherItem', $d));
       		}
       		return $list;
       	}
       	
       	public function TeacherSaveToJSON($d){
       		$res = $this->TeacherSave($d);
       		return $this->ResultToJSON('teacherSave', $res);
       	}
       	
       	public function TeacherSave($d){
       		$d->id = intval($d->id);
       		 
       		if(!isset($d->remove)){
       			$d->departid = intval($d->departid);
       			
       			$utmf = Abricos::TextParser(true);
       			$d->fio = $utmf->Parser($d->fio);
       			 
       			if($d->id > 0){
       				RecordBookQuery::TeacherUpdate($this->db, $d);
       			} else {
       				RecordBookQuery::TeacherAppend($this->db, $d);
       			}
       		} else {
       			$d->remove = intval($d->remove);
       			RecordBookQuery::TeacherRemove($this->db, $d);
       	
       		}
       	}
       	
       	public function TeacherItemToJSON($id){
       		$res = $this->TeacherItem($id);
       		return $this->ResultToJSON('teacherItem', $res);
       	}
       	
       	public function TeacherItem($id){
       		$id = intval($id);
       	
       		$rows = RecordBookQuery::TeacherItem($this->db, $id);
       	
       		return $this->models->InstanceClass('TeacherItem', $rows);
       	}
}

?>