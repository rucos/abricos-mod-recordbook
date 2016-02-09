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
    ], {}, {
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
        			
        			if(idManager == 'fieldsA'){
        				tp.removeClass('widget.groupsLi', 'active');
        				tp.addClass('widget.fieldsLi', 'active');
        					this.go("manager.view");
        					
        			} else if(idManager == 'groupsA'){
        				tp.removeClass('widget.fieldsLi', 'active');
        				tp.addClass('widget.groupsLi', 'active');
        					this.go("managerGroups.view");
        			}
        		}
        	}
        }
    });

    NS.ws = SYS.AppWorkspace.build('{C#MODNAME}', NS.WorkspaceWidget);

};
