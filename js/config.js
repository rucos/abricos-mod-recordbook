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
    
 
    NS.ConfigWidget = Y.Base.create('configWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        	this.reloadList();
        },
        reloadList: function(){
         	this.set('waiting', true);
	     		this.get('appInstance').config(function(err, result){
	        		this.set('waiting', false);
	        			if(!err){
	        				this.set('config', result.config);
	        					this.renderList();
	        			}
	        	}, this);
        },
        renderList: function(){
        	var config = this.get('config'),
        		tp = this.template;
        	
        	tp.setHTML('list', tp.replace('config', [config.toJSON()]));
        },
        saveConfig: function(){
        	var tp = this.template,
        		data = {
        			fullname: tp.getValue('config.fullname'),
        			shortname: tp.getValue('config.shortname'),
        			manager: tp.getValue('config.manager')
        		};
         	this.set('waiting', true);
         		this.get('appInstance').configSave(data, function(err, result){
	        		this.set('waiting', false);
	        	}, this);
        }
    }, {
        ATTRS: {
        	component: {value: COMPONENT},
            templateBlockName: {value: 'widget, config'},
            config: {value: null}
        },
        CLICKS: {
        	save: {
        		event: function(){
        			this.saveConfig();
        		}
        	}
        }
    });
};