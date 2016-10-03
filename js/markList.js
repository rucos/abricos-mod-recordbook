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
    
 
    NS.MarkListWidget = Y.Base.create('markListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	
        },
        reloadList: function(){
        	var sheetid = this.get('sheetid');
        	
	        	this.set('waiting', true);
		        	this.get('appInstance').sheetItem(sheetid, function(err, result){
		        		this.set('waiting', false);
			        		if(!err){
			        			this.set('sheetItem', result.sheetItem);
			        				this.renderList();
			        				this.reqMarkList();
			        		}
		        	}, this);
        },
        renderList: function(){
        	var sheetItem = this.get('sheetItem').toJSON(),
        		tp = this.template;
        	
        		sheetItem.formcontrol = this.parseFormControl();
        	
        		tp.setHTML('modal', tp.replace('modal', sheetItem));
        },
        parseFormControl: function(){
        	var sheetItem = this.get('sheetItem'),
        		type = sheetItem.get('type'),
        		formControl = sheetItem.get('formcontrol'),
        		project = sheetItem.get('project');
        	
	        	if(type > 2){
	        		if(+project[0]){
	        			formControl = 'Курсовая работа';
	        		} else if(+project[2]) {
	        			formControl = 'Курсовой проект';
	        		}
	        	}
	        	return formControl;
        },
        reqMarkList: function(){
        	var sheetid = this.get('sheetid');
        	
	        	this.set('waiting', true);
	        	this.get('appInstance').markList(sheetid, function(err, result){
	        		this.set('waiting', false);
		        		if(!err){
		        			this.set('markList', result.markList);
		        				this.renderMarkList();
		        		}
	        	}, this);
        },
        renderMarkList: function(){
        	var markList = this.get('markList'),
        		sheetItem = this.get('sheetItem'),
        		tp = this.template,
        		num = 0,
        		lst = "";
        	
		    	markList.each(function(mark){
		    		var markValue = mark.get('mark');
		    		
			    		if(sheetItem.get('formControl') == 'Зачет'){
			    			markValue = markValue == 102 ? 'Зачтено' : 'Не зачтено'
			    		}
			    		
			    		lst += tp.replace('row', [{
			    			n: ++num,
			    			mark: markValue
			    		}, mark.toJSON()]);
		    	});
		    	
		    	tp.setHTML('modal.mark', tp.replace('table', {
			    		rows: lst,
			    		a1: sheetItem.get('firstattproc'),
			    		a2: sheetItem.get('secondattproc'),
			    		a3: sheetItem.get('thirdattproc')
		    		})
		    	); 
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, modal, table, row'},
            sheetid: {value: 0},
            sheetItem: {value: null},
            markList: {value: null}
        },
        CLICKS: {
        	closeModal: {
        		event: function(){
        			this.template.setHTML('modal', '');
        		}
        	}
        }
    });
};