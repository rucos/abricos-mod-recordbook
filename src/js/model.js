var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['appModel.js']}
    ]
};
Component.entryPoint = function(NS){

	var Y = Brick.YUI,
        SYS = Brick.mod.sys;
    
    NS.FieldItem = Y.Base.create('fieldItem', SYS.AppModel, [], {
        structureName: 'FieldItem'
    });

    NS.FieldList = Y.Base.create('fieldList', SYS.AppModelList, [], {
        appItem: NS.FieldItem
    });
    
    NS.SubjectItem = Y.Base.create('subjectItem', SYS.AppModel, [], {
        structureName: 'SubjectItem'
    });

    NS.SubjectList = Y.Base.create('subjectList', SYS.AppModelList, [], {
        appItem: NS.SubjectItem
    });
    
    NS.GroupItem = Y.Base.create('groupItem', SYS.AppModel, [], {
        structureName: 'GroupItem'
    });

    NS.GroupList = Y.Base.create('groupList', SYS.AppModelList, [], {
        appItem: NS.GroupItem
    });
    
    NS.StudItem = Y.Base.create('studItem', SYS.AppModel, [], {
        structureName: 'StudItem'
    });
    
    NS.StudList = Y.Base.create('studList', SYS.AppModelList, [], {
        appItem: NS.StudItem
    });
    
    NS.SheetItem = Y.Base.create('sheetItem', SYS.AppModel, [], {
        structureName: 'SheetItem'
    });
    
    NS.SheetList = Y.Base.create('sheetList', SYS.AppModelList, [], {
        appItem: NS.SheetItem
    });
    
    NS.MarkItem = Y.Base.create('markItem', SYS.AppModel, [], {
        structureName: 'MarkItem'
    });
    
    NS.MarkList = Y.Base.create('markList', SYS.AppModelList, [], {
        appItem: NS.MarkItem
    });
    
    NS.MarkItemStat = Y.Base.create('markItemStat', SYS.AppModel, [], {
        structureName: 'MarkItemStat'
    });
    
    NS.MarkListStat = Y.Base.create('markListStat', SYS.AppModelList, [], {
        appItem: NS.MarkItemStat
    });
    
    NS.GroupModalItem = Y.Base.create('groupModalItem', SYS.AppModel, [], {
        structureName: 'GroupModalItem'
    });

    NS.GroupModalList = Y.Base.create('groupModalList', SYS.AppModelList, [], {
        appItem: NS.GroupModalItem
    });
    
    NS.ReportItem = Y.Base.create('reportItem', SYS.AppModel, [], {
        structureName: 'ReportItem'
    });
    
    NS.ProgramItem = Y.Base.create('programItem', SYS.AppModel, [], {
        structureName: 'ProgramItem'
    });

    NS.ProgramList = Y.Base.create('programList', SYS.AppModelList, [], {
        appItem: NS.ProgramItem
    });
    
    NS.DepartItem = Y.Base.create('departItem', SYS.AppModel, [], {
        structureName: 'DepartItem'
    });

    NS.DepartList = Y.Base.create('departList', SYS.AppModelList, [], {
        appItem: NS.DepartItem
    });
    
    NS.TeacherItem = Y.Base.create('teacherItem', SYS.AppModel, [], {
        structureName: 'TeacherItem'
    });

    NS.TeacherList = Y.Base.create('teacherList', SYS.AppModelList, [], {
        appItem: NS.TeacherItem
    });
    
};
