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

$id = intval($dir[2]);
$type = intval($dir[3]);

$phrases = RecordBookModule::$instance->GetPhrases();
$fullname = $phrases->Get('fullname')->value;
$shortname = $phrases->Get('shortname')->value;

$brick = Brick::$builder->brick;
$v = &$brick->param->var;

$sheet = $modManager->GetRecordBook()->SheetPrint($id, 'SheetItem');

$markList = $modManager->GetRecordBook()->SheetPrint($id, 'MarkList');
$rowsmark = "";
$i = 0;

	while ($d = $modManager->db->fetch_array($markList)){
		$rowsmark .= Brick::ReplaceVarByData($v['row'], array(
				"n" => ++$i,
				"fio" => $d['fio'],
				"numbook" => $d['numbook'],
				"firstatt" => $d['firstatt'],
				"secondatt" => $d['secondatt'],
				"thirdatt" => $d['thirdatt'],
				"prliminary" => $d['prliminary'],
				"additional" => $d['additional'],
				"debts" => $d['debts'],
				"mark" => $d['prliminary'] + $d['additional'],
				"tradmark" => $modManager->GetRecordBook()->SetTradMark($d['mark'])
		));
	}

		if($type % 2 !== 0) {
			$rowEnd = $v['rowEnd'];
			$extra = "";
		} else {
			$rowEnd = $v['rowAddEnd'];
			$extra = "ДОПОЛНИТЕЛЬНАЯ ";
		}
		$rowsmark .=  $rowEnd; 

			$hours = explode('/', $sheet['nh']);
			$vhours = $hours[0] + $hours[1];
			$countSemestr = $sheet['nc'] * 2 + ($sheet['sem'] - 2);
			$yearEnd = $sheet['dad'] + $sheet['nc'];
			$dtSheet = $sheet['date'] ? date('d.m.Y', $sheet['date']) : "";


				$brick->content = Brick::ReplaceVarByData($brick->content, array(
							"fullname" => $fullname,
							"shortname" =>  $shortname,
							"extra" => $extra,
							"idSheet" => $id,
							"numGroup" => $sheet['ng'],
							"countSemestr" => $countSemestr,
							"nameSubject" => $sheet['ns'],
							"field" => $sheet['fc'],
							"depart" => $sheet['dt'],
							"course" => $sheet['nc'],
							"volume" => $vhours,
							"aud" => $hours[0],
							"self" => $hours[1],
							"countZE" => $vhours / 36,
							"formControl" => $sheet['fct'],
							"semestr" => $sheet['sem'] == 1 ? 'осенний' : 'весенний',
							"fioTeacher" => $sheet['ft'],
							"year" => $yearEnd - 1,
							"year1" => $yearEnd,
							"date" => $dtSheet,
							"att1" => $sheet['att1'],
							"att2" => $sheet['att2'],
							"att3" => $sheet['att3'],
							"rows" => $rowsmark
						));
?>