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
	        		lst += tp.replace('row', teacher.toJSON());
	        	});
	        	
	        	tp.setHTML('list', tp.replace('table', {
	        		rows: lst
	        	}));
        },
        addRowShow: function(){
        	var tp = this.template,
        		table = tp.gel('table.tblTeacher'),
        		row = table.insertRow(1); 
        	
	        	row.innerHTML = tp.replace('addRow', {
	        		act: 'Добавить',
	        		fio: '',
	        		id: 0
	        	});
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
        },
        reqTeacherSave: function(data){
         	this.set('waiting', true);
	         	this.get('appInstance').teacherSave(data, function(err, result){
		        		this.set('waiting', false);
			        		if(!err){
			        			this.reloadList();
			        		}
		       }, this);
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,table,row,addRow'},
            teacherList: {value: null},
            addRow: {value: false},
            departid: {value: 0}
        },
        CLICKS: {
        	'add-show': {
        		event: function(e){
        			var addRow = this.get('addRow');
        			
	        			if(!addRow){
	        				this.set('addRow', true);
	        					this.addRowShow();
	        			}
        		}
        	},
	       	save: {
	       		event: function(e){
	       			var id = e.target.getData('id');
		       		
		       			this.save(id);
	       		}
	        }
        }
    });
};