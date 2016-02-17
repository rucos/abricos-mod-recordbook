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

    NS.WorkspaceWidget = Y.Base.create('workspaceWidget', SYS.AppWidget, [
        SYS.AppWorkspace
    ], {
    	setActive: function(idLi){
    		var tp = this.template,
    			arr = ['fieldsLi', 'groupsLi', 'configLi'];
    		
    			for(var i = 0; i < 3; i++){
    				var li = 'widget.' + arr[i];
	    				if(arr[i] == idLi){
	    					tp.addClass(li, 'active');
	    				} else {
	    					tp.removeClass(li, 'active');
	    				}
    			}
    	}
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
            defaultPage: {
            	 value: {
                     component: 'managerGroups',
                     widget: 'ManagerWidgetGroups'
                 }
            }
        },
        CLICKS: {
        	changeActive: {
        		event: function(e){
        			var idManager = e.target.getData('id'),
        				tp = this.template;
        			
	        		switch(idManager){
	        			case "fieldsA" : 
	        				this.setActive('fieldsLi');
	        					this.go("manager.view");
	        						break;
	        			case "groupsA": 
	        				this.setActive('groupsLi');
	        					this.go("managerGroups.view");
	        						break;
	        			case "configA":
	        				this.setActive('configLi');
	        					this.go("managerConfig.view");	
	        						break;
	        		}
        		}
        	}
        }
    });

    NS.ws = SYS.AppWorkspace.build('{C#MODNAME}', NS.WorkspaceWidget);

};
