<?php
/**
 * @package Abricos
 * @subpackage recordbook
 * @copyright 2016 Kirill Kosaev
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Kirill Kosaev <kosaev-kira@mail.ru>
 */

class FieldItem extends AbricosModel {
    protected $_structModule = 'recordbook';
    protected $_structName = 'FieldItem';
}

class FieldList extends AbricosModelList {

}

class SubjectItem extends AbricosModel {
	protected $_structModule = 'recordbook';
	protected $_structName = 'SubjectItem';
}

class SubjectList extends AbricosModelList {

}

class GroupItem extends AbricosModel {
	protected $_structModule = 'recordbook';
	protected $_structName = 'GroupItem';
}

class GroupList extends AbricosModelList {

}

class StudItem extends AbricosModel {
	protected $_structModule = 'recordbook';
	protected $_structName = 'StudItem';
}

class StudList extends AbricosModelList {

}

class SheetItem extends AbricosModel {
	protected $_structModule = 'recordbook';
	protected $_structName = 'SheetItem';
}

class SheetList extends AbricosModelList {

}

class MarkItem extends AbricosModel {
	protected $_structModule = 'recordbook';
	protected $_structName = 'MarkItem';
}

class MarkList extends AbricosModelList {

}

class GroupModalItem extends AbricosModel {
	protected $_structModule = 'recordbook';
	protected $_structName = 'GroupModalItem';
}

class GroupModalList extends AbricosModelList {

}


?>