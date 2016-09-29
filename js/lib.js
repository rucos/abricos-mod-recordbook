var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['application.js']},
        {name: '{C#MODNAME}', files: ['model.js']}
    ]
};
Component.entryPoint = function(NS){

	NS.roles = new Brick.AppRoles('{C#MODNAME}', {
        isAdmin: 50
    });

    var COMPONENT = this,
        SYS = Brick.mod.sys;

    SYS.Application.build(COMPONENT, {}, {
        initializer: function(){
            this.cacheClear();
            NS.roles.load(function(){
                this.initCallbackFire();
            }, this);
        },
        cacheClear: function(){
        	
        },
        isEmptyInput: function(obj){
    		for(var i in obj){
        		if(obj[i].length === 0){
        			return i;
        		}
        	}
        },
        getDate: function(inpDate){
   			return new Date(inpDate[0], inpDate[1] - 1, inpDate[2]).getTime() / 1000;
        },
        setDate: function(date){
        	return date.split('.').reverse().join('-');
        },
        isNumeric: function(n){
        	return !isNaN(parseFloat(n)) && isFinite(n) && n.indexOf('.') == -1;
        },
        setTradMark: function(val){
        	if(val <= 100){
        		if(val < 51){
        			return '';
        		} else if(val >= 51 && val < 71){
        			return '3';
        		} else if(val >= 71 && val < 86){
        			return '4';
        		} else {
        			return '5';
        		}
        	} else {
        		switch(val){
        			case 101: return '';
        			case 102: return 'Зач';
        			case 103: return '3';
        			case 104: return '4';
        			case 105: return '5';
        		}
        	}
        },
        determFormEdu: function(key){
        	var obj = {
        		'1': 'очная форма',
        		'2': 'очно-заочная форма',
        		'3': 'заочная форма'
        	};
        	return obj[key] || '';
        },
        unSetActive: function(element){
        	var collect = element.childNodes,
        		cl = element.tagName == 'TBODY' ? 'success' : 'active';
        	
        		for(var i = 0, len = collect.length; i < len; i++){
        			collect[i].classList.remove(cl);
        		}
        }
    }, [], {
        REQS: {
    		fieldList: {
    			args: ['widget'],
                attribute: false,
                type: 'modelList:FieldList'
    		},
    		fieldItem: {
    			args: ['fieldid'],
    			attribute: false,
    			type: 'model:FieldItem'
    		},
    		fieldSave: {
    			args: ['data']
    		},
    		fieldRemove: {
    			args: ['fieldid', 'restore']
    		},
    		subjectList: {
    			attribute: false,
    			args: ['data'],
    			type: 'modelList:SubjectList'
    		},
    		subjectSave: {
    			args: ['data']
    		},
    		subjectRemove: {
    			args: ['subjectid', 'restore']
    		},
    		groupList: {
    			args: ['data'],
                attribute: false,
                type: 'modelList:GroupList'
    		},
    		groupSave: {
    			args: ['data']
    		},
    		groupItem: {
    			args: ['groupid'],
    			attribute: false,
    			type: 'model:GroupItem'
    		},
    		groupRemove: {
    			args: ['data']
    		},
    		studList: {
    			attribute: false,
    			args: ['groupid'],
    			type: 'modelList:StudList'
    		},
    		studSave: {
    			args: ['studs']
    		},
    		studRemove: {
    			args: ['data']
    		},
    		sheetList: {
    			attribute: false,
    			args: ['data'],
    			type: 'modelList:SheetList'
    		},
    		sheetSave: {
    			args: ['data']
    		},
    		sheetRemove: {
    			args: ['sheetid']
    		},
    		markList: {
    			attribute: false,
    			args: ['idSheet'],
    			type: 'modelList:MarkList'
    		},
    		updateWeight: {
    			args: ['objData']
    		},
    		markUpdate: {
    			args: ['objData']
    		},
       		markUpdateZaoch: {
    			args: ['data']
    		},
    		countPaginator: {
    			args: ['data']
    		},
    		findSubject: {
    			args: ['data'],
    			type: 'modelList:SubjectList'
    		},
    		findGroup: {
    			args: ['data'],
    			type: 'modelList:GroupList'
    		},
    		findStud: {
    			args: ['data'],
    			type: 'modelList:StudList'
    		},
    		fillModalField: {
    			args: ['data'],
    			type: 'modelList:FieldList'
    		},
    		fillModalGroup: {
    			args: ['data'],
    			type: 'modelList:GroupModalList'
    		},
    		transitStud: {
    			args: ['data']
    		},
    		markListStat: {
    			args: ['data'],
    			type: 'modelList:MarkListStat'
    		},
    		markListStatProj: {
    			type: 'modelList:MarkListStat'
    		},
    		expeledGroupList: {
    			type: 'modelList:GroupList'
    		},
    		expeledStudList: {
    			args: ['groupid'],
    			type: 'modelList:StudList'
    		},
    		findStudReport: {
    			args: ['value'],
    			attribute: false,
    			type: 'model:ReportItem'
    		},
    		markStudReport: {
    			args: ['data'],
    			attribute: false,
    			type: 'modelList:MarkListStat'
    		},
    		programList: {
    			attribute: false,
    			type: 'modelList:ProgramList'
    		},
    		departList: {
    			attribute: false,
    			type: 'modelList:DepartList'
    		},
    		departSave: {
    			args: ['data']
    		},
    		departItem: {
    			args: ['departid'],
    			attribute: false,
    			type: 'model:DepartItem'
    		},
    		teacherList: {
    			args: ['departid'],
    			attribute: false,
    			type: 'modelList:TeacherList'
    		},
    		teacherSave: {
    			args: ['data']
    		},
    		teacherItem: {
    			args: ['teacherid'],
    			attribute: false,
    			type: 'model:TeacherItem'
    		}
        },
        ATTRS: {
        	isLoadAppStructure: {value: true},
        	FieldList: {value: NS.FieldList},
        	FieldItem: {value: NS.FieldItem},
        	SubjectList: {value: NS.SubjectList},
        	GroupList: {value: NS.GroupList},
        	GroupItem: {value: NS.GroupItem},
        	StudList: {value: NS.StudList},
        	SheetList: {value: NS.SheetList},
        	SheetItem: {value: NS.SheetItem},
        	MarkList: {value: NS.MarkList},
        	MarkListStat: {value: NS.MarkListStat},
        	MarkItem: {value: NS.MarkItem},
        	GroupModalList: {value: NS.GroupModalList},
        	ReportItem: {value: NS.ReportItem},
        	findGroup: {value: false},
        	findGroupVal: {value: ''},
        	frmstudy: {value: 0},
        	ProgramList: {value: NS.ProgramList},
        	ProgramItem: {value: NS.ProgramItem},
        	DepartList: {value: NS.DepartList},
        	DepartItem: {value: NS.DepartItem},
        	TeacherList: {value: NS.TeacherList},
        	TeacherItem: {value: NS.TeacherItem}
        },
        URLS: {
        	ws: "#app={C#MODNAMEURI}/wspace/ws/",
        	groupEditor: "groupEditor/GroupEditorWidget/",
        	fieldManager: {
        		view: function(){
        			 return this.getURL('ws') + 'fieldManager/FieldManagerWidget';
        		}
        	},
        	managerGroups: {
        		view: function(){
        			return this.getURL('ws') + 'managerGroups/ManagerWidgetGroups';
        		}
        	},
        	managerExpeled: {
        		view: function(){
        			return this.getURL('ws') + 'managerExpeled/ManagerWidgetExpeled';
        		}
        	},
        	managerReport: {
        		view: function(){
        			return this.getURL('ws') + 'managerReport/ManagerWidgetReport';
        		}
        	},
        	field: {
        	    editor: function(fieldid){
        	    	return this.getURL('ws') + 'fieldEditor/FieldEditorWidget/' + (fieldid | 0) + '/';
                },
                create: function(){
                	return this.getURL('field.editor');
                }
        	},
        	group: {
        		editor: function(groupid, groupMenu){
        			var url = this.getURL('ws') + this.getURL('groupEditor') + (groupid | 0) + '/';
        			
        			if(groupMenu){
        				url += groupMenu;
        			}
        			return url;
                },
        		create: function(){
        			return this.getURL('group.editor');
        		}
        	},
        	managerDepart: {
        		view: function(){
        			return this.getURL('ws') + 'departManager/DepartManagerWidget';
        		}
        	}
        }
    });
};