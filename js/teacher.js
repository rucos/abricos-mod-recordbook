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
        reloadList: function(departid){
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

        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,table,row,addRow'},
            teacherList: {value: null}
        },
        CLICKS: {
        	'add-show': {
        		event: function(e){
        			this.addRowShow();
        		}
        	}
        }
    });
};