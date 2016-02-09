var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js']},
        {name: '{C#MODNAME}', files: ['subjectList.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.FieldEditorWidget = Y.Base.create('fieldEditorWidget', SYS.AppWidget, [], {
        buildTData: function(){
        
        },
        onInitAppWidget: function(err, appInstance){
        	this.set('waiting', true);
        	
            	var fieldid = this.get('fieldid') | 0;
            	
            	if(fieldid > 0){
	            	appInstance.fieldItem(fieldid, function(err, result){
	            		this.set('waiting', false);
	            			this.set('fieldItem', result.fieldItem);
	            				this.renderFieldItem();
	            	}, this);
            	} else {
            		this.set('waiting', false);
            	}
        },
        destructor: function(){
        	
            if (this.listSubject){
            	this.listSubject.destroy();
            }
            
        },
        renderFieldItem: function(){
        	var fieldItem = this.get('fieldItem');
        	
        	var tp = this.template;
        		tp.setValue(fieldItem.toJSON());
        		
	        	     this.listSubject = new NS.SubjectListWidget({
	                     srcNode: tp.gel('list'),
	                     fieldid: this.get('fieldid')
	                 });
        			
        },
        save: function(){
        	var fieldid = this.get('fieldid'),
        		tp = this.template,
        		lib = this.get('appInstance'),
        		data = {
        			id: fieldid,
        		 	fieldcode:  tp.getValue('fieldcode'),
        		 	field: tp.getValue('field'),
        		 	frmstudy: tp.getValue('frmstudy'),
        		 	qual: tp.getValue('qual'),
        		 	depart: tp.getValue('depart')
        		};
        	
        	var empty = lib.isEmptyInput(data);
        	if(empty){
	        		switch(empty){
	        			case 'fieldcode': alert( 'Укажите код направления' ); break;
	        			case 'field': alert( 'Укажите направление' ); break;
	        			case 'frmstudy': alert( 'Укажите форму обучения' ); break;
	        			case 'qual': alert( 'Укажите квалификацию' ); break;
	        			case 'depart': alert( 'Укажите кафедру' ); break;
	        		}
        		tp.gel(empty).focus();
        	} else {
	         	this.set('waiting', true);
		        	lib.fieldSave(data, function(err, result){
		        		this.set('waiting', false);
		        			if(!err){
		        				this.go('manager.view');
		        			} 
		        	}, this);
        	}
        }
}, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            fieldid: {value: 0},
            fieldItem: {value: null}
        },
        CLICKS: {
        	save: {
        		event: function(){
        			this.save();
        		}
        	},
        	cancel: {
    	       event: function(){
                   this.go('manager.view');
               }
        	}
        }
    });

    NS.FieldEditorWidget.parseURLParam = function(args){
        return {
        	fieldid: args[0] | 0
        };
    };
};