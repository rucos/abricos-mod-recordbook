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
	        		lst += tp.replace('departItem', depart.toJSON());
	        	});
	        	
	        	tp.setHTML('departList', tp.replace('departList', {
	        		lst: lst
	        	}));
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
        departSave: function(id){
        	var tp = this.template,
        		data = {
	        		id: id,
	        		namedepart: tp.getValue('addWidget.namedepart'),
	        		shortname: tp.getValue('addWidget.shortname')
	        	},
	        	lib = this.get('appInstance'),
	        	empty = lib.isEmptyInput(data);
        	
        	if(empty){
        		switch(empty){
        			case 'namedepart': alert( 'Укажите полное наименование' ); break;
        			case 'shortname': alert( 'Укажите краткое наименование' ); break;
        		}
        		tp.gel('addWidget.' + empty).focus();
        		
        		return;
        	} 
	        	this.set('waiting', true);
	        		lib.departSave(data, function(err, result){
		        		this.set('waiting', false);
			        		if(!err){
			        			this.reloadList();
			        		}
		        	}, this);
        },
        cancelAddWidget: function(id){
        	var tp = this.template,
        		repobj = this.get('departItem').toJSON(),
        		element = tp.one('departItem.item-' + id).getDOMNode(); 
        	
        		element.outerHTML = tp.replace('departItem', repobj);
    				this.set('departItem', null);
        },
        destructor: function(){
            if (this.listWidget){
                this.listWidget.destroy();
            }
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,departList,departItem,addWidget'},
            departList: {value: null},
            departItem: {value: null}
        },
        CLICKS: {
        	'add-show': {
        		event: function(){
        			this.renderItem();
        		}
        	},
        	save: {
        		event: function(e){
        			var id = e.target.getData('id');

        				this.departSave(id);
        		}
        	},
        	'edit-show': {
        		event: function(e){
        			var id = e.target.getData('id');
        					
        			this.loadItem(id);
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
        	choiceDepart: {
        		event: function(e){
        			
        		}
        	}
        
        }
    });
};