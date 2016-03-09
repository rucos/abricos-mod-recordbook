var Component = new Brick.Component();
console.log();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js']},
        {name: '{C#MODNAME}', files: ['pagination.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;
    
 
    NS.SubjectListWidget = Y.Base.create('subjectListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	var tp = this.template;
        	
            this.pagination = new NS.PaginationWidget({
                srcNode: tp.gel('pag'),
                parent: this
            });
            
        	this.reloadList();
        },
        destructor: function(){
            if (this.pagination){
                this.pagination.destroy();
            }
        },
        reloadList: function(){
        	var find = this.get('find');
        	
        	if(!find){
	        	var data = {
	        		  	fieldid: this.get('fieldid'),
	            		pageSub: this.pagination.get('currentPage'),
	            		from: 'subjectListWidget'
	        	}; 
	        	
	        	this.set('waiting', true);
	        		this.get('appInstance').subjectList(data, function(err, result){
	        			this.set('waiting', false);
	        			
	        			this.pagination.set('countRow', result.countPaginator);
	        				if(result.subjectList.size() > 0 || data.pageSub === 1){//если страница пустая то переход на предыдущую
	        					this.set('subjectList', result.subjectList);
	        						this.renderList();
	        				} else {
	        					this.pagination.set('currentPage', Math.max(1, data.pageSub - 1));
	        						this.reloadList();
	        				}
	        		}, this);
        	} else {
        		var tp = this.template,
					val = tp.gel('findSubject').value;
        		
        		this.find(val);
        	}
        },
        renderList: function(){
        	var subjectList = this.get('subjectList'),        	        	
        		lst = "",
        		tp = this.template,
        		find = this.get('find');
			   
        	subjectList.each(function(subject){
        		var obj = {
        			act: 'Удалить',
        			event: 'remove-show',
        			rem: ''
        		};
        		
        		if(subject.get('remove') === 1){
        			obj.act = 'Восстановить';
        			obj.event = 'restore';
        			obj.rem = tp.replace('label');
        		}
        		
            	lst += tp.replace('row', [{
            		semestr: subject.get('semestr') === 1 ? 'Осенний' : 'Весенний',
            		project: subject.get('project') === 1 ? 'Да': 'Нет',
            		cl: find ? 'success' : '',
            		act:  obj.act,
            		event: obj.event,
            		rem: obj.rem
            	},subject.toJSON()]);
        	});
        	 tp.setHTML('list', tp.replace('table', {rows: lst}));
        	 	this.set('dataTable', lst);
        	 		this.set('subjectid', 0);
        	 			if(!find) this.pagination.renderPaginator();
        },
        subjectShow: function(id, parentRow){
        	var tp = this.template,
				lst = "";
        	
				if(id === 0){//если добавляем
					lst = this.renderSubjectRow() + this.get('dataTable');//добавить новую строку в разметку таблицы
						this.set('subjectid', 0);
				} else if(parentRow){//если изменяем
					parentRow.innerHTML = this.renderSubjectRow(parentRow);
						if(tp.gel('rowAct.project').value == 1){
							tp.gel('rowAct.project').checked = true;
						}
			  				this.set('subjectid', id);
			  					return;
				} else {//если отмена
					lst = this.get('dataTable');
				}
				tp.setHTML('list', tp.replace('table', {rows: lst}));
        },
        renderSubjectRow: function(row){
        	var tp = this.template,
        		lst = "";
        			lst += tp.replace('rowAct', {
			     		'namesubject': row ? row.cells[0].childNodes[0].textContent : '',
		        		'formcontrol': row ? row.cells[1].innerHTML : '',
		        		'numcrs': row ? row.cells[2].innerHTML : '',
		        		'semestr':  row ? row.cells[3].innerHTML : '',
		        		'numhours':  row ? row.cells[4].innerHTML : '',
		        		'act': row ? 'Изменить' : 'Добавить',
		        		'val': row && row.cells[5].innerHTML == 'Да' ?  1 : 0
			    	});
	        			return lst;
        },
        actSubject: function(){
        	var fieldid = this.get('fieldid'),
        		subjectid = this.get('subjectid'),
        		tp = this.template,
        		sem = tp.gel('rowAct.semestr').value,
        		lib = this.get('appInstance');
        	
        	if(sem.length > 0){
        		sem = sem == 'Осенний' ? 1 : 2;
        	}
        	
        	var data = {
    			id: fieldid,
    			subjectid: subjectid,
    			namesubject: tp.gel('rowAct.namesubject').value,
    			formcontrol: tp.gel('rowAct.formcontrol').value,
    			numcrs: tp.gel('rowAct.numcrs').value,
    			semestr: sem,
    			numhours: tp.gel('rowAct.numhours').value,
    			project: tp.gel('rowAct.project').checked
    		};
        	
        	var empty = lib.isEmptyInput(data);
        	
        	if(empty){//проверка на заполняемость input
        		var lst = "rowAct." + empty;
        		switch(empty){
        			case 'namesubject': alert( 'Укажите название предмета' ); break;
        			case 'formcontrol': alert( 'Укажите форму контроля' ); break;
        			case 'numcrs': alert( 'Укажите номер курса' ); break;
        			case 'semestr': alert( 'Укажите номер семестра' ); break;
        			case 'numhours': alert( 'Укажите количество часов' ); break;
        		}
        		tp.gel(lst).focus();
        		
        	} else {
        		this.set('waiting', true);
        			lib.subjectSave(data, function(err, result){
        				this.set('subjectid', 0);
	        			this.set('waiting', false);
	        			
		    			if(!err){
		    					this.reloadList();
		    			}
		    		}, this);
        	}
        },
        removeSubject: function(subjectid, restore){
        	this.set('waiting', true);
        		this.get('appInstance').subjectRemove(subjectid, restore, function(err, result){
        			this.set('waiting', false);
        				this.reloadList();
        		}, this);
        		this.set('subjectid', 0);
        },
        find: function(val){
        	var data = {
        		fieldid: this.get('fieldid'),
        		value: val || 0,
        		type: 'Subject'
        	}; 
        	
        	this.set('waiting', true);
        	this.get('appInstance').findSubject(data, function(err, result){
        		this.set('waiting', false);
        			if(!err){
        				this.set('subjectList', result.findSubject)
        					this.renderList();
        			}
        	}, this);
        	
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, table, row, rowAct, label'},
            fieldid: {value: 0},
            subjectList: {value: null},
            dataTable: {value: ''},
            subjectid: {value: 0},
            find: {value: false}
        },
        CLICKS: {
        	'remove-show': {
                event: function(e){
                       var subjectid = e.target.getData('id');
                       this.template.toggleView(true, 'row.removegroup-' + subjectid, 'row.remove-' + subjectid);
                   }
            },
            'remove-cancel': {
            	event: function(e){
                       var subjectid = e.target.getData('id');
                       this.template.toggleView(false, 'row.removegroup-' + subjectid, 'row.remove-' + subjectid);
                   }
            },
        	'addSubject-show': {
        		event: function(e){
        			this.subjectShow(0);
         		}
        	},
        	'showSubject-cancel': {
        		event: function(e){
        			this.subjectShow();
        		}
        	},
        	actSubject: {
        		event: function(e){
        			this.actSubject();
        		}
        	},
        	'editSubject-show': {
        		event: function(e){
        			var subjectid = e.target.getData('id');
        				this.subjectShow(subjectid, e.target._node.parentNode.parentNode);// id предмета, строка таблицы
        		}
        	},
        	remove: {
        		event: function(e){
        			var subjectid = e.target.getData('id');
        				this.removeSubject(subjectid, 1);
        		}
        	},
        	chooseFormControl: {
        		event: function(e){
        			var value = e.target.getData('value'),
        				tp = this.template;
        			
        			tp.gel('rowAct.formcontrol').value = value;
        			tp.removeClass('rowAct.divFormControl', 'open');
        		}
        	},
        	chooseSemestr: {
        		event: function(e){
        			var nameSem = e.target,
    					tp = this.template;
    			
	    			tp.gel('rowAct.semestr').value = nameSem.getDOMNode().innerHTML;
	    			tp.gel('rowAct.semestr').name = nameSem.getData('value');
	    			tp.removeClass('rowAct.divSemestr', 'open');
        		}
        	},
        	find: {
        		event: function(e){
        			var tp = this.template,
        				val = tp.gel('findSubject').value;
        			
        			tp.show('allSubject');
        			tp.hide('pagination');
        			
        			this.set('find', true);
        			this.find(val);
        		
        		}
        	},
        	allSubject: {
        		event: function(e){
        			var tp = this.template;
        			
        			tp.hide('allSubject');
        			tp.show('pagination');
        			
        			this.set('find', false);
        			this.reloadList();
        		
        		}
        	},
        	restore: {
        		event: function(e){
        			var subjectid = e.target.getData('id');
    					this.removeSubject(subjectid, 0);
        		}
        	}
        }
    });
};