var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['teacher.js', 'lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;
   
    
    NS.DepartManagerWidget = Y.Base.create('departManagerWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance, options){
            var tp = this.template;
//	            this.listWidget = new NS.TeacherListWidget({
//	                srcNode: tp.gel('list')
//	            });
            this.reloadList();
        },
        destructor: function(){
            if (this.listWidget){
                this.listWidget.destroy();
            }
        },
        reloadList: function(){
        	this.set('waiting', true);
	        	this.get('appInstance').departList(function(err, result){
	        		this.set('waiting', false);
		        		if(!err){
		        			this.set('departList', result.departList);
		        				this.renderList();
		        		}
	        	}, this);
        },
        renderList: function(){
        	var departList = this.get('departList'),
        		tp = this.template,
        		lst = "";
        	
	        	departList.each(function(depart){
	        		var replObj = this.determRemoveButton(depart.toJSON());
	        		
	        			lst += tp.replace('departItem', replObj);
	        	}, this);
	        	
	        	tp.setHTML('departList', tp.replace('departList', {
	        		lst: lst
	        	}));
	        	this.setActive();
        },
        determRemoveButton: function(obj){
        	var tp = this.template;
        	
	       		if(obj.remove){
	       			obj.btnrestore = tp.replace('buttonRestore', {id: obj.id});
	       			obj.danger = 'list-group-item-danger';
	    		} else {
	    			obj.btnrestore = tp.replace('buttonRemove', {id: obj.id});
	    			obj.danger = "";
	    		}
	       		
	       		return obj;
        },
        loadItem: function(departid){
        	this.set('waiting', true);
	        	this.get('appInstance').departItem(departid, function(err, result){
	        		this.set('waiting', false);
		        		if(!err){
		        				this.set('departItem', result.departItem);
		        					this.renderItem();
		        		}
	        	}, this);
        },
        renderItem: function(){
        	var tp = this.template,
        		departItem = this.get('departItem'),
        		replObj,
        		element = '';
        	
        	if(departItem){
        		replObj = departItem.toJSON();
        		replObj.act = 'Изменить';
        		element = 'departItem.item-' + replObj.id;
        	} else {
        		replObj = {
    			    	id: 0,
    			        shortname: '',
    			        namedepart: '',
    			        act: 'Добавить'
        		};
        		element = 'departList.addWidget';
        	}
        		
	        	tp.setHTML(element, tp.replace('addWidget', replObj));
        },
        departSave: function(id, remove){
        	var tp = this.template,
        		data = {
	        		id: id,
	        		namedepart: tp.getValue('addWidget.namedepart'),
	        		shortname: tp.getValue('addWidget.shortname')
	        	},
	        	empty = this.get('appInstance').isEmptyInput(data);
        	
        	if(empty){
        		switch(empty){
        			case 'namedepart': alert( 'Укажите полное наименование' ); break;
        			case 'shortname': alert( 'Укажите краткое наименование' ); break;
        		}
        		tp.gel('addWidget.' + empty).focus();
        		
        		return;
        	} 
        		this.reqDepartSave(data);
        },
        reqDepartSave: function(data){
         	this.set('waiting', true);
         	this.get('appInstance').departSave(data, function(err, result){
	        		this.set('waiting', false);
		        		if(!err){
		        			this.reloadList();
		        		}
	        	}, this);
        },
        showRemoveWidget: function(id, show){
        	var tp = this.template,
        		replace = show || tp.replace('removeWidget', {
        			id: id
        		});
        	
   				tp.setHTML('departItem.remove-' + id, replace);
        },
        cancelAddWidget: function(id){
        	var tp = this.template,
        		repobj = this.determRemoveButton(this.get('departItem').toJSON()),
        		element = tp.one('departItem.item-' + id).getDOMNode();
        	
        		element.outerHTML = tp.replace('departItem', repobj);
    				this.set('departItem', null);
    				this.setActive();
        },
        setActive: function(){
        	var tp = this.template,
        		id = this.get('curDepartid');
        	
	        	if(id){
	        		tp.one('departItem.item-' + id).addClass('active');
	        	}
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,departList,departItem,addWidget,removeWidget,buttonRestore,buttonRemove'},
            departList: {value: null},
            departItem: {value: null},
            curDepartid: {value: 0}
        },
        CLICKS: {
        	'add-show': {
        		event: function(){
        			this.renderItem();
        		}
        	},
        	'edit-show': {
        		event: function(e){
        			var id = e.target.getData('id');
        					
        			this.loadItem(id);
        		}
        	},
        	'remove-show':{
        		event: function(e){
        			var id = e.target.getData('id');
        			
        			this.showRemoveWidget(id);
        		}
        	},
        	'remove-cancel':{
        		event: function(e){
        			var id = e.target.getData('id');
        			
        			this.showRemoveWidget(id, ' ');
        		}
        	},
        	save: {
        		event: function(e){
        			var id = e.target.getData('id');

        				this.departSave(id);
        				this.set('departItem', null);
        		}
        	},
        	cancel: {
        		event: function(e){
        			var id = +e.target.getData('id');
        			
        			if(id){
        				this.cancelAddWidget(id);
        			} else {
        				this.template.setHTML('departList.addWidget', '');
        			}
        		}
        	},
        	remove: {
        		event: function(e){
        			var targ = e.target, 
        				data = {
        				id: targ.getData('id'),
        				remove: targ.getData('remove')
        			};
        			this.reqDepartSave(data);
        		}
        	},
        	choiceDepart: {
        		event: function(e){
        			var targ = e.target,
        				parent = targ.getDOMNode().parentNode,
        				id = targ.getData('id') || parent.dataset.id,
        				tp = this.template;
        			
        			if(!id){
        				return;
        			}
        			this.get('appInstance').unSetActive(tp.gel('departList.departList'));
        			
        			this.set('curDepartid', id);
        			this.setActive();
        		}
        	}
        
        }
    });
};