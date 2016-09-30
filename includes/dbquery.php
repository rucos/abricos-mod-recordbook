<?php
/**
 * @package Abricos
 * @subpackage recordbook
 * @copyright 2016 Kirill Kosaev
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */

class RecordBookQuery {

    public static function FieldList(Ab_Database $db, $widget){

    	$where = $widget === 'groupEditor' ? "WHERE f.remove=0" : "";
    	
    	$sql = "
			SELECT 
					f.fieldid as id,
    				l.edulevelid,
					f.frmstudy,
    				p.code,
    				p.name,
    				l.level,
    				f.note,
					f.depart,
					f.remove,
    				ef.och,
    				ef.ochzaoch,
    				ef.zaoch,
    				p.remove as prremove,
    				l.remove as lvlremove
			FROM ".$db->prefix."rb_fieldstudy f
			INNER JOIN ".$db->prefix."un_edulevel l ON f.edulevelid=l.edulevelid
			INNER JOIN ".$db->prefix."un_program p ON p.programid=l.programid
			INNER JOIN ".$db->prefix."un_eduform ef ON l.edulevelid = ef.edulevelid
			".$where."
			ORDER BY f.remove ASC
		";
		return $db->query_read($sql);
    }
    
    public static function FieldItem(Ab_Database $db, $id){
    	$sql = "
			SELECT
					f.fieldid as id,
    				l.edulevelid,
					f.frmstudy,
    				p.code,
    				p.name,
    				l.level,
    				f.note,
					f.depart,
					f.remove,
    				ef.och,
    				ef.ochzaoch,
    				ef.zaoch,
    				p.remove as prremove,
    				l.remove as lvlremove
			FROM ".$db->prefix."rb_fieldstudy f
			INNER JOIN ".$db->prefix."un_edulevel l ON f.edulevelid=l.edulevelid
			INNER JOIN ".$db->prefix."un_program p ON p.programid=l.programid
			INNER JOIN ".$db->prefix."un_eduform ef ON l.edulevelid = ef.edulevelid
			WHERE f.fieldid = ".bkint($id)."
			LIMIT 1
		";
    	return $db->query_first($sql);
    }
    
