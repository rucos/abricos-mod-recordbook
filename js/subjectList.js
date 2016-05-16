var Component = new Brick.Component();
console.log();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js', 'pagination.js']}
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
            
        	this.paginationCourse = new NS.PaginationCourseWidget({
        		srcNode: tp.gel('pagCourse'),
        		show: true,
        		parent: this
        	});
        	
        	this.reloadList();
        },
        destructor: function(){
            if (this.pagination){
                this.pagination.destroy();
            }
            
            if(this.paginationCourse){
            	this.paginationCourse.destroy();
            }
        },
        reloadList: function(){
        	var find = this.get('find'),
        		tp = this.template;
        	
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
        		if(this.getFilter('filterSemestr') || this.getFilter('filterCourse')){
        			this.find();
        		} else {
        			this.find(tp.gel('findSubject').value);
        		}
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
            		cl: find ? "class='success'" : '',
            		act:  obj.act,
            		event: obj.event,
            		rem: obj.rem
            	}, subject.toJSON()]);
        	});
        	 tp.setHTML('list', tp.replace('table', {rows: lst}));
        	 	this.set('dataTable', lst);
        	 		this.set('subjectid', 0);
        	 		
        	 			if(!find) this.pagination.renderPaginator();
        },
        subjectShow: function(id, parentRow){
        	var tp = this.template,
        		edit = this.get('edit'),
				lst = "";
        	
				if(id === 0){//если добавляем
					lst = this.renderSubjectRow() + this.get('dataTable');
						this.set('subjectid', 0);
				} else if(parentRow){//если изменяем
						parentRow.innerHTML = this.renderSubjectRow(parentRow);
							this.setDisabledForElement(tp.gel('rowAct.formcontrol').value);
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
        		proj = row ? row.cells[5].innerHTML : '',
        		arrSemCour = this.filterForAppendRow();

        			lst += tp.replace('rowAct', {
			     		'namesubject': row ? row.cells[0].childNodes[0].textContent.trim() : '',
		        		'formcontrol': row ? row.cells[1].innerHTML : '',
		        		'numcrs': row ? row.cells[2].innerHTML : arrSemCour[0],
		        		'semestr':  row ? row.cells[3].innerHTML : arrSemCour[1],
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
        		formcontrol = tp.gel('rowAct.formcontrol').value,
        		arrHours = this.renderNumHours(tp.gel('rowAct.numhours').value, formcontrol); 
        
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
    			formcontrol: formcontrol,
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
        renderNumHours: function(hours, formcontrol){
        	var arr = hours.split('/'),
        		ind = hours.indexOf('/'),
        		tp = this.template;
        	
	        	if(ind == -1){
	        		alert( 'Маска ввода ауд/СРС' );
	        			tp.gel('rowAct.numhours').focus();
	        				return false;
	        	}
		        	return arr;
        },
        find: function(val){
        	var tp = this.template,
        		data = {
	        		fieldid: this.get('fieldid'),
	        		value: val || 0,
	        		filterCourse: +this.getFilter('filterCourse'),
	        		filterSemestr: +this.getFilter('filterSemestr'),
	        		type: 'Subject'
	        	};
        	
        	if(!val){
        		if(!data.filterCourse || !data.filterSemestr){
        			return;
        		} else {
        			this.showFind();
        		}
        	} else {
        		data.filterCourse = 0;
        		data.filterSemestr = 0;
        	}
        	this.reqFindSubject(data);
        },
        reqFindSubject: function(data){
        	this.set('waiting', true);
        	this.get('appInstance').findSubject(data, function(err, result){
        		this.set('waiting', false);
        			if(!err){
        				this.set('subjectList', result.findSubject);
        					this.renderList();
        			}
        	}, this);
        },
        removeSubject: function(subjectid, restore){
        	this.set('waiting', true);
        		this.get('appInstance').subjectRemove(subjectid, restore, function(err, result){
        			this.set('waiting', false);
        				this.reloadList();
        		}, this);
        		this.set('subjectid', 0);
        },
        showFind: function(){
        	var tp = this.template;
        	
				tp.show('allSubject');
    			tp.hide('pagination');
    			
    			this.set('find', true);
        },
        getFilter: function(name){
        	return this.paginationCourse.get(name);
        },
        setDisabledForElement: function(formControl){
        	var tp = this.template,
    			project1 = tp.gel('rowAct.project1'),
    			project2 = tp.gel('rowAct.project2');
        	
  			if(formControl == 'Практика'){
  				project1.disabled = true;
  				project2.disabled = true;
			} else {
  				project1.disabled = false;
  				project2.disabled = false;
			}
        },
        filterForAppendRow: function(){
        	var pag = this.paginationCourse,
        		sem = pag.get('filterSemestr'),
        		cour = pag.get('filterCourse'),
        		resp = ['',''];
        		
        	if(cour > 0){
        		resp[0] = cour;
        	}
        	
        	switch(sem){
        		case 1:
        			resp[1] = 'Осенний';
        				break;
        		case 2: 
        			resp[1] = 'Весенний';
        				break;
        	}
        	return resp;
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, table, row, rowAct, label'},
            fieldid: {value: 0},
            subjectList: {value: null},
            dataTable: {value: ''},
            subjectid: {value: 0},
            find: {value: false},
            edit: {value: false}
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
        			this.set('edit', false);
        				this.subjectShow();
        		}
        	},
        	actSubject: {
        		event: function(e){
        			this.set('edit', false);
        				this.actSubject();
        		}
        	},
        	'editSubject-show': {
        		event: function(e){
        			var targ = e.target,
        				subjectid = targ.getData('id'),
        				tr = targ.getDOMNode().parentNode.parentNode,
        				edit = this.get('edit');
        			
        			if(!edit){
        				this.set('edit', true);
        				
        				this.subjectShow(subjectid, tr);// id предмета, строка таблицы	
        			}
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
        			var a = e.target.getDOMNode(),
        				tp = this.template,
        				formControl = a.textContent;
        			
        			if(!a.href){
        				return;
        			}
        			
        			tp.gel('rowAct.formcontrol').value = formControl;
        			tp.removeClass('rowAct.divFormControl', 'open');
        			
        			this.setDisabledForElement(formControl);
        		}
        	},
        	chooseSemestr: {
        		event: function(e){
        			var a = e.target.getDOMNode(),
    					tp = this.template;
    			
        			if(!a.href){
        				return;
        			}
        			
	    			tp.gel('rowAct.semestr').value = a.textContent;
	    			tp.removeClass('rowAct.divSemestr', 'open');
        		}
        	},
        	find: {
        		event: function(e){
        			var tp = this.template,
        				input = tp.gel('findSubject'),
        				val = input.value;
        			
        			if(val.length){
        				this.showFind();
        					this.find(val);
        					this.paginationCourse.hidePagination();
        			} else {
        				alert( 'Введите название предмета!' );
        					input.focus();
        			}
        		}
        	},
        	allSubject: {
        		event: function(e){
        			var tp = this.template;
        			
        			tp.hide('allSubject');
        			tp.show('pagination');
        			
        			this.set('find', false);
        			this.paginationCourse.resetPagination();
        			this.paginationCourse.showPagination();
        			
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