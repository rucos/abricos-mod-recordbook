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

    	$where = $widget === 'groupEditor' ? "WHERE remove=0" : "";
    	
    	$sql = "
			SELECT 
					fieldid as id,
					fieldcode,
					field,
					frmstudy,
					qual,
					depart,
					remove
			FROM ".$db->prefix."rb_fieldstudy
			".$where."
			ORDER BY remove ASC
		";
		return $db->query_read($sql);
    }
    
    public static function FieldItem(Ab_Database $db, $id){
    	$sql = "
			SELECT
					fieldid as id,
					fieldcode,
					field,
					frmstudy,
					qual,
					depart,
    				remove
			FROM ".$db->prefix."rb_fieldstudy
			WHERE fieldid = ".bkint($id)."
			LIMIT 1
		";
    	return $db->query_first($sql);
    }
    
    public static function FieldUpdate(Ab_Database $db, $id, $d){
    	
    	$sql = "
			UPDATE ".$db->prefix."rb_fieldstudy
			SET
				fieldcode='".bkstr($d->fieldcode)."',
				field='".bkstr($d->field)."',
				frmstudy='".bkstr($d->frmstudy)."',
				qual='".bkstr($d->qual)."',
				depart='".bkstr($d->depart)."'
			WHERE fieldid=".bkint($id)."
			LIMIT 1
		";
    	$db->query_write($sql);
    }
    
    public static function FieldAppend(Ab_Database $db, $d){
    	 
         $sql = "
			INSERT INTO ".$db->prefix."rb_fieldstudy (
				fieldcode,field,frmstudy,qual,depart
			) VALUES (
				'".bkstr($d->fieldcode)."',
				'".bkstr($d->field)."',
				'".bkstr($d->frmstudy)."',
				'".bkstr($d->qual)."',
				'".bkstr($d->depart)."'
			)
		";
      	$db->query_write($sql);
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
    	 
		$sql = "
				INSERT INTO ".$db->prefix."rb_subject (
					fieldid, namesubject, formcontrol, numcrs, semestr, numhours, project
				) VALUES (
						".bkint($d->id).",
						'".bkstr($d->namesubject)."',
						'".bkstr($d->formcontrol)."',
						".bkint($d->numcrs).",
						".bkint($d->semestr).",
						".bkint($d->numhours).",
						 ".bkint($d->project)."
				)
		";
		$db->query_write($sql);
    }
    
    public static function SubjectEdit(Ab_Database $db, $d){
    
    	$sql = "
			UPDATE ".$db->prefix."rb_subject
			SET 
				namesubject='".bkstr($d->namesubject)."',
				formcontrol='".bkstr($d->formcontrol)."',
				numcrs=".bkint($d->numcrs).",
				semestr=".bkint($d->semestr).",
				numhours=".bkint($d->numhours).",
				project=".bkint($d->project)."	
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
    				f.field,
    				f.fieldid,
    				f.fieldcode,
    				f.frmstudy,
    				f.remove
    		FROM ".$db->prefix."rb_groups g
    		INNER JOIN ".$db->prefix."rb_fieldstudy f ON f.fieldid = g.fieldid
    		WHERE f.frmstudy = '".bkstr($d->frmstudy)."'
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
			WHERE f.frmstudy = '".bkstr($frmstudy)."'
		";
    	$row = $db->query_first($sql);
    	return $row['cnt'];
    }
    
    public static function GroupAppend(Ab_Database $db, $group){
    	 
    	$sql = "
			INSERT INTO ".$db->prefix."rb_groups (fieldid, numgroup, numcrs, dateline)
					VALUES (
						".bkint($group->currentFieldId).",
						'".bkstr($group->numgroup)."',
							".bkint($group->numcrs).",
								".TIMENOW."
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
    				f.field,
    				f.fieldid,
    				f.fieldcode,
    				f.frmstudy
    		FROM ".$db->prefix."rb_groups g
    		INNER JOIN ".$db->prefix."rb_fieldstudy f ON f.fieldid = g.fieldid
    		WHERE g.groupid = ".bkint($groupid)."
    		LIMIT 1
		";
    	return $db->query_first($sql);
    }
    
    public static function GroupEdit(Ab_Database $db, $group){
    
    	$sql = "
			UPDATE ".$db->prefix."rb_groups
			SET 
				fieldid=".bkint($group->currentFieldId).",
				numgroup='".bkstr($group->numgroup)."',
				numcrs=".bkint($group->numcrs)."
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
    
    	$sql = "
			SELECT
    				g.groupid as id,
    				g.numgroup,
    				g.numcrs,
    				g.dateline,
    				f.field,
    				f.fieldid,
    				f.fieldcode,
    				f.frmstudy
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
    				preveducation
    		FROM ".$db->prefix."rb_students
    		WHERE groupid=".bkint($groupid)." 
    					AND transferal=0
    		ORDER BY fio ASC
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
    	
    	if($d->type === 3 || $d->type === 4){
    		$where .= " AND project = 1";
    	}
    	
    	$sql = "
				SELECT
						subjectid as id,
						namesubject,
						formcontrol,
						numcrs,
						semestr,
						numhours
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
    				s.fioteacher,
    				sj.remove
			FROM ".$db->prefix."rb_sheet s INNER JOIN ".$db->prefix."rb_subject sj ON sj.subjectid = s.subjectid
			WHERE s.groupid = ".bkint($d->groupid)."
						AND sj.semestr = ".bkint($d->currentSemestr)." 
								AND sj.numcrs = ".bkint($d->numcrs)."
									 AND sj.fieldid = ".bkint($d->fieldid)."
			ORDER BY id DESC
		";
    	return $db->query_read($sql);
    }
    
    public static function SheetAppend(Ab_Database $db, $d){
    
    	$a = array(30, 30, 40);
   		if($d->typeSheet === 3 || $d->typeSheet === 4){
   			$a[0] = 0;
   			$a[1] = 0;
   			$a[2] = 100;
   		}
   		
    	$sql = "
			INSERT INTO ".$db->prefix."rb_sheet (subjectid, groupid, firstattproc, secondattproc, thirdattproc, date, type, fioteacher)
			VALUES (
					".bkint($d->idSubject).",
					".bkint($d->groupid).",
						".$a[0].",
						".$a[1].",
						".$a[2].",		
					".bkint($d->date).",
					".bkint($d->typeSheet).",
					'".bkstr($d->fioteacher)."'
			)
		";
    	$db->query_write($sql);
    	
    		$idSheet = mysql_insert_id();
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
    		
		    		foreach($arrStud as $key => $val){
		    			$valIns .= "(".$idSheet.",".$val.")";
		    			if($key < $arrCount - 1){
		    				$valIns .= ",";
		    			}
		    		}
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
    
    	$sql = "
				UPDATE ".$db->prefix."rb_sheet
				SET
					date=".bkint($d->date).",
					fioteacher='".bkstr($d->fioteacher)."'
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
			WHERE fieldid = ".bkint($d->fieldid)." AND namesubject LIKE '".bkstr($d->value)."%'
		";
    	 
    	return $db->query_read($sql);
    }
    
    public static function StudFind(Ab_Database $db, $d){
    
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
    			numcrs
			FROM ".$db->prefix."rb_groups
			WHERE fieldid = ".bkint($fieldid)."
						AND remove = 0
							AND groupid <> ".bkint($curGroup)."
		";
    	return $db->query_read($sql);
    }
    
    public static function TransitStud(Ab_Database $db, $d){
    	
    	$sql = "
			UPDATE ".$db->prefix."rb_students
			SET
				groupid = ".bkint($d->groupid).",
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
					formcontrol
			FROM ".$db->prefix."rb_subject
			WHERE fieldid = ".bkint($d->fieldid)." 
						AND numcrs = ".bkint($d->numcrs)."
							AND semestr = ".bkint($d->semestr)."
								AND remove=0	
			ORDER BY formcontrol DESC
		";
    	 return $db->query_read($sql);
    	
    }
    
    public static function MarkListStat(Ab_Database $db, $d){
    	
    	$sql = "
    		SELECT
    				sh.sheetid
    		FROM ".$db->prefix."rb_sheet sh
    		INNER JOIN ".$db->prefix."rb_subject sj ON sj.subjectid = sh.subjectid
    		WHERE sh.groupid = ".bkint($d->groupid)."
    				AND sj.fieldid = ".bkint($d->fieldid)."
    					AND sj.numcrs = ".bkint($d->numcrs)."
							AND sj.semestr = ".bkint($d->semestr)."
								AND sh.type < 3
    	";
    	$rows = $db->query_read($sql);
    	$sheet = '';
	    	while (($dd = $db->fetch_array($rows))){
	    		$sheet .= $dd["sheetid"].',';
	    	}
		   if(strlen($sheet) > 0){
		   		$rowid = substr($sheet, 0, -1);
			   	$sql = "
			    		SELECT
			    				m.markid as id,
			    				sh.subjectid,
			   					m.studid,
			    				MAX(m.mark) as mark
			    		FROM ".$db->prefix."rb_marks m
			    		INNER JOIN ".$db->prefix."rb_sheet sh ON sh.sheetid = m.sheetid
			    		WHERE m.sheetid IN (".$rowid.")
			    		GROUP BY sh.subjectid,m.studid
			    	";
			   	return $rows = $db->query_read($sql);
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
			    				f.remove
			    		FROM ".$db->prefix."rb_groups g
			    		INNER JOIN ".$db->prefix."rb_fieldstudy f ON g.fieldid = f.fieldid
			    		WHERE g.fieldid IN (".$rowid.")
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
}

?>