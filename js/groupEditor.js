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
	    		} 
        		
        		if(this.get('groupListShow')){
        			tp.gel('numgroup').disabled = true;
        			tp.gel('numcrs').disabled = true;
	        			 this.listStud = new NS.StudListWidget({
	  	                     srcNode: tp.gel('listStud'),
	  	                     groupid: this.get('groupid')
	  	                 });
        		}
        			this.fillDropDownMenu();	
        		
        },
        destructor: function(){
        	this.set('currentFieldId', 0);
	        	if(this.listStud){
	        		this.listStud.destroy();
	        	}
        },
        renderGroupItem: function(){
        	var groupItem = this.get('groupItem'),
        		tp = this.template;
        	
        		tp.setValue('numgroup', groupItem.get('numgroup'));
        		
        		tp.setValue('numcrs', groupItem.get('numcrs'));
        		
         		tp.setValue('inpfield', groupItem.get('fieldcode') + " " 
						+ groupItem.get('field') + " "
						+ groupItem.get('frmstudy') + " "
						+ groupItem.get('note'));
        		
        		this.set('currentFieldId', groupItem.get('fieldid'));
        },
        fillDropDownMenu: function(){
        	var tp = this.template,
        		lst = "";
        	
        	if(!this.get('groupListShow')){
	        	this.set('waiting', true);
	       		this.get('appInstance').fieldList('groupEditor', function(err, result){
	    			this.set('waiting', false);
		    			if(!err){
			        		result.fieldList.each(function(field){
			            		lst += tp.replace('liField', [
			                   		   field.toJSON()
			                   	]);
			                });
		        		}
	    			tp.setHTML('list', tp.replace('ulField', {li: lst}));
	        	}, this);
        	}
        	else {
        		tp.setHTML('list', tp.replace('ulField', {li: lst}));
        	}
        },
        saveGroup: function(){
        	if(!this.get('groupListShow')){
	        	var tp = this.template,
	        		lib = this.get('appInstance'),
	        		obj = {
	        			numgroup: tp.getValue('numgroup'),
	            		currentFieldId: this.get('currentFieldId'),
	            		groupid: this.get('groupid'),
	            		numcrs: tp.getValue('numcrs')
	        		};
	        	
	        		var empty = lib.isEmptyInput(obj);
	        		if(empty){
	        			switch(empty){
	        				case 'numgroup': alert( 'Укажите номер группы' ); break;
	        				case 'numcrs': alert( 'Укажите номер курса' ); break;
	        			}
	        			tp.gel(empty).focus();
	        		} else {
	        			this.set('waiting', true);
			        	    lib.groupSave(obj, function(err, result){
			        	    	this.set('waiting', false);
			        	    	if(!err){
			        	    		if(obj.groupid === 0) {
			        	    			lib.set('currentPageGroup', 1);	
			        	    		}
			        	    		this.cancel();
			        	    	}
			        	    }, this)
	        		}
        	} else {
        		this.cancel();
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
            currentFieldId: {value: 0},
            groupItem: {value: null},
            groupListShow: {value: null}
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
        	add: {
        		event: function(e){
        	  		var tp = this.template,
        	  			targ = e.target,
        	  			a = targ.getDOMNode();
        	  		
        	  		if(!a.href){
        	  			return;
        	  		}
        	  		
        			tp.setValue('inpfield', a.textContent);
        			
        			tp.removeClass('widget.list', 'open');
        			
        			this.set('currentFieldId', targ.getData('id'));
        		}
        	}
        }
    });

    NS.GroupEditorWidget.parseURLParam = function(args){
        return {
        	groupid: args[0] | 0,
        	groupListShow: args[1]
        };
    };
};