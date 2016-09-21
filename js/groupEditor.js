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
	    			tp.setValue('year', new Date().getFullYear());
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
//        	var groupItem = this.get('groupItem'),
//        		tp = this.template;
//        	
//        		tp.setValue('numgroup', groupItem.get('numgroup'));
//        		
//        		tp.setValue('numcrs', groupItem.get('numcrs'));
//        		
//         		tp.setValue('inpfield', groupItem.get('fieldcode') + " " 
//						+ groupItem.get('field') + " "
//						+ groupItem.get('frmstudy') + " "
//						+ groupItem.get('note'));
//         		
//         		tp.setValue('year', groupItem.get('dateline'));
//        		
//        		this.set('currentFieldId', groupItem.get('fieldid'));
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
	        		
	        		lst += tp.replace('liField', [{
	        				frmstudy: this.get('appInstance').determFormEdu(frmStudy)
	        			}, 
	        			field.toJSON()
	               	]);
	            }, this);
    		
	        	tp.setHTML('listField', tp.replace('ulField', {li: lst}));
        },
        saveGroup: function(){
        	var tp = this.template,
        		lib = this.get('appInstance'),
        		obj = {
        			numgroup: tp.getValue('numgroup'),
            		currentFieldid: this.get('currentFieldid'),
            		groupid: this.get('groupid'),
            		numcrs: tp.getValue('numcrs'),
            		year: tp.getValue('year')
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
	        				tp.addClass('curentField', 'alert-danger');
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
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, liField, ulField'},
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
        	  		
        			tp.removeClass('listField', 'open');
        			tp.removeClass('curentField', 'alert-danger');
        			
        			tp.setHTML('curentField', a.textContent);
        			
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