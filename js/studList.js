var Component = new Brick.Component();
console.log();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;
    
 
    NS.StudListWidget = Y.Base.create('studListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	this.reloadList();
        },
        reloadList: function(){
        	var groupid = this.get('groupid');
        	this.set('waiting', true);
        	this.get('appInstance').studList(groupid, function(err, result){
        		this.set('waiting', false);
	        		if(!err){
	        			this.set('studList', result.studList);
	        				this.renderList();
	        		}
        	}, this);
        },
        renderList: function(){
        	var studList = this.get('studList'),
        		lst = "",
        		tp = this.template,
        		findStud = this.get('findStud');
        	
        	if(findStud){
        		tp.removeClass('allStud', 'hide');
        	} else {
        		tp.addClass('allStud', 'hide');
        	}
        	
        	studList.each(function(stud){
        		lst += tp.replace('row', [{
        			datebirth: Brick.dateExt.convert(stud.get('datebirth'), 2),
        			success: findStud ? 'class="success"' : ""
        		},stud.toJSON()]);
        	});
        	tp.setHTML('list', tp.replace('table', {rows: lst}));
        		this.set('dataTable', lst);
        },
        addStudShow: function(flag){
        	var dataTable = this.get('dataTable'),
        		tp = this.template;

        	if(flag){
        		tp.setHTML('list', tp.replace('table', {rows: tp.data.rowAdd + dataTable}));
        	} else {
        		tp.setHTML('list', tp.replace('table', {rows: dataTable}));	
        	}
        },
        editStudShow: function(studid, parentRow){
         	var tp = this.template,
         		lib = this.get('appInstance'),
         		lst = "";
         	
    		lst += tp.replace('rowEdit', {
    			'fio': parentRow.cells[0].innerHTML,
        		'numbook': parentRow.cells[1].innerHTML,
        		'datebirth': lib.setDate(parentRow.cells[2].innerHTML),
        		'preveducation': parentRow.cells[3].innerHTML
        	});
        	parentRow.innerHTML = lst;
        		this.set('studid', studid);
        },
        actStud: function(){
        	var groupid = this.get('groupid'),
        		studid = this.get('studid'),
        		tp = this.template,
        		lib = this.get('appInstance'),
        		row = arguments[0] ? 'rowAdd.' : 'rowEdit.',
        		dateBirth = tp.gel(row+'datebirth').value.split('-'),
        		findStud = this.get('findStud');
        	
        	var	data = {
        			gid: groupid,
        			sid: studid,
        			numbook: tp.gel(row+'numbook').value,
        			fio: tp.gel(row+'fio').value,
        			datebirth: lib.getDate(dateBirth),
        			preveducation: tp.gel(row+'preveducation').value
        		};
        	
        	var empty = lib.isEmptyInput(data);
        	if(empty){
        		var lst = studid === 0 ? 'rowAdd.' + empty: 'rowEdit.' + empty;
        		switch(empty){
        			case 'numbook': alert( 'Укажите номер зачетной книжки' ); break;
        			case 'fio': alert( 'Укажите ФИО студента' ); break;
        			case 'preveducation': alert( 'Укажите предыдущий документ об образовании' ); break;
        			case 'datebirth': alert( 'Укажите дату рождения' ); break;
        		}
        		tp.gel(lst).focus();
        	} else {
	        	this.set('waiting', true);
	        	this.get('appInstance').studSave(data, function(err, result){
	        		this.set('studid', 0);
	        		this.set('waiting', false);
	        		
		        		if(!err){
		        			if(findStud){
		        				this.find();
		        			} else {
		        				this.reloadList();
		        			}
		        		}
	        	}, this);
        	}
        },
        remove: function(studid){
        	var findStud = this.get('findStud');
        	
        	this.set('waiting', true);
	        	this.get('appInstance').studRemove(studid, function(err, result){
	        		this.set('waiting', false);
	        		if(!err){
	        			if(findStud){
	        				this.find();
	        			} else {
	        				this.reloadList();
	        			}
	        		}
	        	}, this);
	        	this.set('studid', 0);
        },
        find: function(){
        	var data = {
        		groupid: this.get('groupid'),
        		type: 'Stud',
        		value: this.get('findVal')
        	};
        	
        	this.set('waiting', true);
	        	this.get('appInstance').findStud(data, function(err, result){
	        		this.set('waiting', false);
	        		if(!err){
	        			this.set('studList', result.findStud);
	        			this.set('findStud', true);
	        			
	        				this.renderList();
	        		}
	        	}, this);
        },
        fillModal: function(id, fio, numbook){
        	var tp = this.template,
        		lst = "";
        	
        	
        	tp.setHTML('modal', tp.replace('modal', {
        		fio: fio,
        		numbook: numbook,
        		id: id
        	}));
        },
        reqFieldStudy: function(formStudy, studid){
        	var data = {
        		formStudy: formStudy,
        		type: 'Field'
        	};
        	
        	this.set('waiting', true);
        	this.get('appInstance').fillModalField(data, function(err, result){
        		this.set('waiting', false);
        		if(!err){
        			this.set('modalFieldList', result.fillModalField);
        				this.fillModalFieldList(studid);
        		}
        	}, this);
        },
        fillModalFieldList: function(studid){
        	var modalFieldList = this.get('modalFieldList'),
        		tp = this.template,
        		lst = "";
        	
        	modalFieldList.each(function(field){
        		lst += tp.replace('liModalField', [field.toJSON()]);
        	});
        	tp.setHTML('modal.ulModalField', tp.replace('ulModal', {
        		head: 'Список направлений:',
        		li: lst,
        		field: '',
        		studid: studid
        	}));
        },
        reqGroup: function(fieldid, studid){
        	var data = {
        			fieldid: fieldid,
            		type: 'GroupModal',
            		curGroup: this.get('groupid')
            	};
        	
            	this.set('waiting', true);
            	this.get('appInstance').fillModalGroup(data, function(err, result){
            		this.set('waiting', false);
            		if(!err){
            			this.set('modalGroupList', result.fillModalGroup);
            				this.fillModalGroupList(studid);
            		}
            	}, this);
        },
        fillModalGroupList: function(studid){
        	var modalGroupList = this.get('modalGroupList'),
        		tp = this.template,
        		lst = "";
        	
        	modalGroupList.each(function(group){
        		lst += tp.replace('liModalGroup', [group.toJSON()]);
        	});
        	
        	tp.setHTML('modal.ulModalGroup', tp.replace('ulModal', {
        		head: 'Список групп:',
        		li: lst,
        		field: this.get('modalCurField'),
        		studid: studid
        	}));
        },
        renderBtnStudy: function(name){
        	var tp = this.template,
        		arr = ['och', 'zaoch', 'ochzaoch'];
        	
        	for(var i = 0; i < 3; i++){
        		var flag = arr[i] == name ? true : false;
        			tp.toggleClass('modal.'+arr[i], 'btn-primary', flag);
        	}
        	
        },
        closeModal:function(studtid, reload){
 			var tp = this.template;

			   tp.setHTML('modal', '');
			   tp.toggleView(false, 'row.transitgroup-' + studtid, 'row.transit-' + studtid);
			   
			   if(reload) this.reloadList();
        },        
        reqTransitionStud: function(studid, groupid){
        	var data = {
        		groupid: groupid,
        		studid: studid
        	};
        	
        	this.set('waiting', true);
        	this.get('appInstance').transitStud(data, function(err, result){
        		this.set('waiting', false);
        		if(!err){
        			if(result.transitStud){
        				this.template.setHTML('modal.result', 'Студент переведен');
        				
        			}
        		}
        	}, this);
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, table, row, rowAdd, rowEdit, modal, liModalField, ulModal, liModalGroup'},
            groupid: {value: 0},
            studid: {value: 0},
            studList: {value: null},
            dataTable: {value: ''},
            findStud: {value: false},
            findVal: {value: ''},
            modalFieldList: {value: null},
            modalGroupList: {value: null},
            modalCurField: {value: null}
        },
        CLICKS: {
           	'remove-show': {
                event: function(e){
                       var studtid = e.target.getData('id');
                       this.template.toggleView(true, 'row.removegroup-' + studtid, 'row.remove-' + studtid);
                   }
            },
            'remove-cancel': {
            	event: function(e){
                       var studtid = e.target.getData('id');
                       this.template.toggleView(false, 'row.removegroup-' + studtid, 'row.remove-' + studtid);
                   }
            },
        	'addStud-show': {
        		event: function(e){
        			this.set('studid', 0);
        			this.addStudShow(true);
        		}
        	},
         	'showStud-cancel': {
        		event: function(e){
        			this.set('studid', 0);
        			this.addStudShow(false);
        		}
        	},
        	'editStud-show': {
        		event: function(e){
        			var studid = e.target.getData('id');
        			this.editStudShow(studid, e.target._node.parentNode.parentNode);
        		}
        	},
        	'transitionStud-show': {
        		event: function(e){
        			var tp = this.template,
        				targ = e.target,
        				studtid = targ.getData('id'),
        				row = targ.getDOMNode().parentNode.parentNode,
        				child = row.childNodes;
        			
        			this.fillModal(studtid, child[0].innerHTML, child[1].innerHTML);
        			tp.toggleView(true, 'row.transitgroup-' + studtid, 'row.transit-' + studtid);
        		}
        	},
            'transit-cancel': {
            	event: function(e){
            		this.closeModal(e.target.getData('id'), false);
               }
            },
        	addStud: {
        		event: function(e){
        			this.actStud(true);
        		}
        	},
        	editStud: {
        		event: function(e){
        			this.actStud();
        			
        		}
        	},
        	remove: {
        		event: function(e){
        			var studid = e.target.getData('id');
        				this.remove(studid);
        		}
        	},
        	find: {
        		event: function(e){
        			var tp = this.template,
        				val = tp.getValue('findStud');
        			
        			this.set('findVal', val);
        			this.find();
        			
        		}
        	},
        	showAllStud: {
        		event: function(e){
        			this.set('findStud', false);
        			this.set('findVal', '');
        			
        			this.reloadList();
        		}
        	},
        	changeFormEdu:{
        		event: function(e){
        			var tp = this.template,
        				targ = e.target,
        				formStudy = targ.getData('formStudy'),
        				name = targ.getData('name'),
        				studid = targ.getData('studid');
        			
        				tp.setHTML('modal.ulModalGroup', '');

        				this.renderBtnStudy(name);
        				this.reqFieldStudy(formStudy, studid);
        		}
        	},
        	showGroupList: {
        		event: function(e){
        			var targ = e.target,
        				fieldid = targ.getData('id'),
        				text = targ.getDOMNode().innerHTML,
        				studid = targ.getData('studid');
        				
        			this.set('modalCurField', text);
        				this.reqGroup(fieldid, studid);
        		}
        	},
        	transition: {
        		event: function(e){
        			var tp = this.template, 
        				targ = e.target,
        				num = targ.getDOMNode().innerHTML,
        				isOk = confirm( 'перевести в группу №' +  num + '?');
        			
        			if(isOk){
        				var studid = targ.getData('studid'),
        					groupid = targ.getData('id');
        				
        				this.reqTransitionStud(studid, groupid);
        				
        			}
        			
        		}
        	},
        	closeModal: {
        		event: function(e){
        			this.closeModal(e.target.getData('id'), true);
        		}
        	}
        }
    });
};