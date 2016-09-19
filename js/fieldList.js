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
    
 
    NS.FieldListWidget = Y.Base.create('fieldListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	this.reloadList();
        },
        reloadList: function(){
        	this.set('waiting', true);
        	this.get('appInstance').fieldList('fieldList', function(err, result){
        		this.set('waiting', false);
        		this.set('fieldList', result.fieldList);
        			this.renderList();
        	}, this);
        	
        },
        renderList: function(){
        	var fieldList = this.get('fieldList'),
        		lst = "",
        		tp = this.template,
        		n = 0;
        	
        	fieldList.each(function(field){
        		var rem = field.get('remove'),
        			frmstudy = field.get('frmstudy') - 1,
        			arr = [{
		        			danger: '',
		        			remove: 'удалить',
		        			act: 'remove-show',
		        			n: ++n,
		        			frmstudy: this.get('appInstance').determFormEdu(frmstudy)
        			}, field.toJSON()];
        		
        		if(rem === 1){
            		arr[0].danger = 'class="danger"';
            		arr[0].remove = 'восстановить';
            		arr[0].act = 'restore';
        		} 
        		
    	 		lst += tp.replace('row', arr);
            }, this);
        		tp.setHTML('list', tp.replace('table', {rows: lst}));
        },
        remove: function(fieldid, restore){
        	
        	this.set('waiting', true);
	         	this.get('appInstance').fieldRemove(fieldid, restore, function(err, result){
	         		this.set('waiting', false);
	         			if(!err){
	         				this.reloadList();
	         			}
	         	}, this);
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget,table,row'},
            fieldList: {value: null}
        },
        CLICKS: {
            'remove-show': {
                event: function(e){
                    var fieldid = e.target.getData('id');
                    this.template.toggleView(true, 'row.removegroup-' + fieldid, 'row.remove-' + fieldid);
                }
            },
            'remove-cancel': {
                event: function(e){
                    var fieldid = e.target.getData('id');
                    this.template.toggleView(false, 'row.removegroup-' + fieldid, 'row.remove-' + fieldid);
                }
            },
        	edit: {
        		event: function(e){
        			var fieldid = e.target.getData('id') | 0;
        				this.go('field.editor', fieldid);
        		}
        	},
        	remove: {
        		event: function(e){
        			var fieldid = e.target.getData('id');
        			this.remove(fieldid, 1);
        		}
        	},
        	restore: {
        		event: function(e){
        			var fieldid = e.target.getData('id');
        			this.remove(fieldid, 0);
        		}
        	}
        }
    });
};