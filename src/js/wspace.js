var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js', 'reportList.js']}
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
    			obj = tp.idMap.widget;
    		
    		for(var i in obj){
				var li = 'widget.' + i;
					if(i == idLi){
						tp.addClass(li, 'active');
					} else {
						tp.removeClass(li, 'active');
					}
    		}
    	},
        destructor: function(){
            if (this.reportList){
                this.reportList.destroy();
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
        			var targ = e.target,
        				idManager = targ.getData('id'),
        				tp = this.template,
        				a = targ.getDOMNode();
        			
        			if(!a.href){
        				return;
        			}
        			
	        		switch(idManager){
	        			case "fieldsA" : 
	        				this.setActive('fieldsLi');
	        					this.go("fieldManager.view");
	        						break;
	        			case "groupsA": 
	        				this.setActive('groupsLi');
	        					this.go("managerGroups.view");
	        						break;
	        			case "configA":
	        				this.setActive('configLi');
	        					this.go("managerConfig.view");	
	        						break;
	        			case "expeledA":
	        				this.setActive('expeledLi');
	        					this.go("managerExpeled.view");
	        						break;
	        			case "departA":
	        				this.setActive('departLi');
	        					this.go("managerDepart.view");
	        						break;
	        		}
        		}
        	},
        	find: {
        		event: function(){
        	        var tp = this.template,
        	        	fval = tp.getValue('inpfind');
                    
        	        if(!this.reportList){
                    	this.reportList = new NS.ReportListWidget({
	                		srcNode: tp.gel('reportmodal')
	                	});
        	        }
        	        
        	        this.reportList.set('findValue', fval);
    				this.reportList.showReport();
        		}
        	}
        }
    });

    NS.ws = SYS.AppWorkspace.build('{C#MODNAME}', NS.WorkspaceWidget);

};
