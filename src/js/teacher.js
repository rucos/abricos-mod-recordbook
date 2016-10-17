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
    
 
    NS.TeacherListWidget = Y.Base.create('teacherListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	
        },
        reloadList: function(){
        	var departid = this.get('departid');
	        	
	        	this.set('waiting', true);
		        	this.get('appInstance').teacherList(departid, function(err, result){
		        		this.set('waiting', false);
			        		if(!err){
			        			this.set('teacherList', result.teacherList);
			        				this.renderList();
			        		}
		        	}, this);
        },
        renderList: function(){
        	var teacherList = this.get('teacherList'),
        		tp = this.template,
        		lst = "";
        	
	        	teacherList.each(function(teacher){
	        		var replObj = teacher.toJSON(),
	        			isActSheet = this.get('isActSheet');
	        		
	        		lst += tp.replace('row', {
	        			id: replObj.id,
	        			cl: isActSheet ? 'class="row-teacher" data-click="choice-teacher"' : '',
	        			cells: this.replaceCellsTable(replObj)
	        		});
	        	}, this);
	        	
	        	tp.setHTML('list', tp.replace('table', {
	        		rows: lst
	        	}));
        },
        replaceCellsTable: function(obj){
        	var tp = this.template,
        		template = '';
        	
        	if(obj.remove){
        		template= 'restoreBtn';
        		obj.danger = 'class="danger"';
        	} else {
        		template= 'removeBtn';
        		obj.danger = '';
        	}
        	
        	return tp.replace('cells', [{
        				btn:  tp.replace(template, {
                				id: obj.id
                			 }) 
					}, obj]); 
        },
        loadTeacherItem: function(teacherid){
         	this.set('waiting', true);
	         	this.get('appInstance').teacherItem(teacherid, function(err, result){
		        		this.set('waiting', false);
			        		if(!err){
			        			this.set('teacherItem', result.teacherItem)
			        				this.editRowShow();
			        		}
		       }, this);
        },
        editRowShow: function(){
        	var teacherItem = this.get('teacherItem').toJSON(),
        		tp = this.template;
        	
	        	teacherItem.act = 'Изменить';
	        	
	        	tp.setHTML('row.row-' + teacherItem.id, tp.replace('addRow', teacherItem));
        	
        },
        addRowShow: function(id){
        	var tp = this.template,
        		table = tp.gel('table.tblTeacher'),
        		row = table.insertRow(1); 
        	
	        	row.innerHTML = tp.replace('addRow', {
	        		act: 'Добавить',
	        		fio: '',
	        		id: id
	        	});
        },
        hideRowShow: function(){
        	var teacherItem = this.get('teacherItem'),
    			tp = this.template;

	        	if(teacherItem){
	        		tp.setHTML('row.row-' + teacherItem.get('id'), this.replaceCellsTable(teacherItem.toJSON()));
	        	} else {
	        		tp.gel('table.tblTeacher').rows[1].remove();
	        	}
        },
        save: function(id){
        	var tp = this.template,
        		data = {
	        		id: id,
	        		departid: this.get('departid'),
	        		fio: tp.getValue('addRow.fio')
	        	},
	        	empty = this.get('appInstance').isEmptyInput(data);
        	
        	if(empty){
        		alert( 'Укажите ФИО преподавателя' );
        			tp.gel('addRow.' + empty).focus();
        		
        		return;
        	} 
        		this.reqTeacherSave(data);
        		
        		this.set('addRow', false);
        		this.set('teacherItem', null);
        },
        reqTeacherSave: function(data){
         	this.set('waiting', true);
	         	this.get('appInstance').teacherSave(data, function(err, result){
		        		this.set('waiting', false);
			        		if(!err){
			        			this.reloadList();
			        		}
		       }, this);
        },
        removeShow: function(id, show){
        	var tp = this.template,
        		btn = tp.one('removeBtn.remove-' + id).getDOMNode(),
        		btnGr = tp.one('removeBtn.removegroup-' + id).getDOMNode();
        	
	        	if(show){
	        		btn.classList.add('hide');
	        		btnGr.classList.remove('hide');
	        	} else {
	        		btnGr.classList.add('hide');
	        		btn.classList.remove('hide');
	        	}
        },
        remove: function(id, remove){
        	var data = {
        		id: id,
        		remove: remove
        	};
        	
        	this.reqTeacherSave(data);
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,table,row,cells,addRow,restoreBtn,removeBtn'},
            teacherList: {value: null},
            teacherItem: {value: null},
            addRow: {value: false},
            departid: {value: 0},
            isActSheet: {value: false},
            currentTeacher: {value: ''}
        },
        CLICKS: {
        	'add-show': {
        		event: function(e){
        			var addRow = this.get('addRow'),
        				id = +e.target.getData('id') || 0;
        			
	        			if(!addRow){
	        				this.set('addRow', true);
	        					if(id){
	        						this.loadTeacherItem(id);
	        					} else {
	        						this.set('teacherItem', null);
	        							this.addRowShow(id);	        						
	        					}
	        			}
        		}
        	},
        	'remove-show': {
          		event: function(e){
	       			var id = e.target.getData('id');
		       			this.removeShow(id, true);
	       		}
        	},
        	'remove-cancel': {
          		event: function(e){
	       			var id = e.target.getData('id');
		       			this.removeShow(id, false);
	       		}
        	},
	       	save: {
	       		event: function(e){
	       			var id = e.target.getData('id');
		       		
		       			this.save(id);
	       		}
	        },
	        remove:{
	       		event: function(e){
	       			var id = e.target.getData('id');
		       		
		       			this.remove(id, 1);
	       		}
	        },
	        restore: {
	        	event: function(e){
	       			var id = e.target.getData('id');
		       		
	       				this.remove(id, 0);
	        	}
	        },
	        cancel: {
	       		event: function(e){
	       			this.set('addRow', false);
	       			this.hideRowShow();
	       		}
	        },
	        'choice-teacher':{
	       		event: function(e){
	       			var td = e.target.getDOMNode(),
	       				id = 0,
	       				tr,
	       				tBody;
	       			
	       			if(td.tagName != "TD"){
	       				return;
	       			}
	       			
	       			tr = td.parentNode;
	       			tBody = tr.parentNode;
	       			
	       			this.get('appInstance').unSetActive(tBody);
	       			tr.classList.add('success');
	       			
	       			id = tr.id.match(/-(\d+)/)[1];
	       			
	       			this.set('currentTeacher', {
	       				id: id,
	       				fio: tr.childNodes[0].textContent
	       			});
	       		}
	        }
        }
    });
};