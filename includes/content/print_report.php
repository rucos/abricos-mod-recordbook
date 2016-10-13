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

$markList = $recordBook->MarkStudReport($d, true);

$vers = phpversion();
if($vers <= '5.3.13'){
	$pattern = "/(\w)\w+ (\w)\w+/iu";
} else {
	$pattern = "/(\W)\W+ (\W)\W+/iu";
}

$tr = "";
	foreach($markList as $mark){
		$fctrl = $mark['formcontrol'];
		
		$arr = array(
				"subject" => $mark['namesubject'],
				"date" => "",
				"exam" => "",
				"credit" => "",
				"hours" => $mark['numhours'] !== "" ? $mark['numhours'] :  preg_replace($pattern, '$1$2', $fctrl)
		);
		
		if($mark['mark'] >= 51){
			$arr['date'] = $mark['date'] ? date('d.m.Y', $mark['date']) : "";
			
			if($fctrl == 'Зачет'){
				$arr['credit'] = $mark['mark']."(З)";
			} else {
				$arr['exam'] = $mark['mark']."(".$recordBook->SetTradMark($mark['mark'], true).")";
			}
		}
		$tr .= Brick::ReplaceVarByData($v['tr'], $arr);
	}

	$brick->content = Brick::ReplaceVarByData($brick->content, array(
			"rows" => $tr
	));
	