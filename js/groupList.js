var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;
    
 
    NS.GroupListWidget = Y.Base.create('groupListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	var lib = this.get('appInstance'),
        		tp = this.template,
        		frmstudy = lib.get('frmstudy');

        	if(frmstudy){
        		this.setColorButton(frmstudy);
        		this.showGroupList();
        		tp.show('groupList');
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
	    				this.set('countGroup', result.countPaginator);
	    				this.reloadList();
	    		}, this);
        },
        reloadList: function(){
        	var lib = this.get('appInstance'),
        		data = {
        			page: lib.get('currentPageGroup'),
        			frmstudy: lib.get('frmstudy')
        		};
        		
        	this.set('waiting', true);
        	lib.groupList(data, function(err, result){
        		this.set('waiting', false);
        		if(!err){
        			if(result.groupList.size() === 0 && data.page !== 1){
        				lib.set('currentPageGroup', --data.page);
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
        		lst += tp.replace('row', [{
        			field:  group.get('fieldcode') + " " +  group.get('field') + " " + group.get('frmstudy'),
        			success: find ? 'success' : '',
        			label: group.get('remove') ? tp.replace('label') : "",
        			danger: group.get('grRemove') ? 'danger' : '',
        			remove: group.get('grRemove') ? 'Восстановить' : 'Удалить'
        		},group.toJSON()]);
        	});
        		tp.setHTML('list', tp.replace('table', {rows: lst}));
        		
        			if(find){
        				tp.setHTML('pag', '');
        			} else {
        				this.renderPaginator();
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
		        				if(!find){
		        					this.countGroup();	
		        				} else {
		        					this.find(tp.getValue('findGroup'));
		        				}
		        		}
	        	}, this);
        },
        getId: function(e){
        	return e.target.getData('id');
        },
        renderPaginator: function(){
        	var tp = this.template,
        		count = this.get('countGroup'),
        		limit = 15,
        		countPage = Math.ceil(count / limit),
        		page = this.get('appInstance').get('currentPageGroup'),
        		lst = "",
        		start = Math.max(1, page - 2),
        		end = Math.min(+page + 2, countPage);
        	
        	if(count > limit){
	        	for(var i = start; i <= end; i++){
	        		lst += tp.replace('liPagePagin', {
	        			cnt: i,
	        			active: i == page ? 'active' : ''
	        		});
	        	}
	        	tp.setHTML('pag', tp.replace('paginator', {
	        		lipage: lst,
	        		dp: page == 1 ? 'none' : '',
	        		dn: page == countPage ? 'none' : '',
	        		lastpage: countPage,
	        		firstpage: 1
	        	}));
        	} else {
        		tp.setHTML('pag', '');
        	}
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
        setColorButton: function(frmstudy){
        	var tp = this.template;
        		
			if(frmstudy === 'очная'){
				tp.addClass('ochForm', 'btn-primary');
				tp.removeClass('zaochForm', 'btn-primary');
			} else {
				tp.removeClass('ochForm', 'btn-primary');
				tp.addClass('zaochForm', 'btn-primary');
			}
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,table,row,paginator,liPagePagin,label'},
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
        	showListGroup: {
        		event: function(e){
        			this.go('group.editor', this.getId(e), 'groupList/');
        		}
        	},
        	showSheet: {
        		event: function(e){
        			var groupid = this.getId(e);
        			this.go('group.sheetEditor', groupid);
        		}
        	},
        	changePage: {
        		event: function(e){
                   	var page =  0,
            		type = e.target.getData('type'),
            		lib = this.get('appInstance');
        	
		        	switch(type){
		        		case 'prev': page = lib.get('currentPageGroup'); lib.set('currentPageGroup', --page); break;
		        		case 'next': page = lib.get('currentPageGroup'); lib.set('currentPageGroup', ++page); break;
		        		case 'curent': 
		        		case 'first': 
		        		case 'last': page = e.target.getData('page'); lib.set('currentPageGroup', page); break;
		        	}
        			this.reloadList();
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
        			lib.set('findGroup', false);
        			lib.set('findGroupVal', '');
        				this.countGroup();
        		}
        	},
            showGroupList: {
        		event: function(e){
        			var tp = this.template,
        				val = e.target.getData('value'),
        				lib = this.get('appInstance');
        				
        			if(val === 'ochForm'){
        				lib.set('frmstudy', 'очная');        				
        			} else {
        				lib.set('frmstudy', 'заочная');
        			}
        			
        			this.setColorButton(val === 'ochForm' ? 'очная' : 'заочная');
        			
        			tp.show('groupList');
        				
        			this.showGroupList();
        		}
        	},
        	showProgress: {
        		event: function(e){
        			var groupid = e.target.getData('id');
        			
        			this.go('group.progressView', groupid);
        		}
        	}
        }
    });
};