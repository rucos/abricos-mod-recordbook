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
        			},
        			proj = subject.get('project');
        		
        		if(subject.get('remove') === 1){
        			obj.act = 'Восстановить';
        			obj.event = 'restore';
        			obj.rem = tp.replace('label');
        		}
        		
            	lst += tp.replace('row', [{
            		semestr: subject.get('semestr') === 1 ? 'Осенний' : 'Весенний',
            		project1: proj[0] == 1 ? 'КР' : '',
            		project2: proj[2] == 1 ? 'КП' : '',
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
					lst = this.renderSubjectRow() + this.get('dataTable');
						this.set('subjectid', 0);
				} else if(parentRow){//если изменяем
					parentRow.innerHTML = this.renderSubjectRow(parentRow);
						this.checkedProject();
			  				this.set('subjectid', id);
			  					return;
				} else {//если отмена
					lst = this.get('dataTable');
				}
				tp.setHTML('list', tp.replace('table', {rows: lst}));
        },
        renderSubjectRow: function(row){
        	var tp = this.template,
        		lst = "",
        		proj = row ? row.cells[5].innerHTML : '';

        			lst += tp.replace('rowAct', {
			     		'namesubject': row ? row.cells[0].childNodes[0].textContent.trim() : '',
		        		'formcontrol': row ? row.cells[1].innerHTML : '',
		        		'numcrs': row ? row.cells[2].innerHTML : '',
		        		'semestr':  row ? row.cells[3].innerHTML : '',
		        		'numhours':  row ? row.cells[4].innerHTML : '',
		        		'act': row ? 'Изменить' : 'Добавить',
		        		'val1': row &&  proj.indexOf('КР') != -1 ?  1 : 0,
		        		'val2': row &&  proj.indexOf('КП') != -1 ?  1 : 0
			    	});
	        			return lst;
        },
        checkedProject: function(){
        	var tp = this.template,
        		arr = ['rowAct.project1','rowAct.project2'];
        	
        	arr.forEach(function(elem){
        		if(tp.gel(elem).value == 1){
        			tp.gel(elem).checked = true;
        		}
        	});
        	
        },
        actSubject: function(){
        	var fieldid = this.get('fieldid'),
        		subjectid = this.get('subjectid'),
        		tp = this.template,
        		sem = tp.gel('rowAct.semestr').value,
        		lib = this.get('appInstance'),
        		arrHours = this.renderNumHours(tp.gel('rowAct.numhours').value); 
        
        	if(!arrHours){
        		return;
        	}
        	
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
    			numhours1: arrHours[0],
    			numhours2: arrHours[1],
    			project1: tp.gel('rowAct.project1').checked,
    			project2: tp.gel('rowAct.project2').checked
    		};
        	
        	var empty = lib.isEmptyInput(data);
        	
        	if(empty){//проверка на заполняемость input
        		var lst = "rowAct." + empty;
        		switch(empty){
        			case 'namesubject': alert( 'Укажите название предмета' ); break;
        			case 'formcontrol': alert( 'Укажите форму контроля' ); break;
        			case 'numcrs': alert( 'Укажите номер курса' ); break;
        			case 'semestr': alert( 'Укажите номер семестра' ); break;
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
        renderNumHours: function(hours){
        	var arr = hours.split('/'),
        		ind = hours.indexOf('/'),
        		tp = this.template,
        		isNumeric = this.get('appInstance').isNumeric;
        		
        	if(ind == -1){
        		alert( 'Маска ввода ауд/СРС' );
        			tp.gel('rowAct.numhours').focus();
        				return false;
        	}
	        	for(var i = 0; i < 2; i++){
	        		if(!isNumeric(arr[i])){
	        			alert( 'введите число!' );
	        				tp.gel('rowAct.numhours').focus();
	        					return false;
	        		}
	        	}
	        	return arr;
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
        				
        			this.subjectShow(subjectid, e.target.getDOMNode().parentNode.parentNode);// id предмета, строка таблицы
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
        			var value = e.target.getDOMNode().textContent,
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