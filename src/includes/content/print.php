<?php
/**
 * @package Abricos
 * @subpackage Recordbook
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */

/*Распечатка ведомостей*/
$modManager = Abricos::GetModule('recordbook')->GetManager();

if(!$modManager->IsAdminRole()){
	return;
}

$dir = Abricos::$adress->dir;

if(!isset($dir[2]) && !isset($dir[3])){
	return;
}

if($dir[3] <= 0 || $dir[3] > 4){
	return;
}

$id = intval($dir[2]);
$type = intval($dir[3]);

$phrases = Abricos::GetModule('university')->GetPhrases();
$fullname = $phrases->Get('fullname')->value;
$shortname = $phrases->Get('shortname')->value;

$brick = Brick::$builder->brick;
$v = &$brick->param->var;

$recordBook = $modManager->GetRecordBook();

$sheet = $recordBook->SheetPrint($id, 'SheetItemPrint');
$teacher = $recordBook->SheetPrint($sheet['tid'], 'TeacherItemPrint');
$markList = $recordBook->SheetPrint($id, 'MarkList');


	$vers = phpversion();
	if($vers <= '5.3.13'){
		$pattern = "/(\w+) (\w)\w+ (\w)\w+/iu";
	} else {
		$pattern = "/(\W+) (\W)\W+ (\W)\W+/iu";
	}
	
	$i = 0;
	$rowsmark = "";
	while ($d = $modManager->db->fetch_array($markList)){
		
		$rowsmark .= Brick::ReplaceVarByData($v['row'], array(
				"n" => ++$i,
				"fio" => preg_replace($pattern, '$1 $2. $3.', $d['fio']),
				"numbook" => $d['numbook'],
				"firstatt" => $d['firstatt'],
				"secondatt" => $d['secondatt'],
				"thirdatt" => $d['thirdatt'],
				"prliminary" => $d['prliminary'],
				"additional" => $d['additional'],
				"debts" => $d['debts'],
				"mark" => $d['prliminary'] + $d['additional'],
				"tradmark" => $recordBook->SetTradMark($d['mark'])
		));
	}
	
		$sheetId = $id;
		
			if($type % 2 !== 0) {
				$rowEnd = $v['rowEnd'];
				$extra = "";
			} else {
				$rowEnd = $v['rowAddEnd'];
				$extra = "ДОПОЛНИТЕЛЬНАЯ ";
				$sheetId = "_____";
			}
		$rowsmark .=  $rowEnd;

			$countSemestr = $sheet['nc'] * 2 + ($sheet['sem'] - 2);
			$yearEnd = $sheet['dad'] + $sheet['nc'];
			$dtSheet = $sheet['date'] ? date('d.m.Y', $sheet['date']) : "";
			$formCtrl = $sheet['fct'];
			$form = "Форма контроля -";
			$act = "проведения";
			
			if($type > 2){
				$proj = explode(',', $sheet['pj']);
					if($proj[0] == 1){
						$formCtrl = "Курсовая работа";
					} elseif($proj[1] == 1) {
						$formCtrl = "Курсовой проект";
					}
				$volume = "";
			} else {
				$hours = explode('/', $sheet['nh']);
				if($formCtrl === 'Практика'){
					$formCtrl = "";
					$form = "";
					$act = "сдачи";
					$volume = "Даты ".$hours[0].".".$yearEnd." г. - ".$hours[1].".".$yearEnd." г.";
				} else {
					$vhours = $hours[0] + $hours[1];
					$volume = "Объем ".$vhours." (".$hours[0]."/".$hours[1].")"." часов "."(".($vhours / 36)." зач. ед.)";
				}
			}

				$brick->content = Brick::ReplaceVarByData($brick->content, array(
							"fullname" => $fullname,
							"shortname" =>  $shortname,
							"extra" => $extra,
							"idSheet" => $sheetId,
							"numGroup" => $sheet['ng'],
							"countSemestr" => $countSemestr,
							"nameSubject" => $sheet['ns'],
							"field" => $sheet['fc'],
							"depart" => $teacher['shortname'],
							"course" => $sheet['nc'],
							"volume" => $volume,
							"form" => $form,
							"act" => $act,
							"formControl" => $formCtrl,
							"semestr" => $sheet['sem'] == 1 ? 'осенний' : 'весенний',
							"fioTeacher" => $teacher['fio'],
							"year" => $yearEnd - 1,
							"year1" => $yearEnd,
							"date" => $dtSheet,
							"att1" => $sheet['att1'],
							"att2" => $sheet['att2'],
							"att3" => $sheet['att3'],
							"rows" => $rowsmark
						));
?>