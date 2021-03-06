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

if ($updateManager->isInstall('0.2.6.2')){
	
	Abricos::GetModule('recordbook')->permission->Install();

		$db->query_write("
				CREATE TABLE IF NOT EXISTS ".$pfx."rb_fieldstudy(
					fieldid int(10) unsigned NOT NULL auto_increment,
					edulevelid int(10) unsigned NOT NULL default 0 COMMENT 'id направления',
					frmstudy tinyint(1) unsigned NOT NULL default 0 COMMENT 'Форма обучения',
					depart varchar(255) default NULL COMMENT 'Кафедра',
					note varchar(50) default NULL COMMENT 'Примечание',
					remove tinyint(1) unsigned NOT NULL default 0 COMMENT 'Удален?',
					PRIMARY KEY (fieldid)
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
					numhours varchar(11) default NULL COMMENT 'Количество часов: аудиторные/самостоятельная',
					project varchar(3) default NULL COMMENT 'Курсовая работа/проект',
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
					dateline smallint(4) unsigned NOT NULL default 0 COMMENT 'Дата зачисления',
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
					listgroup varchar(255) default NULL COMMENT 'Список групп в которых учился',
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
					teacherid int(10) unsigned NOT NULL default 0 COMMENT 'id преподаваетеля',
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
		
		$db->query_write("
			CREATE TABLE IF NOT EXISTS ".$pfx."rb_departs(
				departid int(10) unsigned NOT NULL auto_increment,
				namedepart varchar(255) default NULL COMMENT 'Название кафедры',
				shortname varchar(20) default NULL COMMENT 'Краткое название кафедры',
				remove tinyint(1) unsigned NOT NULL default 0 COMMENT 'Удален?',
				PRIMARY KEY (departid)
		)".$charset
		);
		
			$db->query_write("
			CREATE TABLE IF NOT EXISTS ".$pfx."rb_teacher(
				teacherid int(10) unsigned NOT NULL auto_increment,
				departid int(10) unsigned NOT NULL default 0 COMMENT 'id кафедры',
				fio varchar(255) default NULL COMMENT 'ФИО преподавателя',
				remove tinyint(1) unsigned NOT NULL default 0 COMMENT 'Удален?',
				PRIMARY KEY (teacherid)
		)".$charset
	);
}
?>