    public static function FieldUpdate(Ab_Database $db, $d){
    	
    	$sql = "
			UPDATE ".$db->prefix."rb_fieldstudy
			SET
				frmstudy=".bkint($d->frmstudy).",
				depart='".bkstr($d->depart)."',
				note='".bkstr($d->note)."',
				edulevelid='".bkstr($d->levelid)."'
			WHERE fieldid=".bkint($d->id)."
			LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function FieldAppend(Ab_Database $db, $d){
    	 
         $sql = "
			INSERT INTO ".$db->prefix."rb_fieldstudy (
				frmstudy,depart,note,edulevelid
			) VALUES (
				".bkint($d->frmstudy).",
				'".bkstr($d->depart)."',
				'".bkstr($d->note)."',
				".bkint($d->levelid)."
			)
		";
      	$db->query_write($sql);
      	return $db->insert_id();
    }
    
    public static function FieldRemove(Ab_Database $db, $id, $restore){
    	 
    	$sql = "
			UPDATE ".$db->prefix."rb_fieldstudy
			SET
				remove=".bkint($restore)."
			WHERE fieldid=".bkint($id)."
			LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function SubjectList(Ab_Database $db, $fieldid, $pageSub, $limit = 15){
    	$from = $limit * (max($pageSub, 1) - 1);
    	
    	$sql = "
			SELECT
					subjectid as id,
					namesubject,
					formcontrol,
					numcrs,
					semestr,
					numhours,
    				project,
    				remove
			FROM ".$db->prefix."rb_subject
			WHERE fieldid = ".bkint($fieldid)."
			ORDER BY id DESC
			LIMIT ".$from.",".$limit."
		";
    	
    	return $db->query_read($sql);
    }
    
    public static function SubjectAppend(Ab_Database $db, $d){
    	$proj = bkint($d->project1).','.bkint($d->project2);
    	$hours = doubleval($d->numhours1).'/'.doubleval($d->numhours2);
    	
		$sql = "
				INSERT INTO ".$db->prefix."rb_subject (
					fieldid, namesubject, formcontrol, numcrs, semestr, numhours, project
				) VALUES (
						".bkint($d->id).",
						'".bkstr($d->namesubject)."',
						'".bkstr($d->formcontrol)."',
						".bkint($d->numcrs).",
						".bkint($d->semestr).",
						'".$hours."',
						 '".$proj."'
				)
		";
		$db->query_write($sql);
    }
    
    public static function SubjectEdit(Ab_Database $db, $d){
    	$proj = bkint($d->project1).','.bkint($d->project2);
    	$hours = doubleval($d->numhours1).'/'.doubleval($d->numhours2);
    	
    	$sql = "
			UPDATE ".$db->prefix."rb_subject
			SET 
				namesubject='".bkstr($d->namesubject)."',
				formcontrol='".bkstr($d->formcontrol)."',
				numcrs=".bkint($d->numcrs).",
				semestr=".bkint($d->semestr).",
				numhours='".$hours."',
				project='".$proj."'
			WHERE subjectid=".bkint($d->subjectid)." AND fieldid=".bkint($d->id)."
			LIMIT 1
		";
    	
    	$db->query_write($sql);
    
    }
    
    public static function SubjectRemove(Ab_Database $db, $id, $restore){
    	$sql = "
			UPDATE ".$db->prefix."rb_subject
			SET
				remove=".bkint($restore)."
			WHERE subjectid=".bkint($id)."
			LIMIT 1
		";
    	
    	$db->query_write($sql);
    }
    
    public static function GroupList(Ab_Database $db, $d, $limit = 15){
    	$from = $limit * (max($d->page, 1) - 1);
    	
    	$sql = "
			SELECT 
    				g.groupid as id,
    				g.numgroup,
    				g.numcrs,
    				g.dateline,
    				g.remove as grRemove,
    				p.code,
    				p.name,
    				e.level,
    				f.note,
    				f.remove
    		FROM ".$db->prefix."rb_groups g
    		INNER JOIN ".$db->prefix."rb_fieldstudy f ON f.fieldid = g.fieldid
    		INNER JOIN ".$db->prefix."un_edulevel e ON f.edulevelid = e.edulevelid
    		INNER JOIN ".$db->prefix."un_program p ON p.programid = e.programid
    		WHERE f.frmstudy = ".bkint($d->frmstudy)."
    		ORDER BY id DESC
    		LIMIT ".$from.",".$limit."
		";
    		return $db->query_read($sql);
    }
    
    public static function CountGroup(Ab_Database $db, $frmstudy){
    
    	$sql = "
			SELECT COUNT( g.groupid ) as cnt
			FROM ".$db->prefix."rb_groups g
			INNER JOIN ".$db->prefix."rb_fieldstudy f ON f.fieldid = g.fieldid
			WHERE f.frmstudy = ".bkint($frmstudy)."
		";
    	$row = $db->query_first($sql);
    	return $row['cnt'];
    }
    
    public static function GroupAppend(Ab_Database $db, $group){
    	$sql = "
			INSERT INTO ".$db->prefix."rb_groups (fieldid, numgroup, numcrs, dateline)
					VALUES (
						".bkint($group->currentFieldid).",
						'".bkstr($group->numgroup)."',
							".bkint($group->numcrs).",
							".bkint($group->year)."
					)
		";
    	$db->query_write($sql);
    }
    
    public static function GroupItem(Ab_Database $db, $groupid){

    	$sql = "
			SELECT
    				g.groupid as id,
    				g.numgroup,
    				g.numcrs,
    				g.dateline,
    				f.fieldid,
    				f.frmstudy,
    				f.frmstudy,
    				f.note,
    				p.code,
    				p.name,
    				e.level
    		FROM ".$db->prefix."rb_groups g
    		INNER JOIN ".$db->prefix."rb_fieldstudy f ON f.fieldid = g.fieldid
    		INNER JOIN ".$db->prefix."un_edulevel e ON f.edulevelid = e.edulevelid
    		INNER JOIN ".$db->prefix."un_program p ON p.programid = e.programid
    		WHERE g.groupid = ".bkint($groupid)."
    		LIMIT 1
		";
    	return $db->query_first($sql);
    }
    
    public static function GroupEdit(Ab_Database $db, $group){
    
    	$sql = "
			UPDATE ".$db->prefix."rb_groups
			SET 
				fieldid=".bkint($group->currentFieldid).",
				numgroup='".bkstr($group->numgroup)."',
				numcrs=".bkint($group->numcrs).",
				dateline=".bkint($group->year)."
			WHERE groupid=".bkint($group->groupid)."
			LIMIT 1
		";
    	
    	$db->query_write($sql);
    }
    
    public static function GroupRemove(Ab_Database $db, $d){
    
    	$sql = "
			UPDATE ".$db->prefix."rb_groups
			SET
				remove=".bkint($d->remove)."
			WHERE groupid=".bkint($d->groupid)."
			LIMIT 1
		";
    	 
    	$db->query_write($sql);
    }
    
    public static function GroupFind(Ab_Database $db, $d){
    	
    	if(!$d->value){
    		return false;
    	}
    
    	$sql = "
			SELECT
    				g.groupid as id,
    				g.numgroup,
    				g.numcrs,
    				g.dateline,
    				f.field,
    				f.fieldid,
    				f.fieldcode,
    				f.frmstudy,
    				f.note
    		FROM ".$db->prefix."rb_groups g
    		INNER JOIN ".$db->prefix."rb_fieldstudy f ON f.fieldid = g.fieldid
    		WHERE g.numgroup LIKE '".bkstr($d->value)."%' 
    				AND f.frmstudy = '".bkstr($d->frmstudy)."'
    						AND g.remove = 0
		";
    	return $db->query_read($sql);
    }
    
    public static function StudList(Ab_Database $db, $groupid){
    	 
    	$sql = "
			SELECT
					id as id,
    				groupid,
    				numbook,
    				fio,
    				datebirth,
    				preveducation,
    				listgroup
    		FROM ".$db->prefix."rb_students
    		WHERE groupid=".bkint($groupid)." 
    					AND transferal=0
    		ORDER BY listgroup ASC, fio ASC
		";
    	return $db->query_read($sql);
    }
    
    public static function StudAppend(Ab_Database $db, $stud){
    
    	$sql = "
			INSERT INTO ".$db->prefix."rb_students (groupid, numbook, fio, datebirth, preveducation)
			VALUES (
						".bkint($stud->gid).",
						'".bkstr($stud->numbook)."',
						'".bkstr($stud->fio)."',
						".bkint($stud->datebirth).",
						'".bkstr($stud->preveducation)."'
			)
		";
    	$db->query_write($sql);
    }
    
    public static function StudEdit(Ab_Database $db, $stud){
    
    	$sql = "
			UPDATE ".$db->prefix."rb_students
			SET
				groupid=".bkint($stud->gid).",
				numbook='".bkstr($stud->numbook)."',
				fio='".bkstr($stud->fio)."',
				datebirth=".bkint($stud->datebirth).",
				preveducation='".bkstr($stud->preveducation)."'
			WHERE id=".bkint($stud->sid)."
			LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function StudRemove(Ab_Database $db, $d){
    	$sql = "
				UPDATE ".$db->prefix."rb_students
				SET
					transferal = ".bkint($d->remove)."
    			WHERE id=".bkint($d->studid)."
    			LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function SubjectListSheet(Ab_Database $db, $d){
    	 
    	$where = "fieldid = ".bkint($d->fieldid)."
						AND numcrs = ".bkint($d->numcrs)."
								AND semestr = ".bkint($d->semestr)."
										AND remove = 0";
    	
    	switch($d->type){
    		case 1:
    		case 2:
    			$where .= " AND formcontrol <> '-'";
    				break;
    		case 3:
    		case 4:
    			$where .= " AND project LIKE '%1%'";
    				break;
    	}
    	
    	$sql = "
				SELECT
						subjectid as id,
						namesubject,
						formcontrol,
						numcrs,
						semestr,
						numhours,
    					project
				FROM ".$db->prefix."rb_subject
				WHERE ".$where."
			";
    	return $db->query_read($sql);
    }
    
    public static function SheetList(Ab_Database $db, $d){
    
    	$sql = "
			SELECT
					s.sheetid as id,
					s.subjectid,
    				sj.namesubject,
    				sj.formcontrol,
					s.firstattproc,
					s.secondattproc,
					s.thirdattproc,
					s.date,
    				s.type,
    				t.fio,
    				sj.remove,
    				sj.project
			FROM ".$db->prefix."rb_sheet s 
			INNER JOIN ".$db->prefix."rb_subject sj ON sj.subjectid = s.subjectid
			INNER JOIN ".$db->prefix."rb_teacher t ON t.teacherid = s.teacherid
			WHERE s.groupid = ".bkint($d->groupid)."
						AND sj.semestr = ".bkint($d->currentSemestr)." 
								AND sj.numcrs = ".bkint($d->numcrs)."
									 AND sj.fieldid = ".bkint($d->fieldid)."
			ORDER BY id DESC
		";
    	return $db->query_read($sql);
    }
    
    public static function SheetItemlist(Ab_Database $db, $id){//workaround: name function edit 
    
    	$sql = "
			SELECT
					s.sheetid as id,
					s.subjectid,
    				sj.namesubject,
    				sj.formcontrol,
					s.firstattproc,
					s.secondattproc,
					s.thirdattproc,
					s.date,
    				s.type,
    				t.departid,
    				t.teacherid,
    				t.fio,
    				sj.remove,
    				sj.project
			FROM ".$db->prefix."rb_sheet s
			INNER JOIN ".$db->prefix."rb_subject sj ON sj.subjectid = s.subjectid
			INNER JOIN ".$db->prefix."rb_teacher t ON t.teacherid = s.teacherid
			WHERE s.sheetid = ".bkint($id)."
			LIMIT 1
		";
    	return $db->query_first($sql);
    }
    
    public static function SheetAppend(Ab_Database $db, $d){
    
    	$a = array(30, 30, 40);
    	$typeSheet = $d->typeSheet;
   		if($typeSheet === 3 || $typeSheet === 4 || $d->isPractic){
   			$a[0] = 0;
   			$a[1] = 0;
   			$a[2] = 100;
   		}
   		
    	$sql = "
			INSERT INTO ".$db->prefix."rb_sheet (subjectid, groupid, firstattproc, secondattproc, thirdattproc, date, type, teacherid)
			VALUES (
					".bkint($d->idSubject).",
					".bkint($d->groupid).",
						".$a[0].",
						".$a[1].",
						".$a[2].",		
					".bkint($d->date).",
					".bkint($typeSheet).",
					".bkint($d->teacherid)."
			)
		";
    	$db->query_write($sql);
    	
    		$idSheet = $db->insert_id();
    		$arrStud = array();
    		$valIns = "";
    		
    		if($d->typeSheet === 2 || $d->typeSheet === 4){
    			$arrStud = $d->arrStudId;
    			$arrCount = count($arrStud);
    			
    		} else {
    			$sql = "
    				SELECT id
    				FROM ".$db->prefix."rb_students
    				WHERE groupid=".bkint($d->groupid)." AND transferal = 0
    			";
    			$rows = $db->query_read($sql);
    			
    			while ($d = $db->fetch_row($rows)){
					array_push($arrStud, $d[0]);
    			}
    			$arrCount = count($arrStud);
    		}
    		
    		if($arrCount === 0) return false;
    		
		  		RecordBookQuery::AppendMarks($db, $arrStud, $idSheet);
    		
    }
    
    public static function AppendMarks(Ab_Database $db, $arrStud, $idSheet){
    	$valIns = "";
 		 	foreach($arrStud as $val){
		 		$valIns .= "(".$idSheet.",".$val."),";
		 	}
		 	
		 	$valIns = substr($valIns, 0, -1);
		 	
		 	$sql = "
					INSERT INTO ".$db->prefix."rb_marks (sheetid, studid)
					VALUES ".$valIns."
			";
			$db->query_write($sql);
    	 
    }
    
    public static function SheeetRemove(Ab_Database $db, $id){
    
    	$sql = "
				DELETE FROM ".$db->prefix."rb_sheet
    			WHERE sheetid=".bkint($id)."
    			LIMIT 1
		";
    	$db->query_write($sql);
    	
	    	$sql = "
					DELETE FROM ".$db->prefix."rb_marks
	    			WHERE sheetid=".bkint($id)."
			";
	    	$db->query_write($sql);
    	
    }
    
    public static function SheetUpdate(Ab_Database $db, $d){
    	
    	if(count($d->arrStudId) > 0){
    		$addlistid = $d->arrStudId;//массив добавления студентов
    		$rows = RecordBookQuery::StudidListFromMark($db, $d->idSheet);
    		$remlistid = array();//массив удаления студентов
    		
       		while ($dd = $db->fetch_array($rows)){
       			$isRemove = true;
	       			foreach($addlistid as $key => $id){
	       				if($id == $dd['id']){
	       					$isRemove = false;
	       						unset($addlistid[$key]);
	       						
	       						break;
	       				}
	       			}
	       		if($isRemove){
	       			$remlistid[] = $dd['id'];
	       		}
	       			
       		}
       		
       		if(count($remlistid) > 0){
       			$remstr = implode(',', $remlistid);
       			$sql = "
						DELETE FROM ".$db->prefix."rb_marks
		    			WHERE sheetid=".bkint($d->idSheet)." AND studid IN (".$remstr.")
				";
	       			$db->query_write($sql);
       		}
       		
       		if(count($addlistid) > 0){
	       		RecordBookQuery::AppendMarks($db, $addlistid, $d->idSheet);
       		}
    	}
    	
    
    	$sql = "
				UPDATE ".$db->prefix."rb_sheet
				SET
					date=".bkint($d->date).",
					teacherid=".bkint($d->teacherid)."
				WHERE sheetid=".bkint($d->idSheet)."
				LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function MarkList(Ab_Database $db, $id){
    
    	$sql = "
			SELECT
    				m.markid as id,
    				s.fio,
    				s.numbook,
    				m.studid,
    				m.firstatt,
    				m.secondatt,
    				m.thirdatt,
    				m.prliminary,
    				m.additional,
    				m.debts,
    				m.mark
    		FROM ".$db->prefix."rb_marks m
    		INNER JOIN ".$db->prefix."rb_students s ON s.id = m.studid
    		WHERE m.sheetid = ".bkint($id)."
    		ORDER BY s.fio ASC
		";
    	return $db->query_read($sql);
    }
    
    public static function SheetUpdateWeight(Ab_Database $db, $id, $a1, $a2, $a3){
    
    	$sql = "
				UPDATE ".$db->prefix."rb_sheet
				SET
					firstattproc=".bkint($a1).",
					secondattproc=".bkint($a2).",
					thirdattproc=".bkint($a3)."
				WHERE sheetid=".bkint($id)."
				LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function MarkUpdate(Ab_Database $db, $d){
    
    	$sql = "
				UPDATE ".$db->prefix."rb_marks
				SET
					firstatt=".bkint($d->firstatt).",
					secondatt=".bkint($d->secondatt).",
					thirdatt=".bkint($d->thirdatt).",
					prliminary=".bkint($d->prliminary).",
					additional=".bkint($d->additional).",
					debts=".bkint($d->debts).",
					mark=".bkint($d->mark)."
				WHERE markid=".bkint($d->id)."
				LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function MarkUpdateZaoch(Ab_Database $db, $d){
    
    	$sql = "
				UPDATE ".$db->prefix."rb_marks
				SET
					mark=".bkint($d->mark)."
				WHERE markid=".bkint($d->id)."
				LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function CountSubject(Ab_Database $db, $fieldid){
    	 
    	$sql = " 
			SELECT COUNT( subjectid ) as cnt
			FROM ".$db->prefix."rb_subject
			WHERE fieldid=".bkint($fieldid)."
		";
    	$row = $db->query_first($sql);
    	return $row['cnt'];
    }
    
    public static function SubjectFind(Ab_Database $db, $d){

    	$where = "
    		fieldid = ".bkint($d->fieldid)." 
		";

    	if($d->filterCourse && $d->filterSemestr){
    		$where .= "
    			AND numcrs = ".bkint($d->filterCourse)."
    					AND semestr = ".bkint($d->filterSemestr)."
    		";
    	} else if($d->value){
    		$where .= "
    			AND namesubject LIKE '".bkstr($d->value)."%'
    		";
    	} else {
    		return false;
    	}
    	
    	 
    	$sql = "
			SELECT
					subjectid as id,
					namesubject,
					formcontrol,
					numcrs,
					semestr,
					numhours,
    				project,
    				remove
			FROM ".$db->prefix."rb_subject
			WHERE ".$where."
		";
    	 
    	return $db->query_read($sql);
    }
    
    public static function StudFind(Ab_Database $db, $d){
    	
    	if(!$d->value){
    		return false;
    	}
    
    	$sql = "
			SELECT
					id as id,
    				groupid,
    				numbook,
    				fio,
    				datebirth,
    				preveducation
			FROM ".$db->prefix."rb_students
			WHERE groupid = ".bkint($d->groupid)." 
					AND fio LIKE '".bkstr($d->value)."%'
						AND transferal=0
		";
    
    	return $db->query_read($sql);
    }
    
    public static function ModalFieldList(Ab_Database $db, $formStudy){
    
    	$sql = "
			SELECT
					fieldid as id,
					fieldcode,
					field,
					frmstudy,
					qual,
					depart,
    				note,
					remove
			FROM ".$db->prefix."rb_fieldstudy
			WHERE frmstudy = '".bkstr($formStudy)."' AND remove = 0
		";
    	return $db->query_read($sql);
    }
    
    public static function ModalGroupList(Ab_Database $db, $fieldid, $curGroup){
    	$sql = "
			SELECT
    			groupid as id,
    			numgroup,
    			numcrs,
    			dateline
			FROM ".$db->prefix."rb_groups
			WHERE fieldid = ".bkint($fieldid)."
						AND remove = 0
							AND groupid <> ".bkint($curGroup)."
		";
    	return $db->query_read($sql);
    }
    
    public static function TransitStud(Ab_Database $db, $d){
    	
    	$sql = "
    			SELECT
    					groupid as idgr,
    					listgroup as lg
    			FROM ".$db->prefix."rb_students
    			WHERE id=".bkint($d->studid)."
    			LIMIT 1
    	";
    	$row = $db->query_first($sql);

     	if($d->groupid == $row['idgr']){
	     		return false;
     	}
    	
    	$haystack = $row['lg'];
    	$needle = $row['idgr'];
    	
    	$pos = strripos($haystack, $needle);
    	
    	if($pos !== false){
    		$listGroup = $row['lg'];
    	} else {
    		$listGroup = $row['lg'] ? $row['lg']."," : "";
    		$listGroup .= $row['idgr'];
     	}
    	
    	$sql = "
			UPDATE ".$db->prefix."rb_students
			SET
				groupid=".bkint($d->groupid).",
				listgroup='".$listGroup."',
				transferal=0
			WHERE id = ".bkint($d->studid)."
			LIMIT 1
		";
    	return $db->query_read($sql);
    }
    
    public static function SubjectListProgress(Ab_Database $db, $d){
    	
    	$sql = "
			SELECT
					subjectid as id,
					namesubject,
					formcontrol,
    				numhours,
    				project
			FROM ".$db->prefix."rb_subject
			WHERE fieldid = ".bkint($d->fieldid)." 
						AND numcrs = ".bkint($d->numcrs)."
							AND semestr = ".bkint($d->semestr)."
								AND remove=0	
			ORDER BY formcontrol DESC
		";
    	 return $db->query_read($sql);
    	
    }
    
    public static function MarkListStat(Ab_Database $db, $d, $project = false){
    	
    	if($project){
    		$type = "sh.type > 2";
    	} else {
    		$type = "sh.type < 3";
    	}
    	
	    	$sql = "
	    		SELECT
	    				sh.sheetid
	    		FROM ".$db->prefix."rb_sheet sh
	    		INNER JOIN ".$db->prefix."rb_subject sj ON sj.subjectid = sh.subjectid
	    		WHERE sh.groupid = ".bkint($d->groupid)."
	    				AND sj.fieldid = ".bkint($d->fieldid)."
	    					AND sj.numcrs = ".bkint($d->numcrs)."
								AND sj.semestr = ".bkint($d->semestr)."
									AND ".$type."
	    	";

    	$rows = $db->query_read($sql);
    	
    	$sheet = '';
	    	while (($dd = $db->fetch_array($rows))){
	    		$sheet .= $dd["sheetid"].',';
	    	}
	    	
		   if(strlen($sheet) > 0){
		   		$rowid = substr($sheet, 0, -1);
				$max = "";
				
		   			switch($d->view){
		   				case 1:
		   					$max = "m.mark";
		   						break;
		   				case 2: 
		   					$max = "m.prliminary + m.additional";
		   						break;
		   				default:
		   					return;
		   			}
		   		
			   		$sql = "
			    		SELECT 	m.markid as id,
		    					sh.subjectid,
		   						m.studid,
		   						MAX(".$max.") as mark
			    		FROM ".$db->prefix."rb_marks m
			    		INNER JOIN ".$db->prefix."rb_sheet sh ON sh.sheetid = m.sheetid
			    		WHERE m.sheetid IN (".$rowid.")
			    		GROUP BY sh.subjectid,m.studid
					";
			   		return $db->query_read($sql);
		   }
    }
    
    public static function ExpeledGroupList(Ab_Database $db){
    	 
    	$sql = "
			SELECT 
    			DISTINCT groupid
    		FROM ".$db->prefix."rb_students
    		WHERE transferal = 1
		";
        $rows = $db->query_read($sql);
    	$group = '';
    	
	    	while (($dd = $db->fetch_array($rows))){
	    		$group .= $dd["groupid"].',';
	    	}
	    	if(strlen($group) > 0){
	    		$rowid = substr($group, 0, -1);
	    		$sql = "
			    		SELECT
	    						g.groupid as id,
			    				g.numgroup,
			    				g.numcrs,
			    				g.dateline,
			    				f.field,
			    				f.fieldid,
			    				f.fieldcode,
			    				f.frmstudy,
	    						f.note,
			    				f.remove
			    		FROM ".$db->prefix."rb_groups g
			    		INNER JOIN ".$db->prefix."rb_fieldstudy f ON g.fieldid = f.fieldid
			    		WHERE g.groupid IN (".$rowid.")
			    					AND g.remove=0
			    	";
	    		return $rows = $db->query_read($sql);
	    	}
    }
    
    public static function ExpeledStudList(Ab_Database $db, $groupid){
    
    	$sql = "
			SELECT
					id as id,
    				groupid,
    				numbook,
    				fio,
    				datebirth,
    				preveducation
    		FROM ".$db->prefix."rb_students
    		WHERE groupid=".bkint($groupid)."
    					AND transferal=1
    		ORDER BY fio ASC
		";
    	return $db->query_read($sql);
    }
    
    public static function FindStudReport(Ab_Database $db, $value){
    	
    	$sql = "
    		SELECT
					s.groupid as id,
    				s.id as studid,
    				s.numbook,
    				s.fio,
    				s.transferal,
    				s.listgroup,
    				g.numgroup,
    				g.numcrs,
    				g.dateline,
    				f.fieldid,
    				f.fieldcode,
    				f.field,
    				f.frmstudy,
    				f.note
    		FROM ".$db->prefix."rb_students s
    		INNER JOIN ".$db->prefix."rb_groups g ON g.groupid = s.groupid
    		INNER JOIN ".$db->prefix."rb_fieldstudy f ON f.fieldid = g.fieldid
    		WHERE numbook='".bkstr($value)."' OR fio='".bkstr($value)."'
    		LIMIT 1
    	";
    	return $db->query_first($sql);
    }
    
    public static function MarkStudReport(Ab_Database $db, $d){
    	 
    			$sql = "
    					SELECT
    						  m.markid as id,
    						  sj.namesubject,
    						  sj.formcontrol,
    						  MAX(sh.date) as date,
    						  MAX(m.mark) as mark
    					FROM ".$db->prefix."rb_marks m
    					INNER JOIN ".$db->prefix."rb_sheet sh ON sh.sheetid = m.sheetid
    					INNER JOIN ".$db->prefix."rb_subject sj ON sh.subjectid = sj.subjectid
    					WHERE m.studid=".$d->studid."
    							AND sh.groupid = ".bkint($d->groupid)."
    								AND sj.fieldid = ".bkint($d->fieldid)."
    									AND sj.numcrs = ".bkint($d->course)."
											AND sj.semestr = ".bkint($d->semestr)."
												AND sh.type < 3
						GROUP BY sj.namesubject
    			";
    			return $db->query_read($sql);
    }
    
    public static function SheetItem(Ab_Database $db, $id){
    	$sql = "
			SELECT
					sh.firstattproc as att1,
    				sh.secondattproc as att2,
    				sh.thirdattproc as att3,
    				sh.date,
    				sh.fioteacher as ft,
    				sj.namesubject as ns,
    				sj.formcontrol as fct,
    				sj.numcrs as nc,
    				sj.semestr as sem,
    				sj.numhours as nh,
    				sj.project as pj,
    				f.fieldcode as fc,
    				g.numgroup as ng,
    				g.dateline as dad
			FROM ".$db->prefix."rb_sheet sh
			INNER JOIN ".$db->prefix."rb_subject sj ON sh.subjectid = sj.subjectid
			INNER JOIN ".$db->prefix."rb_fieldstudy f ON f.fieldid = sj.fieldid
			INNER JOIN ".$db->prefix."rb_groups g ON sh.groupid = g.groupid
			WHERE sh.sheetid = ".bkint($id)."
			LIMIT 1
		";
    	return $db->query_first($sql);
    }
    
    public static function ProgramList(Ab_Database $db){
    	$sql = "
			SELECT
    				l.edulevelid as id,
    				p.code,
    				p.name,
    				l.level,
    				f.och,
    				f.ochzaoch,
    				f.zaoch
    		FROM ".$db->prefix."un_program p
    		INNER JOIN ".$db->prefix."un_edulevel l ON p.programid = l.programid
    		INNER JOIN ".$db->prefix."un_eduform f ON l.edulevelid = f.edulevelid
    		WHERE p.remove=0 AND l.remove=0
		";
    	return $db->query_read($sql); 
    }
    
    public static function DepartList(Ab_Database $db){
    	$sql = "
			SELECT
    				departid as id,
    				namedepart,
    				shortname,
    				remove
    		FROM ".$db->prefix."rb_departs
		";
    	return $db->query_read($sql);
    }

    public static function DepartItem(Ab_Database $db, $id){
    	$sql = "
			SELECT
    				departid as id,
    				namedepart,
    				shortname,
    				remove
    		FROM ".$db->prefix."rb_departs
    		WHERE departid=".bkint($id)."
    		LIMIT 1
		";
    	return $db->query_first($sql);
    }
    
    public static function DepartAppend(Ab_Database $db, $d){
         $sql = "
			INSERT INTO ".$db->prefix."rb_departs (
				namedepart,shortname
			) VALUES (
				'".bkstr($d->namedepart)."',
				'".bkstr($d->shortname)."'
			)
		";
      	$db->query_write($sql);
    }
    
    public static function DepartUpdate(Ab_Database $db, $d){
    	$sql = "
			UPDATE ".$db->prefix."rb_departs
			SET
				namedepart='".bkstr($d->namedepart)."',
				shortname='".bkstr($d->shortname)."'
			WHERE departid=".bkint($d->id)."
			LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function DepartRemove(Ab_Database $db, $d){
    	$sql = "
			UPDATE ".$db->prefix."rb_departs
			SET
				remove=".bkint($d->remove)."
			WHERE departid=".bkint($d->id)."
			LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function TeacherList(Ab_Database $db, $departid){
    	$sql = "
			SELECT
    				teacherid as id,
    				fio,
    				remove
    		FROM ".$db->prefix."rb_teacher
    		WHERE departid=".bkint($departid)."
		";
    	return $db->query_read($sql);
    }
    
    public static function TeacherAppend(Ab_Database $db, $d){
    	$sql = "
			INSERT INTO ".$db->prefix."rb_teacher (
				departid,fio
			) VALUES (
				".bkint($d->departid).",
				'".bkstr($d->fio)."'
			)
		";
    	$db->query_write($sql);
    }
    
    public static function TeacherItem(Ab_Database $db, $id){
    	$sql = "
			SELECT
	    			teacherid as id,
	    			fio,
	    			remove
    		FROM ".$db->prefix."rb_teacher
    		WHERE  teacherid=".bkint($id)."
    		LIMIT 1
		";
    	return $db->query_first($sql);
    }
    
    public static function TeacherUpdate(Ab_Database $db, $d){
    	$sql = "
			UPDATE ".$db->prefix."rb_teacher
			SET
				departid=".bkint($d->departid).",
				fio='".bkstr($d->fio)."'
			WHERE teacherid=".bkint($d->id)."
			LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function TeacherRemove(Ab_Database $db, $d){
    	$sql = "
			UPDATE ".$db->prefix."rb_teacher
			SET
				remove=".bkint($d->remove)."
			WHERE teacherid=".bkint($d->id)."
			LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function StudidListFromMark(Ab_Database $db, $sheetid){
    	$sql = "
			SELECT 
    				studid as id
    		FROM ".$db->prefix."rb_marks
    		WHERE sheetid=".bkint($sheetid)."
		";
    	return $db->query_read($sql);
    }
}

?>