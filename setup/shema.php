<?php
/**
 * @package Abricos
 * @subpackage recordbook
 * @copyright 2016 Kirill Kosaev
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */

$charset = "CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'";
$updateManager = Ab_UpdateManager::$current;
$db = Abricos::$db;
$pfx = $db->prefix;

if ($updateManager->isInstall('0.1.5')){
	
	Abricos::GetModule('recordbook')->permission->Install();

		$db->query_write("
				CREATE TABLE IF NOT EXISTS ".$pfx."rb_fieldstudy(
					fieldid int(10) unsigned NOT NULL auto_increment,
					fieldcode varchar(20) default NULL COMMENT 'Код направления',
					field varchar(255) default NULL COMMENT 'Направление',
					frmstudy varchar(15) default NULL COMMENT 'Форма обучения',
					qual varchar(15) default NULL COMMENT 'Квалификация',
					depart varchar(255) default NULL COMMENT 'Кафедра',
					remove tinyint(1) unsigned NOT NULL default 0 COMMENT 'Удален?',
					PRIMARY KEY (fieldid),
					UNIQUE KEY fieldstudy(fieldcode, field, frmstudy)
			)".$charset
		);

		$db->query_write("
				CREATE TABLE IF NOT EXISTS ".$pfx."rb_subject(
					subjectid int(10) unsigned NOT NULL auto_increment,
					fieldid int(10) unsigned NOT NULL default 0 COMMENT 'id направления',
					namesubject varchar(255) default NULL COMMENT 'Название предмета',
					formcontrol varchar(30) default NULL COMMENT 'Форма контроля',
					numcrs tinyint(1) unsigned NOT NULL default 0 COMMENT 'Номер курса',
					semestr tinyint(1) unsigned NOT NULL default 0 COMMENT 'Номер семестра',
					numhours varchar(10) default NULL COMMENT 'Количество часов: аудиторные/самостоятельная',
					project tinyint(1) unsigned NOT NULL default 0 COMMENT 'Курсовая работа/проект',
					remove tinyint(1) unsigned NOT NULL default 0 COMMENT 'Удален из учебного плана',
					PRIMARY KEY (subjectid)
			)".$charset
		);
		
		$db->query_write("
				CREATE TABLE IF NOT EXISTS ".$pfx."rb_groups(
					groupid int(10) unsigned NOT NULL auto_increment,
					fieldid int(10) unsigned NOT NULL default 0 COMMENT 'id направления',
					numgroup varchar(50) default NULL COMMENT 'Номер группы',
					numcrs tinyint(1) unsigned NOT NULL default 0 COMMENT 'Номер курса',
					dateline int(10) unsigned NOT NULL default 0 COMMENT 'Дата добавления',
					remove tinyint(1) unsigned NOT NULL default 0 COMMENT 'Удален?',
					PRIMARY KEY (groupid)
			)".$charset
		);
		
		$db->query_write("
				CREATE TABLE IF NOT EXISTS ".$pfx."rb_students(
					id int(10) unsigned NOT NULL auto_increment,
					groupid int(10) unsigned NOT NULL default 0 COMMENT 'Идент группы',
					numbook varchar(10) default NULL COMMENT 'Номер зачетной книжки',
					fio varchar(255) default NULL COMMENT 'ФИО Студента',
					datebirth int(10) unsigned NOT NULL default 0 COMMENT 'Дата рождения',
					preveducation varchar(255) default NULL COMMENT 'Документ о предыдущем образовании',
					transferal tinyint(1) unsigned NOT NULL default 0 COMMENT 'Отчислен? 1: да',
					PRIMARY KEY (id),
					UNIQUE KEY student (numbook,fio)
			)".$charset
		);
		
		$db->query_write("
				CREATE TABLE IF NOT EXISTS ".$pfx."rb_sheet(
					sheetid int(10) unsigned NOT NULL auto_increment,
					subjectid int(10) unsigned NOT NULL default 0 COMMENT 'Предмет',
					groupid int(10) unsigned NOT NULL default 0 COMMENT 'Идент группы',
					firstattproc tinyint(2) unsigned NOT NULL default 0 COMMENT 'вес в % 1 аттестация',
					secondattproc tinyint(2) unsigned NOT NULL default 0 COMMENT 'вес в % 2 аттестация',
					thirdattproc tinyint(2) unsigned NOT NULL default 0 COMMENT 'вес в % 3 аттестация',
					date int(10) unsigned NOT NULL default 0 COMMENT 'Дата проведения',
					type tinyint(1) unsigned NOT NULL default 0 COMMENT 'Тип ведомости',
					fioteacher varchar(255) default NULL COMMENT 'ФИО Преподавателя',
					PRIMARY KEY (sheetid)
			)".$charset
		);
		
		$db->query_write("
				CREATE TABLE IF NOT EXISTS ".$pfx."rb_marks(
					markid int(10) unsigned NOT NULL auto_increment,
					sheetid int(10) unsigned NOT NULL default 0 COMMENT 'номер ведомости',
					studid int(10) unsigned NOT NULL default 0 COMMENT 'id студента',
					firstatt tinyint(3) unsigned NOT NULL default 0 COMMENT '1 аттестация',
					secondatt tinyint(3) unsigned NOT NULL default 0 COMMENT '2 аттестация',
					thirdatt tinyint(3) unsigned NOT NULL default 0 COMMENT '3 аттестация',
					prliminary tinyint(3) unsigned NOT NULL default 0 COMMENT 'Предварительная оценка',
					additional tinyint(3) unsigned NOT NULL default 0 COMMENT 'Дополнительные баллы',
					debts tinyint(3) unsigned NOT NULL default 0 COMMENT 'Количество долгов',
					mark tinyint(3) unsigned NOT NULL default 0 COMMENT 'Оценка/102 - зачтено/103-105 для заочной',
					PRIMARY KEY (markid)
			)".$charset
		);
		
		
}
?>