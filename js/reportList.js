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
    
 
    NS.ReportListWidget = Y.Base.create('reportListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	
        },
        reqFind: function(){
        	var tp = this.template,
        		value = tp.getValue('inpfind').trim();
        	
        	if(!value){
        		alert( 'Введите ФИО студента или № зачетной книжки' );
        		
        			tp.setValue('inpfind', '');
        			tp.gel('inpfind').focus();
        	} else {
        		this.get('appInstance').findStudReport(value, function(err, result){
        			var res = result.findStudReport;
        			
	        			if(!err && res.get('id')){
	        				this.set('groupItem', result.findStudReport);
	        					this.renderGroupItem();
	        			} else {
	        				tp.setHTML('groupRenderItem', '');
	        			}
        		}, this);
        	}
        },
        renderGroupItem: function(){
        	var tp = this.template,
        		groupItem = this.get('groupItem');
        	
        		tp.setHTML('groupRenderItem', tp.replace('groupItem', [groupItem.toJSON()]));
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, groupItem'},
            groupItem: {value: null}
        },
        CLICKS: {
        	find: {
        		event: function(e){
        			this.reqFind();
        		}
        	}
        }
    });
};