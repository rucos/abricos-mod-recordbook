var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['expeledGroupList.js', 'lib.js', 'studList.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;
   
    
    NS.ManagerWidgetExpeled = Y.Base.create('managerWidgetExpeled', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance, options){
        	
            var tp = this.template;
            this.listWidget = new NS.ExpeledGruopListWidget({
                srcNode: tp.gel('group')
            });
	            this.listStud = new NS.StudListWidget({
	                srcNode: tp.gel('stud')
	            });
        },
        destructor: function(){
            if (this.listWidget){
                this.listWidget.destroy();
                this.listStud.destroy();
            }
        },
        renderStudWidget: function(groupId){
        	
        	var tp = this.template;
        	

        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'}
        },
        CLICKS: {
        	choiceGroup: {
        		event: function(e){
        			this.listStud.set('groupid', e.target.getData('id'));
        			this.listStud.reloadList();
        		}
        	}
        }
    });
};