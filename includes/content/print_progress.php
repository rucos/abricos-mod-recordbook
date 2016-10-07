<?php
/**
 * @package Abricos
 * @subpackage Recordbook
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */

/*Распечатка успеваемости по текущей группе*/
class PrintProgress {
	
	public $groupItem = null;
	private $_v = null;
	private $_brick = null;
	private $_fullname = "";
	private $_shortname = "";
	
	private $_subjectidArr = null;

	private $_tdheadForm = "";
	private $_tdheadSubj = "";
	private $_rows = "";
	
	private $_data = null;
	private $_db = null;
	private $_recordBook = null;
	
	private $_mark = null;
	private $_markProj = null;
	
	private $_creditLight = 0;
	
	public function __construct($dir, $modManager){
		$this->_data = new stdClass();
		$this->_data->groupid = intval($dir[2]);
		$this->_data->numcrs = intval($dir[3]);
		$this->_data->semestr = intval($dir[4]);
		
		$this->_db = $modManager->db;
		$this->_recordBook = $modManager->GetRecordBook();
		
		$this->_brick = brick::$builder->brick;

		$this->_v = &$this->_brick->param->var;

		$phrases = Abricos::GetModule('university')->GetPhrases();

		$this->_fullname = $phrases->Get('_fullname')->value;
		$this->_shortname = $phrases->Get('_shortname')->value;
		
		$this->groupItem = $this->GroupItem();
		
		$this->_data->fieldid = intval($this->groupItem->fieldid);
		
		$this->_subjectidArr = new stdClass();
			$this->_subjectidArr->isNotProject = array();
			$this->_subjectidArr->isProject = array();
	}

	public function GroupItem(){
		return $this->_recordBook->GroupItem($this->_data->groupid);
	}

	public function StudList(){
		return $this->_recordBook->ProgressPrint($this->_data->groupid, 'StudList');
	}
	
	public function MarkList($project){
		$this->_data->view = 1;
		$res = $this->_recordBook->ProgressMarkPrint($this->_data, $project);

		if(!$project){
			$this->_mark = $this->MarkRenderArray($res);
		} else {
			$this->_markProj = $this->MarkRenderArray($res);
		}
	}
	
	public function MarkRenderArray($res){
		$arr = Array();
			while($dd = $this->_db->fetch_array($res)){
				array_push($arr, $dd);
			}
			return $arr;
	}
	public function SubjectList(){
		return $this->_recordBook->ProgressPrint($this->_data, 'SubjectListProgress');
	}

	public function ParseSubjectList($subjectList){
		$formControl = new stdClass();
			$formControl->exam = array();
			$formControl->credit = array();
			$formControl->pract = array();
			$formControl->proj = array();
			
		while($subject = $this->_db->fetch_array($subjectList)){
				$temporArr = array($subject['id'], $subject['namesubject']);
				
				$project = false;
				
				switch($subject['formcontrol']){
					case 'Экзамен':
							array_push($formControl->exam, $temporArr);
								break;
					case 'Зачет':
					case 'Зачет с оценкой':
							array_push($formControl->credit, $temporArr);
								break;
					case 'Практика':
							array_push($formControl->pract, $temporArr);
								break;
					case '-':
						$project = true;
							array_push($formControl->proj, $temporArr);
								break;
				}
				
				if(!$project){
					$proj = strrpos($subject['project'], '1');
						
					if($proj !== false){
						array_push($formControl->proj, $temporArr);
					}
				}
			}
			$this->FillThead($formControl);
	}
	
	private function FillThead($formControl){

		foreach ($formControl as $form => $subject){
			$key = "isNotProject";
			$formEdu = "";
			$exam = false;
			$colspan = count($subject);
			
			switch($form){
				case 'exam':
					$exam = true;
					$this->_creditLight = $colspan;
					$formEdu = 'Экзамены';
						break;
				case 'credit':
					$formEdu = 'Зачеты';
						break;
				case 'pract':
					$formEdu = 'Практики';
						break;
				case 'proj':
					$formEdu = 'Курсовые';
						$key = "isProject";
							break;
			}
			
			if($colspan > 0){
				$this->_tdheadForm .= $this->ReplaceTdHeadForm($formEdu, $colspan, $exam);
					
				foreach ($subject as $keySubj => $name){
					array_push($this->_subjectidArr->$key, $name[0]);
					$this->_tdheadSubj .= $this->ReplaceTdheadSubj($name[1], $exam, $keySubj);
				}
			}
		}
	}
	
