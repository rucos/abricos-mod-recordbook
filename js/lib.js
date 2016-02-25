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
    			args: ['subject']
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
    			args: ['group']
    		},
    		groupItem: {
    			args: ['groupid'],
    			attribute: false,
    			type: 'model:GroupItem'
    		},
    		groupRemove: {
    			args: ['groupid']
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
    			args: ['studid']
    		},
    		sheetList: {
    			attribute: false,
    			args: ['objData'],
    			type: 'modelList:SheetList'
    		},
    		sheetSave: {
    			args: ['objData']
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
    		configSave: {
    			args: ['data']
    		},
    		config: {
    			type: 'model:Config'
    		},
    		expeledGroupList: {
    			type: 'modelList:GroupList'
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
        	currentPageGroup: {value: 1},
        	findGroup: {value: false},
        	findGroupVal: {value: ''},
        	frmstudy: {value: 0},
        	Config: {value: NS.Config}
        },
        URLS: {
        	ws: "#app={C#MODNAMEURI}/wspace/ws/",
        	manager: {
        		view: function(){
        			
        			 return this.getURL('ws') + 'manager/ManagerWidget';
        		}
        	},
        	managerGroups: {
        		view: function(){
        			return this.getURL('ws') + 'managerGroups/ManagerWidgetGroups';
        		}
        	},
        	managerConfig: {
        		view: function(){
        			return this.getURL('ws') + 'managerConfig/ManagerWidgetConfig';
        		}
        	},
        	managerExpeled: {
        		view: function(){
        			return this.getURL('ws') + 'managerExpeled/ManagerWidgetExpeled';
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
        		editor: function(groupid, groupList){
        			var url = this.getURL('ws') + 'groupEditor/GroupEditorWidget/' + (groupid | 0) + '/'; 
        			if(groupList){
        				return url + groupList;//показать список группы
        			} else {
        				return url;//добавление or изменение группы
        			}
                },
        		create: function(){
        			return this.getURL('group.editor');
        		},
        		sheetEditor: function(groupid){
        			return this.getURL('ws') + 'sheetEditor/SheetEditorWidget/' + groupid + '/';
        		},
        		progressView: function(groupid){
        			return this.getURL('ws') + 'progressView/ProgressViewWidget/' + groupid + '/';
        		}
        	}
        }
    });
};