<?php
/**
 * @package Abricos
 * @subpackage Recordbook
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */

/**
 * 
 * Распечатка успеваемости конкретного студента по семестру и курсу
 * 
 * 
 * */
$modManager = Abricos::GetModule('recordbook')->GetManager();

if(!$modManager->IsAdminRole()){
	return;
}

$dir = Abricos::$adress->dir;

$d = new stdClass();
$d->fieldid = intval($dir[2]);
$d->groupid = intval($dir[3]);
$d->studid = intval($dir[4]);
$d->course = intval($dir[5]);
$d->semestr = intval($dir[6]);


$brick = Brick::$builder->brick;
$v = &$brick->param->var;

$recordBook = $modManager->GetRecordBook();

$subjectList = $recordBook->ReportPrint($d, false);
$subjectListProj = $recordBook->ReportPrint($d, true);

$tr = "";

	while ($dd = $modManager->db->fetch_array($subjectList)){
// 		$hours = explode('/', $dd['numhours']);
// 		$tr .= Brick::ReplaceVarByData($v['tr'], array(
// 				"subject" => $dd['namesubject'],
// // 				"hours" => $hours[0] + $hours[1],
// 				"exam" => $dd['mark'],
// 				"credit" => $dd['mark'],
// 				"date" => $dd['date'] ? date('d.m.Y', $dd['date']) : ""
// 		));
	}
	//"tradmark" => $recordBook->SetTradMark($d['mark'])
	while ($dd = $modManager->db->fetch_array($subjectListProj)){
		
	}
	
	$brick->content = Brick::ReplaceVarByData($brick->content, array(
			"rows" => $tr
	));