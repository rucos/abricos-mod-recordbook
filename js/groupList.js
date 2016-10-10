var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js']},
        {name: '{C#MODNAME}', files: ['pagination.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;
    
 
    NS.GroupListWidget = Y.Base.create('groupListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	var tp = this.template,
        		frmstudy = appInstance.get('frmstudy'),
        		currentPage = appInstance.get('pageGroup'),
        		self = this;
        	
            this.pagination = new NS.PaginationWidget({
                srcNode: tp.gel('pag'),
                currentPage: currentPage,
                callback: function(page){
                	appInstance.set('pageGroup', page);
                	self.reloadList();
                }
            });

        	if(frmstudy){
        		this.setColorButton(frmstudy);
        		this.showGroupList();
        		tp.show('groupList');
        	}
        },
        destructor: function(){
            if (this.pagination){
                this.pagination.destroy();
            }
        },
        showGroupList: function(){
        	var lib = this.get('appInstance'),
	    		find = lib.get('findGroup'),
	    		valFind = lib.get('findGroupVal'),
	    		tp = this.template;
    	
	    	if(find){
	    		tp.show('allGroup');
	    		tp.setValue('findGroup', valFind);
	    			this.find(valFind);
	    	} else {
	    		this.countGroup();
	    	}
        },
        countGroup: function(){
        	var lib = this.get('appInstance'),
        		data = {
	        		type: 'groupList',
	        		frmstudy: lib.get('frmstudy')
	        	};
        	
          	this.set('waiting', true);
          		lib.countPaginator(data, function(err, result){
	    			this.set('waiting', false);
	    				this.pagination.set('countRow', result.countPaginator);
	    					this.reloadList();
	    		}, this);
        },
        reloadList: function(){
        	var lib = this.get('appInstance'),
        		data = {
        			page: this.pagination.get('currentPage'),
        			frmstudy: lib.get('frmstudy')
        		};
        		
        	this.set('waiting', true);
        	lib.groupList(data, function(err, result){
        		this.set('waiting', false);
        		if(!err){
        			if(result.groupList.size() === 0 && data.page !== 1){
        				this.pagination.set('currentPage', --data.page);
        				lib.set('pageGroup', data.page);
        					this.reloadList();
        			} else {
        				this.set('groupList', result.groupList);
        				this.renderList();
        			}
        		}
        	}, this);
        },
        renderList: function(){
        	var groupList = this.get('groupList'),
        		lst = "",
        		tp = this.template,
        		lib = this.get('appInstance'),
        		find = lib.get('findGroup');
        	
        	groupList.each(function(group){
        		var gr = group.toJSON();
        		
	        		lst += tp.replace('row', [{
	        			success: find ? 'success' : '',
	        			danger: gr.grRemove ? 'danger' : '',
	        			remove: gr.grRemove ? 'Восстановить' : 'Удалить',
	        			nameprogram: tp.replace('hrefNameProgram', [{
	        				label: gr.remove ? tp.replace('label') : ""
	        			}, gr])
	        		}, gr]);
        	});
        		tp.setHTML('list', tp.replace('table', {rows: lst}));
        		
        			if(find){
        				tp.setHTML('pag', '');
        			} else {
        				this.pagination.renderPaginator();
        			}
        },
        remove: function(groupid, remove){
        	var lib = this.get('appInstance'),
        		find = lib.get('findGroup'),
        		tp = this.template,
        		data = {
        			groupid: groupid,
        			remove: remove
        		};
        	
        	this.set('waiting', true);
	          	lib.groupRemove(data, function(err, result){
	        		this.set('waiting', false);
		        		if(!err){
		        				if(find){
		        					this.find(tp.getValue('findGroup'));
		        				} else {
		        					this.reloadList();
		        				}
		        		}
	        	}, this);
        },
        getId: function(e){
        	return e.target.getData('id');
        },
        find: function(val){
        	var lib = this.get('appInstance'),
        		data = {
            		value: val || 0,
            		type: 'Group',
            		frmstudy: lib.get('frmstudy')
            	};
        	
            	this.set('waiting', true);
            	lib.findGroup(data, function(err, result){
            		this.set('waiting', false);
            			if(!err){
            				this.set('groupList', result.findGroup)
            					this.renderList();
            			}
            	}, this);
        },
        setColorButton: function(ind){
        	var tp = this.template,
        		arr = ['o', 'ozo', 'z'];
        	
        	if(ind){
        		tp.addClass(arr[ind - 1], 'btn-primary');
        	} else {
            	arr.forEach(function(button){
            		tp.removeClass(button, 'btn-primary');
            	});
        	}
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,table,row,label,hrefNameProgram'},
            groupList: {value: null},
            countGroup: {value: 0}
        },
        CLICKS: {
            'remove-show': {
                event: function(e){
                	var groupid = this.getId(e);
                	
                	if(e.target.getData('act') === 'Восстановить'){
                		this.remove(this.getId(e), 0);
                	} else {
                		this.template.toggleView(true, 'row.removegroup-' + groupid, 'row.remove-' + groupid);
                	}
                }
            },
            'remove-cancel': {
                event: function(e){
                  	var groupid = this.getId(e);
                	this.template.toggleView(false, 'row.removegroup-' + groupid, 'row.remove-' + groupid);
                }
            },
        	edit: {
        		event: function(e){
        			this.go('group.editor', this.getId(e));
        		}
        	},
        	remove: {
        		event: function(e){
       				this.remove(this.getId(e), 1);
        		}
        	},
        	showGroupMenu: {
        		event: function(e){
        			var targ = e.target,
        				id = targ.getData('id'),
        				menu = targ.getData('groupMenu');
        			
        			this.go('group.editor', id, menu);
        		}
        	},
        	find: {
        		event: function(e){
        			var tp = this.template,
        				val = tp.getValue('findGroup'),
        				lib = this.get('appInstance');
        			
        			if(val.length > 0){
        				lib.set('findGroup', true);
            			lib.set('findGroupVal', val);
            			tp.show('allGroup');
            			
            			tp.hide('pagination');
            			
        				this.find(tp.getValue('findGroup'));
        			} else {
        				alert( 'Введите номер группы' );
        			}
        			
        		}
        	},
        	showAllGroup: {
        		event: function(e){
        			var tp = this.template,
        				lib = this.get('appInstance');
        			
        			tp.setValue('findGroup', '');
        			tp.hide('allGroup');
        			tp.show('pagination');
        			lib.set('findGroup', false);
        			lib.set('findGroupVal', '');
        				this.countGroup();
        		}
        	},
            showGroupList: {
        		event: function(e){
        			var tp = this.template,
        				targ = e.target,
        				val = targ.getData('value'),
        				button = targ.getDOMNode(),
        				lib = this.get('appInstance');
        			
        			if(!val){
        				return;
        			}
        				
        			lib.set('frmstudy', val);
        			lib.set('pageGroup', 1);
        			
        			this.setColorButton();
        			
        			button.classList.add('btn-primary');
        			tp.show('groupList');
        				
        			this.showGroupList();
        		}
        	},
        	showFieldItem: {
        		event: function(e){
        			var id = e.target.getData('id');
        			
        				this.go('field.editor', id);
        		}
        	}
        }
    });
};