	public function FillTableBody($studList){
		
		$vers = phpversion();
			if($vers <= '5.3.13'){
				$pattern = "/(\w+) (\w)\w+ (\w)\w+/iu";
			} else {
				$pattern = "/(\W+) (\W)\W+ (\W)\W+/iu";
			}
		
		$n = 0;
		while($student = $this->_db->fetch_array($studList)){
			$td = "";
			$lstGroup = $student['listgroup'] !== null ? true : false;
			
			$td .= $this->RenderMarkList($student, '_mark', 'isNotProject');
			
			$td .= $this->RenderMarkList($student, '_markProj', 'isProject');
			
			$this->_rows .= brick::ReplaceVarByData($this->_v['tr'], array(
				"clsName" => $lstGroup ? "class='tdLightTop'" : "",
				"n" =>  ++$n,
				"fio" => preg_replace($pattern, '$1 $2. $3.', $student['fio']),
				"nbook" => $student['numbook'],
				"td" => $td
			));
		}
	}

	public function RenderMarkList($student, $markList, $isProject){
		$td = "";
		
		foreach($this->_subjectidArr->$isProject as $keyid => $subjectid){
			$empty = true;
			
			foreach($this->$markList as $keyMark => $mark){
				if($mark['subjectid'] == $subjectid){
					if($student['id'] == $mark['studid']){
						$empty = false;
							$td .= $this->ReplaceTdBody($mark['mark'], $keyid);
								if($markList === '_mark') {
									unset($this->_mark[$keyMark]);
								} else {
									unset($this->_markProj[$keyMark]);
								}
									break;
					}
				}
			}
			
			if($empty){
				$td .= $this->ReplaceTdBody("", $keyid);
			}
		}
		return $td;
	}
	
	public function ReplaceTdBody($mark, $examCol){
		return brick::ReplaceVarByData($this->_v['td'], array(
				"clsName" =>  $examCol === $this->_creditLight - 1 ? "class='tdLightRight'" : "",
				"mark" => $this->_recordBook->SetTradMark($mark, true)
		));
	}
	
	public function ReplaceTdHeadForm($formEdu, $colspan, $exam){
		return brick::ReplaceVarByData($this->_v['tdheadForm'], array(
				"clsName" => $exam ? "class='tdLightRight'" : "", 
				"colspan" => $colspan,
				"formEdu" => $formEdu
		));
	}
	
	public function ReplaceTdheadSubj($namesubject, $exam, $keySubj){
		$clsName = "";
		
		if($exam){
			$clsName = $keySubj === $this->_creditLight - 1 ? "class='tdLightRight'" : "";
		}
		return brick::ReplaceVarByData($this->_v['tdheadSubj'], array(
				"clsName" => $clsName, 
				"subject" => $namesubject
		));
	}

	public function FillBrickContent(){
		$year = $this->groupItem->dateline + $this->_data->numcrs - 1;

		$this->_brick->content = brick::ReplaceVarByData($this->_brick->content, array(
				"fullname" => $this->_fullname,
				"shortname" => $this->_shortname,
				"numgroup" => $this->groupItem->numgroup,
				"field" => $this->groupItem->code." "."«".$this->groupItem->name."»",
				"semestr" => $this->_data->semestr === 1 ? 'осенний' : 'весенний',
				"year" => $year . "/" . ($year + 1),
				"tdheadForm" => $this->_tdheadForm,
				"tdheadSubj" => $this->_tdheadSubj,
				"rows" => $this->_rows
		));
	}
}

$modManager = Abricos::GetModule('recordbook')->GetManager();

if(!$modManager->IsAdminRole()){
	return;
}

$dir = Abricos::$adress->dir;
$dirCnt = count($dir);

if($dirCnt < 5){
	return;
}

$printProgress = new PrintProgress($dir, $modManager);

$subjectList = $printProgress->SubjectList();
$printProgress->ParseSubjectList($subjectList);

$studList = $printProgress->StudList();
$printProgress->MarkList(false);
$printProgress->MarkList(true);

$printProgress->FillTableBody($studList);

$printProgress->FillBrickContent();
?>