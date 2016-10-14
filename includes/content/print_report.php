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
$d->fieldid = $dir[2];
$d->groupid = $dir[3];
$d->studid = $dir[4];
$d->course = $dir[5];
$d->semestr = $dir[6];


$brick = Brick::$builder->brick;
$v = &$brick->param->var;

$recordBook = $modManager->GetRecordBook();

$markList = $recordBook->MarkStudReport($d, true);

$exp = "([а-я])[а-я]+";
$tr = "";
	foreach($markList as $mark){
		$fctrl = $mark['formcontrol'];
		
		if($fctrl === 'Практика'){
			$preg = preg_replace("/".$exp."/iu", '$1', $fctrl);
		} else {
			$preg = preg_replace("/".$exp." ".$exp."/iu", '$1$2', $fctrl);
		}
		
		$arr = array(
				"subject" => $mark['namesubject'],
				"date" => "",
				"exam" => "",
				"credit" => "",
				"hours" => $mark['numhours'] !== "" ? $mark['numhours'] : $preg
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
	
	