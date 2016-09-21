var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js']},
        {name: '{C#MODNAME}', files: ['studList.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.GroupEditorWidget = Y.Base.create('groupEditorWidget', SYS.AppWidget, [], {
        buildTData: function(){
        	
        },
        onInitAppWidget: function(err, appInstance){
        	var groupid = this.get('groupid'),
        		tp = this.template,
            	lst = "";

        		if(groupid > 0){//редактитрование
        			this.set('waiting', true);
	    				appInstance.groupItem(groupid, function(err, result){
	    					this.set('waiting', false);
		    				if(!err){
		    					this.set('groupItem', result.groupItem);
		    						this.renderGroupItem();
		    				}
	    				}, this);
	    		} else {
	    			tp.setHTML('groupItem', tp.replace('groupItem', this.constructItem()));
	    		}
//	        			 this.listStud = new NS.StudListWidget({
//	  	                     srcNode: tp.gel('listStud'),
//	  	                     groupid: this.get('groupid')
//	  	                 });
        			this.reqFieldList();	
        		
        },
        destructor: function(){
        	if(this.listStud){
        		this.listStud.destroy();
        	}
        },
        renderGroupItem: function(){
        	var groupItem = this.get('groupItem'),
        		tp = this.template,
        		frmStudy = groupItem.get('frmstudy');
        		
        		tp.setHTML('groupItem', tp.replace('groupItem', [
        		      this.setFormStudy(frmStudy), 
        		      groupItem.toJSON()
        		]));
        		
        		this.set('currentFieldid', groupItem.get('fieldid'));
        },
        reqFieldList: function(){
	        this.set('waiting', true);
	       		this.get('appInstance').fieldList('groupEditor', function(err, result){
	    			this.set('waiting', false);
		    			if(!err){
		    				this.set('fieldList', result.fieldList);
		    					this.fillFieldList();
		        		}
	    		
	        	}, this);
        },
        fillFieldList: function(){
        	var tp = this.template,
        		fieldList = this.get('fieldList'),
        		lst = "";
        	
	        	fieldList.each(function(field){
	        		var frmStudy = field.get('frmstudy');

	        		lst += tp.replace('liField', [
	        		    this.setFormStudy(frmStudy),
	        			field.toJSON()
	               	]);
	            }, this);
    		
	        	tp.setHTML('groupItem.listField', tp.replace('ulField', {li: lst}));
        },
        saveGroup: function(){
        	var tp = this.template,
        		lib = this.get('appInstance'),
        		obj = {
        			numgroup: tp.getValue('groupItem.numgroup'),
            		currentFieldid: this.get('currentFieldid'),
            		groupid: this.get('groupid'),
            		numcrs: tp.getValue('groupItem.numcrs'),
            		year: tp.getValue('groupItem.year')
        		},
        		empty = lib.isEmptyInput(obj);
        	
        		if(empty){
        			switch(empty){
        				case 'numgroup': alert( 'Укажите номер группы' ); break;
        				case 'numcrs': alert( 'Укажите номер курса' ); break;
        				case 'year': alert( 'Укажите год зачисления' ); break;
        				case 'currentFieldid': alert( 'Укажите рабочий план' ); break;
        			}
	        			try{
	        				tp.gel(empty).focus();
	        			} catch(e){
	        				tp.addClass('groupItem.curentField', 'alert-danger');
	        			}
        		} else {
        			this.set('waiting', true);
		        	    lib.groupSave(obj, function(err, result){
		        	    	this.set('waiting', false);
			        	    	if(!err){
			        	    		this.cancel();
			        	    	}
		        	    }, this)
        		}
        },
        cancel: function(){
			this.go('managerGroups.view');
        },
        constructItem: function(obj){
        	return obj || {
        		numgroup: '',
        		numcrs: 1,
        		dateline: new Date().getFullYear(),
        		code: '',
        		name: '',
        		level: '',
        		frmstudy: '',
        		note: ''
        	};
        },
        setFormStudy: function(frmStudy){
        	return {
        		frmstudy: this.get('appInstance').determFormEdu(frmStudy)
        	};
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, liField, ulField, groupItem'},
            groupid: {value: 0},
            currentFieldid: {value: ''},
            groupItem: {value: null},
            fieldList: {value: null}
        },
        CLICKS: {
        	saveGroup: {
        		event: function(){
        			this.saveGroup();
        		}
        	},
        	cancel: {
        		event: function(){
        			this.cancel();
        		}
        	},
        	addCurrentField: {
        		event: function(e){
        	  		var tp = this.template,
        	  			targ = e.target,
        	  			a = targ.getDOMNode();
        	  		
        	  		if(!a.href){
        	  			return;
        	  		}
        	  		
        			tp.removeClass('groupItem.listField', 'open');
        			tp.removeClass('groupItem.curentField', 'alert-danger');
        			
        			tp.setHTML('groupItem.curentField', a.textContent);
        			
        			this.set('currentFieldid', targ.getData('id'));
        		}
        	}
        }
    });

    NS.GroupEditorWidget.parseURLParam = function(args){
        return {
        	groupid: args[0] | 0
        };
    };
};