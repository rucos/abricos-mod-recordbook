<?php
/**
 * @package Abricos
 * @subpackage Recordbook
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */

/*Распечатка успеваемости по текущей группе*/
class PrintProgress {
	
	public $groupItem = null;
	private $v = null;
	private $brick = null;
	private $fullname = "";
	private $shortname = "";
	
	private $subjectidArr = null;

	private $tdheadForm = "";
	private $tdheadSubj = "";
	private $rows = "";
	
	private $data = null;
	private $db = null;
	private $recordBook = null;
	
	private $mark = null;
	private $markProj = null;
	
	private $creditLight = 0;
	
	public function __construct($dir, $modManager){
		$this->data = new stdClass();
		$this->data->groupid = intval($dir[2]);
		$this->data->numcrs = intval($dir[3]);
		$this->data->semestr = intval($dir[4]);
		
		$this->db = $modManager->db;
		$this->recordBook = $modManager->GetRecordBook();
		
		$this->brick = Brick::$builder->brick;

		$this->v = &$this->brick->param->var;

		$phrases = RecordBookModule::$instance->GetPhrases();

		$this->fullname = $phrases->Get('fullname')->value;
		$this->shortname = $phrases->Get('shortname')->value;
		
		$this->groupItem = $this->GroupItem();
		
		$this->data->fieldid = intval($this->groupItem->fieldid);
		
		$this->subjectidArr = new stdClass();
			$this->subjectidArr->isNotProject = array();
			$this->subjectidArr->isProject = array();
	}

	public function GroupItem(){
		return $this->recordBook->GroupItem($this->data->groupid);
	}

	public function StudList(){
		return $this->recordBook->ProgressPrint($this->data->groupid, 'StudList');
	}
	
	public function MarkList($project){
		$this->data->view = 1;
		$res = $this->recordBook->ProgressMarkPrint($this->data, $project);

		if(!$project){
			$this->mark = $this->MarkRenderArray($res);
		} else {
			$this->markProj = $this->MarkRenderArray($res);
		}
	}
	
	public function MarkRenderArray($res){
		$arr = Array();
			while($dd = $this->db->fetch_array($res)){
				array_push($arr, $dd);
			}
			return $arr;
	}
	public function SubjectList(){
		return $this->recordBook->ProgressPrint($this->data, 'SubjectListProgress');
	}

	public function ParseSubjectList($subjectList){
		$formControl = new stdClass();
			$formControl->exam = array();
			$formControl->credit = array();
			$formControl->pract = array();
			$formControl->proj = array();
			
		while($subject = $this->db->fetch_array($subjectList)){
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
					$this->creditLight = $colspan;
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
				$this->tdheadForm .= $this->ReplaceTdHeadForm($formEdu, $colspan, $exam);
					
				foreach ($subject as $keySubj => $name){
					array_push($this->subjectidArr->$key, $name[0]);
					$this->tdheadSubj .= $this->ReplaceTdheadSubj($name[1], $keySubj);
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
		while($student = $this->db->fetch_array($studList)){
			$td = "";
			$lstGroup = $student['listgroup'] !== null ? true : false;
			
			$td .= $this->RenderMarkList($student, 'mark', 'isNotProject');
			
			$td .= $this->RenderMarkList($student, 'markProj', 'isProject');
			
			$this->rows .= Brick::ReplaceVarByData($this->v['tr'], array(
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
		
		foreach($this->subjectidArr->$isProject as $keyid => $subjectid){
			$empty = true;
			
			foreach($this->$markList as $keyMark => $mark){
				if($mark['subjectid'] == $subjectid){
					if($student['id'] == $mark['studid']){
						$empty = false;
							$td .= $this->ReplaceTdBody($mark['mark'], $keyid);
								if($markList === 'mark') {
									unset($this->mark[$keyMark]);
								} else {
									unset($this->markProj[$keyMark]);
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
		return Brick::ReplaceVarByData($this->v['td'], array(
				"clsName" =>  $examCol === $this->creditLight - 1 ? "class='tdLightRight'" : "",
				"mark" => $this->recordBook->SetTradMark($mark, true)
		));
	}
	
	public function ReplaceTdHeadForm($formEdu, $colspan, $exam){
		return Brick::ReplaceVarByData($this->v['tdheadForm'], array(
				"clsName" => $exam ? "class='tdLightRight'" : "", 
				"colspan" => $colspan,
				"formEdu" => $formEdu
		));
	}
	
	public function ReplaceTdheadSubj($namesubject, $examCol){
		return Brick::ReplaceVarByData($this->v['tdheadSubj'], array(
				"clsName" => $examCol === $this->creditLight - 1 ? "class='tdLightRight'" : "", 
				"subject" => $namesubject
		));
	}

	public function FillBrickContent(){
		$year = $this->groupItem->dateline + $this->data->numcrs - 1;

		$this->brick->content = Brick::ReplaceVarByData($this->brick->content, array(
				"fullname" => $this->fullname,
				"shortname" => $this->shortname,
				"numgroup" => $this->groupItem->numgroup,
				"field" => $this->groupItem->fieldcode." "."«".$this->groupItem->field."»",
				"semestr" => $this->data->semestr === 1 ? 'осенний' : 'весенний',
				"year" => $year . "/" . ($year + 1),
				"tdheadForm" => $this->tdheadForm,
				"tdheadSubj" => $this->tdheadSubj,
				"rows" => $this->rows
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