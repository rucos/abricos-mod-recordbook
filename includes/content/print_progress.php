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

	private $tdhead = "";
	private $rows = "";
	private $colExam = 0;
	private $colCredit = 0;
	
	private $data = null;
	private $db = null;
	private $recordBook = null;

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

		return $this->MarkRenderArray($res);
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

	public function FillTableHead($subjectList){
		$subjectidArr = array();
			while($subject = $this->db->fetch_array($subjectList)){
				$subjectid = $subject['id'];
				$formControl = $subject['formcontrol'];
				$nameSubject = $subject['namesubject'];
				
				switch($formControl){
					case 'Экзамен':
						$this->colExam++;
						$this->tdhead .= $this->ReplaceTdHead($nameSubject);
							
						array_push($subjectidArr, $this->RenderSubjectIdArr(0, $subjectid));
							break;
					case 'Зачет':
					case 'Зачет с оценкой':
						$this->colCredit++;
						$this->tdhead .= $this->ReplaceTdHead($nameSubject);

						array_push($subjectidArr, $this->RenderSubjectIdArr(0, $subjectid));
							break;
				}
	
				$proj = strrpos($subject['project'], '1');
				
				if($proj !== false){
					array_push($subjectidArr, $this->RenderSubjectIdArr(1, $subjectid));
					$this->isProject($nameSubject, $proj, $formControl);
				}
			}
		$this->subjectidArr = $subjectidArr;
	}
	
	public function isProject($nameSubject, $proj, $formControl){
		if($formControl === 'Экзамен'){
			$this->colExam++;
		} else {
			$this->colCredit++;
		}
	
			if($proj === 0){
				$nameSubject .= " /к.р.";
			} else if($proj === 2){
				$nameSubject .= " /к.п.";
			}
		$this->tdhead .= $this->ReplaceTdHead($nameSubject);
	}
	
	public function RenderSubjectIdArr($proj, $subjectid){
		$a = new stdClass();
		$a->proj = $proj;
		$a->id = $subjectid;
		
		return $a;
	}
	
	public function FillTableBody($studList, $markList, $markListProj){
		
		$vers = phpversion();
			if($vers <= '5.3.13'){
				$pattern = "/(\w+) (\w)\w+ (\w)\w+/iu";
			} else {
				$pattern = "/(\W+) (\W)\W+ (\W)\W+/iu";
			}
		
		$n = 0;
		while($student = $this->db->fetch_array($studList)){
			$td = "";

			foreach($this->subjectidArr as $keyCurSubject => $subject){
				if($subject->proj === 0){
					$res = $this->RenderMarkList($markList, $student['id'], $subject->id, $keyCurSubject);
						if(isset($res->key)){
							unset($markList[$res->key]);
						}
				} else {
					$res = $this->RenderMarkList($markListProj, $student['id'], $subject->id, $keyCurSubject);
						if(isset($res->key)){
							unset($markListProj[$res->key]);
						}
				}
					$td .= $res->td;
			}
			
			$this->rows .= Brick::ReplaceVarByData($this->v['tr'], array(
				"n" =>  ++$n,
				"fio" => preg_replace($pattern, '$1 $2. $3.', $student['fio']),
				"nbook" => $student['numbook'],
				"td" => $td
			));
		}
	
	}

	public function RenderMarkList($markList, $studid, $subjectid, $keyCurSubject){
		$res = new stdClass();
		$res->td = "";
		
		$flag = false;
		
			foreach($markList as $key => $mark){
				if($studid === $mark['studid']){
					if($subjectid === $mark['subjectid']){
						$flag = true;
						$res->td = $this->ReplaceTdBody($mark['mark'], $keyCurSubject);
						$res->key = $key;
						
							return $res;
					}
				}
			}
			
			if(!$flag){
				$res->td = $this->ReplaceTdBody("", $keyCurSubject);
			}
			
		return $res;
	}
	
	public function ReplaceTdBody($mark, $keyCurSubject){
		return Brick::ReplaceVarByData($this->v['td'], array(
				"clsName" => $keyCurSubject === $this->colExam ? "class='tdLightLeft'" : "",
				"mark" => $this->recordBook->SetTradMark($mark, true)
		));
	}
	
	public function ReplaceTdHead($namesubject){
		return Brick::ReplaceVarByData($this->v['tdhead'], array(
				"clsName" => $this->colCredit === 1 ? "class='tdLightLeft'" : "", 
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
				"colExam" => $this->colExam,
				"colCredit" => $this->colCredit,
				"tdhead" => $this->tdhead,
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
$printProgress->FillTableHead($subjectList);

$studList = $printProgress->StudList();
$mark = $printProgress->MarkList(false);
$markProj = $printProgress->MarkList(true);
$printProgress->FillTableBody($studList, $mark, $markProj);

$printProgress->FillBrickContent();
?>