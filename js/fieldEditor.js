var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js', 'subjectList.js']}
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
        	var fieldid = this.get('fieldid') | 0;
        	
        	this.set('waiting', true);
        	
            	if(fieldid > 0){
	            	appInstance.fieldItem(fieldid, function(err, result){
	            		this.set('waiting', false);
	            			this.set('fieldItem', result.fieldItem);
	            				this.renderFieldItem();
	            	}, this);
            	} else {
            		this.set('waiting', false);
            	}
            	this.fillProgramList();
        },
        destructor: function(){
            if (this.listSubject){
            	this.listSubject.destroy();
            }
        },
        fillProgramList: function(){
        	this.get('appInstance').programList(function(err, result){
        		this.set('waiting', false);
        			this.set('programList', result.programList);
        				this.renderProgramList();
        	}, this);
        },
        renderProgramList: function(){
        	var progList = this.get('programList'),
        		tp = this.template,
        		lst = "";
        	
        	progList.each(function(prog){
        		lst += tp.replace('programLi', prog.toJSON());
        	});
        	tp.setHTML('programList', tp.replace('programList', {
        		li: lst
        	}));
        	
        },
        parseFormEdu: function(formEdu, nameProgram, formNum){
        	var tp = this.template,
        		lst = "";
        	
	        	for(var i = 0; i < 3; i++){
	        		if(formEdu[i] > 0){
	        			lst += tp.replace('radioProgramFormEdu', {
	        				formEdu: this.get('appInstance').determFormEdu(i),
	        				form: i,
	        				active: (formNum - 1) === i ? 'active' : ''
	       				});
	        		}
	        	}
	        	
	        	tp.setHTML('programCurrent', tp.replace('programFormEdu', {
	        		nameProgram: nameProgram,
	        		radio: lst
	        	}));
        },
        renderFieldItem: function(){
        	var fieldItem = this.get('fieldItem').toJSON(),
        		tp = this.template,
        		edulevelid = fieldItem.edulevelid,
        		formNum = fieldItem.frmstudy,
        		formEdu = "" + fieldItem.och + fieldItem.ochzaoch + fieldItem.zaoch,
        		nameProgram = fieldItem.code + " " + fieldItem.name + " " + fieldItem.level;
        		  
        		this.set('currentLevelid', edulevelid);
        		this.set('currentFormEdu', formNum);
        		
        		this.parseFormEdu(formEdu, nameProgram, formNum);
        		
	        	tp.setValue({
	        		depart: fieldItem.depart,
	        		note: fieldItem.note
	        	});
	        	
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
        			levelid: this.get('currentLevelid'),
        		 	frmstudy: this.get('currentFormEdu'),
        		 	depart: tp.getValue('depart')
        		};
        	
        	var empty = lib.isEmptyInput(data);
        	data.note = tp.getValue('note');
        	
        	if(empty){
	        		switch(empty){
	        			case 'levelid': alert( 'Укажите направление обучения' ); break;
	        			case 'frmstudy': alert( 'Укажите форму обучения' ); break;
	        			case 'depart': 
	        				tp.gel(empty).focus(); 
	        					alert( 'Укажите кафедру' ); break;
	        			
	        		}
        	} else {
	         	this.set('waiting', true);
		        	lib.fieldSave(data, function(err, result){
		        		this.set('waiting', false);
		        			if(!err){
		        				this.go('fieldManager.view');
		        			} 
		        	}, this);
        	}
        },
        unSetRadio: function(){
        	var radioList = this.template.gel('programFormEdu.radioList'),
        		children = radioList.children,
        		len = children.length;
        	
        	for(var i = 0; i < len; i++){
        		children[i].classList.remove('active');
        	}
        }
}, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,programList,programLi,programFormEdu,radioProgramFormEdu'},
            fieldid: {value: 0},
            fieldItem: {value: null},
            programList: {value: null},
            currentLevelid: {value: ""},
            currentFormEdu: {value: ""}
        },
        CLICKS: {
        	save: {
        		event: function(){
        			this.save();
        		}
        	},
        	cancel: {
    	       event: function(){
                   this.go('fieldManager.view');
               }
        	},
        	pickProgram: {
        		event: function(e){
        			var tp = this.template,
        				targ = e.target,
        				a = targ.getDOMNode(),
        				formEdu = targ.getData('formedu');
        			
        			if(!a.href){
        				return;
        			}
        			
        			this.set('currentLevelid', targ.getData('levelid'));
        			this.set('currentFormEdu', '');
        			
        			tp.gel('programList.divProgList').classList.remove('open');
        			
        			this.parseFormEdu(formEdu, a.textContent);
        		}
        	},
        	pickForm: {
        		event: function(e){
        			var tp = this.template,
        				targ = e.target,
        				lbl = e.target.getDOMNode();
        			
        			this.set('currentFormEdu', +targ.getData('form') + 1);
        			
        			this.unSetRadio();
        			
        			lbl.classList.add('active');
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