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
    
    NS.ExpeledGruopListWidget = Y.Base.create('expeledGruopListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	this.reloadList();
        },
        reloadList: function(){
        	
        	this.set('waiting', true);
        		this.get('appInstance').expeledGroupList(function(err, result){
        			this.set('waiting', false);
    				if(!err){
    					this.set('groupList', result.expeledGroupList);
    					this.renderList();
    				}
        		}, this);
        },
        renderList: function(){
        	var groupList = this.get('groupList'),
        		tp = this.template,
        		lst = "";
        	
        	groupList.each(function(group){
        		lst += tp.replace('liSubject', [group.toJSON()]);
        	}, this);
        	tp.setHTML('list', tp.replace('ulSubject', { li:lst }));
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, ulSubject, liSubject'},
            groupList: {value: null}
        }
    });
};