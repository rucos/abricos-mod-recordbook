var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['editor.js']},
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.ProgressViewWidget = Y.Base.create('progressViewWidget', SYS.AppWidget, [], {
        buildTData: function(){
        	
        },
        onInitAppWidget: function(err, appInstance){
        	
        },
        destructor: function(){
        	
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            groupid: {value: 0}
        },
        CLICKS: {
        	close:{
        		event: function(){
        			this.go('managerGroups.view');
        		}
        	}
        }
    });

    NS.ProgressViewWidget.parseURLParam = function(args){
        return {
        	groupid: args[0]
        };
    };
};